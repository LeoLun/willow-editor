import type { AgentInfo, RunAgentInput } from '../types';
import type { AssistantMessage, ToolPart } from './message-v2';
import runToolLoop from './llm';

function uid(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function findToolPart(msg: AssistantMessage, callID: string) {
  return msg.parts.find((p): p is ToolPart => p.type === 'tool' && p.callID === callID);
}

const SessionProcessor = {
  createAssistantMessage(input: {
    sessionID: string;
    parentID: string;
    agent: AgentInfo;
    mode: string;
  }): AssistantMessage {
    return {
      id: uid('asst'),
      role: 'assistant',
      sessionID: input.sessionID,
      parentID: input.parentID,
      agent: input.agent.name,
      mode: input.mode,
      time: { created: Date.now() },
      parts: [],
    };
  },

  async process(input: RunAgentInput & {
    assistant: AssistantMessage;
    onAssistantUpdate?: (msg: AssistantMessage) => void;
  }) {
    const { assistant, onAssistantUpdate, ...rest } = input;

    assistant.parts.push({ type: 'step-start', step: 0, time: Date.now() });
    onAssistantUpdate?.(assistant);

    const res = await runToolLoop({
      ...rest,
      onEvent: (evt) => {
        if (evt.type === 'tool-call') {
          assistant.parts.push({
            type: 'tool',
            tool: String(evt.tool || ''),
            callID: String(evt.callID || uid('call')),
            input: evt.args ?? {},
            state: { status: 'running', startedAt: Date.now() },
          });
          onAssistantUpdate?.(assistant);
          return;
        }
        if (evt.type === 'tool-result') {
          const callID = String(evt.callID || '');
          const p = callID ? findToolPart(assistant, callID) : null;
          const now = Date.now();
          if (p) {
            const out = evt.result?.output ?? '';
            p.state = {
              status: 'completed',
              startedAt: (p.state as any)?.startedAt,
              completedAt: now,
              output: String(out),
              metadata: evt.result?.metadata,
            };
          } else {
            assistant.parts.push({
              type: 'tool',
              tool: String(evt.tool || ''),
              callID: callID || uid('call'),
              input: evt.args ?? {},
              state: {
                status: 'completed',
                completedAt: now,
                output: String(evt.result?.output ?? ''),
                metadata: evt.result?.metadata,
              },
            });
          }
          onAssistantUpdate?.(assistant);
          return;
        }
        if (evt.type === 'text') {
          // 累加 text part（便于 UI 渲染）
          const last = assistant.parts[assistant.parts.length - 1];
          if (last && last.type === 'text') {
            last.text += String(evt.text || '');
          } else {
            assistant.parts.push({ type: 'text', text: String(evt.text || '') });
          }
          onAssistantUpdate?.(assistant);
        }
      },
    });

    assistant.finish = 'end_turn';
    assistant.time.completed = Date.now();
    assistant.parts.push({
      type: 'step-finish',
      step: res.steps,
      time: Date.now(),
      finishReason: 'end_turn',
    });
    onAssistantUpdate?.(assistant);
    return res;
  },
};

export default SessionProcessor;
