import { studentService } from "../studentService";

export const gradeService = {
  getStudentById: studentService.getStudentById,
  getStudentGrades: studentService.getStudentGrades,
  getStudentAttendance: studentService.getStudentAttendance,
  moduleServices: studentService.moduleServices,
  listByModule: studentService.listByModule,
  callByKey: studentService.callByKey,
};

