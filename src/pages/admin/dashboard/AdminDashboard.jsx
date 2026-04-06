import "./AdminDashboard.css";
import StatisticsCardsSection from "./components/statisticsCardsSection/statisticsCardsSection";
import EventCalendarSection from "./components/eventCalendarSection/eventCalendarSection";
import RevenueSection from "./components/revenueSection/revenueSection";
import ConductScoreSection from "./components/conductScoreSection/conductScoreSection";
import AcademicOverviewSection from "./components/academicOverviewSection/academicOverviewSection";
import { useEffect, useState } from "react";
import initialClasses from "../classes/data/initialClasses";
import { adminDashboardService } from "../../../services/pages/admin/dashboard/dashboardService";
import { SchoolYearTermSelector } from "../../../components/common";
import { getCurrentSchoolYear, getCurrentTerm, shiftSchoolYear } from "../../../utils/dateUtils";

const AdminDashboard = () => {
  const adminName = localStorage.getItem('email')?.split('@')[0] || 'Quản Trị Viên';
  const defaultTuitionTemplate = {
    hk1: { "10": 5000000, "11": 5200000, "12": 5500000 },
    hk2: { "10": 5300000, "11": 5500000, "12": 5800000 },
  };

  const cloneYearTuition = (yearData) => ({
    hk1: { ...yearData.hk1 },
    hk2: { ...yearData.hk2 },
  });

  const initialSchoolYear = getCurrentSchoolYear();
  const initialTerm = getCurrentTerm();

  const getMaxWeekBySchoolYear = (schoolYear) => {
    const customWeekLimitByYear = {
      "2024-2025": 35,
      "2025-2026": 35,
    };

    return customWeekLimitByYear[schoolYear] || 35;
  };

  const getTermWeekRange = (schoolYear, term) => {
    const totalWeeks = getMaxWeekBySchoolYear(schoolYear);
    const hk1Weeks = Math.ceil(totalWeeks / 2);
    const hk2Weeks = Math.max(totalWeeks - hk1Weeks, 1);

    if (term === "hk2") {
      return { startWeek: hk1Weeks + 1, endWeek: totalWeeks, maxWeekInTerm: hk2Weeks };
    }

    return { startWeek: 1, endWeek: hk1Weeks, maxWeekInTerm: hk1Weeks };
  };

  const getCurrentWeekForSchoolYear = (schoolYear, term) => {
    const [startRaw, endRaw] = `${schoolYear}`.split("-");
    const startYear = Number(startRaw);
    const endYear = Number(endRaw);
    const { startWeek, endWeek, maxWeekInTerm } = getTermWeekRange(schoolYear, term);

    if (!Number.isFinite(startYear) || !Number.isFinite(endYear)) {
      return 1;
    }

    const termStart = term === "hk2"
      ? new Date(endYear, 0, 1)
      : new Date(startYear, 7, 1);
    const termEnd = term === "hk2"
      ? new Date(endYear, 4, 31, 23, 59, 59, 999)
      : new Date(startYear, 11, 31, 23, 59, 59, 999);
    const now = new Date();

    if (now < termStart) {
      return startWeek;
    }

    if (now > termEnd) {
      return endWeek;
    }

    const diffTime = now.getTime() - termStart.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const computedWeek = Math.floor(diffDays / 7) + 1;

    const weekInTerm = Math.min(Math.max(computedWeek, 1), maxWeekInTerm);
    const weekInSchoolYear = startWeek - 1 + weekInTerm;

    return Math.min(Math.max(weekInSchoolYear, startWeek), endWeek);
  };

  const createInitialTuitionMap = () => {
    const baseMap = {
      "2024-2025": {
        hk1: { "10": 5000000, "11": 5200000, "12": 5500000 },
        hk2: { "10": 5300000, "11": 5500000, "12": 5800000 },
      },
      "2025-2026": {
        hk1: { "10": 5200000, "11": 5400000, "12": 5700000 },
        hk2: { "10": 5500000, "11": 5700000, "12": 6000000 },
      },
    };

    if (!baseMap[initialSchoolYear]) {
      const fallbackYear = baseMap["2025-2026"] || defaultTuitionTemplate;
      baseMap[initialSchoolYear] = cloneYearTuition(fallbackYear);
    }

    return baseMap;
  };

  const [selectedSchoolYear, setSelectedSchoolYear] = useState(initialSchoolYear);
  const [selectedTerm, setSelectedTerm] = useState(initialTerm);
  const [selectedClass, setSelectedClass] = useState("10");
  const [selectedWeek, setSelectedWeek] = useState(() => getCurrentWeekForSchoolYear(initialSchoolYear, initialTerm));
  const [summaryStats, setSummaryStats] = useState({
    totalStudents: 8,
    totalTeachers: 4,
    totalClasses: 7,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchSummaryStats = async () => {
      try {
        const summary = await adminDashboardService.getDashboardSummary();
        if (isMounted) {
          setSummaryStats(summary);
        }
      } catch {
        // Keep current fallback stats if API request fails.
      }
    };

    fetchSummaryStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const maxWeek = getMaxWeekBySchoolYear(selectedSchoolYear);

  const handlePrevWeek = () => {
    setSelectedWeek((prevWeek) => Math.max(prevWeek - 1, 1));
  };

  const handleNextWeek = () => {
    setSelectedWeek((prevWeek) => Math.min(prevWeek + 1, maxWeek));
  };

  // ===== COMPETITION DATA - Điểm thi đua theo lớp =====
  const competitionData = [
    { id: 1, label: "10A1", score: 8.2 },
    { id: 2, label: "10A2", score: 7.5 },
    { id: 3, label: "10A3", score: 7.8 },
    { id: 4, label: "10A4", score: 6.5 },
    { id: 5, label: "10A5", score: 5.9 },
    { id: 6, label: "11A1", score: 8.5 },
    { id: 7, label: "11A2", score: 8.1 },
    { id: 8, label: "11A3", score: 7.2 },
    { id: 9, label: "11A4", score: 6.0 },
    { id: 10, label: "12A1", score: 8.9 },
    { id: 11, label: "12A2", score: 7.9 },
    { id: 12, label: "12A3", score: 6.8 },
  ];

  // ===== HỌC PHÍ THEO NĂM HỌC / HỌC KỲ / KHỐI =====
  const [tuitionByYearTerm, setTuitionByYearTerm] = useState(createInitialTuitionMap);

  const handleYearArrow = (direction) => {
    const nextSchoolYear = shiftSchoolYear(selectedSchoolYear, direction);

    setTuitionByYearTerm((prev) => {
      if (prev[nextSchoolYear]) {
        return prev;
      }

      const baseYearData = prev[selectedSchoolYear] || defaultTuitionTemplate;
      return {
        ...prev,
        [nextSchoolYear]: cloneYearTuition(baseYearData),
      };
    });

    setSelectedSchoolYear(nextSchoolYear);
    setSelectedWeek(getCurrentWeekForSchoolYear(nextSchoolYear, selectedTerm));
  };

  const handleTermChange = (term) => {
    setSelectedTerm(term);
    setSelectedWeek(getCurrentWeekForSchoolYear(selectedSchoolYear, term));
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatCompactMoney = (value) => {
    const absValue = Math.abs(Number(value) || 0);

    const normalize = (num) => {
      const rounded = num >= 100 ? Math.round(num) : Number(num.toFixed(1));
      return Number.isInteger(rounded)
        ? `${rounded}`
        : `${rounded}`.replace(".", ",");
    };

    if (absValue >= 1_000_000_000) {
      return `${normalize(absValue / 1_000_000_000)} tỷ`;
    }

    if (absValue >= 1_000_000) {
      return `${normalize(absValue / 1_000_000)}tr`;
    }

    if (absValue >= 1_000) {
      return `${normalize(absValue / 1_000)}k`;
    }

    return `${absValue}`;
  };


  const yearData = tuitionByYearTerm[selectedSchoolYear] || defaultTuitionTemplate;
  const selectedTuitionData = yearData[selectedTerm] || defaultTuitionTemplate[selectedTerm];

  const extractGradeNumber = (gradeValue = "") => {
    const match = `${gradeValue}`.match(/\d+/);
    return match ? match[0] : "";
  };

  const hasSelectedYearClassData = initialClasses.some(
    (classItem) => classItem.year === selectedSchoolYear
  );

  const classesForRevenue = hasSelectedYearClassData
    ? initialClasses.filter((classItem) => classItem.year === selectedSchoolYear)
    : initialClasses;

  const studentCountByGrade = classesForRevenue.reduce((accumulator, classItem) => {
    const gradeNumber = extractGradeNumber(classItem.grade);

    if (!gradeNumber) {
      return accumulator;
    }

    accumulator[gradeNumber] = (accumulator[gradeNumber] || 0) + (classItem.students || 0);
    return accumulator;
  }, {});

  const hk1TuitionData = yearData.hk1 || defaultTuitionTemplate.hk1;
  const hk2TuitionData = yearData.hk2 || defaultTuitionTemplate.hk2;

  const revenueComparisonData = ["10", "11", "12"].map((grade) => {
    const studentCount = studentCountByGrade[grade] || 0;
    const paidStudentCount = studentCount;

    return {
      grade,
      gradeLabel: `Khối ${grade}`,
      studentCount,
      paidStudentCount,
      hk1Value: (hk1TuitionData[grade] || 0) * studentCount,
      hk2Value: (hk2TuitionData[grade] || 0) * studentCount,
    };
  });

  const revenueSummary = revenueComparisonData.reduce(
    (accumulator, item) => ({
      studentCount: accumulator.studentCount + item.studentCount,
      paidStudentCount: accumulator.paidStudentCount + item.paidStudentCount,
      hk1Value: accumulator.hk1Value + item.hk1Value,
      hk2Value: accumulator.hk2Value + item.hk2Value,
    }),
    { studentCount: 0, paidStudentCount: 0, hk1Value: 0, hk2Value: 0 }
  );

  revenueComparisonData.push({
    grade: "all",
    gradeLabel: "Cả 3 khối",
    studentCount: revenueSummary.studentCount,
    paidStudentCount: revenueSummary.paidStudentCount,
    hk1Value: revenueSummary.hk1Value,
    hk2Value: revenueSummary.hk2Value,
  });

  const hasHk2Data = Object.values(hk2TuitionData).some((amount) => Number(amount) > 0);
  const termLabel = selectedTerm === "hk1" ? "Học kỳ 1" : "Học kỳ 2";

  return (
    <div className="admin-dashboard">

      <div className="admin-dashboard__header">
        <div className="admin-dashboard__title-row">
          <h2 className="admin-dashboard__title">Xin chào, {adminName}</h2>

          <div className="admin-dashboard__header-controls">
            <SchoolYearTermSelector
              selectedSchoolYear={selectedSchoolYear}
              selectedTerm={selectedTerm}
              onYearChange={handleYearArrow}
              onTermChange={handleTermChange}
            />
          </div>
        </div>
      </div>

      <StatisticsCardsSection
        totalStudents={summaryStats.totalStudents}
        totalTeachers={summaryStats.totalTeachers}
        totalClasses={summaryStats.totalClasses}
        selectedSchoolYear={selectedSchoolYear}
      />

      <div className="admin-dashboard__matrix">
        <div className="admin-dashboard__slot admin-dashboard__slot--revenue">
          <RevenueSection
            selectedSchoolYear={selectedSchoolYear}
            selectedTerm={selectedTerm}
            termLabel={termLabel}
            hasHk2Data={hasHk2Data}
            comparisonData={revenueComparisonData}
            formatCompactMoney={formatCompactMoney}
          />
        </div>

        <div className="admin-dashboard__slot admin-dashboard__slot--pricing">
          <EventCalendarSection />
        </div>

        <div className="admin-dashboard__slot admin-dashboard__slot--conduct">
          <ConductScoreSection
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
            selectedWeek={selectedWeek}
            maxWeek={maxWeek}
            onPrevWeek={handlePrevWeek}
            onNextWeek={handleNextWeek}
            competitionData={competitionData}
          />
        </div>

        <div className="admin-dashboard__slot admin-dashboard__slot--academic">
          <AcademicOverviewSection />
        </div>
      </div>


    </div>
  );
};

export default AdminDashboard;