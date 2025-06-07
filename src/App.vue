<script setup lang="ts">
import {useRoute, useRouter} from 'vue-router'
import { computed } from 'vue'
import { getCurrentUserType } from '/src/infoModule/src/function/CurrentUser.ts'

const route = useRoute()
const router = useRouter()

// 判断是否显示导航栏（在根路径时显示）
const showNavigation = computed(() => route.path === '/')

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
  <div class="app-container">
    <!-- 主导航页面 -->
    <div v-if="showNavigation" class="main-navigation">
      <div class="header">
        <h1>教学管理系统</h1>
        <p>请选择要访问的子系统</p>
      </div>
      
      <div class="module-grid">
        <div class="module-card">
          <router-link to="/section" class="module-link">
            <div class="module-icon">📚</div>
            <h3>课程安排子系统</h3>
            <p>教学资源管理、自动排课、手动调整、排课结果查询</p>
          </router-link>
        </div>

        <div class="module-card">
          <router-link to="/info/information-manage" class="module-link">
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
