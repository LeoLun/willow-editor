<script setup lang="ts">
import { computed } from 'vue';
import WButton from '@/components/button/index.vue';
import DialogBase from '@/components/dialog-template/dialog-base.vue';
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
  <DialogBase :title="'提示'">
    <div>{{ name }}</div>
    <template #footer>
      <WButton @click="onCancel">
        取消
      </WButton>
      <WButton
        theme="primary"
        @click="onConfirm"
      >
        确定
      </WButton>
    </template>
  </DialogBase>
</template>

<style lang="less" scoped>
//
</style>
