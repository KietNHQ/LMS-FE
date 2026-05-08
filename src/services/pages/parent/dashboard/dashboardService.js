import { parentService } from "../parentService";

// Service for parent dashboard page.
// TODO: Add API calls when backend endpoints are ready.
export const dashboardService = {
  getDashboard: parentService.getDashboard,
  getChildren: parentService.listChildren,
  getSchedule: parentService.getChildSchedule,
  moduleServices: parentService.moduleServices,
  listByModule: parentService.listByModule,
  callByKey: parentService.callByKey,
};

export default dashboardService;

