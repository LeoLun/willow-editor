import { ref, computed } from 'vue';
import type { TreeEntity } from '@/entity';

export type AiRole = 'system' | 'user' | 'assistant';

export type AiChatMessage = {
  id: string;
  role: AiRole;
  content: string;
  ts: number;
  meta?: {
    tools?: Array<{
      callID?: string;
      tool: string;
      pattern?: string;
      status: 'running' | 'completed' | 'error';
      startedAt?: number;
      completedAt?: number;
      error?: string;
    }>;
  };
};

export type AiApplyFilePatch = {
  key: string; // willow 内部 file key
  name: string;
  handle: FileSystemFileHandle;
  before: string;
  after: string;
};

export type AiApplyOperation = {
  id: string;
  ts: number;
  files: AiApplyFilePatch[];
};

const STORAGE = {
  apiKey: 'willow.ai.deepseek.apiKey',
  baseUrl: 'willow.ai.deepseek.baseUrl',
  chatHistory: 'willow.ai.chat.history',
  chatOpen: 'willow.ai.chat.open',
  panelWidth: 'willow.ai.chat.panelWidth',
  permissionRules: 'willow.ai.permission.rules',
  sessionSummary: 'willow.ai.chat.summary',
} as const;

function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function loadString(key: string, fallback = '') {
  const v = localStorage.getItem(key);
  return (v ?? fallback).toString();
}

function loadBool(key: string, fallback = false) {
  const v = localStorage.getItem(key);
  if (v === null) return fallback;
  return v === '1' || v === 'true';
}

function loadNumber(key: string, fallback: number) {
  const v = localStorage.getItem(key);
  if (v === null) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function uid(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export const aiApiKey = ref<string>(loadString(STORAGE.apiKey, ''));
export const aiBaseUrl = ref<string>(loadString(STORAGE.baseUrl, 'https://api.deepseek.com'));
export const aiChatOpen = ref<boolean>(loadBool(STORAGE.chatOpen, false));
export const aiPanelWidth = ref<number>(loadNumber(STORAGE.panelWidth, 360));

export const aiChatHistory = ref<AiChatMessage[]>(
  safeJsonParse<AiChatMessage[]>(localStorage.getItem(STORAGE.chatHistory), []),
);

export const aiChatSummary = ref<string>(loadString(STORAGE.sessionSummary, ''));

export const aiSelectedEntities = ref<TreeEntity[]>([]);

export const aiIsLoading = ref(false);
export const aiLastError = ref<string>('');

export const aiUndoStack = ref<AiApplyOperation[]>([]);

export type AiPermissionRule = {
  permission: string;
  pattern: string;
  action: 'allow' | 'deny' | 'ask';
};

export const aiPermissionRules = ref<AiPermissionRule[]>(
  safeJsonParse<AiPermissionRule[]>(localStorage.getItem(STORAGE.permissionRules), []),
);

export type AiRenameSuggestion = {
  name: string;
  reason: string;
};

export type AiRenameRequest = {
  id: string;
  ts: number;
  fileKey: string;
};

export type AiRenameState = {
  id: string;
  ts: number;
  fileKey: string;
  status: 'running' | 'ready' | 'applying' | 'done' | 'error';
  suggestions: AiRenameSuggestion[];
  error?: string;
};

export const aiRenameRequest = ref<AiRenameRequest | null>(null);
export const aiRenameState = ref<AiRenameState | null>(null);

export function persistAiSettings() {
  localStorage.setItem(STORAGE.apiKey, aiApiKey.value.trim());
  localStorage.setItem(STORAGE.baseUrl, aiBaseUrl.value.trim() || 'https://api.deepseek.com');
}

export function setAiChatOpen(open: boolean) {
  aiChatOpen.value = open;
  localStorage.setItem(STORAGE.chatOpen, open ? '1' : '0');
}

export function setAiPanelWidth(width: number) {
  aiPanelWidth.value = width;
  localStorage.setItem(STORAGE.panelWidth, String(width));
}

export function pushChatMessage(role: AiRole, content: string) {
  const msg: AiChatMessage = {
    id: uid('msg'),
    role,
    content,
    ts: Date.now(),
  };
  aiChatHistory.value.push(msg);

  // 控制历史长度，避免无限增长
  const MAX = 60;
  if (aiChatHistory.value.length > MAX) {
    aiChatHistory.value.splice(0, aiChatHistory.value.length - MAX);
  }

  localStorage.setItem(STORAGE.chatHistory, JSON.stringify(aiChatHistory.value));
  return msg;
}

export function updateChatMessageMeta(id: string, updater: (meta: AiChatMessage['meta']) => AiChatMessage['meta']) {
  const msg = aiChatHistory.value.find((m) => m.id === id);
  if (!msg) return false;
  msg.meta = updater(msg.meta);
  return true;
}

export function persistChatHistory() {
  localStorage.setItem(STORAGE.chatHistory, JSON.stringify(aiChatHistory.value));
}

export function setAiChatSummary(summary: string) {
  aiChatSummary.value = (summary || '').toString();
  localStorage.setItem(STORAGE.sessionSummary, aiChatSummary.value);
}

export function persistAiPermissionRules() {
  localStorage.setItem(STORAGE.permissionRules, JSON.stringify(aiPermissionRules.value || []));
}

export function addAiPermissionRule(rule: AiPermissionRule) {
  aiPermissionRules.value.push(rule);
  // 控制长度，避免无限增长
  const MAX = 100;
  if (aiPermissionRules.value.length > MAX) {
    aiPermissionRules.value.splice(0, aiPermissionRules.value.length - MAX);
  }
  persistAiPermissionRules();
}

export function clearAiPermissionRules() {
  aiPermissionRules.value = [];
  persistAiPermissionRules();
}

export function updateChatMessageContent(id: string, content: string) {
  const msg = aiChatHistory.value.find((m) => m.id === id);
  if (!msg) return false;
  msg.content = content;
  return true;
}

export function clearChatHistory() {
  aiChatHistory.value = [];
  localStorage.setItem(STORAGE.chatHistory, JSON.stringify([]));
}

export function validateDeepseekApiKey(key: string) {
  const v = key.trim();
  if (!v) return { ok: false, message: '请输入 DeepSeek API Key' };
  if (/\s/.test(v)) return { ok: false, message: 'API Key 不能包含空格' };
  // DeepSeek key 形式可能随时间变化，这里做温和校验：长度+字符集
  if (v.length < 20) return { ok: false, message: 'API Key 长度看起来不正确（至少 20 位）' };
  if (!/^[A-Za-z0-9_.-]+$/.test(v)) return { ok: false, message: 'API Key 仅允许字母/数字/._- 字符' };
  return { ok: true, message: '' };
}

export const hasApiKey = computed(() => !!aiApiKey.value.trim());

export function requestAiRename(fileKey: string) {
  aiRenameRequest.value = {
    id: uid('ai_rename'),
    ts: Date.now(),
    fileKey,
  };
}

export function clearAiRename() {
  aiRenameRequest.value = null;
  aiRenameState.value = null;
}

export function setAiRenameState(next: AiRenameState | null) {
  aiRenameState.value = next;
}
