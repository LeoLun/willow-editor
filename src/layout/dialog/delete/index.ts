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
    console.log('props', props);
    super(props);
  }

  content = () => h(Delete, {
    ...this.props,
  });
}
