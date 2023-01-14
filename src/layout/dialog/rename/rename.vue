<script setup lang="ts">
import { ref } from 'vue';
import WButton from '@/components/button/index.vue';
import WInput from '@/components/input/index.vue';
import DialogBase from '@/components/dialog-template/dialog-base.vue';
// 这里不能抽成类型，会报错
// https://github.com/vuejs/core/issues/4294
const props = defineProps<{
  fileName: string,
  onConfirm:(filename: string) => void,
  onCancel: () => void
}>();

const filename = ref(props.fileName);

</script>
<template>
  <DialogBase :title="'提示'">
    <WInput v-model="filename" />
    <template #footer>
      <WButton @click="onCancel">
        取消
      </WButton>
      <WButton @click="onConfirm(filename)">
        确定
      </WButton>
    </template>
  </DialogBase>
</template>

<style lang="less" scoped>
//
</style>
