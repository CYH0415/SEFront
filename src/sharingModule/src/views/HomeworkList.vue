<template>
  <div class="list-box">
    <div class="top-line">
      <h2>作业列表</h2>
      <el-button v-if="!isStudent" size="large" @click="openHomeworkAssignDialog">布置作业</el-button>
    </div>
    <!-- 学生表格 -->
    <el-table v-if="isStudent" :data="paginatedInfo" border style="width: 100%">
      <el-table-column prop="title" label="作业名称" width="200" />
      <el-table-column prop="deadline" label="截止时间" width="180" />
      <el-table-column label="提交情况" width="120">
        <template #default="{ row }">
          <span>{{ row.commitDescription !== null ? '已提交' : '未提交' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="批改情况" width="120">
        <template #default="{ row }">
          <span>{{ row.score !== null ? '已批改' : '未批改' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="350">
        <template #default="{ row }">
          <el-button size="small" @click="openDetailInfoDialog(row)">查看作业详情</el-button>
          <el-button v-if="row.score !== null" size="small" @click="openGradeDialog(row)">查看批改结果</el-button>
          <el-button v-if="row.commitDescription === null" size="small" @click="openHomeworkCommitDialog(row)">提交作业</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 老师表格 -->
    <el-table v-if="!isStudent" :data="paginatedInfo" border style="width: 100%">
      <el-table-column prop="title" label="作业名称" width="200" />
      <el-table-column prop="deadline" label="截止时间" width="180" />
      <el-table-column label="是否最终提交" width="120">
        <template #default="{ row }">
          <span>{{ row.committed ? '已最终提交' : '未最终提交' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="300">
        <template #default="{ row }">
          <el-button size="small" @click="openDetailInfoDialog(row)">查看作业详情</el-button>
          <el-button size="small" @click="openCorrectionListDialog(row)">批改情况</el-button>
          <el-button v-if="!row.committed" size="small" @click="onFinalCommit(row)">最终提交</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-box">
      <el-pagination
      layout="prev, pager, next"
      :total="totalInfo"
      :page-size="homeworkInfoForm.pageSize"
      v-model:current-page="homeworkInfoForm.currentPage"
      class="pagination-bar"
    />
    </div>

    <!-- 查看作业详情弹窗 -->
    <el-dialog title="作业详情" v-model="isInfoVisible" width="50%">
      <div>
        <p><strong>作业名称：</strong>{{ currentHomework.title }}</p>
        <p><strong>描述：</strong>{{ currentHomework.description }}</p>
        <p><strong>截止时间：</strong>{{ currentHomework.deadline }}</p>
        <p><strong>占比：</strong>{{ currentHomework.proportion * 100 }} %</p>
        <p><strong>附件：</strong></p>
      </div>
      <div v-if="currentHomework.files.length > 0" style="max-height: 180px; overflow-y: auto; margin-top: 10px; border: 1px solid #eee; border-radius: 6px; padding: 10px;">
            <div
              v-for="(file, index) in currentHomework.files"
              :key="index"
              style="display: flex; align-items: center; margin-bottom: 8px;"
            >
              <img
                :src="getIcon(file)"
                alt="icon"
                style="width: 24px; height: 24px; margin-right: 10px;"
              />
              <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;">
                {{ file }}
                <el-button link @click="download(file)">
                  下载
                </el-button>
              </span>
            </div>
          </div>
    </el-dialog>

    <!-- 查看批改结果弹窗 -->
    <el-dialog title="批改结果" v-model="isGradeVisible" width="50%">
      <div>
        <p><strong>作业名称：</strong>{{ currentHomework.title }}</p>
        <p><strong>分数：</strong>{{ currentHomework.score }}</p>
        <p><strong>评语：</strong>{{ currentHomework.feedback }}</p>
      </div>

    </el-dialog>

    <!-- 提交作业弹窗 -->
    <el-dialog title="提交作业" v-model="isHomeworkCommitVisible" width="50%">
      <div class="dialog-content">
        <p><strong>作业名称：</strong>{{ currentHomework.title }}</p>
      </div>
      <el-form :model="homeworkRecordToCommit" label-width="auto" class="form-container">
        <!-- 描述框 -->
        <el-form-item label="描述信息" prop="description" class="form-item">
          <el-input v-model="homeworkRecordToCommit.description" type="textarea" placeholder="请输入描述内容" :rows="4" maxlength="255"/>
        </el-form-item>

        <!-- 文件上传 -->
        <div style="margin: 10px">
          <el-button style="height: 75px; width: 250px; font-size: 18px; padding: 0 30px;" @click="() => isSelectVisible = true">
            <el-icon color="black" style="margin-right: 10px;"><Files /></el-icon>
            选择文件
          </el-button>
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

        <!-- 提交按钮 -->
        <div>
          <el-button type="primary" @click="onCommitHomework">提交作业</el-button>
          <el-button @click="cancelCommitHomework" style="margin-left: 10px;">取消</el-button>
        </div>
      </el-form>
    </el-dialog>

    <!-- 布置作业弹窗 -->
    <el-dialog title="布置作业" v-model="isHomeworkAssignVisible" width="70%">
      <el-form :model="currentHomework" label-width="auto" class="form-container">
        <!-- 作业名框 -->
        <el-form-item label="作业名" class="form-item">
          <el-input v-model="currentHomework.title" type="textarea" placeholder="请输入作业名" :rows="1" maxlength="255" />
        </el-form-item>
        <!-- 描述框 -->
        <el-form-item label="描述信息" class="form-item">
          <el-input v-model="currentHomework.description" type="textarea" placeholder="请输入描述内容" :rows="4" maxlength="255" />
        </el-form-item>
        <!-- 占比框 -->
        <el-form-item label="占比(%)" class="form-item">
          <el-input v-model="currentHomework.proportion" type="number" placeholder="请输入占比(%)" :rows="1" />
        </el-form-item>
        <!-- 截止时间框 -->
        <el-form-item label="截止时间" class="form-item">
          <el-date-picker
            v-model="currentHomework.deadline"
            type="datetime"
            placeholder="选择截止时间"
          />
        </el-form-item>

        <!-- 文件上传 -->
        <div style="margin: 10px">
          <el-button style="height: 75px; width: 250px; font-size: 18px; padding: 0 30px;" @click="() => isSelectVisible = true">
            <el-icon color="black" style="margin-right: 10px;"><Files /></el-icon>
            选择文件
          </el-button>
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

        <!-- 提交按钮 -->
        <div>
          <el-button type="primary" @click="onAssignHomework" :disabled="currentHomework.title == '' || currentHomework.deadline == '' || String(currentHomework.proportion) === ''">提交</el-button>
          <el-button @click="cancelAssignHomework" style="margin-left: 10px;">取消</el-button>
        </div>
      </el-form>
    </el-dialog>

    <!-- 批改详情弹窗 -->
    <el-dialog :title="correctionDetailTitle" v-model="isCorrectionListVisible" width="80%" :style="{ minWidth: '750px' }">
      <div class="correction-detail-box">
        <div class="correction-list-box">
          <el-table :data="paginatedRecord" border >
            <el-table-column prop="studentName" label="姓名" width="200" />
            <el-table-column label="提交情况" width="120">
              <template #default="{ row }">
                <span>{{ row.description === null ? '未提交' : '已提交' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="得分" width="120">
              <template #default="{ row }">
                <span>{{ row.score === null ? '未批改' : row.score }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="240">
              <template #default="{ row }">
                <el-button v-if="row.description !== null" size="small" @click="openHomeworkRecordDialog(row)">查看提交详情</el-button>
                <el-button 
                  size="small" 
                  @click="openHomeworkCorrectionDialog(row)">
                  {{ row.score === null ? '批改' : '批改详情' }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <!-- 分页 -->
          <div class="pagination-box">
            <el-pagination
              layout="prev, pager, next"
              :total="totalRecord"
              :page-size="homeworkRecordForm.pageSize"
              v-model:current-page="homeworkRecordForm.currentPage"
              class="pagination-bar"
            />
          </div>
        </div>
      </div>

      <!-- 提交详情弹窗 -->
      <el-dialog title="" v-model="isHomeworkRecordVisible" append-to-body>
        <div>
          <p><strong>姓名：</strong>{{ currentHomeworkRecord.studentName }}</p>
          <p><strong>描述：</strong>{{ currentHomeworkRecord.description }}</p>
          <p><strong>附件：</strong></p>
          <div v-for="(file, index) in currentHomeworkRecord.files" :key="index" class="file-item">
            <span>{{ file }}</span>
            <el-button
              size="small"
              type="text"
              @click="downloadFile(file)"
              class="download-button"
            >
              下载
            </el-button>
          </div>
        </div>
      </el-dialog>

      <!-- 批改弹窗 -->
      <el-dialog title="" v-model="isHomeworkCorrectionVisible" width="50%" center append-to-body>
        <el-form :model="currentCorrection" label-width="auto" class="form-container">
          <el-form-item label="分数">
            <el-input v-model="currentCorrection.score" style="width: 150px;" placeholder="请输入分数" type="number" step="1" />
          </el-form-item>
          <el-form-item label="评语">
            <el-input v-model="currentCorrection.feedback" type="textarea" placeholder="请输入评语" :rows="4" maxlength="255"/>
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button v-if="!currentHomework.committed" type="primary" @click="onCorrectHomework" :disabled="String(currentCorrection.score) === ''" >{{isCorrected ? '修改' : '提交'}}</el-button>
          </div>
        </template>
      </el-dialog>
      
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineProps } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Files } from '@element-plus/icons-vue';
import api from '../api/api';
import dayjs from 'dayjs';
import ResourceSelector from '../components/ResourceSelector.vue';
import downloadApi from '../api/downloadApi';

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

// 弹窗相关
const isInfoVisible = ref(false); // 作业详情窗口开关
const isGradeVisible = ref(false); // 学生批改结果窗口开关
const isHomeworkCommitVisible = ref(false); //  提交作业窗口开关
const isCorrectionListVisible = ref(false); // 教师批改情况窗口开关
const isHomeworkRecordVisible = ref(false); // 批改情况中提交详情窗口开关
const isHomeworkCorrectionVisible = ref(false); // 批改情况中批改、批改详情窗口开关
const isCorrected = ref(false); // 控制下方按钮显示为提交还是修改
const isHomeworkAssignVisible = ref(false); // 教师布置作业窗口开关
const currentCorrection = ref({}); // 当前选择的批改详情
const correctionDetailTitle = ref("批改情况");
const currentHomeworkRecord = ref({}); // 当前选择的提交记录
const currentHomework = ref({}); // 当前选择的作业
const isSelectVisible = ref(false); // 选择文件弹窗开关
// 提交作业窗口对应的作业记录数据
const homeworkRecordToCommit = ref({});
const selectedFiles = ref([]);

// 作业列表的表格数据
const homeworkInfoForm = ref({
  list: [], // 作业列表
  pageSize: 10, // 每页展示条目数
  currentPage: 1, // 当前页数
});
// 计算总条目数
const totalInfo = computed(() => {
  return homeworkInfoForm.value.list.length;
});
// 分页计算
const paginatedInfo = computed(() => {
  const start = (homeworkInfoForm.value.currentPage - 1) * homeworkInfoForm.value.pageSize;
  const end = start + homeworkInfoForm.value.pageSize;
  return homeworkInfoForm.value.list.slice(start, end);
});

// 批改情况的表格数据
const homeworkRecordForm = ref({
  list: [], // 作业提交记录及其评分列表
  pageSize: 10, // 每页展示条目数
  currentPage: 1, // 当前页数
});
// 计算总条目数
const totalRecord = computed(() => {
  return homeworkRecordForm.value.list.length;
});
// 分页计算
const paginatedRecord = computed(() => {
  const start = (homeworkRecordForm.value.currentPage - 1) * homeworkRecordForm.value.pageSize;
  const end = start + homeworkRecordForm.value.pageSize;
  return homeworkRecordForm.value.list.slice(start, end);
});

// 获取该课程作业列表
async function getHomeworkInfoList() {
  const response = props.isStudent ?
    await api.get('/student/homework', {
      params: {
        studentId: props.userId,
        sectionId: props.sectionId
      }
    }) :
    await api.get('/teacher/homework', {
      params: {
        sectionId: props.sectionId
      }
    });
  if (response.code) {
    return response.data;
  } else {
    ElMessage.error('作业列表获取失败!' + response.message);
  }
}

// 下载文件
async function downloadFile(name) {
  try {
    const response = await downloadApi.get('/api/file', {
      params: {
        filePath: "/homeworkRecord/" + currentHomework.value.homeworkId + '/' + currentHomeworkRecord.value.studentId + '/' + name 
      },
      responseType: 'blob',
    });
    // 正常文件流下载
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = name || 'file';
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

// 打开作业详情弹窗
function openDetailInfoDialog(row) {
  currentHomework.value = row;
  isInfoVisible.value = true;
}

// 打开批改结果弹窗
function openGradeDialog(row) {
  currentHomework.value = row;
  isGradeVisible.value = true;
}

// 打开提交作业弹窗
function openHomeworkCommitDialog(row) {
  homeworkRecordToCommit.value = {
    description: "",
  };
  selectedFiles.value = [];
  currentHomework.value = row;
  isHomeworkCommitVisible.value = true;
}

// 打开批改情况弹窗
async function openCorrectionListDialog(row) {
  currentHomework.value = row;
  correctionDetailTitle.value = row.title + " 批改情况";
  const response = await api.get('/teacher/homework-detail', {
    params: {
      sectionId: props.sectionId,
      homeworkId: row.homeworkId
    }
  });
  if (response.code) {
    homeworkRecordForm.value.list = response.data;
    isCorrectionListVisible.value = true;
  } else {
    ElMessage.error('批改情况获取失败!' + response.message);
  }
}

// 点击提交作业按钮
async function onCommitHomework() {
  if (homeworkRecordToCommit.value.description.length > 255) {
    ElMessage.error('描述不能超过255字!');
    return;
  }
  if (
    dayjs(currentHomework.value.deadline).isBefore(dayjs())
  ) {
    ElMessage.error('作业提交已截止!');
    return;
  }
  const response = await api.post('/student/homework', {
    sectionId: props.sectionId,
    studentId: props.userId,
    homeworkId: currentHomework.value.homeworkId,
    description: homeworkRecordToCommit.value.description,
    files: selectedFiles.value.map(item => item.name)
  });
  if (response.code) {
    ElMessage.success('提交成功!');
    isHomeworkCommitVisible.value = false;
    homeworkInfoForm.value.list = await getHomeworkInfoList();
  } else {
    ElMessage.error('作业提交失败!' + response.message);
  }
}
// 取消提交按钮
function cancelCommitHomework() {
  isHomeworkCommitVisible.value = false;
}

// 打开布置作业弹窗
function openHomeworkAssignDialog() {
  currentHomework.value = {
    title: '',
    proportion: 0,
    deadline: '',
    description: ''
  };
  selectedFiles.value = [];
  isHomeworkAssignVisible.value = true;
}
// 点击布置作业按钮
async function onAssignHomework() {
  if (
    dayjs(currentHomework.value.deadline).isBefore(dayjs())
  ) {
    ElMessage.error('截止时间必须晚于当前时间!');
    return;
  }
  if (currentHomework.value.proportion < 0) {
    ElMessage.error('占比必须为正!');
    return;
  }
  if (currentHomework.value.proportion > 100) {
    ElMessage.error('占比不能高于100%!');
    return;
  }
  if (!/^-?\d+$/.test(currentHomework.value.proportion)) {
    ElMessage.error('占比不支持小数!');
    return;
  }
  if (currentHomework.value.title.length > 255) {
    ElMessage.error('标题不能超过255字!');
    return;
  }
  if (currentHomework.value.description.length > 255) {
    ElMessage.error('描述不能超过255字!');
    return;
  }
  const response = await api.post('/teacher/homework', {
    teacherId: props.userId,
    sectionId: props.sectionId,
    ...currentHomework.value,
    proportion: currentHomework.value.proportion / 100,
    deadline: dayjs(currentHomework.value.deadline).format('YYYY-MM-DD HH:mm:ss'),
    files: selectedFiles.value.map(item => item.name),
  });
  if (response.code) {
    ElMessage.success('作业布置成功!');
    // 刷新作业列表
    isHomeworkAssignVisible.value = false;
    homeworkInfoForm.value.list = await getHomeworkInfoList();
  } else {
    ElMessage.error('作业布置失败!' + response.message);
  }
}
// 取消布置按钮
function cancelAssignHomework() {
  isHomeworkAssignVisible.value = false;
}

// 打开提交详情弹窗
function openHomeworkRecordDialog(row) {
  currentHomeworkRecord.value = row;
  isHomeworkRecordVisible.value = true;
}

// 打开批改、批改详情弹窗
function openHomeworkCorrectionDialog(row) {
  currentCorrection.value = {
    sectionId: props.sectionId,
    homeworkId: currentHomework.value.homeworkId,
    studentId: row.studentId,
    score: row.score === null ? 0 : row.score,
    feedback: row.feedback === null ? '' : row.feedback
  };
  if (row.score !== null) {
    isCorrected.value = true;
  } else {
    isCorrected.value = false;
  }
  isHomeworkCorrectionVisible.value = true;
}
// 点击批改、修改按钮
async function onCorrectHomework() {
  if (currentCorrection.value.feedback.length > 255) {
    ElMessage.error('评语不能超过255字!');
    return;
  }
  if (currentCorrection.value.score > 100) {
    ElMessage.error('分数不能超过100!');
    return;
  }
  if (currentCorrection.value.score < 0) {
    ElMessage.error('分数不能为负!');
    return;
  }
  if (!/^-?\d+$/.test(currentCorrection.value.score)) {
      ElMessage.error('分数不能有小数!');
      return;
    }
  const response = isCorrected.value ? 
    await api.put('/teacher/homework/correction', currentCorrection.value) :
    await api.post('/teacher/homework/correction', currentCorrection.value);
  if (response.code) {
    ElMessage.success('批改成功!');
    // 刷新数据
    const response = await api.get('/teacher/homework-detail', {
      params: {
        sectionId: props.sectionId,
        homeworkId: currentHomework.value.homeworkId
      }
    });
    if (response.code) {
      homeworkRecordForm.value.list = response.data;
    } else {
      ElMessage.error('批改情况获取失败!' + response.message);
    }
    isHomeworkCorrectionVisible.value = false;
  } else {
    ElMessage.error('批改失败!' + response.message);
  }
}

async function onFinalCommit(row) {
  if (
    await ElMessageBox.confirm(
      `确认提交？`
    ).then(
      () => true,
      () => false
    )
  ) {
    const response = await api.post('/teacher/homework/commit', null, {
      params: {
        sectionId: props.sectionId,
        homeworkId: row.homeworkId
      }
    });
    if (response.code) {
      ElMessage.success('最终提交成功!');
      // 刷新
      homeworkInfoForm.value.list = await getHomeworkInfoList();
    } else {
      ElMessage.error('最终提交失败!' + response.message);
    }
  }
}

async function download(fileName) {
  try {
    const response = await downloadApi.get('/api/file', {
      params: {
        filePath: "/homework/" + currentHomework.value.homeworkId + '/' + fileName
      },
      responseType: 'blob',
    });
    // 正常文件流下载
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileName || 'file';
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

// 页面渲染前调用的生命周期函数
onMounted(async() => {
  homeworkInfoForm.value.list = await getHomeworkInfoList();
});
</script>

<style scoped>
.correction-detail-box {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.correction-list-box {
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
.list-box {
  background: white;
  padding: 20px 40px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.top-line {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.el-dialog .el-button--primary {
  background-color: #409eff;
  border-color: #409eff;
}

.form-container {
  max-width: 600px;
  margin: 0 auto;
}

h2 {
  color: #0d47a1;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 5;
}
</style>