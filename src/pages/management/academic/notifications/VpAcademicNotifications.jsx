import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHeader, Pagination, SchoolYearTermSelector } from "../../../../components/common";
import { Modal, Select, Button } from "../../../../components/ui";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import { 
    FiBell, 
    FiCheck, 
    FiClock, 
    FiSend, 
    FiUsers, 
    FiPlus, 
    FiBookOpen, 
    FiFileText, 
    FiCheckSquare 
} from "react-icons/fi";
import { toast } from "react-toastify";
import { adminApiService } from "../../../../services/pages/admin/generated/adminApiService";
import "./VpAcademicNotifications.css";

const UI_TO_BE_TYPE = {
    directive: "announcement",
    approval: "general",
    warning: "alert",
    system: "general",
};

const BE_TO_UI_TYPE = {
    announcement: "directive",
    general: "system",
    alert: "warning",
    reminder: "warning",
};

const UI_TO_BE_TARGET = {
    all_teachers: "teacher",
    dept_heads: "teacher",
    homeroom_teachers: "teacher",
    grade10: "school",
    grade11: "school",
    grade12: "school",
};

const BE_TO_UI_AUDIENCE = {
    teacher: "all_teachers",
    school: "all_teachers",
    all: "all_teachers",
};

const getRows = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.notifications)) return payload.notifications;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
};

function formatRelativeTime(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays === 1) return "Hôm qua";
    return `${diffDays} ngày trước`;
}

const normalizeNotification = (item = {}) => {
    const beType = item.type || "general";
    const targetType = item.target_type || item.targetType || "teacher";
    return {
        id: item.id,
        title: item.title || "",
        desc: item.content || item.description || "",
        type: BE_TO_UI_TYPE[beType] || "system",
        isRead: Boolean(item.is_read ?? item.isRead ?? item.status === "sent"),
        time: formatRelativeTime(item.sent_at || item.created_at || item.date),
        audience: BE_TO_UI_AUDIENCE[targetType] || "all_teachers",
    };
};

