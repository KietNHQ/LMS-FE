import React from "react";
import "./conductScoreSection.css";
import Select from "../../../../../components/ui/Select/Select";
import { useNavigate } from "react-router-dom";
import { FiAward, FiTrendingUp, FiTrendingDown, FiMinus, FiStar } from "react-icons/fi";

const ConductScoreSection = ({
  selectedClass,
  setSelectedClass,
  selectedWeek,
  maxWeek,
  onPrevWeek,
  onNextWeek,
  competitionData = [],
}) => {
  const navigate = useNavigate();

  const extractGradeFromClassName = (className = "") => {
    const match = `${className}`.match(/^\d+/);
    return match ? match[0] : "all";
  };

  // Process data based on selection
  const getProcessedData = () => {
    const rawData = competitionData.map((item, i) => ({
      ...item, // includes id, label, score
      grade: extractGradeFromClassName(item.label),
      trend: item?.trend || (i % 3 === 0 ? "up" : i % 3 === 1 ? "down" : "stable"),
    }));

    if (selectedClass === "all") {
      // Group by grade and take top 3 of each
      const grades = ["10", "11", "12"];
      let result = [];
      grades.forEach(g => {
        const gradeTop3 = rawData
          .filter(item => item.grade === g)
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map((item, index) => ({ ...item, displayRank: index + 1, sectionHeader: index === 0 ? `Khối ${g}` : null }));
        result = [...result, ...gradeTop3];
      });
      return result;
    } else {
      // Filter by specific grade and show full list
      return rawData
        .filter(item => item.grade === selectedClass)
        .sort((a, b) => b.score - a.score)
        .map((item, index) => ({ ...item, displayRank: index + 1 }));
    }
  };

  const leaderboardData = getProcessedData();

  const gradeOptions = [
    { value: "all", label: "Tất cả khối" },
    { value: "10", label: "Khối 10" },
    { value: "11", label: "Khối 11" },
    { value: "12", label: "Khối 12" },
  ];

  const getRankIcon = (rank) => {
    if (rank === 1) return <FiAward className="rank-icon-gold" />;
    if (rank === 2) return <FiStar className="rank-icon-silver" />;
    if (rank === 3) return <FiStar className="rank-icon-bronze" />;
    return null;
  };

  const getTrendIcon = (trend) => {
    if (trend === "up") return <FiTrendingUp className="trend-up" />;
    if (trend === "down") return <FiTrendingDown className="trend-down" />;
    return <FiMinus className="trend-stable" />;
  };

  const handleRowClick = (classId) => {
    // Navigate directly to the class detail page
    navigate(`/admin/competition/${classId}`);
  };

  return (
    <div className="admin-dashboard__card admin-dashboard__card--big admin-dashboard__conduct-section leaderboard-card">
      <div className="admin-dashboard__card-header">
        <div className="header-title-stack">
          <h3>Bảng xếp hạng thi đua</h3>
          <span className="subtitle">Thứ hạng theo điểm thi đua tuần</span>
        </div>
        <div className="admin-dashboard__filter-group">
          <Select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            options={gradeOptions}
            variant="custom"
            className="admin-dashboard__conduct-grade-select"
          />
          <div className="admin-dashboard__week-control">
            <button className="admin-dashboard__week-arrow-btn" onClick={onPrevWeek} disabled={selectedWeek <= 1}>◀</button>
            <span className="admin-dashboard__week-display">Tuần {selectedWeek}/{maxWeek}</span>
            <button className="admin-dashboard__week-arrow-btn" onClick={onNextWeek} disabled={selectedWeek >= maxWeek}>▶</button>
          </div>
        </div>
      </div>

      <div className="leaderboard-container custom-scroll">
        <div className="leaderboard-list">
          {leaderboardData.map((item, index) => (
            <React.Fragment key={`${item.id}-${index}`}>
              {item.sectionHeader && (
                <div className="leaderboard-section-divider">
                  <span className="divider-label">{item.sectionHeader}</span>
                  <div className="divider-line"></div>
                  <span className="divider-tag">Top 3 xuất sắc</span>
                </div>
              )}
              <div 
                className={`leaderboard-item rank-${item.displayRank}`}
                onClick={() => handleRowClick(item.id)}
              >
                <div className="leaderboard-rank-col">
                  <span className="rank-number">{item.displayRank}</span>
                  {getRankIcon(item.displayRank)}
                </div>
                <div className="leaderboard-info-col">
                  <span className="class-name">Lớp {item.label}</span>
                  <span className="teacher-name">{item.teacherName || "Thầy/Cô phụ trách"}</span>
                </div>
                <div className="leaderboard-trend-col">
                  {getTrendIcon(item.trend)}
                </div>
                <div className="leaderboard-score-col">
                  <span className="score-label">Điểm số</span>
                  <span className="score-value">{item.score.toFixed(1)}</span>
                </div>
              </div>
            </React.Fragment>
          ))}
          {leaderboardData.length === 0 && (
            <div className="empty-state">Không có dữ liệu hiển thị</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConductScoreSection;
