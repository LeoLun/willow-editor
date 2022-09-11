/* eslint-disable import/extensions */
import { ContextMenuService } from 'monaco-editor/esm/vs/platform/contextview/browser/contextMenuService.js';
import { StandaloneServices } from 'monaco-editor/esm/vs/editor/standalone/browser/standaloneServices.js';
import { IContextViewService } from 'monaco-editor/esm/vs/platform/contextview/browser/contextView.js';
import { ITelemetryService } from 'monaco-editor/esm/vs/platform/telemetry/common/telemetry.js';
import { IThemeService } from 'monaco-editor/esm/vs/platform/theme/common/themeService.js';
import { IKeybindingService } from 'monaco-editor/esm/vs/platform/keybinding/common/keybinding.js';
import { INotificationService } from 'monaco-editor/esm/vs/platform/notification/common/notification.js';
import { Action, Separator } from 'monaco-editor/esm/vs/base/common/actions.js';

type Anchor = {
  x: number,
  y: number
};

const telemetryService = StandaloneServices.get(ITelemetryService);
const notificationService = StandaloneServices.get(INotificationService);
const contextViewService = StandaloneServices.get(IContextViewService);
const keybindingService = StandaloneServices.get(IKeybindingService);
const themeService = StandaloneServices.get(IThemeService);
themeService.setTheme('vs-dark');

contextViewService.contextView.setContainer(document.documentElement, 1);

const contextMenuService = new ContextMenuService(
  telemetryService,
  notificationService,
  contextViewService,
  keybindingService,
  themeService,
);

const showContextMenu = (anchor: Anchor, actions: Action[]) => {
  contextMenuService.showContextMenu({
    getAnchor: () => anchor,
    getActions: () => actions || [],
    getActionItem: (action: Action) => {
      console.log('action', action);
      return null;
    },
    onHide: (wasCancelled: any) => {
      console.log('wasCancelled', wasCancelled);
    },
  });
};

export {
  Action,
  Separator,
  showContextMenu,
};
