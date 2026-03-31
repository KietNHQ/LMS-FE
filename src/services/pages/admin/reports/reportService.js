const SCHOOL_YEAR_OPTIONS = ["2024-2025", "2025-2026"];
const TERM_OPTIONS = ["HK1", "HK2", "ALL"];

const CLASS_OPTIONS = [
  { value: "all", label: "Tất cả lớp" },
  { value: "10A1", label: "Lớp 10A1" },
  { value: "10A2", label: "Lớp 10A2" },
  { value: "11B1", label: "Lớp 11B1" },
  { value: "11B2", label: "Lớp 11B2" },
  { value: "12C1", label: "Lớp 12C1" },
  { value: "12C3", label: "Lớp 12C3" },
];

const TEACHER_OPTIONS = [
  { value: "all", label: "Tất cả giáo viên" },
  { value: "T001", label: "Nguyễn Văn An" },
  { value: "T002", label: "Trần Thị Bình" },
  { value: "T003", label: "Lê Quốc Cường" },
];

const BASE_TEACHER_ANALYSIS = [
  {
    teacherId: "T001",
    teacherName: "Nguyễn Văn An",
    subject: "Toán",
    avgAssignedClasses: 7.62,
    assignedClasses: [
      { classId: "10A1", classAverageScore: 7.8 },
      { classId: "10A2", classAverageScore: 7.5 },
      { classId: "11B1", classAverageScore: 7.7 },
    ],
  },
  {
    teacherId: "T002",
    teacherName: "Trần Thị Bình",
    subject: "Ngữ văn",
    avgAssignedClasses: 7.25,
    assignedClasses: [
      { classId: "11B2", classAverageScore: 7.1 },
      { classId: "12C1", classAverageScore: 7.3 },
      { classId: "12C3", classAverageScore: 7.4 },
    ],
  },
  {
    teacherId: "T003",
    teacherName: "Lê Quốc Cường",
    subject: "Tiếng Anh",
    avgAssignedClasses: 7.42,
    assignedClasses: [
      { classId: "10A1", classAverageScore: 7.4 },
      { classId: "11B1", classAverageScore: 7.5 },
      { classId: "12C3", classAverageScore: 7.3 },
    ],
  },
];

const BASE_GRADE_OVERVIEW = [
  {
    grade: "Khối 10",
    averageScore: 7.38,
    star: 4.2,
    classes: [
      { classId: "10A1", averageScore: 7.8, star: 4.5 },
      { classId: "10A2", averageScore: 7.2, star: 3.9 },
    ],
  },
  {
    grade: "Khối 11",
    averageScore: 7.28,
    star: 4.0,
    classes: [
      { classId: "11B1", averageScore: 7.5, star: 4.2 },
      { classId: "11B2", averageScore: 7.1, star: 3.8 },
    ],
  },
  {
    grade: "Khối 12",
    averageScore: 7.33,
    star: 4.1,
    classes: [
      { classId: "12C1", averageScore: 7.3, star: 4.0 },
      { classId: "12C3", averageScore: 7.4, star: 4.2 },
    ],
  },
];

