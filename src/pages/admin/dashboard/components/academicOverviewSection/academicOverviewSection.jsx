import "./academicOverviewSection.css";
import Select from "../../../../../components/ui/Select/Select";
import { useMemo, useState } from "react";

const AcademicOverviewSection = () => {
  const [selectedGrade, setSelectedGrade] = useState("all");

  const gradeOptions = [
    { value: "all", label: "Tất cả khối" },
    { value: "10", label: "Khối 10" },
    { value: "11", label: "Khối 11" },
    { value: "12", label: "Khối 12" },
  ];

  const academicByGrade = {
    all: { excellent: 42, good: 38, average: 15, weak: 5 },
    10: { excellent: 39, good: 40, average: 16, weak: 5 },
    11: { excellent: 43, good: 36, average: 16, weak: 5 },
    12: { excellent: 45, good: 35, average: 14, weak: 6 },
  };

  const academicData = academicByGrade[selectedGrade] || academicByGrade.all;

  const donutStyle = useMemo(() => {
    const excellentEnd = academicData.excellent;
    const goodEnd = excellentEnd + academicData.good;
    const averageEnd = goodEnd + academicData.average;

    return {
      background: `conic-gradient(
        #2f57b8 0% ${excellentEnd}%,
        #4d74cc ${excellentEnd}% ${goodEnd}%,
        #7e9ce0 ${goodEnd}% ${averageEnd}%,
        #b2c4ef ${averageEnd}% 100%
      )`,
    };
  }, [academicData]);

  return (
    <div className="admin-dashboard__card admin-dashboard__card--donut admin-dashboard__academic-overview-section">
      <div className="admin-dashboard__card-header">
        <h3>Tổng quan học lực</h3>
        <Select
          value={selectedGrade}
          onChange={(event) => setSelectedGrade(event.target.value)}
          options={gradeOptions}
          variant="custom"
          className="admin-dashboard__academic-grade-select"
          aria-label="Chọn khối học lực"
        />
      </div>

      <div className="admin-dashboard__donut-container">
        <div className="admin-dashboard__academic-donut-wrap">
          <div className="admin-dashboard__donut" style={donutStyle}></div>
        </div>
        <div className="admin-dashboard__legend-grid">
          <div><span className="admin-dashboard__dot admin-dashboard__dot--blue"></span> Giỏi: {academicData.excellent}%</div>
          <div><span className="admin-dashboard__dot admin-dashboard__dot--green"></span> Khá: {academicData.good}%</div>
          <div><span className="admin-dashboard__dot admin-dashboard__dot--yellow"></span> Trung bình: {academicData.average}%</div>
          <div><span className="admin-dashboard__dot admin-dashboard__dot--red"></span> Yếu: {academicData.weak}%</div>
        </div>
      </div>
    </div>
  );
};

export default AcademicOverviewSection;
