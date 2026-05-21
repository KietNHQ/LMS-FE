import axiosClient from "../../../shared/http/axiosClient";

const getRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const parseAssignment = (item = {}) => {
  const teacher = item.teachers || item.teacher || {};
  const teacherName =
    `${teacher.surname || teacher.lastName || ""} ${teacher.given_name || teacher.givenName || teacher.firstName || ""}`.trim() ||
    teacher.fullName ||
    teacher.full_name ||
    teacher.name ||
    "Chưa phân công";

  const subjectAssign = item.subject_assignments || item.subjectAssignments || {};
  const subjectName =
    subjectAssign.display_name ||
    subjectAssign.displayName ||
    subjectAssign.subject_name ||
    subjectAssign.name ||
    item.subject ||
    "—";

  const classItem = item.classes || item.class || {};
  const className =
    classItem.class_name ||
    classItem.className ||
    classItem.name ||
    item.class_name ||
    "—";

  return {
    id: item.id,
    teacherId: item.teacher_id ?? item.teacherId,
    teacherName,
    subjectName,
    className,
    classId: item.class_id ?? item.classId,
    subjectId: item.subject_assignment_id ?? item.subjectAssignmentId ?? item.subject_id,
  };
};

export const teachingAssignmentService = {
  /** Lấy toàn bộ phân công (có thể lọc theo lớp hoặc GV) */
  listAssignments: async (params = {}) => {
    try {
      const response = await axiosClient.get("/class-teacher-subjects", { params });
      return getRows(response).map(parseAssignment);
    } catch {
      return [];
    }
  },

  /** Lấy phân công theo lớp */
  listByClass: async (classId) => {
    try {
      const response = await axiosClient.get(`/class-teacher-subjects/class/${classId}`);
      return getRows(response).map(parseAssignment);
    } catch {
      return [];
    }
  },

  /** Lấy phân công theo giáo viên */
  listByTeacher: async (teacherId) => {
    try {
      const response = await axiosClient.get(`/class-teacher-subjects/teacher/${teacherId}`);
      return getRows(response).map(parseAssignment);
    } catch {
      return [];
    }
  },

  /** Tạo phân công mới */
  createAssignment: async (data) => {
    return axiosClient.post("/class-teacher-subjects", data);
  },

  /** Xóa phân công */
  deleteAssignment: async (id) => {
    return axiosClient.delete(`/class-teacher-subjects/${id}`);
  },
};

export default teachingAssignmentService;
