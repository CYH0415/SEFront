import { createRouter, createWebHistory } from 'vue-router'

import AutoSchedule from '../pages/AutoSchedule.vue'
import ManualAdjust from '../pages/ManualAdjust.vue'
import AdminManualAdjust from '../pages/AdminManualAdjust.vue' 
import ResourceManage from '../pages/ResourceManage.vue'
import ResultQuery from '../pages/ResultQuery.vue'

const TeacherRequest = () => import('../pages/TeacherRequest.vue')

const routes = [
  { path: '/', redirect: '/resource-manage' },
  { path: '/auto-schedule', name: 'AutoSchedule', component: AutoSchedule },
  {
    path: '/manual-adjust',
    name: 'ManualAdjust',
    redirect: '/manual-adjust/teacher-request',
    children: [
      {
        path: 'teacher-request',
        name: 'TeacherRequest',
        component: TeacherRequest,
      },
      {
        path: 'teacher-review',
        name: 'TeacherReview',
        component: ManualAdjust,
      },
      {
        path: 'admin-adjust',
        name: 'AdminManualAdjust',
        component: AdminManualAdjust,
      }
    ]
  },
  { path: '/resource-manage', name: 'ResourceManage', component: ResourceManage },
  { path: '/result-query', name: 'ResultQuery', component: ResultQuery },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})