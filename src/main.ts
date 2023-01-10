import { createApp } from 'vue';
import { registerSW } from 'virtual:sw-plugin';
import SvgIcon from '@/components/svg-icon/index.vue';
// import ToastService from '@/components/toast/index';
// import DialogService from '@/components/dialog/index';
// import {
//   IToastService,
//   IDialogService,
// } from '@/common/const';

import App from './app.vue';

import 'virtual:svg-icons-register';
import './style.less';

registerSW('sw.js', {
  scope: '/willow-editor',
  updateViaCache: 'none',
}).catch(console.error);
const app = createApp(App);
app.component('SvgIcon', SvgIcon);
// app.provide(IToastService, ToastService);
// app.provide(IDialogService, DialogService);
app.mount('#app');
