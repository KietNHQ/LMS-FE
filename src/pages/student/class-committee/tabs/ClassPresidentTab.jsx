import React, { useState, useEffect, useCallback } from "react";
import { FiAlertCircle, FiBookOpen, FiUserX, FiSend, FiLoader } from "react-icons/fi";
import { IoCaretBack, IoCaretForward } from "react-icons/io5";
import { toast } from "react-toastify";
import studentService from "../../../../services/pages/student/studentService";
import teacherService from "../../../../services/pages/teacher/teacherService";
import "../../../../components/common/WeekPicker/WeekPicker.css";
import "./ClassPresidentTab.css";

/**
 * Tính startDate & endDate của một tuần theo số tuần ISO
 */
function getWeekDateRange(weekNum, year = new Date().getFullYear()) {
  const jan4 = new Date(year, 0, 4);
  const startOfWeek1 = new Date(jan4);
  startOfWeek1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7));

  const start = new Date(startOfWeek1);
  start.setDate(start.getDate() + (weekNum - 1) * 7);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const fmt = (d) =>
    `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
  const fmtISO = (d) => d.toISOString().split("T")[0];

  return {
    label: `${fmt(start)} - ${fmt(end)}`,
    startDate: fmtISO(start),
    endDate: fmtISO(end),
  };
}

/** Lấy số tuần hiện tại */
function getCurrentWeekNumber() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  return Math.ceil(
    ((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7
  );
}

export default function ClassPresidentTab({ classId }) {
  const [currentWeek, setCurrentWeek] = useState(getCurrentWeekNumber());
  const [violations, setViolations] = useState([]);
  const [totalViolations, setTotalViolations] = useState(0);
  const [totalAbsent, setTotalAbsent] = useState(0);
  const [mostTroubledSubject, setMostTroubledSubject] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState("");
  const [isSendingNotif, setIsSendingNotif] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  const maxWeek = 52;

  const handlePrevWeek = () => setCurrentWeek((prev) => Math.max(1, prev - 1));
  const handleNextWeek = () => setCurrentWeek((prev) => Math.min(maxWeek, prev + 1));

  const weekInfo = getWeekDateRange(currentWeek);

  // Fetch violations từ API
  const fetchViolations = useCallback(async () => {
    if (!classId) return;
    setIsLoading(true);
    try {
      const { startDate, endDate } = getWeekDateRange(currentWeek);
      const res = await studentService.getClassViolations({
        mock: false,
        pathParams: { classId },
        params: { startDate, endDate },
      });

      if (res?.success && res?.data) {
        setViolations(res.data.violations || []);
        setTotalViolations(res.data.totalViolations || 0);
        setTotalAbsent(res.data.totalAbsent || 0);
        setMostTroubledSubject(res.data.mostTroubledSubject || null);
      }
    } catch (err) {
      console.error("Failed to fetch violations:", err);
      toast.error("Không tải được dữ liệu vi phạm.");
    } finally {
      setIsLoading(false);
    }
  }, [classId, currentWeek]);

  useEffect(() => {
    fetchViolations();
  }, [fetchViolations]);

  // Gửi thông báo cho GVCN — dùng broadcast endpoint
  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notification.trim() || !classId) return;

    const formatViolationsText = () => {
      if (violations.length === 0) return "\n\n(Không ghi nhận vi phạm nào trong tuần này)";
      let text = `\n\n---------------------------------------------\n📌 CHI TIẾT VI PHẠM TRONG TUẦN ${currentWeek} (${weekInfo.label}):\n`;
      violations.forEach((v, idx) => {
        text += `${idx + 1}. ${formatDate(v.date)} - ${v.periodLabel || "—"} - Môn: ${v.subjectName || "—"}\n`;
        text += `   • Học sinh: ${v.studentName}\n`;
        text += `   • Lỗi vi phạm: ${v.content || v.category || "—"}\n`;
        text += `   • Điểm trừ: ${v.points || 0}\n`;
      });
      return text;
    };

    const fullContent = `${notification}${formatViolationsText()}`;

    setIsSendingNotif(true);
    try {
      const res = await teacherService.broadcastToClass({
        mock: false,
        pathParams: { id: classId },
        body: {
          title: "Báo cáo từ Lớp trưởng",
          content: fullContent,
          onlyHomeroomTeacher: true,
        },
      });

      if (res?.success) {
        toast.success("Đã gửi báo cáo đến giáo viên chủ nhiệm!");
        setNotification("");
        setIsNotificationModalOpen(false);
      } else {
        toast.error(res?.error || "Gửi thất bại.");
      }
    } catch (err) {
      console.error("Failed to send notification:", err);
      toast.error("Lỗi kết nối máy chủ.");
    } finally {
      setIsSendingNotif(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
  };

  return (
    <div className="class-president-tab">
      <div className="cp-section-title">
        <h3>Tổng quan tuần này</h3>
        <span>Dữ liệu được tổng hợp từ đánh giá tiết học của giáo viên bộ môn</span>
      </div>

      <div className="cp-overview-cards">
        <div className="cp-card">
          <div className="cp-card-icon warning"><FiAlertCircle /></div>
          <div className="cp-card-info">
            <span>Số vi phạm tuần</span>
            <strong>{isLoading ? "—" : `${totalViolations} Lượt`}</strong>
          </div>
        </div>
        <div className="cp-card">
          <div className="cp-card-icon info"><FiBookOpen /></div>
          <div className="cp-card-info">
            <span>Môn cần chú ý</span>
            <strong>{isLoading ? "—" : (mostTroubledSubject?.subjectName || "Không có")}</strong>
          </div>
        </div>
      </div>

      <div className="cp-violations-section">
        <div className="cp-section-header">
          <h3>Ghi nhận vi phạm</h3>
          <div className="cp-section-actions">
            <div className="common-week-picker compact-pill">
              <button className="week-nav-btn bordered" onClick={handlePrevWeek} disabled={currentWeek <= 1}>
                <IoCaretBack />
              </button>
              <div className="week-value-display bold" style={{ minWidth: "175px" }}>
                Tuần {currentWeek}{" "}
                <span style={{ fontWeight: "500", opacity: 0.8, fontSize: "11px", marginLeft: "4px" }}>
                  ({weekInfo.label})
                </span>
              </div>
              <button className="week-nav-btn bordered" onClick={handleNextWeek} disabled={currentWeek >= maxWeek}>
                <IoCaretForward />
              </button>
            </div>
            <button className="cp-add-btn" onClick={() => setIsNotificationModalOpen(true)}>
              <FiSend /> Báo cáo GVCN
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="cp-loading">
            <FiLoader className="spin" /> Đang tải dữ liệu vi phạm...
          </div>
        ) : violations.length === 0 ? (
          <div className="cp-empty">
            <span>✅</span>
            <p>Không có vi phạm nào trong tuần {currentWeek} ({weekInfo.label})</p>
          </div>
        ) : (
          <table className="cp-violations-table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Tiết học</th>
                <th>Môn</th>
                <th>Học sinh</th>
                <th>Lỗi vi phạm</th>
                <th>Điểm trừ</th>
              </tr>
            </thead>
            <tbody>
              {violations.map((v, idx) => (
                <tr key={v.id || idx}>
                  <td>{formatDate(v.date)}</td>
                  <td>{v.periodLabel || "—"}</td>
                  <td>{v.subjectName || "—"}</td>
                  <td>
                    <div className="cp-student">
                      <FiUserX className="cp-student-icon" />
                      <span>{v.studentName || "—"}</span>
                    </div>
                  </td>
                  <td>{v.content || v.category || "—"}</td>
                  <td className="cp-pts">{v.points || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isNotificationModalOpen && (
        <div className="cp-modal-overlay" onClick={() => setIsNotificationModalOpen(false)}>
          <div className="cp-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="cp-modal-header">
              <h3>Báo cáo với Giáo viên chủ nhiệm</h3>
              <p>Nội dung sẽ được gửi trực tiếp đến giáo viên chủ nhiệm và lưu lại lịch sử.</p>
            </div>
            <form onSubmit={handleSendNotification} className="cp-modal-form">
              <textarea
                placeholder="Nhập nội dung báo cáo hoặc trao đổi với giáo viên..."
                value={notification}
                onChange={(e) => setNotification(e.target.value)}
                disabled={isSendingNotif}
                autoFocus
              />
              <div className="cp-modal-footer">
                <button
                  type="button"
                  className="cp-modal-cancel"
                  onClick={() => setIsNotificationModalOpen(false)}
                  disabled={isSendingNotif}
                >
                  Hủy
                </button>
                <button type="submit" className="cp-modal-submit" disabled={isSendingNotif || !notification.trim()}>
                  {isSendingNotif ? <FiLoader className="spin" /> : <FiSend />}{" "}
                  {isSendingNotif ? "Đang gửi..." : "Gửi báo cáo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
