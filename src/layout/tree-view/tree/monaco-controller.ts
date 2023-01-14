/* eslint-disable import/extensions */
/* eslint-disable no-param-reassign */
/* eslint-disable no-alert */
/* eslint-disable class-methods-use-this */
import { TreeEntity, DirTreeEntity } from '@/entity/index';
import { Action, Separator, showContextMenu } from '@/layout/content-menu/index';
import { ACTIONS } from '@/common/const';
import { DefaultController } from './moncao-tree/treeDefaults.js';

export function getController(
  onEvent: (type: ACTIONS, file: TreeEntity) => void,
) {
  return class Controller extends DefaultController {
    onContextMenu(tree: any, file: TreeEntity, event: any) {
      tree.setFocus(file);
      const actions = [];
      if (DirTreeEntity.isDirectory(file)) {
        actions.push(new Action(ACTIONS.CREATE_FILE, '新建文件', '', true, () => {
          onEvent(ACTIONS.CREATE_FILE, file);
        }));

        actions.push(new Action(ACTIONS.CREATE_DIRECTORY, '新建文件夹', '', true, () => {
          onEvent(ACTIONS.CREATE_DIRECTORY, file);
        }));

        actions.push(new Separator(''));
      }

      if (file.suffix === '.html') {
        actions.push(new Action(ACTIONS.OPEN_WISH_LIVE_SERVER, '用在线服务器打开', '', true, () => {
          onEvent(ACTIONS.OPEN_WISH_LIVE_SERVER, file);
        }));
      }

      actions.push(new Action(ACTIONS.RENAME, '重命名', '', true, () => {
        onEvent(ACTIONS.RENAME, file);
      }));

      actions.push(new Action(ACTIONS.DELETE, '删除', '', true, () => {
        onEvent(ACTIONS.DELETE, file);
      }));

      const anchorOffset = { x: 5, y: -5 };
      // eslint-disable-next-line no-underscore-dangle
      const anchor = { x: event._posx + anchorOffset.x, y: event._posy + anchorOffset.y };
      showContextMenu(anchor, actions);

      super.onContextMenu(tree, file, event);
    }
  };
}

export function createController(
  onEvent: (type: ACTIONS, file: TreeEntity) => void,
) {
  const Controller = getController(onEvent);
  return new Controller();
}
