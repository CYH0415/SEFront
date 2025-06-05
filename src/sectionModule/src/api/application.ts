import request from '../utils/request'

/**
 * 提交教师申请
 * @param data 申请数据
 */
export function submitTeacherApplication(data: {
  secId: number
  teacherId: number
  reason: string
}) {
  return request.post('/application/add', data)
}

/**
 * 获取教师所有历史申请
 * @param teacherId 教师ID
 */
export function getTeacherApplications(teacherId: number) {
  return request.get(`/application/teacher/${teacherId}/all`)
}