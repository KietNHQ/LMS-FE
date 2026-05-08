import { studentService } from "../studentService";

export const classesService = {
  listClasses: studentService.listClasses,
  getClassById: studentService.getClassById,
  getClassSchedule: studentService.getClassSchedule,
  moduleServices: studentService.moduleServices,
  listByModule: studentService.listByModule,
  callByKey: studentService.callByKey,
};

