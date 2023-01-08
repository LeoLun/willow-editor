import RenameDialog from './rename/rename';
import type { PropsOptions as RenamePropsOptions } from './rename/rename';
import DeleteDialog from './delete/delete';
import type { PropsOptions as DeletePropsOptions } from './delete/delete';

type RenameDialogType = {
  type: 'RENAME',
  props: RenamePropsOptions
};

type DeleteDialogType = {
  type: 'DELETE',
  props: DeletePropsOptions
};

type DialogType = RenameDialogType | DeleteDialogType;

export default class DialogFactory {
  static create(type: DialogType) {
    if (type.type === 'RENAME') {
      return new RenameDialog(type.props);
    }

    if (type.type === 'DELETE') {
      return new DeleteDialog(type.props);
    }

    throw new Error('Create dialog error');
  }
}
