import { useState } from "react";
import { PageHeader, SchoolYearTermSelector, Pagination } from "../../../components/common";
import { Select, Modal } from "../../../components/ui";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { 
    FiBell, 
    FiCheck, 
    FiClock, 
    FiSend, 
    FiUsers, 
    FiPlus, 
    FiDatabase, 
    FiDollarSign, 
    FiFastForward 
} from "react-icons/fi";
import { toast } from "react-toastify";
import "./PrincipalNotifications.css";

export default function PrincipalNotifications() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [selectedNotif, setSelectedNotif] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [notifications, setNotifications] = useState([
        { 
            id: 1, 
            title: "Hệ thống báo lỗi thiếu điểm khối 10", 
            desc: "Phát hiện 12 lớp chưa hoàn tất chốt điểm học lực HK1. Vui lòng kiểm tra mục Phê duyệt.", 
            type: "system", 
            isRead: false, 
            time: "15 phút trước", 
            audience: "principal" 
        },
        { 
            id: 2, 
            title: "Báo cáo doanh thu kỳ 1", 
            desc: "Phòng Tài Chính đã hoàn tất trích xuất báo cáo doanh thu tháng 10. Đã sẵn sàng trình ký.", 
            type: "finance", 
            isRead: false, 
            time: "3 giờ trước", 
            audience: "principal" 
        },
        { 
            id: 3, 
            title: "Thông báo lịch nghỉ Lễ Nhà Giáo Việt Nam", 
            desc: "Hệ thống đã gửi thông báo nghỉ lễ 20/11 tới toàn bộ GV, HS và Phụ huynh theo kế hoạch.", 
            type: "general", 
            isRead: true, 
            time: "Hôm qua", 
            audience: "everyone" 
        },
    ]);

    const [formData, setFormData] = useState({
        title: "",
        audience: "everyone",
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
        toast.success("Đã đánh đọc tất cả thông báo");
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
            toast.error("Vui lòng nhập đủ chủ đề và nội dung chỉ đạo.");
            return;
        }

        const newNotif = {
            id: Date.now(),
            title: `[CHỈ ĐẠO] ${formData.title}`,
            desc: formData.content,
            type: "directive",
            isRead: true,
            time: "Vừa xong",
            audience: formData.audience
        };

        setNotifications([newNotif, ...notifications]);
        toast.success("Thông báo chỉ đạo đã được gửi đi thành công!");
        setFormData({ title: "", audience: "everyone", content: "" });
        setIsComposeOpen(false);
    };

    const getAudienceLabel = (aud) => {
        switch(aud) {
            case 'principal': return 'Cấp quản lý';
            case 'teachers': return 'Giáo viên';
            case 'everyone': return 'Toàn trường';
            default: return 'Khác';
        }
    };

    const getNotifIcon = (type) => {
        switch(type) {
            case 'system': return <FiDatabase />;
            case 'finance': return <FiDollarSign />;
            case 'directive': return <FiFastForward />;
            default: return <FiBell />;
        }
    };

    return (
        <div className="principal-notifications">
            <PageHeader
                title="Truyền Thông & Chỉ Đạo"
                actions={
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <button 
                            className="compose-btn-header"
                            onClick={() => setIsComposeOpen(true)}
                        >
                            <FiPlus /> Phát chỉ đạo mới
                        </button>
                        <SchoolYearTermSelector
                            selectedSchoolYear={selectedSchoolYear}
                            selectedTerm={selectedTerm}
                            onYearChange={handleYearArrow}
                            onTermChange={handleTermChange}
                        />
                    </div>
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
                        <h4>Đã phát chỉ đạo</h4>
                        <div className="value">{notifications.filter(n => n.type === 'directive').length}</div>
                    </div>
                </div>
            </div>

            {/* Unified History View */}
            <div className="notif-main-card">
                <div className="notif-list-header">
                    <h3>Lịch sử hoạt động & Chỉ đạo</h3>
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
                            style={{ cursor: 'pointer' }}
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
                                    <span className={`audience-badge ${notif.audience}`}>
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
                            <p>Chưa có thông báo nào trong học kỳ này</p>
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
                title="Phát tín hiệu chỉ đạo mới"
                className="directive-modal"
            >
                <form className="directive-compose-form" onSubmit={handleSendNotification}>
                    <div className="form-group">
                        <label>Tiêu đề văn bản *</label>
                        <input 
                            type="text" 
                            className="premium-input"
                            placeholder="Vd: Chỉ đạo khẩn về công tác ôn thi..."
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Đối tượng nhận chỉ đạo *</label>
                        <Select 
                            variant="custom"
                            options={[
                                { value: "everyone", label: "Toàn bộ Nhà trường" },
                                { value: "teachers", label: "Đội ngũ Giáo viên" },
                                { value: "principal", label: "Cấp Quản lý" }
                            ]}
                            value={formData.audience}
                            onChange={e => setFormData({...formData, audience: e.target.value})}
                        />
                    </div>

                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label>Nội dung chi tiết *</label>
                            <span style={{ fontSize: '0.75rem', color: formData.content.length >= 1000 ? '#ef4444' : '#64748b', fontWeight: '700' }}>
                                {formData.content.length} / 1000
                            </span>
                        </div>
                        <textarea 
                            className="premium-textarea"
                            placeholder="Nhập nội dung chỉ đạo thực hiện tại đây..."
                            maxLength="1000"
                            value={formData.content}
                            onChange={e => setFormData({...formData, content: e.target.value})}
                        />
                    </div>

                    <div className="modal-footer">
                        <button type="submit" className="btn-send-directive">
                            <FiSend /> Phát tín hiệu ngay
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Detail Modal */}
            <Modal
                open={!!selectedNotif}
                onClose={() => setSelectedNotif(null)}
                title="Chi tiết thông báo"
                className="notif-detail-modal"
            >
                {selectedNotif && (
                    <div className="notif-detail-content">
                        <div className="detail-header">
                            <div className={`detail-icon-wrap ${selectedNotif.type}`}>
                                {getNotifIcon(selectedNotif.type)}
                            </div>
                            <div className="detail-title-area">
                                <h3>{selectedNotif.title}</h3>
                                <div className="detail-meta">
                                    <span className="meta-item"><FiClock /> {selectedNotif.time}</span>
                                    <span className={`audience-badge ${selectedNotif.audience}`}>
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
