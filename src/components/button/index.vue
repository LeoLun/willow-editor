<script setup lang="ts">

</script>

<template>
  <button class="w-button">
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
  color: rgb(255 255 255);
  background-color: rgb(14 99 156);
  border: none;
  height: 32px;

  &.primary {
    background-color: var(--w-primary);
  }
}

.w-button-full {
  width: 100%;
  padding: 4px;
}
</style>
