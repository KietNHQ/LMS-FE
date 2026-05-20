import { useState, useEffect } from "react";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { SchoolYearTermSelector, PageHeader } from "../../../components/common";
import { 
  FiAlertTriangle, FiAward, FiDownload, FiTrendingUp, FiActivity, 
  FiList, FiTrendingDown, FiPieChart, FiBarChart2 
} from "react-icons/fi";
import { disciplineService } from "../../../services/pages/management/discipline/disciplineService";
import { classesService } from "../../../services/pages/management/classes/classesService";
import "./ManagementDisciplineReports.css";

export default function ManagementDisciplineReports() {
  const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
  const [activeSubTab, setActiveSubTab] = useState("summary"); // summary, top-students, rankings, export
  const [summaryData, setSummaryData] = useState({ totalViolations: 0, totalRewards: 0, averageScore: 92.5 });
  const [violationsByType, setViolationsByType] = useState([]);
  const [topViolators, setTopViolators] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Load classes catalog
  useEffect(() => {
    classesService.listClasses().then(setClasses).catch(console.error);
  }, []);

  // Fetch discipline reporting details
  useEffect(() => {
    let isMounted = true;
    const fetchDisciplineData = async () => {
      setIsLoading(true);
      try {
        const semesterValue = selectedTerm === "hk1" ? 1 : 2;
        const resolvedClass = selectedClassId === "all" ? undefined : Number(selectedClassId);

        // Fetch parallel
        const [summary, violations, topList, classRankings] = await Promise.all([
          disciplineService.getSummary(semesterValue, resolvedClass).catch(() => ({ totalViolations: 0, totalRewards: 0, averageScore: 0 })),
          disciplineService.getViolationsByType({ semesterId: semesterValue, classId: resolvedClass }).catch(() => []),
          disciplineService.getTopViolators({ semesterId: semesterValue, classId: resolvedClass }).catch(() => []),
          disciplineService.getClassRankings({ schoolYearId: 1, semesterId: semesterValue }).catch(() => [])
        ]);

        if (isMounted) {
          setSummaryData({
            totalViolations: summary.totalViolations ?? summary.violationsCount ?? 0,
            totalRewards: summary.totalRewards ?? summary.rewardsCount ?? 0,
            averageScore: summary.averageScore ?? 0
          });
          setViolationsByType(Array.isArray(violations) ? violations : []);
          setTopViolators(Array.isArray(topList) ? topList : []);
          setRankings(Array.isArray(classRankings) ? classRankings : []);
        }
      } catch (error) {
        console.error("Error loading discipline data:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchDisciplineData();
    return () => { isMounted = false; };
  }, [selectedSchoolYear, selectedTerm, selectedClassId]);

  const handlevnEduExport = async () => {
    setIsExporting(true);
    try {
      const semesterValue = selectedTerm === "hk1" ? 1 : 2;
      const resolvedClass = selectedClassId === "all" ? undefined : Number(selectedClassId);
      
      const blobResponse = await disciplineService.exportStudentsExcel(semesterValue, resolvedClass);
      
      const blob = new Blob([blobResponse], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `discipline_report_vnEdu_${selectedSchoolYear}_${selectedTerm}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to export Excel:", err);
      alert("Không thể tải xuống tệp xuất Excel. Vui lòng kiểm tra lại quyền truy cập hoặc kết nối mạng.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="discipline-reports-page">
      <PageHeader 
        title="Báo Cáo Kỷ Luật & Thi Đua"
        eyebrow="Phân hệ Giám Sát"
        actions={
          <div className="drp-filters">
            <select 
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="drp-class-select"
            >
              <option value="all">Tất cả các lớp</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <SchoolYearTermSelector 
              selectedSchoolYear={selectedSchoolYear}
              selectedTerm={selectedTerm}
              onYearChange={handleYearArrow}
              onTermChange={handleTermChange}
            />
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="drp-summary-grid">
        <div className="drp-card drp-card--danger">
          <div className="drpc-icon"><FiAlertTriangle /></div>
          <div className="drpc-info">
            <span className="drpc-label">Tổng số vi phạm</span>
            <span className="drpc-value">{summaryData.totalViolations}</span>
          </div>
        </div>
        <div className="drp-card drp-card--success">
          <div className="drpc-icon"><FiAward /></div>
          <div className="drpc-info">
            <span className="drpc-label">Tổng khen thưởng</span>
            <span className="drpc-value">{summaryData.totalRewards}</span>
          </div>
        </div>
        <div className="drp-card drp-card--primary">
          <div className="drpc-icon"><FiActivity /></div>
          <div className="drpc-info">
            <span className="drpc-label">Điểm thi đua TB</span>
            <span className="drpc-value">{summaryData.averageScore}đ</span>
          </div>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="drp-tabs">
        <button 
          className={`drp-tab-btn ${activeSubTab === "summary" ? "active" : ""}`}
          onClick={() => setActiveSubTab("summary")}
        >
          <FiPieChart /> Tổng quan Vi phạm
        </button>
        <button 
          className={`drp-tab-btn ${activeSubTab === "top-students" ? "active" : ""}`}
          onClick={() => setActiveSubTab("top-students")}
        >
          <FiList /> Học sinh Cần Lưu ý
        </button>
        <button 
          className={`drp-tab-btn ${activeSubTab === "rankings" ? "active" : ""}`}
          onClick={() => setActiveSubTab("rankings")}
        >
          <FiTrendingUp /> Bảng Xếp Hạng Thi Đua
        </button>
        <button 
          className={`drp-tab-btn ${activeSubTab === "export" ? "active" : ""}`}
          onClick={() => setActiveSubTab("export")}
        >
          <FiDownload /> Xuất Dữ liệu vnEdu
        </button>
      </div>

      {/* Dynamic Content Container */}
      <div className="drp-content-box">
        {isLoading ? (
          <div className="drp-loader">
            <div className="drp-spinner" />
            <span>Đang tải thống kê kỷ luật từ cơ sở dữ liệu...</span>
          </div>
        ) : (
          <>
            {activeSubTab === "summary" && (
              <div className="drp-summary-tab">
                <div className="drp-chart-section">
                  <h4><FiBarChart2 /> Phân bố các hành vi vi phạm kỷ luật</h4>
                  <div className="drp-bar-chart">
                    {violationsByType.length === 0 ? (
                      <div className="drp-empty-state">Không ghi nhận vi phạm kỷ luật nào trong kỳ này.</div>
                    ) : (
                      violationsByType.map((v, i) => (
                        <div key={i} className="drp-chart-row">
                          <span className="drp-chart-label">{v.type || v.violationType || "Vi phạm khác"}</span>
                          <div className="drp-chart-bar-wrap">
                            <div 
                              className="drp-chart-bar" 
                              style={{ width: `${Math.min(100, (v.count / 20) * 100)}%` }}
                            />
                            <span className="drp-chart-value">{v.count} vụ</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === "top-students" && (
              <div className="drp-list-tab">
                <h4><FiAlertTriangle /> Danh sách học sinh vi phạm nhiều nhất trong kỳ</h4>
                <div className="drp-table-wrapper">
                  <table className="drp-table">
                    <thead>
                      <tr>
                        <th>Học sinh</th>
                        <th>Lớp</th>
                        <th>Số lỗi ghi nhận</th>
                        <th>Hành vi cuối</th>
                        <th>Trạng thái hiện tại</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topViolators.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="drp-empty-state">Tuyệt vời! Không có học sinh nào bị cảnh báo.</td>
                        </tr>
                      ) : (
                        topViolators.map((s, idx) => (
                          <tr key={idx}>
                            <td className="bold">{s.name || s.studentName}</td>
                            <td>{s.class || s.className}</td>
                            <td className="danger bold">{s.count || s.violationCount}</td>
                            <td>{s.lastIncident || s.latestIncident || "Không rõ"}</td>
                            <td>
                              <span className="drp-badge warning">
                                {s.status || "Nhắc nhở"}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeSubTab === "rankings" && (
              <div className="drp-rankings-tab">
                <h4><FiTrendingUp /> Bảng điểm nề nếp thi đua toàn trường</h4>
                <div className="drp-table-wrapper">
                  <table className="drp-table">
                    <thead>
                      <tr>
                        <th>Thứ hạng</th>
                        <th>Lớp</th>
                        <th>Giáo viên Chủ nhiệm</th>
                        <th>Điểm thi đua trung bình</th>
                        <th>Đánh giá xu hướng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rankings.map((r, idx) => (
                        <tr key={idx}>
                          <td className="bold text-center">#{idx + 1}</td>
                          <td className="bold">{r.className || r.label || r.name}</td>
                          <td>{r.teacherName || r.teacher || "Chưa phân công"}</td>
                          <td className="success bold">{r.score ?? r.totalPoints}đ</td>
                          <td>
                            <span className="drp-trend up">
                              <FiTrendingUp /> Ổn định
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeSubTab === "export" && (
              <div className="drp-export-tab">
                <div className="drp-export-card">
                  <div className="drpe-header">
                    <FiDownload className="export-big-icon" />
                    <h3>Trích xuất báo cáo đồng bộ vnEdu</h3>
                    <p>Hệ thống tự động biên dịch toàn bộ dữ liệu kỷ luật, vi phạm và hạnh kiểm sang bảng tính Excel được chuẩn hóa tương thích 100% với hệ thống vnEdu của Bộ Giáo Dục.</p>
                  </div>
                  <div className="drpe-body">
                    <div className="drpe-meta-pill">
                      <span>Năm học: <b>{selectedSchoolYear}</b></span>
                      <span>Học kỳ: <b>{selectedTerm === "hk1" ? "Học kỳ 1" : "Học kỳ 2"}</b></span>
                    </div>
                    <button 
                      onClick={handlevnEduExport}
                      disabled={isExporting}
                      className="drp-export-btn"
                    >
                      {isExporting ? "Đang xử lý kết xuất..." : "Tải xuống bảng tính Excel"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
