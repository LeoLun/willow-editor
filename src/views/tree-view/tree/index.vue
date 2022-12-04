<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { TreeEntity, FileTreeEntity, DirTreeEntity } from '@/entity';
import Dialog from '@/components/dialog/index.vue';
import WButton from '@/components/button/index.vue';
import WInput from '@/components/input/index.vue';
import { Tree } from './moncao-tree/treeImpl';
import TreeDnD from './tree-dnd';
import FileTemplate from './file-template';
import { createController } from './monaco-controller';
import ACTIONS from './actions';

const visible = ref(false);

const treeConfig: {
  dataSource: any,
  renderer: any,
  dnd: any,
  controller?: any
} = {
  dataSource: {
    /**
    * Returns the unique identifier of the given element.
    * No more than one element may use a given identifier.
    */
    getId(tree: any, element: TreeEntity) {
      return element.key;
    },

    /**
    * Returns a boolean value indicating whether the element has children.
    */
    hasChildren(tree: any, element: TreeEntity) {
      return DirTreeEntity.isDirectory(element);
    },

    /**
    * Returns the element's children as an array in a promise.
    */
    getChildren(tree: any, element: TreeEntity) {
      if (DirTreeEntity.isDirectory(element)) {
        const dir = element as DirTreeEntity;
        return Promise.resolve(dir.children);
      }
      return [];
    },

    /**
    * Returns the element's parent in a promise.
    */
    getParent(tree: any, element: TreeEntity) {
      return Promise.resolve(element.parent);
    },
  },
  renderer: {
    getHeight() {
      return 24;
    },
    // getHeight(tree: any, element: TreeEntity) {
    //   return 24;
    // },
    renderTemplate(tree: any, templateId: any, container: any) {
      return new FileTemplate(container);
    },
    renderElement(tree: any, element: any, templateId: any, templateData: any) {
      templateData.set(element);
    },
    // disposeTemplate(tree: any, templateId: any, templateData: any) {
    //   FileTemplate.dispose();
    // },
    disposeTemplate() {
      FileTemplate.dispose();
    },
  },

  // tree config requires a controller property but we would defer its initialisation
  // to be done by the MonacoTree component
  // controller: createController(this, this.getActions.bind(this), true),
  dnd: new TreeDnD(),
};

const props = defineProps({
  directory: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['click-file', 'doubleclick-file']);

let currentFile: TreeEntity | null;

let tree: any = null;

let lastClickedTime = 0;
let lastClickedFileKey = '';

onMounted(() => {
  const { directory } = props;

  const onRename = (file: TreeEntity) => {
    console.log('onRename', file);
    // eslint-disable-next-line no-param-reassign
    // file.name = 'abc.js';
    // tree.setInput(directory);
    currentFile = file;
    visible.value = true;
  };

  treeConfig.controller = createController((type: ACTIONS, file: TreeEntity) => {
    console.log('type', type);
    console.log('file', file);
    if (type === ACTIONS.RENAME) {
      onRename(file);
    }
  });
  const container = document.getElementById('tree-container');
  tree = new Tree(container, treeConfig);
  tree.setInput(directory);
  console.log('tree', tree);
  tree.model.onDidSelect((e: any) => {
    if (e.selection.length) {
      const treeEntity = e.selection[0] as TreeEntity;
      if (!DirTreeEntity.isDirectory(treeEntity)) {
        const isDoubleClick = Date.now() - lastClickedTime < 500;
        const isSameFile = lastClickedFileKey === treeEntity.key;
        if (isDoubleClick && isSameFile) {
          emit('doubleclick-file', treeEntity);
        } else {
          emit('click-file', treeEntity);
        }
        lastClickedTime = Date.now();
        lastClickedFileKey = treeEntity.key;
      }
    }
  });
});

const filename = ref('');
const handleRename = async () => {
  if (!filename.value) {
    return;
  }
  try {
    if (currentFile instanceof FileTreeEntity) {
      const fsHandle: any = currentFile.handle;
      await fsHandle.move(filename.value);
      currentFile.name = filename.value;
      tree.setInput(props.directory);
      visible.value = false;
      currentFile = null;
      // @TODO 通知 tabs 更新名字
    }
  } catch (e: any) {
    if (e.message && e.message === 'The user aborted a request.') {
      console.log('开启实验性功能 打开 chreom://flags 中的 Experimental Web Platform features');
    }
  }
};

</script>
<template>
  <div
    id="tree-container"
    class="tree-container"
  />
  <Dialog
    v-model:visible="visible"
    :title="'提示'"
  >
    <WInput v-model="filename" />
    <template #footer>
      <WButton @click="handleRename">
        确定
      </WButton>
    </template>
  </Dialog>
</template>
<style lang="less">
@import "./moncao-tree/browser/ui/iconLabel/iconlabel.css";

.tree-container {
  width: 100%;
  height: 100%;
  background: #1d1d1d;
  color: #fff;
}
</style>
