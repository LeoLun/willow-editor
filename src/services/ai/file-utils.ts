import {
  DirTreeEntity,
  FileTreeEntity,
  TreeEntity,
  FileEntity,
} from '@/entity';

export function flattenSelectedToFiles(selected: TreeEntity[]) {
  const result: FileTreeEntity[] = [];
  const seen = new Set<string>();

  const walk = (node: TreeEntity) => {
    if (DirTreeEntity.isDirectory(node)) {
      const dir = node as DirTreeEntity;
      dir.children.forEach((ch) => walk(ch));
      return;
    }
    const file = node as FileTreeEntity;
    if (!seen.has(file.key)) {
      seen.add(file.key);
      result.push(file);
    }
  };

  selected.forEach((n) => walk(n));
  return result;
}

export async function readTextFileContent(file: FileTreeEntity) {
  const fe = new FileEntity(file.key, file.name, file.handle);
  const content = await fe.fetchContent();
  return { fileEntity: fe, content };
}
