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
import "./VpDisciplineNotifications.css";

const MOCK_NOTIFICATIONS = [
    { 
        id: 1, 
        title: "Chấn chỉnh đội hình báo bài khối 10", 
        desc: "Phát hiện tình trạng học sinh sử dụng tài liệu trong giờ kiểm tra T10 tăng cao. Yêu cầu GVCN các lớp 10A1, 10A3 nhắc nhở học sinh nghiêm túc.", 
        type: "warning", 
        isRead: false, 
        time: "15 phút trước", 
        audience: "homeroom" 
    },
    { 
        id: 2, 
        title: "Kết quả thi đua tuần 12 - Khối 12", 
        desc: "Chúc mừng tập thể 12A1 dẫn đầu thi đua tuần qua với điểm số tuyệt đối 100/100. Biểu dương sự cố gắng của ban cán sự lớp.", 
        type: "competition", 
        isRead: false, 
        time: "3 giờ trước", 
        audience: "all_students" 
    },
    { 
        id: 3, 
        title: "Thông báo lịch trực tuần ban Giám thị", 
        desc: "Cập nhật danh sách giáo viên trực tuần từ ngày 20/10 đến 25/10. Vui lòng kiểm tra file đính kèm trong hệ thống quản lý.", 
        type: "system", 
        isRead: true, 
        time: "Hôm qua", 
        audience: "homeroom" 
    },
    { 
        id: 4, 
        title: "Cảnh báo vi phạm nề nếp tập trung", 
        desc: "Nhiều học sinh vẫn còn tình trạng đi trễ và không mặc đúng đồng phục trong giờ chào cờ đầu tuần. Yêu cầu xử lý nghiêm các trường hợp tái phạm.", 
        type: "warning", 
        isRead: true, 
        time: "2 ngày trước", 
        audience: "all_students" 
    },
    { 
        id: 5, 
        title: "Nhắc nhở hoàn thành hồ sơ bán trú", 
        desc: "Bố mẹ học sinh lưu ý hoàn tất hồ sơ đăng ký bán trú học kỳ 2 trước ngày 30/10.", 
        type: "system", 
        isRead: true, 
        time: "3 ngày trước", 
        audience: "all_parents" 
    },
    { 
        id: 6, 
        title: "Khen thưởng học sinh đạt giải HSG Tỉnh", 
        desc: "Danh sách 15 học sinh đạt giải trong kỳ thi vừa qua. Nhà trường sẽ tổ chức trao thưởng vào sáng thứ 2 tuần tới.", 
        type: "competition", 
        isRead: true, 
        time: "4 ngày trước", 
        audience: "all_students" 
    },
    { 
        id: 7, 
        title: "Lệnh chấn chỉnh vệ sinh lớp học", 
        desc: "Các lớp 11A1, 11A2 để tình trạng rác thải trong ngăn bàn kéo dài. Yêu cầu Ban cán sự lớp xử lý ngay.", 
        type: "warning", 
        isRead: true, 
        time: "5 ngày trước", 
        audience: "specific_class" 
    },
    { 
        id: 8, 
        title: "Thông báo họp cha mẹ học sinh đột xuất", 
        desc: "Học sinh khối 12 chuẩn bị cho buổi họp định hướng thi Tốt nghiệp vào chiều thứ 7 này.", 
        type: "system", 
        isRead: true, 
        time: "1 tuần trước", 
        audience: "all_parents" 
    },
    { 
        id: 9, 
        title: "Tổng kết phong trào Kế hoạch nhỏ", 
        desc: "Toàn trường đã thu gom được hơn 500kg giấy vụn. Cảm ơn sự nhiệt tình của các em học sinh.", 
        type: "competition", 
        isRead: true, 
        time: "1 tuần trước", 
        audience: "all_students" 
    },
];

export default function VpDisciplineNotifications() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [selectedNotif, setSelectedNotif] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

    const [formData, setFormData] = useState({
        title: "",
        audience: "all_students",
        type: "warning",
        content: ""
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;
    const totalPages = Math.ceil(notifications.length / itemsPerPage);
    const paginatedNotifications = notifications.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleMarkAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        toast.success("Đã đánh dấu đọc tất cả thông báo");
    };

    const handleViewDetail = (notif) => {
        setSelectedNotif(notif);
        if (!notif.isRead) {
            setNotifications(prev => prev.map(n => 
                n.id === notif.id ? { ...n, isRead: true } : n
            ));
        }
    };

    const handleSendNotification = (e) => {
        e.preventDefault();
        if (!formData.title || !formData.content) {
            toast.error("Vui lòng nhập đủ chủ đề và nội dung thông báo.");
            return;
        }

        const newNotif = {
            id: Date.now(),
            title: formData.title,
            desc: formData.content,
            type: formData.type,
            isRead: true,
            time: "Vừa xong",
            audience: formData.audience
        };

        setNotifications([newNotif, ...notifications]);
        toast.success("Thông báo đã được ban hành thành công!");
        setFormData({ title: "", audience: "all_students", type: "warning", content: "" });
        setIsComposeOpen(false);
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
                        <div className="value">{notifications.length}</div>
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
                        <div className="value">{notifications.filter(n => n.id > 1000).length}</div>
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
                    {notifications.length === 0 && (
                        <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
                            <FiBell style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }} />
                            <p>Chưa có thông báo nào nhận được</p>
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

