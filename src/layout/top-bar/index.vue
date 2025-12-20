<script setup lang="ts">
import { computed } from 'vue';
import { requireInjection } from '@/utils';
import { IToastService } from '@/common/const';
import AiSettingsDialog from '@/layout/dialog/ai-settings';
import { aiChatOpen, hasApiKey, setAiChatOpen } from '@/services/ai/store';

const toast = requireInjection(IToastService);

const aiActive = computed(() => aiChatOpen.value);

const openSettings = () => {
  const dialog: AiSettingsDialog = new AiSettingsDialog({
    onCancel: () => dialog.close(),
    onConfirm: () => dialog.close(),
  });
  dialog.open();
};

const toggleAi = () => {
  const next = !aiChatOpen.value;
  setAiChatOpen(next);
  if (next && !hasApiKey.value) {
    toast.info('还未配置 DeepSeek API Key，请先在“AI 设置”中完成配置');
  }
};
</script>

<template>
  <div class="top-bar">
    <div class="top-bar-left">
      <!-- 预留：未来可放项目/工作区信息 -->
    </div>
    <div class="top-bar-right">
      <button
        class="top-bar-action"
        :class="{ active: aiActive }"
        @click="toggleAi"
      >
        AI
      </button>
      <button
        class="top-bar-action"
        @click="openSettings"
      >
        设置
      </button>
    </div>
  </div>
</template>

<style lang="less" scoped>
.top-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  height: 34px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  box-sizing: border-box;
  background: var(--w-black-2);
  border-bottom: 1px solid rgb(60 60 60);
}

.top-bar-left {
  display: flex;
  align-items: center;
  min-width: 0;
}

.top-bar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.top-bar-action {
  height: 24px;
  padding: 0 10px;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
  border: 1px solid rgb(60 60 60);
  background: rgb(0 0 0 / 18%);
  color: var(--w-text-color2);
  display: flex;
  align-items: center;

  &:hover {
    background: rgb(0 0 0 / 28%);
    color: var(--w-text-color);
  }

  &.active {
    background: rgb(0 0 0 / 38%);
    color: var(--w-text-color);
    font-weight: 600;
  }
}
</style>
