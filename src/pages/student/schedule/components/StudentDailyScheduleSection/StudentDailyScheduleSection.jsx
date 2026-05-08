import React from "react";
import { Clock, MapPin, User, ChevronRight, Bookmark, AlertCircle } from "lucide-react";
import { getStudentWeekLessonsById, STATUS_META } from "../../../../../utils/timetableShared";
import "./StudentDailyScheduleSection.css";

const DAY_NAMES = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"];
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

export default function StudentDailyScheduleSection({ weekOffset, selectedDay, lessons = [], onLessonSelect }) {
  const days = [];
  const curr = new Date();
  const day = curr.getDay() || 7;
  const monday = new Date(curr);
  monday.setDate(curr.getDate() - day + 1 + (weekOffset * 7));
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }

  const selectedDate = days[selectedDay];
  const dayKeys = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const dayKey = dayKeys[selectedDay];

  const dayLessons = (lessons || [])
    .filter((l) => l.day === dayKey)
    .sort((a, b) => a.periodStart - b.periodStart);

  const dateStr = selectedDate.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const buildLessonDetail = (lesson) => ({
    ...lesson,
    dayIndex: selectedDay,
    dayName: DAY_NAMES[selectedDay],
    dateLabel: dateStr,
    session: lesson.periodStart <= 5 ? "Sáng" : "Chiều",
  });

  return (
    <div className="student-daily-view">
      <div className="daily-view-header">
        <div className="daily-view-info">
          <h3>Lịch học {DAY_NAMES[selectedDay]}</h3>
          <p>{dateStr}</p>
        </div>
        <div className="daily-view-count">
          <span>{dayLessons.length} tiết học</span>
        </div>
      </div>

      {dayLessons.length === 0 ? (
        <div className="daily-view-empty">
          <div className="empty-icon">🏖️</div>
          <p>Không có tiết học nào</p>
          <span>Hãy tận hưởng ngày nghỉ của bạn nhé!</span>
        </div>
      ) : (
        <div className="daily-view-list">
          {dayLessons.map((lesson) => (
            <div 
              key={lesson.id} 
              className={`daily-lesson-card color-${lesson.color}`}
              onClick={() => onLessonSelect(buildLessonDetail(lesson))}
            >
              <div className="lesson-time-column">
                <span className="lesson-period">Tiết {lesson.periodStart}{lesson.periodEnd !== lesson.periodStart && ` - ${lesson.periodEnd}`}</span>
                <span className="lesson-time-range">{PERIOD_TIME[lesson.periodStart].split(" - ")[0]}</span>
              </div>

              <div className="lesson-main-info">
                <div className="lesson-top-row">
                  <span className="lesson-subject-name">{lesson.subject}</span>
                  <span className={`lesson-status-tag status-${lesson.status}`}>
                    {STATUS_META[lesson.status]?.label || "Bình thường"}
                  </span>
                </div>

                <div className="lesson-details-row">
                  <span className="detail-item">
                    <MapPin size={14} /> {lesson.room}
                  </span>
                  <span className="detail-item">
                    <User size={14} /> {lesson.teacher}
                  </span>
                  <span className="detail-item">
                    <Clock size={14} /> {PERIOD_TIME[lesson.periodStart]}
                  </span>
                </div>

                {lesson.note && (
                  <div className={`lesson-note-preview ${lesson.note.toLowerCase().includes("kiểm tra") ? "is-important" : ""}`}>
                    {lesson.note.toLowerCase().includes("kiểm tra") ? <AlertCircle size={12} /> : <Bookmark size={12} />}
                    <span>{lesson.note}</span>
                  </div>
                )}
              </div>

              <div className="lesson-action">
                <ChevronRight size={20} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

