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
  getReportSummary: (semesterId, input = {}) => scopedApi.callByKey("get_discipline_reports_summary_by_semesterid", {
    ...input,
    pathParams: { semesterId, ...(input.pathParams || {}) },
  }),
  getViolationsByType: (input) => scopedApi.callByKey("get_discipline_reports_violations_by_type", input),
  getTopViolatingStudents: (input) => scopedApi.callByKey("get_discipline_reports_violations_top_students", input),
  getViolationsTrend: (input) => scopedApi.callByKey("get_discipline_reports_violations_trend", input),
  getRewardsByType: (input) => scopedApi.callByKey("get_discipline_reports_rewards_by_type", input),
  getClassRankings: (input) => scopedApi.callByKey("get_discipline_reports_rankings", input),
  exportStudentsBySemester: (semesterId, input = {}) => scopedApi.callByKey("get_discipline_reports_export_students_by_semesterid", {
    ...input,
    pathParams: { semesterId, ...(input.pathParams || {}) },
  }),
};

export default vpDisciplineService;

