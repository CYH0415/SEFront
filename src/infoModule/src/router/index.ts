import { createWebHistory, createRouter } from "vue-router";
import InformationManage from "../components/InformationManage.vue";
import CourseManage from "../components/CourseManage.vue";
import GradeQuery from "../components/GradeQuery.vue";
import GradeModify from "../components/GradeModify.vue";
import GradeAnalyze from "../components/GradeAnalyze.vue";

const routes = [
    { path: '/', redirect: '/info/information-manage' },
    { path: "/info/information-manage", component: InformationManage },
    { path: "/info/course-manage", component: CourseManage },
    { path: "/info/grade-query", component: GradeQuery },
    { path: "/info/grade-modify", component: GradeModify },
    { path: "/info/grade-analyze", component: GradeAnalyze }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router;