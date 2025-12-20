import { respondFileByPath } from './live.worker';

function normalizeFilePath(p: string) {
  const s = (p || '').trim();
  if (!s) return '';
  return s.startsWith('/') ? s : `/${s}`;
}

function extractFilePathFromRequest(url: URL) {
  // 1) query 优先：?path=/a/b 或 ?key=/a/b
  const fromQuery = url.searchParams.get('path') || url.searchParams.get('key') || '';
  if (fromQuery) return normalizeFilePath(decodeURIComponent(fromQuery));

  // 2) path 兜底：/willow-editor/file-info/<encodedPath>
  const idx = url.pathname.indexOf('/file-info');
  if (idx < 0) return '';
  const rest = url.pathname.slice(idx + '/file-info'.length);
  return normalizeFilePath(decodeURIComponent(rest));
}

export default (event: FetchEvent) => {
  const url = new URL(event.request.url);
  const filePath = extractFilePathFromRequest(url);
  if (!filePath) {
    event.respondWith(new Response('Bad Request: missing file path', { status: 400 }));
    return;
  }

  event.respondWith(respondFileByPath(filePath));
};
