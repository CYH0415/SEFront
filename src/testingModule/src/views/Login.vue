<template>
  <div class="auth-redirector-page">
    <div class="status-card">
      <div class="loading-spinner"></div>
      <h1>教学管理系统</h1>
      <p class="status-text">{{ statusMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
// 导入您用于获取用户信息的函数
import { getCurrentUserId, getCurrentUserType } from '../../../infoModule/src/function/CurrentUser';

const router = useRouter();
const route = useRoute();

// 用于在界面上显示当前状态
const statusMessage = ref('正在验证您的身份，请稍候...');

// 页面加载后立即执行自动登录和跳转逻辑
onMounted(() => {
  performAutoLogin();
});

const performAutoLogin = async () => {
  try {
    // 1. 自动获取当前已登录用户的ID和类型
    const userId = await getCurrentUserId();
    let userType = await getCurrentUserType();

    if (!userId || !userType) {
      statusMessage.value = '无法获取用户信息，将跳转到主登录页...';
      // 如果获取不到信息，可能意味着主系统未登录，跳转到全局登录页
      // 等待2秒后跳转，让用户能看到提示
      setTimeout(() => router.replace('/login'), 2000);
      return;
    }

    statusMessage.value = '身份验证成功，正在为您跳转...';

    // 2. 将后端返回的角色（如 ROLE_TEACHER）转换为系统内部使用的角色（teacher）
    if (userType === "ROLE_ADMIN" || userType === "ROLE_TEACHER") {
      userType = "teacher";
    } else if (userType === "ROLE_STUDENT") {
      userType = "student";
    } else {
      // 未知角色处理
      statusMessage.value = `无法识别的用户角色: ${userType}`;
      return;
    }

    // 3. 将认证信息存入 localStorage，供导航守卫和其他页面使用
    const token = 'mock-token-for-' + userType; // 您可以保留或修改模拟token的逻辑
    localStorage.setItem('userToken', token);
    localStorage.setItem('userRole', userType); // 存储转换后的角色
    const userInfo = {
      role: userType,
      userId: userId
    };
    localStorage.setItem('user', JSON.stringify(userInfo));

    // 4. 执行跳转逻辑
    const redirectPath = route.query.redirect;
    if (redirectPath && typeof redirectPath === 'string' && redirectPath !== '/') {
      router.replace(redirectPath);
    } else {
      // 根据角色跳转到默认主页
      if (userType === 'student') {
        router.replace({ name: 'StudentHome' });
      } else if (userType === 'teacher') {
        router.replace({ name: 'TeacherHome' });
      } else {
        router.replace('/'); // 默认回退
      }
    }
  } catch (error) {
    console.error("自动登录失败:", error);
    statusMessage.value = '自动登录时发生错误，请重试。';
    // 可以选择跳转到错误页或主登录页
  }
};
</script>

<style scoped>
.auth-redirector-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f3f7;
  text-align: center;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.status-card {
  background: white;
  padding: 40px 50px;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #2c3e50;
  font-size: 2em;
  margin-top: 20px;
  margin-bottom: 10px;
}

.status-text {
  color: #6c757d;
  font-size: 1.1em;
}

/* 简单的加载动画 */
.loading-spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border-left-color: #007bff;
  margin: 0 auto;

  animation: spin 1s ease infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>