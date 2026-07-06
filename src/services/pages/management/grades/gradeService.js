import axiosClient from "../../../shared/http/axiosClient";

const getPayload = (response) => response?.data ?? response ?? {};

export const gradeService = {
  // Lấy danh sách cột điểm
  getGradeItems: async ({ classTeacherSubjectId, semesterId, gradeCategoryId } = {}) => {
    const params = {
      ...(classTeacherSubjectId ? { classTeacherSubjectId } : {}),
      ...(semesterId ? { semesterId } : {}),
      ...(gradeCategoryId ? { gradeCategoryId } : {}),
    };
    const response = await axiosClient.get(`/grades/items`, { params });
    return getPayload(response);
  },

  // Tính điểm trung bình môn học kỳ (ĐTBmhk)
  calculateSemesterAverage: async ({ enrollmentId, subjectAssignmentId, semesterId }) => {
    const params = { enrollmentId, subjectAssignmentId, semesterId };
    const response = await axiosClient.get(`/grades/calculate/semester`, { params });
    return getPayload(response);
  },

  // Tính điểm trung bình môn cả năm (ĐTBmcn)
  calculateYearAverage: async ({ enrollmentId, subjectAssignmentId, schoolYearId }) => {
    const params = { enrollmentId, subjectAssignmentId, schoolYearId };
    const response = await axiosClient.get(`/grades/calculate/year`, { params });
    return getPayload(response);
  },

  // Tính điểm trung bình tất cả các môn trong học kỳ (Semester GPA)
  calculateSemesterGPA: async ({ enrollmentId, semesterId, schoolYearId } = {}) => {
    const params = { enrollmentId, semesterId };
    if (schoolYearId) params.schoolYearId = schoolYearId;
    const response = await axiosClient.get(`/grades/calculate/semester-gpa`, { params });
    return getPayload(response);
  },

  // Xếp loại học lực học kỳ (Tốt/Khá/Đạt/Chưa đạt)
  classifySemester: async ({ enrollmentId, semesterId }) => {
    const params = { enrollmentId, semesterId };
    const response = await axiosClient.get(`/grades/classify/semester`, { params });
    return getPayload(response);
  },

  // Xếp loại học lực cả năm
  classifyYear: async ({ enrollmentId, schoolYearId }) => {
    const params = { enrollmentId, schoolYearId };
    const response = await axiosClient.get(`/grades/classify/year`, { params });
    return getPayload(response);
  },

  // Kiểm tra danh hiệu Học sinh Giỏi / Xuất sắc
  checkHonors: async ({ enrollmentId, schoolYearId }) => {
    const params = { enrollmentId, schoolYearId };
    const response = await axiosClient.get(`/grades/classify/honors`, { params });
    return getPayload(response);
  },

  // Lấy học bạ đầy đủ (report card) của học sinh
  getReportCard: async (enrollmentId, { semesterId, schoolYearId } = {}) => {
    const params = {
      ...(semesterId ? { semesterId } : {}),
      ...(schoolYearId ? { schoolYearId } : {}),
    };
    const response = await axiosClient.get(`/grades/report-card/${enrollmentId}`, { params });
    return getPayload(response);
  },

  // Lấy điểm của cả lớp
  getClassGrades: async (classId, { semesterId, gradeItemId } = {}) => {
    const params = {
      ...(semesterId ? { semesterId } : {}),
      ...(gradeItemId ? { gradeItemId } : {}),
    };
    const response = await axiosClient.get(`/grades/class/${classId}`, { params });
    return getPayload(response);
  },

  // Lấy điểm của cá nhân học sinh
  getStudentGrades: async (studentId, { semesterId, classId } = {}) => {
    const params = {
      ...(semesterId ? { semesterId } : {}),
      ...(classId ? { classId } : {}),
    };
    const response = await axiosClient.get(`/grades/student/${studentId}`, { params });
    return getPayload(response);
  },

  // Tổng quan học tập toàn trường (Principal Dashboard)
  getOverviewSummary: async ({ semesterId, schoolYearId } = {}) => {
    const params = {
      ...(semesterId ? { semesterId } : {}),
      ...(schoolYearId ? { schoolYearId } : {}),
    };
    const response = await axiosClient.get(`/grades/overview-summary`, { params });
    return getPayload(response);
  },

  // Lấy trạng thái khóa điểm theo lớp và học kỳ
  getLockStatus: async ({ classId, semesterId } = {}) => {
    const params = {
      ...(classId ? { classId } : {}),
      ...(semesterId ? { semesterId } : {}),
    };
    const response = await axiosClient.get(`/grades/lock-status`, { params });
    return response;
  },

  // Rút lại điểm đã chốt (mở khóa) — gọi từng grade một
  retractGrade: async (gradeId, { notes } = {}) => {
    const response = await axiosClient.post(`/grades/retract/${gradeId}`, { notes });
    return response;
  },

  // Chốt tất cả điểm lớp (VP/Principal gọi)
  finalizeClass: async (classId, { semesterId, notes } = {}) => {
    const response = await axiosClient.post("/grades/finalize-class", {
      classId,
      semesterId,
      notes,
    });
    return response;
  },

  // Mở khóa tất cả điểm lớp (VP/Principal gọi) — FINALIZED → DRAFT
  unlockClassGrades: async (classId, { semesterId, notes } = {}) => {
    const response = await axiosClient.post("/grades/unlock-class", {
      classId,
      semesterId,
      notes,
    });
    return response;
  },
};

export default gradeService;
