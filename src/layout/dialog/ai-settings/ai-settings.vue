<script setup lang="ts">
import { computed, ref } from 'vue';
import WButton from '@/components/button/index.vue';
import DialogBase from '@/components/dialog-template/dialog-base.vue';
import { requireInjection } from '@/utils';
import { IToastService } from '@/common/const';
import {
  aiApiKey,
  aiBaseUrl,
  persistAiSettings,
  validateDeepseekApiKey,
} from '@/services/ai/store';
import { testDeepseekKey } from '@/services/deepseek';

const toastService = requireInjection(IToastService);

const props = defineProps<{
  onCancel:() => void;
  onConfirm: () => void;
}>();

const keyInput = ref(aiApiKey.value);
const baseUrlInput = ref(aiBaseUrl.value);
const isTesting = ref(false);

const keyError = computed(() => {
  const r = validateDeepseekApiKey(keyInput.value);
  return r.ok ? '' : r.message;
});

const canSave = computed(() => !keyError.value);

const handleSave = () => {
  if (!canSave.value) {
    toastService.error(keyError.value || 'API Key 不正确');
    return;
  }
  aiApiKey.value = keyInput.value.trim();
  aiBaseUrl.value = baseUrlInput.value.trim() || 'https://api.deepseek.com';
  persistAiSettings();
  toastService.success('已保存 AI 设置');
  props.onConfirm();
};

const handleTest = async () => {
  if (!canSave.value) {
    toastService.error(keyError.value || 'API Key 不正确');
    return;
  }
  isTesting.value = true;
  try {
    aiApiKey.value = keyInput.value.trim();
    aiBaseUrl.value = baseUrlInput.value.trim() || 'https://api.deepseek.com';
    persistAiSettings();
    await testDeepseekKey();
    toastService.success('验证成功：DeepSeek API 可用');
  } catch (e: any) {
    const msg = e?.message || '验证失败';
    // 浏览器直接请求可能遇到 CORS
    toastService.error(`${msg}${msg.includes('Failed to fetch') ? '（可能是 CORS/网络问题）' : ''}`);
  } finally {
    isTesting.value = false;
  }
};
</script>

<template>
  <DialogBase title="AI 设置">
    <div class="row">
      <div class="label">
        DeepSeek Base URL
      </div>
      <input
        v-model="baseUrlInput"
        class="input"
        placeholder="https://api.deepseek.com"
      >
      <div class="hint">
        如遇 CORS，可配置你自己的反向代理地址（同源）。
      </div>
    </div>

    <div class="row">
      <div class="label">
        DeepSeek API Key
      </div>
      <input
        v-model="keyInput"
        class="input"
        placeholder="请输入 API Key"
      >
      <div
        v-if="keyError"
        class="error"
      >
        {{ keyError }}
      </div>
    </div>

    <template #footer>
      <WButton @click="onCancel">
        取消
      </WButton>
      <WButton
        :disabled="isTesting"
        @click="handleTest"
      >
        {{ isTesting ? '验证中...' : '验证' }}
      </WButton>
      <WButton
        theme="primary"
        @click="handleSave"
      >
        保存
      </WButton>
    </template>
  </DialogBase>
</template>

<style lang="less" scoped>
.row {
  margin-bottom: 14px;
}

.label {
  font-size: 12px;
  color: var(--w-text-color2);
  margin-bottom: 6px;
}

.input {
  width: 100%;
  box-sizing: border-box;
  height: 32px;
  border-radius: 2px;
  padding: 0 10px;
  border: 1px solid rgb(60 60 60);
  background: rgb(30 30 30);
  color: var(--w-text-color);

  &:focus {
    border-color: var(--w-input-border-focus);
  }
}

.hint {
  margin-top: 6px;
  font-size: 12px;
  color: var(--w-text-color2);
  opacity: 0.8;
}

.error {
  margin-top: 6px;
  font-size: 12px;
  color: #f48771;
}

:deep(.w-button[disabled]) {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
