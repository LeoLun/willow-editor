<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps({
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

const classes = computed(() => {
  const { split, className } = props;
  return ['splitter-pane-resizer', split, className].join(' ');
});

</script>

<template>
  <div :class="classes" />
</template>

<style scoped>
.splitter-pane-resizer {
  box-sizing: border-box;
  background: #000;
  position: absolute;
  opacity: 0.2;
  z-index: 1;
  background-clip: padding-box;
}

.splitter-pane-resizer.horizontal {
  height: 11px;
  margin: -5px 0;
  border-top: 5px solid rgb(255 255 255 / 0%);
  border-bottom: 5px solid rgb(255 255 255 / 0%);
  cursor: row-resize;
  width: 100%;
}

.splitter-pane-resizer.vertical {
  width: 11px;
  height: 100%;
  margin-left: -5px;
  border-left: 5px solid rgb(255 255 255 / 0%);
  border-right: 5px solid rgb(255 255 255 / 0%);
  cursor: col-resize;
}
</style>
