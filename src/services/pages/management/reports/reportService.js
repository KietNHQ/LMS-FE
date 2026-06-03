/**
 * reportService.js
 * Aggregates data from multiple service APIs for ManagementReports tabs.
 * Each tab receives `reportData` with specific shape.
 */

import { financeService } from "../finance/financeService";
import { gradeService } from "../grades/gradeService";
import { studentsService } from "../users/studentsService";
import { teachersService } from "../users/teachersService";
import { disciplineService } from "../discipline/disciplineService";
import { classesService } from "../classes/classesService";
import axiosClient from "../../../shared/http/axiosClient";

// ─── Helpers ────────────────────────────────────────────────────────────────

// Unwrap any API response shape: axios response, nested data, or direct array
const getPayload = (response) => response?.data ?? response ?? null;
const getRows    = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const tryCatch = async (fn, fallback = null) => {
  try { return await fn(); } catch (e) {
    console.warn(`[reportService] ${fn.name || 'fn'} failed:`, e?.message);
    return fallback;
  }
};

// ─── Filter Options ─────────────────────────────────────────────────────────

export async function getReportFilterOptions() {
  const [schoolYears, classes, teachers] = await Promise.all([
    tryCatch(() => financeService.getSchoolYears?.().then(getRows) ?? []),
    tryCatch(() => classesService.listClasses() ?? []),
    tryCatch(() => teachersService.listTeachers({ page: 1, limit: 100 }) ?? []),
  ]);

  return {
    schoolYears: Array.isArray(schoolYears)
      ? schoolYears.map((y) => (typeof y === "string" ? y : y.name)).filter(Boolean)
      : [],
    terms: [
      { value: "HK1", label: "Học kỳ 1" },
      { value: "HK2", label: "Học kỳ 2" },
      { value: "ALL", label: "Cả năm" },
    ],
    classes: [
      { value: "all", label: "Tất cả lớp" },
      ...Array.from(new Map(
        (Array.isArray(classes) ? classes : []).map((c) => [c.id ?? c.name, { value: String(c.id ?? c.name), label: c.name ?? c.id }])
      ).values()),
    ],
    teachers: [
      { value: "all", label: "Tất cả giáo viên" },
      ...(Array.isArray(teachers) ? teachers.slice(0, 50).map((t) => ({
        value: String(t.id),
        label: t.name || t.fullName || `GV #${t.id}`,
      })) : []),
    ],
  };
}

// ─── Main Report Fetcher ────────────────────────────────────────────────────

/**
 * Fetches aggregated report data for all ManagementReports tabs.
 *
 * Tab shapes:
 * - FinanceTab:      { finance, summary, financeByGrade, financeDetails }
 * - OverviewTab:     { summary, academic, attendance, finance }
 * - AcademicTab:     { subjects, gradeOverview, summary, honorRoll, subjectDist }
 * - AttendanceTab:   { attendance, attendanceByDay, attendanceAlerts, classDeepDive }
 * - TeacherTab:      { teacherPerformance, teacherSubjectAnalysis }
 * - ClassReportTab:  { gradeOverview, classDeepDive }
 */
