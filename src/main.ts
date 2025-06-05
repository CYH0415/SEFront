import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { router } from './router'

// 导入 Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createPinia } from 'pinia';

const app = createApp(App);
app.use(router);
app.use(ElementPlus);
const pinia = createPinia();
app.use(pinia);
// app.use(sectionRouter);
app.mount('#app');