export default function VpAcademicNotifications() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [selectedNotif, setSelectedNotif] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const itemsPerPage = 8;

    const [formData, setFormData] = useState({
        title: "",
        audience: "all_teachers",
        type: "directive",
        content: ""
    });

    const loadNotifications = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await adminApiService.get_notifications({
                params: { page: 1, limit: 100, targetType: "teacher" },
            });
            setNotifications(getRows(res).map(normalizeNotification));
        } catch (error) {
            console.error("[VpAcademicNotifications] loadNotifications error:", error);
            setNotifications([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    const unreadCount = notifications.filter(n => !n.isRead).length;
    const totalPages = Math.ceil(notifications.length / itemsPerPage) || 1;
    const paginatedNotifications = useMemo(() => notifications.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    ), [notifications, currentPage]);

    const handleMarkAllRead = async () => {
        await Promise.allSettled(
            notifications.filter((n) => !n.isRead).map((n) =>
                adminApiService.put_notifications_by_id_read({ pathParams: { id: n.id } })
            )
        );
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        toast.success("Đã đánh đọc tất cả thông báo chuyên môn");
    };

    const handleViewDetail = async (notif) => {
        setSelectedNotif(notif);
        if (!notif.isRead) {
            setNotifications(prev => prev.map(n => 
                n.id === notif.id ? { ...n, isRead: true } : n
            ));
            try {
                await adminApiService.put_notifications_by_id_read({ pathParams: { id: notif.id } });
            } catch { /* optimistic read state is acceptable */ }
        }
    };

    const handleSendDirective = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.content) {
            toast.error("Vui lòng nhập đầy đủ chủ đề và nội dung chỉ đạo.");
            return;
        }

        try {
            const createRes = await adminApiService.post_notifications({
                body: {
                    title: formData.title,
                    content: formData.content,
                    type: UI_TO_BE_TYPE[formData.type] || "announcement",
                    targetType: UI_TO_BE_TARGET[formData.audience] || "teacher",
                    status: "draft",
                    priority: formData.type === "warning" ? "high" : "normal",
                },
            });
            const notificationId = createRes?.data?.id || createRes?.id;
            if (notificationId) {
                await adminApiService.post_notifications_by_id_send({ pathParams: { id: notificationId } });
            }
            await loadNotifications();
            toast.success("Chỉ đạo chuyên môn đã được ban hành thành công!");
            setFormData({ title: "", audience: "all_teachers", type: "directive", content: "" });
            setIsComposeOpen(false);
        } catch (error) {
            console.error("[VpAcademicNotifications] send directive error:", error);
            toast.error("Không thể ban hành chỉ đạo chuyên môn.");
        }
    };

    const getAudienceLabel = (aud) => {
        switch(aud) {
            case 'all_teachers': return 'Toàn bộ Giáo viên';
            case 'dept_heads': return 'Tổ trưởng Chuyên môn';
            case 'homeroom_teachers': return 'Giáo viên Chủ nhiệm';
            case 'grade10': return 'Khối 10';
            case 'grade11': return 'Khối 11';
            case 'grade12': return 'Khối 12';
            default: return 'Khác';
        }
    };

    const getNotifIcon = (type) => {
        switch(type) {
            case 'directive': return <FiFileText />;
            case 'approval': return <FiCheckSquare />;
            case 'warning': return <FiBookOpen />;
            default: return <FiBell />;
        }
    };

    return (
        <div className="vpa-notifications animate-fade-in">
            <PageHeader
                title="Thông Báo Chỉ Đạo Chuyên Môn"
                eyebrow="Phó Hiệu trưởng Chuyên môn - Hệ thống điều hành học thuật"
                actions={
                    <div className="vpa-header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <SchoolYearTermSelector
                            selectedSchoolYear={selectedSchoolYear}
                            selectedTerm={selectedTerm}
                            onYearChange={handleYearArrow}
                            onTermChange={handleTermChange}
                        />
                        <Button className="vpa-btn-main" onClick={() => setIsComposeOpen(true)}>
                            <FiPlus /> Ban hành chỉ đạo
                        </Button>
                    </div>
                }
            />

            {/* Metrics Bar */}
            <div className="notif-metrics-bar">
                <div className="metric-card">
                    <div className="metric-icon-wrap primary">
                        <FiBookOpen />
                    </div>
                    <div className="metric-info">
                        <h4>Chỉ đạo mới</h4>
                        <div className="value">{notifications.length}</div>
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-icon-wrap unread">
                        <FiBell />
                    </div>
                    <div className="metric-info">
                        <h4>Chưa đọc</h4>
                        <div className="value">{unreadCount}</div>
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-icon-wrap sent">
                        <FiSend />
                    </div>
                    <div className="metric-info">
                        <h4>Đã ban hành</h4>
                        <div className="value">{notifications.length}</div>
                    </div>
                </div>
            </div>

            {/* Unified Inbox View */}
            <div className="notif-main-card">
                <div className="notif-list-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h3>Hộp thư & Lịch sử chỉ đạo</h3>
                    </div>
                    {unreadCount > 0 && (
                        <button className="btn-mark-all" onClick={handleMarkAllRead}>
                            <FiCheck /> Đánh dấu đọc hết
                        </button>
                    )}
                </div>

                <div className="notif-list">
                    {isLoading ? (
                        <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
                            <FiBookOpen style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }} />
                            <p>Đang tải chỉ đạo chuyên môn...</p>
                        </div>
                    ) : paginatedNotifications.map(notif => (
                        <div 
                            key={notif.id} 
                            className={`notif-item ${!notif.isRead ? 'unread' : ''}`}
                            onClick={() => handleViewDetail(notif)}
                        >
                            <div className={`notif-icon-box ${notif.type}`}>
                                {getNotifIcon(notif.type)}
                            </div>
                            <div className="notif-body">
                                <div className="notif-top-row">
                                    <h4 className="notif-title">{notif.title}</h4>
                                    <span className="notif-time-tag">
                                        <FiClock /> {notif.time}
                                    </span>
                                </div>
                                <p className="notif-desc">{notif.desc}</p>
                                <div className="notif-footer-row">
                                    <span className="audience-badge">
                                        <FiUsers style={{marginRight: '6px'}} /> 
                                        {getAudienceLabel(notif.audience)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {!isLoading && notifications.length === 0 && (
                        <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
                            <FiBookOpen style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }} />
                            <p>Chưa có chỉ đạo chuyên môn nào</p>
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="notif-pagination-wrapper">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>

            {/* Compose Modal */}
            <Modal
                open={isComposeOpen}
                onClose={() => setIsComposeOpen(false)}
                title="Ban hành Chỉ đạo Chuyên môn"
                className="academic-modal"
            >
                <form className="academic-compose-form" onSubmit={handleSendDirective}>
                    <div className="form-group">
                        <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Tiêu đề chỉ đạo *</label>
                        <input 
                            type="text" 
                            className="premium-input"
                            placeholder="Ví dụ: Chỉ đạo nộp kế hoạch bài dạy tuần..."
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                        />
                    </div>

                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Đối tượng nhận *</label>
                            <Select 
                                variant="custom"
                                options={[
                                    { value: "all_teachers", label: "Toàn bộ Giáo viên" },
                                    { value: "dept_heads", label: "Tổ trưởng Chuyên môn" },
                                    { value: "homeroom_teachers", label: "Giáo viên Chủ nhiệm" },
                                    { value: "grade10", label: "Toàn bộ Khối 10" },
                                    { value: "grade11", label: "Toàn bộ Khối 11" },
                                    { value: "grade12", label: "Toàn bộ Khối 12" }
                                ]}
                                value={formData.audience}
                                onChange={e => setFormData({...formData, audience: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Loại văn bản *</label>
                            <Select 
                                variant="custom"
                                options={[
                                    { value: "directive", label: "Chỉ đạo Chuyên môn" },
                                    { value: "approval", label: "Quyết định Phê duyệt" },
                                    { value: "warning", label: "Nhắc nhở & Cảnh báo" }
                                ]}
                                value={formData.type}
                                onChange={e => setFormData({...formData, type: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>Nội dung chi tiết *</label>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{formData.content.length} / 1000</span>
                        </div>
                        <textarea 
                            className="premium-textarea"
                            style={{ minHeight: '180px', resize: 'none' }}
                            placeholder="Nhập nội dung chỉ đạo thực hiện..."
                            maxLength="1000"
                            value={formData.content}
                            onChange={e => setFormData({...formData, content: e.target.value})}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <button type="submit" className="btn-send-academic">
                            <FiSend /> Ban Hành Ngay
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Detail Modal */}
            <Modal
                open={!!selectedNotif}
                onClose={() => setSelectedNotif(null)}
                title="Chi tiết chỉ đạo"
            >
                {selectedNotif && (
                    <div className="notif-detail-content animate-fade-in">
                        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                            <div className={`notif-icon-box ${selectedNotif.type}`}>
                                {getNotifIcon(selectedNotif.type)}
                            </div>
                            <div className="detail-title-area">
                                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>{selectedNotif.title}</h3>
                                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                                    <span className="notif-time-tag"><FiClock /> {selectedNotif.time}</span>
                                    <span className="audience-badge" style={{ marginTop: 0 }}>
                                        <FiUsers style={{marginRight: '6px'}} /> 
                                        {getAudienceLabel(selectedNotif.audience)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '1rem', marginTop: '1.5rem', lineHeight: '1.6', color: '#1e293b' }}>
                            <p>{selectedNotif.desc}</p>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                            <button 
                                className="btn-mark-all" 
                                style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }}
                                onClick={() => setSelectedNotif(null)}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
