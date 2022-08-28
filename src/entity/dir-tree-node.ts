import TreeEntity from './tree-entity';

class DirTreeEntity extends TreeEntity {
  handle: FileSystemDirectoryHandle;

  constructor(
    key: string,
    parentKey: string | null,
    name: string,
    parent: TreeEntity | null,
    handle: FileSystemDirectoryHandle,
  ) {
    super(key, parentKey, name, parent, true);
    this.handle = handle;
  }
}

export default DirTreeEntity;
