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
  termLabel,
  revenueData,
  formatCompactMoney,
  revenueTooltipFormatter,
}) => {
  const navigate = useNavigate();

  const formatGradeTick = (value) => `${value || ""}`.replace(/,/g, " ").trim();

  const handleBarClick = (entry) => {
    if (!entry?.grade) {
      return;
    }

    navigate(`/admin/classes?grade=${entry.grade}`);
  };

  return (
    <div className="admin-dashboard__card admin-dashboard__card--big admin-dashboard__revenue-section">
      <div className="admin-dashboard__card-header">
        <h3>Tổng doanh thu</h3>
        <span className="admin-dashboard__school-year">{selectedSchoolYear} • {termLabel}</span>
      </div>

      <div className="admin-dashboard__revenue-chart-wrap">
        <ResponsiveContainer>
          <BarChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="gradeLabel" tickFormatter={formatGradeTick} interval={0} />
            <YAxis tickFormatter={formatCompactMoney} />
            <Tooltip formatter={revenueTooltipFormatter} />
            <Bar
              dataKey="value"
              fill="var(--admin-color, #1e2f5a)"
              radius={[6, 6, 0, 0]}
              onClick={handleBarClick}
              cursor="pointer"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueSection;

