<!-- eslint-disable no-continue -->
<!-- eslint-disable no-await-in-loop -->
<script setup lang="ts">
import {
  computed, nextTick, ref, watch,
} from 'vue';
import { requireInjection } from '@/utils';
import { IToastService, ITabsViewService, ITreeViewService } from '@/common/const';
import WButton from '@/components/button/index.vue';
import AiSettingsDialog from '@/layout/dialog/ai-settings';
import AiApplyPreviewDialog from '@/layout/dialog/ai-apply-preview';
import {
  aiChatOpen,
  aiChatHistory,
  aiIsLoading,
  aiLastError,
  hasApiKey,
  pushChatMessage,
  persistChatHistory,
  setAiChatOpen,
  clearChatHistory,
  aiSelectedEntities,
  aiUndoStack,
  aiRenameRequest,
  aiRenameState,
  clearAiRename,
  setAiRenameState,
  aiPermissionRules,
  addAiPermissionRule,
  setAiChatSummary,
  aiChatSummary,
  updateChatMessageContent,
  updateChatMessageMeta,
} from '@/services/ai/store';
import { deepseekChatCompletions, deepseekChatCompletionsStream, extractFirstJsonObject } from '@/services/deepseek';
import { flattenSelectedToFiles, readTextFileContent } from '@/services/ai/file-utils';
import { readFileNameAndAssociations, readSelectedFileInfo, readTextSnippet } from '@/services/ai/rename-tools';
import { globFiles, grepFiles } from '@/services/ai/search-tools';
import { Agents, SessionPrompt } from '@/ai';
import AiPermissionDialog from '@/layout/dialog/ai-permission';
import { DirTreeEntity, FileEntity } from '@/entity';
import type { FileTreeEntity } from '@/entity';

const toast = requireInjection(IToastService);
const tabsViewService = requireInjection(ITabsViewService);
const treeViewService = requireInjection(ITreeViewService);

const getRootDir = () => (treeViewService.value as any)?.getRoot?.();

const input = ref('');
const textareaRef = ref<HTMLTextAreaElement>();
const listRef = ref<HTMLDivElement>();
const agentMode = ref(false);
let agentAbort: AbortController | null = null;

type StagedEdit =
  | {
    kind: 'modify';
    path: string;
    key: string;
    name: string;
    handle: FileSystemFileHandle;
    before: string;
    after: string;
  }
  | {
    kind: 'create';
    path: string;
    // dialog 用的临时 key
    key: string;
    name: string;
    parentPath: string;
    fileName: string;
    before: string;
    after: string;
  };

const stagedEdits = ref<Map<string, StagedEdit>>(new Map());

const visible = computed(() => aiChatOpen.value);

const selectedFiles = computed(() => flattenSelectedToFiles(aiSelectedEntities.value as any));
const selectedSummary = computed(() => {
  const files = selectedFiles.value.length;
  const dirs = aiSelectedEntities.value
    .filter((e: any) => DirTreeEntity.isDirectory(e as any)).length;
  return { files, dirs };
});

function openSettings() {
  const dialog: AiSettingsDialog = new AiSettingsDialog({
    onCancel: () => dialog.close(),
    onConfirm: () => dialog.close(),
  });
  dialog.open();
}

const findFileByKeyInTree = (key: string) => {
  const root = getRootDir();
  if (!root || !key) return null;
  let found: FileTreeEntity | null = null;
  const walk = (node: any) => {
    if (!node || found) return;
    if (DirTreeEntity.isDirectory(node)) {
      (node.children || []).forEach((ch: any) => walk(ch));
      return;
    }
    if (node.key === key) found = node as FileTreeEntity;
  };
  walk(root);
  return found;
};

const renameTargetFile = computed<FileTreeEntity | null>(() => {
  const key = aiRenameState.value?.fileKey || aiRenameRequest.value?.fileKey;
  if (!key) return null;
  const inSelected = (selectedFiles.value as FileTreeEntity[]).find((f) => f.key === key);
  if (inSelected) return inSelected;
  return findFileByKeyInTree(key);
});

const renameTargetPath = computed(() => {
  const f = renameTargetFile.value;
  if (!f) return (aiRenameState.value?.fileKey || aiRenameRequest.value?.fileKey || '').toString();
  return (f.path || f.name || f.key).toString();
});

let activeRenameReqId = '';

const normalizeRenameName = (rawName: string, ext: string) => {
  let n = (rawName || '').trim();
  if (!n) return '';
  // 保证扩展名一致（如有）
  if (ext) {
    // 如果模型返回包含其他扩展名，统一替换为 ext
    const dot = n.lastIndexOf('.');
    const hasExt = dot > 0;
    if (!hasExt) {
      n = `${n}${ext}`;
    } else if (!n.endsWith(ext)) {
      n = `${n.slice(0, dot)}${ext}`;
    }
  }
  return n;
};

