<script setup lang="ts">
import {
  ref, computed, onMounted, nextTick,
} from 'vue';
import { useFocus } from '@vueuse/core';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  autofocus: {
    type: Boolean,
    default: false,
  },
});

interface EmitsType {
  (e: 'update:modelValue', value: string): void
}

const emits = defineEmits<EmitsType>();

const value = computed({
  get: () => props.modelValue,
  set: (newValue) => {
    emits('update:modelValue', newValue);
  },
});

const input = ref();
const { focused } = useFocus(input);

onMounted(() => {
  if (props.autofocus) {
    nextTick(() => {
      focused.value = true;
    });
  }
});

</script>

<template>
  <div class="w-input">
    <input
      ref="input"
      v-model="value"
      class="w-input-inner"
    >
    <div class="w-input-border" />
  </div>
</template>

<style lang="less" scoped>
.w-input {
  position: relative;
  display: block;
  overflow: hidden;
  background-color: rgb(60 60 60);
  color: rgb(204 204 204);
  width: 100%;
  height: 32px;
  padding: 0 8px;
  box-sizing: border-box;
  border-radius: 3px;
}

.w-input-border {
  position: absolute;
  z-index: 0;
  width: 100%;
  height: 100%;
  border: 1px solid transparent;
  box-sizing: border-box;
  top: 0;
  left: 0;
  border-radius: 3px;
}

.w-input-inner {
  position: relative;
  z-index: 1;
  flex: 1;
  border: none;
  outline: none;
  padding: 0;
  max-width: 100%;
  min-width: 0;
  width: 100%;
  color: var(--td-text-color-primary);
  font: inherit;
  background-color: transparent;
  box-sizing: border-box;
  height: 32px;
  line-height: 32px;

  &:focus + .w-input-border {
    border-color: var(--w-input-border-focus);
  }
}

/* #007fd4 */
</style>
