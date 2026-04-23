import { studentService } from "../studentService";

export const dashboardService = {
  getDashboard: studentService.getDashboard,
  getStudentById: studentService.getStudentById,
  listNotifications: studentService.listNotifications,
  listQuizzes: studentService.listQuizzes,
  moduleServices: studentService.moduleServices,
  listByModule: studentService.listByModule,
  callByKey: studentService.callByKey,
};
