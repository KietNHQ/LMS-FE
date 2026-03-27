import "./conductScoreSection.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import Select from "../../../../../components/ui/Select/Select";
import { useNavigate } from "react-router-dom";

const ConductScoreSection = ({
  selectedClass,
  setSelectedClass,
  selectedWeek,
  maxWeek,
  onPrevWeek,
  onNextWeek,
  classLabels,
  classScores,
}) => {
  const navigate = useNavigate();

  const chartData = classLabels.map((label, i) => ({
    class: label,
    score: classScores[i],
  }));

  const gradeOptions = [
    { value: "10", label: "Khối 10" },
    { value: "11", label: "Khối 11" },
    { value: "12", label: "Khối 12" },
    { value: "all", label: "Tất cả khối" },
  ];

  const handleTooltipFormatter = (value) => [
    `${Number(value).toFixed(1)} điểm`,
    "Điểm rèn luyện",
  ];

  const handleLabelFormatter = (label) => `Lớp ${label}`;

  const extractGradeFromClassName = (className = "") => {
    const match = `${className}`.match(/^\d+/);
    return match ? match[0] : "all";
  };

  const handleBarClick = (entry) => {
    const className = entry?.class;

    if (!className) {
      return;
    }

    const grade = extractGradeFromClassName(className);
    navigate(`/admin/classes?grade=${grade}&class=${encodeURIComponent(className)}`);
  };

  return (
    <div className="admin-dashboard__card admin-dashboard__card--big admin-dashboard__conduct-section">
      <div className="admin-dashboard__card-header">
        <h3>Điểm Rèn Luyện Theo Lớp</h3>
        <div className="admin-dashboard__filter-group">
          <Select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            options={gradeOptions}
            variant="custom"
            className="admin-dashboard__conduct-grade-select"
            aria-label="Chọn khối"
          />
          <div className="admin-dashboard__week-control" aria-label="Điều hướng tuần">
            <button
              type="button"
              className="admin-dashboard__week-arrow-btn"
              onClick={onPrevWeek}
              disabled={selectedWeek <= 1}
              title="Tuần trước"
              aria-label="Tuần trước"
            >
              ◀
            </button>
            <span className="admin-dashboard__week-display" aria-live="polite">
              Tuần {selectedWeek}/{maxWeek}
            </span>
            <button
              type="button"
              className="admin-dashboard__week-arrow-btn"
              onClick={onNextWeek}
              disabled={selectedWeek >= maxWeek}
              title="Tuần sau"
              aria-label="Tuần sau"
            >
              ▶
            </button>
          </div>
        </div>
      </div>

      <div className="admin-dashboard__conduct-chart-wrap">
        <ResponsiveContainer>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="class" />
            <YAxis domain={[0, 10]} />
            <Tooltip formatter={handleTooltipFormatter} labelFormatter={handleLabelFormatter} />
            <Bar
              dataKey="score"
              fill="var(--admin-color, #1e2f5a)"
              radius={[6, 6, 0, 0]}
              barSize={30}
              onClick={handleBarClick}
              cursor="pointer"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ConductScoreSection;

