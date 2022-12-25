/* eslint-disable max-classes-per-file */
/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';

  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module 'virtual:sw-plugin' {
  // 声明一个变量，保存这个值的类型
  declare const registerSW: (dist: string, options?: object) => Promise<ServiceWorkerRegistration>;
  // 告诉 ts，这个模块默认导出的值就是这个 date 变量的类型
  export { registerSW };
}

declare module 'monaco-editor/esm/vs/platform/contextview/browser/contextMenuService.js' {
  declare const ContextMenuService: any;
  export { ContextMenuService };
}

declare module 'monaco-editor/esm/vs/platform/contextview/browser/contextViewService.js' {
  declare const ContextViewService: any;
  export { ContextViewService };
}

declare module 'monaco-editor/esm/vs/editor/standalone/browser/standaloneServices.js' {
  declare const StandaloneServices: any;
  export { StandaloneServices };
}
declare module 'monaco-editor/esm/vs/platform/contextview/browser/contextView.js' {
  declare const IContextViewService: any;
  export { IContextViewService };
}
declare module 'monaco-editor/esm/vs/platform/telemetry/common/telemetry.js' {
  declare const ITelemetryService: any;
  export { ITelemetryService };
}
declare module 'monaco-editor/esm/vs/platform/theme/common/themeService.js' {
  declare const IThemeService: any;
  export { IThemeService };
}
declare module 'monaco-editor/esm/vs/platform/keybinding/common/keybinding.js' {
  declare const IKeybindingService: any;
  export { IKeybindingService };
}
declare module 'monaco-editor/esm/vs/platform/notification/common/notification.js' {
  declare const INotificationService: any;
  export { INotificationService };
}
declare module 'monaco-editor/esm/vs/base/common/lifecycle.js' {
  declare const Disposable: any;
  export { Disposable };
}
declare module 'monaco-editor/esm/vs/base/common/event.js' {
  declare const Event: any;
  declare const Emitter: any;
  export { Event, Emitter };
}

declare module 'monaco-editor/esm/vs/base/common/actions.js' {
  declare class Action {
    constructor(id: string, label = '', cssClass = '', enabled = true, actionCallback);

    get id(): string;

    get label(): string;

    set label(value: string);

    get tooltip(): string;

    set tooltip(value: string);

    get class(): string;

    set class(value: string);
    get enabled(): boolean;

    set enabled(value: boolean);
    get checked(): boolean;

    set checked(value: boolean);
    run(event: any);
    dispose: () => {};
  }

  declare class Separator extends Action {
    constructor(label: string);
  }

  export { Action, Separator };
}

declare interface Window {
  showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>;
}
