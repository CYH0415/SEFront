import { createApp } from 'vue';
import App from './App.vue';
import { sectionRouter } from './router';
import pinia from './store';
import './style.css'; 
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

const app = createApp(App);
app.use(sectionRouter);
app.use(pinia);
app.use(ElementPlus); 
app.mount('#app');