import { studentService } from "../studentService";

export const gradeService = {
  getStudentById: studentService.getStudentById,
  getStudentGrades: studentService.getStudentGrades,
  getStudentGradeSummary: studentService.getStudentGradeSummary,
  getStudentAttendance: studentService.getStudentAttendance,
  moduleServices: studentService.moduleServices,
  listByModule: studentService.listByModule,
  callByKey: studentService.callByKey,
};

