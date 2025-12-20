/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import {
  aiApiKey,
  aiBaseUrl,
  validateDeepseekApiKey,
} from '@/services/ai/store';

type DeepseekChatRole = 'system' | 'user' | 'assistant';

export type DeepseekChatMessage = {
  role: DeepseekChatRole;
  content: string;
};

export type DeepseekChatCompletionResponse = {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: { role: DeepseekChatRole; content: string };
    finish_reason: string;
  }>;
};

export type DeepseekChatCompletionStreamChunk = {
  id?: string;
  object?: string;
  created?: number;
  model?: string;
  choices?: Array<{
    index: number;
    delta?: { role?: DeepseekChatRole; content?: string };
    finish_reason?: string | null;
  }>;
};

function normalizeBaseUrl(baseUrl: string) {
  const v = baseUrl.trim();
  if (!v) return 'https://api.deepseek.com';
  return v.replace(/\/+$/, '');
}

async function deepseekFetch(path: string, init: RequestInit) {
  const key = aiApiKey.value.trim();
  const keyCheck = validateDeepseekApiKey(key);
  if (!keyCheck.ok) {
    throw new Error(keyCheck.message);
  }

  const baseUrl = normalizeBaseUrl(aiBaseUrl.value);
  const url = `${baseUrl}${path}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
      ...(init.headers || {}),
    },
  });

  if (!res.ok) {
    let detail = '';
    try {
      const t = await res.text();
      detail = t ? `: ${t}` : '';
    } catch {
      // ignore
    }
    throw new Error(`DeepSeek 请求失败(${res.status})${detail}`);
  }
  return res;
}

export async function testDeepseekKey() {
  // OpenAI 兼容：/v1/models
  const res = await deepseekFetch('/v1/models', { method: 'GET' });
  await res.json().catch(() => ({}));
  return true;
}

export async function deepseekChatCompletions(params: {
  messages: DeepseekChatMessage[];
  model?: string;
  temperature?: number;
}) {
  const {
    messages,
    model = 'deepseek-chat',
    temperature = 0.2,
  } = params;

  const res = await deepseekFetch('/v1/chat/completions', {
    method: 'POST',
    body: JSON.stringify({
      model,
      temperature,
      messages,
      stream: false,
    }),
  });
  const json = await res.json() as DeepseekChatCompletionResponse;
  const content = json?.choices?.[0]?.message?.content ?? '';
  return { raw: json, content };
}

function parseSseLineData(line: string) {
  // SSE 行形如：data: {...} 或 data: [DONE]
  const trimmed = line.trim();
  if (!trimmed.startsWith('data:')) return null;
  const data = trimmed.slice('data:'.length).trim();
  return data;
}

export async function deepseekChatCompletionsStream(params: {
  messages: DeepseekChatMessage[];
  model?: string;
  temperature?: number;
  signal?: AbortSignal;
  onDelta?: (deltaText: string, chunk: DeepseekChatCompletionStreamChunk) => void;
  onChunk?: (chunk: DeepseekChatCompletionStreamChunk) => void;
}) {
  const {
    messages,
    model = 'deepseek-chat',
    temperature = 0.2,
    signal,
    onDelta,
    onChunk,
  } = params;

  const res = await deepseekFetch('/v1/chat/completions', {
    method: 'POST',
    signal,
    headers: {
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({
      model,
      temperature,
      messages,
      stream: true,
    }),
  });

  if (!res.body) {
    throw new Error('DeepSeek 流式响应不可用（body 为空）');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let finalText = '';

  // eslint-disable-next-line no-constant-condition
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // 以行处理即可（SSE 规范以 \n 分行，事件用空行分隔；这里按行解析 data:）
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const data = parseSseLineData(line);
      if (!data) continue;
      if (data === '[DONE]') {
        try { await reader.cancel(); } catch { /* ignore */ }
        return { content: finalText };
      }

      let chunk: DeepseekChatCompletionStreamChunk;
      try {
        chunk = JSON.parse(data) as DeepseekChatCompletionStreamChunk;
      } catch {
        // 偶发服务端输出非 JSON（或分片未对齐）时，忽略
        continue;
      }

      onChunk?.(chunk);
      const delta = chunk?.choices?.[0]?.delta?.content ?? '';
      if (delta) {
        finalText += delta;
        onDelta?.(delta, chunk);
      }
    }
  }

  // 兜底：连接正常结束但没收到 [DONE]
  return { content: finalText };
}

export function extractFirstJsonObject(text: string) {
  // 支持 ```json ... ``` 或者纯 JSON
  const fenced = text.match(/```json\s*([\s\S]*?)\s*```/i);
  const candidate = (fenced?.[1] ?? text).trim();
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  const jsonText = candidate.slice(start, end + 1);
  try {
    return JSON.parse(jsonText) as any;
  } catch {
    return null;
  }
}
