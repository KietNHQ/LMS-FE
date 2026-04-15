import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { FiBookOpen, FiCheckCircle, FiAlertTriangle, FiAlertCircle, FiArrowRight, FiUnlock, FiCalendar } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./VpAcademicDashboard.css";

export default function VpAcademicDashboard() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const navigate = useNavigate();

    const stats = {
        totalClasses: 35,
        totalSubjects: 12,
        unenteredClasses: 10,
        completedPercent: 65,
    };

    const alerts = [
        { id: 1, title: "⚠️ 10 lớp chưa nhập điểm", desc: "Hạn chót là ngày mai. Các lớp: 12A1, 11A5...", path: "/vp-academic/grades?filter=missing" },
        { id: 2, title: "⚠️ 3 lớp có điểm TB rất thấp (<5.0)", desc: "Cần rà soát chất lượng môn Toán ở 10A1, 10A2.", path: "/vp-academic/grades?filter=low_avg" },
        { id: 3, title: "⚠️ Môn Hóa học chưa có dữ liệu", desc: "Giáo viên bộ môn chưa tải điểm lên hệ thống.", path: "/vp-academic/teaching-assignment" }
    ];

    return (
        <div className="vp-aca-dashboard">
            <PageHeader
                title="Bảng Điều Khiển Chuyên Môn"
                eyebrow="Kiểm soát tiến độ giảng dạy và điểm số toàn trường"
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            <div className="vpa-stats-grid">
                <div className="vpa-stat-card primary">
                    <div className="vpa-stat-icon"><FiBookOpen /></div>
                    <div className="vpa-stat-body">
                        <p className="vpa-stat-label">Tổng số Lớp & Môn</p>
                        <h3 className="vpa-stat-value">{stats.totalClasses} Lớp - {stats.totalSubjects} Môn</h3>
                    </div>
                </div>
                <div className="vpa-stat-card success">
                    <div className="vpa-stat-icon"><FiCheckCircle /></div>
                    <div className="vpa-stat-body">
                        <p className="vpa-stat-label">Tiến độ Lên Điểm</p>
                        <h3 className="vpa-stat-value">{stats.completedPercent}%</h3>
                    </div>
                </div>
                <div className="vpa-stat-card danger">
                    <div className="vpa-stat-icon"><FiAlertTriangle /></div>
                    <div className="vpa-stat-body">
                        <p className="vpa-stat-label">Lớp rỗng điểm (Trễ hạn)</p>
                        <h3 className="vpa-stat-value">{stats.unenteredClasses} Lớp</h3>
                    </div>
                </div>
            </div>

            <div className="vpa-progress-panel">
                <div className="vpa-progress-header">
                    <h3>Tiến độ Chốt Sổ Điểm Học Kỳ 1</h3>
                    <span>22 Lớp hoàn thành / 35 Tổng số</span>
                </div>
                
                <div className="giant-progress-bar">
                    <div className="gp-segment done" style={{width: '60%'}}>60% Chốt sổ</div>
                    <div className="gp-segment pending" style={{width: '15%'}}>15% Chờ Duyệt</div>
                    <div className="gp-segment empty" style={{width: '25%'}}></div>
                </div>
                
                <div className="gp-legend">
                    <div className="legend-item"><div className="legend-dot done"></div> Đã Chốt sổ</div>
                    <div className="legend-item"><div className="legend-dot pending"></div> Đang xin duyệt mở khóa/chốt điểm</div>
                    <div className="legend-item"><div className="legend-dot empty"></div> Chưa hoàn tất nhập liệu</div>
                </div>
            </div>

            <div className="vpa-panels">
                {/* Panel 1: Top Cảnh báo Mức Đỏ */}
                <div className="vpa-panel urgent">
                    <div className="vpa-panel-header">
                        <FiAlertCircle /> Top Cảnh Báo Chất Lượng
                    </div>
                    <div className="vpa-alert-list">
                        {alerts.map(alert => (
                            <div className="vpa-alert-item" key={alert.id}>
                                <div className="vpa-alert-info">
                                    <strong>{alert.title}</strong>
                                    <span>{alert.desc}</span>
                                </div>
                                <button className="btn-resolve" onClick={() => navigate(alert.path)}>
                                    Kiểm tra <FiArrowRight />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Panel 2: Liên kết nhanh */}
                <div className="vpa-panel">
                    <div className="vpa-panel-header">
                        Truy Cập Nhanh
                    </div>
                    <div className="link-grid">
                        <button className="quick-link-btn" onClick={() => navigate("/vp-academic/approvals")}>
                            <FiUnlock /> Duyệt / Mở Khóa Điểm
                        </button>
                        <button className="quick-link-btn" onClick={() => navigate("/vp-academic/exams")}>
                            <FiCalendar /> Lịch Kỳ Thi
                        </button>
                        <button className="quick-link-btn" onClick={() => navigate("/vp-academic/grades")}>
                            <FiBookOpen /> Xem Học Bạ
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}
