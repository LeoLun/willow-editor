import { h } from 'vue';
import DialogBase from '../dialog-base';
import Rename from './rename.vue';

export type PropsOptions = {
  fileName: string,
  onConfirm: (filename: string) => void,
  onCancel: () => void
};

export default class RenameDialog extends DialogBase<PropsOptions> {
  content = () => h(Rename, {
    ...this.props,
  });
}
