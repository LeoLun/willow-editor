<script setup lang="ts">
import { onMounted } from 'vue';
import { requireInjection } from '@/utils';
import { TreeEntity, DirTreeEntity, FileTreeEntity } from '@/entity';
import { IToastService } from '@/common/const';
import DialogFactory from '@/layout/dialog/dialog-factory';
import { Tree } from './moncao-tree/treeImpl';
import TreeDnD from './tree-dnd';
import FileTemplate from './file-template';
import { createController } from './monaco-controller';
import ACTIONS from './actions';

const toastService = requireInjection(IToastService);
// const visible = ref(false);

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
    currentFile = file;
    console.log('currentFile', currentFile instanceof FileTreeEntity);
    const dialog = DialogFactory.create({
      type: 'RENAME',
      props: {
        fileName: currentFile.name,
        onCancel: () => {
          console.log('123444');
          dialog.close();
        },
        onConfirm: async (filename: string) => {
          console.log('filename', filename);
          if (!filename) {
            return;
          }
          try {
            if (currentFile instanceof FileTreeEntity) {
              console.log('111');
              const fsHandle: any = currentFile.handle;
              await fsHandle.move(filename);
              currentFile.name = filename;
              tree.setInput(props.directory);
              currentFile = null;
              // @TODO 通知 tabs 更新名字
              console.log('22222');
              // 关闭弹窗
              dialog.close();
            }
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
    console.log('onDelete', file);

    const dialog = DialogFactory.create({
      type: 'DELETE',
      props: {
        fileName: file.name,
        onConfirm: () => {
          dialog.close();
        },
        onCancel: () => {
          console.log('12333333333');
          dialog.close();
        },
      },
    });

    dialog.open();
  };

  const onCreateFile = (file: TreeEntity) => {
    console.log('CREATE_FILE', file);

    const dialog = DialogFactory.create({
      type: 'CREATE_FILE',
      props: {
        fileName: file.name,
        onConfirm: () => {
          dialog.close();
        },
        onCancel: () => {
          console.log('12333333333');
          dialog.close();
        },
      },
    });

    dialog.open();
  };

  const onCreateDirectory = (file: TreeEntity) => {
    console.log('CREATE_DIRECTORY', file);

    const dialog = DialogFactory.create({
      type: 'CREATE_DIRECTORY',
      props: {
        fileName: file.name,
        onConfirm: () => {
          dialog.close();
        },
        onCancel: () => {
          console.log('12333333333');
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

  treeConfig.controller = createController((type: ACTIONS, file: TreeEntity) => {
    console.log('type', type);
    console.log('file', file);
    if (type === ACTIONS.RENAME) {
      onRename(file);
      return;
    }

    // if (type === ACTIONS.OPEN_WISH_LIVE_SERVER) {
    //   onOpenWishLiveServer(file);
    //   return;
    // }

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

    toastService.info('开发中');
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
