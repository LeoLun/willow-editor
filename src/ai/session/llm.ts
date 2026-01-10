/* eslint-disable no-await-in-loop, no-restricted-syntax, no-continue, max-len */
import { deepseekChatCompletions } from '@/services/deepseek';
import type { AiModelMessage, AiTool, RunAgentInput } from '../types';
import PermissionNext from '../permission/next';

function stableJsonStringify(v: any) {
  try {
    return JSON.stringify(v, Object.keys(v || {}).sort());
  } catch {
    try { return JSON.stringify(v); } catch { return String(v); }
  }
}

function toolCallSignature(name: string, args: any) {
  return `${name}(${stableJsonStringify(args)})`;
}

function permissionPattern(toolName: string, args: any) {
  const tn = String(toolName || '');
  if (tn === 'read_file') return `read_file ${(args?.path ?? '').toString()}`;
  if (tn === 'write_file') return `write_file ${(args?.path ?? '').toString()}`;
  if (tn === 'list_directory') return `list_directory ${(args?.path ?? '').toString() || '(root)'}`;
  if (tn === 'glob') return `glob ${(args?.pattern ?? '').toString()}`;
  if (tn === 'grep') return `grep ${(args?.query ?? '').toString()} ${(args?.filePattern ?? '').toString()}`;
  if (tn === 'undo') return `undo ${(args?.count ?? 1).toString()}`;
  return `${tn} ${stableJsonStringify(args).slice(0, 500)}`;
}

export default async function runToolLoop(
  input: RunAgentInput,
): Promise<{ text: string; steps: number; messages: AiModelMessage[] }> {
  const {
    agent,
    sessionID,
    messageID,
    messages,
    tools,
    model = 'deepseek-reasoner',
    temperature = agent.temperature ?? 0.2,
    maxSteps = agent.steps ?? 20,
    abort,
    onEvent,
    askPermission,
  } = input;

  const toolMap = new Map<string, AiTool>();
  tools.forEach((t) => toolMap.set(t.function.name, t));

  const toolDefs = tools.map((t) => ({
    type: 'function',
    function: {
      name: t.function.name,
      description: t.function.description,
      parameters: t.function.parameters,
    },
  }));

  const runtimeMessages: any[] = [...messages];

  const lastToolSigs: string[] = [];

  for (let step = 0; step < maxSteps; step += 1) {
    if (abort?.aborted) throw new Error('已取消');

    const { message, content: reply } = await deepseekChatCompletions({
      messages: runtimeMessages,
      tools: toolDefs as any,
      tool_choice: 'auto',
      temperature,
      model,
      signal: abort,
      retries: 1,
    });

    const toolCalls = (message as any)?.tool_calls;
    if (Array.isArray(toolCalls) && toolCalls.length) {
      runtimeMessages.push({
        role: 'assistant',
        content: (message as any)?.content ?? '',
        // deepseek-reasoner 的 tool calls 要求带 reasoning_content 字段（即便为空）
        reasoning_content: (message as any)?.reasoning_content ?? '',
        tool_calls: toolCalls,
      });

      // eslint-disable-next-line no-restricted-syntax
      for (const tc of toolCalls) {
        const toolName = tc?.function?.name;
        const rawArgs = tc?.function?.arguments ?? '{}';
        let parsedArgs: any = {};
        try { parsedArgs = JSON.parse(rawArgs); } catch { parsedArgs = {}; }

        const permPatternForEvent = permissionPattern(toolName, parsedArgs);
        onEvent?.({
          type: 'tool-call',
          tool: toolName,
          callID: tc?.id,
          args: parsedArgs,
          pattern: permPatternForEvent,
          step,
        });

        // doom-loop：连续 3 次相同调用就中止（避免烧 token）
        const sig = toolCallSignature(String(toolName || ''), parsedArgs);
        lastToolSigs.push(sig);
        if (lastToolSigs.length > 3) lastToolSigs.shift();
        if (lastToolSigs.length === 3 && lastToolSigs[0] === lastToolSigs[1] && lastToolSigs[1] === lastToolSigs[2]) {
          throw new Error(`检测到工具调用循环（doom loop）：${sig}`);
        }

        const tool = toolMap.get(toolName);
        let toolOut: any;
        try {
          if (!tool) throw new Error(`未知工具：${toolName}`);
          const permPattern = permPatternForEvent;
          await PermissionNext.ask(agent.permission, {
            permission: toolName,
            patterns: [permPattern],
            onAsk: askPermission
              ? async (payload) => askPermission({
                permission: payload.permission,
                pattern: payload.pattern,
                metadata: payload.metadata,
              })
              : undefined,
          });

          toolOut = await tool.execute(parsedArgs, {
            sessionID,
            messageID,
            agent: agent.name,
            step,
            callID: tc?.id,
            abort,
            metadata: () => {},
            ask: async (payload) => {
              await PermissionNext.ask(agent.permission, payload);
            },
          });
        } catch (e: any) {
          toolOut = {
            title: toolName || 'tool',
            output: JSON.stringify({ ok: false, error: e?.message || 'tool failed' }),
            metadata: { ok: false, error: e?.message || 'tool failed' },
          };
        }

        onEvent?.({
          type: 'tool-result',
          tool: toolName,
          callID: tc?.id,
          args: parsedArgs,
          pattern: permPatternForEvent,
          result: toolOut,
          step,
        });

        runtimeMessages.push({
          role: 'tool',
          tool_call_id: tc?.id,
          content: toolOut?.output ?? JSON.stringify(toolOut),
        });
      }

      continue;
    }

    const text = (reply || '(空响应)').toString();
    onEvent?.({ type: 'text', text, step });
    return {
      text,
      steps: step + 1,
      messages: runtimeMessages as AiModelMessage[],
    };
  }

  throw new Error(`AI 工具调用次数过多（>${maxSteps}），已中止。`);
}
