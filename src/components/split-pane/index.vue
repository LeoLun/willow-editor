<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import Resizer from './resizer.vue';
import Pane from './pane.vue';

const props = defineProps({
  minPercent: {
    type: Number,
    default: 10,
  },
  defaultPercent: {
    type: Number,
    default: 50,
  },
  split: {
    type: String,
    validator(value: string) {
      return ['vertical', 'horizontal'].indexOf(value) >= 0;
    },
    required: true,
  },
  className: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['resize']);

const active = ref(false);
const hasMoved = ref(false);
// const height = ref(null);
const percent = ref(props.defaultPercent);
const type = ref(props.split === 'vertical' ? 'width' : 'height');
const resizeType = ref(props.split === 'vertical' ? 'left' : 'top');

watch(
  () => props.defaultPercent,
  (newValue) => {
    percent.value = newValue;
  },
);

const cursorStyle = computed(() => {
  const base = props.split === 'vertical' ? 'col-resize' : 'row-resize';
  const cursor = active.value ? base : '';

  const userSelect = active.value ? 'none' : '';

  return {
    [`${cursor}`]: userSelect,
  };
});

const onClick = () => {
  if (!hasMoved.value) {
    percent.value = 50;
    emit('resize', percent.value);
  }
};

const onMouseDown = () => {
  active.value = true;
  hasMoved.value = false;
};
const onMouseUp = () => {
  active.value = false;
};
const onMouseMove = (e: any) => {
  const { split, minPercent } = props;
  if (e.buttons === 0 || e.which === 0) {
    active.value = false;
  }

  if (active.value) {
    let offset = 0;
    let target = e.currentTarget;
    if (split === 'vertical') {
      while (target) {
        offset += target.offsetLeft;
        target = target.offsetParent;
      }
    } else {
      while (target) {
        offset += target.offsetTop;
        target = target.offsetParent;
      }
    }

    const currentPage = split === 'vertical' ? e.pageX : e.pageY;
    const targetOffset = split === 'vertical'
      ? e!.currentTarget.offsetWidth
      : e.currentTarget.offsetHeight;
    const percentNow = Math.floor(((currentPage - offset) / targetOffset) * 10000) / 100;

    if (percentNow > minPercent && percentNow < 100 - minPercent) {
      percent.value = percentNow;
    }

    emit('resize', percent.value);
    hasMoved.value = true;
  }
};
</script>

<template>
  <div
    :style="cursorStyle"
    class="vue-splitter-container clearfix"
    @mouseup="onMouseUp"
    @mousemove="onMouseMove"
  >
    <pane
      class="splitter-pane splitter-pane-l"
      :split="split"
      :style="{ [type]: percent + '%' }"
    >
      <slot name="pane-l" />
    </pane>

    <resizer
      :class-name="className"
      :style="{ [resizeType]: percent + '%' }"
      :split="split"
      @mousedown="onMouseDown"
      @click="onClick"
    />

    <pane
      class="splitter-pane splitter-pane-r"
      :split="split"
      :style="{ [type]: 100 - percent + '%' }"
    >
      <slot name="pane-r" />
    </pane>
    <div
      v-if="active"
      class="vue-splitter-container-mask"
    />
  </div>
</template>

<style lang="less" scoped>
.clearfix::after {
  visibility: hidden;
  display: block;
  font-size: 0;
  content: " ";
  clear: both;
  height: 0;
}

.vue-splitter-container {
  height: 100%;
  width: 100%;
  position: relative;
}

.vue-splitter-container-mask {
  z-index: 9999;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}
</style>
