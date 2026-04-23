import { createScopedApiService } from "../admin/generated/createScopedApiService";

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
};

export default vpAcademicService;

