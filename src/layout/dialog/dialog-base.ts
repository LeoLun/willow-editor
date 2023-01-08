import type { VNode } from 'vue';
import DialogService from '@/components/dialog/index';
import type { DialogInstance } from '@/components/dialog/type';

let instance: DialogInstance;

export default abstract class DialogBase<T> {
  title: string;

  props: T;

  constructor(title: string, props: T) {
    this.title = title;
    this.props = props;
  }

  open() {
    if (!instance) {
      instance = DialogService.show((
        {
          title: this.title,
          content: this.content,
        }
      ));
    } else {
      instance.update({
        title: this.title,
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
