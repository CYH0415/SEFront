<template>
  <div class="course-select">
    <div class="header">
      <h1>请选择课程</h1>
      <p class="description">以下为您的课程：</p>
    </div>

    <div class="course-list-container">
      <div class="course-list-box">
        <el-table :data="paginatedCourse" stripe border size="medium" style="width: 100%">
          <el-table-column prop="title" label="课程名" min-width="200">
            <template #default="{ row }">
              <router-link
                :to="{ name: 'SharingCourseDetail', params: { sectionId: row.sectionId } }"
                class="course-link"
              >
                {{ row.title }}
              </router-link>
            </template>
          </el-table-column>
          <el-table-column prop="departmentName" label="开课学院" min-width="160" />
          <el-table-column prop="year" label="学年" width="80" />
          <el-table-column prop="semester" label="学期" width="80" />
          <el-table-column prop="time" label="上课时间" min-width="180" />
          <el-table-column prop="teacherName" label="教师" min-width="160" />
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
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: calc(100vh - 100px);
}

.header {
  width: 100%;
  max-width: 1200px;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}



h1 {
  color: #0d47a1;
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
}

.description {
  font-size: 1rem;
  color: #555;
  margin-top: 0.5rem;
  margin-bottom: 0;
}

.course-list-container {
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
}

.course-list-box {
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s;
}
.course-list-box:hover {
  transform: translateY(-4px);
}

.course-link {
  color: #0d47a1;
  font-weight: 500;
  text-decoration: none;
}
.course-link:hover {
  text-decoration: underline;
}

.pagination-box {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
}

.pagination-bar {
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .course-select {
    padding: 1rem;
  }
  .course-list-box {
    padding: 1rem;
  }
  h1 {
    font-size: 1.5rem;
  }
  .description {
    font-size: 0.875rem;
  }
  .el-table th,
  .el-table td {
    padding: 0.5rem;
  }
}
</style>
