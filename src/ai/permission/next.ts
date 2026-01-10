import type { PermissionAction, PermissionRuleset } from '../types';

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function wildcardToRegExp(pattern: string) {
  // 支持 * 和 ? 的简单通配符
  const parts = pattern.split('*').map((p) => p.split('?').map(escapeRegExp).join('.'));
  const re = parts.join('.*');
  return new RegExp(`^${re}$`);
}

function match(pattern: string, value: string) {
  if (pattern === '*') return true;
  try {
    return wildcardToRegExp(pattern).test(value);
  } catch {
    return false;
  }
}

const PermissionNext = {
  decide(
    ruleset: PermissionRuleset,
    input: { permission: string; pattern: string },
  ): PermissionAction {
    const { permission, pattern } = input;
    const reversed = (ruleset || []).slice().reverse();
    const hit = reversed.find((r) => {
      const permOK = r.permission === permission || r.permission === '*';
      return permOK && match(r.pattern, pattern);
    });
    return hit?.action || 'allow';
  },

  async ask(ruleset: PermissionRuleset, input: {
    permission: string;
    patterns: string[];
    always?: string[];
    metadata?: any;
    // UI/宿主可以注入一个真正的询问实现；这里默认“自动允许”
    onAsk?: (payload: any) => Promise<'allow' | 'deny'>;
  }) {
    const { permission, patterns, onAsk } = input;
    return (patterns || []).reduce(async (prev, p) => {
      await prev;
      const action = PermissionNext.decide(ruleset, { permission, pattern: p });
      if (action === 'allow') return;
      if (action === 'deny') throw new Error(`权限被拒绝：${permission} ${p}`);
      if (!onAsk) return;
      const ans = await onAsk({ permission, pattern: p, metadata: input.metadata || {} });
      if (ans === 'deny') throw new Error(`权限被拒绝：${permission} ${p}`);
    }, Promise.resolve());
  },
};
export default PermissionNext;
