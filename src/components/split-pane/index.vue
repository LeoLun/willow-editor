<script lang="ts" setup>
import {
  ref, computed, watch, onMounted, onBeforeUnmount, type CSSProperties,
} from 'vue';
import Resizer from './resizer.vue';
import Pane from './pane.vue';

const props = defineProps({
  three: {
    type: Boolean,
    default: false,
  },
  minPercent: {
    type: Number,
    default: 10,
  },
  maxPercent: {
    type: Number,
    default: undefined,
  },
  // 三栏模式下第二条分割线的最大百分比（默认按 minPercent 计算）
  maxPercent2: {
    type: Number,
    default: undefined,
  },
  defaultPercent: {
    type: Number,
    default: 50,
  },
  // 三栏模式：两条分割线位置 [leftEnd, middleEnd]，单位：百分比
  defaultPercents: {
    type: Array as unknown as () => number[],
    default: undefined,
  },
  // 三栏模式：右侧面板默认宽度（px）。会在容器尺寸可用时换算成 middleEnd 百分比。
  defaultRightPx: {
    type: Number,
    default: undefined,
  },
  // 三栏模式：右侧面板最小/最大宽度（px），用于在拖拽时硬性限制
  minRightPx: {
    type: Number,
    default: undefined,
  },
  maxRightPx: {
    type: Number,
    default: undefined,
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

const containerRef = ref<HTMLElement | null>(null);
const active = ref(false);
const hasMoved = ref(false);

const activeResizer = ref<'first' | 'second'>('first');

const containerPx = ref<number>(0);
let ro: ResizeObserver | null = null;

const percent = ref(props.defaultPercent);

const percentA = ref<number>(
  Array.isArray(props.defaultPercents)
    ? Number(props.defaultPercents[0])
    : props.defaultPercent,
);

const percentB = ref<number>(
  Array.isArray(props.defaultPercents)
    ? Number(props.defaultPercents[1])
    : 80,
);

const type = ref(props.split === 'vertical' ? 'width' : 'height');
const resizeType = ref(props.split === 'vertical' ? 'left' : 'top');
const middlePosType = ref(props.split === 'vertical' ? 'left' : 'top');

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const getMinMax = () => {
  const min = clamp(Number(props.minPercent) || 0, 0, 99);
  const maxByOtherPane = 100 - min;
  const providedMax = typeof props.maxPercent === 'number' ? props.maxPercent : maxByOtherPane;
  const max = clamp(providedMax, min, maxByOtherPane);
  return { min, max };
};

const isThree = computed(() => !!props.three);

const normalizeThreePercents = (nextA: number, nextB: number) => {
  const min = clamp(Number(props.minPercent) || 0, 0, 33);
  const maxAByLayout = 100 - 2 * min;
  const maxA = clamp(typeof props.maxPercent === 'number' ? props.maxPercent : maxAByLayout, min, maxAByLayout);

  const a = clamp(nextA, min, maxA);

  // 右侧按 px 约束（如果给了的话）
  const minRightPercent = (typeof props.minRightPx === 'number' && containerPx.value > 0)
    ? (props.minRightPx / containerPx.value) * 100
    : min;
  const maxRightPercent = (typeof props.maxRightPx === 'number' && containerPx.value > 0)
    ? (props.maxRightPx / containerPx.value) * 100
    : 100;

  // middleEnd(b) 的上限：保证右侧 >= minRightPercent
  const maxBByLayout = 100 - clamp(minRightPercent, 0, 99);
  // middleEnd(b) 的下限：保证右侧 <= maxRightPercent（即 b >= 100 - maxRightPercent）
  const minBByRightMax = 100 - clamp(maxRightPercent, 1, 100);

  const providedMaxB = typeof props.maxPercent2 === 'number' ? props.maxPercent2 : maxBByLayout;
  const maxB = clamp(providedMaxB, a + min, maxBByLayout);
  const bMin = Math.max(a + min, minBByRightMax);
  const b = clamp(nextB, bMin, maxB);

  return { a, b };
};

watch(
  () => props.defaultPercent,
  (newValue) => {
    const { min, max } = getMinMax();
    percent.value = clamp(newValue, min, max);
  },
);

watch(
  () => props.defaultPercents,
  (arr) => {
    if (!Array.isArray(arr) || arr.length < 2) return;
    const { a, b } = normalizeThreePercents(Number(arr[0]), Number(arr[1]));
    percentA.value = a;
    percentB.value = b;
  },
);

const cursorStyle = computed<CSSProperties>(() => {
  if (!active.value) return {};
  const cursor: CSSProperties['cursor'] = props.split === 'vertical' ? 'col-resize' : 'row-resize';
  return { cursor, userSelect: 'none' };
});

const onClick = () => {
  if (!hasMoved.value) {
    if (!isThree.value) {
      const { min, max } = getMinMax();
      percent.value = clamp(50, min, max);
      emit('resize', percent.value);
      return;
    }
    const defaults = Array.isArray(props.defaultPercents) && props.defaultPercents.length >= 2
      ? { a: Number(props.defaultPercents[0]), b: Number(props.defaultPercents[1]) }
      : { a: 20, b: 80 };
    const { a, b } = normalizeThreePercents(defaults.a, defaults.b);
    percentA.value = a;
    percentB.value = b;
    emit('resize', {
      split: props.split,
      leftEnd: percentA.value,
      middleEnd: percentB.value,
      leftPercent: percentA.value,
      middlePercent: percentB.value - percentA.value,
      rightPercent: 100 - percentB.value,
      containerPx: containerPx.value,
    });
  }
};

const onMouseDown = (which: 'first' | 'second' = 'first') => {
  active.value = true;
  hasMoved.value = false;
  activeResizer.value = which;
};
const onMouseUp = () => {
  active.value = false;
};
const onMouseMove = (e: any) => {
  const { split } = props;
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

    if (!isThree.value) {
      const { min, max } = getMinMax();
      percent.value = clamp(percentNow, min, max);
      emit('resize', percent.value);
    } else if (activeResizer.value === 'second') {
      const { a, b } = normalizeThreePercents(percentA.value, percentNow);
      percentA.value = a;
      percentB.value = b;
      emit('resize', {
        split: props.split,
        leftEnd: percentA.value,
        middleEnd: percentB.value,
        leftPercent: percentA.value,
        middlePercent: percentB.value - percentA.value,
        rightPercent: 100 - percentB.value,
        containerPx: containerPx.value,
      });
    } else {
      const { a, b } = normalizeThreePercents(percentNow, percentB.value);
      percentA.value = a;
      percentB.value = b;
      emit('resize', {
        split: props.split,
        leftEnd: percentA.value,
        middleEnd: percentB.value,
        leftPercent: percentA.value,
        middlePercent: percentB.value - percentA.value,
        rightPercent: 100 - percentB.value,
        containerPx: containerPx.value,
      });
    }
    hasMoved.value = true;
  }
};

const applyDefaultRightPxIfNeeded = () => {
  if (!isThree.value) return;
  if (typeof props.defaultRightPx !== 'number') return;
  if (!containerPx.value) return;
  const rightPercent = (props.defaultRightPx / containerPx.value) * 100;
  const targetMiddleEnd = 100 - rightPercent;
  const { a, b } = normalizeThreePercents(percentA.value, targetMiddleEnd);
  percentA.value = a;
  percentB.value = b;
};

watch(
  () => props.defaultRightPx,
  () => applyDefaultRightPxIfNeeded(),
);

onMounted(() => {
  const el = containerRef.value;
  if (!el) return;
  const update = () => {
    containerPx.value = props.split === 'vertical' ? el.clientWidth : el.clientHeight;
    applyDefaultRightPxIfNeeded();
  };
  update();
  ro = new ResizeObserver(() => update());
  ro.observe(el);
});

onBeforeUnmount(() => {
  ro?.disconnect();
  ro = null;
});
</script>

<template>
  <div
    ref="containerRef"
    :style="cursorStyle"
    class="vue-splitter-container clearfix"
    @mouseup="onMouseUp"
    @mousemove="onMouseMove"
  >
    <template v-if="!isThree">
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
        @mousedown="onMouseDown('first')"
        @click="onClick"
      />

      <pane
        class="splitter-pane splitter-pane-r"
        :split="split"
        :style="{ [type]: 100 - percent + '%' }"
      >
        <slot name="pane-r" />
      </pane>
    </template>

    <template v-else>
      <pane
        class="splitter-pane splitter-pane-l"
        :split="split"
        :style="{ [type]: percentA + '%' }"
      >
        <slot name="pane-l" />
      </pane>

      <resizer
        :class-name="className"
        :style="{ [resizeType]: percentA + '%' }"
        :split="split"
        @mousedown="onMouseDown('first')"
        @click="onClick"
      />

      <pane
        class="splitter-pane splitter-pane-m"
        :split="split"
        :style="{ [middlePosType]: percentA + '%', [type]: (percentB - percentA) + '%' }"
      >
        <slot name="pane-m" />
      </pane>

      <resizer
        :class-name="className"
        :style="{ [resizeType]: percentB + '%' }"
        :split="split"
        @mousedown="onMouseDown('second')"
        @click="onClick"
      />

      <pane
        class="splitter-pane splitter-pane-r"
        :split="split"
        :style="{ [type]: 100 - percentB + '%' }"
      >
        <slot name="pane-r" />
      </pane>
    </template>
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
