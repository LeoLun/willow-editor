/* eslint-disable class-methods-use-this */
// eslint-disable-next-line import/extensions
import { DefaultController } from './moncao-tree/treeDefaults.js';

export function getController() {
  return class Controller extends DefaultController {
    onContextMenu(tree: any, file: any, event: any) {
      console.log('tree', tree);
      console.log('file', file);
      console.log('event', event);
    }
  };
}

export function createController() {
  const Controller = getController();
  return new Controller();
}
