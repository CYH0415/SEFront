<template>
  <div class="teacher-request">
    <el-card shadow="hover" style="max-width: 600px; margin: 0 auto;">
      <h2>发起课程调整申请</h2>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="sec ID" prop="secId">
          <el-popover
            placement="top-start"
            :title="computedPopoverTitle"
            :width="300"
            trigger="manual"
            v-model:visible="sectionDetailVisible"
          >
            <template #reference>
              <el-input-number
                v-model="form.secId"
                :min="1"
                placeholder="输入secID"
                @input="debouncedFetchSectionDetail"
                @focus="sectionDetailVisible = false"
              />
            </template>
            <div :style="computedContentStyle">{{ sectionDetailContent }}</div>
          </el-popover>
        </el-form-item>
        <el-form-item label="教师ID" prop="teacherId">
          <el-input-number v-model="form.teacherId" :min="1" placeholder="请输入教师ID" />
        </el-form-item>

        <el-form-item label="申请原因" prop="reason">
          <el-input
            type="textarea"
            v-model="form.reason"
            placeholder="请输入课程调整申请原因(可包含理由、希望调整地点、时段等)"
            rows="4"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit">提交申请</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 历史申请记录 -->
    <el-card shadow="hover" style="margin-top: 20px">
      <div class="history-header">
        <h2>历史申请记录</h2>
        <div class="search-teacher">
          <el-input-number
            v-model="searchTeacherId"
            :min="1"
            placeholder="输入教师ID查询历史"
            style="width: 180px"
          />          <el-button type="primary" @click="fetchTeacherApplications" :disabled="!searchTeacherId">
            查询
          </el-button>
        </div>
      </div>
        <el-table :data="applicationHistory" style="width: 100%; margin-top: 20px" border>        <el-table-column prop="secId" label="sectionID" width="100" align="center" />
        <el-table-column prop="courseTitle" label="课程名称" width="180" align="center" />
        <el-table-column prop="classroomLocation" label="上课地点" width="220" align="center" />
        <el-table-column prop="reason" label="申请原因" min-width="200" align="left" />
        <el-table-column prop="suggestion" label="处理原因" min-width="200" align="left" />
        <el-table-column label="处理状态" width="120" align="center">
          <template #default="scope">
            <el-tag :type="getApprovalStatusType(scope.row)">
              {{ getApprovalStatusText(scope.row) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination" v-if="applicationHistory.length">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="total"
          :page-size="10"
          @current-change="handlePageChange"
        />
      </div>
      
      <el-empty v-if="!applicationHistory.length && hasSearched" description="暂无申请记录" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance } from 'element-plus';
import { getTeacherApplications, submitTeacherApplication } from '../api/application';
import { getSectionDetail } from '../api/section';
import type { SectionDetail } from '../api/section';

// 表单数据模型
const form = ref({
  secId: null as number | null,
  reason: '',
  teacherId: null as number | null
});

// 课程详情相关
const sectionDetail = ref<SectionDetail | null>(null);
const sectionDetailVisible = ref(false);
let debounceTimer: number | undefined;
const sectionExists = ref(true); // 新增一个状态来跟踪 section 是否存在

const fetchSectionDetail = async () => {
  if (form.value.secId) {
    try {
      const res = await getSectionDetail(form.value.secId);
      // 检查 res.data 是否存在并且不是一个空对象
      if (res.data.code === 200 && res.data.data && Object.keys(res.data.data).length > 0) {
        sectionDetail.value = res.data.data;
        sectionExists.value = true;
        sectionDetailVisible.value = true;
      } else {
        sectionDetail.value = null;
        sectionExists.value = false; // section 不存在
        sectionDetailVisible.value = true; // 仍然显示弹窗以提示信息
      }
    } catch (error) {
      sectionDetail.value = null;
      sectionExists.value = false; // 出错时也认为 section 不存在
      sectionDetailVisible.value = true; // 仍然显示弹窗以提示信息
      console.error('获取课程详情失败:', error);
    }
  } else {
    sectionDetail.value = null;
    sectionExists.value = true; // 没有输入时不显示错误
    sectionDetailVisible.value = false;
  }
};

const debouncedFetchSectionDetail = () => {
  clearTimeout(debounceTimer);
  // sectionDetailVisible.value = false; // 输入时不再立即隐藏，等待 fetch 结果
  if (form.value.secId && form.value.secId.toString().length > 0) {
    debounceTimer = setTimeout(() => {
      fetchSectionDetail();
    }, 500);
  } else {
    sectionDetailVisible.value = false; // 如果输入为空，则隐藏
    sectionDetail.value = null;
    sectionExists.value = true;
  }
};

const computedPopoverTitle = computed(() => {
  return sectionExists.value ? '课程详情' : '提示';
});

const sectionDetailContent = computed(() => {
  if (!sectionExists.value) {
    return 'Section 不存在';
  }
  if (sectionDetail.value) {
    return `课程名称: ${sectionDetail.value.courseTitle}\n上课地点: ${sectionDetail.value.classroomLocation}`;
  }
  return ''; // 如果 sectionExists 为 true 但 sectionDetail 仍为 null (例如初始状态或清除时)，则不显示内容
});

const computedContentStyle = computed(() => {
  return sectionExists.value ? {} : { color: 'red' };
});

// 表单验证规则
const rules = {
  secId: [{ required: true, message: '请输入课程章节 ID', trigger: 'blur' }],
  reason: [{ required: true, message: '请输入申请原因', trigger: 'blur' }],
  teacherId: [{ required: true, message: '请输入教师ID', trigger: 'blur' }]
};

const formRef = ref<FormInstance>();

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 确保表单数据不为 null
        if (form.value.secId === null || form.value.teacherId === null) {
          ElMessage.error('请填写完整的表单信息');
          return;
        }
        
        const res = await submitTeacherApplication({
          secId: form.value.secId,
          teacherId: form.value.teacherId,
          reason: form.value.reason
        });

        // 判断后端返回的 code 是否为 200
        if (res.data.code === 200) {
          ElMessage.success(res.data.message || '申请提交成功');
          resetForm();
          
          // 如果当前查询的教师ID与提交的ID相同，则自动刷新列表
          if (searchTeacherId.value === form.value.teacherId) {
            fetchTeacherApplications();
          }
        } else {
          ElMessage.error(res.data.message || '提交失败，请检查 secId 与教师ID 是否匹配');
        }
      } catch (err: any) {
        ElMessage.error(err?.response?.data?.message || '系统错误，提交失败');
      }
    }
  });
};

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
};

