import { teacherService } from "../teacherService";

// Service cho trang bai giang giao vien.
// TODO: Bo sung API khi backend san sang.
export const lessonService = {
  listLessons: teacherService.listLessons,
  getLessonById: teacherService.getLessonById,
  createLesson: teacherService.createLesson,
  updateLesson: teacherService.updateLesson,
  deleteLesson: teacherService.deleteLesson,
  publishLesson: teacherService.publishLesson,
  endpoints: teacherService.modules.lessons,
  call: teacherService.call,
};

export default lessonService;

