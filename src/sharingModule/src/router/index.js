import HomeworkList from '@/views/HomeworkList.vue'
import ResourceTree from '@/views/ResourceTree.vue'
import CourseDetail from '@/views/CourseDetail.vue'
import CourseList from '@/views/CourseList.vue'
import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
  },
  {
    path: '/course-list',
    name: 'course-list',
    component: CourseList
  },
  {
    path: '/course/:sectionId',
    name: 'CourseDetail',
    component: CourseDetail,
    children: [
      {
        path: 'homework',
        name: 'Homework',
        component: HomeworkList,
      },
      {
        path: 'resourceTree',
        name: 'ResourceTree',
        component: ResourceTree,
      },
    ]
  }  
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
