<script setup lang="ts">
import { ref } from 'vue';
import WButton from '@/components/button/index.vue';
import WInput from '@/components/input/index.vue';
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
  <div>
    <WInput v-model="filename" />
    <WButton @click="onCancel">
      取消
    </WButton>
    <WButton @click="onConfirm(filename)">
      确定
    </WButton>
  </div>
</template>

<style lang="less" scoped>
//
</style>
