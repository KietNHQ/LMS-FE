import { useState } from "react";
import { PageHeader, Pagination } from "../../../../components/common";
import { Modal, Select } from "../../../../components/ui";
import DisciplineHeaderActions from "../components/DisciplineHeaderActions";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import {
    FiBell,
    FiCheck,
    FiClock,
    FiSend,
    FiUsers,
    FiPlus,
    FiAlertTriangle,
    FiAward,
    FiDatabase
} from "react-icons/fi";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApiService } from "../../../../services/pages/admin/generated/adminApiService";
import "./VpDisciplineNotifications.css";

const ITEMS_PER_PAGE = 8;

const FE_TO_BE_TYPE = {
    warning: "alert",
    competition: "announcement",
    system: "general",
};

const BE_TO_FE_TYPE = {
    alert: "warning",
    announcement: "competition",
    general: "system",
};

const FE_TO_BE_TARGET = {
    all_students: "school",
    homeroom: "teacher",
    all_teachers: "teacher",
    all_parents: "student",
};

const BE_TO_FE_AUDIENCE = {
    school: "all_students",
    teacher: "homeroom",
    student: "all_parents",
    class: "specific_class",
};

function formatRelativeTime(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays === 1) return "Hôm qua";
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 14) return "1 tuần trước";
    return `${Math.floor(diffDays / 7)} tuần trước`;
}

