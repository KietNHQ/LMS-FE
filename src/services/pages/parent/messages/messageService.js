import { parentService } from "../parentService";

// Service for parent messages page.
// TODO: Add API calls when backend endpoints are ready.
export const messageService = {
  listMessages: parentService.listMessages,
  sendMessage: parentService.sendMessage,
  moduleServices: parentService.moduleServices,
  listByModule: parentService.listByModule,
  callByKey: parentService.callByKey,
};

export default messageService;
