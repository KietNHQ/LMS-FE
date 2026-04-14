import "./AdminDashboard.css";
import StatisticsCardsSection from "./components/statisticsCardsSection/statisticsCardsSection";
import EventCalendarSection from "./components/eventCalendarSection/eventCalendarSection";
import RevenueSection from "./components/revenueSection/revenueSection";
import ConductScoreSection from "./components/conductScoreSection/conductScoreSection";
import AcademicOverviewSection from "./components/academicOverviewSection/academicOverviewSection";
import { useEffect, useState } from "react";
import { adminDashboardService } from "../../../services/pages/admin/dashboard/dashboardService";
import { SchoolYearTermSelector } from "../../../components/common";
import {
  getCurrentSchoolYear,
  getCurrentTerm,
  shiftSchoolYear,
} from "../../../utils/dateUtils";

const createEmptyRevenueRows = () => [
  {
    grade: "10",
    gradeLabel: "Khối 10",
    studentCount: 0,
    paidStudentCount: 0,
    hk1Value: 0,
    hk2Value: 0,
  },
  {
    grade: "11",
    gradeLabel: "Khối 11",
    studentCount: 0,
    paidStudentCount: 0,
    hk1Value: 0,
    hk2Value: 0,
  },
  {
    grade: "12",
    gradeLabel: "Khối 12",
    studentCount: 0,
    paidStudentCount: 0,
    hk1Value: 0,
    hk2Value: 0,
  },
  {
    grade: "all",
    gradeLabel: "Cả 3 khối",
    studentCount: 0,
    paidStudentCount: 0,
    hk1Value: 0,
    hk2Value: 0,
  },
];

const AdminDashboard = () => {
  const adminName =
    localStorage.getItem("email")?.split("@")[0] || "Quản Trị Viên";

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
      return {
        startWeek: hk1Weeks + 1,
        endWeek: totalWeeks,
        maxWeekInTerm: hk2Weeks,
      };
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

    const termStart = term === "hk2" ? new Date(endYear, 0, 1) : new Date(startYear, 7, 1);
    const termEnd =
      term === "hk2"
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

  const [selectedSchoolYear, setSelectedSchoolYear] = useState(initialSchoolYear);
  const [selectedTerm, setSelectedTerm] = useState(initialTerm);
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedWeek, setSelectedWeek] = useState(() =>
    getCurrentWeekForSchoolYear(initialSchoolYear, initialTerm)
  );

  const [summaryStats, setSummaryStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
  });
  const [revenueComparisonData, setRevenueComparisonData] = useState(createEmptyRevenueRows);
  const [competitionData, setCompetitionData] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardOverview = async () => {
      try {
        const overview = await adminDashboardService.getDashboardOverview();
        if (!isMounted) {
          return;
        }
        setSummaryStats(overview.summary);
        setRevenueComparisonData(overview.revenueComparisonData);
      } catch (_error) {
        if (!isMounted) {
          return;
        }
        setRevenueComparisonData(createEmptyRevenueRows());
      }
    };

    fetchDashboardOverview();

    return () => {
      isMounted = false;
    };
  }, [selectedSchoolYear, selectedTerm]);

  useEffect(() => {
    let isMounted = true;

    const fetchConductRanking = async () => {
      try {
        const ranking = await adminDashboardService.getConductRanking({
          week: selectedWeek,
          schoolYear: selectedSchoolYear,
          term: selectedTerm,
        });
        if (isMounted) {
          setCompetitionData(ranking);
        }
      } catch (_error) {
        if (isMounted) {
          setCompetitionData([]);
        }
      }
    };

    fetchConductRanking();

    return () => {
      isMounted = false;
    };
  }, [selectedSchoolYear, selectedTerm, selectedWeek]);

  const maxWeek = getMaxWeekBySchoolYear(selectedSchoolYear);

  const handlePrevWeek = () => {
    setSelectedWeek((prevWeek) => Math.max(prevWeek - 1, 1));
  };

  const handleNextWeek = () => {
    setSelectedWeek((prevWeek) => Math.min(prevWeek + 1, maxWeek));
  };

  const handleYearArrow = (direction) => {
    const nextSchoolYear = shiftSchoolYear(selectedSchoolYear, direction);
    setSelectedSchoolYear(nextSchoolYear);
    setSelectedWeek(getCurrentWeekForSchoolYear(nextSchoolYear, selectedTerm));
  };

  const handleTermChange = (term) => {
    setSelectedTerm(term);
    setSelectedWeek(getCurrentWeekForSchoolYear(selectedSchoolYear, term));
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

  const termLabel = selectedTerm === "hk1" ? "Học kỳ 1" : "Học kỳ 2";
  const hasHk2Data = revenueComparisonData.some((item) => Number(item.hk2Value) > 0);

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

