import { useState } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { FiBell, FiEdit3, FiCheck, FiClock, FiSend, FiUsers } from "react-icons/fi";
import { toast } from "react-toastify";
import "./AcademicStaffNotifications.css";

export default function AcademicStaffNotifications() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [activeTab, setActiveTab] = useState("list");

    const [notifications, setNotifications] = useState([
        { id: 1, title: "Hiệu trưởng yêu cầu chốt sổ", desc: "Đề nghị giáo vụ hoàn tất việc phân công giảng dạy khối 10 trước ngày 05/09.", type: "system", isRead: false, time: "30 phút trước", audience: "Phòng Giáo Vụ" },
        { id: 2, title: "Hệ thống bảo trì", desc: "Server sẽ bảo trì tính năng xuất file từ 0h - 2h sáng nay.", type: "general", isRead: true, time: "Hôm qua", audience: "Toàn bộ Admin/Giáo Vụ" },
    ]);

    const [formData, setFormData] = useState({
        title: "",
        audience: "teachers",
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
            audience: formData.audience === "teachers" ? "Gửi tới Giáo viên" : 
                      formData.audience === "students" ? "Gửi tới Học sinh" : "Cá nhân"
        };

        setNotifications([newNotif, ...notifications]);
        toast.success("Đã phát thông báo thành công!");
        setFormData({ title: "", audience: "teachers", content: "" });
        setActiveTab("list");
    };

    return (
        <div className="academic-notifications">
            <PageHeader
                title="Thông Báo Nội Bộ"
                eyebrow="Quản lý và phát thông báo học vụ"
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
                    <FiBell /> Hộp thư đến
                </button>
                <button 
                    className={`notif-tab-btn ${activeTab === 'send' ? 'active' : ''}`}
                    onClick={() => setActiveTab('send')}
                >
                    <FiEdit3 /> Phát lệnh thông báo
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
                            <h3>Phát thông báo học vụ</h3>
                            <p>Sử dụng để nhắc nhở giáo viên nhập điểm, nhắc học sinh nộp hồ sơ, v.v.</p>
                        </div>
                        <form className="notif-form" onSubmit={handleSendNotification}>
                            <div className="form-group">
                                <label>Chủ đề báo cáo *</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    placeholder="Vd: Nhắc nhở hoàn tất nhập điểm học kỳ 1"
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
                                    <option value="teachers">Giáo viên toàn trường</option>
                                    <option value="homeroom">Chỉ Giáo viên Chủ Nhiệm</option>
                                    <option value="students">Học sinh toàn trường</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Nội dung chi tiết *</label>
                                <textarea 
                                    className="form-textarea" 
                                    placeholder="Phòng giáo vụ thông báo..."
                                    value={formData.content}
                                    onChange={e => setFormData({...formData, content: e.target.value})}
                                />
                            </div>
                            <button type="submit" className="btn-send">
                                <FiSend /> Gửi Đi
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
