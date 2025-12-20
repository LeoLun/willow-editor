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

const onEnter = (e: KeyboardEvent) => {
  // 避免中文输入法/组合输入（IME composing）状态下按回车误触发确认
  if ((e as unknown as { isComposing?: boolean }).isComposing) return;
  props.onConfirm(filename.value);
};

</script>
<template>
  <DialogBase :title="'重命名'">
    <WInput
      v-model="filename"
      @keydown.enter.prevent="onEnter"
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
