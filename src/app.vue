<script lang="ts" setup>
import { ref, computed, provide } from 'vue';
import SplitPane from '@/components/split-pane/index.vue';
import {
  FileTreeEntity, DirTreeEntity, TabNodeEntity, FileEntity,
} from '@/entity/index';
import { IEditorViewService, ITreeViewService, ITabsViewService } from './views/common/const';
import TreeFactory from './lib/tree-factory';
import FileTree from './views/tree-view/index.vue';
import FileEditor from './views/editor-view/index.vue';
import FileTabs from './views/tabs-view/index.vue';

const root = ref<DirTreeEntity>();
const editorViewService = ref<InstanceType<typeof FileEditor>>();
const treeViewService = ref<InstanceType<typeof FileTree>>();
const tabsViewService = ref<InstanceType<typeof FileTabs>>();

provide(IEditorViewService, editorViewService);
provide(ITreeViewService, treeViewService);
provide(ITabsViewService, tabsViewService);

const isDrag = ref(false);
const dragTitle = ref('拖拽文件夹 或 点击选择文件夹');

const isEmpty = computed(() => !root.value);

const handeleShowDirectoryPicker = async () => {
  root.value = await TreeFactory.createTree();
};

const handleDragover = () => {
  isDrag.value = true;
  dragTitle.value = '松开鼠标';
};

const handleDrop = async (e: DragEvent) => {
  if (e.dataTransfer && e.dataTransfer.items) {
    const items = e.dataTransfer.items as any;
    const fileHandlesPromises = [...items]
      .filter((item) => item.kind === 'file')
      .map((item) => item.getAsFileSystemHandle());

    // eslint-disable-next-line no-restricted-syntax
    for await (const handle of fileHandlesPromises) {
      if (handle.kind === 'directory') {
        root.value = await TreeFactory.createTreeByHandle(handle);
      }
    }
  }
};

const handleDragleave = () => {
  isDrag.value = false;
  dragTitle.value = '拖拽文件夹 或 点击选择文件夹';
};

const handleClickFile = (file: FileTreeEntity) => {
  if (tabsViewService.value) {
    const fileEntidy = new FileEntity(file.key, file.name, file.handle);
    const tabEntity = new TabNodeEntity(fileEntidy, true);
    tabsViewService.value.openFile(tabEntity);
  }
};

const handleDoubleClickFile = (file: FileTreeEntity) => {
  if (tabsViewService.value) {
    const fileEntidy = new FileEntity(file.key, file.name, file.handle);
    const tabEntity = new TabNodeEntity(fileEntidy, false);
    tabsViewService.value.openFile(tabEntity);
  }
};

</script>

<template>
  <div class="editor-container">
    <div
      v-if="isEmpty"
      class="emtpy-content"
      :class="{'is-drag': isDrag}"
      @drop.prevent="handleDrop"
      @dragover.prevent="handleDragover"
      @dragleave.prevent="handleDragleave"
      @click="handeleShowDirectoryPicker"
    >
      {{ dragTitle }}
    </div>
    <div
      v-else
      class="base-content"
    >
      <split-pane
        :min-percent="10"
        :default-percent="15"
        split="vertical"
      >
        <template #pane-l>
          <FileTree
            ref="treeViewService"
            class="dir-tree"
            :root="root"
            @click-file="handleClickFile"
            @doubleclick-file="handleDoubleClickFile"
          />
        </template>
        <template #pane-r>
          <div class="editor-content">
            <FileTabs
              ref="tabsViewService"
              class="editor-tabs-container"
            />
            <FileEditor
              ref="editorViewService"
              class="editor-view-container"
            />
          </div>
        </template>
      </split-pane>
    </div>
  </div>
</template>

<style lang="less">
@import "./components/file-icon/icons.css";

.editor-container {
  display: flex;
  flex-direction: row;
  background: #1a1a1a;
  color: #fff;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
}

.editor-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.editor-tabs-container {
  height: 35px;
}

.editor-view-container {
  display: flex;
  flex: 1;
}

.base-content {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
}

.dir-tree {
  width: 100%;
  height: 100%;
}

.emtpy-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: 500px;
  height: 300px;
  border-radius: 5px;
  border: 1px dashed #fff;

  &.is-drag {
    border-color: #db8742;
    color: #db8742;
  }
}
</style>
