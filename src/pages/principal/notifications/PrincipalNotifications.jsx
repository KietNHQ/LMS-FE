import { useState } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { FiBell, FiEdit3, FiCheck, FiClock, FiSend, FiUsers } from "react-icons/fi";
import { toast } from "react-toastify";
import "./PrincipalNotifications.css";

export default function PrincipalNotifications() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [activeTab, setActiveTab] = useState("list");

    const [notifications, setNotifications] = useState([
        { id: 1, title: "Hệ thống báo lỗi thiếu điểm khối 10", desc: "Phát hiện 12 lớp chưa hoàn tất chốt điểm học lực HK1. Vui lòng kiểm tra mục Phê duyệt.", type: "system", isRead: false, time: "15 phút trước", audience: "Hiệu Trưởng" },
        { id: 2, title: "Báo cáo doanh thu kỳ 1", desc: "Phòng Tài Chính đã hoàn tất trích xuất báo cáo doanh thu tháng 10. Đã sẵn sàng trình ký.", type: "finance", isRead: false, time: "3 giờ trước", audience: "Hiệu Trưởng" },
        { id: 3, title: "Thông báo lịch nghỉ Lễ Nhà Giáo Việt Nam", desc: "Hệ thống đã gửi thông báo nghỉ lễ 20/11 tới toàn bộ GV, HS và Phụ huynh theo kế hoạch.", type: "general", isRead: true, time: "Hôm qua", audience: "Toàn trường" },
    ]);

    const [formData, setFormData] = useState({
        title: "",
        audience: "all",
        content: ""
    });

    const handleMarkAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        toast.success("Đã đánh dấu đọc tất cả thông báo hệ thống");
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
            type: "general",
            isRead: true,
            time: "Vừa xong",
            audience: formData.audience === "all" ? "Toàn trường" : 
                      formData.audience === "teachers" ? "Đội ngũ Giáo viên" : "Học sinh & Phụ huynh"
        };

        setNotifications([newNotif, ...notifications]);
        toast.success("Thông báo chỉ đạo đã được gửi đi thành công!");
        setFormData({ title: "", audience: "all", content: "" });
        setActiveTab("list");
    };

    return (
        <div className="principal-notifications">
            <PageHeader
                title="Truyền Thông & Chỉ Đạo"
                eyebrow="Giao diện tổng đài tập trung cho Hiệu trưởng"
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            <div className="notif-tabs">
                <button 
                    className={`notif-tab-btn ${activeTab === 'list' ? 'active' : ''}`}
                    onClick={() => setActiveTab('list')}
                >
                    <FiBell /> Hộp thư Chỉ đạo & Hệ thống
                </button>
                <button 
                    className={`notif-tab-btn ${activeTab === 'send' ? 'active' : ''}`}
                    onClick={() => setActiveTab('send')}
                >
                    <FiEdit3 /> Phát tín hiệu Chỉ đạo mới
                </button>
            </div>

            <div className="notif-content">
                {activeTab === 'list' ? (
                    <>
                        <div className="notif-list-header">
                            <h3>Lịch sử hoạt động ({notifications.filter(n => !n.isRead).length} tin mới)</h3>
                            <button className="btn-mark-all" onClick={handleMarkAllRead}>
                                <FiCheck /> Đọc tất cả
                            </button>
                        </div>
                        <div className="notif-list">
                            {notifications.map(notif => (
                                <div key={notif.id} className={`notif-item ${!notif.isRead ? 'unread' : ''}`}>
                                    <div className="notif-icon">
                                        <FiBell />
                                    </div>
                                    <div className="notif-body">
                                        <h4>{notif.title}</h4>
                                        <p className="notif-desc">{notif.desc}</p>
                                        <div className="notif-meta">
                                            <span className="meta-item"><FiClock /> {notif.time}</span>
                                            <span className="meta-item"><FiUsers /> Đối tượng: {notif.audience}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="notif-form-header" style={{marginBottom: '1.5rem'}}>
                            <h3 style={{margin: '0 0 0.5rem 0'}}>Gửi Thông báo Chỉ đạo</h3>
                            <p style={{fontSize: '0.85rem', color: '#64748b'}}>Hành động này sẽ gửi một thông báo đẩy (Push) hoặc SMS tới đối tượng đã chọn.</p>
                        </div>
                        <form className="notif-form" onSubmit={handleSendNotification}>
                            <div className="form-group">
                                <label>Tiêu đề chỉ đạo / Thông báo *</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    placeholder="Vd: Thông báo khẩn về việc..."
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Đối tượng nhận tín hiệu *</label>
                                <select 
                                    className="form-select"
                                    value={formData.audience}
                                    onChange={e => setFormData({...formData, audience: e.target.value})}
                                >
                                    <option value="all">Toàn bộ Nhà trường (Công bố công khai)</option>
                                    <option value="teachers">Chỉ Đội ngũ Cán bộ / Giáo viên</option>
                                    <option value="students">Chỉ Học sinh & Phụ huynh</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Nội dung văn bản chỉ đạo *</label>
                                <textarea 
                                    className="form-textarea" 
                                    placeholder="Nhập nội dung chi tiết tại đây..."
                                    value={formData.content}
                                    onChange={e => setFormData({...formData, content: e.target.value})}
                                />
                            </div>
                            <button type="submit" className="btn-send">
                                <FiSend /> Phát Tín Hiệu Chỉ Đạo
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
