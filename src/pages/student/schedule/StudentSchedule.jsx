import React, { useState } from "react";
import StudentWeeklyScheduleSection from "./components/StudentWeeklyScheduleSection/StudentWeeklyScheduleSection";
import StudentScheduleFilterSection from "./components/StudentScheduleFilterSection/StudentScheduleFilterSection";
import Modal from "../../../components/ui/Modal/Modal";
import { PageHeader } from "../../../components/common";
import { STATUS_META } from "../../../utils/timetableShared";
import "./StudentSchedule.css";

function getTodayDayIndex() {
  const day = new Date().getDay(); // 0=Sun
  return day === 0 ? 6 : day - 1;
}

export default function StudentSchedule() {
  const studentId = "STU1024"; // Mock logged-in student
  const classNameValue = "10A1";

  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedLesson, setSelectedLesson] = useState(null);

  const handleQuickDaySelect = (offset) => {
    const now = new Date();
    const target = new Date(now);
    target.setDate(now.getDate() + offset);
    // Move weekOffset if necessary, but skipping for simplicity in quick navigation without daily view
    // Instead of opening Daily view, we just jump to the correct week
    const diffTime = target.getTime() - now.getTime();
    const diffWeeks = Math.round(diffTime / (1000 * 60 * 60 * 24 * 7));
    setWeekOffset(diffWeeks);
  };

  const handleSelectDay = (idx) => {
    // Optionally open daily view, but currently not implemented for student
  };

  return (
    <div className="student-schedule-page">
      <StudentScheduleFilterSection
        weekOffset={weekOffset}
        setWeekOffset={setWeekOffset}
        onQuickDaySelect={handleQuickDaySelect}
      />

      <div className="student-schedule-content">
        <StudentWeeklyScheduleSection
          weekOffset={weekOffset}
          studentId={studentId}
          onSelectDay={handleSelectDay}
          onLessonSelect={setSelectedLesson}
        />
      </div>

      <Modal
        open={!!selectedLesson}
        title="Chi tiết tiết học"
        onClose={() => setSelectedLesson(null)}
        className="student-lesson-modal"
      >
        {selectedLesson && (
          <div className="student-lesson-modal-content">
            <div className="modal-header-info">
              <div>
                <h3>{selectedLesson.subject}</h3>
                <p className="modal-header-subtitle">
                  {selectedLesson.dayName || "Lịch học"} - {selectedLesson.dateLabel || "Chưa cập nhật ngày"}
                </p>
              </div>
              <div className="modal-header-badges">
                <span className={`modal-badge color-${selectedLesson.color}`}>
                  {selectedLesson.timeRange}
                </span>
                <span className={`modal-type-badge status-${selectedLesson.status}`}>
                  {STATUS_META[selectedLesson.status]?.label || "Bình thường"}
                </span>
              </div>
            </div>

            <div className="modal-info-grid">
              <div className="modal-info-card">
                <h4>Thông tin lớp</h4>
                <p><strong>Lớp:</strong> {classNameValue}</p>
                <p><strong>Phòng học:</strong> {selectedLesson.room}</p>
                <p><strong>Giáo viên:</strong> {selectedLesson.teacher}</p>
                <p><strong>Hình thức:</strong> {selectedLesson.mode === "online" ? "Trực tuyến" : "Trực tiếp"}</p>
              </div>

              <div className="modal-info-card">
                <h4>Thời gian</h4>
                <p><strong>Khung giờ:</strong> {selectedLesson.timeRange}</p>
                <p><strong>Tiết:</strong> {selectedLesson.periodStart} - {selectedLesson.periodEnd}</p>
                <p><strong>Buổi học:</strong> {selectedLesson.session}</p>
              </div>

              <div className="modal-info-card modal-info-card-wide">
                <h4>Ghi chú từ giáo viên</h4>
                <p>
                  {selectedLesson.note || "Không có ghi chú nào cho tiết học này."}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}