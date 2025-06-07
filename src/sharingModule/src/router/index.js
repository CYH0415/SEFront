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
    name: 'SharingCourseList',
    component: CourseList
  },
  {
    path: '/course/:sectionId',
    name: 'SharingCourseDetail',
    component: CourseDetail,
    children: [
      {
        path: 'homework',
        name: 'SharingHomework',
        component: HomeworkList,
      },
      {
        path: 'resourceTree',
        name: 'SharingResourceTree',
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
