import { FileEntity, DirTreeEntity } from '@/entity';
import type { FileTreeEntity } from '@/entity';

export type AiFileInfo = {
  key: string;
  path: string;
  name: string;
  suffix: string;
  size: number;
  mimeType: string;
  lastModified: number;
  lastModifiedISO: string;
};

export type AiFileNameRelations = {
  originalName: string;
  extension: string;
  baseName: string;
  siblingNames: string[];
  relatedSiblingNames: string[];
};

function splitName(name: string) {
  const idx = name.lastIndexOf('.');
  if (idx <= 0) return { baseName: name, extension: '' };
  return { baseName: name.slice(0, idx), extension: name.slice(idx) };
}

export async function readSelectedFileInfo(file: FileTreeEntity): Promise<AiFileInfo> {
  const f = await file.handle.getFile();
  return {
    key: file.key,
    path: (file.path || file.name || file.key).toString(),
    name: file.name,
    suffix: file.suffix || '',
    size: f.size,
    mimeType: f.type || '',
    lastModified: f.lastModified || 0,
    lastModifiedISO: f.lastModified ? new Date(f.lastModified).toISOString() : '',
  };
}

export function readFileNameAndAssociations(file: FileTreeEntity): AiFileNameRelations {
  const { baseName, extension } = splitName(file.name);
  const siblingNames = (file.parent?.children || [])
    .filter((ch: any) => !DirTreeEntity.isDirectory(ch))
    .map((ch: any) => String(ch.name || ''))
    .filter((n) => !!n && n !== file.name);

  const relatedSiblingNames = siblingNames.filter((n) => {
    const s = splitName(n);
    return s.baseName === baseName;
  });

  return {
    originalName: file.name,
    extension,
    baseName,
    siblingNames,
    relatedSiblingNames,
  };
}

export async function readTextSnippet(file: FileTreeEntity, maxChars = 4000): Promise<string> {
  const fe = new FileEntity(file.key, file.name, file.handle);
  // @ts-ignore - FileEntity 有 type 字段
  if ((fe as any).type === 'image') return '';
  const content = await fe.fetchContent();
  const text = (content ?? '').toString();
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars)}\n\n// ...已截断（仅发送前 ${maxChars} 字符）`;
}