const REPORT_SOURCE = {
  "2024-2025": {
    HK1: {
      summary: {
        totalStudents: 1160,
        schoolAverageScore: 7.05,
        attendanceRate: 94.6,
        totalRevenue: 1760000000,
      },
      academic: [
        { name: "Tốt", value: 310 },
        { name: "Khá", value: 470 },
        { name: "Trung bình", value: 290 },
        { name: "Yếu", value: 90 },
      ],
      subjects: [
        { subject: "Toán", averageScore: 7.4 },
        { subject: "Ngữ văn", averageScore: 7.1 },
        { subject: "Tiếng Anh", averageScore: 6.8 },
        { subject: "Vật lý", averageScore: 7.0 },
        { subject: "Hóa học", averageScore: 6.9 },
      ],
      attendance: [
        { period: "Tháng 9", rate: 95.1 },
        { period: "Tháng 10", rate: 94.7 },
        { period: "Tháng 11", rate: 94.2 },
        { period: "Tháng 12", rate: 94.4 },
        { period: "Tháng 1", rate: 94.6 },
      ],
      finance: [
        { period: "Tháng 9", amount: 320000000 },
        { period: "Tháng 10", amount: 360000000 },
        { period: "Tháng 11", amount: 340000000 },
        { period: "Tháng 12", amount: 370000000 },
        { period: "Tháng 1", amount: 370000000 },
      ],
      teacherPerformance: [
        { teacher: "Nguyễn Văn An", score: 84 },
        { teacher: "Trần Thị Bình", score: 79 },
        { teacher: "Lê Quốc Cường", score: 81 },
      ],
    },
    HK2: {
      summary: {
        totalStudents: 1168,
        schoolAverageScore: 7.24,
        attendanceRate: 95.1,
        totalRevenue: 1890000000,
      },
      academic: [
        { name: "Tốt", value: 345 },
        { name: "Khá", value: 485 },
        { name: "Trung bình", value: 260 },
        { name: "Yếu", value: 78 },
      ],
      subjects: [
        { subject: "Toán", averageScore: 7.6 },
        { subject: "Ngữ văn", averageScore: 7.3 },
        { subject: "Tiếng Anh", averageScore: 7.1 },
        { subject: "Vật lý", averageScore: 7.2 },
        { subject: "Hóa học", averageScore: 7.0 },
      ],
      attendance: [
        { period: "Tháng 2", rate: 94.9 },
        { period: "Tháng 3", rate: 95.0 },
        { period: "Tháng 4", rate: 95.2 },
        { period: "Tháng 5", rate: 95.4 },
      ],
      finance: [
        { period: "Tháng 2", amount: 420000000 },
        { period: "Tháng 3", amount: 470000000 },
        { period: "Tháng 4", amount: 500000000 },
        { period: "Tháng 5", amount: 500000000 },
      ],
      teacherPerformance: [
        { teacher: "Nguyễn Văn An", score: 86 },
        { teacher: "Trần Thị Bình", score: 82 },
        { teacher: "Lê Quốc Cường", score: 84 },
      ],
    },
  },
  "2025-2026": {
    HK1: {
      summary: {
        totalStudents: 1240,
        schoolAverageScore: 7.42,
        attendanceRate: 95.8,
        totalRevenue: 2150000000,
      },
      academic: [
        { name: "Tốt", value: 420 },
        { name: "Khá", value: 510 },
        { name: "Trung bình", value: 250 },
        { name: "Yếu", value: 60 },
      ],
      subjects: [
        { subject: "Toán", averageScore: 7.8 },
        { subject: "Ngữ văn", averageScore: 7.2 },
        { subject: "Tiếng Anh", averageScore: 7.4 },
        { subject: "Vật lý", averageScore: 7.3 },
        { subject: "Hóa học", averageScore: 7.1 },
      ],
      attendance: [
        { period: "Tháng 9", rate: 96.1 },
        { period: "Tháng 10", rate: 95.6 },
        { period: "Tháng 11", rate: 95.7 },
        { period: "Tháng 12", rate: 95.8 },
        { period: "Tháng 1", rate: 95.9 },
      ],
      finance: [
        { period: "Tháng 9", amount: 420000000 },
        { period: "Tháng 10", amount: 430000000 },
        { period: "Tháng 11", amount: 440000000 },
        { period: "Tháng 12", amount: 430000000 },
        { period: "Tháng 1", amount: 430000000 },
      ],
      teacherPerformance: [
        { teacher: "Nguyễn Văn An", score: 88 },
        { teacher: "Trần Thị Bình", score: 84 },
        { teacher: "Lê Quốc Cường", score: 86 },
      ],
    },
    HK2: {
      summary: {
        totalStudents: 1256,
        schoolAverageScore: 7.56,
        attendanceRate: 96.2,
        totalRevenue: 2230000000,
      },
      academic: [
        { name: "Tốt", value: 452 },
        { name: "Khá", value: 535 },
        { name: "Trung bình", value: 214 },
        { name: "Yếu", value: 55 },
      ],
      subjects: [
        { subject: "Toán", averageScore: 8.0 },
        { subject: "Ngữ văn", averageScore: 7.4 },
        { subject: "Tiếng Anh", averageScore: 7.6 },
        { subject: "Vật lý", averageScore: 7.5 },
        { subject: "Hóa học", averageScore: 7.3 },
      ],
      attendance: [
        { period: "Tháng 2", rate: 96.0 },
        { period: "Tháng 3", rate: 96.2 },
        { period: "Tháng 4", rate: 96.4 },
        { period: "Tháng 5", rate: 96.1 },
      ],
      finance: [
        { period: "Tháng 2", amount: 550000000 },
        { period: "Tháng 3", amount: 560000000 },
        { period: "Tháng 4", amount: 550000000 },
        { period: "Tháng 5", amount: 570000000 },
      ],
      teacherPerformance: [
        { teacher: "Nguyễn Văn An", score: 89 },
        { teacher: "Trần Thị Bình", score: 86 },
        { teacher: "Lê Quốc Cường", score: 87 },
      ],
    },
  },
};

