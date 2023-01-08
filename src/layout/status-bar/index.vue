<script setup lang="ts">
import { ref } from 'vue';
import type { Position } from './status-bar-types';
import CursorPosition from './cursor-position.vue';
import Language from './language.vue';

const cursorPositionService = ref<InstanceType<typeof CursorPosition>>();
const setCursorPostion = (position: Position | undefined) => cursorPositionService.value
 && cursorPositionService.value.setCursorPostion(position);

const languageService = ref<InstanceType<typeof Language>>();

const setLanguage = (language: string) => languageService.value
&& languageService.value.setLanguage(language);

defineExpose({
  setCursorPostion,
  setLanguage,
});

</script>
<template>
  <div class="status-bar">
    <div class="status-bar-left">
      <!-- <div>codicon-error</div>
      <div>codicon-warning</div> -->
    </div>
    <div class="status-bar-right">
      <CursorPosition ref="cursorPositionService" />
      <Language ref="languageService" />
      <!-- <div>eol</div>
      <div>encoding</div> -->
    </div>
  </div>
</template>
<style lang="less" scoped>
.status-bar {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 22px;
  width: 100%;
  background: #007acc;
  padding: 0 12px;
  box-sizing: border-box;
  font-size: 12px;
}

.status-bar-right {
  display: flex;
  flex-direction: row;
}
</style>
