class TreeEntity {
  key: string;

  parentKey: string | null;

  name: string;

  parent: TreeEntity | null;

  isDirectory: boolean;

  children: TreeEntity[];

  constructor(
    key: string,
    parentKey: string | null,
    name: string,
    parent: TreeEntity | null,
    isDirectory: boolean,
  ) {
    this.key = key;
    this.parentKey = parentKey;
    this.name = name;
    this.parent = parent;
    this.isDirectory = isDirectory;
    this.children = [];
  }

  get path(): any {
    // if this is the rootnode (this.parent == null) then just return empty string
    // we don't need the rootnode's name appearing in the path of its children
    if (this.parent == null) return '';

    const parentPath = this.parent.path;

    return parentPath === '' ? this.name : `${parentPath}/${this.name}`;
  }

  isDescendantOf(treeEntity: TreeEntity) {
    let { parent } = this;
    while (parent) {
      if (parent === treeEntity) {
        return true;
      }
      parent = parent.parent;
    }
    return false;
  }
}

export default TreeEntity;
