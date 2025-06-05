<template>
  <div class="auto-schedule">
    <div class="schedule-card">
      <h1>自动排课</h1>
      <p class="schedule-time">最后一次自动排课时间：{{ lastScheduleTime }}</p>
      <el-button
        type="primary"
        size="large"
        :loading="loading"
        @click="handleAutoSchedule"
        class="schedule-btn"
      >
        {{ loading ? '排课中...' : '一键自动排课' }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import request from '../utils/request';

const lastScheduleTime = ref('暂无排课记录');
const loading = ref(false);

// 定义返回类型接口
interface AutoScheduleResponse {
  data: {
    code: number;
    message: string;
    [key: string]: any; // 如果有其他字段，也能兼容
  };
  [key: string]: any;
}

const handleAutoSchedule = async () => {
  loading.value = true;  try {
    const res: AutoScheduleResponse = await request.post('/schedule/auto');
    if (res.data.code === 200) {
      const now = new Date();
      lastScheduleTime.value = now.toLocaleString();
      ElMessage.success(res.data.message || '自动排课成功');
    } else {
      ElMessage.error(res.data.message || '排课失败');
    }
  } catch (err) {
    ElMessage.error('请求失败，请检查后端服务');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auto-schedule {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  padding: 40px;
}

.schedule-card {
  background: white;
  padding: 50px 60px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  text-align: center;
  width: 480px;
}

h1 {
  color: #0d47a1;
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 20px;
}

.schedule-time {
  font-size: 16px;
  color: #666;
  margin-bottom: 30px;
}

.schedule-btn {
  width: 100%;
  font-size: 18px;
  height: 50px;
  border-radius: 8px;
}

.schedule-btn:hover {
  background-color: #1565c0;
}
</style>