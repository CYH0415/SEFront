<template>
  <div class="layout">
    <aside class="sidebar">
      <h2>课程资源共享子系统</h2>      <nav>
        <router-link to="/sharing/course-list">我的课程</router-link>
      </nav>
    </aside>

    <main class="content">
      <!-- ⭐ 顶栏，右上角用户模块 -->
      <div class="top-bar">
        <div class="user-area" @click="toggleDropdown">
          <img src="https://i.pravatar.cc/40" alt="头像" class="avatar" />
          <span class="username">{{ username }}</span>
          <svg class="arrow" viewBox="0 0 1024 1024" width="12" height="12">
            <path d="M512 672L192 352h640z" fill="#333" />
          </svg>
        </div>

        <!-- 下拉菜单 -->
        <div v-if="dropdownVisible" class="dropdown-menu">
          <div class="dropdown-item" @click="logout">退出登录</div>
        </div>
      </div>

      <div class="page-container">
        <router-view :userId = "Number(userId)" :isStudent = "Boolean(isStudent)" v-if="isReady"></router-view>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { getCurrentUserId, getCurrentUserType } from '../../infoModule/src/function/CurrentUser';

const isStudent = ref(false);
const userId = ref(2);
const isReady = ref(false);
const username = ref('教师');  // 这里可以以后从后端接口动态拿到
const dropdownVisible = ref(false);

// 点击头像区域切换下拉框
const toggleDropdown = () => {
  dropdownVisible.value = !dropdownVisible.value;
}

// 点击退出登录
const logout = () => {
  alert('退出登录');
  // 这里可以添加真正的退出逻辑，比如跳转到登录页
}

onMounted(async() => {
  try{
    const type = await getCurrentUserType();
    isStudent.value = (type == 'ROLE_STUDENT');
    userId.value = await getCurrentUserId();
    isReady.value = true;
  } catch (e) {
    console.log(e);
  }
});
</script>

<style scoped>
/* 整个布局占满浏览器 */
.layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* 侧边栏固定宽度 */
.sidebar {
  width: 240px;
  background: linear-gradient(180deg, #0d47a1, #1565c0);
  color: white;
  padding: 20px;
  box-sizing: border-box;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
}

.sidebar h2 {
  margin-bottom: 30px;
  font-size: 20px;
  font-weight: bold;
  letter-spacing: 1px;
}

.sidebar nav a {
  display: block;
  color: white;
  text-decoration: none;
  margin-bottom: 15px;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.sidebar nav a:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.sidebar nav a.router-link-active {
  font-weight: bold;
  border-left: 4px solid white;
  padding-left: 8px;
}

/* 内容区域 */
.content {
  flex: 1;
  height: 100vh;
  overflow-y: auto;
  background-color: #f5f5f5;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

/* 顶部栏 */
.top-bar {
  width: 100%;
  height: 60px;
  background-color: #ffffff;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 30px;
  box-sizing: border-box;
  border-bottom: 1px solid #ddd;
  position: relative;
}

/* 用户信息区域 */
.user-area {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-right: 10px;
}

.username {
  font-size: 15px;
  color: #333;
  margin-right: 5px;
}

.arrow {
  transform: rotate(0deg);
  transition: transform 0.2s;
}

.user-area:hover .arrow {
  transform: rotate(180deg);
}

/* 下拉菜单 */
.dropdown-menu {
  position: absolute;
  top: 60px;
  right: 30px;
  background: white;
  border: 1px solid #ddd;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  overflow: hidden;
  z-index: 100;
}

.dropdown-item {
  padding: 10px 20px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: background-color 0.3s;
}

.dropdown-item:hover {
  background-color: #f0f0f0;
}

/* 页面内容容器 */
.page-container {
  width: 100%;
  flex-grow: 1;
  padding: 20px;
  box-sizing: border-box;
}

/* 其他美化 */
h1 {
  font-size: 28px;
  color: #0d47a1;
  border-bottom: 2px solid #0d47a1;
  padding-bottom: 8px;
  margin-bottom: 20px;
}

button, .el-button {
  background-color: #0d47a1 !important;
  color: white !important;
  border: none !important;
  border-radius: 6px !important;
  padding: 10px 20px !important;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(13, 71, 161, 0.3);
  transition: background-color 0.3s, transform 0.2s;
}

button:hover, .el-button:hover {
  background-color: #1565c0 !important;
  transform: translateY(-2px);
}

.el-table {
  border-radius: 10px;
  overflow: hidden;
}

.el-table th {
  background-color: #0d47a1;
  color: white;
  font-weight: bold;
}
</style>
