import { ACTIONS } from '@/common/const';
import RenameDialog from './rename';
import type { PropsOptions as RenamePropsOptions } from './rename';

import DeleteDialog from './delete';
import type { PropsOptions as DeletePropsOptions } from './delete';

import CreateFileDialog from './create-file';
import type { PropsOptions as CreateFilePropsOptions } from './create-file';

import CreateDirectoryDialog from './create-directory';
import type { PropsOptions as CreateDirectoryPropsOptions } from './create-directory';

type RenameDialogType = {
  type: ACTIONS.RENAME,
  props: RenamePropsOptions
};

type DeleteDialogType = {
  type: ACTIONS.DELETE,
  props: DeletePropsOptions
};

type NewFileDialogType = {
  type: ACTIONS.CREATE_FILE,
  props: CreateFilePropsOptions
};

type NewDirectoryDialogType = {
  type: ACTIONS.CREATE_DIRECTORY,
  props: CreateDirectoryPropsOptions
};

type DialogType = RenameDialogType | DeleteDialogType | NewFileDialogType | NewDirectoryDialogType;

export default class DialogFactory {
  static create(type: DialogType) {
    if (type.type === ACTIONS.RENAME) {
      return new RenameDialog(type.props);
    }

    if (type.type === ACTIONS.DELETE) {
      return new DeleteDialog(type.props);
    }

    if (type.type === ACTIONS.CREATE_FILE) {
      return new CreateFileDialog(type.props);
    }

    if (type.type === ACTIONS.CREATE_DIRECTORY) {
      return new CreateDirectoryDialog(type.props);
    }

    throw new Error('Create dialog error');
  }
}
