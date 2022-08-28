import TreeEntity from './tree-entity';

class FileTreeEntity extends TreeEntity {
  handle: FileSystemFileHandle;

  constructor(
    key: string,
    parentKey: string | null,
    name: string,
    parent: TreeEntity | null,
    handle: FileSystemFileHandle,
  ) {
    super(key, parentKey, name, parent, false);
    this.handle = handle;
  }
}

export default FileTreeEntity;
