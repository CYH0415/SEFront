<template>
  <div class="layout">
    <aside class="sidebar">
      <h2>教师信息系统</h2>
      <nav>
        <RouterLink v-if="teacherId" :to="{ name: 'CourseResultT', params: { userId: teacherId } }" :class="{ active: $route.name === 'CourseResultT' }">
          查看选课结果
        </RouterLink>
      </nav>
    </aside>
    <main class="content">
      <div class="top-bar">
        <div class="user-area" @click="toggleDropdown">
          <span class="username">教师姓名</span>
          <svg class="arrow" viewBox="0 0 1024 1024" width="12" height="12">
            <path d="M512 672L192 352h640z" fill="#333" />
          </svg>
        </div>
        <div :class="{ 'dropdown-menu': true, show: isDropdownVisible }" @click.outside="closeDropdown">
          <div class="dropdown-item" @click="logout">退出登录</div>
        </div>
      </div>
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup>
import { computed ,ref,onMounted} from 'vue';
import { useRouter } from 'vue-router';
// 1. 导入你的 userStore
import { userStore } from '../../../infoModule/src/store/user.ts';
import { getCurrentUserId } from '../../../infoModule/src/function/CurrentUser.ts';

const router = useRouter();
// 2. 创建 store 实例
const store = userStore();
const teacherId = ref(null)
onMounted(async () => {

  teacherId.value = await getCurrentUserId();
});


const isDropdownVisible = ref(false); // Make sure to import ref if you use it here.
// If you removed ref, add it back: import { ref, computed } from 'vue';

const toggleDropdown = () => {
  isDropdownVisible.value = !isDropdownVisible.value;
};

const closeDropdown = () => {
  isDropdownVisible.value = false;
};

const logout = () => {
  alert('退出登录');
  userStore().logout();
  router.push('/login'); // Assuming you have a /login route
};

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

.sidebar nav a.active {
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
  display: none;
}

.dropdown-menu.show {
  display: block;
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
</style>