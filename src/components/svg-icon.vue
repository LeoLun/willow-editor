<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  prefix: {
    type: String,
    default: 'icon',
  },
  name: {
    type: String,
    required: true,
  },
  // color: {
  //   type: String,
  //   default: "#333",
  // },
  size: {
    type: [Number, String],
    default: 24,
  },
});

const symbolId = computed(() => `#${props.prefix}-${props.name}`);
const svgStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  minWidth: `${props.size}px`,
}));

</script>

<template>
  <svg
    aria-hidden="true"
    :style="svgStyle"
    class="svg-default"
  >
    <!-- <use :href="symbolId" :fill="color" /> -->
    <use :href="symbolId" />
  </svg>
</template>

<style lang="less" scoped>
.svg-default {
  fill: currentcolor;
  vertical-align: middle;
}
</style>