const runAiRenameAgent = async (reqId: string, fileKey: string) => {
  const file = renameTargetFile.value;
  if (!file || file.key !== fileKey) {
    setAiRenameState({
      id: reqId,
      ts: Date.now(),
      fileKey,
      status: 'error',
      suggestions: [],
      error: '未找到要重命名的文件（请重新选择后再试）',
    });
    return;
  }

  if (!hasApiKey.value) {
    setAiRenameState({
      id: reqId,
      ts: Date.now(),
      fileKey,
      status: 'error',
      suggestions: [],
      error: '请先在“AI 设置”里配置 DeepSeek API Key',
    });
    openSettings();
    return;
  }

  setAiRenameState({
    id: reqId,
    ts: Date.now(),
    fileKey,
    status: 'running',
    suggestions: [],
  });

  try {
    // 1) 工具：读取文件信息
    const fileInfo = await readSelectedFileInfo(file);
    // 2) 工具：读取文件名及关联信息
    const relations = readFileNameAndAssociations(file);
    // 额外：读取少量文本内容辅助语义命名（图片/二进制会返回空）
    let snippet = '';
    try {
      snippet = await readTextSnippet(file, 3500);
    } catch {
      snippet = '';
    }

    const ext = relations.extension || file.suffix || '';
    const existing = relations.siblingNames || [];

    const prompt = [
      '你是一个“文件重命名助手”。请基于我提供的文件信息，生成 3 个更清晰、更语义化的文件名建议。',
      '硬性要求：',
      `- 必须保持原始扩展名不变：${ext || '(无扩展名)'}`,
      '- 建议名必须是合法文件名：不能包含 / \\ : * ? " < > |',
      '- 不要使用过长名称（建议 8~40 字符之间）',
      '- 不要与同目录已有文件重名',
      '',
      '输出要求：',
      '- 只输出严格 JSON，不要 Markdown，不要解释。',
      '- JSON 格式：{"suggestions":[{"name":"...","reason":"..."}]}（suggestions 必须正好 3 个）',
      '',
      '【工具输出：文件信息】',
      JSON.stringify(fileInfo),
      '',
      '【工具输出：文件名与关联信息】',
      JSON.stringify(relations),
      '',
      '【文件内容片段（可能为空，仅供理解用途）】',
      snippet || '(空)',
      '',
      '【同目录已有文件名（避免冲突）】',
      JSON.stringify(existing),
    ].join('\n');

    const { content: reply } = await deepseekChatCompletions({
      messages: [
        { role: 'system', content: '你必须严格输出 JSON，且只输出 JSON。' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
    });

    const parsed = extractFirstJsonObject(reply) || {};
    const raw = (parsed as any).suggestions;
    const arr: Array<{ name: string; reason: string }> = Array.isArray(raw) ? raw : [];

    const used = new Set<string>([file.name, ...existing]);
    const suggestions: Array<{ name: string; reason: string }> = [];
    arr.forEach((item) => {
      if (suggestions.length >= 3) return;
      const name = normalizeRenameName(String(item?.name || ''), ext);
      const reason = String(item?.reason || '').trim();
      if (!name) return;
      if (/[/\\:*?"<>|]/.test(name)) return;
      if (used.has(name)) return;
      used.add(name);
      suggestions.push({ name, reason: reason || '更清晰的语义命名' });
    });

    // 兜底补足到 3 个
    const base = (relations.baseName || file.name).toString();
    const fallbackPool = [
      `${base}-refactor`,
      `${base}-v2`,
      `${base}-optimized`,
      `${base}-improved`,
    ];
    fallbackPool.forEach((fb) => {
      if (suggestions.length >= 3) return;
      const name = normalizeRenameName(fb, ext);
      if (!name || used.has(name) || /[/\\:*?"<>|]/.test(name)) return;
      used.add(name);
      suggestions.push({ name, reason: '兜底建议（可自行修改）' });
    });

    if (activeRenameReqId !== reqId) return;
    setAiRenameState({
      id: reqId,
      ts: Date.now(),
      fileKey,
      status: 'ready',
      suggestions: suggestions.slice(0, 3),
    });
    pushChatMessage('assistant', `AI 重命名建议已生成：${renameTargetPath.value}`);
  } catch (e: any) {
    if (activeRenameReqId !== reqId) return;
    setAiRenameState({
      id: reqId,
      ts: Date.now(),
      fileKey,
      status: 'error',
      suggestions: [],
      error: e?.message || 'AI 重命名失败',
    });
  }
};

watch(() => aiRenameRequest.value?.id, async (id) => {
  if (!id) return;
  const req = aiRenameRequest.value;
  if (!req) return;
  activeRenameReqId = req.id;
  // 确保面板打开
  setAiChatOpen(true);
  await runAiRenameAgent(req.id, req.fileKey);
});

const applyRenameSuggestion = async (name: string) => {
  const state = aiRenameState.value;
  const file = renameTargetFile.value;
  if (!state) return;
  if (!file) {
    toast.error('未找到要重命名的文件');
    return;
  }
  if (state.status === 'running' || state.status === 'applying') return;

  setAiRenameState({
    ...state,
    status: 'applying',
  });
  try {
    await file.rename(name);
    (treeViewService.value as any)?.refresh?.();
    toast.success(`已重命名为「${name}」`);
    clearAiRename();
  } catch (e: any) {
    setAiRenameState({
      ...state,
      status: 'error',
      error: e?.message || '重命名失败',
    });
    toast.error(e?.message || '重命名失败');
  }
};

const scrollToBottom = async () => {
  await nextTick();
  if (listRef.value) {
    listRef.value.scrollTop = listRef.value.scrollHeight;
  }
};

watch(() => aiChatHistory.value.length, scrollToBottom);
watch(() => visible.value, (v) => { if (v) scrollToBottom(); });

const handleClear = () => {
  clearChatHistory();
  setAiChatSummary('');
  toast.success('已清空对话记录');
};

type MentionFileRef = {
  // 相对路径（不包含 root 文件夹名），例如 src/app.vue
  path: string;
  // willow 内部 key（通常包含 root 文件夹名）
  key: string;
  name: string;
  handle: FileSystemFileHandle;
  source: 'tab' | 'tree';
};

const mentionOpen = ref(false);
const mentionQuery = ref('');
const mentionStartAt = ref<number>(-1);
const mentionActiveIdx = ref(0);
const mentionAllFiles = ref<MentionFileRef[]>([]);

const closeMention = () => {
  mentionOpen.value = false;
  mentionQuery.value = '';
  mentionStartAt.value = -1;
  mentionActiveIdx.value = 0;
};

const collectFiles = (node: any, out: MentionFileRef[]) => {
  if (!node) return;
  if (DirTreeEntity.isDirectory(node)) {
    (node.children || []).forEach((ch: any) => collectFiles(ch, out));
    return;
  }
  const f = node as FileTreeEntity;
  out.push({
    path: (f.path || f.name) as string,
    key: f.key,
    name: f.name,
    handle: f.handle,
    source: 'tree',
  });
};

const toRelPath = (fileKey: string, rootKey?: string) => {
  if (rootKey && fileKey.startsWith(`${rootKey}/`)) {
    return fileKey.slice(rootKey.length + 1);
  }
  // fallback：/RootName/xxx -> xxx
  if (fileKey.startsWith('/')) {
    const idx = fileKey.indexOf('/', 1);
    if (idx !== -1) return fileKey.slice(idx + 1);
  }
  return fileKey;
};

const refreshMentionFiles = () => {
  const root = getRootDir();
  const rootKey = root?.key as string | undefined;

  const seen = new Map<string, MentionFileRef>();

  // 1) 打开的文件（优先）
  const openFiles = (tabsViewService.value as any)?.getOpenFiles?.() || [];
  openFiles.forEach((f: any) => {
    if (!f?.key || !f?.handle) return;
    const path = toRelPath(String(f.key), rootKey);
    if (!path) return;
    seen.set(path, {
      path,
      key: String(f.key),
      name: String(f.name || path.split('/').pop() || path),
      handle: f.handle,
      source: 'tab',
    });
  });

  // 2) 全量文件树
  const all: MentionFileRef[] = [];
  collectFiles(root, all);
  all.forEach((f) => {
    if (!seen.has(f.path)) seen.set(f.path, f);
  });

  // 排序：tab 优先，其次按 path
  mentionAllFiles.value = Array.from(seen.values()).sort((a, b) => {
    if (a.source !== b.source) return a.source === 'tab' ? -1 : 1;
    return a.path.localeCompare(b.path);
  });
};

const mentionCandidates = computed(() => {
  const q = mentionQuery.value.trim().toLowerCase();
  const all = mentionAllFiles.value;
  const filtered = q
    ? all.filter((f) => f.path.toLowerCase().includes(q) || f.name.toLowerCase().includes(q))
    : all;
  return filtered.slice(0, 50);
});

const updateMentionStateFromCursor = () => {
  const el = textareaRef.value;
  if (!el) return closeMention();
  const cursor = el.selectionStart ?? input.value.length;
  const before = input.value.slice(0, cursor);
  const at = before.lastIndexOf('@');
  if (at === -1) return closeMention();
  const query = before.slice(at + 1);
  // query 内包含空白/换行就认为不是 @ 文件选择模式
  if (/[\s]/.test(query)) return closeMention();

  // 打开/更新
  if (!mentionOpen.value) refreshMentionFiles();
  mentionOpen.value = true;
  mentionStartAt.value = at;
  mentionQuery.value = query;
  // query 变化时把高亮重置到第一项
  mentionActiveIdx.value = 0;
};

const applyMention = async (item: MentionFileRef) => {
  const el = textareaRef.value;
  if (!el) return;
  const cursor = el.selectionStart ?? input.value.length;
  const start = mentionStartAt.value;
  if (start < 0 || start > cursor) return;
  const before = input.value.slice(0, start);
  const after = input.value.slice(cursor);
  const insert = `@${item.path} `;
  input.value = `${before}${insert}${after}`;
  closeMention();
  await nextTick();
  el.focus();
  const pos = before.length + insert.length;
  el.setSelectionRange(pos, pos);
};

const extractMentionPaths = (raw: string) => {
  const found: string[] = [];
  const re = /@([^\s]+)/g;
  let m: RegExpExecArray | null;
  // eslint-disable-next-line no-cond-assign
  while ((m = re.exec(raw))) {
    const p = (m[1] || '').trim();
    if (p) found.push(p);
  }
  return Array.from(new Set(found));
};

const buildMentionFileMap = () => {
  const map = new Map<string, MentionFileRef>();
  mentionAllFiles.value.forEach((f) => map.set(f.path, f));
  return map;
};

const buildMessages = (
  overrideLastUser?: { id: string; content: string },
  options?: { excludeIDs?: string[] },
) => {
  // 只发送最近 N 条，避免过长
  const MAX = 20;
  const exclude = new Set<string>((options?.excludeIDs || []).map((x) => String(x)));
  const recent = aiChatHistory.value
    .filter((m) => !exclude.has(m.id))
    .slice(-MAX);
  return [
    {
      role: 'system' as const,
      content: '你是一个严谨的编程助手。回答要简洁、可执行，必要时给出明确步骤。',
    },
    ...recent.map((m) => ({
      role: m.role,
      content: (overrideLastUser && m.id === overrideLastUser.id)
        ? overrideLastUser.content
        : m.content,
    })),
  ];
};

const normalizeUserPath = (raw: string) => (raw || '')
  .trim()
  .replace(/\\/g, '/')
  .replace(/^\.\/+/, '')
  .replace(/^\/+/, '')
  .replace(/\/+$/, '');

const findNodeByPathInTree = (rawPath: string) => {
  const root = getRootDir();
  if (!root) return null;
  const p = normalizeUserPath(rawPath);
  if (!p) return root;
  let found: any = null;
  const walk = (node: any) => {
    if (!node || found) return;
    if ((node.path || '') === p) {
      found = node;
      return;
    }
    if (DirTreeEntity.isDirectory(node)) {
      (node.children || []).forEach((ch: any) => walk(ch));
    }
  };
  walk(root);
  return found;
};

const applyAiEdits = async (files: Array<{
  key: string;
  name: string;
  handle: FileSystemFileHandle;
  before: string;
  after: string;
}>) => {
  // 应用写入 + 入栈撤销
  const opId = `op_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const op = {
    id: opId,
    ts: Date.now(),
    files: files.map((f) => ({
      key: f.key,
      name: f.name,
      handle: f.handle,
      before: f.before,
      after: f.after,
    })),
  };
  await Promise.all(files.map(async (f) => {
    const handled = await (tabsViewService.value as any).applyExternalUpdate?.(
      f.key,
      f.after,
    );
    if (handled) return;
    const fe = new FileEntity(f.key, f.name, f.handle);
    await fe.write(f.after);
  }));

  // 新建文件/目录结构变更后，刷新左侧文件树，确保立即可见
  try { (treeViewService.value as any)?.refresh?.(); } catch { /* ignore */ }

  aiUndoStack.value.push(op);
};

const clearStagedEdits = () => {
  stagedEdits.value = new Map();
};

const openUnifiedApplyDialog = async () => {
  const items = Array.from(stagedEdits.value.values());
  if (!items.length) return;

  const dialog: AiApplyPreviewDialog = new AiApplyPreviewDialog({
    files: items.map((f) => ({
      key: f.key,
      path: f.path,
      name: f.name,
      before: f.before,
      after: f.after,
    })),
    onCancel: () => {
      clearStagedEdits();
      dialog.close();
      toast.info('已取消本次 AI 修改（未写入任何文件）');
    },
    onConfirm: async () => {
      // 统一应用：先处理新建文件，再写入内容
      const toApply: Array<{
        key: string;
        name: string;
        handle: FileSystemFileHandle;
        before: string;
        after: string;
      }> = [];

      // eslint-disable-next-line no-restricted-syntax
      for (const it of items) {
        if (it.kind === 'modify') {
          toApply.push({
            key: it.key,
            name: it.name,
            handle: it.handle,
            before: it.before,
            after: it.after,
          });
          // eslint-disable-next-line no-continue
          continue;
        }

        // create：此时才真正创建文件
        const parentNode = findNodeByPathInTree(it.parentPath);
        if (!parentNode || !DirTreeEntity.isDirectory(parentNode)) {
          throw new Error(`未找到父目录：${it.parentPath || '(root)'}`);
        }
        // eslint-disable-next-line no-await-in-loop
        const fileNode = await (parentNode as DirTreeEntity).createFile(it.fileName) as any;
        toApply.push({
          key: fileNode.key,
          name: fileNode.name,
          handle: fileNode.handle,
          before: it.before,
          after: it.after,
        });
      }

      await applyAiEdits(toApply);
      toast.success(`已应用 AI 修改：${toApply.length} 个文件`);
      clearStagedEdits();
      dialog.close();
    },
  });
  dialog.open();
};

const toolListDirectory = async (args: any) => {
  const node = findNodeByPathInTree(args?.path || '');
  if (!node) throw new Error(`未找到路径：${args?.path || '(root)'}`);
  if (!DirTreeEntity.isDirectory(node)) throw new Error(`不是目录：${args?.path}`);
  const dir = node as any;
  const entries = (dir.children || []).map((ch: any) => ({
    kind: DirTreeEntity.isDirectory(ch) ? 'directory' : 'file',
    name: ch.name,
    path: (ch.path || '').toString(),
  }));
  return {
    ok: true,
    path: normalizeUserPath(args?.path || ''),
    entries,
  };
};

const toolReadFile = async (args: any) => {
  const path = normalizeUserPath(args?.path || '');
  if (!path) throw new Error('path 不能为空');
  const node = findNodeByPathInTree(path);
  if (!node) throw new Error(`未找到文件：${path}`);
  if (DirTreeEntity.isDirectory(node)) throw new Error(`不是文件：${path}`);
  const fileNode = node as FileTreeEntity;
  const { fileEntity, content } = await readTextFileContent(fileNode);
  if (fileEntity.type === 'image') {
    return {
      ok: false,
      path,
      type: 'image',
      message: '目标是图片/二进制文件，read_file 仅支持文本内容。',
    };
  }
  const maxChars = Number.isFinite(args?.maxChars)
    ? Math.max(200, Math.floor(args.maxChars))
    : 8000;
  const text = (content ?? '').toString();
  const truncated = text.length > maxChars;
  return {
    ok: true,
    path,
    truncated,
    content: truncated ? `${text.slice(0, maxChars)}\n\n// ...已截断` : text,
  };
};

const toolWriteFile = async (args: any) => {
  const path = normalizeUserPath(args?.path || '');
  if (!path) throw new Error('path 不能为空');
  const node = findNodeByPathInTree(path);
  const after = (args?.newContent ?? '').toString();

  if (!node) {
    const lastSlash = path.lastIndexOf('/');
    const parentPath = lastSlash >= 0 ? path.slice(0, lastSlash) : '';
    const fileName = lastSlash >= 0 ? path.slice(lastSlash + 1) : path;
    if (!fileName) throw new Error(`非法路径：${path}`);

    const parentNode = findNodeByPathInTree(parentPath);
    if (!parentNode) throw new Error(`未找到父目录：${parentPath || '(root)'}`);
    if (!DirTreeEntity.isDirectory(parentNode)) throw new Error(`父路径不是目录：${parentPath}`);
    // 不立即创建，先暂存；统一确认后再创建+写入
    const existed = stagedEdits.value.get(path);
    const before = existed ? existed.before : '';
    stagedEdits.value.set(path, {
      kind: 'create',
      path,
      key: `__new__:${path}`,
      name: fileName,
      parentPath,
      fileName,
      before,
      after,
    });
    return {
      ok: true,
      path,
      created: true,
      changed: before !== after,
      status: 'staged',
      note: '已暂存：将于本轮任务结束后统一预览并由用户确认应用',
    };
  }

  if (DirTreeEntity.isDirectory(node)) throw new Error(`不是文件：${path}`);
  const fileNode = node as FileTreeEntity;
  const existed = stagedEdits.value.get(path);
  let before = existed ? existed.before : '';
  if (!existed) {
    const { fileEntity, content: loadedBefore } = await readTextFileContent(fileNode);
    if (fileEntity.type === 'image') {
      return {
        ok: false,
        path,
        type: 'image',
        message: '目标是图片/二进制文件，write_file 仅支持文本文件。',
      };
    }
    before = (loadedBefore ?? '').toString();
  }

  stagedEdits.value.set(path, {
    kind: 'modify',
    path,
    key: fileNode.key,
    name: fileNode.name,
    handle: fileNode.handle,
    before,
    after,
  });

  return {
    ok: true,
    path,
    created: false,
    changed: before !== after,
    status: 'staged',
    note: '已暂存：将于本轮任务结束后统一预览并由用户确认应用',
  };

  /*
  if (fileEntity.type === 'image') {
    return {
      ok: false,
      path,
      type: 'image',
      message: '目标是图片/二进制文件，write_file 仅支持文本文件。',
    };
  }

  const after = (args?.newContent ?? '').toString();
  const previewFiles = [{
    key: fileNode.key,
    path,
    name: fileNode.name,
    before: (before ?? '').toString(),
    after,
    handle: fileNode.handle,
  }];

  const dialog: AiApplyPreviewDialog = new AiApplyPreviewDialog({
    files: previewFiles.map((f) => ({
      key: f.key,
      path: f.path,
      name: f.name,
      before: f.before,
      after: f.after,
    })),
    onCancel: () => dialog.close(),
    onConfirm: async () => {
      await applyAiEdits(previewFiles.map((f) => ({
        key: f.key,
        name: f.name,
        handle: f.handle,
        before: f.before,
        after: f.after,
      })));
      toast.success('已应用 AI 修改：1 个文件');
      dialog.close();
    },
  });
  dialog.open();

  return {
    ok: true,
    path,
    changed: previewFiles[0].before !== previewFiles[0].after,
    status: 'preview_opened',
  };
  */
};

const sendAgent = async () => {
  if (aiIsLoading.value) return;
  const content = input.value.trim();
  if (!content) return;

  closeMention();

  if (!hasApiKey.value) {
    toast.info('请先在“AI 设置”里配置 DeepSeek API Key');
    openSettings();
    return;
  }

  aiLastError.value = '';
  pushChatMessage('user', content);
  input.value = '';

  aiIsLoading.value = true;
  agentAbort = new AbortController();
  let assistantMsg: any | null = null;
  try {
    // 注意：先构造要发送给模型的历史消息，再插入 UI 的 assistant 占位消息
    // 否则会导致 messages 里出现连续 assistant（DeepSeek 会直接 400）
    const runtimeMessages: any[] = buildMessages();
    assistantMsg = pushChatMessage('assistant', '（工具模式执行中…）');
    clearStagedEdits();
    const agent = Agents.build();
    // 合并用户持久化的权限规则（追加到末尾，保证覆盖默认）
    if (Array.isArray(aiPermissionRules.value) && aiPermissionRules.value.length) {
      agent.permission = [...agent.permission, ...aiPermissionRules.value as any];
    }
    // write_file 只暂存：不再弹“权限确认”
    agent.permission.push({ permission: 'write_file', pattern: '*', action: 'allow' } as any);

    const host = {
      listDirectory: (args: any) => toolListDirectory(args),
      readFile: (args: any) => toolReadFile(args),
      writeFile: (args: any) => toolWriteFile(args),
      glob: async (args: any) => {
        const root = getRootDir();
        if (!root) return { ok: false, error: '未打开任何项目目录' };
        return globFiles(root, String(args?.pattern || ''), Number.isFinite(args?.limit) ? args.limit : undefined);
      },
      grep: async (args: any) => {
        const root = getRootDir();
        if (!root) return { ok: false, error: '未打开任何项目目录' };
        return grepFiles(root, {
          query: String(args?.query || ''),
          filePattern: args?.filePattern ? String(args.filePattern) : undefined,
          limit: args?.limit,
          maxFileSize: args?.maxFileSize,
        });
      },
      undo: async (args: any) => {
        const count = Number.isFinite(args?.count) ? Math.max(1, Math.floor(args.count)) : 1;
        for (let i = 0; i < count; i += 1) {
          const op = aiUndoStack.value.pop();
          if (!op) break;
          // 复用现有撤销逻辑（但不走 UI toast）
          // eslint-disable-next-line no-await-in-loop
          await Promise.all(op.files.map(async (f) => {
            const handled = await (tabsViewService.value as any).applyExternalUpdate?.(
              f.key,
              f.before,
            );
            if (handled) return;
            const fe = new FileEntity(f.key, f.name, f.handle);
            await fe.write(f.before);
          }));
        }
        return { ok: true, undone: count };
      },
    };

    const { text, summary } = await SessionPrompt.prompt({
      agent,
      host,
      messages: runtimeMessages as any,
      model: 'deepseek-reasoner',
      temperature: 0.2,
      maxSteps: 20,
      abort: agentAbort.signal,
      onEvent: (evt) => {
        if (!assistantMsg) return;
        if (evt.type === 'tool-call') {
          updateChatMessageMeta(assistantMsg.id, (meta) => {
            const next = meta || {};
            const tools = (next.tools || []).slice();
            tools.push({
              callID: evt.callID,
              tool: String(evt.tool || ''),
              pattern: String(evt.pattern || ''),
              status: 'running',
              startedAt: Date.now(),
            });
            return { ...next, tools };
          });
          return;
        }
        if (evt.type === 'tool-result') {
          updateChatMessageMeta(assistantMsg.id, (meta) => {
            const next = meta || {};
            const tools = (next.tools || []).slice();
            const idx = tools.findIndex((t) => t.callID && t.callID === evt.callID);
            const ok = !!evt.result && !String(evt.result?.metadata?.error || '').trim();
            const status: any = ok ? 'completed' : 'error';
            const error = ok ? '' : String(evt.result?.metadata?.error || evt.result?.output || 'tool failed');
            const item = {
              callID: evt.callID,
              tool: String(evt.tool || ''),
              pattern: String(evt.pattern || ''),
              status,
              startedAt: idx >= 0 ? tools[idx].startedAt : undefined,
              completedAt: Date.now(),
              error: error ? error.slice(0, 300) : undefined,
            };
            if (idx >= 0) tools[idx] = item;
            else tools.push(item);
            return { ...next, tools };
          });
        }
      },
      askPermission: async (payload) => new Promise<'allow' | 'deny'>((resolve, reject) => {
        // write_file 已强制 allow，不应走到这里；兜底直接允许
        if (payload.permission === 'write_file') {
          resolve('allow');
          return;
        }
        const dialog: AiPermissionDialog = new AiPermissionDialog({
          title: 'AI 权限请求',
          permission: payload.permission,
          pattern: payload.pattern,
          onCancel: () => {
            dialog.close();
            reject(new Error('用户取消了权限请求'));
          },
          onAllow: (remember) => {
            if (remember) {
              const rule = { permission: payload.permission, pattern: payload.pattern, action: 'allow' } as any;
              addAiPermissionRule(rule);
              // 立刻注入到本次 agent 里，避免同一轮请求反复弹窗
              agent.permission.push(rule);
            }
            dialog.close();
            resolve('allow');
          },
          onDeny: (remember) => {
            if (remember) {
              const rule = { permission: payload.permission, pattern: payload.pattern, action: 'deny' } as any;
              addAiPermissionRule(rule);
              agent.permission.push(rule);
            }
            dialog.close();
            resolve('deny');
          },
        });
        dialog.open();
      }),
    });
    if (summary) setAiChatSummary(summary);
    if (assistantMsg) {
      const extra = stagedEdits.value.size
        ? `\n\n（已生成 ${stagedEdits.value.size} 个文件修改，等待你确认应用）`
        : '';
      updateChatMessageContent(assistantMsg.id, `${(text || '(空响应)').toString()}${extra}`);
    }
    persistChatHistory();
    await scrollToBottom();

    // 统一弹窗确认（仅当存在暂存修改）
    if (stagedEdits.value.size) {
      await openUnifiedApplyDialog();
    }
  } catch (e: any) {
    const msg = e?.message || '发送失败';
    aiLastError.value = msg;
    if (assistantMsg) updateChatMessageContent(assistantMsg.id, `（失败）${msg}`);
    toast.error(msg);
  } finally {
    agentAbort = null;
    aiIsLoading.value = false;
  }
};

const cancelAgent = () => {
  if (!aiIsLoading.value) return;
  agentAbort?.abort();
};

const send = async () => {
  if (aiIsLoading.value) return;
  const content = input.value.trim();
  if (!content) return;

  closeMention();

  if (!hasApiKey.value) {
    toast.info('请先在“AI 设置”里配置 DeepSeek API Key');
    openSettings();
    return;
  }

  aiLastError.value = '';
  const userMsg = pushChatMessage('user', content);
  input.value = '';

  aiIsLoading.value = true;
  let stopTyping: (() => void) | null = null;
  try {
    const assistantMsg = pushChatMessage('assistant', '');
    const ac = new AbortController();
    let lastPersist = 0;
    let lastScroll = 0;
    // 打字机效果：把服务端 delta 再拆成小段，避免“整段一次性出现”
    let streamedText = '';
    let typingQueue = '';
    let typingTimer: ReturnType<typeof setInterval> | null = null;
    stopTyping = () => {
      if (typingTimer) {
        clearInterval(typingTimer);
        typingTimer = null;
      }
    };
    const startTyping = () => {
      if (typingTimer) return;
      typingTimer = setInterval(() => {
        if (!typingQueue) {
          stopTyping?.();
          return;
        }
        const backlog = typingQueue.length;
        // backlog 越大，单次取的越多，避免积压太久
        const step = Math.min(backlog, Math.max(2, Math.min(40, Math.floor(backlog / 30) + 4)));
        assistantMsg.content += typingQueue.slice(0, step);
        typingQueue = typingQueue.slice(step);

        // 轻量节流：避免每次都写 localStorage / 触发滚动
        const now = Date.now();
        if (now - lastPersist > 250) {
          persistChatHistory();
          lastPersist = now;
        }
        if (now - lastScroll > 120) {
          // 不 await，避免 interval 被阻塞
          scrollToBottom();
          lastScroll = now;
        }
      }, 16);
    };

    // 把 @ 引用的文件内容拼到“本次请求”的最后一条 user 消息里（UI 仍显示原始输入）
    let override: { id: string; content: string } | undefined;
    try {
      refreshMentionFiles();
      const mentionedPaths = extractMentionPaths(content);
      if (mentionedPaths.length) {
        const fileMap = buildMentionFileMap();
        const MAX_FILES = 8;
        const MAX_FILE_CHARS = 8000;
        const MAX_TOTAL_CHARS = 20000;
        let total = 0;
        const files: Array<{ path: string; content: string }> = [];

        const pick = mentionedPaths.slice(0, MAX_FILES);
        const readResults = await Promise.all(pick.map(async (p) => {
          const refFile = fileMap.get(p);
          if (!refFile) return null;
          const fe = new FileEntity(refFile.key, refFile.name, refFile.handle);
          if ((fe as any).type === 'image') return null;
          const rawText = await fe.fetchContent();
          return { path: refFile.path, text: (rawText || '').toString() };
        }));

        readResults.filter(Boolean).forEach((r: any) => {
          const { path, text: raw } = r;
          let text = raw;
          if (text.length > MAX_FILE_CHARS) {
            text = `${text.slice(0, MAX_FILE_CHARS)}\n\n// ...已截断（仅发送前 ${MAX_FILE_CHARS} 字符）`;
          }
          if (total + text.length <= MAX_TOTAL_CHARS) {
            total += text.length;
            files.push({ path, content: text });
          }
        });

        if (files.length) {
          const extra = [
            '',
            '【已引用文件】',
            '以下文件内容仅用于提供上下文；除非我明确要求，否则不要擅自修改这些文件。',
            JSON.stringify(files),
          ].join('\n');
          override = { id: userMsg.id, content: `${content}${extra}` };
        }
      }
    } catch {
      // 忽略 @ 解析/读取异常，不影响正常发送
    }

    const { content: reply } = await deepseekChatCompletionsStream({
      // 关键：排除“正在流式输出的 assistant 占位消息”，否则最后一条会变成 assistant，DeepSeek 会 400
      messages: buildMessages(override, { excludeIDs: [assistantMsg.id] }),
      signal: ac.signal,
      onDelta: (delta) => {
        streamedText += delta;
        typingQueue += delta;
        startTyping();
      },
    });

    // 收尾：停止打字机，确保最终内容完整一致
    stopTyping?.();
    assistantMsg.content = (reply || streamedText || assistantMsg.content || '(空响应)').toString();
    persistChatHistory();
    await scrollToBottom();
  } catch (e: any) {
    const msg = e?.message || '发送失败';
    aiLastError.value = msg;
    toast.error(msg);
  } finally {
    stopTyping?.();
    aiIsLoading.value = false;
  }
};

const sendDispatch = async () => {
  if (agentMode.value) {
    await sendAgent();
    return;
  }
  await send();
};

const buildEditPrompt = (instruction: string, files: Array<{ path: string; content: string }>) => ({
  role: 'user' as const,
  content: [
    '请你作为代码编辑助手，基于我给你的文件内容进行修改。',
    '要求：',
    '- 只修改我提供的文件；不要臆造不存在的文件。',
    '- 输出必须是严格 JSON（不要 Markdown，不要解释）。',
    '- JSON 格式：{"edits":[{"path":"相对路径","newContent":"完整新文件内容"}]}',
    '',
    `我的修改需求：${instruction}`,
    '',
    '以下是文件内容（JSON 数组）：',
    JSON.stringify(files),
  ].join('\n'),
});

const handleGenerateEdits = async () => {
  if (aiIsLoading.value) return;
  if (!hasApiKey.value) {
    toast.info('请先在“AI 设置”里配置 DeepSeek API Key');
    openSettings();
    return;
  }

  const instruction = input.value.trim();
  if (!instruction) {
    toast.info('请在输入框里先写清楚“要怎么改”，再点击生成预览');
    return;
  }

  const files = selectedFiles.value as FileTreeEntity[];
  if (!files.length) {
    toast.info('请先在左侧文件树选择要修改的文件/文件夹');
    return;
  }

  aiLastError.value = '';
  aiIsLoading.value = true;
  try {
    // 读取文件内容（跳过图片/超大文件）
    const payload: Array<{ path: string; content: string }> = [];
    const beforeMap = new Map<string, { file: FileTreeEntity; before: string }>();
    const readResults = await Promise.all(files.map(async (f) => {
      const { fileEntity, content } = await readTextFileContent(f);
      const path = f.path || f.name;
      if (fileEntity.type === 'image') {
        return {
          ok: false, reason: 'image', path, file: f,
        };
      }
      if (content.length > 200_000) {
        return {
          ok: false, reason: 'large', path, file: f,
        };
      }
      return {
        ok: true as const, path, file: f, content,
      };
    }));

    const skippedLarge = readResults.filter((r) => !r.ok && r.reason === 'large');
    if (skippedLarge.length) {
      toast.info(`已跳过超大文件：${skippedLarge.length} 个`);
    }

    const okResults = readResults.filter((r): r is {
      ok: true;
      path: string;
      file: FileTreeEntity;
      content: string;
    } => r.ok);

    okResults.forEach((r) => {
      payload.push({ path: r.path, content: r.content });
      beforeMap.set(r.path, { file: r.file, before: r.content });
    });

    if (!payload.length) {
      toast.info('没有可用于修改的文本文件（或都被跳过了）');
      return;
    }

    pushChatMessage('user', `对所选文件生成修改预览：${instruction}（文件数：${payload.length}）`);

    const { content: reply } = await deepseekChatCompletions({
      messages: [
        {
          role: 'system',
          content: '你是一个严谨的编程助手。你必须严格输出 JSON，且只输出 JSON。',
        },
        buildEditPrompt(instruction, payload),
      ],
    });

    const parsed = extractFirstJsonObject(reply);
    const edits = (parsed?.edits || []) as Array<{ path: string; newContent: string }>;
    if (!Array.isArray(edits) || !edits.length) {
      throw new Error('AI 返回格式不正确：未找到 edits 数组');
    }

    const previewFiles = edits
      .map((e) => {
        const entry = beforeMap.get(e.path);
        if (!entry) return null;
        return {
          key: entry.file.key,
          path: e.path,
          name: entry.file.name,
          before: entry.before,
          after: (e.newContent ?? '').toString(),
          handle: entry.file.handle,
        };
      })
      .filter(Boolean) as Array<{
      key: string;
      path: string;
      name: string;
      before: string;
      after: string;
      handle: FileSystemFileHandle;
    }>;

    if (!previewFiles.length) {
      throw new Error('AI 返回的 edits 未命中当前选择的文件（path 不匹配）');
    }

    pushChatMessage('assistant', `已生成修改预览：${previewFiles.length} 个文件`);

    const dialog: AiApplyPreviewDialog = new AiApplyPreviewDialog({
      files: previewFiles.map((f) => ({
        key: f.key,
        path: f.path,
        name: f.name,
        before: f.before,
        after: f.after,
      })),
      onCancel: () => dialog.close(),
      onConfirm: async () => {
        await applyAiEdits(previewFiles.map((f) => ({
          key: f.key,
          name: f.name,
          handle: f.handle,
          before: f.before,
          after: f.after,
        })));
        toast.success(`已应用 AI 修改：${previewFiles.length} 个文件`);
        dialog.close();
      },
    });
    dialog.open();
  } catch (e: any) {
    const msg = e?.message || '生成预览失败';
    aiLastError.value = msg;
    toast.error(msg);
  } finally {
    aiIsLoading.value = false;
  }
};

const handleUndo = async () => {
  if (aiIsLoading.value) return;
  const op = aiUndoStack.value.pop();
  if (!op) {
    toast.info('没有可撤销的操作');
    return;
  }
  aiIsLoading.value = true;
  try {
    await Promise.all(op.files.map(async (f) => {
      const handled = await (tabsViewService.value as any).applyExternalUpdate?.(
        f.key,
        f.before,
      );
      if (handled) return;
      const fe = new FileEntity(f.key, f.name, f.handle);
      await fe.write(f.before);
    }));
    toast.success(`已撤销：${op.files.length} 个文件`);
  } catch (e: any) {
    toast.error(e?.message || '撤销失败');
  } finally {
    aiIsLoading.value = false;
  }
};

const handleKeydown = (e: KeyboardEvent) => {
  if (mentionOpen.value) {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeMention();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const max = mentionCandidates.value.length;
      if (!max) return;
      mentionActiveIdx.value = (mentionActiveIdx.value + 1) % max;
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const max = mentionCandidates.value.length;
      if (!max) return;
      mentionActiveIdx.value = (mentionActiveIdx.value - 1 + max) % max;
      return;
    }
    if (e.key === 'Enter' || e.key === 'Tab') {
      const item = mentionCandidates.value[mentionActiveIdx.value];
      if (item) {
        e.preventDefault();
        applyMention(item);
      }
      return;
    }
  }
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendDispatch();
  }
};
</script>

<template>
  <div
    v-show="visible"
    class="ai-panel"
  >
    <div class="ai-header">
      <div class="ai-title">
        <span class="ai-title-badge">AI</span>
        <span class="ai-title-text">助手</span>
      </div>
      <div class="ai-actions">
        <button
          class="ai-link"
          @click="handleClear"
        >
          清空
        </button>
        <button
          class="ai-link"
          @click="() => setAiChatOpen(false)"
        >
          关闭
        </button>
      </div>
    </div>

    <div
      v-if="!hasApiKey"
      class="ai-guide"
    >
      <div class="ai-guide-title">
        还未配置 DeepSeek API Key
      </div>
      <div class="ai-guide-desc">
        先点击右上角顶栏的“设置”完成配置；或在这里一键打开设置。
      </div>
      <div class="ai-guide-actions">
        <WButton
          theme="primary"
          @click="openSettings"
        >
          打开 AI 设置
        </WButton>
      </div>
    </div>

    <div class="ai-selected">
      <div class="ai-selected-title">
        已选择：{{ selectedSummary.files }} 个文件
        <span v-if="selectedSummary.dirs">，{{ selectedSummary.dirs }} 个文件夹</span>
      </div>
      <div
        v-if="selectedFiles.length"
        class="ai-selected-list"
      >
        <div
          v-for="f in selectedFiles.slice(0, 20)"
          :key="f.key"
          class="ai-selected-item"
          :title="f.path"
        >
          <span class="ai-selected-item-text">{{ f.path || f.name }}</span>
        </div>
        <div
          v-if="selectedFiles.length > 20"
          class="ai-selected-more"
        >
          还有 {{ selectedFiles.length - 20 }} 个文件未展示...
        </div>
      </div>
      <div
        v-else
        class="ai-selected-empty"
      >
        在左侧文件树中点击（支持 Ctrl/Cmd 多选）即可把文件带入 AI。
      </div>
    </div>

    <div
      v-if="aiChatSummary"
      class="ai-summary"
    >
      <div class="ai-summary-title">
        会话摘要（自动压缩）
      </div>
      <div class="ai-summary-content">
        {{ aiChatSummary }}
      </div>
    </div>

    <div
      v-if="aiRenameState"
      class="ai-rename"
    >
      <div class="ai-rename-title">
        AI 重命名
      </div>
      <div class="ai-rename-target">
        目标：{{ renameTargetPath }}
      </div>

      <div
        v-if="aiRenameState.status === 'running'"
        class="ai-rename-hint"
      >
        正在生成 3 个建议名称...
      </div>
      <div
        v-else-if="aiRenameState.status === 'error'"
        class="ai-rename-error"
      >
        {{ aiRenameState.error || '生成失败' }}
      </div>
      <div
        v-else
        class="ai-rename-suggestions"
      >
        <div
          v-for="(s, idx) in aiRenameState.suggestions"
          :key="`${s.name}_${idx}`"
          class="ai-rename-suggestion"
        >
          <div class="ai-rename-name">
            {{ s.name }}
          </div>
          <div class="ai-rename-reason">
            {{ s.reason }}
          </div>
          <div class="ai-rename-actions">
            <WButton
              theme="primary"
              size="small"
              :disabled="aiRenameState.status === 'applying'"
              @click="applyRenameSuggestion(s.name)"
            >
              使用该名称
            </WButton>
          </div>
        </div>
      </div>

      <div class="ai-rename-footer">
        <button
          class="ai-link"
          @click="clearAiRename"
        >
          取消
        </button>
      </div>
    </div>

    <div
      ref="listRef"
      class="ai-messages"
    >
      <div
        v-if="!aiChatHistory.length && !aiIsLoading"
        class="ai-empty"
      >
        <div class="ai-empty-title">
          开始和 AI 聊聊吧
        </div>
        <div class="ai-empty-desc">
          - **普通对话**：Enter 发送，Shift+Enter 换行
          <br>
          - **引用文件**：输入 @ 选择文件，把上下文带给 AI
          <br>
          - **批量改文件**：写清楚“要怎么改”，然后点“生成预览”
        </div>
      </div>
      <div
        v-for="m in aiChatHistory"
        :key="m.id"
        class="ai-msg"
        :class="`role-${m.role}`"
      >
        <div class="ai-bubble">
          <div class="ai-msg-role">
            {{ m.role === 'user' ? '你' : (m.role === 'assistant' ? 'AI' : '系统') }}
          </div>
          <div
            v-if="m.role === 'assistant' && m.meta && m.meta.tools && m.meta.tools.length"
            class="ai-tools"
          >
            <div
              v-for="(t, idx) in m.meta.tools"
              :key="`${t.callID || t.tool}_${idx}`"
              class="ai-tool"
              :class="`st-${t.status}`"
            >
              <span class="ai-tool-dot" />
              <span class="ai-tool-name">{{ t.tool }}</span>
              <span
                v-if="t.pattern"
                class="ai-tool-pattern"
                :title="t.pattern"
              >
                {{ t.pattern }}
              </span>
              <span
                v-if="t.error"
                class="ai-tool-error"
                :title="t.error"
              >
                {{ t.error }}
              </span>
            </div>
          </div>
          <div class="ai-msg-content">
            {{ m.content }}
          </div>
        </div>
      </div>

      <div
        v-if="aiIsLoading"
        class="ai-loading"
      >
        AI 思考中...
      </div>
      <div
        v-if="aiLastError"
        class="ai-error"
      >
        {{ aiLastError }}
      </div>
    </div>

    <div class="ai-input">
      <textarea
        ref="textareaRef"
        v-model="input"
        class="ai-textarea"
        placeholder="普通对话：Enter 发送，Shift+Enter 换行；文件修改：先写清楚“要怎么改”，再点“生成预览”"
        @keydown="handleKeydown"
        @input="updateMentionStateFromCursor"
        @click="updateMentionStateFromCursor"
        @keyup="updateMentionStateFromCursor"
      />
      <div
        v-if="mentionOpen"
        class="ai-mention"
        @mousedown.prevent
      >
        <div
          v-if="!mentionCandidates.length"
          class="ai-mention-empty"
        >
          未找到匹配文件
        </div>
        <div
          v-for="(f, idx) in mentionCandidates"
          :key="f.path"
          class="ai-mention-item"
          :class="{ active: idx === mentionActiveIdx }"
          @mouseenter="mentionActiveIdx = idx"
          @click="applyMention(f)"
        >
          <div class="ai-mention-path">
            @{{ f.path }}
          </div>
          <div
            v-if="f.source === 'tab'"
            class="ai-mention-tag"
          >
            已打开
          </div>
        </div>
      </div>
      <div class="ai-send">
        <WButton
          :theme="agentMode ? 'primary' : 'default'"
          :disabled="aiIsLoading"
          @click="agentMode = !agentMode"
        >
          工具模式
        </WButton>
        <WButton
          v-if="aiIsLoading && agentMode"
          @click="cancelAgent"
        >
          取消
        </WButton>
        <WButton
          :disabled="!selectedFiles.length || aiIsLoading"
          @click="handleGenerateEdits"
        >
          生成预览
        </WButton>
        <WButton
          :disabled="!aiUndoStack.length || aiIsLoading"
          @click="handleUndo"
        >
          撤销
        </WButton>
        <WButton
          theme="primary"
          :disabled="aiIsLoading"
          @click="sendDispatch"
        >
          发送
        </WButton>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.ai-panel {
  // panel-level tokens (scoped)
  --ai-panel-bg:
    radial-gradient(1200px 700px at 30% 0%, rgb(20 35 55 / 55%) 0%, transparent 55%),
    linear-gradient(180deg, rgb(37 37 38) 0%, rgb(30 30 30) 100%);
  --ai-border: rgb(60 60 60);
  --ai-card: rgb(30 30 30 / 92%);
  --ai-card-2: rgb(24 24 24 / 92%);
  --ai-card-hover: rgb(255 255 255 / 6%);
  --ai-accent: rgb(38 132 255);
  --ai-accent-soft: rgb(38 132 255 / 16%);
  --ai-danger: #f48771;
  --ai-shadow: 0 10px 30px rgb(0 0 0 / 35%);

  width: 100%;
  height: 100%;
  position: relative;
  background: var(--ai-panel-bg);
  color: var(--w-text-color);
  display: flex;
  flex-direction: column;
  min-height: 0; // 关键：允许子元素在 flex 容器内收缩，否则会把外层撑高
  overflow: hidden; // 防止内部滚动区域把面板整体撑出视口

  // scrollbars (webkit)
  :deep(::-webkit-scrollbar) {
    width: 10px;
    height: 10px;
  }

  :deep(::-webkit-scrollbar-thumb) {
    background: rgb(255 255 255 / 12%);
    border: 2px solid transparent;
    border-radius: 999px;
    background-clip: content-box;
  }

  :deep(::-webkit-scrollbar-thumb:hover) {
    background: rgb(255 255 255 / 18%);
    border: 2px solid transparent;
    background-clip: content-box;
  }

  :deep(::-webkit-scrollbar-corner) {
    background: transparent;
  }
}

.ai-header {
  height: 44px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 12px;
  box-sizing: border-box;
  border-bottom: 1px solid var(--ai-border);
  background: linear-gradient(180deg, rgb(0 0 0 / 18%) 0%, rgb(0 0 0 / 0%) 100%);
  flex: 0 0 auto;
}

.ai-title {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: 0.2px;
}

.ai-title-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 22px;
  padding: 0 10px;
  border-radius: 999px;
  background: var(--ai-accent-soft);
  border: 1px solid rgb(38 132 255 / 35%);
  color: rgb(230 240 255);
  font-size: 12px;
}

.ai-title-text {
  color: var(--w-text-color);
  font-size: 13px;
}

.ai-actions {
  display: flex;
  gap: 10px;
}

.ai-link {
  background: transparent;
  border: 1px solid transparent;
  color: var(--w-text-color2);
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 999px;

  &:hover {
    background: var(--ai-card-hover);
    border-color: rgb(255 255 255 / 8%);
    color: var(--w-text-color);
  }

  &:active {
    transform: translateY(0.5px);
  }
}

.ai-guide {
  padding: 10px 12px;
  border-bottom: 1px solid var(--ai-border);
  background: linear-gradient(180deg, rgb(20 33 48) 0%, rgb(18 26 36) 100%);
  flex: 0 0 auto;
}

.ai-guide-title {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--w-text-color);
}

.ai-guide-desc {
  font-size: 12px;
  color: var(--w-text-color2);
  line-height: 18px;
}

.ai-guide-actions {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
}

.ai-selected {
  padding: 10px 12px;
  border-bottom: 1px solid var(--ai-border);
  background: rgb(0 0 0 / 10%);
  flex: 0 0 auto;
}

.ai-selected-title {
  font-size: 12px;
  color: var(--w-text-color2);
  margin-bottom: 6px;
}

.ai-selected-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-height: 104px;
  overflow: auto;
  border: 1px solid var(--ai-border);
  border-radius: 10px;
  padding: 8px;
  background: var(--ai-card-2);
}

