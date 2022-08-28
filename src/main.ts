import { createApp } from 'vue';
import './style.css';
import App from './app.vue';
import SvgIcon from './components/svg-icon.vue';
import 'virtual:svg-icons-register';

createApp(App).component('SvgIcon', SvgIcon).mount('#app');
