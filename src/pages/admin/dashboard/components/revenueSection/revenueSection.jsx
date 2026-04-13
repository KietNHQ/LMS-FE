import "./revenueSection.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";

const RevenueSection = ({
  selectedSchoolYear,
  selectedTerm,
  termLabel,
  hasHk2Data,
  comparisonData,
  formatCompactMoney,
}) => {
  const navigate = useNavigate();

  const formatGradeTick = (value) => `${value || ""}`.replace(/,/g, " ").trim();

  const handleBarClick = (entry) => {
    if (!entry?.grade) {
      return;
    }
    navigate(`/admin/classes?grade=${entry.grade}`);
  };

  const isHk1Selected = selectedTerm === "hk1";
  const selectedDataKey = isHk1Selected ? "hk1Value" : "hk2Value";

  const customTooltip = ({ active, payload }) => {
    if (!active || !payload) return null;

    const data = payload[0]?.payload;
    if (!data) return null;

    const hk1Value = data.hk1Value || 0;
    const hk2Value = data.hk2Value || 0;

    return (
      <div className="revenue-tooltip">
        <p className="revenue-tooltip__label">{data.gradeLabel}</p>
        <p className="revenue-tooltip__current">
          <strong>Học kỳ 1:</strong> {formatCompactMoney(hk1Value)} ({data.studentCount} học sinh)
        </p>
        {hasHk2Data && (
          <p className="revenue-tooltip__previous">
            <strong>Học kỳ 2:</strong> {formatCompactMoney(hk2Value)} ({data.studentCount} học sinh)
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="admin-dashboard__card admin-dashboard__card--big admin-dashboard__revenue-section">
      <div className="admin-dashboard__card-header">
        <h3>Tổng doanh thu</h3>
        <span className="admin-dashboard__school-year">{selectedSchoolYear} • {termLabel}</span>
      </div>

      <div className="admin-dashboard__revenue-chart-wrap">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
          <BarChart
            data={comparisonData}
            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            barCategoryGap="26%"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="gradeLabel" tickFormatter={formatGradeTick} interval={0} />
            <YAxis tickFormatter={formatCompactMoney} />
            <Tooltip content={customTooltip} />
            <Bar
              dataKey="hk1Value"
              fill={isHk1Selected ? "var(--admin-color, #1e2f5a)" : "#cbd5e1"}
              radius={[6, 6, 0, 0]}
              onClick={handleBarClick}
              cursor="pointer"
              name="Học kỳ 1"
              barSize={34}
              className={`revenue-bar-series ${isHk1Selected ? "revenue-bar-series--active" : "revenue-bar-series--muted"}`}
              fillOpacity={isHk1Selected ? 1 : 0.5}
              isAnimationActive
              animationDuration={320}
              animationEasing="ease-in-out"
            />
            {hasHk2Data && (
              <Bar
                dataKey="hk2Value"
                fill={isHk1Selected ? "#cbd5e1" : "var(--admin-color, #1e2f5a)"}
                radius={[6, 6, 0, 0]}
                onClick={handleBarClick}
                cursor="pointer"
                name="Học kỳ 2"
                barSize={34}
                className={`revenue-bar-series ${!isHk1Selected ? "revenue-bar-series--active" : "revenue-bar-series--muted"}`}
                fillOpacity={!isHk1Selected ? 1 : 0.5}
                isAnimationActive
                animationDuration={320}
                animationEasing="ease-in-out"
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="admin-dashboard__revenue-stats">
        <div className="revenue-stat">
          <span className="revenue-stat__label">Tổng số học sinh {termLabel}:</span>
          <span className="revenue-stat__value">{comparisonData[comparisonData.length - 1]?.studentCount || 0}</span>
        </div>
        <div className="revenue-stat">
          <span className="revenue-stat__label">Tổng doanh thu {termLabel}:</span>
          <span className="revenue-stat__value revenue-stat__value--highlight">{formatCompactMoney(comparisonData[comparisonData.length - 1]?.[selectedDataKey] || 0)}</span>
        </div>
      </div>
    </div>
  );
};

export default RevenueSection;

