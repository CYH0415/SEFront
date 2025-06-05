<template>
  <el-dialog title="选择文件" width="850px" @close="closeDialog" v-model="innerVisible" append-to-body>
    <!-- 顶部切换按钮组 -->
    <div>
      <el-radio-group v-model="operationType" size="large" fill="#6cf">
        <el-radio-button value="upload">本地上传</el-radio-button>
        <el-radio-button value="select">个人资源库</el-radio-button>
      </el-radio-group>
    </div>

    <div class="section-divider"></div>

    <!-- 操作区域容器，固定高度 -->
    <div style="margin-top: 10px; height: 430px;">

      <!-- 上传区域 -->
      <div v-show="operationType === 'upload'" style="height: 100%;">
        <el-upload
          drag
          :multiple="true"
          :directory="false"
          :show-file-list="false"
          :accept="'*/*'"
          :disabled="uploading"
          :http-request="upload"
          class="custom-upload"
        >
          <div>
            <el-button
              type="primary"
              size="large"
              :icon="uploading ? '' : 'UploadFilled'"
              :loading="uploading"
            >
              {{ uploading ? '上传中...' : '上传文件' }}
            </el-button>
            <div style="margin-top: 10px;">支持拖拽或点击上传文件</div>
          </div>

          <template #tip>
            <div>仅支持文件上传，禁止文件夹，大小限制 20MB</div>
          </template>
        </el-upload>
      </div>

      <!-- 资源库区域 -->
      <div v-show="operationType === 'select'" style="height: 100%; display: flex; flex-direction: column;">
        <!-- 顶部筛选栏 -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0;">
          <el-tabs v-model="fileType">
            <el-tab-pane label="全部" name="all" />
            <el-tab-pane label="图片" name="image" />
            <el-tab-pane label="文档" name="doc" />
            <el-tab-pane label="视频" name="video" />
          </el-tabs>
          <el-input v-model="searchKeyword" placeholder="关键词" style="width: 150px;" />
        </div>

        <div style="border-top: 1px solid #e0e0e0; margin-top: 10px;"></div>

        <!-- 文件列表 + 分页 -->
        <el-scrollbar style="flex: 1;">
          <div v-for="item in paginatedFileList" :key="item.index" class="file-item">
            <el-checkbox v-model="item.checked" style="margin-right: 8px;" />
            <img :src="getIcon(item.name)" class="file-icon" />
            <div class="file-info">
              <div class="file-name">{{ item.name }}</div>
              <div class="file-meta">{{ item.time }} 大小：{{ item.size }}</div>
            </div>
          </div>
        </el-scrollbar>

        <div style="border-top: 1px solid #e0e0e0;"></div>

        <div style="display: flex; justify-content: center; margin-top: 20px;">
          <el-pagination
            background
            layout="prev, pager, next, jumper"
            :page-size="pageSize"
            :total="total"
            v-model:current-page="currentPage"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="center-footer">
        <el-button type="primary" :disabled="selectedFiles.length == 0" @click="confirm">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus';
import { ref, watch, computed, defineProps, defineEmits } from 'vue';
import api from '@/api/api';

// props
const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  userId: {
    type: Number,
    required: true
  },
  isStudent: {
    type: Boolean,
    required: true
  }
});

watch(() => props.visible, (newVal) => {
  if (newVal) {
    setDefaultDialog();
  }
  innerVisible.value = newVal;
})

const emit = defineEmits(['update:visible', 'confirm']);
const innerVisible = ref(false);
const isConfirm = ref(false);

const operationType = ref('upload');
const uploadingCount = ref(0) // 正在上传的文件数
const rawFiles = ref([]);
const searchKeyword = ref('');
const fileType = ref('all');
const currentPage = ref(1);
const pageSize = ref(8);

const uploading = computed(() => uploadingCount.value > 0);

const total = computed(() => filteredFiles.value.length);

const filteredFiles = computed(() =>
  rawFiles.value.filter(file =>
    file.name.includes(searchKeyword.value) &&
    matchesType(file, fileType.value)
  )
);

const paginatedFileList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredFiles.value.slice(start, start + pageSize.value);
});

const selectedFiles = computed(() => {
  return rawFiles.value.filter(item => item.checked)
});

const matchesType = (file, type) => {
  const ext = file.name.split('.').pop().toLowerCase();
  const map = {
    image: ['png', 'jpg', 'jpeg', 'gif', 'bmp'],
    doc: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'],
    video: ['mp4', 'avi', 'mov', 'wmv'],
  };
  if (type === 'all') return true;
  return map[type]?.includes(ext);
};

function setDefaultDialog() {
  operationType.value = 'upload';
  searchKeyword.value = '';
  fileType.value = 'all';
  fetchRawFiles();
}

async function fetchRawFiles() {
  rawFiles.value = [];
  currentPage.value = 1;
  const response = await api.get('/api/files', {
    params: {
      userId: props.userId,
      isStudent: props.isStudent
    }
  });
  if (response.code) {
    rawFiles.value = response.data;
  } else {
    ElMessage.error('获取资源库失败！');
  }
}

function upload({ file }) {
  const MAX_SIZE_MB = 20;
  const maxSize = MAX_SIZE_MB * 1024 * 1024;

  if (file.size > maxSize) {
    ElMessage.error(`文件大小不能超过 ${MAX_SIZE_MB}MB!`);
    return;
  }


  uploadingCount.value ++;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', props.userId);
  formData.append('isStudent', props.isStudent);

  api.post('/api/files', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(response => {
    uploadingCount.value --;
    if (response.code) {
      ElMessage.success("上传成功！");
      fetchRawFiles();
    } else {
      ElMessage.error('上传失败！');
    }
  });
}

const getIcon = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  if (['png', 'jpg', 'jpeg', 'gif', 'bmp'].includes(ext)) return '/icons/image.svg';
  if (ext === 'pdf') return '/icons/pdf.svg';
  if (ext === 'txt') return '/icons/txt.svg';
  if (['ppt', 'pptx'].includes(ext)) return '/icons/ppt.svg';
  if (['doc', 'docx'].includes(ext)) return '/icons/word.svg';
  if (['xls', 'xlsx'].includes(ext)) return '/icons/excel.svg';
  if (['zip', 'rar', '7z'].includes(ext)) return '/icons/zip.svg';
  return '/icons/file.svg';
}

const closeDialog = () => {
  if (isConfirm.value) {
    emit('confirm', selectedFiles.value);
  } else {
    emit('confirm', []);
  }
  isConfirm.value = false;
  emit('update:visible', false);
}

const confirm = () => {
  isConfirm.value = true;
  innerVisible.value = false;
};

</script>

<style scoped>
.file-item {
  display: flex;
  align-items: flex-start;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.file-icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
}

.file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.file-name {
  font-weight: 500;
  color: #333;
  max-width: 800px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-meta {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

.center-footer {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
}

.section-divider {
  border-top: 1px solid #e0e0e0;
  margin: 10px 0;
}

::v-deep(.el-upload-dragger) {
  min-height: 260px !important;
  background-color: #f5f5f5;
  display: flex !important;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

:deep(.el-tabs__header) {
  margin-bottom: 0 !important;
}
</style>
