<template>
  <div class="resource-manage">
    <div class="header">
      <h1>教学资源管理</h1>
      <div class="search-actions">
        <el-input
          v-model="searchId"
          placeholder="请输入教室相关信息"
          clearable
          style="width: 200px"
        />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="openAddDialog">添加教室</el-button>
      </div>
    </div>    <el-card class="table-card">
      <el-table :data="filteredClassroomList" border style="width: 100%;">
        <el-table-column prop="classroomId" label="教室ID" width="100" />
        <el-table-column label="教室总称" width="220">
          <template #default="scope">
            {{ scope.row.campus }}{{ scope.row.building }}{{ scope.row.roomNumber }}
          </template>
        </el-table-column>
        <el-table-column prop="campus" label="校区" />
        <el-table-column prop="building" label="楼宇" />
        <el-table-column prop="roomNumber" label="房间号" />
        <el-table-column prop="capacity" label="容量" />
        <el-table-column label="操作" width="220">
          <template #default="scope">
            <el-button size="small" type="primary" @click="openEditDialog(scope.row)">修改</el-button>
            <el-button size="small" type="danger" @click="deleteClassroom(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加 / 修改教室弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEditing ? '修改教室' : '添加教室'" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="校区">
          <el-input v-model="form.campus" />
        </el-form-item>
        <el-form-item label="楼宇">
          <el-input v-model="form.building" />
        </el-form-item>
        <el-form-item label="房间号">
          <el-input v-model="form.roomNumber" type="number" :disabled="isEditing" />
        </el-form-item>
        <el-form-item label="容量">
          <el-input v-model="form.capacity" type="number" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveClassroom">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import request from '../utils/request';

interface Classroom {
  classroomId?: number;
  campus: string;
  building: string;
  roomNumber: number;
  capacity: number;
}

const classroomList = ref<Classroom[]>([]);
const dialogVisible = ref(false);
const isEditing = ref(false);
const form = ref<Classroom>({
  campus: '',
  building: '',
  roomNumber: 0,
  capacity: 0
});

const searchId = ref('');
const filteredClassroomList = computed(() =>
  classroomList.value.filter(c =>
    `${c.campus}${c.building}${c.roomNumber}`.includes(searchId.value)
  )
);

const fetchClassrooms = async () => {
  try {
    const res = await request.get('/classroom/query', {
      params: { keyword: '' }
    });
    console.log('✅ 教室接口返回值:', res);
    classroomList.value = res.data.data || [];
  } catch (err) {
    console.error('❌ 获取教室失败:', err);
    ElMessage.error('获取教室列表失败');
  }
};

onMounted(fetchClassrooms);

const handleSearch = async () => {
  try {
    const res = await request.get('/classroom/query', {
      params: { keyword: searchId.value }
    });
    classroomList.value = res.data.data || [];
  } catch (err) {
    ElMessage.error('搜索失败');
  }
};

const handleReset = () => {
  searchId.value = '';
  fetchClassrooms();
};

const openAddDialog = () => {
  isEditing.value = false;
  form.value = {
    campus: '',
    building: '',
    roomNumber: 0,
    capacity: 0
  };
  dialogVisible.value = true;
};

const openEditDialog = (item: Classroom) => {
  isEditing.value = true;
  form.value = { ...item };
  dialogVisible.value = true;
};

const saveClassroom = async () => {
  const { classroomId, campus, building, roomNumber, capacity } = form.value;
  if (!campus || !building || !roomNumber || !capacity) {
    ElMessage.warning('请填写完整信息');
    return;
  }

  try {
    if (isEditing.value && classroomId != null) {
      await request.put('/classroom/modify', {
        classroomId,
        newCampus: campus,
        newCapacity: capacity,
        newBuilding: building
      });
      ElMessage.success('修改成功');
    } else {
      await request.post('/classroom/add', {
        campus,
        building,
        roomNumber,
        capacity
      });
      ElMessage.success('添加成功');
    }
    dialogVisible.value = false;
    fetchClassrooms();
  } catch (err) {
    ElMessage.error('保存失败');
  }
};

// 删除教室
const deleteClassroom = async (item: Classroom) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除教室 ${item.campus}${item.building}${item.roomNumber} 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    await request.delete('/classroom/delete', {
      params: { classroomId: item.classroomId }
    });

    ElMessage.success('删除成功');
    fetchClassrooms();
  } catch {
    ElMessage.info('已取消删除');
  }
};
</script>

<style scoped>
.resource-manage {
  background-color: #f5f7fa;
  min-height: calc(100vh - 100px);
  padding: 40px 60px;
  box-sizing: border-box;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  row-gap: 10px;
  margin-bottom: 30px;
}

.search-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

h1 {
  font-size: 28px;
  font-weight: bold;
  color: #0d47a1;
  margin: 0;
}

.table-card {
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.el-table th, .el-table td {
  height: 50px;
}
</style>