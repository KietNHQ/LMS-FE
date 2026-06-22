import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PageHeader, SchoolYearTermSelector, EventCalendar } from "../../../../components/common";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import { vpAcademicService } from "../../../../services/pages/management/vp-academic";
import {
    FiCheckCircle, FiAlertTriangle, FiUnlock, FiTrendingDown,
    FiClock, FiActivity, FiInfo, FiSearch
} from "react-icons/fi";
import { Modal, Select, Button, Input } from "../../../../components/ui";
import OperationalAlerts from "./components/OperationalAlerts";
import { CALENDAR_EVENT_TYPES } from "../../../../components/common/EventCalendar/eventData";
import { resolveSemesterId } from "../../../../services/shared/schoolYearLookup";
import "./VpAcademicDashboard.css";

const getRows = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.data?.requests)) return payload.data.requests;
    if (Array.isArray(payload?.requests)) return payload.requests;
    if (Array.isArray(payload?.logs)) return payload.logs;
    return [];
};

const formatTime = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString("vi-VN");
};

const getAuditMessage = (item = {}) =>
    item.description ||
    item.action ||
    item.message ||
    item.event ||
    `${item.tableName || item.table_name || "Hệ thống"} được cập nhật`;

const normalizeAuditLog = (item = {}) => ({
    id: item.id || `${item.createdAt || item.created_at}-${item.action || ""}`,
    time: formatTime(item.createdAt || item.created_at || item.timestamp),
    message: getAuditMessage(item),
    module: item.tableName || item.table_name || item.module || "Hệ thống",
    actor: item.userName || item.user_name || item.user?.fullName || item.user?.email || "",
    status: String(item.action || "").toLowerCase().includes("delete") ? "warning" : "info",
});

const normalizeUnlockRequest = (item = {}) => ({
    id: item.id,
    type: "Phê duyệt",
    typeClass: "urgent",
    title: item.title || item.reason || `Yêu cầu mở khóa #${item.id}`,
    content: item.target_type || item.targetType ? ` (${item.target_type || item.targetType})` : "",
    time: formatTime(item.created_at || item.createdAt || item.requested_at),
    path: "/management/approvals",
    urgent: item.status === "pending",
    severity: item.status === "pending" ? "high" : "medium",
    desc: item.reason || item.review_notes || "",
});

