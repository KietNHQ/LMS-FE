import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader, SchoolYearTermSelector, EventCalendar, LoadingSpinner } from "../../../../components/common";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import { dashboardStatsService } from "../../../../services/pages/admin";
import { schoolEventsService } from "../../../../services/pages/admin/school-events/schoolEventsService";
import { resolveSemesterId } from "../../../../services/shared/schoolYearLookup";
import {
    FiUsers, FiUserCheck, FiHome, FiDollarSign, FiStar, FiActivity,
    FiShield, FiBell, FiTrendingUp, FiCheckCircle, FiBarChart2, FiAlertCircle,
    FiArrowRight, FiTrendingDown, FiBookOpen, FiCalendar
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { CALENDAR_EVENT_TYPES } from "../../../../components/common/EventCalendar/eventData";
import "./PrincipalDashboard.css";

const EVENT_COLOR_MAP = {
    exam: "blue",
    holiday: "orange",
    ceremony: "red",
    meeting: "teal",
    other: "blue",
};

export default function PrincipalDashboard() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Resolve current semester ID
    const { data: semesterId } = useQuery({
        queryKey: ["semester-id", selectedSchoolYear, selectedTerm],
        queryFn: () => resolveSemesterId(selectedSchoolYear, selectedTerm),
        enabled: Boolean(selectedSchoolYear),
        staleTime: Infinity,
    });

    // School-wide stats (students / teachers / classes)
    const { data: schoolStats } = useQuery({
        queryKey: ["school-stats", selectedSchoolYear],
        queryFn: () => dashboardStatsService.getSchoolStats({ schoolYear: selectedSchoolYear }),
        staleTime: 5 * 60 * 1000,
    });

    // Grade lock progress
    const { data: gradeLockStats } = useQuery({
        queryKey: ["grade-lock-stats", semesterId, selectedSchoolYear],
        queryFn: () => dashboardStatsService.getGradeLockStats({ semesterId, schoolYear: selectedSchoolYear }),
        enabled: Boolean(selectedSchoolYear),
        staleTime: 60_000,
    });

    // Alerts
    const { data: alerts } = useQuery({
        queryKey: ["dashboard-alerts", selectedSchoolYear],
        queryFn: () => dashboardStatsService.getAlerts({ schoolYear: selectedSchoolYear }),
        staleTime: 60_000,
    });

    // Quick links data
    const { data: quickLinksData } = useQuery({
        queryKey: ["quick-links-data", selectedSchoolYear],
        queryFn: () => dashboardStatsService.getQuickLinksData({ schoolYear: selectedSchoolYear }),
        staleTime: 60_000,
    });

    // School events for the calendar
    const { data: schoolEvents = [], isLoading: eventsLoading } = useQuery({
        queryKey: ["school-events", semesterId, selectedSchoolYear],
        queryFn: () => schoolEventsService.list({ semesterId, schoolYearId: null }),
        enabled: Boolean(selectedSchoolYear),
        staleTime: 5 * 60 * 1000,
    });

    // Normalize events to what EventCalendar expects
    const calendarEvents = useMemo(() => {
        return schoolEvents.map((e) => {
            const dateStr = e.date
                ? new Date(e.date).toISOString().split("T")[0]
                : "";
            const endStr = e.endDate
                ? new Date(e.endDate).toISOString().split("T")[0]
                : dateStr;
            return {
                startDay: dateStr,
                endDay: endStr,
                title: e.title,
                content: e.description || "",
                color: e.color || EVENT_COLOR_MAP[e.eventType] || "blue",
                eventType: e.eventType,
                id: e.id,
                createdBy: e.createdByUser?.full_name || "",
                createdRole: e.createdByUser?.role === "admin" ? "Quản trị viên" : "Giáo viên",
            };
        });
    }, [schoolEvents]);

    // Stats defaults
    const totalStudents = schoolStats?.totalStudents ?? 0;
    const totalTeachers = schoolStats?.totalTeachers ?? 0;
    const totalClasses = schoolStats?.totalClasses ?? 0;

    // Grade progress defaults
    const gradeProgress = gradeLockStats || {
        draft: 0, pending: 0, finalized: 0, total: 0, byGrade: [],
    };

    // Quick links
    const quickInsights = [
        {
            id: "reports",
            label: "Báo cáo Tổng hợp (Toàn trường)",
            icon: <FiBarChart2 />,
            path: "/management/reports",
            insight: totalStudents > 0 ? `${totalStudents.toLocaleString()} HS trong hệ thống` : "Chưa có dữ liệu",
            type: totalStudents > 0 ? "info" : "danger",
        },
        {
            id: "audit",
            label: "Audit Logs (Truy xuất Nhật ký)",
            icon: <FiShield />,
            path: "/management/audit-logs",
            insight: quickLinksData?.newLogs ? `${quickLinksData.newLogs} log mới` : "Truy xuất hệ thống",
            type: "warning",
        },
        {
            id: "notifications",
            label: "Gửi Thông báo Chỉ đạo Nóng",
            icon: <FiBell />,
            path: "/management/notifications",
            insight: quickLinksData?.unreadCount ? `${quickLinksData.unreadCount} chưa đọc` : "Gửi thông báo nhanh",
            type: quickLinksData?.unreadCount ? "success" : "info",
        },
        {
            id: "classes",
            label: "Quản lý Lớp học Toàn trường",
            icon: <FiHome />,
            path: "/management/classes",
            insight: totalClasses > 0 ? `${totalClasses} lớp đang hoạt động` : "Chưa có lớp học",
            type: totalClasses > 0 ? "info" : "danger",
        },
        {
            id: "attendance",
            label: "Phân tích Chuyên cần Hệ thống",
            icon: <FiTrendingUp />,
            path: "/management/academic",
            insight: totalTeachers > 0 ? `${totalTeachers} GV đang giảng dạy` : "Chưa có dữ liệu GV",
            type: totalTeachers > 0 ? "info" : "danger",
        },
    ];

    // Handle create event
    const handleAddEvent = async (eventData) => {
        console.log("[handleAddEvent] incoming:", eventData);
        try {
            await schoolEventsService.create({
                ...eventData,
                semesterId,
                schoolYearId: null,
            });
            queryClient.invalidateQueries({ queryKey: ["school-events"] });
        } catch (err) {
            console.error("Failed to create event:", err);
        }
    };

    const semesterLabel = selectedTerm === "hk1" ? "Học kỳ 1" : "Học kỳ 2";
    const finalizedPercent = gradeProgress.total > 0
        ? Math.round((gradeProgress.finalized / gradeProgress.total) * 100) : 0;
    const isLoading = eventsLoading;

    return (
        <div className="principal-dashboard">
            <PageHeader
                title={`Hệ Thống Quản Trị ${(() => {
                    try {
                        const user = JSON.parse(localStorage.getItem("user") || "{}");
                        return user.fullName || "Cán Bộ Quản Lý";
                    } catch { return "Cán Bộ Quản Lý"; }
                })()}`}
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            {isLoading ? (
                <div className="layout-loading-wrapper">
                    <LoadingSpinner size="lg" label="Đang cập nhật dữ liệu quản trị..." role="admin" />
                </div>
            ) : (
                <>

                {/* Strategic Stats */}
                <div className="principal-dashboard__stats">
                    <div className="pstat-card clickable" onClick={() => navigate("/management/users?role=student")}>
                        <div className="pstat-card__icon pstat-card__icon--students"><FiUsers /></div>
                        <div className="pstat-card__body">
                            <p className="pstat-card__label">Học sinh</p>
                            <h3 className="pstat-card__value">{totalStudents.toLocaleString()}</h3>
                        </div>
                    </div>
                    <div className="pstat-card clickable" onClick={() => navigate("/management/users?role=teacher")}>
                        <div className="pstat-card__icon pstat-card__icon--teachers"><FiUserCheck /></div>
                        <div className="pstat-card__body">
                            <p className="pstat-card__label">Giáo viên</p>
                            <h3 className="pstat-card__value">{totalTeachers}</h3>
                        </div>
                    </div>
                    <div className="pstat-card clickable" onClick={() => navigate("/management/classes")}>
                        <div className="pstat-card__icon pstat-card__icon--classes"><FiHome /></div>
                        <div className="pstat-card__body">
                            <p className="pstat-card__label">Lớp học</p>
                            <h3 className="pstat-card__value">{totalClasses}</h3>
                        </div>
                    </div>
                    <div className="pstat-card clickable" onClick={() => navigate("/management/finance")}>
                        <div className="pstat-card__icon pstat-card__icon--rate"><FiDollarSign /></div>
                        <div className="pstat-card__body">
                            <p className="pstat-card__label">Thu tài chính</p>
                            <h3 className="pstat-card__value">—</h3>
                        </div>
                    </div>
                    <div className="pstat-card clickable" onClick={() => navigate("/management/reports")}>
                        <div className="pstat-card__icon pstat-card__icon--good"><FiStar /></div>
                        <div className="pstat-card__body">
                            <p className="pstat-card__label">Học lực Khá/Giỏi</p>
                            <h3 className="pstat-card__value">—</h3>
                        </div>
                    </div>
                    <div className="pstat-card clickable" onClick={() => navigate("/management/academic")}>
                        <div className="pstat-card__icon pstat-card__icon--attendance"><FiActivity /></div>
                        <div className="pstat-card__body">
                            <p className="pstat-card__label">Chuyên cần</p>
                            <h3 className="pstat-card__value">—</h3>
                        </div>
                    </div>
                </div>

                <div className="principal-dashboard__panels">
                    {/* Grade Progress Panel */}
                    <div className="principal-panel">
                        <div className="principal-panel__head">
                            <h2 className="principal-panel__title">Tiến độ Chốt Sổ Điểm Toàn Trường</h2>
                            <div className="principal-panel__sub">
                                {semesterLabel}
                                {gradeProgress.byGrade.length > 0 ? (
                                    <span style={{ marginLeft: "0.5rem" }}>
                                        {gradeProgress.byGrade.map((g, idx) => (
                                            <span key={g.label} className="grade-progress-pill">
                                                {g.label}: <strong>{g.finalized}/{g.total}</strong>
                                                {idx < gradeProgress.byGrade.length - 1 && <span className="pill-sep">•</span>}
                                            </span>
                                        ))}
                                    </span>
                                ) : (
                                    <span className="grade-progress-pill" style={{ marginLeft: "0.5rem" }}>
                                        Chưa có dữ liệu chốt sổ điểm
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="grade-progress-summary">
                            <div className="gps-header">
                                <p className="grade-progress-label">
                                    {gradeProgress.total > 0
                                        ? `${finalizedPercent}% Hệ thống đã khóa điểm`
                                        : "Chưa có dữ liệu chốt sổ điểm"}
                                </p>
                                {gradeProgress.total > 0 && <span className="gps-pulse-dot" />}
                            </div>
                            {gradeProgress.total > 0 && (
                                <div className="grade-progress-bar-wrap">
                                    <div
                                        className="grade-progress-bar"
                                        style={{ width: `${finalizedPercent}%` }}
                                    >
                                        <div className="bar-glow-point" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grade-progress-breakdown">
                            <div className="gpb-card gpb-card--draft">
                                <div className="gpb-card-icon"><FiBookOpen /></div>
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
                                onClick={() => navigate("/management/approvals")}
                            >
                                <FiCheckCircle /> Đi tới Trung tâm Phê duyệt
                            </button>
                            <button
                                className="principal-btn principal-btn--ghost"
                                onClick={() => navigate("/management/reports")}
                            >
                                Xem báo cáo hạ tầng Chuyên môn <span className="btn-arrow">→</span>
                            </button>
                        </div>
                    </div>

                    {/* Quick Access Panel */}
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

                {/* Operational Calendar */}
                <div style={{ marginTop: "1rem" }}>
                    <EventCalendar
                        title="Lịch Vận Hành Toàn Trường"
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        themeClass="theme-admin"
                        userRole="admin"
                        isCompact={false}
                        initialEvents={calendarEvents}
                        eventTypes={CALENDAR_EVENT_TYPES}
                        onAddEvent={handleAddEvent}
                    />
                </div>

                {/* Alerts Footer */}
                <footer className={`principal-attention ${(alerts || []).length === 0 ? "principal-attention--empty" : ""}`}>
                    <div className="principal-attention__head">
                        {(alerts || []).length > 0 ? (
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
                        {(alerts || []).length > 0 ? (
                            (alerts || []).map(alert => (
                                <div key={alert.id} className={`principal-attention__card principal-attention__card--${alert.type}`}>
                                    <div className="attention-card-content">
                                        <span className="alert-icon">
                                            {alert.icon === "FiAlertCircle" ? <FiAlertCircle /> :
                                             alert.icon === "FiTrendingDown" ? <FiTrendingDown /> :
                                             alert.icon === "FiDollarSign" ? <FiDollarSign /> :
                                             <FiAlertCircle />}
                                        </span>
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
                </>
            )}
        </div>
    );
}
