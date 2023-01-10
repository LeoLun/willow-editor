import type { CallBack } from './index.type';
import Rule from './rule';

export default class Router {
  prefix: string;

  rules: Array<Rule>;

  constructor({ prefix }: { prefix: string }) {
    this.prefix = prefix;
    this.rules = [];
  }

  handleEvent(event: FetchEvent) {
    const { url } = event.request;
    const callback = this.check(url);
    if (callback) {
      callback(event);
    }
  }

  get(rule: string, callback: CallBack) {
    this.rules.push(new Rule(
      rule,
      callback,
    ));
  }

  check(url: string): CallBack | null {
    let callback: CallBack | null = null;
    const { pathname } = new URL(url);
    if (!pathname.startsWith(this.prefix)) {
      return callback;
    }
    const path = pathname.replace(this.prefix, '');
    // 检测rules
    this.rules.forEach((rule) => {
      if (rule.check(path)) {
        callback = rule.callback;
      }
    });
    return callback;
  }
}
