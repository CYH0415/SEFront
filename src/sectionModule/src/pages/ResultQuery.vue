<template>
  <div class="result-query">
    <el-card>
      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input v-model="filters.teacherId" placeholder="教师ID" style="width: 140px" clearable />
        <el-input v-model="filters.classroomId" placeholder="教室ID" style="width: 140px" clearable />
        <el-input-number v-model="filters.year" :min="2000" :max="2100" placeholder="学年" style="width: 120px" />
        <el-select v-model="filters.semester" placeholder="学期" style="width: 120px">
          <el-option label="Spring" value="Spring" />
          <el-option label="Summer" value="Summer" />
          <el-option label="Fall" value="Fall" />
          <el-option label="Winter" value="Winter" />
        </el-select>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handlePrint">打印</el-button>
      </div>

      <!-- 课程表展示 -->
      <div class="timetable">
        <table>
          <thead>
            <tr>
              <th>节次</th>
              <th v-for="day in days" :key="day">{{ day }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="period in 12" :key="period">
              <td class="period-label">第{{ period }}节</td>
              <td v-for="dayIndex in 7" :key="dayIndex" class="cell">                <div class="course" v-if="courseMap[dayIndex]?.[period]">
                  <div class="course-title">{{ courseMap[dayIndex][period].courseTitle }}</div>
                  <div class="course-info">
                    <span>Section ID: {{ courseMap[dayIndex][period].secId }}</span><br />
                    <span>老师: {{ courseMap[dayIndex][period].teacherName }}</span><br />
                    <span>地点: {{ courseMap[dayIndex][period].classroomLocation }}</span>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import request from '../utils/request'

const filters = reactive({
  teacherId: '',
  classroomId: '',
  year: new Date().getFullYear(),
  semester: ''
})

const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const courseMap = reactive<Record<number, Record<number, any>>>({})

const handleSearch = async () => {
  if (!filters.year || !filters.semester) {
    ElMessage.warning('请选择学年和学期')
    return
  }
  if (!filters.teacherId && !filters.classroomId) {
    ElMessage.warning('教师ID和教室ID不能同时为空')
    return
  }
  try {    const res = await request.get('/search/section', {
      params: {
        teacherId: filters.teacherId || undefined,
        classroomId: filters.classroomId || undefined,
        year: filters.year,
        semester: filters.semester
      }
    })
    buildCourseMap(res.data.data || [])
  } catch (err) {
    ElMessage.error('查询失败')
  }
}

const buildCourseMap = (sections: any[]) => {
  // 清空旧数据
  for (let d = 1; d <= 7; d++) courseMap[d] = {}
  // 遍历每条数据
  for (const sec of sections) {
    // 解析 timeSlotIds 字符串为数组
    const timeSlotIds = JSON.parse(sec.timeSlotIds)
    for (const slotId of timeSlotIds) {
      const day = Math.floor((slotId - 1) / 12) + 1
      const period = ((slotId - 1) % 12) + 1
      if (!courseMap[day]) courseMap[day] = {}
      courseMap[day][period] = sec
    }
  }
}

const handlePrint = () => {
  window.print()
}
</script>

<style scoped>
.result-query {
  padding: 20px;
}
.search-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
  align-items: center;
}
.timetable {
  overflow-x: auto;
}
table {
  border-collapse: collapse;
  width: 100%;
  text-align: center;
  table-layout: fixed;
  border: 1px solid #ddd;
}
th,
td {
  border: 1px solid #ddd;
  padding: 8px;
}
.period-label {
  font-weight: bold;
  background-color: #f5f5f5;
  width: 70px;
}
.course-title {
  font-weight: bold;
  color: #333;
}
.course-info {
  font-size: 12px;
  color: #666;
}
@media print {
  .search-bar, .el-card__header {
    display: none;
  }
  .el-card {
    border: none !important;
    box-shadow: none !important;
  }
}
</style>