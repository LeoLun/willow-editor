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

  /**
   * 移动文件
   * 说明：优先尝试实验性 File System Access `handle.move(...)`；不支持时回退到 copy + delete
   * @param targetDir 目标目录
   * @param targetFilename 目标文件名（默认保持原名）
   */
  async moveTo(targetDir: DirTreeEntity, targetFilename?: string) {
    const targetName = (targetFilename ?? this.name ?? '').trim();
    if (!targetName) throw new Error('文件名不能为空');
    if (targetName.includes('/')) throw new Error('文件名不能包含 /');
    if (!this.parent) throw new Error('无法移动根节点');
    if (!targetDir) throw new Error('目标目录不能为空');
    // eslint-disable-next-line no-useless-return
    if (targetDir === this.parent && targetName === this.name) return;

    // 冲突检测（以目录树当前数据为准）
    const exists = (targetDir.children || []).some((ch: any) => ch?.name === targetName);
    if (exists) throw new Error(`目标目录下已存在文件「${targetName}」`);

    const sourceParent = this.parent;

    // 1) 尝试实验性 move API（部分环境可用，且可能支持跨目录）
    const fsHandle: any = this.handle as any;
    if (typeof fsHandle?.move === 'function') {
      try {
        // 可能的签名：move(directoryHandle, { name })
        await fsHandle.move(targetDir.handle, { name: targetName });
        this.handle = await targetDir.handle.getFileHandle(targetName, { create: false });
        this.parent = targetDir;
        this.name = targetName;
        const match = targetName.match(/\.[^\\.]+$/);
        this.suffix = match ? match[0] : '';
        this.key = `${targetDir.key}/${this.name}`;
        return;
      } catch (e1) {
        try {
          // 可能的签名：move(directoryHandle, name)
          await fsHandle.move(targetDir.handle, targetName);
          this.handle = await targetDir.handle.getFileHandle(targetName, { create: false });
          this.parent = targetDir;
          this.name = targetName;
          const match = targetName.match(/\.[^\\.]+$/);
          this.suffix = match ? match[0] : '';
          this.key = `${targetDir.key}/${this.name}`;
          return;
        } catch (e2) {
          // ignore -> fallback copy + delete
        }
      }
    }

    // 2) fallback：copy + delete
    const file = await this.handle.getFile();
    const targetHandle = await targetDir.handle.getFileHandle(targetName, { create: true });
    // createWritable 也是实验性/实现相关，但在常见浏览器可用
    const writable = await (targetHandle as any).createWritable();
    await writable.write(file);
    await writable.close();

    // 删除源文件（最后做，避免失败导致丢数据）
    await sourceParent.handle.removeEntry(this.name);

    // 更新节点自身信息
    this.handle = targetHandle;
    this.parent = targetDir;
    this.name = targetName;
    const match = targetName.match(/\.[^\\.]+$/);
    this.suffix = match ? match[0] : '';
    this.key = `${targetDir.key}/${this.name}`;
  }

  /**
   * 重命名文件
   * @param filename 新文件名
   */
  async rename(filename: string) {
    const next = (filename || '').trim();
    if (!next) throw new Error('文件名不能为空');
    if (next.includes('/')) throw new Error('文件名不能包含 /');
    if (!this.parent) throw new Error('无法重命名根节点');
    if (next === this.name) return;

    // 冲突检测
    const exists = (this.parent.children || []).some((ch: any) => ch?.name === next);
    if (exists) throw new Error(`同目录下已存在文件「${next}」`);

    // 尝试使用实验性 move API（部分环境可用）
    const fsHandle: any = this.handle as any;
    if (typeof fsHandle?.move === 'function') {
      await fsHandle.move(next);
      this.name = next;
      const match = next.match(/\.[^\\.]+$/);
      this.suffix = match ? match[0] : '';
      this.key = `${this.parent.key}/${this.name}`;
      this.parent.sortChildren();
      return;
    }
    // 不兼容，直接报错提示用户开启实验性功能
    throw new Error('开启实验性功能 打开 chreom://flags 中的 Experimental Web Platform features');
  }

  /**
   * 删除文件
   */
  async remove() {
    if (this.parent) {
      await this.parent.removeChild(this);
    }
  }
}
