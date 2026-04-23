import { useState } from "react";
import { PageHeader, Pagination } from "../../../components/common";
import { Modal, Select } from "../../../components/ui";
import DisciplineHeaderActions from "../../vp-discipline/components/DisciplineHeaderActions"; // Reusing high-quality actions
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
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
import "./VpAcademicNotifications.css";

const ACADEMIC_NOTIFICATIONS = [
    { 
        id: 1, 
        title: "Nhắc nhở nộp đề cương ôn tập học kỳ 2", 
        desc: "Yêu cầu các Tổ Chuyên môn (Toán, Văn, Anh) hoàn tất việc biên soạn và nộp đề cương ôn tập học kỳ 2 về phòng Chuyên môn trước ngày 25/04.", 
        type: "directive", 
        isRead: false, 
        time: "10 phút trước", 
        audience: "departments" 
    },
    { 
        id: 2, 
        title: "Duyệt kế hoạch dạy học bổ trợ khối 12", 
        desc: "Kế hoạch dạy học tăng cường cho học sinh khối 12 đã được phê duyệt. Giáo viên bộ môn bắt đầu thực hiện từ tuần sau.", 
        type: "approval", 
        isRead: false, 
        time: "1 giờ trước", 
        audience: "all_teachers" 
    },
    { 
        id: 3, 
        title: "Cảnh báo chậm nộp điểm kiểm tra chéo", 
        desc: "Tổ Khoa học tự nhiên vẫn còn 3 giáo viên chưa hoàn tất nhập điểm kiểm tra chéo khối 11. Đã quá hạn 2 ngày.", 
        type: "warning", 
        isRead: true, 
        time: "Hôm qua", 
        audience: "departments" 
    },
    { 
        id: 4, 
        title: "Thông báo lịch thao giảng cụm trường", 
        desc: "Cập nhật danh sách giáo viên tham gia thao giảng tại cụm trường THPT Chuyên. Vui lòng chuẩn bị giáo án điện tử.", 
        type: "system", 
        isRead: true, 
        time: "2 ngày trước", 
        audience: "all_teachers" 
    },
];

export default function VpAcademicNotifications() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [selectedNotif, setSelectedNotif] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const [notifications, setNotifications] = useState(ACADEMIC_NOTIFICATIONS);

    const [formData, setFormData] = useState({
        title: "",
        audience: "all_teachers",
        type: "directive",
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
        toast.success("Đã đánh đọc tất cả thông báo chuyên môn");
    };

    const handleViewDetail = (notif) => {
        setSelectedNotif(notif);
        if (!notif.isRead) {
            setNotifications(prev => prev.map(n => 
                n.id === notif.id ? { ...n, isRead: true } : n
            ));
        }
    };

    const handleSendDirective = (e) => {
        e.preventDefault();
        if (!formData.title || !formData.content) {
            toast.error("Vui lòng nhập đầy đủ chủ đề và nội dung chỉ đạo.");
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
        toast.success("Chỉ đạo chuyên môn đã được ban hành thành công!");
        setFormData({ title: "", audience: "all_teachers", type: "directive", content: "" });
        setIsComposeOpen(false);
    };

    const getAudienceLabel = (aud) => {
        switch(aud) {
            case 'all_teachers': return 'Toàn bộ Giáo viên';
            case 'departments': return 'Các Tổ Chuyên môn';
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
                eyebrow="Phó Hiệu trưởng Chuyên môn - Hệ thống truyền tin học thuật"
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
                        <div className="value">{notifications.filter(n => n.id > 1000).length}</div>
                    </div>
                </div>
            </div>

            {/* Unified Inbox View */}
            <div className="notif-main-card">
                <div className="notif-list-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h3>Hộp thư & Lịch sử chỉ đạo</h3>
                        <button 
                            className="compose-btn-academic"
                            onClick={() => setIsComposeOpen(true)}
                        >
                            <FiPlus /> Phát lệnh chỉ đạo chuyên môn
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
                                    { value: "departments", label: "Các Tổ Chuyên môn" },
                                    { value: "grade12", label: "Riêng khối 12" }
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
                                    { value: "directive", label: "Lệnh Chỉ đạo" },
                                    { value: "approval", label: "Thông báo Duyệt" },
                                    { value: "warning", label: "Cảnh báo Học vụ" }
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
