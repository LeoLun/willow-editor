import type { AgentInfo } from '../types';

export type FinishReason = 'end_turn' | 'stop' | 'length' | 'tool-calls' | 'error' | 'cancelled';

export type TextPart = {
  type: 'text';
  text: string;
};

export type ToolState =
  | { status: 'pending' }
  | { status: 'running'; startedAt: number }
  | { status: 'completed'; startedAt?: number; completedAt: number; output: string; metadata?: any }
  | { status: 'error'; startedAt?: number; completedAt: number; error: string; metadata?: any };

export type ToolPart = {
  type: 'tool';
  tool: string;
  callID: string;
  input: any;
  state: ToolState;
};

export type StepStartPart = {
  type: 'step-start';
  step: number;
  time: number;
};

export type StepFinishPart = {
  type: 'step-finish';
  step: number;
  time: number;
  finishReason?: FinishReason;
};

export type Part = TextPart | ToolPart | StepStartPart | StepFinishPart;

export type UserMessage = {
  id: string;
  role: 'user';
  sessionID: string;
  agent: string;
  time: { created: number };
  content: string;
};

export type AssistantMessage = {
  id: string;
  role: 'assistant';
  sessionID: string;
  parentID: string;
  agent: string;
  mode: string;
  time: { created: number; completed?: number };
  finish?: FinishReason;
  error?: { message: string };
  parts: Part[];
};

export type Message = UserMessage | AssistantMessage;

export type SessionInfo = {
  id: string;
  agent: AgentInfo['name'];
  createdAt: number;
  updatedAt: number;
  summary?: string;
  title?: string;
};
