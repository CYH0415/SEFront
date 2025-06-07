import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Section from '../sectionModule/src/App.vue'
import { userStore } from "../infoModule/src/store/user.ts";
import { getCurrentUserId, getCurrentUserType } from '../infoModule/src/function/CurrentUser.ts';

// Section Module imports
import AutoSchedule from '../sectionModule/src/pages/AutoSchedule.vue'
import ManualAdjust from '../sectionModule/src/pages/ManualAdjust.vue'
import AdminManualAdjust from '../sectionModule/src/pages/AdminManualAdjust.vue' 
import ResourceManage from '../sectionModule/src/pages/ResourceManage.vue'
import ResultQuery from '../sectionModule/src/pages/ResultQuery.vue'

// Info Module imports
import InfoApp from '../infoModule/src/App.vue'
import Login from '../infoModule/src/components/Login.vue'
import InformationManage from '../infoModule/src/components/InformationManage.vue'
import CourseManage from '../infoModule/src/components/CourseManage.vue'
import GradeQuery from '../infoModule/src/components/GradeQuery.vue'
import GradeModify from '../infoModule/src/components/GradeModify.vue'
import GradeAnalyze from '../infoModule/src/components/GradeAnalyze.vue'

// Testing Module imports
import TestingApp from '../testingModule/src/App.vue'
import LoginView from '../testingModule/src/views/Login.vue'
import StudentDashboard from '../testingModule/src/views/student/Dashboard.vue'
import StudentExamDetail from '../testingModule/src/views/student/ExamDetail.vue'
import StudentResults from '../testingModule/src/views/student/Results.vue'
import StudentExamQuestions from '../testingModule/src/views/student/ExamQuestions.vue'
import StudentPastPapers from '../testingModule/src/views/student/PastPapers.vue'
import StudentResultDetail from '../testingModule/src/views/student/ResultDetail.vue'
import StudentPastPaperDetail from '../testingModule/src/views/student/PastPaperDetail.vue'
import TeacherDashboard from '../testingModule/src/views/teacher/Dashboard.vue'
import QuestionBank from '../testingModule/src/views/teacher/QuestionBank.vue'
import CreatePaper from '../testingModule/src/views/teacher/CreatePaper.vue'
import ManualCreatePaper from '../testingModule/src/views/teacher/ManualCreatePaper.vue'
import AutoCreatePaper from '../testingModule/src/views/teacher/AutoCreatePaper.vue'
import TeacherPastPapers from '../testingModule/src/views/teacher/PastPapers.vue'
import ExamManagement from '../testingModule/src/views/teacher/ExamManagement.vue'
import ExamDetail from '../testingModule/src/views/Teacher/ExamDetails.vue'
import StudentsScores from '../testingModule/src/views/teacher/ExamStudentScore.vue'
import TeacherResultDetail from '../testingModule/src/views/teacher/TeacherResultDetail.vue'
import TeacherEndExam from '../testingModule/src/views/teacher/Examfinished.vue'
import TeacherPastPaperDetail from '../testingModule/src/views/teacher/PastPaperDetail.vue'

// Sharing Module imports
import SharingApp from '../sharingModule/src/App.vue'
import HomeworkList from '../sharingModule/src/views/HomeworkList.vue'
import ResourceTree from '../sharingModule/src/views/ResourceTree.vue'
import CourseDetail from '../sharingModule/src/views/CourseDetail.vue'
import CourseList from '../sharingModule/src/views/CourseList.vue'

// Selection Module imports
import SelectionStudentApp from '../selectionModule/student/src/App.vue'
import CourseTableS from '../selectionModule/student/src/components/CourseTableS.vue'
import CurriculumPlan from '../selectionModule/student/src/components/CurriculumPlan.vue'
import CourseSelectS from '../selectionModule/student/src/components/CourseSelectS.vue'
import CourseInfoS from '../selectionModule/student/src/components/CourseInfoS.vue'
import CourseResultS from '../selectionModule/student/src/components/CourseResultS.vue'

import SelectionTeacherApp from '../selectionModule/teacher/src/App.vue'
import CourseResultT from '../selectionModule/teacher/src/components/CourseResultT.vue'

import SelectionAdminApp from '../selectionModule/admin/src/App.vue'
import SelectionTime from '../selectionModule/admin/src/components/SelectionTime.vue'
import HelpSelect from '../selectionModule/admin/src/components/HelpSelect.vue'

