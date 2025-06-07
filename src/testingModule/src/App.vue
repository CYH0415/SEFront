<template>
  <div class="layout">
    <aside v-if="isLoggedIn" class="sidebar">
      <h2 @click="goToDashboard" style="cursor: pointer;" title="返回系统主页">
        在线测试子系统
      </h2>
      <nav>

        <div class="menu-divider"></div>

        <router-link to="/testing/student/dashboard" v-if="isStudent"><i class="icon-exam-info"></i> 考试信息</router-link>
        <router-link to="/testing/student/results" v-if="isStudent"><i class="icon-records"></i> 答题记录</router-link>
        <router-link to="/testing/student/past-papers" v-if="isStudent"><i class="icon-history"></i> 历年真题</router-link>

        <router-link to="/testing/teacher/dashboard" v-if="isTeacher"><i class="icon-teacher-home"></i> 教师首页</router-link>
        <router-link to="/testing/teacher/question-bank" v-if="isTeacher"><i class="icon-question-bank"></i> 题库管理</router-link>
        <router-link to="/testing/teacher/create-paper" v-if="isTeacher"><i class="icon-create-paper"></i> 编辑发布试卷</router-link>
        <router-link to="/testing/teacher/past-papers" v-if="isTeacher"><i class="icon-history"></i> 查看历年卷</router-link>
        <router-link to="/testing/teacher/exam-management" v-if="isTeacher"><i class="icon-exam-management"></i> 考试情况管理</router-link>
        <router-link to="/testing/teacher/endedexam-detail" v-if="isTeacher"><i class="icon-analysis"></i> 考试成绩管理</router-link>
      </nav>
    </aside>

    <main class="content">
      <header class="top-bar" v-if="isLoggedIn">
        <div class="time-display">
          {{ currentTime }}
        </div>
        <div class="user-area" @click="toggleDropdown">
          <img src="./assets/default_teacher.png" alt="头像" class="avatar" />
          <span class="username">{{ username }}</span>
          <svg class="arrow" :class="{ 'is-open': dropdownVisible }" viewBox="0 0 1024 1024" width="12" height="12">
            <path d="M512 672L192 352h640z" fill="#333" />
          </svg>
        </div>

        <div v-if="dropdownVisible" class="dropdown-menu">
          <div class="dropdown-item" @click="goToDashboard"><i class="icon-dashboard"></i>返回主页</div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-item" @click="logout"><i class="icon-logout"></i>退出登录</div>
        </div>
      </header>

      <div class="page-container">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {userStore} from "../../infoModule/src/store/user.js";

const route = useRoute();
const router = useRouter();

// 用户信息 - 使用 ref 进行响应式管理
const username = ref('访客');
const userRole = ref(null);
const isAuthenticated = ref(false);

// 用 computed 实时获取用户名/ID，优先用 username
const displayedName = computed(() => {
  return localStorage.getItem('username') || JSON.parse(localStorage.getItem('user'))?.userId || '用户';
});

const dropdownVisible = ref(false);
const currentTime = ref('');
let intervalId = null;

// 函数：从 localStorage 更新认证状态和用户信息到响应式 ref
const updateAuthState = () => {
  const token = localStorage.getItem('userToken');
  const roleFromStorage = localStorage.getItem('userRole');
  const usernameFromStorage = localStorage.getItem('username');

  // --- 关键修正 ---
  isAuthenticated.value = !!token; // 使用两个感叹号来正确转换布尔值
  // -----------------

  if (isAuthenticated.value) {
    userRole.value = roleFromStorage;
    username.value = usernameFromStorage || (roleFromStorage === 'student' ? '学生用户' : (roleFromStorage === 'teacher' ? '教师用户' : '用户'));
  } else {
    userRole.value = null;
    username.value = '访客';
  }
};

// 登录状态判断 (基于 isAuthenticated ref)
const isLoggedIn = computed(() => isAuthenticated.value);

// 角色判断 (基于 userRole ref 和 isAuthenticated ref)
const isStudent = computed(() => isLoggedIn.value && userRole.value === 'student');
const isTeacher = computed(() => isLoggedIn.value && userRole.value === 'teacher');

const formatTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

