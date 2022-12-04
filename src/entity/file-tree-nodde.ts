import TreeEntity from './tree-node-entity';

/** 目录树文件节点实体类 */
export default class FileTreeEntity extends TreeEntity {
  /** 文件处理器 */
  handle: FileSystemFileHandle;

  constructor(
    key: string,
    name: string,
    parent: TreeEntity | null,
    handle: FileSystemFileHandle,
  ) {
    super(key, name, parent);
    this.handle = handle;
  }
}
