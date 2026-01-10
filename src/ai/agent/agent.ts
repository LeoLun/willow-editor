import type { AgentInfo } from '../types';

const Agents = {
  build(): AgentInfo {
    return {
      name: 'build',
      description: '主要构建/开发 agent（可使用工具读写项目文件）',
      mode: 'primary',
      native: true,
      permission: [
        // 默认允许读取/搜索；write_file 仅暂存，最终仍需在“AI 修改预览”里确认应用
        { permission: '*', pattern: '*', action: 'allow' },
      ],
      temperature: 0.2,
      steps: 20,
    };
  },

  explore(): AgentInfo {
    return {
      name: 'explore',
      description: '只读探索 agent（用于查找/理解代码）',
      mode: 'subagent',
      native: true,
      permission: [
        { permission: '*', pattern: '*', action: 'deny' },
        { permission: 'list_directory', pattern: '*', action: 'allow' },
        { permission: 'read_file', pattern: '*', action: 'allow' },
      ],
      temperature: 0.1,
      steps: 12,
    };
  },
};

export default Agents;
