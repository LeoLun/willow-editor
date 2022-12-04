import TreeEntity from './tree-node-entity';

/** 目录树文件夹节点实体类 */
export default class DirTreeEntity extends TreeEntity {
  children: TreeEntity[];

  /** 文件夹处理器 */
  handle: FileSystemDirectoryHandle;

  constructor(
    key: string,
    name: string,
    parent: TreeEntity | null,
    handle: FileSystemDirectoryHandle,
  ) {
    super(key, name, parent);
    this.handle = handle;
    this.children = [];
  }

  static isDirectory(treeEntity: TreeEntity) {
    return treeEntity instanceof DirTreeEntity;
  }
}
