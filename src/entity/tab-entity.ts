import FileTreeEntity from './file-tree-nodde';

class TabEntity extends FileTreeEntity {
  content: string;

  oldMd5: string;

  newMd5: string;

  type: 'file' | 'image';

  constructor(
    fileEntity: FileTreeEntity,
    content: string,
    oldMd5: string,
    newMd5: string,
    type: 'file' | 'image',
  ) {
    super(
      fileEntity.key,
      fileEntity.parentKey,
      fileEntity.name,
      fileEntity.parent,
      fileEntity.handle,
    );
    this.content = content;
    this.oldMd5 = oldMd5;
    this.newMd5 = newMd5;
    this.type = type;
  }
}

export default TabEntity;
