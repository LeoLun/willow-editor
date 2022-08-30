import FileTreeEntity from './file-tree-nodde';

class TabEntity extends FileTreeEntity {
  content: string;

  oldMd5: string;

  newMd5: string;

  type: 'file' | 'image';

  preview: boolean;

  constructor(
    fileEntity: FileTreeEntity,
    content: string,
    oldMd5: string,
    newMd5: string,
    type: 'file' | 'image',
    preview: boolean,
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
    this.preview = preview;
  }
}

export default TabEntity;
