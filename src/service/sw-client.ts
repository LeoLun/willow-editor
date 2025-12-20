import type { DirTreeEntity, FileTreeEntity } from '@/entity';
import { DirTreeEntity as DirTree } from '@/entity';

type FsMap = Record<string, FileSystemFileHandle>;

export function collectFileHandles(root: DirTreeEntity): FsMap {
  const walk = (dir: DirTreeEntity): FsMap => (dir.children || []).reduce<FsMap>((acc, child) => {
    if (DirTree.isDirectory(child as any)) {
      return {
        ...acc,
        ...walk(child as any),
      };
    }

    const f = child as unknown as FileTreeEntity;
    // 这里用 TreeEntity.key（形如 /RootDir/path/to/file.ext），与 SW 里 /live 解析出的 filePath 对齐
    return {
      ...acc,
      [f.key]: f.handle,
    };
  }, {});

  return walk(root);
}

async function getWillowRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;

  // 1) 优先按 scope 精确找（页面未被 SW 控制时，ready/controller 可能不可用）
  const regs = await navigator.serviceWorker.getRegistrations();
  const byScope = regs.find((r) => r.scope.endsWith('/willow-editor/'));
  if (byScope) return byScope;

  // 2) 兜底：取任意一个 active 且 scope 含 /willow-editor 的注册
  const fallback = regs.find((r) => r.scope.includes('/willow-editor'));
  return fallback ?? null;
}

async function postMessageToWillowSW(message: any) {
  const reg = await getWillowRegistration();
  const sw = reg?.active ?? reg?.waiting ?? reg?.installing ?? null;
  if (!sw) return;
  sw.postMessage(message);
}

/**
 * 同步当前目录树的文件句柄映射到 Service Worker
 * - SW 用它来把 /willow-editor/live/... 或 /willow-editor/file-info?... 请求代理成对应的本地文件内容响应
 */
export async function syncDirectoryToServiceWorker(root: DirTreeEntity) {
  const files = collectFileHandles(root);
  await postMessageToWillowSW({
    type: 'INIT_FS',
    files,
  });
}

export async function setServiceWorkerProxyEnabled(enabled: boolean) {
  await postMessageToWillowSW({
    type: 'SET_PROXY_ENABLED',
    enabled: !!enabled,
  });
}
