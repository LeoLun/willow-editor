<script setup lang="ts">
import {
  computed, onBeforeUnmount, onMounted, ref, watch,
} from 'vue';
import WButton from '@/components/button/index.vue';
import DialogBase from '@/components/dialog-template/dialog-base.vue';
import { ensureMonacoEnv, monaco } from '@/layout/editor-view/monaco-shared';

export type PreviewFile = {
  key: string;
  path: string;
  name: string;
  before: string;
  after: string;
};

const props = defineProps<{
  files: PreviewFile[];
  onCancel:() => void;
  onConfirm: () => void;
}>();

const currentKey = ref(props.files[0]?.key || '');
const current = computed(() => props.files.find((f) => f.key === currentKey.value));
const changedCount = computed(() => props.files.filter((f) => f.before !== f.after).length);

const diffElRef = ref<HTMLDivElement | null>(null);
let diffEditor: monaco.editor.IStandaloneDiffEditor | null = null;
let originalModel: monaco.editor.ITextModel | null = null;
let modifiedModel: monaco.editor.ITextModel | null = null;
let disposed = false;

function guessLanguage(pathOrName: string) {
  const n = (pathOrName || '').toLowerCase();
  const ext = n.includes('.') ? n.split('.').pop() || '' : '';
  if (ext === 'ts') return 'typescript';
  if (ext === 'tsx') return 'typescript';
  if (ext === 'js') return 'javascript';
  if (ext === 'jsx') return 'javascript';
  if (ext === 'json') return 'json';
  if (ext === 'vue') return 'vue';
  if (ext === 'html') return 'html';
  if (ext === 'css') return 'css';
  if (ext === 'less') return 'less';
  if (ext === 'scss') return 'scss';
  if (ext === 'md') return 'markdown';
  if (ext === 'yml' || ext === 'yaml') return 'yaml';
  return 'plaintext';
}

function disposeModels() {
  try { originalModel?.dispose(); } catch { /* ignore */ }
  try { modifiedModel?.dispose(); } catch { /* ignore */ }
  originalModel = null;
  modifiedModel = null;
}

function resetDiffEditorModel() {
  if (!diffEditor) return;
  try {
    // 关键：先解除 diffEditor 对 model 的引用，再 dispose model
    diffEditor.setModel(null as any);
  } catch {
    // ignore
  }
}

function setDiffContent(file?: PreviewFile) {
  if (!diffEditor || !file || disposed) return;
  // 先把旧 model 从 editor 上卸载，避免 disposed model 仍被引用
  resetDiffEditorModel();
  disposeModels();
  const lang = guessLanguage(file.path || file.name);
  const originalUri = monaco.Uri.parse(`inmemory://ai-diff/original/${encodeURIComponent(file.path || file.name)}`);
  const modifiedUri = monaco.Uri.parse(`inmemory://ai-diff/modified/${encodeURIComponent(file.path || file.name)}`);
  originalModel = monaco.editor.createModel(file.before ?? '', lang, originalUri);
  modifiedModel = monaco.editor.createModel(file.after ?? '', lang, modifiedUri);
  try {
    diffEditor.setModel({ original: originalModel, modified: modifiedModel });
  } catch {
    // 如果 dialog 正在销毁，setModel 可能抛错；忽略即可
  }
}

onMounted(() => {
  ensureMonacoEnv();
  const el = diffElRef.value;
  if (!el) return;
  diffEditor = monaco.editor.createDiffEditor(el, {
    automaticLayout: true,
    theme: 'vs-dark',
    readOnly: true,
    renderSideBySide: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    overviewRulerBorder: false,
    enableSplitViewResizing: true,
  });
  setDiffContent(current.value);
});

watch(current, (f) => {
  setDiffContent(f);
});

onBeforeUnmount(() => {
  disposed = true;
  resetDiffEditorModel();
  disposeModels();
  try { diffEditor?.dispose(); } catch { /* ignore */ }
  diffEditor = null;
});
</script>

<template>
  <DialogBase title="AI 修改预览">
    <div class="summary">
      本次将修改 <b>{{ changedCount }}</b> / {{ files.length }} 个文件（请确认后再应用）。
    </div>

    <div class="content">
      <div class="left">
        <div class="left-title">
          文件列表
        </div>
        <div class="file-list">
          <div
            v-for="f in files"
            :key="f.key"
            class="file-item"
            :class="{ active: f.key === currentKey, changed: f.before !== f.after }"
            :title="f.path"
            @click="currentKey = f.key"
          >
            <span class="dot" />
            <span class="name">{{ f.path || f.name }}</span>
          </div>
        </div>
      </div>

      <div class="right">
        <div class="right-title">
          {{ current?.path || current?.name }}
        </div>
        <div
          ref="diffElRef"
          class="diff-editor"
        />
      </div>
    </div>

    <template #footer>
      <WButton @click="onCancel">
        取消
      </WButton>
      <WButton
        theme="primary"
        @click="onConfirm"
      >
        应用修改
      </WButton>
    </template>
  </DialogBase>
</template>

<style lang="less" scoped>
.summary {
  font-size: 12px;
  color: var(--w-text-color2);
  margin-bottom: 10px;
}

.content {
  display: flex;
  height: min(72vh, 760px);
  border: 1px solid rgb(60 60 60);
  border-radius: 8px;
  overflow: hidden;
}

.left {
  width: 260px;
  border-right: 1px solid rgb(60 60 60);
  background: rgb(25 25 25);
  display: flex;
  flex-direction: column;
}

.left-title {
  padding: 8px 10px;
  font-size: 12px;
  color: var(--w-text-color2);
  border-bottom: 1px solid rgb(60 60 60);
}

.file-list {
  flex: 1;
  overflow: auto;
  padding: 6px;
  box-sizing: border-box;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  color: var(--w-text-color);

  &:hover {
    background: rgb(90 93 94 / 31%);
  }

  &.active {
    background: rgb(0 122 204 / 22%);
    border: 1px solid rgb(0 122 204 / 40%);
  }
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgb(120 120 120);
}

.file-item.changed .dot {
  background: rgb(0 122 204);
}

.name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.right {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgb(30 30 30);
}

.right-title {
  padding: 8px 10px;
  font-size: 12px;
  color: var(--w-text-color2);
  border-bottom: 1px solid rgb(60 60 60);
}

.diff-editor {
  flex: 1;
  min-height: 0;
}
</style>
