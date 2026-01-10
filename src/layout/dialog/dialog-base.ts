import type { VNode } from 'vue';
import DialogService from '@/components/dialog/index';
import type { DialogInstance } from '@/components/dialog/type';

let instance: DialogInstance;

export default abstract class DialogBase<T> {
  props: T;

  dialogOptions?: Record<string, any>;

  constructor(props: T, dialogOptions?: Record<string, any>) {
    this.props = props;
    this.dialogOptions = dialogOptions;
  }

  open() {
    if (!instance) {
      instance = DialogService.show((
        {
          ...(this.dialogOptions || {}),
          content: this.content,
        }
      ));
    } else {
      instance.update({
        ...(this.dialogOptions || {}),
        content: this.content,
      });
      instance.show();
    }
  }

  // eslint-disable-next-line class-methods-use-this
  close() {
    instance.hide();
  }

  abstract content(): VNode;
}
