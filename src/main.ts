// src/main.ts (修改后)

import { createApp } from 'vue'
import App from './App.vue' // 假设您的根组件是 App.vue
import { router } from './router' // 导入全局路由
import './style.css' // 导入您的全局样式
import { createPinia } from 'pinia'  // 引入 Pinia
import ElementPlus from 'element-plus' // 引入 Element Plus
import 'element-plus/dist/index.css' // 引入样式

// 创建 Pinia 实例
const pinia = createPinia()
const app = createApp(App)

// --- 开发环境默认登录用户 ---
// 这个 'if' 判断语句确保以下代码只在开发模式下运行，
// 在最终打包上线（生产环境）时会被自动移除，保证了线上环境的安全性。
if (import.meta.env.DEV) {
    console.log(
        '%c[开发模式] 已启用默认用户自动登录。',
        'color: #007bff; font-weight: bold;'
    );

    // 在这里定义您想默认登录的用户信息
    // 您可以随时修改 role 为 'student' 来以学生身份进入
    const defaultUser = {
        token: 'dev-token-for-testing-only', // 模拟的令牌
        role: 'teacher',                     // 角色: 'teacher' 或 'student'
        username: '默认教师用户',             // 显示的用户名
        userId: 'T999'                       // 用户ID
    };

    // 为了避免每次刷新都覆盖，可以检查token是否存在
    if (!localStorage.getItem('token')) {
        localStorage.setItem('token', defaultUser.token);
        localStorage.setItem('userRole', defaultUser.role);
        localStorage.setItem('username', defaultUser.username);
        // 您的 App.vue 从一个 'user' 对象里读取 userId，我们也模拟这个结构
        localStorage.setItem('user', JSON.stringify({ userId: defaultUser.userId }));
    }

}
// --- 默认登录用户设置结束 ---

app.use(pinia)
app.use(router)
app.use(ElementPlus)

app.mount('#app')