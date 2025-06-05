<template>
  <div class="teacher-review">
    <el-card>
      <h2>教师申请审核</h2>      <el-table :data="applications" style="width: 100%" v-loading="loading" border>
        <el-table-column prop="appId" label="申请ID" width="80" />
        <el-table-column prop="secId" label="Section ID" width="100" />
        <el-table-column prop="teacherId" label="教师 ID" width="80" />
        <el-table-column label="课程信息" width="200">
          <template #default="scope">
            <div>
              <div><strong>课程ID:</strong> {{ scope.row.section?.courseId }}</div>
              <div><strong>学期:</strong> {{ scope.row.section?.semester }} {{ scope.row.section?.year }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="教室信息" width="250">
          <template #default="scope">
            <div v-if="scope.row.section?.classroom">
              <div><strong>教室:</strong> {{ scope.row.section.classroom.campus }}-{{ scope.row.section.classroom.building }}-{{ scope.row.section.classroom.roomNumber }}</div>
              <div><strong>类型:</strong> {{ scope.row.section.classroom.type }} (容量: {{ scope.row.section.classroom.capacity }})</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="申请理由" width="200" />
        <el-table-column label="当前状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.finalDecision)">
              {{ getStatusText(scope.row.finalDecision) }}
            </el-tag>
          </template>
        </el-table-column>        <el-table-column label="处理建议" width="200">
          <template #default="scope">
            <el-input
              v-model="suggestionMap[scope.row.appId]"
              placeholder="请输入建议"
              size="small"
              :disabled="scope.row.suggestion !== null"
            />
          </template>
        </el-table-column>
        <el-table-column prop="adminId" label="管理员ID" width="100" />        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button 
              type="success" 
              size="small" 
              @click="handleProcess(scope.row.appId, scope.row.secId, true)"
              :disabled="scope.row.suggestion !== null"
            >
              通过
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              @click="handleProcess(scope.row.appId, scope.row.secId, false)"
              :disabled="scope.row.suggestion !== null"
            >
              拒绝
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div style="margin-top: 20px; text-align: right">
        <el-pagination
          background
          layout="prev, pager, next, jumper"
          :page-size="10"
          :total="total"
          @current-change="handlePageChange"
          :current-page="currentPage"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '../utils/request'

const applications = ref([])
const total = ref(0)
const currentPage = ref(1)
const loading = ref(false)

// 用于存储每条申请的处理建议，使用 appId 作为键
const suggestionMap = ref<Record<number, string>>({})

const fetchApplications = async (page = 1) => {
  loading.value = true
  try {    const res = await request.get('/application/query', {
      params: {
        page,
        size: 10
      }
    })
    applications.value = res.data.data.items
    total.value = res.data.data.total
    currentPage.value = page    // 初始化建议输入框，使用 appId 作为键
    suggestionMap.value = {}
    res.data.data.items.forEach((item: any) => {
      suggestionMap.value[item.appId] = item.suggestion || ''
    })
  } catch (err) {
    ElMessage.error('加载申请记录失败')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  fetchApplications(page)
}

const handleProcess = async (appId: number, secId: number, approved: boolean) => {
  const suggestion = suggestionMap.value[appId]
  if (!suggestion || suggestion.trim() === '') {
    ElMessage.warning('请填写处理建议后再提交审核')
    return
  }

  try {
    await request.post('/application/process', {
      appId,
      adminId: 1, // 设置为占位符
      secId,
      suggestion,
      finalDecision: approved
    })
    ElMessage.success(`已${approved ? '通过' : '拒绝'}申请`)
    fetchApplications(currentPage.value)
  } catch (err) {
    ElMessage.error('处理失败，请稍后重试')
  }
}

// 获取状态标签类型
const getStatusType = (finalDecision: boolean | null) => {
  if (finalDecision === null) return ''
  return finalDecision ? 'success' : 'danger'
}

// 获取状态文本
const getStatusText = (finalDecision: boolean | null) => {
  if (finalDecision === null) return '待处理'
  return finalDecision ? '已通过' : '已拒绝'
}

onMounted(() => {
  fetchApplications()
})
</script>

<style scoped>
.teacher-review {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
}
</style>