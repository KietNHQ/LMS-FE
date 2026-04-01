import axiosClient from "../../../shared/http/axiosClient";

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const adminDashboardService = {
  getDashboardSummary: async () => {
    const response = await axiosClient.get("/dashboard/admin");
    const data = response?.data || {};

    return {
      totalStudents: toNumber(data.totalStudents ?? data.total_students),
      totalTeachers: toNumber(data.totalTeachers ?? data.total_teachers),
      totalClasses: toNumber(data.totalClasses ?? data.total_classes),
    };
  },
};

