import { createScopedApiService } from "../../admin/generated/createScopedApiService";

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
  "grade_levels",
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
  getConductClassSummary: (classId, hk1SemesterId, hk2SemesterId) =>
    scopedApi.callByKey("get_conduct_summary_class_by_classid", {
      pathParams: { classId },
      params: { hk1SemesterId, hk2SemesterId },
    }),
  getStudentAnnualConduct: (enrollmentId, hk1SemesterId, hk2SemesterId) =>
    scopedApi.callByKey("get_conduct_summary_student_by_enrollmentid", {
      pathParams: { enrollmentId },
      params: { hk1SemesterId, hk2SemesterId },
    }),
  saveStudentConduct: (enrollmentId, semesterId, conductLevel) =>
    scopedApi.callByKey("put_conduct_summary_enrollment_by_enrollmentid_semester_by_semesterid", {
      pathParams: { enrollmentId, semesterId },
      body: { conductLevel },
    }),
  submitConduct: (classId) =>
    scopedApi.callByKey("post_conduct_by_id_submit", {
      pathParams: { id: classId },
    }),
  finalizeConductSemester: (semesterId) =>
    scopedApi.callByKey("post_conduct_finalize_semester", {
      body: { semesterId },
    }),
  getPendingCompensations: (input = {}) =>
    scopedApi.callByKey("get_discipline_pending", input),
  getCompensationDetails: (id, input = {}) =>
    scopedApi.callByKey("get_discipline_by_id", {
      ...input,
      pathParams: { id },
    }),
  markCompensationPaid: (id, input = {}) =>
    scopedApi.callByKey("put_discipline_by_id_paid", {
      ...input,
      pathParams: { id },
    }),
  markCompensationWaived: (id, body, input = {}) =>
    scopedApi.callByKey("put_discipline_by_id_waived", {
      ...input,
      pathParams: { id },
      body,
    }),
  requestCompensation: (body, input = {}) =>
    scopedApi.callByKey("post_discipline_request", {
      ...input,
      body,
    }),
  getCategoryStats: (semesterId, input = {}) =>
    scopedApi.callByKey("get_discipline_reports_summary_by_semesterid", {
      ...input,
      pathParams: { semesterId, ...(input.pathParams || {}) },
    }),
  getGradeLevels: (input = {}) =>
    scopedApi.callByKey("get_grade_levels", input),
};

export default vpDisciplineService;




