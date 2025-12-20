import { createApp } from 'vue';
import { registerSW } from 'virtual:sw-plugin';
import SvgIcon from '@/components/svg-icon/index.vue';
import ToastService from '@/components/toast/index';
import DialogService from '@/components/dialog/index';
import { setRootAppContext } from '@/common/app-context';
import {
  IToastService,
  IDialogService,
} from '@/common/const';

import App from './app.vue';

import 'virtual:svg-icons-register';
import './style.less';

// 注意：SW 的 scope 必须位于 SW 脚本所在路径之下。
// 本项目在 GitHub Pages 等场景会用 base: '/willow-editor/'，因此这里统一用 BASE_URL。
const baseUrl = import.meta.env.BASE_URL; // 末尾带 '/'
registerSW(`${baseUrl}sw.js`, {
  scope: baseUrl,
  updateViaCache: 'none',
}).catch(console.error);

const app = createApp(App);
// Dialog/Toast 等独立 createApp() 的组件需要继承主应用的 provide/inject；这里存主 app 实例即可。
setRootAppContext(app);
app.component('SvgIcon', SvgIcon);
app.provide(IToastService, ToastService);
app.provide(IDialogService, DialogService);
app.mount('#app');
