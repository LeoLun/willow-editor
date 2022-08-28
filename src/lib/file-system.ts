import { DirTreeEntity, FileTreeEntity, TreeEntity } from '@/entity/index';

export const createDirTree = async (
  dirHandle: FileSystemDirectoryHandle,
  parentKey: string = '',
  parent: DirTreeEntity | null = null,
) => {
  const rootKey = `${parentKey}/${dirHandle.name}`;
  const root = new DirTreeEntity(
    rootKey,
    parentKey,
    dirHandle.name,
    parent,
    dirHandle,
  );

  // eslint-disable-next-line no-restricted-syntax
  for await (const [, value] of dirHandle.entries()) {
    if (value.kind === 'directory') {
      const dir = await createDirTree(value, rootKey, root);
      if (root.children) {
        root.children.push(dir);
      }
    } else if (root?.children) {
      const fileTreeEntity = new FileTreeEntity(
        `${rootKey}/${value.name}`,
        rootKey,
        value.name,
        root,
        value,
      );
      root.children.push(fileTreeEntity);
    }
  }
  // 针对 children 排序
  root.children.sort((a: TreeEntity, b: TreeEntity) => {
    if (a.isDirectory !== b.isDirectory) {
      if (a.isDirectory) {
        return -1;
      }
      return 1;
    }
    if (a.name > b.name) {
      return -1;
    }
    return 1;
  });
  return root;
};

export const getFileContent = async (fileHandle: FileSystemFileHandle, utfLabel = 'utf-8') => {
  const file = await fileHandle.getFile();
  const arrayBuffer = await file.arrayBuffer();

  const textDecoder = new TextDecoder(utfLabel);

  return textDecoder.decode(arrayBuffer);
};

export const getImageUrl = async (fileHandle: FileSystemFileHandle) => {
  const file = await fileHandle.getFile();
  const reader = new FileReader();

  return new Promise((resolve) => {
    reader.addEventListener('load', () => {
      resolve(reader.result);
    }, false);

    reader.readAsDataURL(file);
  });
};

export const writeFile = async (fileHandle: FileSystemFileHandle, content: string) => {
  console.time('writeFile');
  const writable = await fileHandle.createWritable();

  const textEncoder = new TextEncoder();
  const uint8Array = textEncoder.encode(content);
  await writable.write(uint8Array.buffer);
  await writable.close();
  console.timeEnd('writeFile');
};