.ai-selected-item {
  font-size: 12px;
  line-height: 18px;
  padding: 4px 8px;
  border-radius: 999px;
  color: var(--w-text-color);
  border: 1px solid rgb(255 255 255 / 8%);
  background: rgb(255 255 255 / 3%);
  max-width: 100%;

  &:hover {
    background: var(--ai-card-hover);
  }
}

.ai-selected-item-text {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ai-selected-more,
.ai-selected-empty {
  font-size: 12px;
  color: var(--w-text-color2);
  opacity: 0.85;
}

.ai-summary {
  padding: 10px 12px;
  border-bottom: 1px solid var(--ai-border);
  background: rgb(0 0 0 / 10%);
  flex: 0 0 auto;
  max-height: min(180px, 22vh);
  overflow: auto;
}

.ai-summary-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--w-text-color);
  margin-bottom: 6px;
}

.ai-summary-content {
  font-size: 12px;
  color: var(--w-text-color2);
  white-space: pre-wrap;
  line-height: 18px;
}

.ai-rename {
  padding: 10px 12px;
  border-bottom: 1px solid var(--ai-border);
  background: rgb(0 0 0 / 12%);
  flex: 0 0 auto;
  // 避免建议区把底部输入框挤没：在小高度面板里让它自己滚动
  max-height: min(360px, 45vh);
  overflow: auto;
}

