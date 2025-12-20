<script setup lang="ts">
import { computed, ref } from 'vue';
import WButton from '@/components/button/index.vue';
import DialogBase from '@/components/dialog-template/dialog-base.vue';

export type PreviewFile = {
  key: string;
  path: string;
  name: string;
  before: string;
  after: string;
};

const props = defineProps<{
  files: PreviewFile[];
  onCancel:() => void;
  onConfirm: () => void;
}>();

const currentKey = ref(props.files[0]?.key || '');
const current = computed(() => props.files.find((f) => f.key === currentKey.value));
const changedCount = computed(() => props.files.filter((f) => f.before !== f.after).length);
</script>

<template>
  <DialogBase title="AI 修改预览">
    <div class="summary">
      本次将修改 <b>{{ changedCount }}</b> / {{ files.length }} 个文件（请确认后再应用）。
    </div>

    <div class="content">
      <div class="left">
        <div class="left-title">
          文件列表
        </div>
        <div class="file-list">
          <div
            v-for="f in files"
            :key="f.key"
            class="file-item"
            :class="{ active: f.key === currentKey, changed: f.before !== f.after }"
            :title="f.path"
            @click="currentKey = f.key"
          >
            <span class="dot" />
            <span class="name">{{ f.path || f.name }}</span>
          </div>
        </div>
      </div>

      <div class="right">
        <div class="right-title">
          {{ current?.path || current?.name }}
        </div>
        <div class="diff">
          <div class="pane">
            <div class="pane-title">
              原内容
            </div>
            <pre class="pane-body">{{ current?.before }}</pre>
          </div>
          <div class="pane">
            <div class="pane-title">
              新内容
            </div>
            <pre class="pane-body">{{ current?.after }}</pre>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <WButton @click="onCancel">
        取消
      </WButton>
      <WButton
        theme="primary"
        @click="onConfirm"
      >
        应用修改
      </WButton>
    </template>
  </DialogBase>
</template>

<style lang="less" scoped>
.summary {
  font-size: 12px;
  color: var(--w-text-color2);
  margin-bottom: 10px;
}

.content {
  display: flex;
  height: 420px;
  border: 1px solid rgb(60 60 60);
  border-radius: 8px;
  overflow: hidden;
}

.left {
  width: 210px;
  border-right: 1px solid rgb(60 60 60);
  background: rgb(25 25 25);
  display: flex;
  flex-direction: column;
}

.left-title {
  padding: 8px 10px;
  font-size: 12px;
  color: var(--w-text-color2);
  border-bottom: 1px solid rgb(60 60 60);
}

.file-list {
  flex: 1;
  overflow: auto;
  padding: 6px;
  box-sizing: border-box;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  color: var(--w-text-color);

  &:hover {
    background: rgb(90 93 94 / 31%);
  }

  &.active {
    background: rgb(0 122 204 / 22%);
    border: 1px solid rgb(0 122 204 / 40%);
  }
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgb(120 120 120);
}

.file-item.changed .dot {
  background: rgb(0 122 204);
}

.name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.right {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgb(30 30 30);
}

.right-title {
  padding: 8px 10px;
  font-size: 12px;
  color: var(--w-text-color2);
  border-bottom: 1px solid rgb(60 60 60);
}

.diff {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.pane {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.pane + .pane {
  border-left: 1px solid rgb(60 60 60);
}

.pane-title {
  padding: 8px 10px;
  font-size: 12px;
  color: var(--w-text-color2);
  border-bottom: 1px solid rgb(60 60 60);
  background: rgb(25 25 25);
}

.pane-body {
  flex: 1;
  margin: 0;
  padding: 10px;
  overflow: auto;
  white-space: pre;
  font-size: 12px;
  line-height: 18px;
}
</style>