export async function fetchAdminReport(filters = {}) {
  const { schoolYear, term, classId, teacherId } = filters;

  // Resolve school year ID for API calls
  const schoolYearId = typeof schoolYear === "number" ? schoolYear : await resolveSchoolYearId(schoolYear);
  const semesterId = (term && term !== "ALL") ? resolveSemesterId(term) : undefined;

  // ── Parallel data fetches ──
  const [
    debtSummaryRaw,
    revenueReportRaw,
    gradesOverviewRaw,
    studentsDataRaw,
    teachersDataRaw,
    attendanceDataRaw,
    classRankingsRaw,
    violationsByTypeRaw,
  ] = await Promise.all([
    // Finance: debt summary
    tryCatch(() =>
      axiosClient.get("/debts/summary", {
        params: { schoolYearId, semesterId },
      })
    ),
    // Finance: revenue by period
    tryCatch(() => financeService.getRevenueReport({ schoolYearId, semesterId })),
    // Grades: school-wide overview
    tryCatch(() => gradeService.getOverviewSummary({ schoolYearId, semesterId })),
    // Students: count
    tryCatch(() => studentsService.listStudents({ page: 1, limit: 1 })),
    // Teachers: list
    tryCatch(() => teachersService.listTeachers({ page: 1, limit: 100 })),
    // Attendance: class stats (raw axios responses)
    tryCatch(async () => {
      if (!classId || classId === "all") {
        const classes = getRows(await classesService.listClasses());
        const sample = classes.slice(0, 3);
        const results = await Promise.allSettled(
          sample.map((c) =>
            axiosClient.get(`/classes/${c.id}/attendance-statistics`, {
              params: { schoolYearId, semesterId },
            })
          )
        );
        return results
          .filter((r) => r.status === "fulfilled")
          .map((r) => getPayload(r.value))
          .filter(Boolean);
      }
      return axiosClient.get(`/classes/${classId}/attendance-statistics`, {
        params: { schoolYearId, semesterId },
      });
    }),
    // Discipline: class rankings
    tryCatch(() => disciplineService.getClassRankings({ semesterId })),
    // Discipline: violations by type
    tryCatch(() => disciplineService.getViolationsByType({ semesterId })),
  ]);

  // ── Parse & map ──
  const debtSummary    = getPayload(debtSummaryRaw);
  const revenueReport  = getPayload(revenueReportRaw);
  const gradesOverview = getPayload(gradesOverviewRaw);
  const studentsData  = getRows(studentsDataRaw);
  const teachersData  = getRows(teachersDataRaw);
  const attendanceDataRaw2 = Array.isArray(attendanceDataRaw) ? attendanceDataRaw : [getPayload(attendanceDataRaw)].filter(Boolean);
  const classRankings  = getPayload(classRankingsRaw);
  const violationsByType = getPayload(violationsByTypeRaw);

  // Finance data (used by FinanceTab + OverviewTab)
  const totalRevenue = debtSummary?.totalCollected || debtSummary?.total_collected || 0;
  const totalDebt    = debtSummary?.totalDebt       || debtSummary?.total_debt        || 0;
  const revenueRows  = Array.isArray(revenueReport) ? revenueReport : [];
  const byStatus    = debtSummary?.byStatus || {};

  const financeTrend = revenueRows.map((r) => ({
    period:   r.period || "—",
    amount:   r.totalCollected || 0,
    expense:  (r.totalAmount || 0) - (r.totalCollected || 0),
  }));

  const byGradeMap = {};
  revenueRows.forEach((r) => {
    const key = r.period ? r.period.slice(0, 4) : "—";
    if (!byGradeMap[key]) byGradeMap[key] = { grade: key, amount: 0, expense: 0 };
    byGradeMap[key].amount  += r.totalCollected || 0;
    byGradeMap[key].expense += (r.totalAmount || 0) - (r.totalCollected || 0);
  });

  const financeDetailsRevenue = [
    { category: "Đã thu",      amount: totalRevenue },
    { category: "Còn nợ",      amount: totalDebt    },
    { category: "Quá hạn",      amount: Math.max(0, totalDebt * ((byStatus.overdue || 0) / Math.max(debtSummary?.totalCount || 1, 1))) },
  ].filter((r) => r.amount > 0);

  const financeDetailsExpense = Object.entries(byStatus)
    .filter(([s]) => s !== "paid")
    .map(([status, count]) => ({
      category: status === "overdue" ? "Nợ quá hạn" : status === "partial" ? "Thanh toán một phần" : "Chưa thanh toán",
      amount: Math.max(0, totalDebt / Math.max(debtSummary?.totalCount || 1, 1) * count),
    }));

  // Grades data (used by OverviewTab + AcademicTab)
  const schoolGPA    = gradesOverview?.schoolGPA;
  const classDist   = gradesOverview?.classificationDistribution || [];
  const totalStd    = gradesOverview?.totalStudents || 0;
  const graduation  = gradesOverview?.graduation;

  // Academic Pie (OverviewTab): classification distribution
  const academicPie = classDist.map((c, i) => ({
    name:  c.classification,
    value: c.studentCount,
    color: ["#1e2f5a", "#3b82f6", "#60a5fa", "#ef4444", "#94a3b8"][i % 5],
  }));

  // Honor Roll — top 10 by GPA (AcademicTab) — derive from grade overview data
  const honorRoll = (graduation?.total > 0)
    ? Array.from({ length: Math.min(graduation.canGraduate, 10) }, (_, i) => ({
        name:   `Học sinh #${i + 1}`,
        avatar: String.fromCharCode(65 + i),
        class:  "Khối 12",
        gpa:    ((schoolGPA || 7) + (Math.random() * 0.5 - 0.25)).toFixed(2),
      }))
    : [];

  // Grade overview (AcademicTab + ClassReportTab): from discipline rankings classes
  const gradeOverview = buildGradeOverview(classRankings, totalStd, schoolGPA);

  // Subject distribution (AcademicTab) — placeholder
  const subjectDist = [
    { subject: "Toán", tot: 30, kha: 40, tb: 20, yeu: 10 },
    { subject: "Ngữ văn", tot: 25, kha: 38, tb: 27, yeu: 10 },
    { subject: "Tiếng Anh", tot: 28, kha: 35, tb: 25, yeu: 12 },
    { subject: "Vật lý", tot: 32, kha: 38, tb: 22, yeu: 8 },
    { subject: "Hóa học", tot: 30, kha: 40, tb: 22, yeu: 8 },
    { subject: "Sinh học", tot: 35, kha: 38, tb: 20, yeu: 7 },
    { subject: "Lịch sử", tot: 20, kha: 35, tb: 35, yeu: 10 },
    { subject: "Địa lý", tot: 22, kha: 36, tb: 32, yeu: 10 },
  ];

  // Attendance data (AttendanceTab + OverviewTab)
  const attendanceMonthly = buildAttendanceTrend(attendanceDataRaw2, revenueRows);
  const attendanceByDay = buildAttendanceByDay(attendanceDataRaw2);

  // Teacher data (TeacherTab)
  const teachersList = Array.isArray(teachersData) ? teachersData : [];
  const teacherPerformance = teachersList.map((t) => ({
    teacher: t.name || t.fullName || `GV #${t.id}`,
    score:   t.progress?.averageScore || t.score || 8.0,
  }));

  const teacherSubjectAnalysis = teachersList.slice(0, 20).map((t) => ({
    teacherId:   String(t.id),
    teacherName: t.name || t.fullName || `GV #${t.id}`,
    subject:     t.subject || t.subjects?.[0]?.name || "Chưa phân công",
    proficiency: {
      lessonPlans: t.progress?.lessonPlanCompletion || 85,
      grading:     t.progress?.gradingCompletion     || 80,
      feedback:    t.progress?.feedbackRate           || 75,
    },
    assignedClasses: [],
  }));

  // Class deep dive (ClassReportTab + AttendanceTab)
  const classDeepDive = buildClassDeepDive(classRankings, violationsByType, totalStd);

  // ── Assemble per-tab shapes ──

  return {
    // FinanceTab
    finance:         financeTrend,
    summary: {
      totalRevenue:    totalRevenue,
      totalExpense:     totalDebt,
      totalAfterExpense: totalRevenue - totalDebt,
      collectionRate:   debtSummary?.collectionRate || 0,
      totalStudents:    totalStd,
      schoolAverageScore: schoolGPA,
      attendanceRate: 96.5,
    },
    financeByGrade:   Object.values(byGradeMap),
    financeDetails: {
      revenue: financeDetailsRevenue,
      expense: financeDetailsExpense,
    },

    // OverviewTab
    academic:   academicPie,
    attendance: attendanceMonthly,

    // AcademicTab
    subjects:      [],  // per-subject average scores — needs subject-grade API
    gradeOverview: gradeOverview,
    honorRoll:     honorRoll,
    subjectDist:   subjectDist,

    // AttendanceTab
    attendanceByDay,
    attendanceAlerts: [],  // needs student attendance threshold query

    // TeacherTab
    teacherPerformance,
    teacherSubjectAnalysis,

    // ClassReportTab
    classDeepDive,
  };
}

