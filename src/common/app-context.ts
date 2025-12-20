import type { App } from 'vue';

let rootApp: App | null = null;

export function setRootAppContext(app: App) {
  rootApp = app;
}

export function getRootAppContext() {
  return rootApp;
}
