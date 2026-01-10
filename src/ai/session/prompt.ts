import type { AgentInfo, AiHost, AiModelMessage } from '../types';
import buildAgentSystemPrompt from './system';
import createWillowTools from '../tool/registry';
import runToolLoop from './llm';
import compactHistory from './compaction';

const SessionPrompt = {
  async prompt(input: {
    agent: AgentInfo;
    host: AiHost;
    messages: AiModelMessage[]; // history（不包含 system 也可以）
    model?: string;
    temperature?: number;
    maxSteps?: number;
    abort?: AbortSignal;
    onEvent?: Parameters<typeof runToolLoop>[0]['onEvent'];
    askPermission?: Parameters<typeof runToolLoop>[0]['askPermission'];
    summary?: string;
    // 超出该阈值就触发压缩（近似 token）
    compactThresholdTokens?: number;
  }) {
    const {
      agent,
      host,
      messages,
      model,
      temperature,
      maxSteps,
      abort,
      onEvent,
      askPermission,
      summary: summaryFromCaller,
      compactThresholdTokens = 18000,
    } = input;

    const filtered = (messages || []).filter((m) => m.role !== 'system');

    // 估算 token：只算非 system 的 content 长度（粗略）
    const roughTokens = filtered.reduce((acc, m) => acc + Math.ceil(((m.content || '').toString().length) / 3), 0);
    let summary = (summaryFromCaller || '').toString().trim();
    let messagesToUse = filtered;

    // 历史过长：压缩前面的消息，只保留最近 N 条
    if (roughTokens > compactThresholdTokens) {
      const KEEP_LAST = 12;
      const head = filtered.slice(0, Math.max(0, filtered.length - KEEP_LAST));
      const tail = filtered.slice(-KEEP_LAST);
      try {
        const { summary: s } = await compactHistory({
          messages: head,
          model: model || 'deepseek-reasoner',
          temperature: 0.2,
        });
        if (s) summary = summary ? `${summary}\n\n${s}` : s;
        messagesToUse = tail;
      } catch {
        // 压缩失败就降级：只截断历史
        messagesToUse = tail;
      }
    }

    const system = agent.prompt || buildAgentSystemPrompt({
      productName: 'willow-editor',
      platform: 'darwin',
      date: new Date().toDateString(),
      summary,
    });

    const normalized: AiModelMessage[] = [];
    // 如果调用方已经带了 system，则我们替换为 agent 的 system（避免“工具约束”丢失）
    normalized.push({ role: 'system', content: system });
    normalized.push(...messagesToUse);

    const tools = createWillowTools(host);
    const sessionID = `ai_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const messageID = `msg_${Date.now()}_${Math.random().toString(16).slice(2)}`;

    const res = await runToolLoop({
      agent,
      sessionID,
      messageID,
      messages: normalized,
      tools,
      host,
      model,
      temperature,
      maxSteps,
      abort,
      onEvent,
      askPermission,
    });
    return { ...res, summary };
  },
};

export default SessionPrompt;
