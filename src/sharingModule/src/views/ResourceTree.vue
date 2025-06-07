<template>
  <div class="resource-tree-container">
    <h2>课程资源树</h2>
    <el-input
      v-model="query"
      style="width: 240px; margin-top: 10px;"
      placeholder="请输入关键字搜索"
      @input="onQueryChanged"
    />
    <el-tree
      ref="treeRef"
      style="width: 100%; max-width: 800px"
      :data="dataSource"
      node-key="id"
      default-expand-all
      :expand-on-click-node="false"
      :filter-node-method="filterMethod"
    >
    <template #default="{ node }">
      
        <div class="custom-tree-node">
          <span style="display: flex; align-items: center;">
            <img class="node-icon" :src="node.data.type === 'file' ? getIcon(node.label) : '/icons/dir.svg'">
            {{ node.label }}
          </span>
          <div>
            <el-button v-if="node.data.type === 'directory'" type="primary" link @click="append(node)">
              上传
            </el-button>
            <el-button v-if="node.data.type === 'file'" type="success" link @click="download(node)">
              下载
            </el-button>
            <el-button
              style="margin-left: 4px"
              type="danger"
              link
              @click="remove(node)"
              v-if="!props.isStudent"
            >
              删除
            </el-button>
          </div>
        </div>


      </template>
    </el-tree>

    <!-- 创建文件/文件夹 弹窗 -->
    <el-dialog
      title="创建文件夹/上传文件"
      v-model="isAppendVisible"
      width="400px"
    >
    <div class="radio-header">
      <el-radio-group v-model="createType">
        <el-radio value="folder">文件夹</el-radio>
        <el-radio value="file">文件</el-radio>
      </el-radio-group>
    </div>
      
      <div style="width: 60%; margin: 0 auto;">
        <el-input
          v-if="createType === 'folder'"
          v-model="folderName"
          placeholder="请输入文件夹名"
          style="margin-top: 10px;"
        />
      </div>

      <div v-if="createType === 'file'" style="margin: 10px;">
        <div style="display: flex; justify-content: center;">
          <el-button style="height: 75px; width: 250px; font-size: 18px; padding: 0 30px;" @click="() => isSelectVisible = true">
            <el-icon color="black" style="margin-right: 10px;"><Files /></el-icon>
            选择文件
          </el-button>
        </div>
        

        <!-- 选中文件列表 -->
        <div v-if="selectedFiles.length > 0" style="max-height: 180px; overflow-y: auto; margin-top: 10px; border: 1px solid #eee; border-radius: 6px; padding: 10px;">
          <div
            v-for="(file, index) in selectedFiles"
            :key="index"
            style="display: flex; align-items: center; margin-bottom: 8px;"
          >
            <img
              :src="getIcon(file.name)"
              alt="icon"
              style="width: 24px; height: 24px; margin-right: 10px;"
            />
            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 300px;">
              {{ file.name }}
            </span>
          </div>
        </div>

      </div>

      <resource-selector
        v-model:visible="isSelectVisible"
        :userId="props.userId"
        :isStudent="props.isStudent"
        @confirm="(files) => selectedFiles = files"
        >
      </resource-selector>


      <template #footer>
        <div class="center-footer">
          <el-button type="primary" :disabled="(createType === 'folder' && folderName == '') || (createType === 'file' && selectedFiles.length == 0)" @click="uploadToSharedTree">确定</el-button>
        </div>
      </template>

    </el-dialog>

    <!-- 删除确认 弹窗 -->
    <el-dialog
      title="删除文件"
      v-model="isDeleteVisible"
      width="400px"
    >
      <p>确定要删除该文件吗？</p>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="isDeleteVisible = false">取消</el-button>
          <el-button type="danger" @click="deleteFile">删除</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { Files } from '@element-plus/icons-vue';
import api from '../api/api';
import downloadApi from '../api/downloadApi';
import { ElMessage } from 'element-plus';
import { ref, defineProps, onMounted } from 'vue'
import ResourceSelector from '../components/ResourceSelector.vue';

const props = defineProps({
  userId: {
    type: Number,
    required: true
  },
  sectionId: {
    type: Number,
    required: true
  },
  isStudent: {
    type: Boolean,
    required: true
  }
});

