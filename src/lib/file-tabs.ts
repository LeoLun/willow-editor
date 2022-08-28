import { ref } from 'vue';
import { TreeEntity } from '@/entity/index';

export default () => {
  const tabs = ref<TreeEntity[]>([]);

  const addTab = (file: TreeEntity) => {
    const hasTab = tabs.value.some((item) => item.key === file.key);

    if (hasTab) {
      return;
    }

    tabs.value.push(file);
  };

  const removeTab = (file: TreeEntity) => {
    const index = tabs.value.findIndex((item) => item.key === file.key);
    if (index !== -1) {
      tabs.value.splice(index, 1);
    }
  };

  return {
    tabs,
    addTab,
    removeTab,
  };
};