// 历史申请记录相关
const searchTeacherId = ref<number | null>(null);
const applicationHistory = ref<any[]>([]);
const total = ref(0);
const currentPage = ref(1);
const hasSearched = ref(false);

// 获取教师申请历史
const fetchTeacherApplications = async () => {
  if (!searchTeacherId.value) {
    ElMessage.warning('请输入教师ID');
    return;
  }
  
  try {
    const res = await getTeacherApplications(searchTeacherId.value);
    if (res.data.code === 200) {
      // 从响应中获取申请记录
      applicationHistory.value = res.data.data.items || [];
      
      // 数据已经包含所需信息，不需要额外处理
      
      total.value = res.data.data.total || 0;
      hasSearched.value = true;
      
      if (applicationHistory.value.length === 0) {
        ElMessage.info('该教师暂无申请记录');
      }
    } else {
      ElMessage.error(res.data.message || '获取历史记录失败');
    }
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || '获取历史记录失败');
    applicationHistory.value = [];
    hasSearched.value = true;
  }
};

// 页码变化
const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchTeacherApplications();
};

// 状态格式化
const getApprovalStatusType = (row: any) => {
  // 如果suggestion为空，表示尚未处理
  if (!row.suggestion) {
    return 'warning';
  } 
  // finalDecision为true表示已批准，false表示已拒绝
  return row.finalDecision === true ? 'success' : 'danger';
};

const getApprovalStatusText = (row: any) => {
  // 如果suggestion为空，表示尚未处理
  if (!row.suggestion) {
    return '待处理';
  }
  // finalDecision为true表示已批准，false表示已拒绝
  return row.finalDecision === true ? '已批准' : '已拒绝';
};

// 日期格式化
// const formatDate = (timestamp: string | number) => {
//   if (!timestamp) return '';
//   const date = new Date(timestamp);
//   return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
// };
</script>

<style scoped>
.teacher-request {
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-teacher {
  display: flex;
  gap: 10px;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

/* 确保表格标题和内容对齐 */
:deep(.el-table th.el-table__cell) {
  text-align: center !important;
}

:deep(.el-table th > .cell) {
  text-align: center !important;
}

:deep(.el-table td.el-table__cell) {
  text-align: center !important;
}

:deep(.el-table td > .cell) {
  text-align: center !important;
}
</style>