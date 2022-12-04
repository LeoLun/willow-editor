/* eslint-disable import/extensions */
/* eslint-disable no-param-reassign */
/* eslint-disable no-alert */
/* eslint-disable class-methods-use-this */
import { TreeEntity, DirTreeEntity } from '@/entity/index';
import { Action, Separator, showContextMenu } from '@/views/content-menu/index';
import { DefaultController } from './moncao-tree/treeDefaults.js';
import ACTIONS from './actions';

export function getController(
  onEvent: (type: ACTIONS, file: TreeEntity) => void,
) {
  return class Controller extends DefaultController {
    onContextMenu(tree: any, file: TreeEntity, event: any) {
      tree.setFocus(file);
      const actions = [];
      if (DirTreeEntity.isDirectory(file)) {
        actions.push(new Action(ACTIONS.CREATE_FILE, '新建文件', '', true, () => {
          alert('新建文件-实现中');
        }));

        actions.push(new Action(ACTIONS.CREATE_DIRECTORY, '新建文件夹', '', true, () => {
          alert('新建文件夹-实现中');
        }));

        actions.push(new Separator(''));
      }

      actions.push(new Action(ACTIONS.RENAME, '重命名', '', true, () => {
        onEvent(ACTIONS.RENAME, file);
      }));

      actions.push(new Action(ACTIONS.DELETE, '删除', '', true, () => {
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

export function createController(
  onEvent: (type: ACTIONS, file: TreeEntity) => void,
) {
  const Controller = getController(onEvent);
  return new Controller();
}