.ai-rename-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--w-text-color);
  margin-bottom: 6px;
}

.ai-rename-target {
  font-size: 12px;
  color: var(--w-text-color2);
  margin-bottom: 8px;
  word-break: break-word;
}

.ai-rename-hint {
  font-size: 12px;
  color: var(--w-text-color2);
}

.ai-rename-error {
  font-size: 12px;
  color: var(--ai-danger);
}

.ai-rename-suggestion {
  border: 1px solid var(--ai-border);
  border-radius: 10px;
  padding: 8px;
  background: var(--ai-card);
  margin-bottom: 8px;
}

.ai-rename-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--w-text-color);
  margin-bottom: 4px;
  word-break: break-word;
}

.ai-rename-reason {
  font-size: 12px;
  color: var(--w-text-color2);
  line-height: 18px;
  margin-bottom: 8px;
}

.ai-rename-actions {
  display: flex;
  justify-content: flex-end;
}

.ai-rename-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
}

.ai-messages {
  flex: 1 1 auto;
  overflow: auto;
  padding: 12px;
  box-sizing: border-box;
  min-height: 0; // 关键：让 messages 成为可滚动收缩区
}

.ai-empty {
  border: 1px dashed rgb(255 255 255 / 14%);
  border-radius: 12px;
  padding: 12px;
  background: rgb(0 0 0 / 10%);
  margin-bottom: 12px;
}