onMounted(() => {
  currentTime.value = formatTime();
  intervalId = setInterval(() => {
    currentTime.value = formatTime();
  }, 1000);

  updateAuthState();

  window.addEventListener('storage', updateAuthState);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
  window.removeEventListener('storage', updateAuthState);
});

watch(() => route.fullPath, () => {
  updateAuthState();
});

const toggleDropdown = () => {
  dropdownVisible.value = !dropdownVisible.value;
};

// --- MODIFICATION: 修正登出逻辑 ---
const logout = () => {
  if (confirm("您确定要退出登录吗？")) {
    // 清除所有相关的 localStorage 项
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    localStorage.removeItem('user'); // 确保清除包含 userId 的 'user' 对象
    userStore().logout();
    // 立即更新组件内的状态
    updateAuthState();

    dropdownVisible.value = false;
    // 使用 replace 跳转到登录页，这样用户无法通过浏览器后退返回
    router.replace({ path: '/login' });
  }
};

// --- MODIFICATION: 新增返回 Dashboard 的方法 ---
const goToDashboard = () => {
  router.push({path: '/login'});
}

</script>

<style scoped>
/* 您的美化样式保持不变 */
.layout {
  display: flex; height: 100vh; width: 100vw;
  margin: 0; padding: 0; box-sizing: border-box;
  overflow: hidden; font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
.sidebar {
  width: 260px; background: linear-gradient(135deg, #1a237e, #0d47a1);
  color: white; padding: 24px; box-sizing: border-box;
  box-shadow: 3px 0 15px rgba(0,0,0,0.1); z-index: 100;
  display: flex; flex-direction: column;
}
.sidebar h2 {
  margin-bottom: 32px; font-size: 22px; font-weight: 600;
  letter-spacing: 0.5px; padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.sidebar nav a {
  display: flex; align-items: center; gap: 10px;
  color: rgba(255, 255, 255, 0.9); text-decoration: none;
  margin-bottom: 12px; padding: 12px 16px; border-radius: 8px;
  transition: all 0.2s ease; font-size: 15px;
}
.sidebar nav a:hover {
  background-color: rgba(255, 255, 255, 0.15);
  transform: translateX(4px);
}
.sidebar nav a.router-link-active {
  background-color: rgba(255, 255, 255, 0.2);
  font-weight: 500; color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.content {
  flex: 1; height: 100vh; overflow-y: auto; background-color: #f8f9fa;
  margin: 0; padding: 0; box-sizing: border-box;
  display: flex; flex-direction: column;
}
.top-bar {
  width: 100%; height: 64px; background-color: white;
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 32px; box-sizing: border-box;
  border-bottom: 1px solid #e0e0e0; position: relative;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.time-display { font-size: 14px; color: #6c757d; font-weight: 500; }
.user-area {
  display: flex; align-items: center; cursor: pointer; user-select: none;
  padding: 8px 12px; border-radius: 8px; transition: background-color 0.2s ease;
}
.user-area:hover { background-color: #f8f9fa; }
.avatar {
  width: 40px; height: 40px; border-radius: 50%; margin-right: 12px;
  border: 2px solid #e0e0e0; transition: border-color 0.2s ease;
}
.user-area:hover .avatar { border-color: #0d47a1; }
.username { font-size: 15px; color: #333; margin-right: 8px; font-weight: 500; }
.arrow { color: #333; transition: transform 0.2s ease; }
.arrow.is-open { transform: rotate(180deg); }

.dropdown-menu {
  position: absolute; top: 72px; right: 32px; background: white;
  border: 1px solid #e0e0e0; box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  border-radius: 8px; overflow: hidden; z-index: 100; min-width: 160px;
  animation: slideDown 0.2s ease;
}
@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
.dropdown-item {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 20px; font-size: 14px; color: #333;
  cursor: pointer; transition: background-color 0.2s ease, color 0.2s ease;
}
.dropdown-item:hover { background-color: #0d47a1; color: white; }
.dropdown-divider { height: 1px; background-color: #f0f0f0; margin: 5px 0; }

.page-container { flex: 1; padding: 24px; box-sizing: border-box; }
.menu-divider { height: 1px; background-color: rgba(255,255,255,0.1); margin: 15px 0; }
/* Placeholder Icons */
</style>