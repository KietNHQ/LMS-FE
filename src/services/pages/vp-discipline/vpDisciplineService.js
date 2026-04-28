import { createScopedApiService } from "../admin/generated/createScopedApiService";

const VP_DISCIPLINE_MODULES = [
  "dashboard",
  "discipline",
  "discipline_reports",
  "discipline_excel_export",
  "violation_types",
  "reward_types",
  "conduct_evaluations",
  "conduct_locks",
  "unlock_requests",
  "attendance",
  "classes",
  "students",
  "teachers",
  "debts",
  "notifications",
  "exports",
  "imports",
  "school_years",
  "semesters",
];

const scopedApi = createScopedApiService(VP_DISCIPLINE_MODULES);

export const vpDisciplineService = {
  role: "vp-discipline",
  ...scopedApi,
};

export default vpDisciplineService;

