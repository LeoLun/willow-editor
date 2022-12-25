import { createApp } from 'vue';
import ToastList from './toast-list.vue';
import type { Theme } from './type';

let instance: any = null;

const createToast = (props: { theme: Theme, msg: string, duration?: number }) => {
  const options = {
    ...props,
    duration: props.duration ?? 1500,
  };

  if (!instance) {
    const wrapper = document.createElement('div');
    instance = createApp(ToastList).mount(wrapper);
    const { body } = document;
    body.appendChild(wrapper);
  }

  if (instance) {
    instance.add(options);
  }

  return instance;
};

class Toast {
  static error(msg: string, duration?: number) {
    return createToast({
      theme: 'error',
      msg,
      duration,
    });
  }

  static info(msg: string, duration?: number) {
    return createToast({
      theme: 'info',
      msg,
      duration,
    });
  }

  static success(msg: string, duration?: number) {
    return createToast({
      theme: 'success',
      msg,
      duration,
    });
  }
}

export default Toast;
