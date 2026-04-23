import { parentService } from "../parentService";

// Service for parent notifications page.
// TODO: Add API calls when backend endpoints are ready.
export const notificationService = {
  listNotifications: parentService.listNotifications,
  markAllNotificationsRead: parentService.markAllNotificationsRead,
  markNotificationRead: parentService.markNotificationRead,
  toggleNotificationImportant: parentService.toggleNotificationImportant,
  moduleServices: parentService.moduleServices,
  listByModule: parentService.listByModule,
  callByKey: parentService.callByKey,
};

export default notificationService;
