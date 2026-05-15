import React, { useState, useEffect } from "react";
import "./DailyScheduleSection.css";
import { MapPin, Users, Clock, BookOpen, ChevronRight, FileText, BookMarked, Pencil, BarChart3 } from "lucide-react";
import { getStartOfIsoWeek, getTeacherWeekLessons } from "../../../../../utils/timetableShared";

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

function getWeekDates(offset = 0) {
  const monday = getStartOfIsoWeek(new Date());
  monday.setDate(monday.getDate() + offset * 7);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

function getLessonStatus(note) {
  if (note?.toLowerCase().includes("kiểm tra")) return "quiz";
  if (note?.toLowerCase().includes("ôn tập")) return "review";
  if (note?.toLowerCase().includes("bài tập")) return "practice";
  return "lesson";
}

function formatTimeRange(period) {
  const [start, end] = PERIOD_TIME[period].split(" - ");
  return { start, end };
}

function groupLessonsByClass(lessons) {
  const grouped = {};
  lessons.forEach((lesson) => {
    if (!grouped[lesson.class]) {
      grouped[lesson.class] = [];
    }
    grouped[lesson.class].push(lesson);
  });
  // Sort by first period of each class
  return Object.fromEntries(
    Object.entries(grouped).sort((a, b) => {
      const periodA = Math.min(...a[1].map((l) => l.period));
      const periodB = Math.min(...b[1].map((l) => l.period));
      return periodA - periodB;
    })
  );
}

export default function DailyScheduleSection({ 
  weekOffset, 
  selectedDay, 
  selectedClass, 
  onLessonSelect,
  apiData = []
}) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const days = getWeekDates(weekOffset);
  const date = days[selectedDay];
  const weekStart = days[0];
  
  const dayKey = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][selectedDay];

  const lessons = React.useMemo(() => {
    // Re-create the monday object to avoid mutating dependency warning from React Compiler
    const monday = getStartOfIsoWeek(new Date());
    monday.setDate(monday.getDate() + weekOffset * 7);

    if (apiData && apiData.length > 0) {
      const dayMapping = {
        2: "Monday",
        3: "Tuesday",
        4: "Wednesday",
        5: "Thursday",
        6: "Friday",
        7: "Saturday",
        8: "Sunday"
      };

      return apiData
        .filter(item => {
          const itemDay = dayMapping[item.day_of_week] || item.day_of_week;
          const classMatch = selectedClass === "Tất cả" || item.class_name === selectedClass;
          return itemDay === dayKey && classMatch;
        })
        .sort((a, b) => a.period_number - b.period_number)
        .map(item => ({
          period: item.period_number,
          subject: item.subject_name,
          class: item.class_name,
          room: item.room,
          students: 35,
          color: item.color || "teal",
          note: item.notes || "",
          periodEnd: item.period_number,
          status: item.status || "normal",
          start_time: item.start_time,
          end_time: item.end_time,
        }));
    }

    const allLessons = getTeacherWeekLessons(monday, selectedClass);
    return allLessons
      .filter((item) => item.day === dayKey)
      .sort((a, b) => a.periodStart - b.periodStart)
      .map((item) => ({
        period: item.periodStart,
        subject: item.subject,
        class: item.className,
        room: item.room,
        students: 35,
        color: item.color,
        note: item.note,
        periodEnd: item.periodEnd,
        status: item.status,
        timeRange: item.timeRange,
      }));
  }, [apiData, dayKey, weekOffset, selectedClass]);

  const groupedLessons = groupLessonsByClass(lessons);
  const classCount = Object.keys(groupedLessons).length;

  const dateStr = date.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const isToday = new Date().toDateString() === date.toDateString();
  const currentTimeStr = currentTime.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

  const buildLessonDetail = (lesson) => ({
    ...lesson,
    dayIndex: selectedDay,
    dayName: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"][selectedDay],
    dateLabel: date.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    timeRange: lesson.timeRange || PERIOD_TIME[lesson.period],
    session: lesson.period <= 5 ? "Sáng" : "Chiều",
    lessonType:
      getLessonStatus(lesson.note) === "quiz"
        ? "Kiểm tra"
        : getLessonStatus(lesson.note) === "review"
          ? "Ôn tập"
          : getLessonStatus(lesson.note) === "practice"
            ? "Luyện tập"
            : "Bài mới",
  });

  return (
    <div className="daily-schedule-section">
      {/* Header */}
      <div className="daily-header">
        <div className="daily-header-content">
          <p className="daily-title">Lịch dạy trong ngày</p>
          <p className="daily-date">
            {dateStr}
            {isToday && <span className="daily-today-badge">Hôm nay</span>}
          </p>
          {isToday && <p className="daily-current-time">⏰ Thời gian hiện tại: {currentTimeStr}</p>}
        </div>
        <div className="daily-summary">
          <span className="daily-summary-badge">
            <BookOpen size={13} />
            {lessons.length} tiết / {classCount} lớp
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
          {Object.entries(groupedLessons).map(([className, classLessons]) => (
            <div key={className} className="daily-class-group">
              {/* Class Header */}
              <div className="daily-class-header">
                <span className="daily-class-badge">{className}</span>
                <span className="daily-class-count">{classLessons.length} tiết</span>
              </div>

              {/* Class Lessons */}
              <div className="daily-class-items">
                {classLessons.map((lesson, idx) => {
                  const status = getLessonStatus(lesson.note);
                  const startTimeStr = lesson.start_time || formatTimeRange(lesson.period).start;
                  const fullTimeStr = lesson.start_time && lesson.end_time 
                    ? `${lesson.start_time} - ${lesson.end_time}`
                    : PERIOD_TIME[lesson.period];

                  return (
                    <div
                      key={idx}
                      className={`daily-item color-${lesson.color}`}
                      onClick={() => onLessonSelect?.(buildLessonDetail(lesson))}
                    >
                      {/* Period badge with time */}
                      <div className="daily-period-badge">
                        <span>Tiết</span>
                        <strong>{lesson.period}</strong>
                        <small>{startTimeStr}</small>
                      </div>

                      {/* Info */}
                      <div className="daily-info">
                        <div className="daily-top">
                          <div className="daily-subject-wrapper">
                            <span className="daily-subject">{lesson.subject}</span>
                            <span className={`daily-status-badge status-${status}`}>
                              {status === "quiz" && (
                                <>
                                  <FileText size={12} /> Kiểm tra
                                </>
                              )}
                              {status === "review" && (
                                <>
                                  <BookMarked size={12} /> Ôn tập
                                </>
                              )}
                              {status === "practice" && (
                                <>
                                  <Pencil size={12} /> Bài tập
                                </>
                              )}
                              {status === "lesson" && (
                                <>
                                  <BarChart3 size={12} /> Giảng dạy
                                </>
                              )}
                            </span>
                          </div>
                          <ChevronRight size={16} className="daily-arrow" />
                        </div>
                        <p className="daily-note">{lesson.note}</p>
                        <div className="daily-meta">
                          <span className="daily-time-full">
                            <Clock size={12} /> {fullTimeStr}
                          </span>
                          <span>
                            <Users size={12} /> {lesson.students} HS
                          </span>
                          <span>
                            <MapPin size={12} /> {lesson.room}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

