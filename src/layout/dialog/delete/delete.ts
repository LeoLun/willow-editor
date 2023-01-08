import { h } from 'vue';
import Delete from './delete.vue';
import DialogBase from '../dialog-base';

export type PropsOptions = {
  fileName: string,
  onConfirm: () => void,
  onCancel: () => void
};

export default class DeleteDialog extends DialogBase<PropsOptions> {
  constructor(
    props: PropsOptions,
  ) {
    super('提示', props);
  }

  content = () => h(Delete, {
    ...this.props,
  });
}