.ai-empty-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--w-text-color);
  margin-bottom: 6px;
}

.ai-empty-desc {
  font-size: 12px;
  color: var(--w-text-color2);
  line-height: 18px;
}

.ai-msg {
  margin-bottom: 10px;
  display: flex;
  align-items: flex-start;
}

.ai-msg.role-user {
  justify-content: flex-end;
}

.ai-msg.role-assistant {
  justify-content: flex-start;
}

.ai-msg.role-system {
  justify-content: center;
}

.ai-bubble {
  max-width: min(720px, 92%);
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--ai-card);
  border: 1px solid var(--ai-border);
  box-shadow: 0 1px 0 rgb(255 255 255 / 4%) inset;
}

.ai-msg.role-user .ai-bubble {
  background: linear-gradient(180deg, rgb(20 40 62) 0%, rgb(18 32 50) 100%);
  border-color: rgb(35 62 92);
}

.ai-msg.role-system .ai-bubble {
  background: rgb(255 255 255 / 4%);
  border-color: rgb(255 255 255 / 10%);
}

.ai-msg-role {
  font-size: 11px;
  color: rgb(210 210 210 / 70%);
  margin-bottom: 6px;
  letter-spacing: 0.2px;
}

.ai-msg-content {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 20px;
}

.ai-tools {
  margin-bottom: 8px;
  padding: 8px;
  border-radius: 10px;
  border: 1px solid rgb(255 255 255 / 10%);
  background: rgb(255 255 255 / 3%);
}

