<template>
  <div class="course-select">

    <div class="header">
      <h1>请选择课程</h1>
      <p class="description">以下为您的课程：</p>
    </div>

    <div class="course-list-container">

      <div class="course-list-box">
        <el-table :data="paginatedCourse" border style="width: 100%">
          <!-- 课程名列 -->
          <el-table-column prop="title" label="课程名" width="200">
          <template #default="{ row }">
            <router-link :to="{ 
              name: 'SharingCourseDetail', 
              params: { sectionId: row.sectionId },
            }">{{ row.title }}</router-link>
          </template>
        </el-table-column>
          
          <el-table-column prop="departmentName" label="开课学院" width="200" />
          <el-table-column prop="year" label="学年" width="75"/>
          <el-table-column prop="semester" label="学期" width="75"/>
          <el-table-column prop="time" label="上课时间" width="200"/>
          <el-table-column prop="teacherName" label="教师" width="200" />
        </el-table>
      </div>

      <div class="pagination-box">
        <el-pagination
          layout="prev, pager, next"
          :total="totalItems"
          :page-size="courseForm.pageSize"
          v-model:current-page="courseForm.currentPage"
          class="pagination-bar"
        />
      </div>

    </div>

  </div>
</template>

<script setup>
import api from '../api/api';
import { ElMessage } from 'element-plus';
import { ref, computed, onMounted, defineProps } from 'vue';

const props = defineProps({
  userId: {
    type: Number,
    required: true
  },
  isStudent: {
    type: Boolean,
    required: true
  }
});

// 课程列表的表格数据
const courseForm = ref({
  list: [], // 作业列表
  pageSize: 10, // 每页展示条目数
  currentPage: 1, // 当前页数
});
// 计算总条目数
const totalItems = computed(() => {
  return courseForm.value.list.length;
});
// 分页计算
const paginatedCourse = computed(() => {
  const start = (courseForm.value.currentPage - 1) * courseForm.value.pageSize;
  const end = start + courseForm.value.pageSize;
  return courseForm.value.list.slice(start, end);
});

// 获取课程列表
async function getCourseList() {
  const response = await api.get('/section-list', {
    params: {
      userId: props.userId,
      isStudent: props.isStudent
    }
  });
  if (response.code) {
    return response.data;
  } else {
    ElMessage.error('课程列表获取失败!' + response.message);
    return [];
  }
}

// 页面渲染前调用的生命周期函数
onMounted(async() => {
  courseForm.value.list = await getCourseList();
})
</script>

<style scoped>
.course-select {
  background-color: #f5f7fa;
  padding: 15px 40px;
  min-height: calc(100vh - 100px);
}

.header {
  text-align: left;
  margin-bottom: 24px;
  padding-right: 20px;
}

h1 {
  color: #0d47a1;
  font-size: 30px;
  font-weight: bold;
  margin: 0;
}

.description {
  font-size: 15px;
  color: #555;
  margin-top: 6px;
}

.course-list-container {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f5f7fa;
}

/* 内容块，卡片式设计 */
.course-list-box {
  background: white;
  padding: 50px 60px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.pagination-box {
  margin-top: 30px;
  width: 100%;
  align-items: center;
  justify-content: center;
}

.schedule-item {
  font-size: 16px;
  color: #666;
  margin: 8px 0;
}

/* 按钮特效 */
.schedule-btn {
  width: 100%;
  font-size: 18px;
  height: 50px;
  border-radius: 8px;
}

/* 分页栏居中 */
.pagination-bar {
  display: flex;
  justify-content: center;
  width: 100%;
}

.header {
  display: flex;
  flex-direction: column; /* 让元素垂直排列 */
  align-items: flex-start; /* 可选：让它们左对齐 */
}
</style>
