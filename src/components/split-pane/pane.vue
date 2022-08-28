<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps({
  split: {
    type: String,
    default: '',
  },
  className: {
    type: String,
    default: '',
  },
});

const classes = computed(() => {
  const { split, className } = props;
  return [split, className].join(' ');
});
</script>
<template>
  <div :class="classes">
    <slot />
  </div>
</template>
<style lang="less" scoped>
.splitter-pane {
  &.vertical {
    &.splitter-pane-l {
      position: absolute;
      left: 0;
      height: 100%;
      padding-right: 3px;
    }

    &.splitter-pane-r {
      position: absolute;
      right: 0;
      height: 100%;
      padding-left: 3px;
    }
  }

  &.horizontal {
    &.splitter-pane-l {
      position: absolute;
      top: 0;
      width: 100%;
    }

    &.splitter-pane-r {
      position: absolute;
      bottom: 0;
      width: 100%;
      padding-top: 3px;
    }
  }
}
</style>
