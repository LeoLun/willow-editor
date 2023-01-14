import TreeEntity from './tree-node-entity';
import type DirTreeEntity from './dir-tree-node';

/** 目录树文件节点实体类 */
export default class FileTreeEntity extends TreeEntity {
  /** 文件处理器 */
  handle: FileSystemFileHandle;

  constructor(
    key: string,
    name: string,
    parent: DirTreeEntity | null,
    handle: FileSystemFileHandle,
  ) {
    super(key, name, parent);
    this.handle = handle;
  }

  rename(filename: string) {
    // 文件夹暂无API支持重命名，只能新建文件夹，然后递归复制，所以暂不支持
    console.log('filename', filename);
    console.log('name', this.name);
    // const fsHandle: any = this.handle;
    // await fsHandle.move(filename);
    // this.name = filename;
    // const keys = this.key.split('/');
    // keys[keys.length - 1] = this.name;
    // this.key = keys.join('/');
    // this.parent?.sortChildren();
  }

  async remove() {
    if (this.parent) {
      await this.parent.removeChild(this);
    }
  }
}
