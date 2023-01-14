import TreeEntity from './tree-node-entity';
import FileTreeEntity from './file-tree-node';

/** 目录树文件夹节点实体类 */
export default class DirTreeEntity extends TreeEntity {
  children: TreeEntity[];

  /** 文件夹处理器 */
  handle: FileSystemDirectoryHandle;

  constructor(
    key: string,
    name: string,
    parent: DirTreeEntity | null,
    handle: FileSystemDirectoryHandle,
  ) {
    super(key, name, parent);
    this.handle = handle;
    this.children = [];
  }

  /**
   * 添加子节点
   * @param child 子节点
   */
  private addChild(child: TreeEntity) {
    this.children.push(child);
    this.sortChildren();
  }

  /**
   * 检测是否有一样的文件名
   * @param filename 文件名
   */
  private hasSameFilename(filename: string) {
    return !!this.children.find((chile) => chile.name === filename);
  }

  sortChildren() {
    this.children.sort((a: TreeEntity, b: TreeEntity) => {
      if (DirTreeEntity.isDirectory(a) !== DirTreeEntity.isDirectory(b)) {
        if (DirTreeEntity.isDirectory(a)) {
          return -1;
        }
        return 1;
      }
      if (a.name.startsWith('.') && !b.name.startsWith('.')) {
        return -1;
      }
      if (!a.name.startsWith('.') && b.name.startsWith('.')) {
        return 1;
      }
      if (a.name > b.name) {
        return -1;
      }
      return 1;
    });
  }

  /**
   * 判断节点是否为子节点
   * @param treeEntity 节点
   */
  isChild(treeEntity: TreeEntity) {
    return !!this.children.find((child) => child.key === treeEntity.key);
  }

  /**
   * 移除文件
   * @param treeEntity 节点
   */
  async removeChild(child: TreeEntity) {
    if (!this.isChild(child)) {
      throw new Error(`${child.name} is not ${this.name} child`);
    }
    if (DirTreeEntity.isDirectory(child)) {
      // 文件夹需要递归删除
      await this.handle.removeEntry(child.name, { recursive: true });
    } else {
      await this.handle.removeEntry(child.name);
    }

    // 移除子节点
    const index = this.children.findIndex((item) => item.key === child.key);
    this.children.splice(index, 1);
    return true;
  }

  async createFile(filename: string) {
    // 判断是否有一样子名字的子节点
    if (this.hasSameFilename(filename)) {
      throw new Error(`${filename} has exists`);
    }
    const fileHandle = await this.handle.getFileHandle(filename, { create: true });
    const fileKey = `${this.key}/${filename}`;
    const fileNode = new FileTreeEntity(fileKey, filename, this, fileHandle);
    this.addChild(fileNode);
    return fileNode;
  }

  async createDirectory(dirName: string) {
    // 判断是否有一样子名字的子节点
    if (this.hasSameFilename(dirName)) {
      throw new Error(`${dirName} has exists`);
    }
    const dirHandle = await this.handle.getDirectoryHandle(dirName, { create: true });
    const fileKey = `${this.key}/${dirName}`;
    const dirNode = new DirTreeEntity(fileKey, dirName, this, dirHandle);
    this.addChild(dirNode);
    return dirNode;
  }

  async rename(dirName: string) {
    const fsHandle: any = this.handle;
    await fsHandle.move(dirName);
    this.name = dirName;
    const keys = this.key.split('/');
    keys[keys.length - 1] = this.name;
    this.key = keys.join('/');
  }

  async remove() {
    if (this.parent) {
      await this.parent.removeChild(this);
    }
  }

  static isDirectory(treeEntity: TreeEntity) {
    return treeEntity instanceof DirTreeEntity;
  }
}
