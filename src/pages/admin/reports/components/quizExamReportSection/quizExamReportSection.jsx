import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "../../../../../components/ui";
import "./quizExamReportSection.css";

const QuizExamReportSection = ({
  isCompareLoading,
  comparisonSummary,
  scoreFormatter,
  percentFormatter,
  currencyFormatter,
  academicComparisonMetrics,
  financeComparisonMetrics,
  compareTooltipFormatter,
}) => {
  return (
    <Card title="So sánh học kỳ 1 và học kỳ 2">
      {isCompareLoading ? (
        <p className="admin-reports__loading">Đang tải dữ liệu so sánh...</p>
      ) : null}

      {comparisonSummary ? (
        <>
          <div className="admin-reports__comparison-grid">
            <div className="admin-reports__comparison-item">
              <span>Chênh lệch điểm TB</span>
              <strong>{`${comparisonSummary.scoreDiff >= 0 ? "+" : ""}${scoreFormatter.format(
                comparisonSummary.scoreDiff
              )}`}</strong>
            </div>
            <div className="admin-reports__comparison-item">
              <span>Chênh lệch chuyên cần</span>
              <strong>{`${comparisonSummary.attendanceDiff >= 0 ? "+" : ""}${percentFormatter.format(
                comparisonSummary.attendanceDiff
              )}%`}</strong>
            </div>
            <div className="admin-reports__comparison-item">
              <span>Chênh lệch doanh thu</span>
              <strong>{`${comparisonSummary.revenueDiff >= 0 ? "+" : ""}${currencyFormatter.format(
                comparisonSummary.revenueDiff
              )}`}</strong>
            </div>
            <div className="admin-reports__comparison-item">
              <span>Chênh lệch sau chi</span>
              <strong>{`${comparisonSummary.netDiff >= 0 ? "+" : ""}${currencyFormatter.format(
                comparisonSummary.netDiff
              )}`}</strong>
            </div>
          </div>

          <div className="admin-reports__comparison-chart-wrap">
            <h4 style={{ margin: "0 0 10px", fontSize: "0.95rem", color: "#203263" }}>Học vụ</h4>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={academicComparisonMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis
                  tickFormatter={(value) => {
                    const firstMetric = academicComparisonMetrics[0];
                    if (firstMetric?.metric.includes("Điểm")) {
                      return `${value.toFixed(1)}`;
                    }
                    return `${value}%`;
                  }}
                />
                <Tooltip formatter={compareTooltipFormatter} />
                <Legend formatter={(value) => (value === "hk1" ? "Học kỳ 1" : "Học kỳ 2")} />
                <Bar dataKey="hk1" fill="#6366f1" name="hk1" />
                <Bar dataKey="hk2" fill="#f59e0b" name="hk2" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="admin-reports__comparison-chart-wrap">
            <h4 style={{ margin: "0 0 10px", fontSize: "0.95rem", color: "#203263" }}>Tài chính</h4>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={financeComparisonMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis tickFormatter={(value) => `${value} tỷ`} />
                <Tooltip formatter={compareTooltipFormatter} />
                <Legend formatter={(value) => (value === "hk1" ? "Học kỳ 1" : "Học kỳ 2")} />
                <Bar dataKey="hk1" fill="#3b82f6" name="hk1" />
                <Bar dataKey="hk2" fill="#22c55e" name="hk2" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : null}
    </Card>
  );
};

export default QuizExamReportSection;