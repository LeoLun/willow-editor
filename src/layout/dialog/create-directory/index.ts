import { h } from 'vue';
import DialogBase from '../dialog-base';
import CreateDirectory from './create-directory.vue';

export type PropsOptions = {
  fileName: string,
  onConfirm: (filename: string) => void,
  onCancel: () => void
};

export default class CreateDirectoryDialog extends DialogBase<PropsOptions> {
  content = () => h(CreateDirectory, {
    ...this.props,
  });
}
