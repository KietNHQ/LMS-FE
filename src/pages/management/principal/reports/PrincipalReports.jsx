import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader, SchoolYearTermSelector } from "../../../../components/common";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { FiDownload, FiRefreshCw } from "react-icons/fi";
import "./PrincipalReports.css";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];
const GRADE_OPTIONS = [
  { value: "all", label: "Tất cả các khối" },
  { value: "10", label: "Khối 10" },
  { value: "11", label: "Khối 11" },
  { value: "12", label: "Khối 12" },
];

const REPORT_FIXTURE = {
  academicData: [
    { name: "Giỏi", value: 450 },
    { name: "Khá", value: 600 },
    { name: "Trung bình", value: 150 },
    { name: "Yếu", value: 50 },
  ],
  attendanceData: [
    { name: "Khối 10", "Đi đủ": 95, "Nghỉ có phép": 3, "Nghỉ không phép": 2 },
    { name: "Khối 11", "Đi đủ": 92, "Nghỉ có phép": 5, "Nghỉ không phép": 3 },
    { name: "Khối 12", "Đi đủ": 98, "Nghỉ có phép": 1, "Nghỉ không phép": 1 },
  ],
  financeData: [
    { month: "Tháng 8", "Doanh thu": 500000000 },
    { month: "Tháng 9", "Doanh thu": 800000000 },
    { month: "Tháng 10", "Doanh thu": 120000000 },
    { month: "Tháng 11", "Doanh thu": 50000000 },
  ],
};

function ReportCard({ title, status, errorMessage, onRetry, children, fullWidth = false }) {
  return (
    <section className={`report-card ${fullWidth ? "full-width" : ""}`} aria-live="polite">
      <h3>{title}</h3>

      {status === "loading" ? (
        <div className="report-card-state" role="status" aria-label="Đang tải dữ liệu">
          <div className="report-skeleton" />
        </div>
      ) : null}

      {status === "error" ? (
        <div className="report-card-state report-card-state--error" role="alert">
          <p>{errorMessage || "Không thể tải dữ liệu báo cáo."}</p>
          <button type="button" className="btn-retry" onClick={onRetry}>
            <FiRefreshCw /> Thử lại
          </button>
        </div>
      ) : null}

      {status === "empty" ? (
        <div className="report-card-state">
          <p>Không có dữ liệu cho bộ lọc đang chọn.</p>
        </div>
      ) : null}

      {status === "ready" ? <div className="chart-container">{children}</div> : null}
    </section>
  );
}

