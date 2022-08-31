<template>
  <root />
</template>

<script setup lang="ts">
import {
  h, isVNode, useSlots, ref, nextTick,
} from 'vue';
import type { VNode } from 'vue';
import panel from './tab-panel.vue';

let dragKey: string = '';

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

const tabsContent = ref<HTMLElement>();
const scrollBarWidth = ref(0);
const scrollBarOfferX = ref(0);
const isDrag = ref(false);
let maxDragWith = 0;
let scrollWidth = 0;
let contentWidth = 0;

const setScroll = () => {
  nextTick(() => {
    const content = tabsContent.value as HTMLElement;
    const contentRect = content.getBoundingClientRect();
    contentWidth = contentRect.width;
    scrollWidth = 0;
    // 获取总长度
    [].forEach.call(content.children, (item: HTMLElement) => {
      const rect = item.getBoundingClientRect();
      scrollWidth += rect.width;
    });
    // 计算进度条宽度
    if (scrollWidth > contentWidth) {
      const width = contentWidth * (contentWidth / scrollWidth);
      if (scrollBarWidth.value !== width) {
        scrollBarWidth.value = width;
        maxDragWith = contentWidth - width;
      }
    } else if (scrollBarWidth.value !== 0) {
      scrollBarWidth.value = 0;
      maxDragWith = 0;
    }
  });
};

let startOfferX = 0;

const handleMousemove = (event: MouseEvent) => {
  let offerX = scrollBarOfferX.value + event.pageX - startOfferX;
  offerX = offerX < 0 ? 0 : offerX;
  offerX = offerX > maxDragWith ? maxDragWith : offerX;
  scrollBarOfferX.value = offerX;
  startOfferX = event.pageX;
  if (tabsContent.value) {
    tabsContent.value.scrollLeft = (scrollBarOfferX.value / contentWidth) * scrollWidth;
  }
};

const handleMouseup = (event: MouseEvent) => {
  isDrag.value = false;
  if (event.target) {
    document.removeEventListener('mousemove', handleMousemove);
    document.removeEventListener('mouseup', handleMouseup);
  }
  document.onselectstart = () => null;
};

const handleMousedown = (event: MouseEvent) => {
  isDrag.value = true;
  if (event.target) {
    startOfferX = event.pageX;
    document.addEventListener('mousemove', handleMousemove);
    document.addEventListener('mouseup', handleMouseup);
  }
  document.onselectstart = () => false;
};

const root = () => {
  console.log('root');
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

  const content = [h('div', {
    ref: tabsContent,
    class: 'w-tabs-content',
  }, children)];

  if (scrollBarWidth.value) {
    content.push(h('div', {
      class: 'w-tabs-scroll',
    }, [
      h('div', {
        class: 'w-tabs-scrollbar',
        style: `width:${scrollBarWidth.value}px;left:${scrollBarOfferX.value}px`,
        onMousedown: handleMousedown,
      }),
    ]));
  }

  setScroll();

  return h(
    'div',
    {
      class: `w-tabs-container ${idx.value} ${isDrag.value ? 'drag' : ''}`,
      ondragover: handleDragover,
      ondrop: (e: DragEvent) => handleDrop(e, 'last'),
    },
    content,
  );
};
</script>

<style lang="less">
.w-tabs-container {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 35px;
  background-color: rgb(37 37 38);

  &.drag {
    .w-tabs-content {
      pointer-events: none;
    }

    .w-tabs-scrollbar {
      opacity: 1 !important;
      background: rgb(191 191 191 / 40%);
    }
  }

  &:hover {
    .w-tabs-scrollbar {
      opacity: 1;
    }
  }

  .w-tabs-content {
    display: flex;
    flex-direction: row;
    width: 100%;
    overflow: hidden;
  }

  .w-tabs-scroll {
    position: absolute;
    width: 100%;
    bottom: 0;
    height: 3px;
    z-index: 1;
  }

  .w-tabs-scrollbar {
    position: absolute;
    height: 100%;
    cursor: auto;
    background: rgb(121 121 121 / 40%);
    opacity: 0;
    transition: opacity 500ms;

    &:active {
      background: rgb(191 191 191 / 40%);
    }
  }
}
</style>
