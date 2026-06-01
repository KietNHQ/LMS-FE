import axiosClient from "../../../shared/http/axiosClient";

const num = (v, fallback = 0) => {
  const p = Number(v);
  return Number.isFinite(p) ? p : fallback;
};

export const dashboardStatsService = {
  getOverview: async ({ schoolYear, term } = {}) => {
    const params = {};
    if (schoolYear) params.schoolYear = schoolYear;
    if (term) params.term = term;
    const resp = await axiosClient.get("/dashboard/admin", { params });
    return resp?.data || resp || {};
  },

  getSchoolStats: async ({ schoolYear, term } = {}) => {
    try {
      const [studentsRes, teachersRes, classesRes] = await Promise.all([
        axiosClient.get("/users", { params: { role: "student", limit: 1, ...(schoolYear ? { schoolYear } : {}) } }),
        axiosClient.get("/users", { params: { role: "teacher", limit: 1, ...(schoolYear ? { schoolYear } : {}) } }),
        axiosClient.get("/classes", { params: { limit: 1, ...(schoolYear ? { schoolYear } : {}) } }),
      ]);

      const totalStudents = num(studentsRes?.pagination?.total, 0);
      const totalTeachers = num(teachersRes?.pagination?.total, 0);
      const totalClasses = num(classesRes?.pagination?.total, 0);

      return { totalStudents, totalTeachers, totalClasses };
    } catch {
      return { totalStudents: 0, totalTeachers: 0, totalClasses: 0 };
    }
  },

  getGradeLockStats: async ({ semesterId, schoolYear } = {}) => {
    try {
      const resp = await axiosClient.get("/classes", {
        params: { limit: 200, ...(schoolYear ? { schoolYear } : {}) },
      });
      const classes = resp?.data || [];

      let draft = 0, pending = 0, finalized = 0;
      for (const cls of classes) {
        const status = cls.gradeLockStatus || cls.status || "draft";
        if (status === "draft" || status === "unlocked") draft++;
        else if (status === "pending" || status === "submitted") pending++;
        else if (status === "finalized" || status === "locked") finalized++;
      }

      const byGrade = {};
      for (const cls of classes) {
        const gradeName = cls.grade_level_name || cls.gradeLevel || cls.grade || "";
        const match = String(gradeName).match(/\d+/);
        const grade = match ? `Khối ${match[0]}` : gradeName || "Khác";
        if (!byGrade[grade]) byGrade[grade] = { finalized: 0, total: 0 };
        byGrade[grade].total++;
        const status = cls.gradeLockStatus || cls.status || "draft";
        if (status === "finalized" || status === "locked") byGrade[grade].finalized++;
      }

      return {
        draft,
        pending,
        finalized,
        total: classes.length,
        byGrade: Object.entries(byGrade).map(([label, v]) => ({
          label,
          ...v,
        })),
      };
    } catch {
      return { draft: 0, pending: 0, finalized: 0, total: 0, byGrade: [] };
    }
  },

  getAlerts: async ({ semesterId, schoolYear } = {}) => {
    const alerts = [];

    try {
      const [studentsRes, teachersRes] = await Promise.all([
        axiosClient.get("/users", { params: { role: "student", limit: 1, schoolYear } }),
        axiosClient.get("/users", { params: { role: "teacher", limit: 1, schoolYear } }),
      ]);

      const totalStudents = num(studentsRes?.pagination?.total, 0);
      const totalTeachers = num(teachersRes?.pagination?.total, 0);

      if (totalStudents === 0) {
        alerts.push({
          id: "no-students",
          type: "danger",
          icon: "FiAlertCircle",
          message: "Không có dữ liệu học sinh. Vui lòng kiểm tra import dữ liệu.",
          actionText: "Xem danh sách",
          path: "/management/users?role=student",
        });
      }
      if (totalTeachers === 0) {
        alerts.push({
          id: "no-teachers",
          type: "danger",
          icon: "FiAlertCircle",
          message: "Không có dữ liệu giáo viên.",
          actionText: "Xem danh sách",
          path: "/management/users?role=teacher",
        });
      }
    } catch {
      alerts.push({
        id: "system-error",
        type: "danger",
        icon: "FiAlertCircle",
        message: "Không thể kết nối máy chủ.",
        actionText: "Thử lại",
        path: "/management/dashboard",
      });
    }

    return alerts;
  },

  getQuickLinksData: async ({ schoolYear, term } = {}) => {
    try {
      const [notificationsRes, auditRes] = await Promise.all([
        axiosClient.get("/notifications", { params: { limit: 5, schoolYear } }),
        axiosClient.get("/audit-logs", { params: { limit: 5 } }),
      ]);

      const unreadCount = num(notificationsRes?.pagination?.total, 0);
      const newLogs = num(auditRes?.pagination?.total, 0);

      return { unreadCount, newLogs };
    } catch {
      return { unreadCount: 0, newLogs: 0 };
    }
  },
};
