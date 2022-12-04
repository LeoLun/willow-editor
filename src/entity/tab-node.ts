import FileEntity from './file';

class TabNodeEntity {
  preview: boolean;

  file: FileEntity;

  constructor(
    file: FileEntity,
    preview: boolean,
  ) {
    this.preview = preview;
    this.file = file;
  }
}

export default TabNodeEntity;
