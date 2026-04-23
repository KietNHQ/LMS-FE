import { studentService } from "../studentService";

export const quizService = {
  listQuizzes: studentService.listQuizzes,
  getQuizById: studentService.getQuizById,
  startQuiz: studentService.startQuiz,
  submitQuiz: studentService.submitQuiz,
  moduleServices: studentService.moduleServices,
  listByModule: studentService.listByModule,
  callByKey: studentService.callByKey,
};
