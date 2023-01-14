import { DirTreeEntity, FileTreeEntity } from '@/entity/index';

/** 目录树工厂类 */
export default class TreeFactory {
  /** 创建目录树 */
  static async createTree() {
    const dirHandle = await window.showDirectoryPicker();
    return TreeFactory.createTreeByHandle(dirHandle);
  }

  static async createTreeByHandle(
    dirHandle: FileSystemDirectoryHandle,
    parentKey: string = '',
    parent: DirTreeEntity | null = null,
  ) {
    const rootKey = `${parentKey}/${dirHandle.name}`;
    const root = new DirTreeEntity(
      rootKey,
      dirHandle.name,
      parent,
      dirHandle,
    );

    // eslint-disable-next-line no-restricted-syntax
    for await (const [, handle] of dirHandle.entries()) {
      if (handle.kind === 'directory') {
        const dir = await TreeFactory.createTreeByHandle(handle, rootKey, root);
        if (root.children) {
          root.children.push(dir);
        }
      } else if (root?.children) {
        const fileTreeEntity = new FileTreeEntity(
          `${rootKey}/${handle.name}`,
          handle.name,
          root,
          handle,
        );
        root.children.push(fileTreeEntity);
      }
    }
    // 针对 children 排序
    root.sortChildren();
    return root;
  }
}
