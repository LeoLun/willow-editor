import { createApp } from 'vue';
import './style.less';
import App from './app.vue';
import SvgIcon from './components/svg-icon/index.vue';
import 'virtual:svg-icons-register';

createApp(App).component('SvgIcon', SvgIcon).mount('#app');
