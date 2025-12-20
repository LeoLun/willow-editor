let fsMap: Record<string, FileSystemFileHandle> = {};
let proxyEnabled = true;

function getMime(name: string) {
  if (name.endsWith('.html')) return 'text/html';
  if (name.endsWith('.js')) return 'application/javascript';
  if (name.endsWith('.css')) return 'text/css';
  return 'application/octet-stream';
}

export async function respondFileByPath(filePath: string) {
  if (!proxyEnabled) {
    return new Response('Proxy disabled', { status: 503 });
  }
  const handle = fsMap[filePath];
  if (!handle) {
    return new Response(`Not Found: ${filePath}`, { status: 404 });
  }

  const file = await handle.getFile();
  const buffer = await file.arrayBuffer();

  return new Response(buffer, {
    headers: {
      'Content-Type': getMime(file.name),
      'Cache-Control': 'no-cache',
    },
  });
}

function extractLivePathname(fullPathname: string) {
  // Router 的 prefix 是 /willow-editor；这里不能直接 startsWith('/live')
  // 统一从 pathname 里截取出以 /live 开头的子串（例如 /willow-editor/live/a/b -> /live/a/b）
  const idx = fullPathname.indexOf('/live');
  if (idx < 0) return null;
  return fullPathname.slice(idx);
}

async function handleLocalFile(livePathname: string) {
  let filePath = livePathname.replace('/live', '');
  if (filePath === '/') filePath = '/index.html';
  return respondFileByPath(filePath);
}

export function initFs(fs: Record<string, FileSystemHandle>) {
  fsMap = fs as unknown as Record<string, FileSystemFileHandle>;
}

export function setProxyEnabled(v: boolean) {
  proxyEnabled = !!v;
  if (!proxyEnabled) {
    fsMap = {};
  }
}

export default (event: FetchEvent) => {
  const url = new URL(event.request.url);
  const livePathname = extractLivePathname(url.pathname);
  if (!livePathname) return;

  event.respondWith((async () => {
    const res = await handleLocalFile(livePathname);
    return res ?? new Response('Not Found', { status: 404 });
  })());
};
