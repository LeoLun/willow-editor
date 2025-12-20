/* eslint-disable import/extensions */
import { Action, Separator } from 'monaco-editor/esm/vs/base/common/actions.js';
import { Emitter } from 'monaco-editor/esm/vs/base/common/event.js';
import { ContextMenuHandler } from 'monaco-editor/esm/vs/platform/contextview/browser/contextMenuHandler.js';
import { ContextViewService } from 'monaco-editor/esm/vs/platform/contextview/browser/contextViewService.js';

type Anchor = {
  x: number,
  y: number
};

type ContentMenu = {
  showContextMenu: (anchor: Anchor, actions: Action[], opts?: {
    onHide?: (wasCancelled: boolean) => void;
  }) => void;
  dispose: () => void;
};

/**
 * 独立加载兜底：Monaco 的菜单/弹层样式大量依赖 `--vscode-*` 变量。
 * 当本模块被单独引入、且未加载应用的全局样式时，这些变量可能为空，导致菜单无颜色/无边框。
 *
 * 注意：只在变量缺失时注入，不覆盖外部主题。
 */
const ensureVscodeCssVars = (container: HTMLElement) => {
  const win = container.ownerDocument?.defaultView;
  if (!win) return;

  const computed = win.getComputedStyle(container);
  const getVar = (name: string) => computed.getPropertyValue(name)?.trim();

  // 以 menu-background 为哨兵：如果它不存在，通常其他 menu/widget 变量也不存在
  if (getVar('--vscode-menu-background')) return;

  const defaults: Record<string, string> = {
    '--vscode-menu-background': 'var(--w-black-2, #252526)',
    '--vscode-menu-foreground': 'var(--w-text-color2, #ccc)',
    '--vscode-menu-border': 'rgba(255, 255, 255, 0.12)',
    '--vscode-menu-separatorBackground': 'rgba(255, 255, 255, 0.12)',
    '--vscode-menu-selectionBackground': 'var(--w-primary-2, #094771)',
    '--vscode-menu-selectionForeground': 'var(--w-white, #fff)',
    '--vscode-menu-selectionBorder': 'transparent',
    '--vscode-disabledForeground': 'rgba(255, 255, 255, 0.4)',
    '--vscode-widget-shadow': 'rgba(0, 0, 0, 0.36)',
  };

  Object.entries(defaults).forEach(([k, v]) => {
    // 再次读取，避免 computed 缓存导致误判（以及避免并发调用时重复写入）
    const current = win.getComputedStyle(container).getPropertyValue(k)?.trim();
    if (!current) container.style.setProperty(k, v);
  });
};

/**
 * 创建一个“独立”的右键菜单实例：
 * - 不使用 `StandaloneServices.get(...)`（避免与 monaco-editor 全局单例共享状态）
 * - 拥有自己的 `ContextViewService`（绑定到传入 container）
 */
const createContentMenu = (container: HTMLElement): ContentMenu => {
  ensureVscodeCssVars(container);

  const disposables: Array<{ dispose: () => void }> = [];
  const addDisposable = <T extends { dispose: () => void }>(d: T): T => {
    disposables.push(d);
    return d;
  };

  // 只实现 ContextViewService/ContextMenuHandler 实际用到的最小布局能力
  const onDidLayoutContainerEmitter = addDisposable(new Emitter());

  const layoutService = {
    mainContainer: container,
    activeContainer: container,
    onDidLayoutContainer: onDidLayoutContainerEmitter.event,
    // 保持与 monaco 的判断逻辑一致：同 window 返回对应 container
    getContainer: (win: Window) => {
      const containerWin = container.ownerDocument?.defaultView;
      return win === containerWin ? container : container;
    },
  } as any;

  const contextViewService = new ContextViewService(layoutService);
  addDisposable(contextViewService);

  // 这里用最小 stub 服务即可：菜单本身不需要依赖 monaco 的全局 service 集合
  const telemetryService = { publicLog2: () => {} } as any;
  const notificationService = { error: (err: any) => console.error(err) } as any;
  const keybindingService = { lookupKeybinding: () => undefined } as any;

  const contextMenuHandler = new ContextMenuHandler(
    contextViewService,
    telemetryService,
    notificationService,
    keybindingService,
  );

  const showContextMenu = (
    anchor: Anchor,
    actions: Action[],
    opts?: { onHide?: (wasCancelled: boolean) => void },
  ) => {
    contextMenuHandler.showContextMenu({
      getAnchor: () => anchor,
      getActions: () => actions || [],
      // 返回 null 表示使用默认的 Menu 渲染项
      getActionViewItem: () => null,
      onHide: (wasCancelled?: boolean) => {
        opts?.onHide?.(!!wasCancelled);
      },
    } as any);
  };

  return {
    showContextMenu,
    dispose: () => {
      for (let i = disposables.length - 1; i >= 0; i -= 1) {
        disposables[i].dispose();
      }
    },
  };
};

// 默认导出行为：提供一个“模块内单例”的独立菜单（挂在 document.documentElement）
let defaultMenu: ContentMenu | null = null;
const showContextMenu = (
  anchor: Anchor,
  actions: Action[],
  opts?: { onHide?: (wasCancelled: boolean) => void },
) => {
  if (!defaultMenu) {
    defaultMenu = createContentMenu(document.documentElement);
  }
  defaultMenu.showContextMenu(anchor, actions, opts);
};

export {
  Action,
  Separator,
  createContentMenu,
  showContextMenu,
};
