import { useEffect, useState } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { adminDashboardService } from "../../../services/pages/admin/dashboard/dashboardService";
import { 
    FiUsers, FiUserCheck, FiHome, FiDollarSign, FiStar, FiActivity, 
    FiShield, FiBell, FiTrendingUp, FiCheckCircle, FiBarChart2, FiAlertCircle,
    FiArrowRight, FiTrendingDown
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
        byGrade: [
            { id: 10, label: "Khối 10", finalized: 12, total: 15 },
            { id: 11, label: "Khối 11", finalized: 8, total: 14 },
            { id: 12, label: "Khối 12", finalized: 15, total: 15 },
        ]
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

    const [quickInsights] = useState([
        { id: "reports", label: "Báo cáo Tổng hợp (Toàn trường)", icon: <FiBarChart2 />, path: "/principal/reports", insight: "Cập nhật 5 phút trước", type: "info" },
        { id: "audit", label: "Audit Logs (Truy xuất Nhật ký)", icon: <FiShield />, path: "/principal/audit-logs", insight: "12 log mới", type: "warning" },
        { id: "notifications", label: "Gửi Thông báo Chỉ đạo Nóng", icon: <FiBell />, path: "/principal/notifications", insight: "Hệ thống ổn định", type: "success" },
        { id: "finance", label: "Giám sát Dòng tiền Học đường", icon: <FiDollarSign />, path: "/principal/overview?tab=finance", insight: "Đạt 83% chỉ tiêu", type: "info" },
        { id: "attendance", label: "Phân tích Chuyên cần Hệ thống", icon: <FiTrendingUp />, path: "/principal/overview?tab=attendance", insight: "-2% so với tuần trước", type: "danger" },
    ]);

    const alerts = [
        { 
            id: 1, 
            type: "danger", 
            icon: <FiAlertCircle />, 
            message: "5 lớp chưa nhập đủ điểm giữa kỳ. Hạn chót: 24h tới.", 
            actionText: "Thúc giục ngay", 
            path: "/principal/approvals" 
        },
        { 
            id: 2, 
            type: "warning", 
            icon: <FiTrendingDown />, 
            message: "Lớp 11A2 có tỷ lệ chuyên cần giảm đột ngột (giảm 12%).", 
            actionText: "Xem báo cáo", 
            path: "/principal/overview?tab=attendance" 
        },
        { 
            id: 3, 
            type: "info", 
            icon: <FiDollarSign />, 
            message: "Khối 12 hiện còn 15% học sinh chưa hoàn thành đóng học phí.", 
            actionText: "Xem danh sách", 
            path: "/principal/overview?tab=finance" 
        }
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
                title="Hệ Thống Quản Trị Hiệu Trưởng"

                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />


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
                        <div className="principal-panel__sub">
                            {semesterLabel} — {gradeProgress.byGrade.map((g, idx) => (
                                <span key={g.id} className="grade-progress-pill">
                                    {g.label}: <strong>{g.finalized}/{g.total}</strong>
                                    {idx < gradeProgress.byGrade.length - 1 && <span className="pill-sep">•</span>}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="grade-progress-summary">
                        <div className="gps-header">
                            <p className="grade-progress-label">{finalizedPercent}% Hệ thống đã khóa điểm</p>
                            <span className="gps-pulse-dot" />
                        </div>
                        <div className="grade-progress-bar-wrap">
                            <div
                                className="grade-progress-bar"
                                style={{ width: `${finalizedPercent}%` }}
                            >
                                <div className="bar-glow-point" />
                            </div>
                        </div>
                    </div>

                    <div className="grade-progress-breakdown">
                        <div className="gpb-card gpb-card--draft">
                            <div className="gpb-card-icon"><FiActivity /></div>
                            <div className="gpb-card-info">
                                <span className="gpb-card-label">Bản nháp</span>
                                <strong className="gpb-card-value">{gradeProgress.draft} lớp</strong>
                            </div>
                        </div>
                        <div className="gpb-card gpb-card--pending">
                            <div className="gpb-card-icon"><FiAlertCircle /></div>
                            <div className="gpb-card-info">
                                <span className="gpb-card-label">Chờ duyệt</span>
                                <strong className="gpb-card-value">{gradeProgress.pending} lớp</strong>
                            </div>
                        </div>
                        <div className="gpb-card gpb-card--finalized">
                            <div className="gpb-card-icon"><FiCheckCircle /></div>
                            <div className="gpb-card-info">
                                <span className="gpb-card-label">Đã khóa</span>
                                <strong className="gpb-card-value">{gradeProgress.finalized} lớp</strong>
                            </div>
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
                            Xem báo cáo hạ tầng Chuyên môn <span className="btn-arrow">→</span>
                        </button>
                    </div>
                </div>

                {/* Direct Access Panel */}
                <div className="principal-panel">
                    <div className="principal-panel__head">
                        <h2 className="principal-panel__title">Chỉ đạo & Giám sát Nhanh</h2>
                    </div>
                    <div className="principal-quick-links">
                        {quickInsights.map(item => (
                            <div key={item.id} className="pql-item" onClick={() => navigate(item.path)}>
                                <div className="pql-item__main">
                                    <span className="pql-item__icon">{item.icon}</span>
                                    <span className="pql-item__label">{item.label}</span>
                                </div>
                                <span className={`pql-item__insight pql-item__insight--${item.type}`}>
                                    {item.insight}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Premium Attention Footer */}
            <footer className={`principal-attention ${alerts.length === 0 ? "principal-attention--empty" : ""}`}>
                <div className="principal-attention__head">
                    {alerts.length > 0 ? (
                        <>
                            <FiAlertCircle className="attention-icon" />
                            <h3 className="principal-attention__title">Chỉ số cần can thiệp</h3>
                        </>
                    ) : (
                        <>
                            <FiCheckCircle className="attention-icon--success" />
                            <h3 className="principal-attention__title">Hệ thống ổn định</h3>
                        </>
                    )}
                </div>
                <div className="principal-attention__body">
                    {alerts.length > 0 ? (
                        alerts.map(alert => (
                            <div key={alert.id} className={`principal-attention__card principal-attention__card--${alert.type}`}>
                                <div className="attention-card-content">
                                    <span className="alert-icon">{alert.icon}</span>
                                    <span className="alert-message">{alert.message}</span>
                                </div>
                                <button className="alert-action-btn" onClick={() => navigate(alert.path)}>
                                    {alert.actionText} <FiArrowRight />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="principal-attention__complete">
                            <p className="complete-message">
                                Tuyệt vời! Tất cả chỉ số vận hành đang ở trạng thái ổn định. 
                                Hiện không có vấn đề khẩn cấp cần can thiệp.
                            </p>
                        </div>
                    )}
                </div>
            </footer>
        </div>
    );
}
