import { useEffect, useMemo, useState } from "react";
import "./AdminReports.css";
import { Button, Card, Select } from "../../../components/ui";
import AcademicReportSection from "./components/academicReportSection/academicReportSection";
import AttendanceReportSection from "./components/attendanceReportSection/attendanceReportSection";
import ExportReportSection from "./components/exportReportSection/exportReportSection";
import QuizExamReportSection from "./components/quizExamReportSection/quizExamReportSection";
import TeacherProgressReportSection from "./components/teacherProgressReportSection/teacherProgressReportSection";
import {
  fetchAdminReport,
  fetchTermComparison,
  getReportFilterOptions,
} from "../../../services/pages/admin/reports/reportService";

const PIE_COLORS = ["#3557d4", "#58a5f0", "#9fd7ff", "#ff9b6c"];

const CURRENCY_FORMATTER = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const PERCENT_FORMATTER = new Intl.NumberFormat("vi-VN", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const SCORE_FORMATTER = new Intl.NumberFormat("vi-VN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function sanitizeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getCurrentSchoolYear() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  return currentMonth < 8 ? `${currentYear - 1}-${currentYear}` : `${currentYear}-${currentYear + 1}`;
}

function getCurrentTerm() {
  const month = new Date().getMonth() + 1;
  return month >= 8 && month <= 12 ? "HK1" : "HK2";
}

const DEMO_CLASS_MEMBERS = [
  { studentId: "HS001", name: "Nguyễn Văn A", oralTest: 8.5, test15min: 8.0, test45min: 7.8, midterm: 8.2, final: 8.1 },
  { studentId: "HS002", name: "Trần Thị B", oralTest: 9.0, test15min: 8.5, test45min: 8.2, midterm: 8.8, final: 8.9 },
  { studentId: "HS003", name: "Lê Hoàng C", oralTest: 7.5, test15min: 7.2, test45min: 7.0, midterm: 7.3, final: 7.4 },
  { studentId: "HS004", name: "Phạm Quang D", oralTest: 8.0, test15min: 7.8, test45min: 7.9, midterm: 8.1, final: 8.0 },
  { studentId: "HS005", name: "Hoàng Mỹ E", oralTest: 9.2, test15min: 8.8, test45min: 8.5, midterm: 9.0, final: 9.1 },
];

const HOMEROOM_TEACHER_BY_CLASS = {
  "10A1": "Nguyễn Thị Lan",
  "10A2": "Phạm Quốc Huy",
  "11B1": "Trần Minh Anh",
  "11B2": "Lê Thu Hà",
  "12C1": "Vũ Đức Long",
  "12C3": "Đặng Thảo Vy",
};

function formatCompactMoney(value) {
  const number = Number(value) || 0;
  const absValue = Math.abs(number);

  const normalize = (input) => {
    const rounded = input >= 100 ? Math.round(input) : Number(input.toFixed(1));
    return Number.isInteger(rounded) ? `${rounded}` : `${rounded}`.replace(".", ",");
  };

  if (absValue >= 1_000_000_000) {
    return `${number < 0 ? "-" : ""}${normalize(absValue / 1_000_000_000)}b`;
  }

  if (absValue >= 1_000_000) {
    return `${number < 0 ? "-" : ""}${normalize(absValue / 1_000_000)}tr`;
  }

  if (absValue >= 1_000) {
    return `${number < 0 ? "-" : ""}${normalize(absValue / 1_000)}k`;
  }

  return `${number}`;
}

function buildAttendanceBreakdown(rate, totalStudents, seed = 0) {
  const clampedRate = Math.max(0, Math.min(100, Number(rate) || 0));
  const lateRateBase = 1 + (seed % 4) * 0.3;
  const lateRate = Math.min(3.5, Math.max(0.8, lateRateBase));
  const adjustedLateRate = Math.min(lateRate, Math.max(0, 100 - clampedRate));
  const absentRate = Math.max(0, 100 - clampedRate - adjustedLateRate);

  const lateCount = Math.round((totalStudents * adjustedLateRate) / 100);
  const absentCount = Math.round((totalStudents * absentRate) / 100);
  const presentCount = Math.max(0, totalStudents - lateCount - absentCount);

  return {
    presentRate: Number(clampedRate.toFixed(1)),
    lateRate: Number(adjustedLateRate.toFixed(1)),
    absentRate: Number(absentRate.toFixed(1)),
    presentCount,
    lateCount,
    absentCount,
  };
}

function buildAttendanceDays(attendance, totalRequiredDays) {
  const requiredDays = Math.max(1, Math.round(Number(totalRequiredDays) || 0));
  const presentDays = Math.round((requiredDays * (attendance?.presentRate || 0)) / 100);
  const lateDays = Math.round((requiredDays * (attendance?.lateRate || 0)) / 100);
  const absentDays = Math.max(0, requiredDays - presentDays - lateDays);

  return {
    requiredDays,
    presentDays,
    absentDays,
    lateDays,
  };
}

function getMemberAverageScore(member, fallbackAverageScore) {
  if (Number.isFinite(Number(member?.averageScore))) {
    return Number(member.averageScore);
  }

  const rawScores = [member?.oralTest, member?.test15min, member?.test45min, member?.midterm, member?.final]
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item));

  if (!rawScores.length) {
    return Number(fallbackAverageScore) || 0;
  }

  const total = rawScores.reduce((sum, item) => sum + item, 0);
  return total / rawScores.length;
}

