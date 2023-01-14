<script setup lang="ts">
import { onMounted } from 'vue';
import { requireInjection } from '@/utils';
import {
  TreeEntity,
  DirTreeEntity,
  FileTreeEntity,
  TabNodeEntity,
  FileEntity,
} from '@/entity';
import { IToastService, ITabsViewService, ACTIONS } from '@/common/const';
import DialogFactory from '@/layout/dialog/dialog-factory';
import { Tree } from './moncao-tree/treeImpl';
import TreeDnD from './tree-dnd';
import FileTemplate from './file-template';
import { createController } from './monaco-controller';

const toastService = requireInjection(IToastService);
const tabsViewService = requireInjection(ITabsViewService);

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

let tree: any = null;

let lastClickedTime = 0;
let lastClickedFileKey = '';

const openFilePreview = (file: FileTreeEntity) => {
  const fileEntidy = new FileEntity(file.key, file.name, file.handle);
  const tabEntity = new TabNodeEntity(fileEntidy, true);
  tabsViewService.value.openFile(tabEntity);
};

const openFile = (file: FileTreeEntity) => {
  const fileEntidy = new FileEntity(file.key, file.name, file.handle);
  const tabEntity = new TabNodeEntity(fileEntidy, false);
  tabsViewService.value.openFile(tabEntity);
};

const closeFile = (file: FileTreeEntity) => {
  tabsViewService.value.closeFile(file.key);
};

// const updateFile = (file: FileTreeEntity) => {
//   const fileEntidy = new FileEntity(file.key, file.name, file.handle);
//   const tabEntity = new TabNodeEntity(fileEntidy, false);
//   tabsViewService.value.updateFile(tabEntity);
// };

const onRename = (file: TreeEntity) => {
  if (DirTreeEntity.isDirectory(file)) {
    toastService.info('文件夹不支持重命名');
    return;
  }

  const dialog = DialogFactory.create({
    type: ACTIONS.RENAME,
    props: {
      fileName: file.name,
      onCancel: () => {
        dialog.close();
      },
      onConfirm: async (filename: string) => {
        if (!filename) {
          return;
        }
        try {
          await file.rename(filename);
          tree.setInput(props.directory);
          // 通知 tabs 更新名字
          // updateFile(file as FileTreeEntity);

          // 关闭弹窗
          dialog.close();
        } catch (e: any) {
          if (e.message && e.message === 'The user aborted a request.') {
            toastService.info('开启实验性功能 打开 chreom://flags 中的 Experimental Web Platform features');
          }
        }
      },
    },
  });

  dialog.open();
};

const onDelete = (file: TreeEntity) => {
  const dialog = DialogFactory.create({
    type: ACTIONS.DELETE,
    props: {
      fileName: file.name,
      onConfirm: async () => {
        await file.remove();
        toastService.info(`文件「${file.name}」已删除`);
        tree.setInput(props.directory);
        // 通知 tabs 关闭文件
        closeFile(file as FileTreeEntity);

        dialog.close();
      },
      onCancel: () => {
        dialog.close();
      },
    },
  });

  dialog.open();
};

const onCreateFile = (file: TreeEntity) => {
  const dialog = DialogFactory.create({
    type: ACTIONS.CREATE_FILE,
    props: {
      onConfirm: async (filename: string) => {
        if (DirTreeEntity.isDirectory(file)) {
          const dir = file as DirTreeEntity;
          const fileNode = await dir.createFile(filename);
          tree.setInput(props.directory);
          console.log('fileNode', fileNode);
          openFile(fileNode);
        }
        dialog.close();
      },
      onCancel: () => {
        dialog.close();
      },
    },
  });

  dialog.open();
};

const onCreateDirectory = (file: TreeEntity) => {
  const dialog = DialogFactory.create({
    type: ACTIONS.CREATE_DIRECTORY,
    props: {
      onConfirm: async (dirName: string) => {
        if (DirTreeEntity.isDirectory(file)) {
          const dir = file as DirTreeEntity;
          await dir.createDirectory(dirName);
          tree.setInput(props.directory);
        }

        dialog.close();
      },
      onCancel: () => {
        dialog.close();
      },
    },
  });

  dialog.open();
};

// const onOpenWishLiveServer = (file: TreeEntity) => {
//   console.log('onOpenWishLiveServer', file);
//   window.open(`/willow-editor/live${file.key}`, '_blank');
// };

onMounted(() => {
  treeConfig.controller = createController((type: ACTIONS, file: TreeEntity) => {
    if (type === ACTIONS.RENAME) {
      onRename(file);
      return;
    }

    if (type === ACTIONS.DELETE) {
      onDelete(file);
      return;
    }

    if (type === ACTIONS.CREATE_FILE) {
      onCreateFile(file);
      return;
    }

    if (type === ACTIONS.CREATE_DIRECTORY) {
      onCreateDirectory(file);
      return;
    }

    // if (type === ACTIONS.OPEN_WISH_LIVE_SERVER) {
    //   onOpenWishLiveServer(file);
    //   return;
    // }

    toastService.info('开发中');
  });

  const { directory } = props;
  const container = document.getElementById('tree-container');
  tree = new Tree(container, treeConfig);
  tree.setInput(directory);
  tree.model.onDidSelect((e: any) => {
    if (e.selection.length) {
      const treeEntity = e.selection[0] as TreeEntity;
      if (!DirTreeEntity.isDirectory(treeEntity)) {
        const isDoubleClick = Date.now() - lastClickedTime < 500;
        const isSameFile = lastClickedFileKey === treeEntity.key;
        if (isDoubleClick && isSameFile) {
          openFile(treeEntity as FileTreeEntity);
        } else {
          openFilePreview(treeEntity as FileTreeEntity);
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
@import url("./moncao-tree/browser/ui/iconLabel/iconlabel.css");

.tree-container {
  width: 100%;
  height: 100%;
  background: #1d1d1d;
  color: #fff;
}
</style>
