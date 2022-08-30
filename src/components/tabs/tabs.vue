<template>
  <root />
</template>

<script setup lang="ts">
import {
  h, isVNode, useSlots, ref,
} from 'vue';
import type { VNode } from 'vue';
import panel from './tab-panel.vue';

let dragKey: string = '';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
});
console.log('props', props);
const slots = useSlots();

let sort: String[] = [];
// const sort: Ref<String[]> = ref([]);
const idx = ref(1);

const handleDragstart = (e: DragEvent, key: string) => {
  dragKey = key;
};

const handleDrop = (e: DragEvent, endKey: string) => {
  if (!dragKey) {
    return;
  }
  e.preventDefault();
  const startIdx = sort.findIndex((item) => item === dragKey);
  if (endKey === 'last') {
    // 直接放到最后面
    sort.push(dragKey);
  } else {
    const endIdx = sort.findIndex((item) => item === endKey);
    sort.splice(startIdx, 1);
    const endIdx2 = sort.findIndex((item) => item === endKey);
    if (startIdx > endIdx) {
      // 放到 endIndex 前面
      if (endIdx2 === 0) {
        sort.unshift(dragKey);
      } else {
        sort.splice(endIdx2, 0, dragKey);
      }
    } else {
      // 放到 endIndex 后面
      sort.splice(endIdx2 + 1, 0, dragKey);
    }
  }

  idx.value += 1;
};

const handleDragover = (e: DragEvent) => {
  e.preventDefault();
};

const root = () => {
  let children: VNode[] = [];
  if (slots.default) {
    const slotsDefault = slots.default();
    if (slotsDefault.length === 1) {
      const tabs = slotsDefault[0].children;
      if (tabs && Array.isArray(tabs)) {
        const keyList: String[] = [];
        // 记录所有的节点
        tabs.forEach((item) => {
          if (!Array.isArray(item) && isVNode(item) && item.type === panel) {
            if (item.props) {
              // eslint-disable-next-line no-param-reassign
              item.props.draggable = 'true';
              // eslint-disable-next-line no-param-reassign
              item.props.ondragstart = (e: DragEvent) => {
                handleDragstart(e, item.key as string);
              };
              // eslint-disable-next-line no-param-reassign
              item.props.ondragover = (e: DragEvent) => {
                handleDragover(e);
              };
              // eslint-disable-next-line no-param-reassign
              item.props.ondrop = (e: DragEvent) => {
                handleDrop(e, item.key as string);
              };
            }
            if (!sort.includes(item.key as string)) {
              sort.push(item.key as string);
            }
            keyList.push(item.key as string);
          } else {
            throw new Error('must be tap-panel component');
          }
        });
        sort = sort.filter((ite) => keyList.includes(ite));
        tabs.sort((a, b) => {
          if (isVNode(a) && isVNode(b)) {
            return sort.findIndex((s) => s === a.key)
            - sort.findIndex((s) => s === b.key);
          }
          return 0;
        });
      }
    }
    children = slotsDefault;
  }

  return h(
    'div',
    {
      class: `w-tabs-container ${idx.value}`,
      ondragover: handleDragover,
      ondrop: (e: DragEvent) => handleDrop(e, 'last'),
    },
    children,
  );
};

</script>

<style lang="less">
.w-tabs-container {
  display: flex;
  flex-direction: row;
  min-height: 35px;
  background-color: rgb(37 37 38);
}
</style>
