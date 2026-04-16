import { useEffect, useState } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { adminDashboardService } from "../../../services/pages/admin/dashboard/dashboardService";
import { 
    FiUsers, FiUserCheck, FiHome, FiDollarSign, FiStar, FiActivity, 
    FiShield, FiBell, FiTrendingUp, FiCheckCircle, FiBarChart2, FiAlertCircle,
    FiArrowRight
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./PrincipalDashboard.css";

export default function PrincipalDashboard() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const navigate = useNavigate();

    const [summaryStats, setSummaryStats] = useState({
        totalStudents: 1250,
        totalTeachers: 85,
        totalClasses: 42,
    });

    const [gradeProgress, setGradeProgress] = useState({
        draft: 12,
        pending: 8,
        finalized: 22,
        total: 42,
    });

    const [revenueStats, setRevenueStats] = useState({
        expected: 15000000000,
        collected: 12500000000,
        collectionRate: 83,
    });

    const [extraStats] = useState({
        goodStudentRate: 45,
        attendanceRate: 98,
    });

    const alerts = [
        { id: 1, message: "🚨 5 lớp chưa nhập đủ điểm giữa kỳ. Hạn chót: 24h tới.", actionText: "Thúc giục ngay", path: "/principal/approvals" },
        { id: 2, message: "📉 Lớp 11A2 có tỷ lệ chuyên cần giảm đột ngột (giảm 12%).", actionText: "Xem báo cáo", path: "/principal/overview?tab=attendance" },
        { id: 3, message: "💰 Doanh thu học phí khối 12 đang đạt thấp hơn kỳ vọng.", actionText: "Chi tiết tài chính", path: "/principal/finance-monitoring" }
    ];

    const semesterLabel = selectedTerm === "hk1" ? "Học kỳ 1" : "Học kỳ 2";

    useEffect(() => {
        let isMounted = true;
        const fetch = async () => {
            try {
                const overview = await adminDashboardService.getDashboardOverview();
                if (!isMounted) return;
                if (overview.summary) setSummaryStats(overview.summary);
            } catch (_) {}
        };
        fetch();
        return () => { isMounted = false; };
    }, [selectedSchoolYear, selectedTerm]);

    const finalizedPercent = gradeProgress.total > 0
        ? Math.round((gradeProgress.finalized / gradeProgress.total) * 100) : 0;

    return (
        <div className="principal-dashboard">
            <PageHeader
                title="Command Center Ban Giám Hiệu"
                eyebrow={`Hệ thống giám sát chiến lược — Năm học ${selectedSchoolYear}`}
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            {/* Top Attention Bar */}
            <div className="principal-attention">
                <h3 className="principal-attention__title">
                    <FiAlertCircle /> Chỉ số cần can thiệp
                </h3>
                <ul className="principal-attention__list">
                    {alerts.map(alert => (
                        <li key={alert.id} className="principal-attention__item">
                            <span>{alert.message}</span>
                            <span className="principal-attention__action" onClick={() => navigate(alert.path)}>
                                {alert.actionText} <FiArrowRight />
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Strategic Stats */}
            <div className="principal-dashboard__stats">
                <div className="pstat-card">
                    <div className="pstat-card__icon pstat-card__icon--students"><FiUsers /></div>
                    <div className="pstat-card__body">
                        <p className="pstat-card__label">Học sinh</p>
                        <h3 className="pstat-card__value">{summaryStats.totalStudents.toLocaleString()}</h3>
                    </div>
                </div>
                <div className="pstat-card">
                    <div className="pstat-card__icon pstat-card__icon--teachers"><FiUserCheck /></div>
                    <div className="pstat-card__body">
                        <p className="pstat-card__label">Giáo viên</p>
                        <h3 className="pstat-card__value">{summaryStats.totalTeachers}</h3>
                    </div>
                </div>
                <div className="pstat-card">
                    <div className="pstat-card__icon pstat-card__icon--classes"><FiHome /></div>
                    <div className="pstat-card__body">
                        <p className="pstat-card__label">Lớp học</p>
                        <h3 className="pstat-card__value">{summaryStats.totalClasses}</h3>
                    </div>
                </div>
                <div className="pstat-card">
                    <div className="pstat-card__icon pstat-card__icon--rate"><FiDollarSign /></div>
                    <div className="pstat-card__body">
                        <p className="pstat-card__label">Thu tài chính</p>
                        <h3 className="pstat-card__value">{revenueStats.collectionRate}%</h3>
                    </div>
                </div>
                <div className="pstat-card">
                    <div className="pstat-card__icon pstat-card__icon--good"><FiStar /></div>
                    <div className="pstat-card__body">
                        <p className="pstat-card__label">Học lực Khá/Giỏi</p>
                        <h3 className="pstat-card__value">{extraStats.goodStudentRate}%</h3>
                    </div>
                </div>
                <div className="pstat-card">
                    <div className="pstat-card__icon pstat-card__icon--attendance"><FiActivity /></div>
                    <div className="pstat-card__body">
                        <p className="pstat-card__label">Chuyên cần</p>
                        <h3 className="pstat-card__value">{extraStats.attendanceRate}%</h3>
                    </div>
                </div>
            </div>

            <div className="principal-dashboard__panels">
                {/* Visual Progress Panel */}
                <div className="principal-panel">
                    <div className="principal-panel__head">
                        <h2 className="principal-panel__title">Tiến độ Chốt Sổ Điểm Toàn Trường</h2>
                        <span className="principal-panel__sub">{semesterLabel} — Mục tiêu hoàn tất trước 20/12</span>
                    </div>

                    <div className="grade-progress-summary">
                        <p className="grade-progress-label">{finalizedPercent}% Hệ thống đã khóa điểm</p>
                        <div className="grade-progress-bar-wrap">
                            <div
                                className="grade-progress-bar"
                                style={{ width: `${finalizedPercent}%` }}
                            />
                        </div>
                    </div>

                    <div className="grade-progress-breakdown">
                        <div className="gpb-item gpb-item--draft">
                            <span className="gpb-dot" />
                            <span>Bản nháp</span>
                            <strong>{gradeProgress.draft} lớp</strong>
                        </div>
                        <div className="gpb-item gpb-item--pending">
                            <span className="gpb-dot" />
                            <span>Chờ duyệt</span>
                            <strong>{gradeProgress.pending} lớp</strong>
                        </div>
                        <div className="gpb-item gpb-item--finalized">
                            <span className="gpb-dot" />
                            <span>Đã khóa</span>
                            <strong>{gradeProgress.finalized} lớp</strong>
                        </div>
                    </div>

                    <div className="principal-panel__actions">
                        <button
                            type="button"
                            className="principal-btn principal-btn--primary"
                            onClick={() => navigate("/principal/approvals")}
                        >
                            <FiCheckCircle /> Đi tới Trung tâm Phê duyệt
                        </button>
                        <button 
                            className="principal-btn principal-btn--ghost"
                            onClick={() => navigate("/principal/overview")}
                        >
                            Xem báo cáo hạ tầng Chuyên môn →
                        </button>
                    </div>
                </div>

                {/* Direct Access Panel */}
                <div className="principal-panel">
                    <div className="principal-panel__head">
                        <h2 className="principal-panel__title">Chỉ đạo & Giám sát Nhanh</h2>
                    </div>
                    <div className="principal-quick-links">
                        <div className="pql-item" onClick={() => navigate("/principal/reports")}>
                            <span className="pql-item__icon"><FiBarChart2 /></span>
                            <span>Báo cáo Tổng hợp (Toàn trường)</span>
                        </div>
                        <div className="pql-item" onClick={() => navigate("/principal/audit-logs")}>
                            <span className="pql-item__icon"><FiShield /></span>
                            <span>Audit Logs (Truy xuất Nhật ký)</span>
                        </div>
                        <div className="pql-item" onClick={() => navigate("/principal/notifications")}>
                            <span className="pql-item__icon"><FiBell /></span>
                            <span>Gửi Thông báo Chỉ đạo Nóng</span>
                        </div>
                        <div className="pql-item" onClick={() => navigate("/principal/overview?tab=finance")}>
                            <span className="pql-item__icon"><FiDollarSign /></span>
                            <span>Giám sát Dòng tiền Học đường</span>
                        </div>
                        <div className="pql-item" onClick={() => navigate("/principal/overview?tab=attendance")}>
                            <span className="pql-item__icon"><FiTrendingUp /></span>
                            <span>Phân tích Chuyên cần Hệ thống</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
