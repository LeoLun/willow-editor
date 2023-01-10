import type { CallBack } from './index.type';

export default class Rule {
  rule: string;

  callback: CallBack;

  constructor(rule: string, callback: CallBack) {
    this.rule = rule;
    this.callback = callback;
  }

  check(path: string) {
    // 判断 URL 是否符合 rule 规则
    return path.startsWith(this.rule);
  }
}