export default function PrincipalReports() {
  const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterGrade, setFilterGrade] = useState(searchParams.get("grade") || "all");
  const [reportStatus, setReportStatus] = useState("loading");
  const [reportData, setReportData] = useState(REPORT_FIXTURE);
  const [isExporting, setIsExporting] = useState(false);

  const termLabel = selectedTerm === "hk1" ? "Học kỳ 1" : "Học kỳ 2";

  useEffect(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("year", selectedSchoolYear);
      next.set("term", selectedTerm);
      next.set("grade", filterGrade);
      return next;
    });
  }, [selectedSchoolYear, selectedTerm, filterGrade, setSearchParams]);

  const syncReportData = useCallback(() => {
    try {
      setReportStatus("loading");

      setTimeout(() => {
        const attendanceData =
          filterGrade === "all"
            ? REPORT_FIXTURE.attendanceData
            : REPORT_FIXTURE.attendanceData.filter((item) => item.name.includes(filterGrade));

        const nextData = {
          academicData: REPORT_FIXTURE.academicData,
          attendanceData,
          financeData: REPORT_FIXTURE.financeData,
        };

        const isEmpty =
          nextData.academicData.length === 0 &&
          nextData.attendanceData.length === 0 &&
          nextData.financeData.length === 0;

        setReportData(nextData);
        setReportStatus(isEmpty ? "empty" : "ready");
      }, 350);
    } catch {
      setReportStatus("error");
    }
  }, [filterGrade]);

  useEffect(() => {
    syncReportData();
  }, [selectedSchoolYear, selectedTerm, syncReportData]);

  const filterSummary = useMemo(() => {
    const gradeLabel = GRADE_OPTIONS.find((item) => item.value === filterGrade)?.label || "Tất cả các khối";
    return [`Năm học ${selectedSchoolYear}`, termLabel, gradeLabel].join(" • ");
  }, [filterGrade, selectedSchoolYear, termLabel]);

  const handleExportExcel = () => {
    if (reportStatus !== "ready") {
      toast.info("Dữ liệu chưa sẵn sàng để xuất.");
      return;
    }

    try {
      setIsExporting(true);
      const wb = XLSX.utils.book_new();

      const wsMeta = XLSX.utils.json_to_sheet([
        { Truong: "THPT", "Năm học": selectedSchoolYear, "Học kỳ": termLabel, "Khối": filterSummary.split(" • ")[2] },
      ]);
      const wsAcademic = XLSX.utils.json_to_sheet(reportData.academicData);
      const wsAttendance = XLSX.utils.json_to_sheet(reportData.attendanceData);
      const wsFinance = XLSX.utils.json_to_sheet(reportData.financeData);

      XLSX.utils.book_append_sheet(wb, wsMeta, "Bộ lọc");
      XLSX.utils.book_append_sheet(wb, wsAcademic, "Học lực");
      XLSX.utils.book_append_sheet(wb, wsAttendance, "Chuyên cần");
      XLSX.utils.book_append_sheet(wb, wsFinance, "Học phí");

      XLSX.writeFile(wb, `BaoCao_Truong_${selectedSchoolYear}_${selectedTerm}_${filterGrade}.xlsx`);
      toast.success("Xuất file Excel thành công.");
    } catch {
      toast.error("Xuất file thất bại.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="principal-reports">
      <PageHeader
        title="Báo cáo thống kê"
        eyebrow="Phân tích dữ liệu vận hành toàn trường"
        actions={
          <SchoolYearTermSelector
            selectedSchoolYear={selectedSchoolYear}
            selectedTerm={selectedTerm}
            onYearChange={handleYearArrow}
            onTermChange={handleTermChange}
          />
        }
      />

      <div className="reports-actions-bar">
        <div className="report-filters">
          <label htmlFor="report-grade-filter" className="sr-only">
            Lọc theo khối
          </label>
          <select
            id="report-grade-filter"
            className="report-select"
            value={filterGrade}
            onChange={(event) => setFilterGrade(event.target.value)}
          >
            {GRADE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="report-filter-summary" role="status">
            {filterSummary}
          </span>
        </div>

        <button
          type="button"
          className="btn-export"
          onClick={handleExportExcel}
          disabled={isExporting || reportStatus !== "ready"}
          aria-busy={isExporting}
        >
          <FiDownload /> {isExporting ? "Đang xuất..." : "Xuất Excel"}
        </button>
      </div>

      <div className="reports-grid">
        <ReportCard title="Phân bố học lực" status={reportStatus} onRetry={syncReportData}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={reportData.academicData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {reportData.academicData.map((entry, index) => (
                  <Cell key={`${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </ReportCard>

        <ReportCard title="Tỷ lệ chuyên cần theo khối" status={reportStatus} onRetry={syncReportData}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reportData.attendanceData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="Đi đủ" stackId="a" fill="#10b981" />
              <Bar dataKey="Nghỉ có phép" stackId="a" fill="#f59e0b" />
              <Bar dataKey="Nghỉ không phép" stackId="a" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </ReportCard>

        <ReportCard title="Tiến độ thu học phí" status={reportStatus} onRetry={syncReportData} fullWidth>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={reportData.financeData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `${value / 1000000}Tr`} />
              <RechartsTooltip formatter={(value) => `${Number(value).toLocaleString("vi-VN")} VNĐ`} />
              <Legend />
              <Line type="monotone" dataKey="Doanh thu" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </ReportCard>
      </div>
    </div>
  );
}

