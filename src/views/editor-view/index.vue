<script setup lang="ts">
import { FileEntity } from '@/entity/index';
import { ref } from 'vue';
import * as monaco from 'monaco-editor';
import Monaco from './monaco';
import { findLanguage } from './monaco-language';

const currentFile = ref<FileEntity>();

const onSaveFile = async (content: string) => {
  if (!currentFile.value) {
    return;
  }
  if (!currentFile.value.isChange()) {
    return;
  }
  await currentFile.value.writeFile(content);
};

const onChangeFile = (content: string) => {
  if (currentFile.value) {
    currentFile.value.setContent(content);
  }
};

const { getInstance } = Monaco(onSaveFile, onChangeFile);

const setContent = (fileEntity: FileEntity) => {
  currentFile.value = fileEntity;
  const monacaEditor = getInstance('monaca-editor');
  const match = fileEntity.name.match(/\.[^\\.]+$/);
  let suffix = match ? match[0] : '';
  suffix = findLanguage(suffix);
  const content = fileEntity.getContent();
  monacaEditor.setValue(content);
  const model = monacaEditor.getModel();
  if (model) {
    monaco.editor.setModelLanguage(model, suffix);
  }
};

const openFile = async (fileEntity: FileEntity) => {
  // @TODO 如果没有变化则直接返回
  if (currentFile.value?.key === fileEntity.key) {
    return;
  }

  // 获取文件内容
  await fileEntity.fetchContent();

  setContent(fileEntity);
};

defineExpose({
  openFile,
});
</script>

<template>
  <div class="editor-view-content">
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
  background: #1e1e1e;
}

.image-content {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
}
</style>