function getMemberAttendanceDays(member, index, totalRequiredDays) {
  const requiredDays = Math.max(1, Math.round(Number(totalRequiredDays) || 0));

  if (
    Number.isFinite(Number(member?.presentDays)) &&
    Number.isFinite(Number(member?.absentDays)) &&
    Number.isFinite(Number(member?.lateDays))
  ) {
    return {
      requiredDays,
      presentDays: Math.max(0, Math.round(Number(member.presentDays))),
      absentDays: Math.max(0, Math.round(Number(member.absentDays))),
      lateDays: Math.max(0, Math.round(Number(member.lateDays))),
    };
  }

  const lateDays = 1 + (index % 3);
  const absentDays = 2 + (index % 4);
  const presentDays = Math.max(0, requiredDays - absentDays - lateDays);

  return {
    requiredDays,
    presentDays,
    absentDays,
    lateDays,
  };
}

const AdminReports = () => {
  const filterOptions = useMemo(() => getReportFilterOptions(), []);
  const schoolYearOptions = filterOptions.schoolYears;
  const initialSchoolYear = schoolYearOptions.includes(getCurrentSchoolYear())
    ? getCurrentSchoolYear()
    : schoolYearOptions[0];

  const [filters, setFilters] = useState({
    schoolYear: initialSchoolYear,
    term: getCurrentTerm(),
    classId: "all",
    teacherId: "all",
  });
  const [reportData, setReportData] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompareLoading, setIsCompareLoading] = useState(false);
  const [error, setError] = useState("");
  const [detailView, setDetailView] = useState(null);
  const [selectedTeacherForTable, setSelectedTeacherForTable] = useState("all");
  const [selectedTeacherClass, setSelectedTeacherClass] = useState("all");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedSubjectScope, setSelectedSubjectScope] = useState("all");
  const [expandedTeacherClasses, setExpandedTeacherClasses] = useState({});
  const [expandedGradeClasses, setExpandedGradeClasses] = useState({});
  const [isExportFloating, setIsExportFloating] = useState(false);

  useEffect(() => {
    let rafId = 0;

    const handleScroll = () => {
      if (rafId) {
        return;
      }

      rafId = window.requestAnimationFrame(() => {
        const root = document.querySelector(".admin-layout__main");
        const scrollTop = root ? root.scrollTop : window.scrollY;

        // Use hysteresis to avoid fast on/off flicker near threshold.
        setIsExportFloating((prev) => {
          const showAt = 96;
          const hideAt = 56;

          if (!prev && scrollTop > showAt) {
            return true;
          }

          if (prev && scrollTop < hideAt) {
            return false;
          }

          return prev;
        });

        rafId = 0;
      });
    };

    const root = document.querySelector(".admin-layout__main");
    const scrollTarget = root || window;
    scrollTarget.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      scrollTarget.removeEventListener("scroll", handleScroll);
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadReport() {
      setIsLoading(true);
      setError("");

      try {
        const data = await fetchAdminReport(filters);
        if (!isMounted) {
          return;
        }
        setReportData(data);
      } catch (loadError) {
        if (isMounted) {
          setError(loadError?.message || "Không tải được báo cáo.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadReport();

    return () => {
      isMounted = false;
    };
  }, [filters]);

  useEffect(() => {
    let isMounted = true;

    async function loadComparison() {
      setIsCompareLoading(true);
      try {
        const data = await fetchTermComparison(filters.schoolYear, filters);
        if (isMounted) {
          setComparisonData(data);
        }
      } catch {
        if (isMounted) {
          setComparisonData(null);
        }
      } finally {
        if (isMounted) {
          setIsCompareLoading(false);
        }
      }
    }

    loadComparison();

    return () => {
      isMounted = false;
    };
  }, [filters.schoolYear, filters.classId, filters.teacherId]);

  const summaryCards = useMemo(() => {
    if (!reportData) {
      return [];
    }

    const totalStudents = reportData.summary.totalStudents;
    const breakdown = buildAttendanceBreakdown(reportData.summary.attendanceRate, totalStudents);
    const academicTotal = reportData.academic.reduce((sum, item) => sum + item.value, 0);
    const goodAndPrettyGood = reportData.academic.reduce((sum, item) => {
      if (item.name === "Tốt" || item.name === "Khá") {
        return sum + item.value;
      }
      return sum;
    }, 0);
    const goodRate = academicTotal ? (goodAndPrettyGood / academicTotal) * 100 : 0;

    return [
      {
        title: "Tổng học sinh",
        value: reportData.summary.totalStudents.toLocaleString("vi-VN"),
      },
      {
        title: "Điểm TB toàn trường",
        value: SCORE_FORMATTER.format(reportData.summary.schoolAverageScore),
      },
      {
        title: "Tỉ lệ khá giỏi",
        value: `${PERCENT_FORMATTER.format(goodRate)}%`,
      },
      {
        title: "Tổng doanh thu",
        value: CURRENCY_FORMATTER.format(reportData.summary.totalRevenue),
      },
      {
        title: "Tổng chi tiêu",
        value: CURRENCY_FORMATTER.format(reportData.summary.totalExpense),
      },
      {
        title: "Sau chi tiêu",
        value: CURRENCY_FORMATTER.format(reportData.summary.totalAfterExpense),
      },
      {
        title: "Đi học",
        value: `${breakdown.presentCount.toLocaleString("vi-VN")} (${PERCENT_FORMATTER.format(
          breakdown.presentRate
        )}%)`,
      },
      {
        title: "Nghỉ học",
        value: `${breakdown.absentCount.toLocaleString("vi-VN")} (${PERCENT_FORMATTER.format(
          breakdown.absentRate
        )}%)`,
      },
      {
        title: "Đi muộn",
        value: `${breakdown.lateCount.toLocaleString("vi-VN")} (${PERCENT_FORMATTER.format(
          breakdown.lateRate
        )}%)`,
      },
    ];
  }, [reportData]);

  const academicChartData = useMemo(() => {
    if (!reportData) {
      return [];
    }

    return reportData.academic.map((item, index) => ({
      ...item,
      fill: PIE_COLORS[index % PIE_COLORS.length],
    }));
  }, [reportData]);

  const attendanceChartData = useMemo(() => {
    if (!reportData) {
      return [];
    }

    return reportData.attendance.map((item, index) => ({
      period: item.period,
      ...buildAttendanceBreakdown(item.rate, reportData.summary.totalStudents, index),
    }));
  }, [reportData]);

  const gradeList = reportData?.gradeOverview || [];

  const subjectChartData = useMemo(() => {
    if (!reportData) {
      return [];
    }

    const baseSubjects = reportData.subjects || [];
    if (filters.classId !== "all" || selectedSubjectScope === "all") {
      return baseSubjects;
    }

    const selectedGradeData = gradeList.find((item) => item.grade === selectedSubjectScope);
    if (!selectedGradeData) {
      return baseSubjects;
    }

    const schoolAverage = Number(reportData.summary.schoolAverageScore) || 0;
    const scale = schoolAverage > 0 ? selectedGradeData.averageScore / schoolAverage : 1;

    return baseSubjects.map((item) => ({
      ...item,
      averageScore: Math.max(0, Math.min(10, Number((item.averageScore * scale).toFixed(2)))),
    }));
  }, [filters.classId, gradeList, reportData, selectedSubjectScope]);

  const subjectScopeOptions = useMemo(
    () => [{ value: "all", label: "Toàn trường" }, ...gradeList.map((item) => ({ value: item.grade, label: item.grade }))],
    [gradeList]
  );

  const subjectScopeLabel =
    filters.classId !== "all"
      ? `Lớp ${filters.classId}`
      : selectedSubjectScope === "all"
        ? "Toàn trường"
        : selectedSubjectScope;

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((previousFilters) => ({
      ...previousFilters,
      [name]: value,
    }));
  };

  const currentYearIndex = schoolYearOptions.indexOf(filters.schoolYear);
  const canGoPrevYear = currentYearIndex > 0;
  const canGoNextYear = currentYearIndex >= 0 && currentYearIndex < schoolYearOptions.length - 1;

  const handleYearArrow = (direction) => {
    if (currentYearIndex === -1) {
      return;
    }

    const nextIndex = direction === "prev" ? currentYearIndex - 1 : currentYearIndex + 1;
    if (nextIndex < 0 || nextIndex >= schoolYearOptions.length) {
      return;
    }

    setFilters((previousFilters) => ({
      ...previousFilters,
      schoolYear: schoolYearOptions[nextIndex],
    }));
  };

  const openDetail = (title, rows) => {
    setDetailView({ title, rows });
  };

  const handleAcademicClick = (slice) => {
    if (!slice || !reportData) {
      return;
    }

    const total = reportData.academic.reduce((sum, item) => sum + item.value, 0);
    const percent = total ? (slice.value / total) * 100 : 0;

    openDetail(`Học lực: ${slice.name}`, [
      { label: "Số học sinh", value: slice.value.toLocaleString("vi-VN") },
      { label: "Tỉ trọng", value: `${PERCENT_FORMATTER.format(percent)}%` },
      { label: "Học kỳ", value: filters.term },
      { label: "Năm học", value: filters.schoolYear },
    ]);
  };

  const handleSubjectClick = (point) => {
    if (!point) {
      return;
    }

    openDetail(`Môn học: ${point.subject}`, [
      { label: "Điểm trung bình", value: SCORE_FORMATTER.format(point.averageScore) },
      { label: "Phạm vi", value: subjectScopeLabel },
    ]);
  };

  const handleAttendanceClick = (point) => {
    if (!point) {
      return;
    }

    openDetail(`Chuyên cần - ${point.period}`, [
      {
        label: "Đi học",
        value: `${point.presentCount.toLocaleString("vi-VN")} (${PERCENT_FORMATTER.format(
          point.presentRate
        )}%)`,
      },
      {
        label: "Nghỉ học",
        value: `${point.absentCount.toLocaleString("vi-VN")} (${PERCENT_FORMATTER.format(
          point.absentRate
        )}%)`,
      },
      {
        label: "Đi muộn",
        value: `${point.lateCount.toLocaleString("vi-VN")} (${PERCENT_FORMATTER.format(point.lateRate)}%)`,
      },
      { label: "Năm học", value: filters.schoolYear },
    ]);
  };

  const handleFinanceClick = (point) => {
    if (!point) {
      return;
    }

    openDetail(`Tài chính - ${point.period || point.grade}`, [
      { label: "Tổng doanh thu", value: CURRENCY_FORMATTER.format(point.amount) },
      { label: "Tổng chi tiêu", value: CURRENCY_FORMATTER.format(point.expense || 0) },
      { label: "Sau chi tiêu", value: CURRENCY_FORMATTER.format(point.net || 0) },
      { label: "Học kỳ", value: filters.term },
    ]);
  };

  const handleExportPdf = () => {
    if (!reportData) {
      return;
    }

    const popup = window.open("", "_blank", "width=1024,height=768");
    if (!popup) {
      return;
    }

    const summaryHtml = summaryCards
      .map(
        (card) =>
          `<li><strong>${sanitizeHtml(card.title)}:</strong> ${sanitizeHtml(card.value)}</li>`
      )
      .join("");

    const subjectRows = subjectChartData
      .map(
        (item) =>
          `<tr><td>${sanitizeHtml(item.subject)}</td><td>${sanitizeHtml(
            SCORE_FORMATTER.format(item.averageScore)
          )}</td></tr>`
      )
      .join("");

    popup.document.write(`
      <html lang="vi">
        <head>
          <title>Báo cáo tổng hợp</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #1e2f5a; }
            h1, h2 { margin: 0 0 12px 0; }
            ul { margin: 0 0 20px 0; padding-left: 18px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #dce5f7; padding: 8px; text-align: left; }
            th { background: #f5f8ff; }
          </style>
        </head>
        <body>
          <h1>Báo cáo tổng hợp</h1>
          <p>Năm học: ${sanitizeHtml(filters.schoolYear)} - Học kỳ: ${sanitizeHtml(filters.term)}</p>
          <h2>Thống kê nhanh</h2>
          <ul>${summaryHtml}</ul>
          <h2>Điểm trung bình theo môn (${sanitizeHtml(subjectScopeLabel)})</h2>
          <table>
            <thead><tr><th>Môn học</th><th>Điểm TB</th></tr></thead>
            <tbody>${subjectRows}</tbody>
          </table>
        </body>
      </html>
    `);

    popup.document.close();
    popup.focus();
    popup.print();
  };

  const comparisonSummary = useMemo(() => {
    if (!comparisonData) {
      return null;
    }

    const scoreDiff = comparisonData.hk2.summary.schoolAverageScore - comparisonData.hk1.summary.schoolAverageScore;
    const attendanceDiff = comparisonData.hk2.summary.attendanceRate - comparisonData.hk1.summary.attendanceRate;
    const revenueDiff = comparisonData.hk2.summary.totalRevenue - comparisonData.hk1.summary.totalRevenue;
    const netDiff = comparisonData.hk2.summary.totalAfterExpense - comparisonData.hk1.summary.totalAfterExpense;

    return {
      scoreDiff,
      attendanceDiff,
      revenueDiff,
      netDiff,
    };
  }, [comparisonData]);

  const academicComparisonMetrics = useMemo(() => {
    if (!comparisonData?.metrics) return [];
    return comparisonData.metrics.filter((item) => item.metricType !== "money-b");
  }, [comparisonData]);

  const financeComparisonMetrics = useMemo(() => {
    if (!comparisonData?.metrics) return [];
    return comparisonData.metrics.filter((item) => item.metricType === "money-b");
  }, [comparisonData]);

  const teacherList = reportData?.teacherSubjectAnalysis || [];

  useEffect(() => {
    if (!teacherList.length) {
      setSelectedTeacherForTable("all");
      return;
    }

    if (filters.teacherId !== "all") {
      setSelectedTeacherForTable(filters.teacherId);
      return;
    }

    if (selectedTeacherForTable === "all") {
      setSelectedTeacherForTable(teacherList[0].teacherId);
    }
  }, [filters.teacherId, selectedTeacherForTable, teacherList]);

  useEffect(() => {
    if (!gradeList.length) {
      setSelectedGrade("all");
      return;
    }

    if (selectedGrade === "all") {
      setSelectedGrade(gradeList[0].grade);
    }
  }, [gradeList, selectedGrade]);

  useEffect(() => {
    if (selectedSubjectScope === "all") {
      return;
    }

    const hasSelectedScope = gradeList.some((item) => item.grade === selectedSubjectScope);
    if (!hasSelectedScope) {
      setSelectedSubjectScope("all");
    }
  }, [gradeList, selectedSubjectScope]);

  const selectedTeacherData = teacherList.find(
    (item) => item.teacherId === selectedTeacherForTable
  );

  const teacherClassRows = selectedTeacherData
    ? selectedTeacherData.assignedClasses
        .filter(
          (item) => selectedTeacherClass === "all" || item.classId === selectedTeacherClass
        )
        .map((item) => ({
          ...item,
          classMembers: item.classMembers || DEMO_CLASS_MEMBERS,
          homeroomTeacher:
            item.homeroomTeacher || HOMEROOM_TEACHER_BY_CLASS[item.classId] || "Chưa cập nhật",
        }))
    : [];

  const gradeAttendanceRows = useMemo(() => {
    const schoolAttendance = Number(reportData?.summary?.attendanceRate) || 95;
    const totalStudents = Number(reportData?.summary?.totalStudents) || 1200;

    return gradeList.map((item, index) => {
      const presentRate = Math.max(88, Math.min(99, schoolAttendance - 0.7 + index * 0.35));
      const studentEstimate = Math.max(1, Math.round(totalStudents / Math.max(1, gradeList.length)));
      const breakdown = buildAttendanceBreakdown(presentRate, studentEstimate, index);

      return {
        ...item,
        attendance: breakdown,
      };
    });
  }, [gradeList, reportData]);

  const selectedGradeData = gradeList.find((item) => item.grade === selectedGrade);

  const gradeClassRows = useMemo(() => {
    if (!selectedGradeData) {
      return [];
    }

    const selectedGradeAttendance = gradeAttendanceRows.find((item) => item.grade === selectedGradeData.grade);
    const basePresentRate = selectedGradeAttendance?.attendance?.presentRate ?? 95;
    const totalRequiredDays = filters.term === "ALL" ? 180 : 90;

    return selectedGradeData.classes.map((classItem, index) => {
      const classPresentRate = Math.max(87, Math.min(99, basePresentRate + (index % 2 === 0 ? 0.4 : -0.4)));
      const attendance = buildAttendanceBreakdown(classPresentRate, 40, index);
      const attendanceDays = buildAttendanceDays(attendance, totalRequiredDays);
      const classMembers = (classItem.classMembers || DEMO_CLASS_MEMBERS).map((member, memberIndex) => ({
        ...member,
        averageScore: getMemberAverageScore(member, classItem.averageScore),
        attendanceDays: getMemberAttendanceDays(member, memberIndex, totalRequiredDays),
      }));

      return {
        ...classItem,
        attendance,
        attendanceDays,
        classMembers,
        homeroomTeacher:
          classItem.homeroomTeacher || HOMEROOM_TEACHER_BY_CLASS[classItem.classId] || "Chưa cập nhật",
      };
    });
  }, [filters.term, gradeAttendanceRows, selectedGradeData]);

  const subjectTooltipFormatter = (value) => [
    SCORE_FORMATTER.format(value),
    `Điểm trung bình (${subjectScopeLabel})`,
  ];
  const attendanceTooltipFormatter = (value, name) => [
    `${PERCENT_FORMATTER.format(value)}%`,
    name,
  ];
  const financeTooltipFormatter = (value, name) => [
    `${formatCompactMoney(value)} (${CURRENCY_FORMATTER.format(value)})`,
    name,
  ];
  const compareTooltipFormatter = (value, name, payload) => {
    const label = name === "hk1" ? "Học kỳ 1" : "Học kỳ 2";
    const metricType = payload?.payload?.metricType;

    if (metricType === "percent") {
      return [`${PERCENT_FORMATTER.format(value)}%`, label];
    }

    if (metricType === "money-b") {
      return [`${PERCENT_FORMATTER.format(value)} tỷ`, label];
    }

    return [SCORE_FORMATTER.format(value), label];
  };

  return (
    <div className="admin-reports">
      <div className="admin-reports__header">
        <h2>Báo cáo tổng hợp</h2>
        <ExportReportSection
          isVisible={!isLoading && !!reportData}
          isFloating={isExportFloating}
          onExportPdf={handleExportPdf}
        />
      </div>

      <div className="admin-reports__content">
        <Card title="Bộ lọc dữ liệu">
          <div className="admin-reports__filters">
            <div className="admin-reports__year-control">
              <span className="admin-reports__year-label">Năm học</span>
              <div className="admin-reports__year-input-wrapper">
                <button
                  type="button"
                  className="admin-reports__year-arrow-btn"
                  onClick={() => handleYearArrow("prev")}
                  disabled={!canGoPrevYear}
                >
                  ◀
                </button>
                <input
                  type="text"
                  value={filters.schoolYear}
                  readOnly
                  className="admin-reports__year-input-readonly"
                />
                <button
                  type="button"
                  className="admin-reports__year-arrow-btn"
                  onClick={() => handleYearArrow("next")}
                  disabled={!canGoNextYear}
                >
                  ▶
                </button>
              </div>
            </div>
            <Select
              label="Học kỳ"
              name="term"
              value={filters.term}
              variant="custom"
              options={[
                { value: "HK1", label: "Học kỳ 1" },
                { value: "HK2", label: "Học kỳ 2" },
                { value: "ALL", label: "Cả năm" },
              ]}
              onChange={handleFilterChange}
            />
            <Select
              label="Lớp"
              name="classId"
              value={filters.classId}
              options={filterOptions.classes}
              onChange={handleFilterChange}
              variant="custom"
              searchable
              searchPlaceholder="Tìm lớp..."
            />
            <Select
              label="Giáo viên"
              name="teacherId"
              value={filters.teacherId}
              options={filterOptions.teachers}
              onChange={handleFilterChange}
              variant="custom"
              searchable
              searchPlaceholder="Tìm giáo viên..."
            />
          </div>
        </Card>

        <AcademicReportSection
          error={error}
          isLoading={isLoading}
          reportData={reportData}
          onClearError={() => setError("")}
          summaryCards={summaryCards}
          academicChartData={academicChartData}
          onAcademicClick={handleAcademicClick}
          subjectScopeLabel={subjectScopeLabel}
          selectedSubjectScope={selectedSubjectScope}
          onSubjectScopeChange={(event) => setSelectedSubjectScope(event.target.value)}
          subjectScopeOptions={subjectScopeOptions}
          isSubjectScopeDisabled={filters.classId !== "all"}
          subjectChartData={subjectChartData}
          onSubjectClick={handleSubjectClick}
          subjectTooltipFormatter={subjectTooltipFormatter}
          attendanceChartData={attendanceChartData}
          onAttendanceClick={handleAttendanceClick}
          attendanceTooltipFormatter={attendanceTooltipFormatter}
          financeByGrade={reportData?.financeByGrade || []}
          onFinanceClick={handleFinanceClick}
          financeTooltipFormatter={financeTooltipFormatter}
          formatCompactMoney={formatCompactMoney}
        />

        {!isLoading && reportData ? (
          <>

            <div className="admin-reports__section admin-reports__section--teacher">
              <TeacherProgressReportSection
                teacherList={teacherList}
                selectedTeacherForTable={selectedTeacherForTable}
                onTeacherChange={(event) => {
                  setSelectedTeacherForTable(event.target.value);
                  setSelectedTeacherClass("all");
                }}
                selectedTeacherClass={selectedTeacherClass}
                onTeacherClassChange={(event) => setSelectedTeacherClass(event.target.value)}
                selectedTeacherData={selectedTeacherData}
                teacherClassRows={teacherClassRows}
                expandedTeacherClasses={expandedTeacherClasses}
                onToggleTeacherClass={(classId) =>
                  setExpandedTeacherClasses((prev) => ({
                    ...prev,
                    [classId]: !prev[classId],
                  }))
                }
                scoreFormatter={SCORE_FORMATTER}
              />
            </div>

            <div className="admin-reports__section admin-reports__section--grade">
              <AttendanceReportSection
                gradeAttendanceRows={gradeAttendanceRows}
                scoreFormatter={SCORE_FORMATTER}
                percentFormatter={PERCENT_FORMATTER}
                selectedGrade={selectedGrade}
                onGradeChange={(event) => setSelectedGrade(event.target.value)}
                gradeList={gradeList}
                selectedGradeData={selectedGradeData}
                gradeClassRows={gradeClassRows}
                expandedGradeClasses={expandedGradeClasses}
                onToggleGradeClass={(classId) =>
                  setExpandedGradeClasses((prev) => ({
                    ...prev,
                    [classId]: !prev[classId],
                  }))
                }
              />
            </div>

            <div className="admin-reports__section admin-reports__section--comparison">
              <QuizExamReportSection
                isCompareLoading={isCompareLoading}
                comparisonSummary={comparisonSummary}
                scoreFormatter={SCORE_FORMATTER}
                percentFormatter={PERCENT_FORMATTER}
                currencyFormatter={CURRENCY_FORMATTER}
                academicComparisonMetrics={academicComparisonMetrics}
                financeComparisonMetrics={financeComparisonMetrics}
                compareTooltipFormatter={compareTooltipFormatter}
              />
            </div>

            {detailView ? (
              <div className="admin-reports__section admin-reports__section--detail">
                <Card
                  title="Chi tiết khi click chart"
                  actions={
                    <Button variant="ghost" size="sm" onClick={() => setDetailView(null)}>
                      Đóng
                    </Button>
                  }
                >
                  <h4 className="admin-reports__detail-title">{detailView.title}</h4>
                  <div className="admin-reports__detail-list">
                    {detailView.rows.map((row) => (
                      <div key={row.label} className="admin-reports__detail-row">
                        <span>{row.label}</span>
                        <strong>{row.value}</strong>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            ) : null}

          </>
        ) : null}
      </div>
    </div>
  );
};

export default AdminReports;