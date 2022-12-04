<script setup lang="ts">
import {
  h, isVNode, useSlots, ref, nextTick,
} from 'vue';
import type { VNode } from 'vue';
import { useResizeObserver, useDebounceFn } from '@vueuse/core';
import panel from './tab-panel.vue';

const slots = useSlots();
const idx = ref(1);
const tabsContent = ref<HTMLElement>();
const scrollBarWidth = ref(0);
const scrollBarOfferX = ref(0);
const isDrag = ref(false);
const tabsContainer = ref(null);

let dragKey: string = '';
let sort: String[] = [];
let maxDragWith = 0;
let scrollWidth = 0;
let contentWidth = 0;
let startOfferX = 0;

const handleDragstart = (e: DragEvent, key: string) => {
  dragKey = key;
};

const handleDrop = (e: DragEvent, endKey: string) => {
  if (!dragKey) {
    return;
  }
  e.preventDefault();
  e.stopPropagation();
  const startIdx = sort.findIndex((item) => item === dragKey);
  if (endKey === 'last') {
    sort.splice(startIdx, 1);
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

const setScroll = (activeNode?: VNode | undefined) => {
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

    if (tabsContent.value && activeNode && activeNode.el) {
      activeNode.el.scrollIntoView();
      const { scrollLeft } = tabsContent.value;
      scrollBarOfferX.value = (scrollLeft / scrollWidth) * contentWidth;
    }
  });
};

const handleMousemove = (event: MouseEvent) => {
  let offerX = scrollBarOfferX.value + event.pageX - startOfferX;
  offerX = offerX < 0 ? 0 : offerX;
  offerX = offerX > maxDragWith ? maxDragWith : offerX;
  startOfferX = event.pageX;
  scrollBarOfferX.value = offerX;
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

const handleWheel = (event: WheelEvent) => {
  const { deltaX, deltaY } = event;
  let delta = 0;
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    delta = deltaX;
  } else {
    delta = deltaY;
  }

  if (tabsContent.value) {
    const { scrollLeft } = tabsContent.value;
    let offerX = scrollLeft - delta;
    offerX = offerX < 0 ? 0 : offerX;
    const maxWheelWidth = scrollWidth - contentWidth;
    offerX = offerX > maxWheelWidth ? maxWheelWidth : offerX;
    tabsContent.value.scrollLeft = offerX;
    scrollBarOfferX.value = (offerX / scrollWidth) * contentWidth;
  }
};

const root = () => {
  let activeNode;
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
              if (item.props.active) {
                activeNode = item;
              }
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

  setScroll(activeNode);

  return h('div', {
    ref: tabsContent,
    class: 'w-tabs-content',
  }, children);
};

const debouncedFn = useDebounceFn(() => {
  setScroll();
}, 50);

useResizeObserver(tabsContainer, () => {
  debouncedFn();
});

</script>

<template>
  <div
    ref="tabsContainer"
    class="w-tabs-container"
    :class="`${isDrag ? 'drag' : ''}`"
    @dragover="handleDragover"
    @drop="(e: DragEvent) => handleDrop(e, 'last')"
    @wheel="handleWheel"
  >
    <root :class="`${idx}`" />
    <div
      v-if="scrollBarWidth"
      class="w-tabs-scroll"
    >
      <div
        class="w-tabs-scrollbar"
        :style="`width:${scrollBarWidth}px;left:${scrollBarOfferX}px`"
        @mousedown="handleMousedown"
      />
    </div>
  </div>
</template>

<style lang="less">
.w-tabs-container {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 35px;

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
    height: 100%;
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
