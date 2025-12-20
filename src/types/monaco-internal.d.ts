declare module 'monaco-editor/esm/vs/platform/contextview/browser/contextMenuHandler.js' {
  export class ContextMenuHandler {
    constructor(
      contextViewService: any,
      telemetryService: any,
      notificationService: any,
      keybindingService: any,
    );
    configure(options: any): void;
    showContextMenu(delegate: any): void;
  }
}
