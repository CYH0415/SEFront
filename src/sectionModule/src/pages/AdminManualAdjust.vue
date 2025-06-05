<template>
  <div class="admin-adjust">
    <el-card>
      <div class="search-bar">
        <el-input v-model="filters.courseTitle" placeholder="课程名称" style="width: 200px; margin-right: 10px" />
        <el-input-number v-model="filters.year" :min="2000" placeholder="学年" style="margin-right: 10px" />
        <el-select v-model="filters.semester" placeholder="学期" style="width: 120px; margin-right: 10px">
          <el-option label="Spring" value="Spring" />
          <el-option label="Summer" value="Summer" />
          <el-option label="Fall" value="Fall" />
          <el-option label="Winter" value="Winter" />        </el-select>
        <el-button type="primary" @click="fetchData">搜索</el-button>
      </div>      <el-table :data="tableData" style="margin-top: 20px; width: 100%" border>
        <el-table-column prop="secId" label="Section ID" width="100" align="center" />
        <el-table-column prop="courseTitle" label="课程名称" width="200" align="center" />
        <el-table-column label="教师信息" width="150" align="center">
          <template #default="scope">
            <div style="text-align: center">
              <div><strong>ID:</strong> {{ scope.row.teacherId }}</div>
              <div v-if="scope.row.teacherName"><strong>姓名:</strong> {{ scope.row.teacherName }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="学期信息" width="120" align="center">
          <template #default="scope">
            {{ scope.row.semester }} {{ scope.row.year }}
          </template>
        </el-table-column>
        <el-table-column label="当前教室" width="200" align="center">
          <template #default="scope">
            <div v-if="scope.row.classroom" style="text-align: center">
              <div><strong>ID:</strong> {{ scope.row.classroomId }}</div>
              <div><strong>位置:</strong> {{ scope.row.classroom.campus }}-{{ scope.row.classroom.building }}-{{ scope.row.classroom.roomNumber }}</div>
              <div><strong>容量:</strong> {{ scope.row.classroom.capacity }}</div>
            </div>
            <div v-else style="text-align: center">
              教室ID: {{ scope.row.classroomId }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="新教室ID" width="120" align="center">
          <template #default="scope">
            <div style="text-align: center">
              <el-input v-model="scope.row.newClassroomId" size="small" type="number" placeholder="输入新教室ID" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="timeSlotIds" label="时间段列表" width="150" align="center">
          <template #default="scope">
            <div style="text-align: center">
              <el-input v-model="scope.row.timeSlotIdsString" size="small" placeholder="如: 1,2,3,4" />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template #default="scope">
            <div style="text-align: center">
              <el-button type="success" size="small" @click="submitUpdate(scope.row)">保存</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="total"
          :page-size="10"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchAdminSections, modifySection } from '../api/schedule'

const filters = reactive({
  courseTitle: '',
  semester: '',
  year: new Date().getFullYear(),
})

const tableData = ref<any[]>([])
const page = ref(1)
const total = ref(0)

const fetchData = async () => {
  try {
    const res = await fetchAdminSections({
      ...filters,
      page: page.value,
      pageSize: 10,
    })
    tableData.value = res.data.data.records.map((item: any) => ({
      ...item,
      newClassroomId: '', // 新增字段用于输入新教室ID
      timeSlotIdsString: Array.isArray(item.timeSlotIds) 
        ? item.timeSlotIds.join(',') 
        : (typeof item.timeSlotIds === 'string' ? item.timeSlotIds : ''),
    }))
    total.value = res.data.data.total
  } catch (err) {
    ElMessage.error('加载数据失败')
  }
}

const handlePageChange = (p: number) => {
  page.value = p
  fetchData()
}

const submitUpdate = async (row: any) => {
  const parsedSlots = row.timeSlotIdsString
    .split(',')
    .map((s: string) => parseInt(s.trim()))
    .filter((n: number) => !isNaN(n))

  // 检查是否输入了新教室ID
  const classroomId = row.newClassroomId ? parseInt(row.newClassroomId) : row.classroomId

  if (!classroomId) {
    ElMessage.warning('请输入有效的教室ID')
    return
  }

  try {
    await modifySection({
      sectionId: row.secId,
      classroomId: classroomId,
      timeSlotIds: parsedSlots,
    })
    ElMessage.success('保存成功')
    // 重新加载数据以显示更新后的信息
    fetchData()
  } catch (err) {
    ElMessage.error('保存失败')
  }
}

onMounted(fetchData)
</script>

<style scoped>
.admin-adjust {
  padding: 20px;
}

.search-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

/* 修复表格标题和内容对齐问题 */
:deep(.el-table) {
  width: 100% !important;
}

/* 确保表头居中对齐 */
:deep(.el-table th.el-table__cell) {
  text-align: center !important;
}

/* 确保表头内文字居中对齐 */
:deep(.el-table th > .cell) {
  text-align: center !important;
}

/* 确保表格内容单元格居中对齐 */
:deep(.el-table td.el-table__cell) {
  text-align: center !important;
}

/* 确保表格内容单元格内的文字居中对齐 */
:deep(.el-table td > .cell) {
  text-align: center !important;
}

/* 输入框宽度适应 */
:deep(.el-input) {
  width: 90%;
  margin: 0 auto;
}
</style>