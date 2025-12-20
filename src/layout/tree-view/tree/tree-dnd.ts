/* eslint-disable class-methods-use-this */
import {
  TreeEntity,
  DirTreeEntity,
  FileTreeEntity,
} from '@/entity';

export type TreeDidMovePayload = {
  node: TreeEntity;
  from: DirTreeEntity;
  to: DirTreeEntity;
  oldKey: string;
  newKey: string;
};

export type TreeMoveErrorPayload = {
  node: TreeEntity;
  from: DirTreeEntity;
  to: DirTreeEntity;
  oldKey: string;
  error: any;
};

export type TreeDnDHooks = {
  onDidMove?: (payload: TreeDidMovePayload) => void;
  onMoveError?: (payload: TreeMoveErrorPayload) => void;
};

class TreeDnD {
  private hooks: TreeDnDHooks;

  constructor(hooks?: TreeDnDHooks) {
    this.hooks = hooks || {};
  }

  /**
     * Get the uri of the dragged node
     * @param {Tree} tree monaco tree
     * @param {TreeEntity} element tree node object
     */
  getDragURI(tree: any, element: TreeEntity): string {
    return element.key;
  }

  /**
     * Get the label of the dragged node
     * @param {Tree} tree monaco tree
     * @param {TreeEntity} elements tree node object
     */
  getDragLabel(tree: any, elements: TreeEntity[]) {
    return elements[0].name;
  }

  /**
     * On drag start event handler
     * @param {Tree} tree moncao tree
     * @param {{}} data drag data
     * @param {Event} originalEvent original drag event
     */
  // onDragStart(tree: any, data: any, originalEvent: DragEvent) {

  // }
  onDragStart() {
    // TODO: implement
  }

  /**
     * On drag over event handler. Determines if dragged node can be dropped ontop or not
     * @param {Tree} tree monaco tree
     * @param {{}} data drag data
     * @param {TreeEntity} targetElement node being dragged over
     * @param {Event} originalEvent original drag event
     */
  // onDragOver(tree: any, data: any, targetElement: TreeEntity, originalEvent: DragEvent) {
  onDragOver(tree: any, data: any, targetElement: TreeEntity) {
    /**
         * @type {TreeEntity}
         */
    const treeEntity = data.elements[0];

    return {
      accept: DirTreeEntity.isDirectory(targetElement) && treeEntity.parent !== targetElement
        && !targetElement.isDescendantOf(treeEntity),
      autoExpand: true,
    };

    // return null;
  }

  /**
     * Handler when tree node is dropped on a target
     * @param {Tree} tree monaco tree
     * @param {{}} data drag data
     * @param {TreeEntity} targetElement node being dropped on
     * @param {Event} originalEvent original drag event
     */
  // drop(tree: any, data: any, targetElement: TreeEntity, originalEvent: DragEvent) {
  drop(tree: any, data: any, targetElement: DirTreeEntity) {
    // 注意：treeView.js 不会 await drop，所以这里用异步任务执行真实 move
    this.handleDrop(tree, data, targetElement);
  }

  private async handleDrop(tree: any, data: any, targetElement: DirTreeEntity) {
    const droppedNode = data.elements[0] as TreeEntity;
    const from = droppedNode.parent;
    if (!from) return;
    const oldKey = droppedNode.key;

    try {
      // 真实移动（文件：moveTo 支持回退 copy+delete；文件夹：需要实验性 move）
      if (DirTreeEntity.isDirectory(droppedNode)) {
        await (droppedNode as DirTreeEntity).moveTo(targetElement);
      } else {
        await (droppedNode as FileTreeEntity).moveTo(targetElement);
      }
    } catch (error: any) {
      this.hooks.onMoveError?.({
        node: droppedNode,
        from,
        to: targetElement,
        oldKey,
        error,
      });
      return;
    }

    // 成功后再更新内存树结构（避免失败需要回滚）
    from.children = (from.children || []).filter((n: TreeEntity) => n !== droppedNode);
    if (!(targetElement.children || []).includes(droppedNode)) {
      targetElement.children.push(droppedNode);
    }
    targetElement.sortChildren();

    droppedNode.parent = targetElement;

    // finally refresh tree
    tree.model.refresh(from);
    tree.model.refresh(targetElement);

    this.hooks.onDidMove?.({
      node: droppedNode,
      from,
      to: targetElement,
      oldKey,
      newKey: droppedNode.key,
    });
  }
}

export default TreeDnD;
