<script lang="ts" setup>
import { ref, computed } from 'vue';
import SplitPane from '@/components/split-pane/index.vue';
import { FileTreeEntity, DirTreeEntity } from '@/entity/index';
import { createDirTree } from './lib/file-system';

import FileTree from './file-tree.vue';
import Editor from './editor.vue';

const root = ref<DirTreeEntity>();
const editorElement = ref();
const isDrag = ref(false);
const dragTitle = ref('拖拽文件夹 或 点击选择文件夹');

const isEmpty = computed(() => !root.value);

const handeleShowDirectoryPicker = async () => {
  const dirHandle = await window.showDirectoryPicker();
  root.value = await createDirTree(dirHandle);
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
        root.value = await createDirTree(handle);
      }
    }
  }
};

const handleDragleave = () => {
  isDrag.value = false;
  dragTitle.value = '拖拽文件夹 或 点击选择文件夹';
};

const handleClickFile = (file: FileTreeEntity) => {
  editorElement.value.openFile(file, true);
};

const handleDoubleClickFile = (file: FileTreeEntity) => {
  editorElement.value.openFile(file, false);
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
            class="dir-tree"
            :root="root"
            @click-file="handleClickFile"
            @doubleclick-file="handleDoubleClickFile"
          />
        </template>
        <template #pane-r>
          <Editor ref="editorElement" />
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
