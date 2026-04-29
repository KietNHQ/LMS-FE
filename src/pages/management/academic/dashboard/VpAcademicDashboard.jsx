import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader, SchoolYearTermSelector, EventCalendar } from "../../../../components/common";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import { vpAcademicService } from "../../../../services/pages/vp-academic";
import {
    FiCheckCircle, FiAlertTriangle, FiUnlock, FiTrendingDown,
    FiClock, FiActivity, FiInfo, FiSearch
} from "react-icons/fi";
import { Modal, Select, Button, Input } from "../../../../components/ui";
import OperationalAlerts from "./components/OperationalAlerts";
import { INITIAL_CALENDAR_EVENTS, CALENDAR_EVENT_TYPES } from "../../../../components/common/EventCalendar/eventData";
import "./VpAcademicDashboard.css";

const LATEST_UPDATES = [
    { id: 1, type: "Phê duyệt", typeClass: "urgent", title: "03 Đề thi HK2", content: " đang chờ ký duyệt nội dung (Tổ Toán).", time: "15 phút trước", path: "/vp-academic/approvals", urgent: true },
    { id: 2, type: "Hồ sơ", typeClass: "doc", title: "Tổ Văn đã tải lên ", content: "Kế hoạch dạy học bổ trợ mới.", time: "1 giờ trước", path: "/vp-academic/data-management" },
    { id: 3, type: "Điểm số", typeClass: "grade", title: "Hệ thống ghi nhận ", content: "12 yêu cầu sửa điểm sau khóa tại khối 10.", time: "3 giờ trước", path: "/vp-academic/grades" },
    { id: 4, type: "Hệ thống", typeClass: "system", title: "Đã hoàn thành ", content: "Đồng bộ CSDL Sở GD kỳ 1.", time: "Hôm qua", path: "/vp-academic/data-management" },
    { id: 5, type: "Kỳ thi", typeClass: "exam", title: "Cảnh báo: 05 phòng thi", content: " chưa đủ giám thị coi thi.", time: "Hôm qua", path: "/vp-academic/exams", urgent: true },
    { id: 6, type: "Hồ sơ", typeClass: "doc", title: "Tổ Lý đã bổ sung ", content: "Danh sách học sinh giỏi cấp cụm.", time: "2 ngày trước", path: "/vp-academic/data-management" },
];

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

    // Top 4 Primary KPIs
    const [primaryStats, setPrimaryStats] = useState([
        { label: "Tiến độ Nhập Điểm", value: "92.5%", trend: "+2.1%", status: "success", icon: <FiCheckCircle /> },
        { label: "Lớp/Môn Quá Hạn", value: "08", trend: "-2", status: "danger", icon: <FiAlertTriangle /> },
        { label: "Yêu cầu Chờ Duyệt", value: "05", trend: "+3", status: "warning", icon: <FiUnlock /> },
        { label: "Sụt giảm Chất lượng", value: "03", trend: "+1", status: "danger", icon: <FiTrendingDown /> },
    ]);

    useEffect(() => {
        let isMounted = true;

        const loadAcademicStats = async () => {
            try {
                const stats = await vpAcademicService.getAssessmentWorkflowStats(selectedTerm, {
                    params: { schoolYearId: selectedSchoolYear },
                });

                if (!isMounted || !stats) return;

                const pending = Number(stats.pendingCount ?? stats.pending ?? stats.waitingCount ?? 0);
                const overdue = Number(stats.overdueCount ?? stats.overdue ?? 0);
                const progress = Number(stats.completionRate ?? stats.progressRate ?? 0);
                const qualityDrop = Number(stats.declineCount ?? stats.qualityDropCount ?? 0);

                setPrimaryStats((prev) => [
                    { ...prev[0], value: progress > 0 ? `${progress}%` : prev[0].value },
                    { ...prev[1], value: overdue > 0 ? `${overdue}` : prev[1].value },
                    { ...prev[2], value: pending > 0 ? `${pending}` : prev[2].value },
                    { ...prev[3], value: qualityDrop > 0 ? `${qualityDrop}` : prev[3].value },
                ]);
            } catch (_) {}
        };

        loadAcademicStats();
        return () => { isMounted = false; };
    }, [selectedSchoolYear, selectedTerm]);

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
                        <OperationalAlerts />
                    </div>
                    
                    <div className="vpa-updates-slot">
                        <div className="vpa-updates-card shadow-premium">
                            <div className="updates-header">
                                <div className="header-left">
                                    <FiActivity className="pulse-icon" />
                                    <h3>Cập nhật & Vấn đề gấp</h3>
                                </div>
                                <span className="update-count">5 mới</span>
                            </div>

                            <div className="updates-list">
                                {LATEST_UPDATES.map(item => (
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
                            <div className="feed-item">
                                <span className="feed-dot success"></span>
                                <span className="feed-time">10:15</span>
                                <span className="feed-msg">GV. Nguyễn Y đã cập nhật điểm kiểm tra miệng lớp <strong>12A1</strong></span>
                            </div>
                            <div className="feed-item">
                                <span className="feed-dot warning"></span>
                                <span className="feed-time">09:45</span>
                                <span className="feed-msg">Hệ thống tự động mở khóa nhập điểm lớp <strong>10A2</strong> (theo yêu cầu)</span>
                            </div>
                            <div className="feed-item">
                                <span className="feed-dot info"></span>
                                <span className="feed-time">08:30</span>
                                <span className="feed-msg">Đã đồng bộ thành công dữ liệu từ phân hệ <strong>Thời khóa biểu</strong></span>
                            </div>
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
                                    <div className="history-item">
                                        <div className="h-time">10:15</div>
                                        <div className="h-dot-container"><div className="h-dot success"></div></div>
                                        <div className="h-content">
                                            <p>GV. Nguyễn Y đã cập nhật điểm kiểm tra miệng lớp <strong>12A1</strong></p>
                                            <span className="h-meta">Phân hệ: Điểm số • Thiết bị: Web Browser (Chrome)</span>
                                        </div>
                                    </div>
                                    <div className="history-item">
                                        <div className="h-time">09:45</div>
                                        <div className="h-dot-container"><div className="h-dot warning"></div></div>
                                        <div className="h-content">
                                            <p>Hệ thống tự động mở khóa nhập điểm lớp <strong>10A2</strong> (theo yêu cầu)</p>
                                            <span className="h-meta">Phân hệ: Hệ thống • Tác nghiệp: Tự động</span>
                                        </div>
                                    </div>
                                    <div className="history-item">
                                        <div className="h-time">08:30</div>
                                        <div className="h-dot-container"><div className="h-dot info"></div></div>
                                        <div className="h-content">
                                            <p>Đã đồng bộ thành công dữ liệu từ phân hệ <strong>Thời khóa biểu</strong></p>
                                            <span className="h-meta">Phân hệ: Thời khóa biểu • Dung lượng: 45KB</span>
                                        </div>
                                    </div>
                                    <div className="history-item">
                                        <div className="h-time">07:50</div>
                                        <div className="h-dot-container"><div className="h-dot success"></div></div>
                                        <div className="h-content">
                                            <p>GV. Lê Văn A đã nộp báo cáo <strong>Kế hoạch dạy học</strong> tuần 27.</p>
                                            <span className="h-meta">Phân hệ: Hồ sơ chuyên môn • Trạng thái: Đã nộp</span>
                                        </div>
                                    </div>
                                    <div className="history-item">
                                        <div className="h-time">07:20</div>
                                        <div className="h-dot-container"><div className="h-dot info"></div></div>
                                        <div className="h-content">
                                            <p>Hệ thống hoàn tất sao lưu <strong>CSDL Học sinh</strong> định kỳ hàng ngày.</p>
                                            <span className="h-meta">Phân hệ: Hệ thống • Dung lượng: 1.2GB</span>
                                        </div>
                                    </div>
                                    <div className="history-item">
                                        <div className="h-time">06:45</div>
                                        <div className="h-dot-container"><div className="h-dot warning"></div></div>
                                        <div className="h-content">
                                            <p>Cảnh báo: Phát hiện <strong>05 yêu cầu sửa điểm</strong> vượt quá thời gian quy định.</p>
                                            <span className="h-meta">Phân hệ: Điểm số • Mức độ: Cần lưu tâm</span>
                                        </div>
                                    </div>
                                    <div className="history-item">
                                        <div className="h-time">06:00</div>
                                        <div className="h-dot-container"><div className="h-dot success"></div></div>
                                        <div className="h-content">
                                            <p>Tin nhắn: Tổ trưởng tổ Toán đã phê duyệt <strong>Đề cương ôn tập</strong> khối 12.</p>
                                            <span className="h-meta">Phân hệ: Hồ sơ chuyên môn • Người duyệt: GV. Phạm B</span>
                                        </div>
                                    </div>
                                    <div className="history-item">
                                        <div className="h-time">05:30</div>
                                        <div className="h-dot-container"><div className="h-dot info"></div></div>
                                        <div className="h-content">
                                            <p>Tự động cập nhật <strong>Danh sách vắng thi</strong> từ phân hệ Khảo thí.</p>
                                            <span className="h-meta">Phân hệ: Điểm số • Số lượng: 02 HS</span>
                                        </div>
                                    </div>
                                    <div className="history-item">
                                        <div className="h-time">04:30</div>
                                        <div className="h-dot-container"><div className="h-dot success"></div></div>
                                        <div className="h-content">
                                            <p>Phê duyệt danh sách <strong>Học sinh giỏi</strong> cấp Thành phố.</p>
                                            <span className="h-meta">Phân hệ: Hồ sơ chuyên môn • Tác nhân: PHT Chuyên môn</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="modal-footer-actions">
                            <Button variant="secondary" onClick={() => console.log("Exporting...")}>
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
                        initialEvents={INITIAL_CALENDAR_EVENTS}
                        eventTypes={CALENDAR_EVENT_TYPES}
                        creatableTypes={ACADEMIC_EVENT_TYPES}
                        showTargetSelector={false}
                    />
                </div>
            </div>
        </div>
    );
}
