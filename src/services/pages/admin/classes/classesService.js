import axiosClient from "../../../shared/http/axiosClient";

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
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

const toApiPayload = (classData = {}) => {
  const gradeNumber = extractGradeNumber(classData.grade);

  return {
    class_name: classData.name,
    className: classData.name,
    grade_level_number: toNumber(gradeNumber, 10),
    gradeLevelNumber: toNumber(gradeNumber, 10),
    school_year_name: classData.year,
    schoolYearName: classData.year,
    homeroom_teacher_name: classData.teacher,
    teacher: classData.teacher,
    status: classData.status || "active",
  };
};

export const classesService = {
  listClasses: async () => {
    const response = await axiosClient.get("/classes", { params: { page: 1, limit: 500 } });
    return getRows(response).map(parseClass);
  },

  createClass: async (classData) => {
    return axiosClient.post("/classes", toApiPayload(classData));
  },

  updateClass: async (id, classData) => {
    return axiosClient.put(`/classes/${id}`, toApiPayload(classData));
  },

  deleteClass: async (id) => {
    return axiosClient.delete(`/classes/${id}`);
  },
};

