import { adminApiService } from "../generated";

const toFormData = (file, options = {}) => {
  const formData = new FormData();
  if (file !== undefined && file !== null) {
    formData.append("file", file);
  }

  if (options && typeof options === "object" && Object.keys(options).length > 0) {
    formData.append("options", JSON.stringify(options));
  }

  return formData;
};

const callImport = (key, file, options = {}, input = {}) => {
  const config = {
    headers: { "Content-Type": "multipart/form-data" },
    ...(input.config || {}),
  };

  return adminApiService.callByKey(key, {
    ...input,
    body: toFormData(file, options),
    config,
  });
};

const callExport = (key, input = {}) => {
  const config = {
    responseType: "blob",
    ...(input.config || {}),
  };

  return adminApiService.callByKey(key, {
    ...input,
    config,
  });
};

export const importExportService = {
  endpoints: adminApiService.endpoints,
  modules: adminApiService.modules,
  moduleServices: adminApiService.moduleServices,
  callByKey: adminApiService.callByKey,
  listByModule: adminApiService.listByModule,
  listImportLogs: (input) => adminApiService.callByKey("get_imports_logs", input),
  importStudents: (file, options = {}, input = {}) => callImport("post_imports_students", file, options, input),
  importGrades: (file, options = {}, input = {}) => callImport("post_imports_grades", file, options, input),
  importAttendance: (file, options = {}, input = {}) => callImport("post_imports_attendance", file, options, input),
  importTeachers: (file, options = {}, input = {}) => callImport("post_imports_teachers", file, options, input),
  exportGrades: (classId, input = {}) => callExport("get_exports_grades_by_classid", {
    ...input,
    pathParams: { classId, ...(input.pathParams || {}) },
  }),
  exportAcademicRecordPdf: (studentId, input = {}) => callExport("get_exports_academic_record_pdf_by_studentid", {
    ...input,
    pathParams: { studentId, ...(input.pathParams || {}) },
  }),
  exportAttendance: (classId, input = {}) => callExport("get_exports_attendance_by_classid", {
    ...input,
    pathParams: { classId, ...(input.pathParams || {}) },
  }),
  exportClassDiscipline: (classId, input = {}) => callExport("get_exports_class_discipline_by_classid", {
    ...input,
    pathParams: { classId, ...(input.pathParams || {}) },
  }),
  exportFinancialReport: (input = {}) => callExport("get_exports_financial_report", input),
  exportStudentList: (classId, input = {}) => callExport("get_exports_student_list_by_classid", {
    ...input,
    pathParams: { classId, ...(input.pathParams || {}) },
  }),
};

export default importExportService;


