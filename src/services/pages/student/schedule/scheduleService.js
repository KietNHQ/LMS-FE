import { studentService } from "../studentService";

export const scheduleService = {
  getStudentSchedule: studentService.getStudentSchedule,
  getClassSchedule: studentService.getClassSchedule,
  moduleServices: studentService.moduleServices,
  listByModule: studentService.listByModule,
  callByKey: studentService.callByKey,
};