function round(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function classToGrade(classId) {
  const match = String(classId || "").match(/\d+/);
  return match ? `Khối ${match[0]}` : "";
}

function normalizeFinanceSummary(totalRevenue, totalExpense) {
  const normalizedRevenue = Math.max(0, Math.round(Number(totalRevenue) || 0));
  const fallbackExpense = Math.round(normalizedRevenue * 0.62);
  const normalizedExpense = Math.max(
    0,
    Math.min(
      normalizedRevenue,
      Math.round(Number.isFinite(totalExpense) ? totalExpense : fallbackExpense)
    )
  );

  return {
    totalRevenue: normalizedRevenue,
    totalExpense: normalizedExpense,
    totalAfterExpense: normalizedRevenue - normalizedExpense,
  };
}

function buildFinanceByGrade(totalRevenue, totalExpense) {
  const ratios = [
    { grade: "Khối 10", ratio: 0.34 },
    { grade: "Khối 11", ratio: 0.33 },
    { grade: "Khối 12", ratio: 0.33 },
  ];

  const totals = normalizeFinanceSummary(totalRevenue, totalExpense);

  return ratios.map((item) => ({
    grade: item.grade,
    amount: Math.round(totals.totalRevenue * item.ratio),
    expense: Math.round(totals.totalExpense * item.ratio),
    net: Math.round(totals.totalAfterExpense * item.ratio),
  }));
}

function buildTeacherSubjectAnalysis(multiplier) {
  return BASE_TEACHER_ANALYSIS.map((teacher) => ({
    ...teacher,
    avgAssignedClasses: round(teacher.avgAssignedClasses - (1 - multiplier) * 0.15),
    assignedClasses: teacher.assignedClasses.map((item) => ({
      ...item,
      classAverageScore: round(item.classAverageScore - (1 - multiplier) * 0.15),
    })),
  }));
}

function buildGradeOverview(multiplier) {
  return BASE_GRADE_OVERVIEW.map((grade) => ({
    ...grade,
    averageScore: round(grade.averageScore - (1 - multiplier) * 0.15),
    star: round(grade.star - (1 - multiplier) * 0.1, 1),
    classes: grade.classes.map((classItem) => ({
      ...classItem,
      averageScore: round(classItem.averageScore - (1 - multiplier) * 0.15),
      star: round(classItem.star - (1 - multiplier) * 0.1, 1),
    })),
  }));
}

function mergeTerms(termA, termB) {
  const mergedRevenue = termA.summary.totalRevenue + termB.summary.totalRevenue;
  const mergedExpense =
    normalizeFinanceSummary(termA.summary.totalRevenue, termA.summary.totalExpense).totalExpense +
    normalizeFinanceSummary(termB.summary.totalRevenue, termB.summary.totalExpense).totalExpense;
  const mergedFinance = normalizeFinanceSummary(mergedRevenue, mergedExpense);

  return {
    summary: {
      totalStudents: Math.round((termA.summary.totalStudents + termB.summary.totalStudents) / 2),
      schoolAverageScore: round(
        (termA.summary.schoolAverageScore + termB.summary.schoolAverageScore) / 2
      ),
      attendanceRate: round((termA.summary.attendanceRate + termB.summary.attendanceRate) / 2),
      totalRevenue: mergedFinance.totalRevenue,
      totalExpense: mergedFinance.totalExpense,
      totalAfterExpense: mergedFinance.totalAfterExpense,
    },
    academic: termA.academic.map((itemA, index) => {
      const itemB = termB.academic[index];
      return {
        name: itemA.name,
        value: Math.round((itemA.value + itemB.value) / 2),
      };
    }),
    subjects: termA.subjects.map((itemA, index) => {
      const itemB = termB.subjects[index];
      return {
        subject: itemA.subject,
        averageScore: round((itemA.averageScore + itemB.averageScore) / 2),
      };
    }),
    attendance: [...termA.attendance, ...termB.attendance],
    finance: [...termA.finance, ...termB.finance],
    teacherPerformance: termA.teacherPerformance.map((itemA, index) => {
      const itemB = termB.teacherPerformance[index];
      return {
        teacher: itemA.teacher,
        score: round((itemA.score + itemB.score) / 2, 1),
      };
    }),
  };
}

function withScope(baseReport, filters) {
  let multiplier = 1;

  if (filters.classId && filters.classId !== "all") {
    multiplier *= 0.34;
  }

  if (filters.teacherId && filters.teacherId !== "all") {
    multiplier *= 0.55;
  }

  let teacherSubjectAnalysis = buildTeacherSubjectAnalysis(multiplier);
  let gradeOverview = buildGradeOverview(multiplier);

  if (filters.teacherId && filters.teacherId !== "all") {
    teacherSubjectAnalysis = teacherSubjectAnalysis.filter(
      (teacher) => teacher.teacherId === filters.teacherId
    );
  }

  if (filters.classId && filters.classId !== "all") {
    teacherSubjectAnalysis = teacherSubjectAnalysis
      .map((teacher) => ({
        ...teacher,
        assignedClasses: teacher.assignedClasses.filter((item) => item.classId === filters.classId),
      }))
      .filter((teacher) => teacher.assignedClasses.length)
      .map((teacher) => ({
        ...teacher,
        avgAssignedClasses: round(
          teacher.assignedClasses.reduce((sum, item) => sum + item.classAverageScore, 0) /
            teacher.assignedClasses.length
        ),
      }));

    const selectedGrade = classToGrade(filters.classId);
    gradeOverview = gradeOverview
      .map((grade) => ({
        ...grade,
        classes: grade.classes.filter((item) => item.classId === filters.classId),
      }))
      .filter((grade) => grade.classes.length && grade.grade === selectedGrade)
      .map((grade) => ({
        ...grade,
        averageScore: grade.classes[0].averageScore,
        star: grade.classes[0].star,
      }));
  }

  const baseFinance = normalizeFinanceSummary(
    baseReport.summary.totalRevenue,
    baseReport.summary.totalExpense
  );
  const scopedFinance = normalizeFinanceSummary(
    baseFinance.totalRevenue * multiplier,
    baseFinance.totalExpense * multiplier
  );

  return {
    summary: {
      totalStudents: Math.max(12, Math.round(baseReport.summary.totalStudents * multiplier)),
      schoolAverageScore: round(baseReport.summary.schoolAverageScore - (1 - multiplier) * 0.2),
      attendanceRate: round(baseReport.summary.attendanceRate - (1 - multiplier) * 0.7),
      totalRevenue: scopedFinance.totalRevenue,
      totalExpense: scopedFinance.totalExpense,
      totalAfterExpense: scopedFinance.totalAfterExpense,
    },
    academic: baseReport.academic.map((item) => ({
      ...item,
      value: Math.max(1, Math.round(item.value * multiplier)),
    })),
    subjects: baseReport.subjects.map((item) => ({
      ...item,
      averageScore: round(item.averageScore - (1 - multiplier) * 0.15),
    })),
    attendance: baseReport.attendance.map((item) => ({
      ...item,
      rate: round(item.rate - (1 - multiplier) * 0.6),
    })),
    finance: baseReport.finance.map((item) => ({
      ...item,
      amount: Math.round(item.amount * multiplier),
    })),
    teacherPerformance: baseReport.teacherPerformance.map((item) => ({
      ...item,
      score: round(item.score - (1 - multiplier) * 0.8, 1),
    })),
    financeByGrade: buildFinanceByGrade(scopedFinance.totalRevenue, scopedFinance.totalExpense),
    teacherSubjectAnalysis,
    gradeOverview,
  };
}

function getTermData(schoolYear, term) {
  const yearData = REPORT_SOURCE[schoolYear];
  if (!yearData) {
    throw new Error("Không tìm thấy dữ liệu năm học.");
  }

  if (term === "ALL") {
    return mergeTerms(yearData.HK1, yearData.HK2);
  }

  const termData = yearData[term];
  if (!termData) {
    throw new Error("Không tìm thấy dữ liệu học kỳ.");
  }

  return termData;
}

export function getReportFilterOptions() {
  return {
    schoolYears: SCHOOL_YEAR_OPTIONS,
    terms: TERM_OPTIONS,
    classes: CLASS_OPTIONS,
    teachers: TEACHER_OPTIONS,
  };
}

export async function fetchAdminReport(filters) {
  const baseReport = getTermData(filters.schoolYear, filters.term);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(withScope(baseReport, filters));
    }, 350);
  });
}

