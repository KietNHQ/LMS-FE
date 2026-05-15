import { useEffect, useMemo, useState } from "react";
import "./ManagementReports.css";
import { Button, Card, Select } from "../../../components/ui";
import { 
  FiGrid, FiDollarSign, FiBookOpen, FiUserCheck, FiUsers, FiAward 
} from "react-icons/fi";

// Import new Tab components
import OverviewTab from "./tabs/OverviewTab";
import FinanceTab from "./tabs/FinanceTab";
import AcademicTab from "./tabs/AcademicTab";
import AttendanceTab from "./tabs/AttendanceTab";
import TeacherTab from "./tabs/TeacherTab";
import ClassReportTab from "./tabs/ClassReportTab";

import {
  fetchAdminReport,
  getReportFilterOptions,
} from "../../../services/pages/management/reports/reportService";

const CURRENCY_FORMATTER = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const PERCENT_FORMATTER = new Intl.NumberFormat("vi-VN", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const SCORE_FORMATTER = new Intl.NumberFormat("vi-VN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function getCurrentSchoolYear() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  return currentMonth < 8 ? `${currentYear - 1}-${currentYear}` : `${currentYear}-${currentYear + 1}`;
}

function getCurrentTerm() {
  const month = new Date().getMonth() + 1;
  return month >= 8 && month <= 12 ? "HK1" : "HK2";
}

const ManagementReports = () => {
  const filterOptions = useMemo(() => getReportFilterOptions(), []);
  const schoolYearOptions = filterOptions.schoolYears;
  const initialSchoolYear = schoolYearOptions.includes(getCurrentSchoolYear())
    ? getCurrentSchoolYear()
    : schoolYearOptions[0];

  const [activeTab, setActiveTab] = useState("overview");
  const [filters, setFilters] = useState({
    schoolYear: initialSchoolYear,
    term: getCurrentTerm(),
    classId: "all",
    teacherId: "all",
  });
  
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [detailView, setDetailView] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadReport() {
      setIsLoading(true);
      setError("");

      try {
        const data = await fetchAdminReport(filters);
        if (!isMounted) return;
        setReportData(data);
      } catch (loadError) {
        if (isMounted) {
          const msg = loadError?.response?.data?.message || loadError?.message || "Không tải được báo cáo.";
          setError(msg);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadReport();
    return () => { isMounted = false; };
  }, [filters]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const currentYearIndex = schoolYearOptions.indexOf(filters.schoolYear);
  const handleYearArrow = (direction) => {
    const nextIndex = direction === "prev" ? currentYearIndex - 1 : currentYearIndex + 1;
    if (nextIndex >= 0 && nextIndex < schoolYearOptions.length) {
      setFilters(prev => ({ ...prev, schoolYear: schoolYearOptions[nextIndex] }));
    }
  };

  const handleExportPdf = () => {
    window.print();
  };

  // Helper formatters passed to tabs
  const formatCurrency = (val) => CURRENCY_FORMATTER.format(val);
  const formatPercent = (val) => PERCENT_FORMATTER.format(val);
  const formatScore = (val) => SCORE_FORMATTER.format(val);

  const renderActiveTab = () => {
    if (isLoading) return <div className="admin-reports__loading">Đang tải dữ liệu báo cáo...</div>;
    if (error) return <div className="admin-reports__error">{error}</div>;
    if (!reportData) return null;

    const commonProps = { reportData, filters, formatCurrency, formatPercent, formatScore, setDetailView };

    switch (activeTab) {
      case "overview": return <OverviewTab {...commonProps} />;
      case "finance": return <FinanceTab {...commonProps} />;
      case "academic": return <AcademicTab {...commonProps} />;
      case "attendance": return <AttendanceTab {...commonProps} />;
      case "teacher": return <TeacherTab {...commonProps} />;
      case "class": return <ClassReportTab {...commonProps} />;
      default: return <OverviewTab {...commonProps} />;
    }
  };

  const tabItems = [
    { id: "overview", label: "Tổng quan", icon: <FiGrid /> },
    { id: "finance", label: "Tài chính", icon: <FiDollarSign /> },
    { id: "academic", label: "Học lực", icon: <FiBookOpen /> },
    { id: "attendance", label: "Chuyên cần", icon: <FiUserCheck /> },
    { id: "teacher", label: "Giáo viên", icon: <FiUsers /> },
    { id: "class", label: "Lớp học", icon: <FiAward /> },
  ];

  return (
    <div className="admin-reports">
      <div className="admin-reports__header">
        <div className="title-area">
          <h2>Báo cáo chiến lược</h2>
          <p>Phân tích chuyên sâu kết quả kỳ {filters.term} - {filters.schoolYear}</p>
        </div>
        <div className="header-actions">
          <Button variant="secondary" onClick={handleExportPdf}>Xuất PDF</Button>
        </div>
      </div>

      {/* Global Filters */}
      <Card title="Bộ lọc dữ liệu tổng hợp" className="reports-filter-card">
        <div className="admin-reports__filters">
          <div className="admin-reports__year-control">
            <span className="admin-reports__year-label">Năm học</span>
            <div className="admin-reports__year-input-wrapper">
              <button type="button" className="admin-reports__year-arrow-btn" onClick={() => handleYearArrow("prev")} disabled={currentYearIndex <= 0}>◀</button>
              <input type="text" value={filters.schoolYear} readOnly className="admin-reports__year-input-readonly" />
              <button type="button" className="admin-reports__year-arrow-btn" onClick={() => handleYearArrow("next")} disabled={currentYearIndex >= schoolYearOptions.length - 1}>▶</button>
            </div>
          </div>
          <Select label="Học kỳ" name="term" value={filters.term} variant="custom" options={[{ value: "HK1", label: "Học kỳ 1" }, { value: "HK2", label: "Học kỳ 2" }, { value: "ALL", label: "Cả năm" }]} onChange={handleFilterChange} />
          <Select label="Khối/Lớp" name="classId" value={filters.classId} variant="custom" options={filterOptions.classes} onChange={handleFilterChange} />
          <Select label="Giáo viên" name="teacherId" value={filters.teacherId} variant="custom" options={filterOptions.teachers} onChange={handleFilterChange} />
        </div>
      </Card>

      {/* Tab Navigation */}
      <div className="admin-reports__tabs">
        {tabItems.map((tab) => (
          <button
            key={tab.id}
            className={`admin-reports__tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-reports__content">
        {renderActiveTab()}
      </div>

      {/* Detail Modal Overlay */}
      {detailView && (
        <div className="admin-reports__modal-overlay" onClick={() => setDetailView(null)}>
          <Card 
            title={detailView.title} 
            className="admin-reports__detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-reports__detail-list">
              {detailView.rows.map((row, idx) => (
                <div key={idx} className="admin-reports__detail-row">
                  <span>{row.label}</span>
                  <strong>{row.value}</strong>
                </div>
              ))}
            </div>
            <div className="modal-actions" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={() => setDetailView(null)}>Đóng</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ManagementReports;
