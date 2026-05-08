import { createScopedApiService } from "../../admin/generated/createScopedApiService";

const VP_ACADEMIC_MODULES = [
  "dashboard",
  "grades",
  "grade_items",
  "grade_levels",
  "grade_locks",
  "unlock_requests",
  "academic_records",
  "assessment_workflows",
  "class_teacher_subjects",
  "classes",
  "students",
  "teachers",
  "subject_combinations",
  "timetable",
  "imports",
  "exports",
  "notifications",
  "school_years",
  "semesters",
  "quizzes",
  "lessons",
];

const scopedApi = createScopedApiService(VP_ACADEMIC_MODULES);

export const vpAcademicService = {
  role: "vp-academic",
  ...scopedApi,
  getAssessmentWorkflowStats: (semesterId, input = {}) => scopedApi.callByKey("get_assessment_workflows_stats_by_semesterid", {
    ...input,
    pathParams: { semesterId, ...(input.pathParams || {}) },
  }),
  getAssessmentWorkflows: (input) => scopedApi.callByKey("get_assessment_workflows", input),
  getGradesClassifySemester: (input) => scopedApi.callByKey("get_grades_classify_semester", input),
  getGradesClassifyYear: (input) => scopedApi.callByKey("get_grades_classify_year", input),
  getGradesClassifyHonors: (input) => scopedApi.callByKey("get_grades_classify_honors", input),
  getGradesCalculateSemester: (input) => scopedApi.callByKey("get_grades_calculate_semester", input),
  getGradesCalculateYear: (input) => scopedApi.callByKey("get_grades_calculate_year", input),
};

export default vpAcademicService;




