import { useState } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { FiBell, FiEdit3, FiCheck, FiClock, FiSend, FiUsers } from "react-icons/fi";
import { toast } from "react-toastify";
import "./VpDisciplineNotifications.css";

export default function VpDisciplineNotifications() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [activeTab, setActiveTab] = useState("send"); // Default to send tab as VP Discipline will likely broadcast

    const [notifications, setNotifications] = useState([
        { id: 1, title: "Hiệu trưởng nhắc nhở chấn chỉnh đội hình báo bài", desc: "Tình trạng học sinh sử dụng tài liệu trong giờ kiểm tra T10 tăng cao.", type: "system", isRead: false, time: "Hôm qua", audience: "PHT Nề Nếp" },
    ]);

    const [formData, setFormData] = useState({
        title: "",
        audience: "all_students",
        content: ""
    });

    const handleMarkAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        toast.success("Đã đánh dấu đọc tất cả");
    };

    const handleSendNotification = (e) => {
        e.preventDefault();
        if (!formData.title || !formData.content) {
            toast.error("Vui lòng nhập đủ chủ đề và nội dung");
            return;
        }

        const newNotif = {
            id: Date.now(),
            title: formData.title,
            desc: formData.content,
            type: "general",
            isRead: true,
            time: "Vừa xong",
            audience: formData.audience === "all_students" ? "Gửi toàn thể Học sinh" : 
                      formData.audience === "homeroom" ? "Gửi GV Chủ Nhiệm" : "Cá nhân"
        };

        setNotifications([newNotif, ...notifications]);
        toast.success("Đã phát thông báo cảnh báo thành công!");
        setFormData({ title: "", audience: "all_students", content: "" });
        setActiveTab("list");
    };

    return (
        <div className="vp-notifications">
            <PageHeader
                title="Thông Báo Nề Nếp & Kỷ Luật"
                eyebrow="Gửi thông báo vi phạm, thi đua đến học sinh và giáo viên"
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
                    className={`notif-tab-btn ${activeTab === 'send' ? 'active' : ''}`}
                    onClick={() => setActiveTab('send')}
                >
                    <FiEdit3 /> Phát lệnh cảnh báo / thi đua
                </button>
                <button 
                    className={`notif-tab-btn ${activeTab === 'list' ? 'active' : ''}`}
                    onClick={() => setActiveTab('list')}
                >
                    <FiBell /> Hộp thư đến
                </button>
            </div>

            <div className="notif-content">
                {activeTab === 'list' ? (
                    <>
                        <div className="notif-list-header">
                            <h3>Thông báo nhận được ({notifications.filter(n => !n.isRead).length} chưa đọc)</h3>
                            <button className="btn-mark-all" onClick={handleMarkAllRead}>
                                <FiCheck /> Đánh dấu đã đọc tất cả
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
                                            <span className="meta-item"><FiUsers /> Gửi tới: {notif.audience}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="notif-form-header">
                            <h3>Ban Giám Hiệu gửi thông báo</h3>
                            <p>Sử dụng kênh này để gửi kết luận thi đua tuần, hoặc cảnh cáo diện rộng.</p>
                        </div>
                        <form className="notif-form" onSubmit={handleSendNotification}>
                            <div className="form-group">
                                <label>Tiêu đề thông báo *</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    placeholder="Vd: Chấn chỉnh tác phong đồng phục tuần 12"
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Đối tượng nhận *</label>
                                <select 
                                    className="form-select"
                                    value={formData.audience}
                                    onChange={e => setFormData({...formData, audience: e.target.value})}
                                >
                                    <option value="all_students">Toàn bộ Học Sinh</option>
                                    <option value="homeroom">Chỉ Giáo viên Chủ Nhiệm</option>
                                    <option value="all_teachers">Toàn bộ Giáo viên</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Nội dung quyết định / nhắc nhở *</label>
                                <textarea 
                                    className="form-textarea" 
                                    placeholder="Ban Giám hiệu yêu cầu..."
                                    value={formData.content}
                                    onChange={e => setFormData({...formData, content: e.target.value})}
                                />
                            </div>
                            <button type="submit" className="btn-send">
                                <FiSend /> Ban Hành Thông Báo
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
