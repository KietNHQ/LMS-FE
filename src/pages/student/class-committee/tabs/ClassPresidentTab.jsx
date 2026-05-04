import React, { useState } from "react";
import { FiAlertCircle, FiBookOpen, FiUserX, FiChevronLeft, FiChevronRight, FiSend } from "react-icons/fi";
import { IoCaretBack, IoCaretForward } from "react-icons/io5";
import "../../../../components/common/WeekPicker/WeekPicker.css";
import "./ClassPresidentTab.css";

const VIOLATIONS = [
  { id: 1, date: "04/05/2026", period: "Tiết 2", student: "Phạm Nam", rule: "Không làm bài tập", pts: -2 },
  { id: 2, date: "04/05/2026", period: "Tiết 3", student: "Tạ Vấn", rule: "Nói chuyện riêng", pts: -1 },
  { id: 3, date: "03/05/2026", period: "Tiết 5", student: "Đặng Hải", rule: "Đi trễ", pts: -1 },
];

export default function ClassPresidentTab() {
  const [notification, setNotification] = useState("");
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(21);
  const maxWeek = 35;

  const handlePrevWeek = () => setCurrentWeek(prev => Math.max(1, prev - 1));
  const handleNextWeek = () => setCurrentWeek(prev => Math.min(maxWeek, prev + 1));

  const getWeekDateRange = (weekNum) => {
    const startDate = new Date(2025, 7, 25);
    let totalDays = (weekNum - 1) * 7;
    if (weekNum > 8) totalDays += 7;
    if (weekNum > 17) totalDays += 14;
    if (weekNum > 22) totalDays += 14;
    if (weekNum > 30) totalDays += 7;

    startDate.setDate(startDate.getDate() + totalDays);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    const format = (d) => `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    return `${format(startDate)} - ${format(endDate)}`;
  };

  const handleSendNotification = (e) => {
    e.preventDefault();
    if (!notification.trim()) return;
    // Logic to send notification
    console.log("Sending:", notification);
    setNotification("");
    setIsNotificationModalOpen(false);
  };

  return (
    <div className="class-president-tab">
      <div className="cp-section-title">
        <h3>Tổng quan tuần này</h3>
        <span>Dữ liệu được cập nhật từ các hoạt động trong tuần của lớp</span>
      </div>
      <div className="cp-overview-cards">
        <div className="cp-card">
          <div className="cp-card-icon warning"><FiAlertCircle /></div>
          <div className="cp-card-info">
            <span>Số vi phạm tuần</span>
            <strong>12 Lượt</strong>
          </div>
        </div>
        <div className="cp-card">
          <div className="cp-card-icon info"><FiBookOpen /></div>
          <div className="cp-card-info">
            <span>Môn cần chú ý</span>
            <strong>Toán học</strong>
          </div>
        </div>
      </div>

      <div className="cp-violations-section">
        <div className="cp-section-header">
          <h3>Ghi nhận vi phạm</h3>
          <div className="cp-section-actions">
            <div className="common-week-picker compact-pill">
              <button className="week-nav-btn bordered" onClick={handlePrevWeek} disabled={currentWeek <= 1}><IoCaretBack /></button>
              <div className="week-value-display bold" style={{ minWidth: "160px" }}>
                Tuần {currentWeek} <span style={{fontWeight: '500', opacity: 0.8, fontSize: '11px', marginLeft: '4px'}}>({getWeekDateRange(currentWeek)})</span>
              </div>
              <button className="week-nav-btn bordered" onClick={handleNextWeek} disabled={currentWeek >= maxWeek}><IoCaretForward /></button>
            </div>
            <button className="cp-add-btn" onClick={() => setIsNotificationModalOpen(true)}>
              <FiSend /> Gửi thông báo
            </button>
          </div>
        </div>
        
        <table className="cp-violations-table">
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Tiết học</th>
              <th>Học sinh</th>
              <th>Lỗi vi phạm</th>
              <th>Điểm trừ</th>
            </tr>
          </thead>
          <tbody>
            {VIOLATIONS.map(v => (
              <tr key={v.id}>
                <td>{v.date}</td>
                <td>{v.period}</td>
                <td>
                  <div className="cp-student">
                    <FiUserX className="cp-student-icon" />
                    <span>{v.student}</span>
                  </div>
                </td>
                <td>{v.rule}</td>
                <td className="cp-pts">{v.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isNotificationModalOpen && (
        <div className="cp-modal-overlay" onClick={() => setIsNotificationModalOpen(false)}>
          <div className="cp-modal-content" onClick={e => e.stopPropagation()}>
            <div className="cp-modal-header">
              <h3>Gửi thông báo cho GVCN</h3>
              <p>Nội dung sẽ được gửi trực tiếp đến giáo viên chủ nhiệm và lưu lại lịch sử.</p>
            </div>
            <form onSubmit={handleSendNotification} className="cp-modal-form">
              <textarea 
                placeholder="Nhập nội dung thông báo hoặc trao đổi với giáo viên..." 
                value={notification}
                onChange={(e) => setNotification(e.target.value)}
                autoFocus
              />
              <div className="cp-modal-footer">
                <button type="button" className="cp-modal-cancel" onClick={() => setIsNotificationModalOpen(false)}>Hủy</button>
                <button type="submit" className="cp-modal-submit">
                  <FiSend /> Gửi thông báo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
