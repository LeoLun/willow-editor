import { deepseekChatCompletions } from '@/services/deepseek';
import type { AiModelMessage } from '../types';

function estimateTokensByChars(text: string) {
  // 非严格：英文约 4 chars/token；中文约 1~2 chars/token。这里取保守值 3.
  return Math.ceil((text || '').length / 3);
}

function toCompactTranscript(messages: AiModelMessage[], maxChars: number) {
  const lines: string[] = [];
  for (let i = 0; i < messages.length; i += 1) {
    const m = messages[i];
    if (m.role !== 'system') {
      let c = (m.content || '').toString();
      if (c) {
        // tool 输出常常很大，做硬截断
        if (m.role === 'tool' && c.length > 2000) {
          c = `${c.slice(0, 2000)}\n// ...(tool output truncated)`;
        }
        lines.push(`[${m.role}] ${c}`);
        if (lines.join('\n').length > maxChars) break;
      }
    }
  }
  const t = lines.join('\n');
  if (t.length <= maxChars) return t;
  return t.slice(0, maxChars);
}

export default async function compactHistory(input: {
  messages: AiModelMessage[];
  model?: string;
  temperature?: number;
  targetMaxChars?: number;
}) {
  const { messages, model = 'deepseek-reasoner', temperature = 0.2 } = input;
  const transcript = toCompactTranscript(messages, input.targetMaxChars ?? 35000);

  const prompt = [
    '你是“会话压缩器”。请把下面的对话历史压缩成一段可用于 system prompt 的摘要。',
    '',
    '要求：',
    '- 用中文输出，纯文本，不要 Markdown。',
    '- 重点保留：用户目标、当前进展、已做修改（列出文件路径）、关键约束、尚未完成的待办。',
    '- 不要逐句复述；尽量结构化但用普通文本（可用短分段）。',
    '- 控制在 1200 字以内。',
    '',
    '对话历史：',
    transcript,
  ].join('\n');

  const { content } = await deepseekChatCompletions({
    model,
    temperature,
    messages: [
      { role: 'system', content: '你必须输出纯文本摘要，不要 Markdown，不要代码块。' },
      { role: 'user', content: prompt },
    ],
  });

  return {
    ok: true,
    summary: (content || '').toString().trim(),
    inputTokensEstimate: estimateTokensByChars(transcript),
  };
}
