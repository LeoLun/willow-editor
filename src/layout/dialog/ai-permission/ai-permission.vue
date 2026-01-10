<script setup lang="ts">
import { ref } from 'vue';
import WButton from '@/components/button/index.vue';
import DialogBase from '@/components/dialog-template/dialog-base.vue';

defineProps<{
  title?: string;
  permission: string;
  pattern: string;
  onAllow:(remember: boolean) => void;
  onDeny: (remember: boolean) => void;
  onCancel: () => void;
}>();

const remember = ref(false);
</script>

<template>
  <DialogBase :title="title || '权限请求'">
    <div class="desc">
      AI 需要执行以下操作：
    </div>
    <div class="box">
      <div class="row">
        <span class="k">权限</span>
        <span class="v">{{ permission }}</span>
      </div>
      <div class="row">
        <span class="k">目标</span>
        <span class="v">{{ pattern }}</span>
      </div>
    </div>

    <label class="remember">
      <input
        v-model="remember"
        type="checkbox"
      >
      记住我的选择（后续相同操作不再询问）
    </label>

    <template #footer>
      <WButton @click="onCancel">
        取消
      </WButton>
      <WButton @click="onDeny(remember)">
        拒绝
      </WButton>
      <WButton
        theme="primary"
        @click="onAllow(remember)"
      >
        允许
      </WButton>
    </template>
  </DialogBase>
</template>

<style lang="less" scoped>
.desc {
  font-size: 12px;
  color: var(--w-text-color2);
  margin-bottom: 10px;
}

.box {
  border: 1px solid rgb(60 60 60);
  background: rgb(30 30 30);
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
}

.row {
  display: flex;
  gap: 10px;
  margin-bottom: 6px;

  &:last-child {
    margin-bottom: 0;
  }
}

.k {
  width: 48px;
  flex: none;
  font-size: 12px;
  color: var(--w-text-color2);
}

.v {
  flex: 1;
  font-size: 12px;
  color: var(--w-text-color);
  word-break: break-word;
}

.remember {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--w-text-color2);
}
</style>
