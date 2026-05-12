import React, { useState, useEffect } from "react";
import { FiBell, FiSend, FiMessageSquare } from "react-icons/fi";
import teacherService from "../../../../services/pages/teacher/teacherService";
import { toast } from "react-toastify";
import "./ClassSecretaryTab.css";

const ANNOUNCEMENTS = [
  { id: 1, title: "Kế hoạch hội thao trường", date: "03/05/2026", source: "Đoàn trường", content: "Yêu cầu các lớp đăng ký danh sách thi đấu các bộ môn kéo co, nhảy bao bố trước ngày 10/05.", important: true },
  { id: 2, title: "Quyên góp quỹ áo ấm mùa đông", date: "01/05/2026", source: "Hội chữ thập đỏ", content: "Mỗi lớp tối thiểu 500,000 VND. Lớp trưởng và bí thư phối hợp thu tiền và nộp lại.", important: false },
];

export default function ClassSecretaryTab({ classId }) {
  const [broadcast, setBroadcast] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sentMessages, setSentMessages] = useState([
    { id: 1, content: "Các bạn nhớ đăng ký môn thi đấu hội thao nhé, deadline 08/05 để mình chốt danh sách nộp trường.", date: "03/05/2026" }
  ]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!broadcast.trim() || !classId) return;
    
    setIsSending(true);
    try {
      const res = await teacherService.broadcastToClass({
        mock: false,
        pathParams: { id: classId },
        body: {
          title: "Thông báo từ Bí thư lớp",
          content: broadcast,
          type: "announcement",
          priority: "normal"
        }
      });

      if (res.success) {
        toast.success("Đã gửi thông báo tới cả lớp!");
        setSentMessages([{ 
          id: Date.now(), 
          content: broadcast, 
          date: new Date().toLocaleDateString("vi-VN") 
        }, ...sentMessages]);
        setBroadcast("");
      } else {
        toast.error(res.error || "Gửi thông báo thất bại.");
      }
    } catch (error) {
      console.error("Failed to broadcast:", error);
      toast.error("Lỗi kết nối máy chủ.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="class-secretary-tab">
      
      <div className="secretary-announcements">
        <div className="secretary-section-header">
          <h3><FiBell /> Thông báo từ Nhà trường / Đoàn trường</h3>
        </div>
        <div className="announcement-list">
          {ANNOUNCEMENTS.map(ann => (
            <div key={ann.id} className={`announcement-card ${ann.important ? 'important' : ''}`}>
              <div className="announcement-top">
                <strong>{ann.title}</strong>
                {ann.important && <span className="announcement-badge">Quan trọng</span>}
              </div>
              <p>{ann.content}</p>
              <div className="announcement-meta">
                <FiBell />
                <span>Nguồn: {ann.source} • {ann.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="secretary-broadcast">
        <div className="secretary-section-header">
          <h3><FiSend /> Thông báo đến lớp</h3>
        </div>
        <form onSubmit={handleSend} className="broadcast-form">
          <textarea 
            placeholder="Soạn thông báo gửi đến nhóm lớp..." 
            value={broadcast}
            onChange={(e) => setBroadcast(e.target.value)}
            disabled={isSending}
          ></textarea>
          <div className="broadcast-options">
            <label className="cp-checkbox-label">
              <input type="checkbox" />
              <span>Gửi đồng thời cho Giáo viên chủ nhiệm</span>
            </label>
          </div>
          <div className="broadcast-actions">
            <span>Thông báo này sẽ được gửi tới tất cả học sinh trong lớp.</span>
            <button type="submit" disabled={isSending || !broadcast.trim()}>
              <FiSend /> {isSending ? "Đang gửi..." : "Gửi thông báo"}
            </button>
          </div>
        </form>

        <div className="sent-broadcasts">
          <h4>Lịch sử thông báo đã gửi</h4>
          <div className="sent-list">
            {sentMessages.map(msg => (
              <div key={msg.id} className="sent-card">
                <FiMessageSquare className="sent-icon" />
                <div className="sent-info">
                  <p>{msg.content}</p>
                  <small>Đã gửi: {msg.date}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
