import axiosClient from "../../../shared/http/axiosClient";

const getPayload = (response) => response?.data ?? response ?? {};

export const disciplineService = {
  getSummary: async (semesterId, classId) => {
    const params = classId ? { classId } : {};
    const response = await axiosClient.get(`/discipline-reports/summary/${semesterId}`, { params });
    return getPayload(response);
  },

  getViolationsByType: async ({ semesterId, startDate, endDate, classId } = {}) => {
    const params = {
      ...(semesterId ? { semesterId } : {}),
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
      ...(classId ? { classId } : {}),
    };
    const response = await axiosClient.get(`/discipline-reports/violations/by-type`, { params });
    return getPayload(response);
  },

  getTopViolators: async ({ semesterId, classId, limit = 20 } = {}) => {
    const params = {
      ...(semesterId ? { semesterId } : {}),
      ...(classId ? { classId } : {}),
      limit,
    };
    const response = await axiosClient.get(`/discipline-reports/violations/top-students`, { params });
    return getPayload(response);
  },

  getViolationsTrend: async (semesterId, classId) => {
    const params = {
      semesterId,
      ...(classId ? { classId } : {}),
    };
    const response = await axiosClient.get(`/discipline-reports/violations/trend`, { params });
    return getPayload(response);
  },

  getRewardsByType: async ({ semesterId, classId } = {}) => {
    const params = {
      ...(semesterId ? { semesterId } : {}),
      ...(classId ? { classId } : {}),
    };
    const response = await axiosClient.get(`/discipline-reports/rewards/by-type`, { params });
    return getPayload(response);
  },

  getClassRankings: async ({ schoolYearId, semesterId, limit = 50 } = {}) => {
    const params = {
      schoolYearId,
      semesterId,
      limit,
    };
    const response = await axiosClient.get(`/discipline-reports/rankings`, { params });
    return getPayload(response);
  },

  exportStudentsExcel: async (semesterId, classId) => {
    const params = classId ? { classId } : {};
    const response = await axiosClient.get(`/discipline-reports/export/students/${semesterId}`, {
      params,
      responseType: "blob",
    });
    return response;
  },
};

export default disciplineService;
