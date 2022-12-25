import LiveWorker from './service-worker/live-worker';
import Router from './lib/service-worker-router/index';

declare let self: ServiceWorkerGlobalScope;

const router = new Router({
  prefix: '/willow-editor',
});
router.get('/live', LiveWorker);

self.addEventListener('install', () => {
  console.log('Attempting to install service worker and cache static assets');
});

self.addEventListener('activate', () => {
  console.log('Claiming control');
});

self.addEventListener('fetch', (event) => {
  // 给 /live 注册 live-worker
  router.handleEvent(event);
});

export default null;
