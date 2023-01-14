import type { VNode } from 'vue';
import DialogService from '@/components/dialog/index';
import type { DialogInstance } from '@/components/dialog/type';

let instance: DialogInstance;

export default abstract class DialogBase<T> {
  props: T;

  constructor(props: T) {
    this.props = props;
  }

  open() {
    if (!instance) {
      instance = DialogService.show((
        {
          content: this.content,
        }
      ));
    } else {
      instance.update({
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
