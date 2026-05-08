import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Alert, Card, Select } from "../../../../../components/ui";
import "./academicReportSection.css";

const AcademicReportSection = ({
  error,
  isLoading,
  reportData,
  onClearError,
  summaryCards,
  academicChartData,
  onAcademicClick,
  subjectScopeLabel,
  selectedSubjectScope,
  onSubjectScopeChange,
  subjectScopeOptions,
  isSubjectScopeDisabled,
  subjectChartData,
  onSubjectClick,
  subjectTooltipFormatter,
  attendanceChartData,
  onAttendanceClick,
  attendanceTooltipFormatter,
  financeByGrade,
  onFinanceClick,
  financeTooltipFormatter,
  formatCompactMoney,
}) => {
  return (
    <>
      {error ? (
        <Alert
          type="error"
          title="Không tải được dữ liệu"
          message={error}
          onClose={onClearError}
        />
      ) : null}

      {isLoading ? (
        <Card>
          <p className="admin-reports__loading">Đang tải báo cáo...</p>
        </Card>
      ) : null}

      {!isLoading && reportData ? (
        <>
          <Card title="Thống kê nhanh">
            <div className="admin-reports__summary-grid">
              {summaryCards.map((item) => (
                <div key={item.title} className="admin-reports__summary-card">
                  <p className="admin-reports__summary-label">{item.title}</p>
                  <p className="admin-reports__summary-value">{item.value}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Biểu đồ tổng hợp">
            <div className="admin-reports__charts-grid">
              <div className="admin-reports__chart-item">
                <h4>Học lực</h4>
                <ResponsiveContainer width="100%" height={270}>
                  <PieChart>
                    <Pie
                      data={academicChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      onClick={onAcademicClick}
                      cursor="pointer"
                    />
                    <Tooltip
                      formatter={(value, _name, payload) => [
                        `${value} học sinh`,
                        `Mức ${payload?.payload?.name || ""}`,
                      ]}
                      labelFormatter={() => "Phân bố học lực"}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="admin-reports__chart-item">
                <div className="admin-reports__chart-header">
                  <h4>Điểm trung bình theo môn ({subjectScopeLabel})</h4>
                  <Select
                    label=""
                    className="admin-reports__chart-scope-select"
                    value={selectedSubjectScope}
                    onChange={onSubjectScopeChange}
                    options={subjectScopeOptions}
                    variant="custom"
                    disabled={isSubjectScopeDisabled}
                  />
                </div>
                <ResponsiveContainer width="100%" height={270}>
                  <BarChart
                    data={subjectChartData}
                    onClick={(state) => onSubjectClick(state?.activePayload?.[0]?.payload)}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip formatter={subjectTooltipFormatter} labelFormatter={(value) => `Môn: ${value}`} />
                    <Bar dataKey="averageScore" fill="#3557d4" cursor="pointer" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="admin-reports__chart-item">
                <h4>Chuyên cần (Đi học - Nghỉ học - Đi muộn)</h4>
                <ResponsiveContainer width="100%" height={270}>
                  <BarChart
                    data={attendanceChartData}
                    onClick={(state) => onAttendanceClick(state?.activePayload?.[0]?.payload)}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                    <Tooltip formatter={attendanceTooltipFormatter} labelFormatter={(value) => `Mốc: ${value}`} />
                    <Legend />
                    <Bar dataKey="presentRate" name="Đi học" stackId="attendance" fill="#0d9488" cursor="pointer" />
                    <Bar dataKey="lateRate" name="Đi muộn" stackId="attendance" fill="#f59e0b" cursor="pointer" />
                    <Bar dataKey="absentRate" name="Nghỉ học" stackId="attendance" fill="#ef4444" cursor="pointer" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="admin-reports__chart-item">
                <h4>Tài chính theo khối (Doanh thu - Chi tiêu - Sau chi)</h4>
                <ResponsiveContainer width="100%" height={270}>
                  <BarChart
                    data={financeByGrade}
                    onClick={(state) => onFinanceClick(state?.activePayload?.[0]?.payload)}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="grade" />
                    <YAxis tickFormatter={formatCompactMoney} />
                    <Tooltip formatter={financeTooltipFormatter} labelFormatter={(value) => `${value}`} />
                    <Legend />
                    <Bar dataKey="amount" fill="#3b82f6" name="Doanh thu" cursor="pointer" />
                    <Bar dataKey="expense" fill="#ef4444" name="Chi tiêu" cursor="pointer" />
                    <Bar dataKey="net" fill="#22c55e" name="Sau chi" cursor="pointer" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </>
      ) : null}
    </>
  );
};

export default AcademicReportSection;





