import React from "react";
import "./DailyScheduleSection.css";
import { MapPin, Users, Clock, BookOpen, ChevronRight } from "lucide-react";

const DAY_NAMES = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

const PERIOD_TIME = {
  1: "07:00 - 07:45",
  2: "07:50 - 08:35",
  3: "08:45 - 09:30",
  4: "09:35 - 10:20",
  5: "10:30 - 11:15",
  6: "13:00 - 13:45",
  7: "13:50 - 14:35",
  8: "14:45 - 15:30",
  9: "15:35 - 16:20",
  10: "16:25 - 17:10",
};

const SCHEDULE_DATA = {
  0: [
    { period: 1, subject: "Toán", class: "10A1", room: "P.201", students: 35, color: "teal", note: "Chương 3: Hàm số bậc nhất" },
    { period: 2, subject: "Toán", class: "10A1", room: "P.201", students: 35, color: "teal", note: "Chương 3: Hàm số bậc nhất" },
    { period: 5, subject: "Toán nâng cao", class: "11B2", room: "P.305", students: 30, color: "purple", note: "Lượng giác - Bài tập" },
  ],
  1: [
    { period: 3, subject: "Toán", class: "10A2", room: "P.102", students: 33, color: "blue", note: "Chương 3: Hàm số" },
    { period: 4, subject: "Toán", class: "10A2", room: "P.102", students: 33, color: "blue", note: "Chương 3: Hàm số" },
    { period: 7, subject: "Toán", class: "12A1", room: "P.401", students: 38, color: "orange", note: "Ôn tập tích phân" },
    { period: 8, subject: "Toán", class: "12A1", room: "P.401", students: 38, color: "orange", note: "Ôn tập tích phân" },
  ],
  2: [
    { period: 1, subject: "Toán", class: "11B1", room: "P.203", students: 34, color: "pink", note: "Tổ hợp - Xác suất" },
    { period: 2, subject: "Toán", class: "11B1", room: "P.203", students: 34, color: "pink", note: "Tổ hợp - Xác suất" },
    { period: 6, subject: "Toán", class: "10A1", room: "P.201", students: 35, color: "teal", note: "Kiểm tra 15 phút" },
  ],
  3: [
    { period: 3, subject: "Toán nâng cao", class: "11B2", room: "P.305", students: 30, color: "purple", note: "Lượng giác" },
    { period: 4, subject: "Toán nâng cao", class: "11B2", room: "P.305", students: 30, color: "purple", note: "Lượng giác" },
    { period: 8, subject: "Toán", class: "10A2", room: "P.102", students: 33, color: "blue", note: "Phương trình - Bất phương trình" },
  ],
  4: [
    { period: 1, subject: "Toán", class: "12A1", room: "P.401", students: 38, color: "orange", note: "Đạo hàm - Ứng dụng" },
    { period: 2, subject: "Toán", class: "12A1", room: "P.401", students: 38, color: "orange", note: "Đạo hàm - Ứng dụng" },
    { period: 5, subject: "Toán", class: "11B1", room: "P.203", students: 34, color: "pink", note: "Xác suất - Bài tập" },
    { period: 6, subject: "Toán", class: "11B1", room: "P.203", students: 34, color: "pink", note: "Xác suất - Bài tập" },
  ],
  5: [],
  6: [],
};

function getWeekDates(offset = 0) {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + offset * 7);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

export default function DailyScheduleSection({ weekOffset, selectedDay, selectedClass, onLessonSelect }) {
  const days = getWeekDates(weekOffset);
  const date = days[selectedDay];

  let lessons = SCHEDULE_DATA[selectedDay] || [];
  if (selectedClass !== "Tất cả") {
    lessons = lessons.filter((l) => l.class === selectedClass);
  }

  const dateStr = date.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="daily-schedule-section">
      {/* Header */}
      <div className="daily-header">
        <div>
          <p className="daily-title">Lịch dạy trong ngày</p>
          <p className="daily-date">{dateStr}</p>
        </div>
        <div className="daily-summary">
          <span className="daily-summary-badge">
            <BookOpen size={13} />
            {lessons.length} tiết
          </span>
        </div>
      </div>

      {/* List */}
      {lessons.length === 0 ? (
        <div className="daily-empty">
          <div className="daily-empty-icon">📅</div>
          <p>Không có tiết học nào trong ngày này</p>
          <span>Hãy nghỉ ngơi hoặc chuẩn bị bài giảng!</span>
        </div>
      ) : (
        <div className="daily-list">
          {lessons.map((lesson, idx) => (
            <div key={idx} className={`daily-item color-${lesson.color}`} onClick={() => onLessonSelect?.(lesson)}>
              {/* Period badge */}
              <div className="daily-period-badge">
                <span>Tiết</span>
                <strong>{lesson.period}</strong>
              </div>

              {/* Info */}
              <div className="daily-info">
                <div className="daily-top">
                  <span className="daily-subject">{lesson.subject}</span>
                  <ChevronRight size={16} className="daily-arrow" />
                </div>
                <p className="daily-note">{lesson.note}</p>
                <div className="daily-meta">
                  <span>
                    <Clock size={12} /> {PERIOD_TIME[lesson.period]}
                  </span>
                  <span>
                    <Users size={12} /> {lesson.class} — {lesson.students} HS
                  </span>
                  <span>
                    <MapPin size={12} /> {lesson.room}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
