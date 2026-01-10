import { DirTreeEntity, FileEntity } from '@/entity';
import type { FileTreeEntity } from '@/entity';

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function globToRegExp(glob: string) {
  // 简化 glob：支持 **、*、?，并允许 {a,b} 形式（单层）
  let p = (glob || '').trim().replace(/\\/g, '/');
  if (!p) p = '**/*';

  // {a,b} -> (a|b)
  p = p.replace(/\{([^}]+)\}/g, (_, inner) => {
    const items = inner.split(',').map((x: string) => escapeRegExp(x.trim()));
    return `(${items.join('|')})`;
  });

  // 先占位 **，避免被单个 * 处理
  p = p.replace(/\*\*/g, '__GLOBSTAR__');
  p = p.split('*').map((seg) => seg.split('?').map(escapeRegExp).join('.')).join('[^/]*');
  p = p.replace(/__GLOBSTAR__/g, '.*');

  return new RegExp(`^${p}$`);
}

function isTextFileByName(path: string) {
  const n = (path || '').toLowerCase();
  // 只过滤明显的二进制/图片，其他都尝试读取（FileEntity 会识别 image）
  return !/\.(png|jpe?g|gif|webp|ico|pdf|zip|tar|gz|7z|mp4|mp3|wav|ttf|woff2?)$/i.test(n);
}

export function collectAllFiles(root: any): FileTreeEntity[] {
  const out: FileTreeEntity[] = [];
  const walk = (node: any) => {
    if (!node) return;
    if (DirTreeEntity.isDirectory(node)) {
      (node.children || []).forEach((ch: any) => walk(ch));
      return;
    }
    out.push(node as FileTreeEntity);
  };
  walk(root);
  return out;
}

export function globFiles(root: any, pattern: string, limit = 200) {
  const files = collectAllFiles(root);
  const re = globToRegExp(pattern);
  const matched: string[] = [];
  for (let i = 0; i < files.length; i += 1) {
    const f = files[i];
    const p = String(f.path || f.name || '');
    if (p && re.test(p)) {
      matched.push(p);
      if (matched.length >= limit) {
        break;
      }
    }
  }
  return {
    ok: true,
    pattern,
    count: matched.length,
    files: matched,
    truncated: matched.length >= limit,
  };
}

export async function grepFiles(root: any, input: {
  query: string;
  filePattern?: string;
  limit?: number;
  maxFileSize?: number;
}) {
  const query = (input.query || '').toString();
  if (!query) return { ok: false, error: 'query 不能为空' };

  const limit = Number.isFinite(input.limit)
    ? Math.max(1, Math.floor(input.limit as number))
    : 200;
  const maxFileSize = Number.isFinite(input.maxFileSize)
    ? Math.max(10_000, Math.floor(input.maxFileSize as number))
    : 200_000;

  const pattern = input.filePattern?.trim();
  const re = pattern ? globToRegExp(pattern) : null;

  const files = collectAllFiles(root);
  const matches: Array<{ path: string; line: number; text: string }> = [];
  let scanned = 0;
  let skippedBinary = 0;
  let skippedLarge = 0;

  for (let fi = 0; fi < files.length; fi += 1) {
    const f = files[fi];
    const path = String(f.path || f.name || '');
    if (!path) {
      // skip
    } else if (re && !re.test(path)) {
      // skip
    } else if (!isTextFileByName(path)) {
      // skip
    } else {
      const fe = new FileEntity(f.key, f.name, f.handle);
      // @ts-ignore
      if ((fe as any).type === 'image') {
        skippedBinary += 1;
      } else {
        // eslint-disable-next-line no-await-in-loop
        const content = await fe.fetchContent();
        const text = (content ?? '').toString();
        scanned += 1;

        if (text.length > maxFileSize) {
          skippedLarge += 1;
        } else {
          const lines = text.split(/\r?\n/);
          for (let li = 0; li < lines.length; li += 1) {
            if (lines[li].includes(query)) {
              matches.push({ path, line: li + 1, text: lines[li].slice(0, 500) });
              if (matches.length >= limit) {
                return {
                  ok: true,
                  query,
                  filePattern: pattern || '',
                  scanned,
                  skippedBinary,
                  skippedLarge,
                  count: matches.length,
                  truncated: true,
                  matches,
                };
              }
            }
          }
        }
      }
    }
  }

  return {
    ok: true,
    query,
    filePattern: pattern || '',
    scanned,
    skippedBinary,
    skippedLarge,
    count: matches.length,
    truncated: false,
    matches,
  };
}
