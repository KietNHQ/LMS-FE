import { studentService } from "../studentService";

export const supportService = {
  listFaqs: studentService.listFaqs,
  submitSupportTicket: studentService.submitSupportTicket,
  moduleServices: studentService.moduleServices,
  listByModule: studentService.listByModule,
  callByKey: studentService.callByKey,
};

