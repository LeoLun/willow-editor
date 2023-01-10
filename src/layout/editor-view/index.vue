<script setup lang="ts">
import { FileEntity } from '@/entity/index';
import { ref } from 'vue';
import { requireInjection } from '@/utils';
import * as monaco from 'monaco-editor';
import type { Ref } from 'vue';
import { IStatusBarService } from '@/common/const';
import Monaco from './monaco';
import { findLanguage } from './monaco-language';
import type StatusBar from '../status-bar/index.vue';
import type { Position } from '../status-bar/status-bar-types';

type StatusBarerviceType = Ref<InstanceType<typeof StatusBar>>;
// 注入 IStatusBarService
const statusBarervice = requireInjection(IStatusBarService) as StatusBarerviceType;

const currentFile = ref<FileEntity>();

const onSaveFile = async (content: string) => {
  if (!currentFile.value) {
    return;
  }
  if (!currentFile.value.isChange()) {
    return;
  }
  await currentFile.value.write(content);
};

const onChangeFile = (content: string) => {
  if (currentFile.value) {
    currentFile.value.setContent(content);
  }
};

const onChangeCursorPosition = (postion: Position | undefined) => {
  statusBarervice.value.setCursorPostion(postion);
};

const onChangeLanguage = (language: string) => {
  statusBarervice.value.setLanguage(language);
};

const { getInstance } = Monaco(
  onChangeCursorPosition,
  onSaveFile,
  onChangeFile,
  onChangeLanguage,
);

const setContent = (fileEntity: FileEntity) => {
  currentFile.value = fileEntity;
  const monacoEditor = getInstance('monaca-editor');
  const match = fileEntity.name.match(/\.[^\\.]+$/);
  let suffix = match ? match[0] : '';
  suffix = findLanguage(suffix);
  const content = fileEntity.getContent();
  monacoEditor.setValue(content);
  const model = monacoEditor.getModel();
  if (model) {
    monaco.editor.setModelLanguage(model, suffix);
  }

  if (fileEntity.type === 'image') {
    onChangeLanguage('');
    onChangeCursorPosition(undefined);
  }
};

const openFile = async (fileEntity: FileEntity) => {
  if (currentFile.value?.key === fileEntity.key) {
    return;
  }

  // 获取文件内容
  await fileEntity.fetchContent();

  setContent(fileEntity);
};

const closeFile = () => {
  currentFile.value = undefined;
  const monacoEditor = getInstance('monaca-editor');
  monacoEditor.setValue('');
  onChangeLanguage('');
  onChangeCursorPosition(undefined);
};

defineExpose({
  openFile,
  closeFile,
});
</script>

<template>
  <div
    v-show="currentFile"
    class="editor-view-content"
  >
    <div
      v-show="currentFile && currentFile.type === 'file'"
      id="monaca-editor"
      class="editor"
    />
    <div
      v-show="currentFile && currentFile.type === 'image'"
      class="image-content"
    >
      <img
        v-if="currentFile && currentFile.type === 'image'"
        :src="currentFile?.getContent()"
      >
    </div>
  </div>
</template>
<style lang="less" scoped>
.editor-view-content {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
}

.editor {
  flex: 1;
}

.image-content {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  background: var(--w-background);
}
</style>
