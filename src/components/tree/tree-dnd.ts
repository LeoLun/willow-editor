/* eslint-disable class-methods-use-this */
import { TreeEntity } from '@/entity';

class TreeDnD {
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
      accept: targetElement.isDirectory && treeEntity.parent !== targetElement
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
  drop(tree: any, data: any, targetElement: TreeEntity) {
    // first remove droppedNode  from immediate parent
    /**
         * @type {TreeEntity}
         */
    const droppedNode = data.elements[0] as TreeEntity;

    /**
         * @type {TreeEntity}
         */
    const { parent } = droppedNode;

    /**
         * @type {Array<TreeEntity>}
         */
    const oldParentNewChildren = parent!.children.filter((n: TreeEntity) => n !== droppedNode);

    parent!.children = oldParentNewChildren;

    // next add it as a child of the new parent
    targetElement.children.push(droppedNode);

    // sort the children
    targetElement.children.sort((a, b) => {
      // directories have higher precedence
      if (a.isDirectory && !b.isDirectory) return -1;

      if (!a.isDirectory && b.isDirectory) return 1;

      const nameA = a.name.toLowerCase(); // ignore upper and lowercase
      const nameB = b.name.toLowerCase(); // ignore upper and lowercase

      if (nameA < nameB) return -1;

      if (nameA > nameB) return 1;

      return 0;
    });

    // set targetElement as the new parent for droppedNode
    droppedNode.parent = targetElement;

    // finally refresh tree
    tree.model.refresh(parent);
    tree.model.refresh(targetElement);

    console.log(`moved ${data.elements[0].name} to ${targetElement.name}`);
  }
}

export default TreeDnD;