export default function VpAcademicDashboard() {
    const navigate = useNavigate();
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [showHistory, setShowHistory] = useState(false);
    const [filterDate, setFilterDate] = useState("2026-04-22");
    const [selectedModule, setSelectedModule] = useState("Tất cả phân hệ");

    const moduleOptions = [
        { value: "Tất cả phân hệ", label: "Tất cả phân hệ" },
        { value: "Điểm số", label: "Điểm số" },
        { value: "Hồ sơ chuyên môn", label: "Hồ sơ chuyên môn" },
        { value: "Thời khóa biểu", label: "Thời khóa biểu" },
    ];

    // 1. Resolve semester ID first
    const { data: resolvedSemesterId } = useQuery({
        queryKey: ["semester-id", selectedSchoolYear, selectedTerm],
        queryFn: () => resolveSemesterId(selectedSchoolYear, selectedTerm || "hk1"),
        enabled: Boolean(selectedSchoolYear),
        staleTime: 5 * 60 * 1000,
    });

    // 2. Sử dụng TanStack Query để quản lý dữ liệu thống kê học vụ
    const { data: stats } = useQuery({
        queryKey: ["academic-stats", resolvedSemesterId],
        queryFn: async () => {
            if (!resolvedSemesterId) return null;
            return vpAcademicService.getAssessmentWorkflowStats(resolvedSemesterId);
        },
        enabled: Boolean(resolvedSemesterId),
        staleTime: 5 * 60 * 1000,
    });

    const { data: pendingRequestsRaw = [] } = useQuery({
        queryKey: ["academic-pending-unlock-requests", resolvedSemesterId],
        queryFn: async () => {
            const res = await vpAcademicService.callByKey("get_unlock_requests", {
                params: { status: "pending", semesterId: resolvedSemesterId, limit: 10 },
            });
            return getRows(res);
        },
        enabled: Boolean(resolvedSemesterId),
        staleTime: 60_000,
    });

    const { data: auditLogsRaw = [] } = useQuery({
        queryKey: ["academic-audit-logs", filterDate, selectedModule],
        queryFn: async () => {
            const params = { limit: 20 };
            if (filterDate) {
                params.startDate = filterDate;
                params.endDate = filterDate;
            }
            if (selectedModule !== "Tất cả phân hệ") {
                params.tableName = selectedModule;
            }
            const res = await vpAcademicService.callByKey("get_audit_logs", { params });
            return getRows(res);
        },
        staleTime: 60_000,
    });

    // 2. Tính toán các chỉ số KPI dựa trên dữ liệu trả về
    const primaryStats = useMemo(() => {
        const pending = Number(stats?.pendingCount ?? stats?.pending ?? stats?.waitingCount ?? 0);
        const overdue = Number(stats?.overdueCount ?? stats?.overdue ?? 0);
        const progress = Number(stats?.completionRate ?? stats?.progressRate ?? 0);
        const qualityDrop = Number(stats?.declineCount ?? stats?.qualityDropCount ?? 0);

        return [
            { label: "Tiến độ Nhập Điểm", value: `${progress || 0}%`, trend: "", status: "success", icon: <FiCheckCircle /> },
            { label: "Lớp/Môn Quá Hạn", value: `${overdue || 0}`, trend: "", status: "danger", icon: <FiAlertTriangle /> },
            { label: "Yêu cầu Chờ Duyệt", value: `${pending || 0}`, trend: "", status: "warning", icon: <FiUnlock /> },
            { label: "Sụt giảm Chất lượng", value: `${qualityDrop || 0}`, trend: "", status: "danger", icon: <FiTrendingDown /> },
        ];
    }, [stats]);

    const latestUpdates = useMemo(() => pendingRequestsRaw.map(normalizeUnlockRequest), [pendingRequestsRaw]);
    const auditLogs = useMemo(() => auditLogsRaw.map(normalizeAuditLog), [auditLogsRaw]);
    const dashboardAlerts = useMemo(() => latestUpdates.map((item) => ({
        id: item.id,
        type: "process",
        title: item.title,
        desc: item.desc || item.content,
        severity: item.severity,
        path: item.path,
    })), [latestUpdates]);

    // Filter event types to only allow "Ngày kiểm tra" for VP Academic
    const ACADEMIC_EVENT_TYPES = CALENDAR_EVENT_TYPES.filter(type => type.label === "Ngày kiểm tra");

    return (
        <div className="vpa-cockpit academic-layout">
            <PageHeader
                title="Trung Tâm Điều Hành Chuyên Môn"
                eyebrow="Phó Hiệu trưởng Chuyên môn - Buồng lái vận hành học vụ"
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />
            
            {/* Row 1: Primary Cockpit Stats (KPIs) */}
            <div className="vpa-stats-grid-premium">
                {primaryStats.map((stat, i) => (
                    <div key={i} className={`vpa-stat-card-premium ${stat.status}`}>
                        <div className="vpa-card-top">
                            <div className="vpa-card-icon">{stat.icon}</div>
                            <span className="vpa-card-trend">{stat.trend}</span>
                        </div>
                        <div className="vpa-card-body">
                            <h3 className="vpa-card-value text-glow">{stat.value}</h3>
                            <p className="vpa-card-label">{stat.label}</p>
                        </div>
                        <div className="vpa-card-footer">
                            <button className="vpa-card-action">Chi tiết</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="vpa-dashboard-content">
                {/* Row 2: Operational Alerts & Latest Updates (Side-by-side) */}
                <div className="vpa-ops-row animate-slide-up">
                    <div className="vpa-alerts-slot">
                        <OperationalAlerts alerts={dashboardAlerts} />
                    </div>
                    
                    <div className="vpa-updates-slot">
                        <div className="vpa-updates-card shadow-premium">
                            <div className="updates-header">
                                <div className="header-left">
                                    <FiActivity className="pulse-icon" />
                                    <h3>Cập nhật & Vấn đề gấp</h3>
                                </div>
                                <span className="update-count">{latestUpdates.length} mới</span>
                            </div>

                            <div className="updates-list">
                                {latestUpdates.length === 0 ? (
                                    <div className="update-item">
                                        <div className="update-inner">
                                            <p>Không có cập nhật gấp từ cơ sở dữ liệu.</p>
                                        </div>
                                    </div>
                                ) : latestUpdates.map(item => (
                                    <div 
                                        key={item.id} 
                                        className={`update-item ${item.urgent ? 'urgent' : ''}`}
                                        onClick={() => navigate(item.path)}
                                    >
                                        <div className={`update-type ${item.typeClass}`}>{item.type}</div>
                                        <div className="update-inner">
                                            <p><strong>{item.title}</strong>{item.content}</p>
                                            <span className="update-time">{item.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Row 3: Full Width Audit Feed (Operational Log) */}
                <div className="vpa-audit-row animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="audit-feed-vpa shadow-premium">
                        <div className="feed-header">
                            <div className="header-left">
                                <FiInfo /> <h4>Nhật ký vận hành mới nhất - <span>Hôm nay</span></h4>
                            </div>
                            <button className="btn-view-logs" onClick={() => setShowHistory(true)}>
                                <FiClock /> Xem lịch sử đầy đủ
                            </button>
                        </div>
                        <div className="vpa-audit-row-grid">
                            {auditLogs.slice(0, 3).length === 0 ? (
                                <div className="feed-item">
                                    <span className="feed-dot info"></span>
                                    <span className="feed-msg">Chưa có nhật ký vận hành từ cơ sở dữ liệu.</span>
                                </div>
                            ) : auditLogs.slice(0, 3).map((item) => (
                                <div key={item.id} className="feed-item">
                                    <span className={`feed-dot ${item.status}`}></span>
                                    <span className="feed-time">{item.time}</span>
                                    <span className="feed-msg">{item.message}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Audit History Modal (Using Common UI Components) */}
                <Modal 
                    open={showHistory} 
                    onClose={() => setShowHistory(false)}
                    title="Lịch sử vận hành chi tiết"
                    className="vpa-history-modal-fixed"
                >
                    <div className="vpa-history-modal-inner">
                        <p className="modal-subtitle">Tra cứu nhật ký hoạt động hệ thống theo thời gian</p>
                        
                        <div className="modal-toolbar">
                            <div className="filter-group">
                                <Input 
                                    label="NGÀY XEM"
                                    type="date"
                                    value={filterDate}
                                    onChange={(e) => setFilterDate(e.target.value)}
                                    className="vpa-date-filter"
                                />
                                <Select 
                                    label="PHÂN HỆ"
                                    options={moduleOptions}
                                    value={selectedModule}
                                    onChange={(e) => setSelectedModule(e.target.value)}
                                    variant="custom"
                                    className="vpa-module-select"
                                />
                            </div>
                            <div className="search-group">
                                <Input 
                                    placeholder="Tìm kiếm nội dung nhật ký..."
                                    className="vpa-history-search"
                                    inputClassName="vpa-search-input"
                                />
                                <FiSearch className="search-icon-abs" />
                            </div>
                        </div>

                        <div className="modal-content-list">
                            <div className="history-group">
                                <span className="group-label">Kết quả cho ngày: {filterDate}</span>
                                <div className="history-list">
                                    {auditLogs.length === 0 ? (
                                        <div className="history-item">
                                            <div className="h-content">
                                                <p>Không có nhật ký phù hợp với bộ lọc.</p>
                                            </div>
                                        </div>
                                    ) : auditLogs.map((item) => (
                                        <div key={item.id} className="history-item">
                                            <div className="h-time">{item.time}</div>
                                            <div className="h-dot-container"><div className={`h-dot ${item.status}`}></div></div>
                                            <div className="h-content">
                                                <p>{item.message}</p>
                                                <span className="h-meta">Phân hệ: {item.module}{item.actor ? ` • Người thực hiện: ${item.actor}` : ""}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        <div className="modal-footer-actions">
                            <Button variant="secondary" onClick={() => window.print()}>
                                Xuất File Excel
                            </Button>
                            <Button variant="primary" onClick={() => setShowHistory(false)} style={{ background: '#0f172a' }}>
                                Đóng
                            </Button>
                        </div>
                    </div>
                </Modal>

                {/* Row 4: Calendar (Full Width) */}
                <div className="vpa-calendar-row animate-slide-up" style={{ animationDelay: '0.15s' }}>
                    <EventCalendar 
                        title="Lịch Vận Hành Học Thuật"
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        themeClass="theme-academic"
                        userRole="admin"
                        isCompact={false}
                        initialEvents={[]}
                        eventTypes={CALENDAR_EVENT_TYPES}
                        creatableTypes={ACADEMIC_EVENT_TYPES}
                        showTargetSelector={false}
                    />
                </div>
            </div>
        </div>
    );
}
