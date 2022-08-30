<script setup lang="ts">
import { onMounted } from 'vue';
import { TreeEntity } from '@/entity';
import { Tree } from './moncao-tree/treeImpl';
import TreeDnD from './tree-dnd';
import FileTemplate from './file-template';
import { createController } from './monaco-controller';

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
      return element.isDirectory;
    },

    /**
    * Returns the element's children as an array in a promise.
    */
    getChildren(tree: any, element: TreeEntity) {
      return Promise.resolve(element.children);
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

let tree: any = null;

let lastClickedTime = 0;
let lastClickedFileKey = '';

onMounted(() => {
  const { directory } = props;
  treeConfig.controller = createController();
  const container = document.getElementById('tree-container');
  tree = new Tree(container, treeConfig);
  tree.setInput(directory);
  tree.model.onDidSelect((e: any) => {
    if (e.selection.length) {
      const treeEntity = e.selection[0] as TreeEntity;
      if (!treeEntity.isDirectory) {
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

</script>
<template>
  <div
    id="tree-container"
    class="tree-container"
  />
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
