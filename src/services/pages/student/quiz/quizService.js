import { studentService } from "../studentService";

export const quizService = {
  listQuizzes: studentService.listQuizzes,
  getQuizById: studentService.getQuizById,
  startQuiz: studentService.startQuiz,
  getQuizStatus: studentService.getQuizStatus,
  getQuizAttemptById: studentService.getQuizAttemptById,
  saveQuizAttempt: studentService.saveQuizAttempt,
  submitQuiz: studentService.submitQuiz,
  syncQuizAttempt: studentService.syncQuizAttempt,
  heartbeatQuizAttempt: studentService.heartbeatQuizAttempt,
  validateQuizAttempt: studentService.validateQuizAttempt,
  moduleServices: studentService.moduleServices,
  listByModule: studentService.listByModule,
  callByKey: studentService.callByKey,
};

