import type { AiHost, AiTool } from '../types';

function notSupported(name: string) {
  return async () => ({
    ok: false,
    error: `宿主未实现该能力：${name}`,
  });
}

export default function createWillowTools(host: AiHost): AiTool[] {
  const globHost = host.glob || notSupported('glob');
  const grepHost = host.grep || notSupported('grep');
  const undoHost = host.undo || notSupported('undo');
  const taskHost = host.task || notSupported('task');

  const tools: AiTool[] = [
    {
      id: 'list_directory',
      function: {
        name: 'list_directory',
        description: '读取目录内容（只列出当前目录的子项）。path 为空表示根目录。',
        parameters: {
          type: 'object',
          properties: {
            path: { type: 'string', description: '相对路径，如 "src/layout"；为空表示根目录' },
          },
          required: [],
        },
      },
      async execute(args) {
        const out = await host.listDirectory({ path: args?.path });
        return {
          title: 'list_directory',
          metadata: out,
          output: JSON.stringify(out),
        };
      },
    },
    {
      id: 'glob',
      function: {
        name: 'glob',
        description: '按 glob 模式匹配文件路径，返回匹配到的文件列表（相对路径）。示例："src/**/*.ts"',
        parameters: {
          type: 'object',
          properties: {
            pattern: { type: 'string', description: 'glob 模式，如 "src/**/*.ts"' },
            limit: { type: 'number', description: '最多返回数量（默认 200）' },
          },
          required: ['pattern'],
        },
      },
      async execute(args) {
        const out = await globHost({ pattern: String(args?.pattern || ''), limit: args?.limit });
        return { title: 'glob', metadata: out, output: JSON.stringify(out) };
      },
    },
    {
      id: 'grep',
      function: {
        name: 'grep',
        description: '在项目文件中搜索文本（简单 grep）。建议配合 filePattern 限定范围，如 "**/*.vue"。',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: '要搜索的字符串（非正则）' },
            filePattern: { type: 'string', description: 'glob 限定文件，如 "**/*.{ts,vue}" 或 "src/**"' },
            limit: { type: 'number', description: '最多返回匹配条数（默认 200）' },
            maxFileSize: { type: 'number', description: '单文件最大扫描字节（默认 200000）' },
          },
          required: ['query'],
        },
      },
      async execute(args) {
        const out = await grepHost({
          query: String(args?.query || ''),
          filePattern: args?.filePattern ? String(args.filePattern) : undefined,
          limit: args?.limit,
          maxFileSize: args?.maxFileSize,
        });
        return { title: 'grep', metadata: out, output: JSON.stringify(out) };
      },
    },
    {
      id: 'read_file',
      function: {
        name: 'read_file',
        description: '读取文本文件内容。图片/二进制会返回提示。path 为空则报错。',
        parameters: {
          type: 'object',
          properties: {
            path: { type: 'string', description: '相对路径，如 "src/app.vue"' },
            maxChars: { type: 'number', description: '最大返回字符数（默认 8000）' },
          },
          required: ['path'],
        },
      },
      async execute(args) {
        const out = await host.readFile({ path: String(args?.path || ''), maxChars: args?.maxChars });
        return {
          title: 'read_file',
          metadata: out,
          output: JSON.stringify(out),
        };
      },
    },
    {
      id: 'write_file',
      function: {
        name: 'write_file',
        description: '暂存文件修改/创建：不会立刻写入磁盘。所有修改会在本轮任务结束后统一列出文件列表预览，由用户一次性确认后再应用。',
        parameters: {
          type: 'object',
          properties: {
            path: { type: 'string', description: '相对路径，如 "src/style.less"' },
            newContent: { type: 'string', description: '完整的新文件内容' },
          },
          required: ['path', 'newContent'],
        },
      },
      async execute(args) {
        const out = await host.writeFile({ path: String(args?.path || ''), newContent: String(args?.newContent ?? '') });
        return {
          title: 'write_file',
          metadata: out,
          output: JSON.stringify(out),
        };
      },
    },
    {
      id: 'undo',
      function: {
        name: 'undo',
        description: '撤销最近一次（或多次）AI 写入操作（如果宿主支持）。',
        parameters: {
          type: 'object',
          properties: {
            count: { type: 'number', description: '撤销次数（默认 1）' },
          },
          required: [],
        },
      },
      async execute(args) {
        const out = await undoHost({ count: args?.count });
        return { title: 'undo', metadata: out, output: JSON.stringify(out) };
      },
    },
    {
      id: 'task',
      function: {
        name: 'task',
        description: '执行一个子任务/子 Agent（适合只读探索、总结等）。返回子任务的文本结果。',
        parameters: {
          type: 'object',
          properties: {
            agent: { type: 'string', description: '子 agent 名称，如 "explore"' },
            prompt: { type: 'string', description: '子任务描述/问题' },
          },
          required: ['agent', 'prompt'],
        },
      },
      async execute(args) {
        const agentName = String(args?.agent || '').trim() || 'explore';
        const prompt = String(args?.prompt || '').trim();
        if (!prompt) {
          const out = { ok: false, error: 'prompt 不能为空' };
          return { title: 'task', metadata: out, output: JSON.stringify(out) };
        }
        const out = await taskHost({ agent: agentName, prompt });
        return { title: `task:${agentName}`, metadata: out, output: JSON.stringify(out) };
      },
    },
  ];
  return tools;
}
