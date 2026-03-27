import "./AdminDashboard.css";
import StatisticsCardsSection from "./components/statisticsCardsSection/statisticsCardsSection";
import TuitionPricingSection from "./components/tuitionPricingSection/tuitionPricingSection";
import RevenueSection from "./components/revenueSection/revenueSection";
import ConductScoreSection from "./components/conductScoreSection/conductScoreSection";
import AcademicOverviewSection from "./components/academicOverviewSection/academicOverviewSection";
import { useState } from "react";
import initialClasses from "../classes/data/initialClasses";

const AdminDashboard = () => {
  const defaultTuitionTemplate = {
    hk1: { "10": 5000000, "11": 5200000, "12": 5500000 },
    hk2: { "10": 5300000, "11": 5500000, "12": 5800000 },
  };

  const getCurrentSchoolYear = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    if (currentMonth < 8) {
      return `${currentYear - 1}-${currentYear}`;
    }

    return `${currentYear}-${currentYear + 1}`;
  };

  const getCurrentTerm = () => {
    const currentMonth = new Date().getMonth() + 1;

    // HK1 thường kéo dài từ tháng 8 đến tháng 12, HK2 từ tháng 1 đến tháng 5.
    // Tháng 6-7 là giai đoạn cuối năm học nên mặc định vẫn giữ HK2.
    if (currentMonth >= 8 && currentMonth <= 12) {
      return "hk1";
    }

    return "hk2";
  };

  const cloneYearTuition = (yearData) => ({
    hk1: { ...yearData.hk1 },
    hk2: { ...yearData.hk2 },
  });

  const shiftSchoolYear = (yearRange, direction) => {
    const [startRaw, endRaw] = yearRange.split("-");
    const start = Number(startRaw);
    const end = Number(endRaw);

    if (!Number.isFinite(start) || !Number.isFinite(end)) {
      return yearRange;
    }

    const delta = direction === "next" ? 1 : -1;
    return `${start + delta}-${end + delta}`;
  };

  const initialSchoolYear = getCurrentSchoolYear();
  const initialTerm = getCurrentTerm();

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
  const [selectedWeek, setSelectedWeek] = useState(1);

  const getMaxWeekBySchoolYear = (schoolYear) => {
    const customWeekLimitByYear = {
      "2024-2025": 35,
      "2025-2026": 35,
    };

    return customWeekLimitByYear[schoolYear] || 35;
  };

  const maxWeek = getMaxWeekBySchoolYear(selectedSchoolYear);

  const handlePrevWeek = () => {
    setSelectedWeek((prevWeek) => Math.max(prevWeek - 1, 1));
  };

  const handleNextWeek = () => {
    setSelectedWeek((prevWeek) => Math.min(prevWeek + 1, maxWeek));
  };

  // ===== DATA BAR CHART - Điểm rèn luyện theo lớp =====
  const classLabels = ["10A1","10A2","10A3","12A1","11A2","11A1","12A1"];
  const classScores = [8.2, 7.5, 7.8, 8.9, 8.1, 7.2, 6.8];

  // ===== HỌC PHÍ THEO NĂM HỌC / HỌC KỲ / KHỐI =====
  const [tuitionByYearTerm, setTuitionByYearTerm] = useState(createInitialTuitionMap);

  const handleYearArrow = (direction) => {
    const nextSchoolYear = shiftSchoolYear(selectedSchoolYear, direction);
    const nextMaxWeek = getMaxWeekBySchoolYear(nextSchoolYear);

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
    setSelectedWeek((prevWeek) => Math.min(Math.max(prevWeek, 1), nextMaxWeek));
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

  const handleUpdateTuition = (grade, newValue) => {
    setTuitionByYearTerm((prev) => ({
      ...prev,
      [selectedSchoolYear]: {
        ...(prev[selectedSchoolYear] || defaultTuitionTemplate),
        [selectedTerm]: {
          ...((prev[selectedSchoolYear] && prev[selectedSchoolYear][selectedTerm]) || defaultTuitionTemplate[selectedTerm]),
          [grade]: newValue,
        },
      },
    }));
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

  const revenueByGrade = ["10", "11", "12"].map((grade) => {
    const studentCount = studentCountByGrade[grade] || 0;
    const tuitionPerStudent = selectedTuitionData[grade] || 0;

    return {
      grade,
      gradeLabel: `Khối ${grade}`,
      studentCount,
      value: tuitionPerStudent * studentCount,
    };
  });

  const revenueSummary = revenueByGrade.reduce(
    (accumulator, item) => ({
      studentCount: accumulator.studentCount + item.studentCount,
      value: accumulator.value + item.value,
    }),
    { studentCount: 0, value: 0 }
  );

  const revenueData = [
    ...revenueByGrade,
    {
      grade: "all",
      gradeLabel: "Cả 3 khối",
      studentCount: revenueSummary.studentCount,
      value: revenueSummary.value,
    },
  ];

  const termLabel = selectedTerm === "hk1" ? "Học kỳ 1" : "Học kỳ 2";

  const revenueTooltipFormatter = (value, _name, payload) => {
    const studentCount = payload?.payload?.studentCount || 0;
    return [
      `${formatCompactMoney(value)} (${formatCurrency(value)})`,
      `Doanh thu ${termLabel} (${studentCount} học sinh)`,
    ];
  };

  return (
    <div className="admin-dashboard">

      <div className="admin-dashboard__header">
        <div className="admin-dashboard__title-row">
          <h2 className="admin-dashboard__title">Xin chào, Quản Trị Viên</h2>

          <div className="admin-dashboard__header-controls">
            <div className="admin-dashboard__year-control">
              <span className="admin-dashboard__header-meta">Năm học</span>
              <div className="admin-dashboard__year-input-wrapper">
                <button
                  type="button"
                  className="admin-dashboard__year-arrow-btn"
                  onClick={() => handleYearArrow("prev")}
                  title="Năm trước"
                  aria-label="Năm trước"
                >
                  ◀
                </button>
                <input
                  type="text"
                  value={selectedSchoolYear}
                  readOnly
                  className="admin-dashboard__year-input-readonly"
                  aria-label="Năm học đang chọn"
                />
                <button
                  type="button"
                  className="admin-dashboard__year-arrow-btn"
                  onClick={() => handleYearArrow("next")}
                  title="Năm sau"
                  aria-label="Năm sau"
                >
                  ▶
                </button>
              </div>
            </div>

            <div className="admin-dashboard__term-control">
              <span className="admin-dashboard__header-meta">Học kỳ</span>
              <div className="admin-dashboard__term-toggle">
                <button
                  type="button"
                  className={`admin-dashboard__term-btn ${selectedTerm === "hk1" ? "is-active" : ""}`}
                  onClick={() => setSelectedTerm("hk1")}
                >
                  Học kỳ 1
                </button>
                <button
                  type="button"
                  className={`admin-dashboard__term-btn ${selectedTerm === "hk2" ? "is-active" : ""}`}
                  onClick={() => setSelectedTerm("hk2")}
                >
                  Học kỳ 2
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <StatisticsCardsSection />

      <div className="admin-dashboard__matrix">
        <div className="admin-dashboard__slot admin-dashboard__slot--revenue">
          <RevenueSection
            selectedSchoolYear={selectedSchoolYear}
            termLabel={termLabel}
            revenueData={revenueData}
            formatCompactMoney={formatCompactMoney}
            revenueTooltipFormatter={revenueTooltipFormatter}
          />
        </div>

        <div className="admin-dashboard__slot admin-dashboard__slot--pricing">
          <TuitionPricingSection
            selectedSchoolYear={selectedSchoolYear}
            selectedTerm={selectedTerm}
            tuitionData={selectedTuitionData}
            onUpdateTuition={handleUpdateTuition}
          />
        </div>

        <div className="admin-dashboard__slot admin-dashboard__slot--conduct">
          <ConductScoreSection
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
            selectedWeek={selectedWeek}
            maxWeek={maxWeek}
            onPrevWeek={handlePrevWeek}
            onNextWeek={handleNextWeek}
            classLabels={classLabels}
            classScores={classScores}
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