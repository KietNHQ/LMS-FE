import axiosClient from "../../shared/http/axiosClient";

const getPayload = (response) => {
  const unwrapped = response?.data ?? response ?? {};
  // Unwrap service-layer { success, data } envelope
  return unwrapped?.data ?? unwrapped;
};

export const teacherGradeService = {
  getMyAssignments: async (params = {}) => {
    const response = await axiosClient.get("/teachers/me/assignments", { params });
    return getPayload(response);
  },

  getClassStudents: async (classId, semesterId) => {
    const params = semesterId ? { semesterId } : {};
    const response = await axiosClient.get(`/classes/${classId}/students`, { params });
    return getPayload(response);
  },

  getGradeItems: async ({ classTeacherSubjectId, semesterId } = {}) => {
    const params = {
      ...(classTeacherSubjectId ? { classTeacherSubjectId } : {}),
      ...(semesterId ? { semesterId } : {}),
    };
    const response = await axiosClient.get("/grades/items", { params });
    return getPayload(response);
  },

  getGrades: async ({ classTeacherSubjectId, semesterId } = {}) => {
    const params = {
      ...(classTeacherSubjectId ? { classTeacherSubjectId } : {}),
      ...(semesterId ? { semesterId } : {}),
    };
    const response = await axiosClient.get("/grades", { params });
    return getPayload(response);
  },

  getStudentSubjectGrades: async ({ classTeacherSubjectId, semesterId } = {}) => {
    const params = {
      ...(classTeacherSubjectId ? { classTeacherSubjectId } : {}),
      ...(semesterId ? { semesterId } : {}),
    };
    const response = await axiosClient.get("/grades", { params });
    return getPayload(response);
  },

  getHomeroomClassGrades: async ({ classId, subjectId, semesterId } = {}) => {
    const params = { semesterId };
    const response = await axiosClient.get(`/grades/class/${classId}/subject/${subjectId}`, { params });
    return getPayload(response);
  },

  getStudentGradeSummary: async ({ studentId, schoolYear } = {}) => {
    const params = { schoolYear };
    const response = await axiosClient.get(`/students/${studentId}/grade-summary`, { params });
    return getPayload(response);
  },

  upsertGrades: async (body) => {
    const response = await axiosClient.post("/grades/teacher-upsert", body);
    return getPayload(response);
  },

  submitGrade: async (gradeId, notes) => {
    const response = await axiosClient.post(`/grades/submit/${gradeId}`, { notes });
    return getPayload(response);
  },

  submitClassGrades: async ({ classTeacherSubjectId, semesterId, notes } = {}) => {
    const response = await axiosClient.post(`/grades/submit/${classTeacherSubjectId}`, {
      semesterId,
      notes,
    });
    return getPayload(response);
  },

  retractGrade: async (gradeId, notes) => {
    const response = await axiosClient.post(`/grades/retract/${gradeId}`, { notes });
    return getPayload(response);
  },

  createUnlockRequest: async (body) => {
    const response = await axiosClient.post("/unlock-requests", body);
    return getPayload(response);
  },

  getReportCard: async (enrollmentId, { semesterId, schoolYearId } = {}) => {
    const params = {};
    if (semesterId) params.semesterId = semesterId;
    if (schoolYearId) params.schoolYearId = schoolYearId;
    const response = await axiosClient.get(`/grades/report-card/${enrollmentId}`, { params });
    return getPayload(response);
  },
};

export default teacherGradeService;