export async function fetchTermComparison(schoolYear, filters) {
  const hk1 = withScope(getTermData(schoolYear, "HK1"), { ...filters, term: "HK1" });
  const hk2 = withScope(getTermData(schoolYear, "HK2"), { ...filters, term: "HK2" });
  const metrics = [
    {
      metric: "Điểm trung bình",
      metricType: "score",
      hk1: hk1.summary.schoolAverageScore,
      hk2: hk2.summary.schoolAverageScore,
    },
    {
      metric: "Chuyên cần (%)",
      metricType: "percent",
      hk1: hk1.summary.attendanceRate,
      hk2: hk2.summary.attendanceRate,
    },
    {
      metric: "Doanh thu (tỷ)",
      metricType: "money-b",
      hk1: round(hk1.summary.totalRevenue / 1000000000),
      hk2: round(hk2.summary.totalRevenue / 1000000000),
    },
    {
      metric: "Chi tiêu (tỷ)",
      metricType: "money-b",
      hk1: round(hk1.summary.totalExpense / 1000000000),
      hk2: round(hk2.summary.totalExpense / 1000000000),
    },
    {
      metric: "Sau chi (tỷ)",
      metricType: "money-b",
      hk1: round(hk1.summary.totalAfterExpense / 1000000000),
      hk2: round(hk2.summary.totalAfterExpense / 1000000000),
    },
  ];

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ hk1, hk2, metrics });
    }, 300);
  });
}


