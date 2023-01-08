<script setup lang="ts">
import { computed } from 'vue';
import WButton from '@/components/button/index.vue';

// 这里不能抽成类型，会报错
// https://github.com/vuejs/core/issues/4294
const props = defineProps<{
  fileName: string,
  onConfirm:() => void,
  onCancel: () => void
}>();

const name = computed(() => props.fileName);

</script>
<template>
  <div>
    <div>{{ name }}</div>
    <div>
      <WButton onclick="onCancel">
        取消
      </WButton>
      <WButton onclick="onConfirm">
        确定
      </WButton>
    </div>
  </div>
</template>

<style lang="less" scoped>
//
</style>
