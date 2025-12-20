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
      if (a.name.toLowerCase() < b.name.toLowerCase()) {
        return -1;
      }
      return 1;
    });
  }

  /**
   * 递归更新当前目录及子孙节点 key
   * 注意：只会更新已加载到内存的 children
   */
  private updateKeyRecursive(nextKey: string) {
    this.key = nextKey;
    // eslint-disable-next-line no-restricted-syntax
    for (const child of this.children || []) {
      child.key = `${this.key}/${child.name}`;
      child.parent = this;
      if (DirTreeEntity.isDirectory(child)) {
        (child as DirTreeEntity).updateKeyRecursive(child.key);
      }
    }
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
    const next = (dirName || '').trim();
    if (!next) throw new Error('文件夹名不能为空');
    if (next.includes('/')) throw new Error('文件夹名不能包含 /');
    if (!this.parent) throw new Error('无法重命名根节点');
    if (next === this.name) return;

    // 冲突检测（以目录树当前数据为准）
    const exists = (this.parent.children || []).some((ch: any) => ch?.name === next);
    if (exists) throw new Error(`同目录下已存在文件夹「${next}」`);

    const fsHandle: any = this.handle as any;
    if (typeof fsHandle?.move === 'function') {
      await fsHandle.move(next);
      this.name = next;
      const nextKey = `${this.parent.key}/${this.name}`;
      this.updateKeyRecursive(nextKey);
      this.parent.sortChildren();
      return;
    }

    throw new Error('开启实验性功能 打开 chreom://flags 中的 Experimental Web Platform features');
  }

  /**
   * 移动文件夹（优先使用实验性 move；不支持则直接报错）
   * @param targetDir 目标目录
   * @param targetName 目标文件夹名（默认保持原名）
   */
  async moveTo(targetDir: DirTreeEntity, targetName?: string) {
    const nextName = (targetName ?? this.name ?? '').trim();
    if (!nextName) throw new Error('文件夹名不能为空');
    if (nextName.includes('/')) throw new Error('文件夹名不能包含 /');
    if (!this.parent) throw new Error('无法移动根节点');
    if (!targetDir) throw new Error('目标目录不能为空');
    if (targetDir === this.parent && nextName === this.name) return;

    // 冲突检测（以目录树当前数据为准）
    const exists = (targetDir.children || []).some((ch: any) => ch?.name === nextName);
    if (exists) throw new Error(`目标目录下已存在文件夹「${nextName}」`);

    const fsHandle: any = this.handle as any;
    if (typeof fsHandle?.move === 'function') {
      // 尝试跨目录 move（不同实现签名可能不一致）
      try {
        await fsHandle.move(targetDir.handle, { name: nextName });
      } catch (e1) {
        await fsHandle.move(targetDir.handle, nextName);
      }

      // 重新拿到移动后的目录 handle
      this.handle = await targetDir.handle.getDirectoryHandle(nextName, { create: false });
      this.parent = targetDir;
      this.name = nextName;
      const nextKey = `${targetDir.key}/${this.name}`;
      this.updateKeyRecursive(nextKey);
      return;
    }

    throw new Error('文件夹拖拽移动暂不支持：需要开启实验性功能（chreom://flags -> Experimental Web Platform features）');
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
