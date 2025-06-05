import request from '../utils/request'

export const fetchAdminSections = (params: any) => {
  return request.get('/schedule/admin/query', { params })
}

export const modifySection = (data: any) => {
  return request.post('/schedule/modify', data)
}