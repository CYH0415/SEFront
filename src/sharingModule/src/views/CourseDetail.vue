<template>
  <div class="course-detail">
    <!-- 课程详情的标题和描述 -->
    <div class="header">
      <h1> {{ formattedSectionInfo }} </h1>
    </div>

    <!-- 导航栏 -->
    <div class="navbar">
      <button @click="goToCourseList">返回上级课程列表</button>
      <button @click="goToAssignments">作业</button>
      <button @click="goToResources">资源共享</button>
      <!-- 只有当不是学生时才显示考勤录入按钮 -->
      <button v-if="!props.isStudent" @click="openAttendanceDialog">考勤录入</button>
    </div>

    <div class="detail-box">
      <!-- 子路由展示区域，通过props传递courseId和isStudent -->
      <router-view :userId="Number(props.userId)" :sectionId="Number(sectionId)" :isStudent="Boolean(props.isStudent)"></router-view>
    </div>

    <!-- 录入考勤弹窗 -->
    <el-dialog title="录入考勤成绩" v-model="isAttendanceVisible" center :style="{ width: '450px' }">
      <div class="attendance-score-box">
        <div class="attendance-list-box">
          <el-table :data="paginatedAttendanceData" border >
            <el-table-column prop="studentName" label="姓名" width="100" />
            <el-table-column label="分数" width="180">
              <template #default="{ row }">
                <el-input
                  v-model="row.score"
                  style="width: 150px"
                  placeholder="请输入分数"
                  type="number"
                  step="1"
                />
              </template>
            </el-table-column>
          </el-table>
          <!-- 分页 -->
          <div class="pagination-box">
            <el-pagination
              layout="prev, pager, next"
              :total="totalStudent"
              :page-size="pageSize"
              v-model:current-page="currentAttendancePage"
              class="pagination-bar"
            />
          </div>
        </div>
        <el-form-item label="考勤分数占比(%)">
          <el-input v-model="proportion" style="width: 150px;" placeholder="请输入占比" type="number"/>
        </el-form-item>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="onCommitAttendance">提交</el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import api from '../api/api';
import { ElMessage } from 'element-plus';
import { ref, computed, onMounted, defineProps } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

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

const sectionId = computed(() => route.params.sectionId); // 使用 computed 来动态获取 courseId 参数
const sectionInfo = ref({}); // 课程信息数据
const isAttendanceVisible = ref(false); // 考勤窗口开关
// 考勤录入数据
const attendanceData = ref([]);
const proportion = ref(null);
// 总数据条数
const totalStudent = computed(() => {
  return attendanceData.value.length;
}); 
const pageSize = ref(8);  // 每页条数
const currentAttendancePage = ref(1);  // 当前页码
// 计算分页后的数据
const paginatedAttendanceData = computed(() => {
  const start = (currentAttendancePage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return attendanceData.value.slice(start, end);
});

const formattedSectionInfo = computed(() => {
  if (!sectionInfo.value) {
    return '';
  }
  const { title = '', year = '', semester = '', time = '' } = sectionInfo.value;
  return [title, `${year}年${semester}学期`, time].filter(Boolean).join(' | ');
});

// 查询课程信息
async function getSectionInfo() {
  const response = await api.get('/section', {
    params: {
      sectionId: sectionId.value
    }
  });
  if (response.code) {
    return response.data;
  } else {
    ElMessage.error('课程详情获取失败!' + response.message);
  }
}

// 页面渲染前调用的生命周期函数
onMounted(async () => {
  sectionInfo.value = await getSectionInfo();
});

// 打开考勤录入弹窗
async function openAttendanceDialog() {
  const response = await api.get('/teacher/attendance', {
    params: {
      sectionId: sectionId.value
    }
  });
  if (response.code) {
    attendanceData.value = response.data;
    proportion.value = null;
    isAttendanceVisible.value = true;
  } else {
    ElMessage.error('学生名单获取失败!' + response.message);
  }
}
// 点击提交考勤成绩按钮
async function onCommitAttendance() {
  if (proportion.value == null || proportion.value == '') {
    ElMessage.error('占比未录入!');
    return;
  }
  if (proportion.value > 100) {
    ElMessage.error('占比不能高于100%!');
    return;
  }
  if (proportion.value < 0) {
    ElMessage.error('占比不能为负!');
    return;
  }
  if (!/^-?\d+$/.test(proportion.value)) {
    ElMessage.error('占比不支持小数!');
    return;
  }
  for (const item of attendanceData.value) {
    if (item.score == null || item.score == '') {
      ElMessage.error('漏项,未全部录入!');
      return;
    }
    if (item.score > 100) {
      ElMessage.error('分数不能超过100!');
      return;
    }
    if (item.score < 0) {
      ElMessage.error('分数不能为负!');
      return;
    }
    if (!/^-?\d+$/.test(item.score)) {
      ElMessage.error('分数不能有小数!');
      return;
    }
  }
  const response = await api.post('/teacher/attendance', 
    attendanceData.value.map(
      item => ({
        takesId: item.takesId,
        score: item.score,
        proportion: String(proportion.value / 100)
      })
    )
  );
  if (response.code) {
    ElMessage.success('录入成功!');
    isAttendanceVisible.value = false;
  } else {
    ElMessage.error('录入失败!' + response.message);
  }
}

// 路由跳转函数
function goToAssignments() {
  router.push({
    name: 'SharingHomework',
  });
}
function goToResources() {
  router.push({
    name: 'SharingResourceTree',
  });
}
function goToCourseList() {
  router.push({
    name: 'SharingCourseList'
  });
}

</script>

<style scoped>
.attendance-score-box {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.attendance-list-box {
  text-align: center;
}

.pagination-box {
  margin-top: 30px;
  width: 100%;
  align-items: center;
  justify-content: center;
}
/* 分页栏居中 */
.pagination-bar {
  display: flex;
  justify-content: center;
  width: 100%;
}
.course-detail {
  background-color: #f5f7fa;
  padding: 15px 40px;
  min-height: calc(100vh - 100px);
}

/* 课程详情标题和描述 */
.header {
  display: flex;
  text-align: left;
  margin-bottom: 24px;
  padding-right: 20px;
}

.detail-box {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f5f7fa;
}

h1 {
  color: #0d47a1;
  font-size: 30px;
  font-weight: bold;
  margin: 0;
}

.separator {
  margin: 0 10px;
}

.description {
  font-size: 15px;
  color: #555;
  margin-top: 6px;
}

/* 导航栏 */
.navbar {
  display: flex;
  justify-content: space-around;
  background-color: #409EFF;
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 8px;
}

.navbar button {
  color: white;
  background-color: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
  transition: color 0.3s;
}

.navbar button:hover {
  color: #66b1ff;
}

/* 课程信息部分 */
.course-info {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.course-info p {
  font-size: 16px;
  color: #666;
}

/* 作业列表 */
.assignments {
  margin-bottom: 30px;
}

.el-table {
  width: 100%;
  margin-bottom: 20px;
}

.el-table th {
  background-color: #f5f7fa;
  font-weight: bold;
  color: #333;
}

.el-button {
  margin-right: 10px;
}

.el-tag {
  margin-left: 10px;
}

.el-button,
.el-tag {
  cursor: pointer;
}

/* 资源共享部分 */
.resources {
  margin-top: 20px;
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
}
</style>
