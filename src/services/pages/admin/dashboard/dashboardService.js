import axiosClient from "../../../shared/http/axiosClient";

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getPayload = (response) => response?.data ?? response ?? {};

const parseGradeFromLabel = (value = "") => {
  const match = `${value}`.match(/\d+/);
  return match ? match[0] : "";
};

const buildRevenueByGrade = (dashboardData = {}) => {
  const classDistribution = Array.isArray(dashboardData.classDistribution)
    ? dashboardData.classDistribution
    : [];

  const gradeStudents = { "10": 0, "11": 0, "12": 0 };
  classDistribution.forEach((item) => {
    const grade = parseGradeFromLabel(item?.gradeLevel ?? item?.grade ?? item?.name);
    if (!gradeStudents[grade]) {
      return;
    }
    gradeStudents[grade] += toNumber(item?.count ?? item?.studentCount);
  });

  const totalStudentsFromDistribution = Object.values(gradeStudents).reduce(
    (sum, value) => sum + value,
    0
  );
  const totalStudents =
    totalStudentsFromDistribution ||
    toNumber(dashboardData.totalStudents ?? dashboardData.total_students);
  const totalRevenue = toNumber(dashboardData.totalRevenue ?? dashboardData.total_revenue);

  const rows = ["10", "11", "12"].map((grade) => {
    const studentCount = gradeStudents[grade] || 0;
    const ratio = totalStudents > 0 ? studentCount / totalStudents : 0;
    return {
      grade,
      gradeLabel: `Khối ${grade}`,
      studentCount,
      paidStudentCount: studentCount,
      // API dashboard hien tai khong tra doanh thu tach theo hoc ky; tam phan bo theo ty le si so.
      hk1Value: Math.round(totalRevenue * ratio),
      hk2Value: 0,
    };
  });

  const summary = rows.reduce(
    (acc, item) => ({
      studentCount: acc.studentCount + item.studentCount,
      paidStudentCount: acc.paidStudentCount + item.paidStudentCount,
      hk1Value: acc.hk1Value + item.hk1Value,
      hk2Value: acc.hk2Value + item.hk2Value,
    }),
    { studentCount: 0, paidStudentCount: 0, hk1Value: 0, hk2Value: 0 }
  );

  rows.push({
    grade: "all",
    gradeLabel: "Cả 3 khối",
    studentCount: summary.studentCount,
    paidStudentCount: summary.paidStudentCount,
    hk1Value: summary.hk1Value,
    hk2Value: summary.hk2Value,
  });

  return rows;
};

const normalizeRankingItem = (item, index) => {
  const classNameRaw =
    item?.className ?? item?.class_name ?? item?.label ?? item?.name ?? "";
  const className = `${classNameRaw}`.replace(/^Lớp\s*/i, "").trim();
  return {
    id: item?.classId ?? item?.class_id ?? item?.id ?? index + 1,
    label: className,
    score: toNumber(item?.score ?? item?.totalPoints ?? item?.total_points ?? item?.point),
    trend: item?.trend ?? "stable",
    teacherName: item?.teacherName ?? item?.homeroomTeacher ?? item?.teacher_name ?? "",
  };
};

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDateRangeByWeek = ({ schoolYear, term, week }) => {
  const weekNumber = Number(week);
  if (!Number.isFinite(weekNumber) || weekNumber <= 0) {
    return null;
  }

  const [startRaw, endRaw] = `${schoolYear || ""}`.split("-");
  const startYear = Number(startRaw);
  const endYear = Number(endRaw);
  if (!Number.isFinite(startYear) || !Number.isFinite(endYear)) {
    return null;
  }

  const termStart = term === "hk2" ? new Date(endYear, 0, 1) : new Date(startYear, 7, 1);
  termStart.setHours(0, 0, 0, 0);

  const startDate = new Date(termStart);
  startDate.setDate(startDate.getDate() + (weekNumber - 1) * 7);

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  };
};

export const adminDashboardService = {
  getDashboardSummary: async () => {
    const response = await axiosClient.get("/dashboard/admin");
    const data = getPayload(response);

    return {
      totalStudents: toNumber(data.totalStudents ?? data.total_students),
      totalTeachers: toNumber(data.totalTeachers ?? data.total_teachers),
      totalClasses: toNumber(data.totalClasses ?? data.total_classes),
    };
  },

  getDashboardOverview: async () => {
    const response = await axiosClient.get("/dashboard/admin");
    const data = getPayload(response);

    return {
      summary: {
        totalStudents: toNumber(data.totalStudents ?? data.total_students),
        totalTeachers: toNumber(data.totalTeachers ?? data.total_teachers),
        totalClasses: toNumber(data.totalClasses ?? data.total_classes),
      },
      revenueComparisonData: buildRevenueByGrade(data),
    };
  },

  getConductRanking: async ({ week, schoolYear, term } = {}) => {
    const candidateEndpoints = ["/discipline/class/rankings", "/discipline/class-ranking"];
    const dateRange = getDateRangeByWeek({ week, schoolYear, term });
    const params = {
      ...(week ? { week } : {}),
      ...(dateRange || {}),
    };

    for (const endpoint of candidateEndpoints) {
      try {
        const response = await axiosClient.get(endpoint, {
          params: Object.keys(params).length > 0 ? params : undefined,
        });
        const payload = getPayload(response);
        const rows = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.items)
            ? payload.items
            : Array.isArray(payload?.data)
              ? payload.data
              : [];

        return rows.map(normalizeRankingItem).filter((item) => item.label);
      } catch (_error) {
        // Thu endpoint tiep theo de tuong thich voi API naming cu/moi.
      }
    }

    return [];
  },
};


