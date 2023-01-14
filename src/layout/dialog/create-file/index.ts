import { h } from 'vue';
import DialogBase from '../dialog-base';
import CreateFile from './create-file.vue';

export type PropsOptions = {
  fileName: string,
  onConfirm: (filename: string) => void,
  onCancel: () => void
};

export default class CreateFileDialog extends DialogBase<PropsOptions> {
  content = () => h(CreateFile, {
    ...this.props,
  });
}
