import { parentService } from "../parentService";

// Service for parent support page.
// TODO: Add API calls when backend endpoints are ready.
export const supportService = {
  listFaqs: parentService.listFaqs,
  listSupportTickets: parentService.listSupportTickets,
  submitSupportTicket: parentService.submitSupportTicket,
  moduleServices: parentService.moduleServices,
  listByModule: parentService.listByModule,
  callByKey: parentService.callByKey,
};

export default supportService;

