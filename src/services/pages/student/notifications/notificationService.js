import { studentService } from "../studentService";

export const notificationService = {
  listNotifications: studentService.listNotifications,
  markAllNotificationsRead: studentService.markAllNotificationsRead,
  markNotificationRead: studentService.markNotificationRead,
  moduleServices: studentService.moduleServices,
  listByModule: studentService.listByModule,
  callByKey: studentService.callByKey,
};
