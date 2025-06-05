<template>
  <div class="page-container">
    <div class="inner-container">
      <h1>我的课表</h1>
      <div class="search-container">
        <!--最开始设成输入学号的形式方便测试，现在已被注释-->
        <!--<input type="text" v-model="searchStudentId" placeholder="请输入学号" class="search-input">-->
        <input list="year-list" id="courseYear" placeholder="上课年份" class="search-input" v-model="searchCourseYear">
        <datalist id="year-list">
          <option value="2025"></option>
          <option value="2024"></option>
          <option value="2023"></option>
          <option value="2022"></option>
          <option value="2021"></option>
        </datalist>
        <input list="semester-list" id="courseSemester" placeholder="上课学期" class="search-input" v-model="searchCourseSemester">
        <datalist id="semester-list">
          <option value="春"></option>
          <option value="夏"></option>
          <option value="秋"></option>
          <option value="冬"></option>
        </datalist>
        <div class="button-group">
          <button @click="searchCoursetable" class="search-btn">查询课表</button>
          <button @click="printPage" class="print-btn">打印课表</button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>加载课表中...</p>
      </div>

      <!-- 错误提示 -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <!-- 课表展示区域 -->
      <div v-if="tableData.length > 0" class="timetable-container" ref="timetable">
        <div class="timetable-header">
          <h2>{{ searchCourseYear }}年{{ searchCourseSemester }}季学期课表</h2>
        </div>
        <table class="timetable-table">
          <thead>
          <tr>
            <th>时间</th>
            <th>周一</th>
            <th>周二</th>
            <th>周三</th>
            <th>周四</th>
            <th>周五</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(row, index) in tableData" :key="index">
            <td class="time-cell">{{ row.time }}</td>
            <td v-for="day in ['周一', '周二', '周三', '周四', '周五']" :key="day">
              <div v-if="row[day]" class="course-cell">
                <div class="course-name">{{ row[day].courseName }}</div>
                <div class="course-location">{{ row[day].location }}</div>
              </div>
              <div v-else class="empty-cell">-</div>
            </td>
          </tr>
          </tbody>
        </table>
        <div class="timetable-footer">
          <p>注：春夏学期的课表包含春季和夏季课程，秋冬学期的课表包含秋季和冬季课程</p>
        </div>
      </div>

      <!-- 无数据提示 -->
      <div v-if="noDataMessage" class="no-data-message">
        {{ noDataMessage }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  mounted() {
    // 打印路由参数 userId
    console.log('路由参数 userId:', this.$route.params.userId);
  },
  data() {
    return {
      // searchStudentId: '',
      searchCourseYear: '',
      searchCourseSemester: '',
      tableData: [],
      loading: false,
      errorMessage: '',
      noDataMessage: ''
    };
  },
  computed: {
    // 从Vuex或路由参数中获取studentId
    studentId() {
      // 这里假设studentId存储在Vuex中
      // return this.$store.state.user.studentId;

      // 如果使用路由参数
      return 1;
      // return this.$route.params.userId;
    }
  },
  methods: {
    printPage() {
      if (!this.searchCourseYear || !this.searchCourseSemester) {
        this.errorMessage = '请选择年份和学期后再打印';
        return;
      }

      if (this.tableData.length === 0) {
        this.errorMessage = '没有可打印的课表数据';
        return;
      }

      // 创建打印样式 - 改进表格样式和对齐
      const printStyle = `
    <style>
      @media print {
        body * {
          visibility: hidden;
        }
        .timetable-container, .timetable-container * {
          visibility: visible;
        }
        .timetable-container {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          padding: 10px;
        }
        .timetable-header {
          text-align: center;
          margin-bottom: 15px;
        }
        .timetable-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
          table-layout: fixed; /* 关键：固定表格布局确保列宽一致 */
        }
        .timetable-table, .timetable-table th, .timetable-table td {
          border: 1px solid #ddd; /* 添加边框确保单元格清晰可见 */
        }
        .timetable-table th, .timetable-table td {
          padding: 8px;
          text-align: center;
          vertical-align: middle;
          word-wrap: break-word; /* 允许长文本换行 */
        }
        .timetable-table th {
          background-color: #f2f2f2;
        }
        .course-cell {
          min-height: 60px; /* 设置最小高度确保单元格有足够空间 */
        }
        .timetable-footer {
          margin-top: 20px;
          font-size: 12px;
          color: #666;
          text-align: center;
        }
        /* 隐藏不必要的元素 */
        .page-container, .inner-container {
          padding: 0;
          margin: 0;
          box-shadow: none;
        }
        .search-container, .no-data-message, .error-message, .loading-container {
          display: none;
        }
      }
    </style>
  `;

      // 创建打印内容
      const printContent = this.$refs.timetable.cloneNode(true);
      const printWindow = window.open('', '_blank');

      printWindow.document.write(`
    <html>
      <head>
        <title> ${this.searchCourseYear}年${this.searchCourseSemester}季学期课表</title>
        ${printStyle}
      </head>
      <body>
        ${printContent.outerHTML}
      </body>
    </html>
  `);

      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    },

    async searchCoursetable() {
      // 验证输入
      if (!this.searchCourseYear) {
        this.errorMessage = '请选择年份';
        return;
      }
      if (!this.searchCourseSemester) {
        this.errorMessage = '请选择学期';
        return;
      }

      // 重置状态
      this.errorMessage = '';
      this.noDataMessage = '';
      this.loading = true;
      this.tableData = [];

      try {
        const userId = 1;
        // const userId = this.$route.params.userId; // 获取路由参数
        if (!userId) {
          this.errorMessage = '请先获取用户ID';
          return;
        }

        // 转换年份为数字并校验
        const year = Number(this.searchCourseYear);
        if (isNaN(year)) {
          this.errorMessage = '年份格式错误，请选择有效年份';
          return;
        }

        // 构建查询URL和参数
        const url = `http://localhost:8080/student/${encodeURIComponent(userId)}/CourseTableS`;
        const params = new URLSearchParams({
          year: year.toString(), // 转为字符串传递
          semester: this.searchCourseSemester // 自动编码中文参数
        });

        // 发送请求（移除错误的 Content-Type 头）
        const response = await fetch(`${url}?${params}`, {
          method: 'GET',
          credentials: 'include', // 携带cookie
          headers: {} // 保留空对象，避免干扰 GET 请求
        });

        // 检查HTTP状态码
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({})); // 尝试解析错误JSON
          const errorMessage = errorData.errorMessage || `HTTP错误 ${response.status}`;
          throw new Error(errorMessage);
        }

        // 解析响应数据
        const data = await response.json();
        console.log('解析后的响应:', data); // 直接获取解析后的对象

        // 处理响应数据
        if (data.errorMessage) {
          this.errorMessage = data.errorMessage;
          return;
        }
        if (data.noDataMessage) {
          this.noDataMessage = data.noDataMessage;
          return;
        }
        if (data.timetable) {
          this.transformTimetableData(data.timetable);
        } else {
          this.errorMessage = '响应格式不正确：缺少 timetable 字段';
        }
      } catch (error) {
        console.error('获取课表失败:', error);
        this.errorMessage = error.message || '获取课表失败，请重试';
      } finally {
        this.loading = false;
      }
    },

    transformTimetableData(timetable) {
      // 定义时间段映射
      const periodMap = {
        '1': '第1-2节',
        '2': '第3-5节',
        '3': '第6-7节',
        '4': '第8-10节',
        '5': '第11-12节'
      };

      // 初始化课表结构（5行，对应5个时间段）
      this.tableData = [
        { time: '第1-2节', 周一: null, 周二: null, 周三: null, 周四: null, 周五: null },
        { time: '第3-5节', 周一: null, 周二: null, 周三: null, 周四: null, 周五: null },
        { time: '第6-7节', 周一: null, 周二: null, 周三: null, 周四: null, 周五: null },
        { time: '第8-10节', 周一: null, 周二: null, 周三: null, 周四: null, 周五: null },
        { time: '第11-12节', 周一: null, 周二: null, 周三: null, 周四: null, 周五: null },
      ];

      console.log('原始课表数据:', timetable);

      // 遍历后端返回的星期数据
      Object.entries(timetable).forEach(([day, courses]) => {
        console.log(`处理 ${day} 的课程:`, courses);

        courses.forEach(course => {
          const period = course.period; // 这里使用period字段作为时间段
          const timeSlot = periodMap[period];
          console.log(`课程: ${course.courseName}, 时间段: ${period} (映射为: ${timeSlot})`);

          if (!timeSlot) {
            console.log(`警告: 时间段 ${period} 无法映射到已知时间段`);
            return;
          }

          // 找到对应的时间段行
          const rowIndex = parseInt(period) - 1;
          if (rowIndex >= 0 && rowIndex < this.tableData.length) {
            const row = this.tableData[rowIndex];
            row[day] = {
              courseName: course.courseName,
              location: course.location
            };
            console.log(`成功添加课程到 ${day} ${timeSlot}`);
          } else {
            console.log(`警告: 找不到匹配的时间段行: ${timeSlot}`);
          }
        });
      });

      console.log('最终课表结构:', this.tableData);
    }
  }
};
</script>

