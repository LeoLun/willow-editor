<script setup lang="ts">
import { inject, ref } from 'vue';
import type { Ref } from 'vue';
import { TabNodeEntity } from '@/entity/index';
import { IEditorViewService } from '../common/const';

import type FileEditor from '../editor-view/index.vue';
import WTabs from './tabs/tabs.vue';
import WTabPanel from './tabs/tab-panel.vue';

type FileEditorServiceType = Ref<InstanceType<typeof FileEditor>>;
// 注入 editorViewService
const editorViewService = inject(IEditorViewService) as FileEditorServiceType | undefined;

const currentTab = ref<TabNodeEntity>();
const tabs = ref<TabNodeEntity[]>([]);

const setContent = (tabEntity: TabNodeEntity) => {
  currentTab.value = tabEntity;
  editorViewService?.value.openFile(tabEntity.file);
};

const openFile = async (tab: TabNodeEntity) => {
  const operateTabEntity = tabs.value.find((item) => item.file.key === tab.file.key);

  if (operateTabEntity) {
    if (operateTabEntity.preview && !tab.preview) {
      operateTabEntity.preview = false;
    }
    if (currentTab.value?.file.key !== operateTabEntity.file.key) {
      setContent(operateTabEntity as TabNodeEntity);
    }
    return;
  }

  if (tab.preview) {
    // 检查是否有 preview 如果存在则剔除
    const index = tabs.value.findIndex((item) => item.preview);
    if (index !== -1) {
      tabs.value.splice(index, 1);
    }
  }
  tabs.value.push(tab);
  setContent(tab);
};

const closeFile = (tab: TabNodeEntity, index: number) => {
  tabs.value.splice(index, 1);
  if (currentTab.value?.file.key === tab.file.key) {
    if (tabs.value.length) {
      openFile(tabs.value[tabs.value.length - 1] as TabNodeEntity);
    } else {
      currentTab.value = undefined;
      editorViewService?.value.closeFile();
    }
  }
};

const closeOther = (tab: TabNodeEntity) => {
  tabs.value = [tab];
  if (currentTab.value?.file.key !== tab.file.key) {
    openFile(tab);
  }
};

defineExpose({
  openFile,
});

</script>
<template>
  <w-tabs
    v-show="currentTab"
    ref="TabsElement"
  >
    <w-tab-panel
      v-for="(item, index) in tabs"
      :key="item.file.key"
      :title="item.file.key"
      :tab-entity="(item as TabNodeEntity)"
      :active="item.file.key === currentTab?.file.key"
      @open="openFile(item as TabNodeEntity)"
      @close="closeFile(item as TabNodeEntity, index)"
      @close-other="closeOther(item as TabNodeEntity)"
    />
  </w-tabs>
</template>

<style lang="less" scoped>
//
</style>
