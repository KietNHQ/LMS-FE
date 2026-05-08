import { parentService } from "../parentService";

// Service for parent children overview page.
// TODO: Add API calls when backend endpoints are ready.
export const childrenOverviewService = {
  listChildren: parentService.listChildren,
  getChildById: parentService.getChildById,
  getChildGrades: parentService.getChildGrades,
  getChildAttendance: parentService.getChildAttendance,
  getChildSchedule: parentService.getChildSchedule,
  moduleServices: parentService.moduleServices,
  listByModule: parentService.listByModule,
  callByKey: parentService.callByKey,
};

export default childrenOverviewService;