<style scoped>
.page-container {
  width: 100%;
  flex-grow: 1;
  padding: 20px;
  box-sizing: border-box;
}

.inner-container {
  background-color: #f8f9fa;
  padding: 30px 40px 40px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.inner-container h1 {
  font-size: 30px;
  font-weight: 600;
  color: #0d47a1;
  margin: 0 0 20px 0;
  text-align: center;
}

/* 表格样式 */
.timetable-container {
  margin-top: 30px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.timetable-header {
  text-align: center;
  margin-bottom: 20px;
}

.timetable-header h2 {
  color: #0d47a1;
  font-size: 22px;
  margin: 0;
}

.timetable-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.timetable-table th {
  background-color: #0d47a1;
  color: white;
  font-weight: bold;
  padding: 12px 8px;
  text-align: center;
}

.timetable-table td {
  padding: 10px;
  border: 1px solid #e0e0e0;
  text-align: center;
  height: 80px;
  vertical-align: top;
}

.time-cell {
  background-color: #e3f2fd;
  font-weight: bold;
  color: #0d47a1;
}

.course-cell {
  background-color: #e8f5e9;
  border-radius: 4px;
  padding: 8px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.course-name {
  font-weight: bold;
  color: #2e7d32;
  margin-bottom: 5px;
}

.course-location {
  font-size: 13px;
  color: #388e3c;
}

.empty-cell {
  color: #bdbdbd;
  font-style: italic;
}

.timetable-footer {
  margin-top: 15px;
  font-size: 13px;
  color: #757575;
  text-align: center;
}

/* 搜索区域样式 */
.search-container {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-right: 10px;
}

.search-input:focus {
  border-color: #0d47a1;
  outline: none;
  box-shadow: 0 0 0 2px rgba(13, 71, 161, 0.1);
}

.search-btn, .print-btn {
  padding: 12px 20px;
  background-color: #0d47a1;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
  white-space: nowrap;
}

.search-btn:hover, .print-btn:hover {
  background-color: #1565c0;
}

.print-btn {
  background-color: #2e7d32;
}

.print-btn:hover {
  background-color: #388e3c;
}

.button-group {
  display: flex;
  gap: 20px; /* 为按钮之间添加更大的间距 */
}

/* 加载动画 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  margin-top: 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #0d47a1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 消息提示 */
.error-message, .no-data-message {
  padding: 15px;
  margin-top: 20px;
  border-radius: 6px;
  text-align: center;
  font-size: 16px;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
}

.no-data-message {
  background-color: #e3f2fd;
  color: #0d47a1;
  border: 1px solid #bbdefb;
}
</style>