// 使用 ref 存储 dataSource
const dataSource = ref([]);

// 弹窗相关
const isAppendVisible = ref(false); // 上传弹窗开关
const isDeleteVisible = ref(false); // 删除弹窗开关
const isSelectVisible = ref(false); // 选择文件弹窗开关
const currentNode = ref(null); // 当前节点，保存待操作的节点
const folderName = ref(''); // 输入的文件夹名称
const createType = ref('folder'); // 当前创建的类型，默认为 'folder'
const query = ref(''); // 查询字符串
const treeRef = ref(null);

const selectedFiles = ref([]);

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

// 路径生成函数
const getPath = (node) => {
  const path = []
  let currentNode = node
  while (currentNode) {
    if (currentNode.label !== 'root') {  // 跳过 root 节点
      path.unshift(currentNode.label)
    }
    currentNode = currentNode.parent
  }
  return `${path.join('/')}`
}

// 打开创建文件/文件夹弹窗
const append = (node) => {
  currentNode.value = node // 保存当前节点，用于在确认时更新树数据
  openAppendDialog();
}
const openAppendDialog = () => {
  createType.value = 'folder';
  folderName.value = '';
  selectedFiles.value = [];
  isAppendVisible.value = true;
}

// 打开删除确认弹窗
const remove = (node) => {
  isDeleteVisible.value = true
  currentNode.value = node // 保存当前节点，用于删除操作
}

// 过滤树节点的方法
const filterMethod = (query, node) => {
  return node.label.toLowerCase().includes(query.toLowerCase())
}

// 触发树的过滤功能
const onQueryChanged = (query) => {
  treeRef.value?.filter(query)
}

async function deleteFile() {
  const response = await api.delete('/shared-file', {
    params: {
        filePath: '/section/' + props.sectionId + getPath(currentNode.value)
      }
  });
  if (response.code) {
    isDeleteVisible.value = false;
    await getTree();
    ElMessage.success('删除成功！');
  } else {
    ElMessage.error(response.message);
  }
}

async function download(node) {
  try {
    const response = await downloadApi.get('/api/file', {
      params: {
        filePath: "/section/" + props.sectionId + getPath(node) 
      },
      responseType: 'blob',
    });
    // 正常文件流下载
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = node.label || 'file';
    a.click();
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    // 统一处理所有错误（包括HTTP错误、网络错误等）
    if (error.response) {
      // 服务器返回了非2xx状态码
      ElMessage.error('请求错误，状态码:' + error.response.status)
    } else if (error.request) {
      // 请求发出去了，但没有收到响应，网络错误
      ElMessage.error('网络错误或服务器无响应');
    } else {
      // 其他错误
      ElMessage.error('请求出错:', error.message);
    }
  }
}

async function getTree() {
  const response = await api.get('/shared-file', {
    params: {
      sectionId: props.sectionId,
    }
  });
  if (response.code) {
    dataSource.value = [{
      id: 0,
      label: 'root',
      type: 'directory', 
      children: response.data,
    }];
  } else {
    ElMessage.error('资源树获取失败!' + response.message);
    dataSource.value = [];
  }
}

async function uploadToSharedTree() {
  const response = await api.post('/shared-file', {
    sectionId: props.sectionId,
    userId: props.userId,
    student: props.isStudent,
    relativePath: getPath(currentNode.value),
    files: selectedFiles.value.map(file => file.name),
    folder: folderName.value,
    createType: createType.value,
  });
  if (response.code) {
    ElMessage.success('上传成功');
    isAppendVisible.value = false;
    await getTree();
  } else {
    ElMessage.error('上传失败!' + response.message);
  }
}

// 页面渲染前调用的生命周期函数
onMounted(async () => {
  await getTree();
});

</script>

<style scoped>
.resource-tree-container {
  min-width: 800px;
  width: 80%;
  background: white;
  padding: 30px 40px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center /* 让 el-tree 居中 */
}

h2 {
  margin: 0;
  color: #0d47a1;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 5;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}

/* 让 footer 居中 */
.center-footer {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
}

.node-icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
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

.radio-header {
  display: flex !important;
  justify-content: center !important;
  margin-bottom: 15px;
}
</style>