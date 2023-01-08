import { h } from 'vue';
import DialogBase from '../dialog-base';
import Rename from './rename.vue';

export type PropsOptions = {
  fileName: string,
  onConfirm: Function,
  onCancel: () => void
};

export default class RenameDialog extends DialogBase<PropsOptions> {
  constructor(
    props: PropsOptions,
  ) {
    super('提示', props);
  }

  content = () => h(Rename, {
    ...this.props,
  });
}
