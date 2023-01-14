<script setup lang="ts">
import { ref } from 'vue';
import WButton from '@/components/button/index.vue';
import WInput from '@/components/input/index.vue';
import DialogBase from '@/components/dialog-template/dialog-base.vue';
// 这里不能抽成类型，会报错
// https://github.com/vuejs/core/issues/4294
defineProps<{
  onConfirm:(filename: string) => void,
  onCancel: () => void
}>();

const filename = ref('');

</script>
<template>
  <DialogBase :title="'新建文件夹'">
    <WInput
      v-model="filename"
      autofocus
    />
    <template #footer>
      <WButton @click="onCancel">
        取消
      </WButton>
      <WButton
        theme="primary"
        @click="onConfirm(filename)"
      >
        确定
      </WButton>
    </template>
  </DialogBase>
</template>

<style lang="less" scoped>
//
</style>