export default function VpDisciplineNotifications() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [selectedNotif, setSelectedNotif] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const queryClient = useQueryClient();

    const { data: listRes, isLoading } = useQuery({
        queryKey: ["notifications", "admin-list"],
        queryFn: () =>
            adminApiService.get_notifications({ params: { page: 1, limit: 100 } }),
        staleTime: 30_000,
    });

    const notifications = Array.isArray(listRes?.data) ? listRes.data : [];
    const totalSent = listRes?.pagination?.total ?? notifications.length;

    const [formData, setFormData] = useState({
        title: "",
        audience: "all_students",
        type: "warning",
        content: "",
    });

    const createMutation = useMutation({
        mutationFn: (payload) => adminApiService.post_notifications({ body: payload }),
        onSuccess: async (res) => {
            const notifId = res?.data?.id;
            if (notifId) {
                try {
                    await adminApiService.post_notifications_by_id_send({
                        pathParams: { id: notifId },
                    });
                } catch { /* send step optional */ }
            }
            toast.success("Thông báo đã được ban hành thành công!");
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            setFormData({ title: "", audience: "all_students", type: "warning", content: "" });
            setIsComposeOpen(false);
        },
        onError: () => toast.error("Không thể tạo thông báo. Vui lòng thử lại."),
    });

    const markReadMutation = useMutation({
        mutationFn: (id) => adminApiService.put_notifications_by_id_read({ pathParams: { id } }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    });

    const markAllReadMutation = useMutation({
        mutationFn: () => adminApiService.put_notifications_read_all(),
        onSuccess: () => {
            toast.success("Đã đánh dấu đọc tất cả thông báo");
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });

    const mapNotif = (item) => ({
        id: item.id,
        title: item.title || "",
        desc: item.content || item.description || "",
        type: BE_TO_FE_TYPE[item.type] || item.type || "system",
        isRead: item.is_read ?? item.isRead ?? true,
        time: item.sent_at ? formatRelativeTime(item.sent_at) : "",
        audience: BE_TO_FE_AUDIENCE[item.targetType] || item.targetType || "all_students",
    });

    const mapped = notifications.map(mapNotif);
    const unreadCount = mapped.filter((n) => !n.isRead).length;
    const totalPages = Math.ceil(mapped.length / ITEMS_PER_PAGE) || 1;
    const paginatedNotifications = mapped.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleMarkAllRead = () => markAllReadMutation.mutate();

    const handleViewDetail = (notif) => {
        setSelectedNotif(notif);
        if (!notif.isRead) markReadMutation.mutate(notif.id);
    };

    const handleSendNotification = (e) => {
        e.preventDefault();
        if (!formData.title || !formData.content) {
            toast.error("Vui lòng nhập đủ chủ đề và nội dung thông báo.");
            return;
        }
        const beType = FE_TO_BE_TYPE[formData.type] || formData.type;
        const beTargetType = FE_TO_BE_TARGET[formData.audience] || formData.audience;
        createMutation.mutate({
            title: formData.title,
            content: formData.content,
            type: beType,
            targetType: beTargetType,
            status: "sent",
        });
    };

    const getAudienceLabel = (aud) => {
        if (aud.startsWith('class_')) return `Lớp ${aud.replace('class_', '')}`;
        switch(aud) {
            case 'all_students': return 'Toàn bộ Học sinh';
            case 'homeroom': return 'Tất cả GV Chủ nhiệm';
            case 'all_teachers': return 'Toàn bộ Giáo viên';
            case 'all_parents': return 'Toàn bộ Phụ huynh';
            default: return 'Khác';
        }
    };

    const getNotifIcon = (type) => {
        switch(type) {
            case 'warning': return <FiAlertTriangle />;
            case 'competition': return <FiAward />;
            case 'system': return <FiDatabase />;
            default: return <FiBell />;
        }
    };

    return (
        <div className="vp-notifications">
            <PageHeader
                title="Thông Báo Nề Nếp & Kỷ Luật"
                actions={
                    <DisciplineHeaderActions
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            {/* Metrics Bar */}
            <div className="notif-metrics-bar">
                <div className="metric-card">
                    <div className="metric-icon-wrap primary">
                        <FiBell />
                    </div>
                    <div className="metric-info">
                        <h4>Tổng thông báo</h4>
                        <div className="value">{totalSent}</div>
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-icon-wrap unread">
                        <FiCheck />
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
                        <div className="value">{totalSent}</div>
                    </div>
                </div>
            </div>

            {/* Unified Inbox View */}
            <div className="notif-main-card animate-fade-in">
                <div className="notif-list-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h3>Hộp thư đến & Lịch sử thông báo</h3>
                        <button
                            className="compose-btn-header"
                            onClick={() => setIsComposeOpen(true)}
                        >
                            <FiPlus /> Phát lệnh cảnh báo / thi đua
                        </button>
                    </div>
                    {unreadCount > 0 && (
                        <button className="btn-mark-all" onClick={handleMarkAllRead}>
                            <FiCheck /> Đánh dấu đọc hết
                        </button>
                    )}
                </div>

                {isLoading ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
                        <FiBell style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }} />
                        <p>Đang tải thông báo...</p>
                    </div>
                ) : mapped.length === 0 ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
                        <FiBell style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }} />
                        <p>Chưa có thông báo nào nhận được</p>
                    </div>
                ) : (
                    <>
                <div className="notif-list">
                    {paginatedNotifications.map(notif => (
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
                    </>
                )}
            </div>

            {/* Combined Broadcast Modal */}
            <Modal
                keepMounted={false}
                open={isComposeOpen}
                onClose={() => setIsComposeOpen(false)}
                title="Ban hành lệnh Cảnh báo / Thi đua"
                className="broadcast-modal"
            >
                <form className="broadcast-compose-form" onSubmit={handleSendNotification}>
                    <div className="form-group">
                        <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Chủ đề thông báo *</label>
                        <input 
                            type="text" 
                            className="premium-input"
                            placeholder="Ví dụ: Chấn chỉnh nề nếp tuần 15..."
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                        />
                    </div>

                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: formData.audience === 'specific_class' ? '1fr 1fr 1fr' : '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Đối tượng nhận *</label>
                            <Select 
                                variant="custom"
                                options={[
                                    { value: "all_students", label: "Toàn bộ Học sinh" },
                                    { value: "all_parents", label: "Toàn bộ Phụ huynh" },
                                    { value: "all_teachers", label: "Toàn bộ Giáo viên" },
                                    { value: "homeroom", label: "Tất cả GV Chủ nhiệm" },
                                    { value: "specific_class", label: "Theo lớp cụ thể" }
                                ]}
                                value={formData.audience === 'specific_class' ? 'specific_class' : (formData.audience.startsWith('class_') ? 'specific_class' : formData.audience)}
                                onChange={e => {
                                    const val = e.target.value;
                                    if (val === 'specific_class') {
                                        setFormData({...formData, audience: 'class_10A1'}); // default
                                    } else {
                                        setFormData({...formData, audience: val});
                                    }
                                }}
                            />
                        </div>
                        {formData.audience.startsWith('class_') && (
                             <div className="form-group">
                             <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Chọn lớp *</label>
                             <Select 
                                 variant="custom"
                                 searchable={true}
                                 searchPlaceholder="Nhập tên lớp..."
                                 options={[
                                     { value: "class_10A1", label: "Lớp 10A1" },
                                     { value: "class_10A2", label: "Lớp 10A2" },
                                     { value: "class_10A3", label: "Lớp 10A3" },
                                     { value: "class_10A4", label: "Lớp 10A4" },
                                     { value: "class_11A1", label: "Lớp 11A1" },
                                     { value: "class_11A2", label: "Lớp 11A2" },
                                     { value: "class_11A5", label: "Lớp 11A5" },
                                     { value: "class_12A1", label: "Lớp 12A1" },
                                     { value: "class_12A2", label: "Lớp 12A2" },
                                     { value: "class_12A3", label: "Lớp 12A3" }
                                 ]}
                                 value={formData.audience}
                                 onChange={e => setFormData({...formData, audience: e.target.value})}
                             />
                         </div>
                        )}
                        <div className="form-group">
                            <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Loại thông báo *</label>
                            <Select 
                                variant="custom"
                                options={[
                                    { value: "warning", label: "Lệnh Cảnh báo" },
                                    { value: "competition", label: "Thông báo Thi đua" },
                                    { value: "system", label: "Thông báo Hệ thống" }
                                ]}
                                value={formData.type}
                                onChange={e => setFormData({...formData, type: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>Nội dung chi tiết *</label>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{formData.content.length} / 500</span>
                        </div>
                        <textarea 
                            className="premium-textarea"
                            placeholder="Nhập nội dung lệnh hoặc quyết định tại đây..."
                            maxLength="500"
                            value={formData.content}
                            onChange={e => setFormData({...formData, content: e.target.value})}
                        />
                    </div>

                    <div className="modal-footer">
                        <button type="submit" className="btn-send-broadcast">
                            <FiSend /> Ban Hành Ngay
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Detail Modal */}
            <Modal
                open={!!selectedNotif}
                onClose={() => setSelectedNotif(null)}
                title="Chi tiết thông báo"
            >
                {selectedNotif && (
                    <div className="notif-detail-content animate-fade-in">
                        <div className="detail-header">
                            <div className={`notif-icon-box ${selectedNotif.type}`}>
                                {getNotifIcon(selectedNotif.type)}
                            </div>
                            <div className="detail-title-area">
                                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>{selectedNotif.title}</h3>
                                <div className="notif-footer-row" style={{ marginTop: '0.5rem' }}>
                                    <span className="notif-time-tag"><FiClock /> {selectedNotif.time}</span>
                                    <span className="audience-badge">
                                        <FiUsers style={{marginRight: '6px'}} /> 
                                        {getAudienceLabel(selectedNotif.audience)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="detail-body">
                            <p>{selectedNotif.desc}</p>
                        </div>
                        <div className="modal-footer">
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

