<script setup lang="ts">
import { computed, PropType } from 'vue';
import type { Theme } from './type';

const props = defineProps({
  theme: {
    type: String as PropType<Theme>,
    default: 'info',
  },
  msg: {
    type: String,
    default: '',
  },
});

const clazz = computed(() => props.theme);

</script>

<template>
  <div
    class="w-toast"
    :class="clazz"
  >
    <div>{{ msg }}</div>
  </div>
</template>

<style lang="less" scoped>
.w-toast {
  padding: 5px 16px;
  background-color: #252526;
  color: #ccc;
  box-shadow: rgb(0 0 0 / 36%) 0 0 8px 2px;
  margin-bottom: 5px;
}

</style>