const TeacherRequest = () => import('../sectionModule/src/pages/TeacherRequest.vue')

const routes = [
  { 
    path: '/', 
    name: 'Home', 
    component: Home,
    meta: {
      allowedRoles: ['admin', 'teacher', 'student'] // 主页允许所有用户类型访问
    }
  },
  // 全局登录路由
  {
    path: '/login',
    name: 'Login', // 新的全局登录路由名称
    component: Login, // 使用 Info Module 中的 Login 组件
    meta: {
      
    }
  },
  {
    path: '/section', 
    name: 'Section', 
    component: Section,
    children: [
    //   { path: '', redirect: 'resource-manage' },
      { path: 'resource-manage', name: 'ResourceManage', component: ResourceManage, meta: { allowedRoles: ['admin'] } },
      { path: 'auto-schedule', name: 'AutoSchedule', component: AutoSchedule, meta: { allowedRoles: ['admin'] } },
      {
        path: 'manual-adjust',
        name: 'ManualAdjust',
        redirect: 'manual-adjust/teacher-request',
        children: [
          {
            path: 'teacher-request',
            name: 'TeacherRequest',
            component: TeacherRequest,
            meta: { allowedRoles: ['teacher'] }
          },
          {
            path: 'teacher-review',
            name: 'TeacherReview',
            component: ManualAdjust,
            meta: { allowedRoles: ['admin'] }
          },
          {
            path: 'admin-adjust',
            name: 'AdminManualAdjust',
            component: AdminManualAdjust,
            meta: { allowedRoles: ['admin'] }
          }
        ]
      },
      { path: 'result-query', name: 'ResultQuery', component: ResultQuery, meta: { allowedRoles: ['admin', 'teacher', 'student'] } },
    ]
  },
  // Info Module routes
  { 
    path: '/info', 
    name: 'Info', 
    component: InfoApp,
    children: [
      //{ path: '', redirect: 'login' },
      { path: 'information-manage', name: 'InformationManage', component: InformationManage },
      { path: 'course-manage', name: 'CourseManage', component: CourseManage },
      { path: 'grade-query', name: 'GradeQuery', component: GradeQuery },
      { path: 'grade-modify', name: 'GradeModify', component: GradeModify },
      { path: 'grade-analyze', name: 'GradeAnalyze', component: GradeAnalyze }
    ]
  },
  // Testing Module routes
  { 
    path: '/testing', 
    name: 'Testing', 
    component: TestingApp,
    children: [
    //   { path: '', redirect: 'login' },
      { path: 'login', name: 'TestingLogin', component: LoginView },
      // Student routes
      { path: 'student/dashboard', name: 'StudentHome', component: StudentDashboard },
      { path: 'student/results', name: 'StudentResultList', component: StudentResults },
      { path: 'student/exam/:examId', name: 'StudentExamDetail', component: StudentExamDetail },
      { path: 'student/exam/:examId/questions', name: 'StudentExamQuestions', component: StudentExamQuestions },
      { path: 'student/past-papers', name: 'StudentPastPapers', component: StudentPastPapers },
      { path: 'student/result/:resultId', name: 'StudentResultDetail', component: StudentResultDetail },
      { path: 'student/past-paper/:paperId', name: 'StudentPastPaperDetail', component: StudentPastPaperDetail },
      // Teacher routes
      { path: 'teacher/dashboard', name: 'TeacherHome', component: TeacherDashboard },
      { path: 'teacher/question-bank', name: 'QuestionBank', component: QuestionBank },
      { path: 'teacher/create-paper', name: 'CreatePaper', component: CreatePaper },
      { path: 'teacher/create-paper/manual', name: 'ManualCreatePaper', component: ManualCreatePaper },
      { path: 'teacher/create-paper/auto', name: 'AutoCreatePaper', component: AutoCreatePaper },
      { path: 'teacher/past-papers', name: 'TeacherPastPapers', component: TeacherPastPapers },
      { path: 'teacher/exam-management', name: 'ExamManagement', component: ExamManagement },
      { path: 'teacher/exam/:examId', name: 'TeacherExamDetail', component: ExamDetail },
      { path: 'teacher/exam/:examId/scores', name: 'StudentsScores', component: StudentsScores },
      { path: 'teacher/result/:resultId', name: 'TeacherResultDetail', component: TeacherResultDetail },
      { path: 'teacher/endedexam-detail', name: 'TeacherEndExam', component: TeacherEndExam },
      { path: 'teacher/past-paper/:paperId', name: 'TeacherPastPaperDetail', component: TeacherPastPaperDetail }
    ]
  },
  // Sharing Module routes
  { 
    path: '/sharing', 
    name: 'Sharing', 
    component: SharingApp,
    children: [
    //   { path: '', redirect: 'course-list' },
      { path: 'course-list', name: 'SharingCourseList', component: CourseList },
      { 
        path: 'course/:sectionId', 
        name: 'SharingCourseDetail', 
        component: CourseDetail,
        children: [
          { path: 'homework', name: 'SharingHomework', component: HomeworkList },
          { path: 'resourceTree', name: 'SharingResourceTree', component: ResourceTree }
        ]
      }
    ]
  },
  // Selection Module - Student routes
  { 
    path: '/selection-student', 
    name: 'SelectionStudent', 
    component: SelectionStudentApp,
    children: [
    //   { path: '', redirect: 'CourseResultS' },
      { path: 'CurriculumPlan', name: 'CurriculumPlan', component: CurriculumPlan },
      { path: 'CourseTableS/:userId', name: 'CourseTableS', component: CourseTableS },
      { path: 'CourseSelectS', name: 'CourseSelectS', component: CourseSelectS },
      { path: 'CourseInfoS', name: 'CourseInfoS', component: CourseInfoS },
      { path: 'CourseResultS/:userId', name: 'CourseResultS', component: CourseResultS }
    ]
  },
  // Selection Module - Teacher routes
  { 
    path: '/selection-teacher', 
    name: 'SelectionTeacher', 
    component: SelectionTeacherApp,
    children: [
    //   { path: '', redirect: ':userId/CourseResultT' },
      { path: ':userId/CourseResultT', name: 'CourseResultT', component: CourseResultT }
    ]
  },
  // Selection Module - Admin routes
  { 
    path: '/selection-admin', 
    name: 'SelectionAdmin', 
    component: SelectionAdminApp,
    children: [
    //   { path: '', redirect: 'SelectionTime' },
      { path: 'SelectionTime', name: 'SelectionTime', component: SelectionTime },
      { path: 'HelpSelect', name: 'HelpSelect', component: HelpSelect }
    ]
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 全局导航守卫
// 参数from加下划线，标注为故意未使用
router.beforeEach(async (to, _from, next) => {
  try {
    const uid = await getCurrentUserId();
    const utype = await getCurrentUserType();

    console.log("U info: ", { uid, utype });

    const isLoggedIn = (uid !== null && utype !== null);

    console.log("IsLoggedIn:" + isLoggedIn);

    // 如果用户未登录，重定向到登录页
    if (!isLoggedIn) {
      return next({ path: '/login', query: { redirect: to.fullPath } });
    }

    // 如果用户已登录且尝试访问登录页，则重定向到主页
    if (to.path === '/login') {
      return next({ path: '/' });
    }

    // 检查用户类型权限
    const allowedRoles = to.matched
      .map(record => record.meta.allowedRoles)
      .filter(roles => roles && Array.isArray(roles))
      .flat();

    // 如果路由没有定义允许的角色，默认允许所有已登录用户访问
    if (allowedRoles.length === 0) {
      return next();
    }    // 将meta中的小写角色转换为大写格式进行比较
    const convertedRoles = allowedRoles.map((role: any) => {
      switch (role.toLowerCase()) {
        case 'admin':
          return 'ROLE_ADMIN';
        case 'teacher':
          return 'ROLE_TEACHER';
        case 'student':
          return 'ROLE_STUDENT';
        default:
          return role; // 如果不匹配，保持原样
      }
    });

    // 检查当前用户类型是否在允许的角色列表中
    if (convertedRoles.includes(utype)) {
      return next();
    } else {
      // 用户类型不匹配，重定向到主页或显示无权限页面
      console.warn(`用户类型 ${utype} 无权访问路由 ${to.path}`);
      window.alert(`您没有权限访问此页面: ${to.path}`);
      return next({ path: _from.path });
    }

  } catch (error) {
    console.error('获取用户信息失败:', error);
    // 如果获取用户信息失败，重定向到登录页
    return next({ path: '/login', query: { redirect: to.fullPath } });
  }
});
