<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed, ref, onMounted } from 'vue'
import { getCurrentUserType } from './infoModule/src/function/CurrentUser'
import { userStore } from './infoModule/src/store/user'

const route = useRoute()
const router = useRouter()
const userType = ref('')

// 判断是否显示导航栏（在根路径时显示）
const showNavigation = computed(() => route.path === '/')

// 判断是否显示课程安排子系统（学生不显示）
const showSectionModule = computed(() => userType.value !== 'ROLE_STUDENT')

// 获取用户类型
const fetchUserType = async () => {
  try {
    const type = await getCurrentUserType()
    userType.value = type || ''
    console.log('当前用户类型:', type)
  } catch (error) {
    console.error('获取用户类型失败:', error)
  }
}

onMounted(() => {
  fetchUserType()
})

// 退出登录
const logout = () => {
  alert('退出登录')
  userStore().logout()
  router.go(0);
}

// 点击选课系统后根据用户类型跳转
const goToSelection = async () => {
  const userType = await getCurrentUserType()

  let targetPath = '/selection-student' // 默认学生
  if (userType === 'ROLE_TEACHER') {
    targetPath = '/selection-teacher'
  } else if (userType === 'ROLE_ADMIN') {
    targetPath = '/selection-admin'
  }

  router.push(targetPath)
}
</script>

<template>
  <div class="app-container">    <!-- 主导航页面 -->
    <div v-if="showNavigation" class="main-navigation">
      <!-- 退出登录按钮 -->
      <div class="logout-container">
        <button class="logout-btn" @click="logout">
          <svg class="logout-icon" viewBox="0 0 1024 1024" width="16" height="16">
            <path d="M868 732h-70.3c-4.8 0-9.3 2.1-12.3 5.8-7 8.5-14.5 16.7-22.4 24.5a353.84 353.84 0 0 1-112.7 75.9A352.8 352.8 0 0 1 512.4 866c-47.9 0-94.3-9.4-137.9-27.8a353.84 353.84 0 0 1-112.7-75.9 353.28 353.28 0 0 1-76.1-112.5c-18.4-43.7-27.8-90.1-27.8-137.9s9.4-94.2 27.8-137.9c17.8-42.1 43.4-80 76.1-112.5s70.5-58.1 112.7-75.9c43.6-18.4 90-27.8 137.9-27.8 47.9 0 94.3 9.3 137.9 27.8 42.2 17.8 80.1 43.4 112.7 75.9 7.9 7.9 15.3 16.1 22.4 24.5 3 3.7 7.6 5.8 12.3 5.8H868c6.3 0 10.2-7 6.7-12.3C863 663.1 840.4 618.2 810 590c-36.5-33.6-79.6-60.1-127.7-78.5C637.4 494.6 576.9 484 512.4 484s-124.9 10.6-169.9 27.5c-48.1 18.4-91.2 44.9-127.7 78.5C183.1 618.2 160.5 663.1 149 712.7c-3.5 5.3.4 12.3 6.7 12.3h70.3c4.8 0 9.3-2.1 12.3-5.8 7-8.5 14.5-16.7 22.4-24.5 36.5-33.6 79.6-60.1 127.7-78.5C433.3 598.6 470.8 590 512.4 590s79.1 8.6 124 25.5c48.1 18.4 91.2 44.9 127.7 78.5 30.4 28.1 53 73.1 64.5 122.7 3.5 5.3-.4 12.3-6.7 12.3z" fill="#fff"/>
            <path d="M904 476H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z" fill="#fff"/>
          </svg>
          退出登录
        </button>
      </div>
      
      <div class="header">
        <h1>教学管理系统</h1>
        <p>请选择要访问的子系统</p>
      </div>
        <div class="module-grid">
        <div v-if="showSectionModule" class="module-card">
          <router-link to="/section" class="module-link">
            <div class="module-icon">📚</div>
            <h3>课程安排子系统</h3>
            <p>教学资源管理、自动排课、手动调整、排课结果查询</p>
          </router-link>
        </div>

        <div class="module-card">
          <router-link to="/info/course-manage" class="module-link">
            <div class="module-icon">👥</div>
            <h3>信息管理子系统</h3>
            <p>用户信息管理、课程基本信息管理、成绩管理</p>
          </router-link>
        </div>

        <div class="module-card">
          <router-link to="/testing/login" class="module-link">
            <div class="module-icon">📝</div>
            <h3>在线测试子系统</h3>
            <p>题库管理、试卷管理、考试管理、成绩分析</p>
          </router-link>
        </div>

        <div class="module-card">
          <router-link to="/sharing/course-list" class="module-link">
            <div class="module-icon">🔗</div>
            <h3>课程资源共享子系统</h3>
            <p>课程资源管理、作业管理、资源共享</p>
          </router-link>
        </div>

        <div class="module-card">
          <a href="#" class="module-link" @click.prevent="goToSelection">
            <div class="module-icon">📋</div>
            <h3>选课子系统</h3>
            <p>学生选课、教师课程、管理员管理</p>
          </a>
        </div>
      </div>
    </div>

    <!-- 子系统页面 -->
    <router-view v-if="!showNavigation" />
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.main-navigation {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
}

/* 退出登录按钮容器 */
.logout-container {
  position: absolute;
  top: 2rem;
  right: 2rem;
  z-index: 10;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.8rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.logout-icon {
  width: 16px;
  height: 16px;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
  color: white;
}

.header h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.header p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  width: 100%;
}

.module-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  overflow: hidden;
}

.module-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
}

.module-link {
  display: block;
  padding: 2rem;
  text-decoration: none;
  color: inherit;
  height: 100%;
}

.module-icon {
  font-size: 3rem;
  text-align: center;
  margin-bottom: 1rem;
}

.module-link h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
  text-align: center;
  font-weight: 600;
}

.module-link p {
  color: #666;
  line-height: 1.6;
  text-align: center;
  font-size: 0.95rem;
}

.module-card:nth-child(1) .module-link:hover {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
}

.module-card:nth-child(2) .module-link:hover {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.module-card:nth-child(3) .module-link:hover {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
}

.module-card:nth-child(4) .module-link:hover {
  background: linear-gradient(135deg, #d299c2 0%, #fef9d7 100%);
}

.module-card:nth-child(5) .module-link:hover {
  background: linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%);
}

@media (max-width: 768px) {
  .module-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .header h1 {
    font-size: 2rem;
  }
  
  .main-navigation {
    padding: 1rem;
  }
}
</style>