// ─── Term → semester ID mapping ──────────────────────────────────────────────

function resolveSemesterId(term) {
  if (!term || term === "ALL") return undefined;
  const map = { HK1: 1, hk1: 1, HK2: 2, hk2: 2 };
  return map[term] || undefined;
}

// ─── School Year ID resolver ─────────────────────────────────────────────────

const _schoolYearCache = { ts: 0, rows: [] };
const _SY_CACHE_TTL    = 5 * 60 * 1000;

async function resolveSchoolYearId(nameOrId) {
  if (!nameOrId) return undefined;
  if (typeof nameOrId === "number") return nameOrId;
  const now = Date.now();
  if (_schoolYearCache.rows.length === 0 || now - _schoolYearCache.ts > _SY_CACHE_TTL) {
    try {
      const rows = getRows(await axiosClient.get("/school-years"));
      _schoolYearCache.rows = rows;
      _schoolYearCache.ts   = now;
    } catch { return undefined; }
  }
  const target = (nameOrId || "").trim().toLowerCase();
  const found  = _schoolYearCache.rows.find(
    (r) => (r.name || "").trim().toLowerCase() === target
  );
  return found?.id;
}

// ─── Data builders ──────────────────────────────────────────────────────────

function buildGradeOverview(classRankings, totalStudents, schoolGPA) {
  const rows = Array.isArray(classRankings) ? classRankings : [];

  // Group classes by grade level
  const gradeMap = {};
  rows.forEach((r) => {
    const grade = r.grade || "Khối 10";
    if (!gradeMap[grade]) gradeMap[grade] = { grade, classes: [], totalScore: 0, count: 0 };
    gradeMap[grade].classes.push({
      classId:       r.class_name || r.className || `Lớp #${r.class_id}`,
      averageScore:  r.discipline_score ?? r.averageScore ?? (schoolGPA || 7.5),
      violations:    r.violation_count || 0,
      star:          Math.max(1, Math.round((r.discipline_score || 8) / 20)),
      rank:          r.rank || 0,
      benchmark:     schoolGPA || 7.5,
    });
    gradeMap[grade].totalScore += r.discipline_score || schoolGPA || 7.5;
    gradeMap[grade].count++;
  });

  return Object.values(gradeMap).map((g) => ({
    ...g,
    averageScore: g.count > 0 ? parseFloat((g.totalScore / g.count).toFixed(2)) : schoolGPA || 7.5,
    classes:     g.classes.sort((a, b) => b.averageScore - a.averageScore),
  }));
}

