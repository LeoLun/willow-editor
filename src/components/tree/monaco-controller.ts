/* eslint-disable no-alert */
/* eslint-disable class-methods-use-this */
// eslint-disable-next-line import/extensions
import { DefaultController } from './moncao-tree/treeDefaults.js';
import {
  CREATE_FILE, CREATE_DIRECTORY, RENAME, DELETE,
} from './actions';
import { Action, Separator, showContextMenu } from '../content-menu/index';

export function getController() {
  return class Controller extends DefaultController {
    onContextMenu(tree: any, file: any, event: any) {
      tree.setFocus(file);
      const actions = [];
      if (file.isDirectory) {
        actions.push(new Action(CREATE_FILE, '新建文件', '', true, () => {
          alert('新建文件-实现中');
        }));

        actions.push(new Separator(''));

        actions.push(new Action(CREATE_DIRECTORY, '新建文件夹', '', true, () => {
          alert('新建文件夹-实现中');
        }));
      }

      actions.push(new Action(RENAME, '重命名', '', true, () => {
        alert('重命名-实现中');
      }));

      actions.push(new Action(DELETE, '删除', '', true, () => {
        alert('删除-实现中');
      }));

      const anchorOffset = { x: 5, y: -5 };
      // eslint-disable-next-line no-underscore-dangle
      const anchor = { x: event._posx + anchorOffset.x, y: event._posy + anchorOffset.y };
      showContextMenu(anchor, actions);

      super.onContextMenu(tree, file, event);
    }
  };
}

export function createController() {
  const Controller = getController();
  return new Controller();
}
