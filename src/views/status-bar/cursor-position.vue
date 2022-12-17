<script setup lang="ts">
import { ref } from 'vue';
import type { Position } from './status-bar-types';

const position = ref<Position | undefined>();

const setCursorPostion = (value: Position | undefined) => {
  position.value = value;
};

defineExpose({
  setCursorPostion,
});

</script>
<template>
  <div
    v-if="position"
    class="cursor-position"
  >
    行 {{ position.lineNumber }}, 列 {{ position.column }}
  </div>
</template>

<style lang="less" scoped>
.cursor-position {
  margin: 0 3px;
  padding: 0 5px;
}
</style>
