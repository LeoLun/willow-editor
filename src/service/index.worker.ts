import LiveWorker, { initFs, setProxyEnabled } from './live.worker';
import FileInfoWorker from './file-info.worker';
import Router from './router/index';

declare let self: ServiceWorkerGlobalScope;

const router = new Router({
  prefix: '/willow-editor',
});
router.get('/live', LiveWorker);
router.get('/file-info', FileInfoWorker);
router.get('/fileInfo', FileInfoWorker);

self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('Attempting to install service worker and cache static assets');
  // 让 SW 尽快接管 /willow-editor scope（避免首次打开 /live 需要手动刷新）
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('Claiming control');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (e) => {
  const type = e?.data?.type;
  if (type === 'INIT_FS' || type === 'SYNC_FS') {
    initFs(e.data.files || {});
  }
  if (type === 'SET_PROXY_ENABLED') {
    setProxyEnabled(!!e?.data?.enabled);
  }
});

self.addEventListener('fetch', (event) => {
  // 给 /live 注册 live-worker
  router.handleEvent(event);
});

export default null;
