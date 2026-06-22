import axiosClient from "../../../shared/http/axiosClient";
import {
  resolveGradeLevelId,
  resolveSchoolYearId,
  getGradeLevelFilterOptions,
} from "../../../shared/schoolYearLookup";
import { teachersService } from "../users/teachersService";

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.classes)) return payload.classes;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const normalizeText = (value) => `${value || ""}`.trim().toLowerCase();

const resolveTeacherId = async (teacherName) => {
  const normalized = normalizeText(teacherName);
  if (!normalized || normalized === normalizeText("Chưa phân công")) {
    return undefined;
  }

  const rows = await teachersService.listTeachers();
  const matched = rows.find((row) => normalizeText(row.name) === normalized);
  return matched?.teacherId;
};

const extractGradeNumber = (value) => {
  const matched = `${value || ""}`.match(/\d+/);
  return matched ? matched[0] : "10";
};

const getColorByGrade = (gradeNumber) => {
  if (gradeNumber === "10") return "blue";
  if (gradeNumber === "11") return "teal";
  return "purple";
};

const parseClass = (item = {}) => {
  const name = item.class_name || item.className || item.name || "";
  const gradeNumber = String(
    item.grade_level_number || item.gradeLevelNumber || extractGradeNumber(item.grade_level_name || name)
  );

  const homeroomSurname = item.homeroom_surname || item.homeroomSurname || "";
  const homeroomGivenName = item.homeroom_given_name || item.homeroomGivenName || "";
  const teacher = `${homeroomSurname} ${homeroomGivenName}`.trim() || item.teacher || "Chưa phân công";

  const subjectsRaw = item.subjects || [];
  const subjects = Array.isArray(subjectsRaw)
    ? subjectsRaw.map((subject) => {
        if (typeof subject === "string") return subject;
        return subject?.name || subject?.subject_name || subject?.subjectName || "";
      }).filter(Boolean)
    : [];

  return {
    id: item.id,
    name,
    grade: `Khối ${gradeNumber}`,
    year: item.school_year_name || item.schoolYearName || item.year || "",
    teacher,
    students: toNumber(item.current_student_count ?? item.students ?? item.currentStudentCount),
    paidStudents: toNumber(item.paid_student_count ?? item.paidStudents),
    subjects,
    color: getColorByGrade(gradeNumber),
    status: item.status || "active",
    maxStudents: toNumber(item.max_students ?? item.maxStudents),
  };
};

const toApiPayload = async (classData = {}) => {
  const gradeNumber = extractGradeNumber(classData.grade);
  const [gradeLevelId, schoolYearId, homeroomTeacherId] = await Promise.all([
    resolveGradeLevelId(gradeNumber),
    resolveSchoolYearId(classData.year),
    resolveTeacherId(classData.teacher),
  ]);

  return {
    className: classData.name,
    ...(gradeLevelId ? { gradeLevelId: toNumber(gradeLevelId) } : {}),
    ...(schoolYearId ? { schoolYearId: toNumber(schoolYearId) } : {}),
    ...(homeroomTeacherId ? { homeroomTeacherId: toNumber(homeroomTeacherId) } : {}),
    ...(classData.maxStudents ? { maxStudents: toNumber(classData.maxStudents) } : {}),
    status: classData.status || "active",

    // Backward-compatible aliases for deployments still using legacy field names.
    class_name: classData.name,
    grade_level_number: toNumber(gradeNumber, 10),
    gradeLevelNumber: toNumber(gradeNumber, 10),
    school_year_name: classData.year,
    schoolYearName: classData.year,
    homeroom_teacher_name: classData.teacher,
    teacher: classData.teacher,
  };
};

export const classesService = {
  getGradeLevelFilterOptions,

  listClasses: async ({ schoolYearId, schoolYearName, gradeLevelId, search } = {}) => {
    let resolvedSchoolYearId = schoolYearId;
    if (!resolvedSchoolYearId && schoolYearName) {
      resolvedSchoolYearId = await resolveSchoolYearId(schoolYearName);
    }
    // If schoolYearId is a string name (e.g. "2025-2026"), resolve it to numeric ID
    if (resolvedSchoolYearId && typeof resolvedSchoolYearId === "string" && isNaN(Number(resolvedSchoolYearId))) {
      resolvedSchoolYearId = await resolveSchoolYearId(resolvedSchoolYearId);
    }

    if (typeof resolvedSchoolYearId === "number" && isNaN(resolvedSchoolYearId)) {
      resolvedSchoolYearId = undefined;
    }

    const params = {
      page: 1,
      limit: 500,
      ...(resolvedSchoolYearId ? { schoolYearId: toNumber(resolvedSchoolYearId) } : {}),
      ...(gradeLevelId ? { gradeLevelId: toNumber(gradeLevelId) } : {}),
      ...(search ? { search } : {}),
    };

    const response = await axiosClient.get("/classes", { params });
    return getRows(response).map(parseClass);
  },

  createClass: async (classData) => {
    const payload = await toApiPayload(classData);
    return axiosClient.post("/classes", payload);
  },

  updateClass: async (id, classData) => {
    const payload = await toApiPayload(classData);
    return axiosClient.put(`/classes/${id}`, payload);
  },

  deleteClass: async (id) => {
    return axiosClient.delete(`/classes/${id}`);
  },
};
