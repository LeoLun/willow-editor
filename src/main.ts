import { createApp } from 'vue';
import { registerSW } from 'virtual:sw-plugin';
import App from './app.vue';
import SvgIcon from './components/svg-icon/index.vue';
import 'virtual:svg-icons-register';
import './style.less';

registerSW('sw.js', {
  scope: '/willow-editor',
  updateViaCache: 'none',
}).catch(console.error);
createApp(App).component('SvgIcon', SvgIcon).mount('#app');
