import axiosClient from "../../../shared/http/axiosClient";

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

const LOOKUP_CACHE_TTL = 5 * 60 * 1000;

const lookupCache = {
  gradeLevels: { ts: 0, rows: [] },
  schoolYears: { ts: 0, rows: [] },
  teachers: { ts: 0, rows: [] },
};

const normalizeText = (value) => `${value || ""}`.trim().toLowerCase();

const getCachedRows = async (cacheKey, loader) => {
  const cached = lookupCache[cacheKey];
  const now = Date.now();
  if (cached.rows.length > 0 && now - cached.ts < LOOKUP_CACHE_TTL) {
    return cached.rows;
  }

  const rows = await loader();
  lookupCache[cacheKey] = { ts: now, rows };
  return rows;
};

const loadGradeLevels = async () => {
  try {
    const payload = await axiosClient.get("/grade-levels");
    return getRows(payload);
  } catch {
    return [];
  }
};

const loadSchoolYears = async () => {
  try {
    const payload = await axiosClient.get("/school-years");
    return getRows(payload);
  } catch {
    return [];
  }
};

const loadTeachers = async () => {
  try {
    const payload = await axiosClient.get("/teachers", { params: { page: 1, limit: 500 } });
    return getRows(payload);
  } catch {
    return [];
  }
};

const getGradeLevelNumber = (item = {}) => {
  const level = item.levelNumber ?? item.level_number ?? item.gradeLevelNumber;
  if (level !== undefined && level !== null) {
    return `${level}`;
  }
  return extractGradeNumber(item.name || item.grade || item.label || "");
};

const getSchoolYearName = (item = {}) =>
  item.name || item.school_year_name || item.schoolYearName || item.label || "";

const getTeacherFullName = (item = {}) => {
  const combined = `${item.surname || item.lastName || ""} ${item.given_name || item.givenName || item.firstName || ""}`.trim();
  return item.fullName || item.full_name || item.name || combined;
};

const resolveGradeLevelId = async (gradeNumber) => {
  const rows = await getCachedRows("gradeLevels", loadGradeLevels);
  const target = `${gradeNumber || ""}`;
  const matched = rows.find((row) => getGradeLevelNumber(row) === target);
  return matched?.id;
};

const resolveSchoolYearId = async (schoolYearName) => {
  const rows = await getCachedRows("schoolYears", loadSchoolYears);
  const target = normalizeText(schoolYearName);
  const matched = rows.find((row) => normalizeText(getSchoolYearName(row)) === target);
  return matched?.id;
};

const resolveTeacherId = async (teacherName) => {
  const normalized = normalizeText(teacherName);
  if (!normalized || normalized === normalizeText("Chưa phân công")) {
    return undefined;
  }

  const rows = await getCachedRows("teachers", loadTeachers);
  const matched = rows.find((row) => normalizeText(getTeacherFullName(row)) === normalized);
  return matched?.id;
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
  listClasses: async () => {
    const response = await axiosClient.get("/classes", { params: { page: 1, limit: 500 } });
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




