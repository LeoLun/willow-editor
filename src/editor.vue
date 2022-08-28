<script setup lang="ts">
// import type { TabEntity, DirOrFileEntity } from '@/entity/index';
import {
  FileTreeEntity, TabEntity, TreeEntity,
} from '@/entity/index';
import { ref } from 'vue';
import SparkMD5 from 'spark-md5';
import WTabs from '@/components/tabs/tabs.vue';
import WTabPanel from '@/components/tabs/tab-panel.vue';
import * as monaco from 'monaco-editor';
import Monaco from './lib/monaco';
import { getFileContent, writeFile, getImageUrl } from './lib/file-system';
import { findLanguage } from './lib/monaco-language';

const currentTab = ref<TabEntity>();
const tabs = ref<TabEntity[]>([]);

const onSaveFile = async (content: string) => {
  if (currentTab.value!.newMd5 === currentTab.value!.oldMd5) {
    return;
  }
  const md5 = SparkMD5.hash(content);
  currentTab.value!.newMd5 = md5;

  await writeFile(currentTab.value!.handle, content);
  currentTab.value!.oldMd5 = md5;
};

const onChangeFile = (content: string) => {
  // 计算新的MD5
  const md5 = SparkMD5.hash(content);
  currentTab.value!.newMd5 = md5;
  currentTab.value!.content = content;
};

const { getInstance } = Monaco(onSaveFile, onChangeFile);

const setContent = (tabEntity: TabEntity) => {
  currentTab.value = tabEntity;
  const monacaEditor = getInstance('monaca-editor');
  const match = tabEntity.name.match(/\.[^\\.]+$/);
  let suffix = match ? match[0] : '';
  suffix = findLanguage(suffix);
  const { content } = tabEntity;
  monacaEditor.setValue(content);
  const model = monacaEditor.getModel();
  if (model) {
    monaco.editor.setModelLanguage(model, suffix);
  }
};

const openFile = async (file: TreeEntity) => {
  console.log('openFile', file);
  if (!(file instanceof FileTreeEntity)) {
    return;
  }

  const operateTabEntity = tabs.value.find((item) => item.key === file.key);

  if (operateTabEntity) {
    setContent(operateTabEntity);
    return;
  }

  const ext = file.name.split('.').pop() || '';

  const isImage = ['jpeg', 'jpg', 'gif', 'png', 'bmp', 'tiff', 'ico', 'webp', 'svg'].includes(ext);
  let type: 'image' | 'file';
  let content = '';

  if (isImage) {
    content = await getImageUrl(file.handle) as string;
    type = 'image';
  } else {
    content = await getFileContent(file.handle);
    type = 'file';
  }

  const md5 = SparkMD5.hash(content);
  const tabEntity = new TabEntity(file, content, md5, md5, type);
  tabs.value.push(tabEntity);

  setContent(tabEntity);
};

const closeFile = async (file: TreeEntity, index: number) => {
  console.log('close');
  console.log('file', file);
  tabs.value.splice(index, 1);
  if (currentTab.value?.key === file.key) {
    if (tabs.value.length) {
      openFile(tabs.value[tabs.value.length - 1]);
    } else {
      currentTab.value = undefined;
    }
  }
};

defineExpose({
  openFile,
});
</script>

<template>
  <div class="editor-content">
    <w-tabs ref="TabsElement">
      <w-tab-panel
        v-for="(item, index) in tabs"
        :key="item.key"
        :title="item.key"
        :name="item.name"
        :active="item.key === currentTab?.key"
        :unsaved="item.oldMd5 !== item.newMd5"
        :old-md5="item.oldMd5"
        :new-md5="item.newMd5"
        @open="openFile(item)"
        @close="closeFile(item, index)"
      />
    </w-tabs>
    <div
      v-show="currentTab && currentTab.type === 'file'"
      id="monaca-editor"
      class="editor"
    />
    <div
      v-show="currentTab && currentTab.type === 'image'"
    >
      <img :src="currentTab?.content">
    </div>
  </div>
</template>
<style lang="less" scoped>
.editor-content {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
}

.editor {
  flex: 1;
  background: #1e1e1e;
}
</style>
