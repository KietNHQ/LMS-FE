import { createScopedApiService } from "../../admin/generated/createScopedApiService";

const ACADEMIC_STAFF_MODULES = [
  "dashboard",
  "classes",
  "students",
  "teachers",
  "academic_records",
  "grades",
  "grade_items",
  "assessment_workflows",
  "class_teacher_subjects",
  "subject_combinations",
  "school_years",
  "semesters",
  "timetable",
  "imports",
  "exports",
  "notifications",
];

const scopedApi = createScopedApiService(ACADEMIC_STAFF_MODULES);

export const academicStaffService = {
  role: "academic-staff",
  ...scopedApi,
};

export default academicStaffService;




