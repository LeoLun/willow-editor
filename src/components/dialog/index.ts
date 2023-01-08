import {
  createApp, ref, onMounted, h, defineComponent,
} from 'vue';
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
        console.log('update', newOptions);
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
  const instance = app.mount(wrapper) as any;
  const { body } = document;
  body.appendChild(wrapper);
  const dialogNode: DialogInstance = {
    instance,
    update: (newOptions: DialogOptions) => {
      console.log('instance', instance);
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
    console.log('instance', instance);
    instance.destroy();
    return null;
  }
}

export default Dialog;
