/* eslint-disable no-underscore-dangle */
import {
  createApp, ref, onMounted, h, defineComponent,
} from 'vue';
import { getRootAppContext } from '@/common/app-context';
import DialogComponent from './dialog.vue';
import { DialogOptions, DialogInstance } from './type';

const createDialog = (options: DialogOptions) => {
  const wrapper = document.createElement('div');
  const visible = ref(false);
  const component = defineComponent({
    setup(props, { expose }) {
      const dialogOptions = ref(options);
      onMounted(() => {
        visible.value = true;
      });

      const update = (newOptions: DialogOptions) => {
        dialogOptions.value = {
          ...options,
          ...newOptions,
        };
      };

      expose({
        update,
      });

      return () => h(DialogComponent, {
        visible: visible.value,
        'onUpdate:visible': (value: boolean) => { visible.value = value; },
        ...dialogOptions.value,
      });
    },
  });
  const app = createApp(component);
  // 关键：Dialog 是一个独立 createApp()，默认不会继承主应用的 provide/inject
  // 这里把 dialog app 的 provides 挂到主 app 的 provides 原型链上，保证 requireInjection 可用
  const root = getRootAppContext();
  if (root && app && root._context.provides && root._context.components) {
    // 避免直接访问带下划线的私有属性，推荐方式是通过 app._context 进行扩展
    Object.setPrototypeOf(app._context.provides, root._context.provides);
    Object.assign(app._context.components, root._context.components);
  }
  const instance = app.mount(wrapper) as any;
  const { body } = document;
  body.appendChild(wrapper);
  const dialogNode: DialogInstance = {
    instance,
    update: (newOptions: DialogOptions) => {
      instance.update(newOptions);
    },
    show: () => {
      visible.value = true;
    },
    hide: () => {
      visible.value = false;
    },
    destroy: () => {
      visible.value = false;
      setTimeout(() => {
        app.unmount();
        if (wrapper.parentNode) {
          wrapper.parentNode.removeChild(wrapper);
        }
      }, 300);
    },
  };
  return dialogNode;
};

class Dialog {
  static show(options: DialogOptions): DialogInstance {
    return createDialog(options);
  }

  static close(instance: DialogInstance) {
    instance.destroy();
    return null;
  }
}

export default Dialog;