.ai-tool {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--w-text-color2);
  line-height: 18px;
  margin-bottom: 4px;

  &:last-child {
    margin-bottom: 0;
  }
}

.ai-tool-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgb(120 120 120);
  flex: none;
}

.ai-tool.st-running .ai-tool-dot {
  background: rgb(38 132 255);
}

.ai-tool.st-completed .ai-tool-dot {
  background: rgb(80 200 120);
}

.ai-tool.st-error .ai-tool-dot {
  background: #f48771;
}

.ai-tool-name {
  color: var(--w-text-color);
}

.ai-tool-pattern {
  color: var(--w-text-color2);
  opacity: 0.9;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 340px;
}

.ai-tool-error {
  color: #f48771;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ai-loading {
  margin-top: 8px;
  font-size: 12px;
  color: var(--w-text-color2);
}

.ai-error {
  margin-top: 8px;
  font-size: 12px;
  color: var(--ai-danger);
}

.ai-input {
  padding: 10px 12px 12px;
  border-top: 1px solid var(--ai-border);
  box-sizing: border-box;
  position: relative;
  flex: 0 0 auto; // 关键：底部输入区不被压缩，发送按钮始终可见
  background: linear-gradient(180deg, rgb(0 0 0 / 0%) 0%, rgb(0 0 0 / 18%) 100%);
}

