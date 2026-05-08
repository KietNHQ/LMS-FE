import React, { useState } from "react";
import { FiSend, FiBell, FiAlertCircle, FiMessageSquare } from "react-icons/fi";
import "./HomeroomAnnouncementsSection.css";

export default function HomeroomAnnouncementsSection({ data }) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [target, setTarget] = useState("all");
    const [isUrgent, setIsUrgent] = useState(false);

    if (!data) return null;

    const handleSend = (e) => {
        e.preventDefault();
        // Mock send action
        alert("Đã gửi thông báo thành công!");
        setTitle("");
        setContent("");
    };

    return (
        <div className="homeroom-announcements-section">
            <div className="announcements-grid">
                {/* Form tạo thông báo */}
                <div className="announcement-composer modern-shadow">
                    <div className="card-header borderless">
                        <div className="header-icon gradient-blue">
                            <FiSend />
                        </div>
                        <h2>Tạo Thông Báo Mới</h2>
                    </div>
                    <form className="composer-form" onSubmit={handleSend}>
                        <div className="form-group">
                            <label>Tiêu đề</label>
                            <input 
                                type="text" 
                                placeholder="Nhập tiêu đề thông báo..." 
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Nội dung</label>
                            <textarea 
                                placeholder="Soạn nội dung chi tiết..." 
                                rows={5}
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                required
                            ></textarea>
                        </div>
                        <div className="form-row">
                            <div className="form-group flex-1">
                                <label>Gửi đến</label>
                                <select value={target} onChange={e => setTarget(e.target.value)}>
                                    <option value="all">Tất cả (Học sinh & Phụ huynh)</option>
                                    <option value="students">Chỉ Học sinh</option>
                                    <option value="parents">Chỉ Phụ huynh</option>
                                </select>
                            </div>
                            <div className="form-group checkbox-group">
                                <label className="checkbox-label">
                                    <input 
                                        type="checkbox" 
                                        checked={isUrgent} 
                                        onChange={e => setIsUrgent(e.target.checked)}
                                    />
                                    <span className="urgent-text"><FiAlertCircle /> Đánh dấu Quan trọng</span>
                                </label>
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn-send">
                                <FiSend /> Gửi Thông Báo
                            </button>
                        </div>
                    </form>
                </div>

                {/* Lịch sử thông báo */}
                <div className="announcement-history modern-shadow">
                    <div className="card-header borderless">
                        <div className="header-icon gradient-orange">
                            <FiMessageSquare />
                        </div>
                        <h2>Lịch Sử Thông Báo</h2>
                    </div>
                    <div className="history-list">
                        {data.announcements && data.announcements.length > 0 ? (
                            data.announcements.map((ann, idx) => (
                                <div key={idx} className={`history-item ${ann.isUrgent ? 'urgent' : ''}`}>
                                    <div className="item-header">
                                        <h4>{ann.title}</h4>
                                        {ann.isUrgent && <span className="urgent-badge">Quan trọng</span>}
                                    </div>
                                    <p className="item-content">{ann.content}</p>
                                    <div className="item-footer">
                                        <span className="item-date"><FiBell /> {ann.date}</span>
                                        <span className="item-target">Gửi: {ann.target}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">Chưa có thông báo nào được gửi.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

