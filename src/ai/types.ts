export type PermissionAction = 'allow' | 'deny' | 'ask';

export type PermissionRule = {
  permission: string;
  pattern: string;
  action: PermissionAction;
};

export type PermissionRuleset = PermissionRule[];

export type PermissionAskPayload = {
  permission: string;
  pattern: string;
  metadata?: any;
  title?: string;
};

export type PermissionAskResult = 'allow' | 'deny';

export type AgentMode = 'subagent' | 'primary' | 'all';

export type AgentInfo = {
  name: string;
  description?: string;
  mode: AgentMode;
  native?: boolean;
  hidden?: boolean;
  topP?: number;
  temperature?: number;
  color?: string;
  permission: PermissionRuleset;
  model?: {
    modelID: string;
    providerID: string;
  };
  prompt?: string;
  options?: Record<string, any>;
  steps?: number;
};

export type AiModelMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  // OpenAI 兼容 tool role
  tool_call_id?: string;
  // deepseek-reasoner 兼容字段（为空也可）
  reasoning_content?: string;
  // OpenAI 兼容工具调用数组（仅 assistant role）
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: { name: string; arguments: string };
  }>;
};

export type AiToolFunctionDef = {
  name: string;
  description?: string;
  parameters: any;
};

export type AiTool = {
  id: string;
  function: AiToolFunctionDef;
  execute(args: any, ctx: AiToolContext): Promise<AiToolResult>;
};

export type AiToolContext = {
  sessionID: string;
  messageID: string;
  agent: string;
  step: number;
  callID?: string;
  abort?: AbortSignal;
  metadata(input: { title?: string; metadata?: any }): void;
  ask(input: {
    permission: string;
    patterns: string[];
    always?: string[];
    metadata?: any;
  }): Promise<void>;
};

export type AiToolResult = {
  title: string;
  metadata?: any;
  output: string; // 返回给 LLM 的文本（一般是 JSON string）
};

export type AiHost = {
  listDirectory(input: { path?: string }): Promise<any>;
  readFile(input: { path: string; maxChars?: number }): Promise<any>;
  writeFile(input: { path: string; newContent: string }): Promise<any>;
  glob?(input: { pattern: string; limit?: number }): Promise<any>;
  grep?(input: {
    query: string;
    filePattern?: string;
    limit?: number;
    maxFileSize?: number;
  }): Promise<any>;
  undo?(input?: { count?: number }): Promise<any>;
  task?(input: { agent: string; prompt: string }): Promise<any>;
};

export type RunAgentInput = {
  agent: AgentInfo;
  sessionID: string;
  messageID: string;
  // 已经构造好的模型消息（包含 system + history + last user）
  messages: AiModelMessage[];
  tools: AiTool[];
  host: AiHost;
  model?: string;
  temperature?: number;
  maxSteps?: number;
  abort?: AbortSignal;
  askPermission?: (payload: PermissionAskPayload) => Promise<PermissionAskResult>;
  onEvent?: (evt: {
    type: 'tool-call' | 'tool-result' | 'text';
    tool?: string;
    callID?: string;
    args?: any;
    pattern?: string;
    result?: any;
    text?: string;
    step: number;
  }) => void;
};