.ai-textarea {
  width: 100%;
  box-sizing: border-box;
  height: 88px;
  resize: none;
  border-radius: 10px;
  padding: 10px;
  border: 1px solid var(--ai-border);
  background: var(--ai-card);
  color: var(--w-text-color);
  box-shadow: 0 1px 0 rgb(255 255 255 / 4%) inset;

  &:focus {
    border-color: var(--w-input-border-focus);
    box-shadow:
      0 0 0 3px rgb(38 132 255 / 14%),
      0 1px 0 rgb(255 255 255 / 4%) inset;
  }
}

.ai-mention {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 62px; // 贴近 textarea 底部上方
  max-height: 240px;
  overflow: auto;
  background: rgb(24 24 24 / 96%);
  border: 1px solid rgb(255 255 255 / 12%);
  border-radius: 12px;
  box-shadow: var(--ai-shadow);
  z-index: 10;
}

.ai-mention-empty {
  padding: 10px 12px;
  color: rgb(170 170 170);
  font-size: 12px;
}

.ai-mention-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 12px;
  cursor: pointer;

  &:hover {
    background: var(--ai-card-hover);
  }

  &.active {
    background: var(--ai-accent-soft);
  }
}

.ai-mention-path {
  font-size: 12px;
  color: rgb(220 220 220);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ai-mention-tag {
  flex: none;
  font-size: 11px;
  color: rgb(170 170 170);
  border: 1px solid rgb(255 255 255 / 12%);
  border-radius: 999px;
  padding: 2px 8px;
}

.ai-send {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;

  :deep(.w-button + .w-button) {
    margin-left: 8px;
  }
}
</style>
