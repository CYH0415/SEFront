import request from '../utils/request';

export interface SectionDetail {
  secId: number;
  courseId: string;
  semester: string;
  year: number;
  classroomId: number;
  timeSlotIds: number[];
  teacherId: number;
  courseTitle: string;
  teacherName: string;
  classroomCampus: string;
  classroomBuilding: string;
  roomNumber: string;
  classroomLocation: string;
}

export function getSectionDetail(secId: number) {
  return request<{ code: number; data: SectionDetail; message: string }>({
    url: `/search/section/${secId}`, // 假设您的 request 工具会自动处理 API 基路径
    method: 'get',
  });
}
