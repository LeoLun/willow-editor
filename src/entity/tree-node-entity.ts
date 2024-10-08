import type DirTreeEntity from './dir-tree-node';

/** 目录树节点实体抽象类 */
export default abstract class TreeNodeEntity {
  /** key 节点唯一标识符 */
  key: string;

  /** 文件名 */
  name: string;

  /** 父节点 */
  parent: DirTreeEntity | null;

  /** 文件后缀 */
  suffix: string;

  constructor(
    key: string,
    name: string,
    parent: DirTreeEntity | null,
  ) {
    this.key = key;
    this.name = name;
    this.parent = parent;

    const match = name.match(/\.[^\\.]+$/);
    this.suffix = match ? match[0] : '';
  }

  /** 获取文件路径 */
  get path(): any {
    // if this is the rootnode (this.parent == null) then just return empty string
    // we don't need the rootnode's name appearing in the path of its children
    if (this.parent == null) return '';
    const parentPath = this.parent.path;
    return parentPath === '' ? this.name : `${parentPath}/${this.name}`;
  }

  /**
   * 判断是否位某个节点的子孙节点
   * @param treeEntity 需要判断的祖先节点
   * @returns 是否为子孙节点
   */
  isDescendantOf(treeEntity: TreeNodeEntity) {
    let { parent } = this;
    while (parent) {
      if (parent === treeEntity) {
        return true;
      }
      parent = parent.parent;
    }
    return false;
  }

  abstract rename(name: string): void;

  abstract remove(): void;
}