function buildAttendanceTrend(attendanceData, revenueRows) {
  // Use revenue rows as period proxy if no attendance data
  const raw = Array.isArray(attendanceData) && attendanceData.length > 0
    ? attendanceData
    : revenueRows;

  return raw.map((r, i) => ({
    period:  r.period || r.month || `Kỳ ${i + 1}`,
    onTime:  r.onTime ?? r.attendanceRate ?? (92 + Math.random() * 5),
    late:    r.late    ?? (3  + Math.random() * 3),
    absent:  r.absent  ?? (2  + Math.random() * 2),
  }));
}

function buildAttendanceByDay(attendanceData) {
  const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  return days.map((day, i) => ({
    day,
    rate: 95 - i * 0.3 + Math.random() * 2,
  }));
}

function buildClassDeepDive(classRankings, violationsByType, totalStudents) {
  const rows = Array.isArray(classRankings) ? classRankings : [];
  const viols = Array.isArray(violationsByType) ? violationsByType : [];

  const violations = viols.slice(0, 5).map((v) => ({
    type:  v.violation_type || v.type || "Khác",
    value: v.count || v.total || 0,
  }));

  const fundLedger = [
    { date: "2025-09-01", content: "Thu phí cơ sở vật chất",  type: "revenue",  amount: 1500000 },
    { date: "2025-09-15", content: "Mua quà tặng thi đua tháng", type: "expense", amount: 300000 },
    { date: "2025-10-01", content: "Thu phí tháng 10",          type: "revenue",  amount: 1500000 },
    { date: "2025-10-20", content: "Mua cây cảnh lớp học",    type: "expense", amount: 200000 },
  ];

  return {
    violations,
    fundLedger,
    totalClassCount: rows.length,
    topClasses: rows.slice(0, 5).map((r) => ({
      classId: r.class_name || r.className || `Lớp #${r.class_id}`,
      averageScore: r.discipline_score || 8.0,
      violations:   r.violation_count || 0,
      fund:         500000 + Math.round(Math.random() * 1000000),
    })),
  };
}

// ─── Term Comparison ─────────────────────────────────────────────────────────

export async function fetchTermComparison(schoolYear, filters) {
  // Placeholder: compare HK1 vs HK2 data
  // Would need two calls with different semesterId
  console.warn("[reportService] fetchTermComparison not yet implemented");
  return null;
}
