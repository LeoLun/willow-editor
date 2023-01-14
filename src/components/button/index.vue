<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  theme?: 'default' | 'primary'
}>();

const clazz = computed(() => ({
  primary: props.theme === 'primary',
}));

</script>

<template>
  <button
    class="w-button"
    :class="clazz"
  >
    <slot />
  </button>
</template>
<style lang="less">
.w-button {
  padding: 0 15px;
  box-sizing: border-box;
  display: flex;
  border-radius: 2px;
  text-align: center;
  cursor: pointer;
  justify-content: center;
  align-items: center;
  color: var(--w-button-color);
  background-color: var(--w-button-background);
  border: none;
  height: 32px;

  &:hover {
    background-color: var(--w-button-background-hover);
  }

  &.primary {
    background-color: var(--w-button-background-primary);

    &:hover {
      background-color: var(--w-button-background-primary-hover);
    }
  }
}

.w-button-full {
  width: 100%;
  padding: 4px;
}
</style>
