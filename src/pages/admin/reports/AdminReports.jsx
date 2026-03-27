import { useEffect, useMemo, useState } from "react";
import "./AdminReports.css";
import * as XLSX from "xlsx";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Alert, Button, Card, Select } from "../../../components/ui";
import {
  fetchAdminReport,
  fetchTermComparison,
  getReportFilterOptions,
} from "../../../services/reportService";

const PIE_COLORS = ["#3557d4", "#58a5f0", "#9fd7ff", "#ff9b6c"];

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

function sanitizeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

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

function toStarText(value) {
  const rounded = Math.max(0, Math.min(5, Math.round(value)));
  const stars = `${"★".repeat(rounded)}${"☆".repeat(5 - rounded)}`;
  return `${stars} (${value.toFixed(1)})`;
}

const AdminReports = () => {
  const filterOptions = useMemo(() => getReportFilterOptions(), []);
  const schoolYearOptions = filterOptions.schoolYears;
  const initialSchoolYear = schoolYearOptions.includes(getCurrentSchoolYear())
    ? getCurrentSchoolYear()
    : schoolYearOptions[0];

  const [filters, setFilters] = useState({
    schoolYear: initialSchoolYear,
    term: getCurrentTerm(),
    classId: "all",
    teacherId: "all",
  });
  const [reportData, setReportData] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompareLoading, setIsCompareLoading] = useState(false);
  const [error, setError] = useState("");
  const [detailView, setDetailView] = useState(null);
  const [selectedTeacherForTable, setSelectedTeacherForTable] = useState("all");
  const [selectedTeacherClass, setSelectedTeacherClass] = useState("all");
  const [selectedGrade, setSelectedGrade] = useState("all");

  useEffect(() => {
    let isMounted = true;

    async function loadReport() {
      setIsLoading(true);
      setError("");

      try {
        const data = await fetchAdminReport(filters);
        if (!isMounted) {
          return;
        }
        setReportData(data);
      } catch (loadError) {
        if (isMounted) {
          setError(loadError?.message || "Không tải được báo cáo.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadReport();

    return () => {
      isMounted = false;
    };
  }, [filters]);

  useEffect(() => {
    let isMounted = true;

    async function loadComparison() {
      setIsCompareLoading(true);
      try {
        const data = await fetchTermComparison(filters.schoolYear, filters);
        if (isMounted) {
          setComparisonData(data);
        }
      } catch {
        if (isMounted) {
          setComparisonData(null);
        }
      } finally {
        if (isMounted) {
          setIsCompareLoading(false);
        }
      }
    }

    loadComparison();

    return () => {
      isMounted = false;
    };
  }, [filters.schoolYear, filters.classId, filters.teacherId]);

  const summaryCards = useMemo(() => {
    if (!reportData) {
      return [];
    }

    return [
      {
        title: "Tổng học sinh",
        value: reportData.summary.totalStudents.toLocaleString("vi-VN"),
      },
      {
        title: "Điểm TB toàn trường",
        value: SCORE_FORMATTER.format(reportData.summary.schoolAverageScore),
      },
      {
        title: "Tỉ lệ chuyên cần",
        value: `${PERCENT_FORMATTER.format(reportData.summary.attendanceRate)}%`,
      },
      {
        title: "Tổng thu",
        value: CURRENCY_FORMATTER.format(reportData.summary.totalRevenue),
      },
    ];
  }, [reportData]);

  const academicChartData = useMemo(() => {
    if (!reportData) {
      return [];
    }

    return reportData.academic.map((item, index) => ({
      ...item,
      fill: PIE_COLORS[index % PIE_COLORS.length],
    }));
  }, [reportData]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((previousFilters) => ({
      ...previousFilters,
      [name]: value,
    }));
  };

  const currentYearIndex = schoolYearOptions.indexOf(filters.schoolYear);
  const canGoPrevYear = currentYearIndex > 0;
  const canGoNextYear = currentYearIndex >= 0 && currentYearIndex < schoolYearOptions.length - 1;

  const handleYearArrow = (direction) => {
    if (currentYearIndex === -1) {
      return;
    }

    const nextIndex = direction === "prev" ? currentYearIndex - 1 : currentYearIndex + 1;
    if (nextIndex < 0 || nextIndex >= schoolYearOptions.length) {
      return;
    }

    setFilters((previousFilters) => ({
      ...previousFilters,
      schoolYear: schoolYearOptions[nextIndex],
    }));
  };

  const openDetail = (title, rows) => {
    setDetailView({ title, rows });
  };

  const handleAcademicClick = (slice) => {
    if (!slice || !reportData) {
      return;
    }

    const total = reportData.academic.reduce((sum, item) => sum + item.value, 0);
    const percent = total ? (slice.value / total) * 100 : 0;

    openDetail(`Học lực: ${slice.name}`, [
      { label: "Số học sinh", value: slice.value.toLocaleString("vi-VN") },
      { label: "Tỉ trọng", value: `${PERCENT_FORMATTER.format(percent)}%` },
      { label: "Học kỳ", value: filters.term },
      { label: "Năm học", value: filters.schoolYear },
    ]);
  };

  const handleSubjectClick = (point) => {
    if (!point) {
      return;
    }

    openDetail(`Môn học: ${point.subject}`, [
      { label: "Điểm trung bình", value: SCORE_FORMATTER.format(point.averageScore) },
      { label: "Phạm vi", value: filters.classId === "all" ? "Toàn trường" : filters.classId },
    ]);
  };

  const handleAttendanceClick = (point) => {
    if (!point) {
      return;
    }

    openDetail(`Chuyên cần - ${point.period}`, [
      { label: "Tỉ lệ", value: `${PERCENT_FORMATTER.format(point.rate)}%` },
      { label: "Năm học", value: filters.schoolYear },
    ]);
  };

  const handleFinanceClick = (point) => {
    if (!point) {
      return;
    }

    openDetail(`Tài chính - ${point.period || point.grade}`, [
      { label: "Tổng thu", value: CURRENCY_FORMATTER.format(point.amount) },
      { label: "Học kỳ", value: filters.term },
    ]);
  };

  const handleExportExcel = () => {
    if (!reportData) {
      return;
    }

    const workbook = XLSX.utils.book_new();

    const summarySheet = XLSX.utils.json_to_sheet([
      {
        schoolYear: filters.schoolYear,
        term: filters.term,
        classId: filters.classId,
        teacherId: filters.teacherId,
        totalStudents: reportData.summary.totalStudents,
        schoolAverageScore: reportData.summary.schoolAverageScore,
        attendanceRate: reportData.summary.attendanceRate,
        totalRevenue: reportData.summary.totalRevenue,
      },
    ]);

    const subjectSheet = XLSX.utils.json_to_sheet(reportData.subjects);
    const attendanceSheet = XLSX.utils.json_to_sheet(reportData.attendance);
    const financeSheet = XLSX.utils.json_to_sheet(reportData.finance);
    const teacherSheet = XLSX.utils.json_to_sheet(reportData.teacherPerformance);
    const teacherSubjectSheet = XLSX.utils.json_to_sheet(
      reportData.teacherSubjectAnalysis.map((item) => ({
        teacher: item.teacherName,
        subject: item.subject,
        assignedAverage: item.avgAssignedClasses,
      }))
    );
    const gradeSheet = XLSX.utils.json_to_sheet(
      reportData.gradeOverview.map((item) => ({
        grade: item.grade,
        averageScore: item.averageScore,
        star: item.star,
      }))
    );

    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");
    XLSX.utils.book_append_sheet(workbook, subjectSheet, "Subjects");
    XLSX.utils.book_append_sheet(workbook, attendanceSheet, "Attendance");
    XLSX.utils.book_append_sheet(workbook, financeSheet, "Finance");
    XLSX.utils.book_append_sheet(workbook, teacherSheet, "Teacher KPI");
    XLSX.utils.book_append_sheet(workbook, teacherSubjectSheet, "Teacher Subject");
    XLSX.utils.book_append_sheet(workbook, gradeSheet, "Grade Overview");

    const fileName = `admin-report-${filters.schoolYear}-${filters.term}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const handleExportPdf = () => {
    if (!reportData) {
      return;
    }

    const popup = window.open("", "_blank", "width=1024,height=768");
    if (!popup) {
      return;
    }

    const summaryHtml = summaryCards
      .map(
        (card) =>
          `<li><strong>${sanitizeHtml(card.title)}:</strong> ${sanitizeHtml(card.value)}</li>`
      )
      .join("");

    const subjectRows = reportData.subjects
      .map(
        (item) =>
          `<tr><td>${sanitizeHtml(item.subject)}</td><td>${sanitizeHtml(
            SCORE_FORMATTER.format(item.averageScore)
          )}</td></tr>`
      )
      .join("");

    popup.document.write(`
      <html>
        <head>
          <title>Admin Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #1e2f5a; }
            h1, h2 { margin: 0 0 12px 0; }
            ul { margin: 0 0 20px 0; padding-left: 18px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #dce5f7; padding: 8px; text-align: left; }
            th { background: #f5f8ff; }
          </style>
        </head>
        <body>
          <h1>Báo cáo Admin</h1>
          <p>Năm học: ${sanitizeHtml(filters.schoolYear)} - Học kỳ: ${sanitizeHtml(filters.term)}</p>
          <h2>Thống kê nhanh</h2>
          <ul>${summaryHtml}</ul>
          <h2>Điểm trung bình theo môn</h2>
          <table>
            <thead><tr><th>Môn học</th><th>Điểm TB</th></tr></thead>
            <tbody>${subjectRows}</tbody>
          </table>
        </body>
      </html>
    `);

    popup.document.close();
    popup.focus();
    popup.print();
  };

  const comparisonSummary = useMemo(() => {
    if (!comparisonData) {
      return null;
    }

    const scoreDiff = comparisonData.hk2.summary.schoolAverageScore - comparisonData.hk1.summary.schoolAverageScore;
    const attendanceDiff = comparisonData.hk2.summary.attendanceRate - comparisonData.hk1.summary.attendanceRate;
    const revenueDiff = comparisonData.hk2.summary.totalRevenue - comparisonData.hk1.summary.totalRevenue;

    return {
      scoreDiff,
      attendanceDiff,
      revenueDiff,
    };
  }, [comparisonData]);

  const teacherList = reportData?.teacherSubjectAnalysis || [];
  const gradeList = reportData?.gradeOverview || [];

  useEffect(() => {
    if (!teacherList.length) {
      setSelectedTeacherForTable("all");
      return;
    }

    if (filters.teacherId !== "all") {
      setSelectedTeacherForTable(filters.teacherId);
      return;
    }

    if (selectedTeacherForTable === "all") {
      setSelectedTeacherForTable(teacherList[0].teacherId);
    }
  }, [filters.teacherId, selectedTeacherForTable, teacherList]);

  useEffect(() => {
    if (!gradeList.length) {
      setSelectedGrade("all");
      return;
    }

    if (selectedGrade === "all") {
      setSelectedGrade(gradeList[0].grade);
    }
  }, [gradeList, selectedGrade]);

  const selectedTeacherData = teacherList.find(
    (item) => item.teacherId === selectedTeacherForTable
  );

  const teacherClassRows = selectedTeacherData
    ? selectedTeacherData.assignedClasses.filter(
        (item) => selectedTeacherClass === "all" || item.classId === selectedTeacherClass
      )
    : [];

  const selectedGradeData = gradeList.find((item) => item.grade === selectedGrade);

  const subjectTooltipFormatter = (value) => [SCORE_FORMATTER.format(value), "Điểm trung bình"];
  const attendanceTooltipFormatter = (value) => [`${PERCENT_FORMATTER.format(value)}%`, "Chuyên cần"];
  const financeTooltipFormatter = (value) => [CURRENCY_FORMATTER.format(value), "Tổng thu học phí"];
  const compareTooltipFormatter = (value, name) => {
    const label = name === "hk1" ? "Học kỳ 1" : "Học kỳ 2";
    return [value, label];
  };

  return (
    <div className="admin-reports">
      <div className="admin-reports__header">
        <h2>Báo cáo tổng hợp</h2>
      </div>

      <div className="admin-reports__content">
        <Card title="1. Bộ lọc dữ liệu">
          <div className="admin-reports__filters">
            <div className="admin-reports__year-control">
              <span className="admin-reports__year-label">Năm học</span>
              <div className="admin-reports__year-input-wrapper">
                <button
                  type="button"
                  className="admin-reports__year-arrow-btn"
                  onClick={() => handleYearArrow("prev")}
                  disabled={!canGoPrevYear}
                >
                  ◀
                </button>
                <input
                  type="text"
                  value={filters.schoolYear}
                  readOnly
                  className="admin-reports__year-input-readonly"
                />
                <button
                  type="button"
                  className="admin-reports__year-arrow-btn"
                  onClick={() => handleYearArrow("next")}
                  disabled={!canGoNextYear}
                >
                  ▶
                </button>
              </div>
            </div>
            <Select
              label="Học kỳ"
              name="term"
              value={filters.term}
              options={[
                { value: "HK1", label: "Học kỳ 1" },
                { value: "HK2", label: "Học kỳ 2" },
                { value: "ALL", label: "Cả năm" },
              ]}
              onChange={handleFilterChange}
            />
            <Select
              label="Lớp (tùy chọn)"
              name="classId"
              value={filters.classId}
              options={filterOptions.classes}
              onChange={handleFilterChange}
              variant="custom"
              searchable
              searchPlaceholder="Tìm lớp..."
            />
            <Select
              label="Giáo viên (tùy chọn)"
              name="teacherId"
              value={filters.teacherId}
              options={filterOptions.teachers}
              onChange={handleFilterChange}
              variant="custom"
              searchable
              searchPlaceholder="Tìm giáo viên..."
            />
          </div>
        </Card>

        {error ? (
          <Alert
            type="error"
            title="Không tải được dữ liệu"
            message={error}
            onClose={() => setError("")}
          />
        ) : null}

        {isLoading ? (
          <Card>
            <p className="admin-reports__loading">Đang tải báo cáo...</p>
          </Card>
        ) : null}

        {!isLoading && reportData ? (
          <>
            <Card title="2. Thống kê nhanh">
              <div className="admin-reports__summary-grid">
                {summaryCards.map((item) => (
                  <div key={item.title} className="admin-reports__summary-card">
                    <p className="admin-reports__summary-label">{item.title}</p>
                    <p className="admin-reports__summary-value">{item.value}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="3. Biểu đồ tổng hợp">
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
                        onClick={handleAcademicClick}
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
                  <h4>Điểm trung bình theo môn</h4>
                  <ResponsiveContainer width="100%" height={270}>
                    <BarChart data={reportData.subjects} onClick={handleSubjectClick}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="subject" />
                      <YAxis domain={[0, 10]} />
                      <Tooltip formatter={subjectTooltipFormatter} labelFormatter={(value) => `Môn: ${value}`} />
                      <Bar dataKey="averageScore" fill="#3557d4" cursor="pointer" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="admin-reports__chart-item">
                  <h4>Chuyên cần theo thời gian</h4>
                  <ResponsiveContainer width="100%" height={270}>
                    <LineChart data={reportData.attendance} onClick={handleAttendanceClick}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis domain={[85, 100]} />
                      <Tooltip formatter={attendanceTooltipFormatter} labelFormatter={(value) => `Thời điểm: ${value}`} />
                      <Line type="monotone" dataKey="rate" stroke="#0d9488" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="admin-reports__chart-item">
                  <h4>Tài chính theo khối (đơn giản)</h4>
                  <ResponsiveContainer width="100%" height={270}>
                    <BarChart data={reportData.financeByGrade} onClick={handleFinanceClick}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="grade" />
                      <YAxis />
                      <Tooltip formatter={financeTooltipFormatter} labelFormatter={(value) => `${value}`} />
                      <Bar dataKey="amount" fill="#f97316" cursor="pointer" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>

            <Card title="4. So sánh học kỳ 1 và học kỳ 2">
              {isCompareLoading ? (
                <p className="admin-reports__loading">Đang tải dữ liệu so sánh...</p>
              ) : null}

              {comparisonSummary ? (
                <>
                  <div className="admin-reports__comparison-grid">
                    <div className="admin-reports__comparison-item">
                      <span>Chênh lệch điểm TB</span>
                      <strong>{`${comparisonSummary.scoreDiff >= 0 ? "+" : ""}${SCORE_FORMATTER.format(
                        comparisonSummary.scoreDiff
                      )}`}</strong>
                    </div>
                    <div className="admin-reports__comparison-item">
                      <span>Chênh lệch chuyên cần</span>
                      <strong>{`${comparisonSummary.attendanceDiff >= 0 ? "+" : ""}${PERCENT_FORMATTER.format(
                        comparisonSummary.attendanceDiff
                      )}%`}</strong>
                    </div>
                    <div className="admin-reports__comparison-item">
                      <span>Chênh lệch tổng thu</span>
                      <strong>{`${comparisonSummary.revenueDiff >= 0 ? "+" : ""}${CURRENCY_FORMATTER.format(
                        comparisonSummary.revenueDiff
                      )}`}</strong>
                    </div>
                  </div>

                  <div className="admin-reports__comparison-chart-wrap">
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={comparisonData?.metrics || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="metric" />
                        <YAxis />
                        <Tooltip formatter={compareTooltipFormatter} />
                        <Legend formatter={(value) => (value === "hk1" ? "Học kỳ 1" : "Học kỳ 2")} />
                        <Bar dataKey="hk1" fill="#6366f1" name="hk1" />
                        <Bar dataKey="hk2" fill="#f59e0b" name="hk2" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              ) : null}
            </Card>

            <Card title="5. Bảng giáo viên theo môn và lớp được phân công">
              {teacherList.length ? (
                <>
                  <div className="admin-reports__table-filters">
                    <Select
                      label="Giáo viên"
                      value={selectedTeacherForTable}
                      onChange={(event) => {
                        setSelectedTeacherForTable(event.target.value);
                        setSelectedTeacherClass("all");
                      }}
                      options={teacherList.map((item) => ({
                        value: item.teacherId,
                        label: `${item.teacherName} - ${item.subject}`,
                      }))}
                      variant="custom"
                      searchable
                      searchPlaceholder="Tìm giáo viên..."
                    />
                    <Select
                      label="Lớp được phân công"
                      value={selectedTeacherClass}
                      onChange={(event) => setSelectedTeacherClass(event.target.value)}
                      options={[
                        { value: "all", label: "Tất cả lớp được phân công" },
                        ...(selectedTeacherData?.assignedClasses || []).map((item) => ({
                          value: item.classId,
                          label: item.classId,
                        })),
                      ]}
                      variant="custom"
                    />
                  </div>

                  {selectedTeacherData ? (
                    <div className="admin-reports__table-wrap">
                      <table className="admin-reports__table">
                        <thead>
                          <tr>
                            <th>Lớp</th>
                            <th>Điểm TB lớp</th>
                            <th>TB tất cả lớp được phân công</th>
                            <th>Chênh lệch</th>
                          </tr>
                        </thead>
                        <tbody>
                          {teacherClassRows.map((row) => {
                            const diff = row.classAverageScore - selectedTeacherData.avgAssignedClasses;
                            return (
                              <tr key={row.classId}>
                                <td>{row.classId}</td>
                                <td>{SCORE_FORMATTER.format(row.classAverageScore)}</td>
                                <td>{SCORE_FORMATTER.format(selectedTeacherData.avgAssignedClasses)}</td>
                                <td>{`${diff >= 0 ? "+" : ""}${SCORE_FORMATTER.format(diff)}`}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                </>
              ) : (
                <p className="admin-reports__loading">Không có dữ liệu giáo viên phù hợp bộ lọc.</p>
              )}
            </Card>

            <Card title="6. Báo cáo theo khối và lớp">
              <div className="admin-reports__table-wrap">
                <table className="admin-reports__table">
                  <thead>
                    <tr>
                      <th>Khối</th>
                      <th>Điểm TB môn</th>
                      <th>Sao</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gradeList.map((item) => (
                      <tr key={item.grade}>
                        <td>{item.grade}</td>
                        <td>{SCORE_FORMATTER.format(item.averageScore)}</td>
                        <td>{toStarText(item.star)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="admin-reports__table-filters admin-reports__table-filters--single">
                <Select
                  label="Chọn khối để xem chi tiết lớp"
                  value={selectedGrade}
                  onChange={(event) => setSelectedGrade(event.target.value)}
                  options={gradeList.map((item) => ({ value: item.grade, label: item.grade }))}
                  variant="custom"
                />
              </div>

              {selectedGradeData ? (
                <div className="admin-reports__table-wrap">
                  <table className="admin-reports__table">
                    <thead>
                      <tr>
                        <th>Lớp</th>
                        <th>Điểm TB môn</th>
                        <th>Sao</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedGradeData.classes.map((classItem) => (
                        <tr key={classItem.classId}>
                          <td>{classItem.classId}</td>
                          <td>{SCORE_FORMATTER.format(classItem.averageScore)}</td>
                          <td>{toStarText(classItem.star)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </Card>

            {detailView ? (
              <Card
                title="Chi tiết khi click chart"
                actions={
                  <Button variant="ghost" size="sm" onClick={() => setDetailView(null)}>
                    Đóng
                  </Button>
                }
              >
                <h4 className="admin-reports__detail-title">{detailView.title}</h4>
                <div className="admin-reports__detail-list">
                  {detailView.rows.map((row) => (
                    <div key={row.label} className="admin-reports__detail-row">
                      <span>{row.label}</span>
                      <strong>{row.value}</strong>
                    </div>
                  ))}
                </div>
              </Card>
            ) : null}

            <Card title="7. Xuất báo cáo">
              <div className="admin-reports__export-actions">
                <Button onClick={handleExportExcel}>Xuất Excel</Button>
                <Button variant="secondary" onClick={handleExportPdf}>
                  Xuất PDF
                </Button>
              </div>
            </Card>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default AdminReports;