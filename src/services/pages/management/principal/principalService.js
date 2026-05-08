import { createScopedApiService } from "../../admin/generated/createScopedApiService";
import { adminDashboardService } from "../../admin/dashboard/dashboardService";

const PRINCIPAL_MODULES = [
  "dashboard",
  "audit_logs",
  "notifications",
  "grades",
  "grade_locks",
  "unlock_requests",
  "academic_records",
  "assessment_workflows",
  "attendance",
  "conduct_evaluations",
  "conduct_locks",
  "discipline",
  "discipline_reports",
  "discipline_excel_export",
  "fees",
  "debts",
  "exports",
  "system_backups",
  "system_config",
];

const scopedApi = createScopedApiService(PRINCIPAL_MODULES);

export const principalService = {
  role: "principal",
  ...scopedApi,
  getDashboardSummary: () => adminDashboardService.getDashboardSummary(),
  getDashboardOverview: () => adminDashboardService.getDashboardOverview(),
};

export default principalService;




