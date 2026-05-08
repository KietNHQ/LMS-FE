import React, { useState, useEffect, useMemo } from "react";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import "./StudentWeeklyScheduleSection.css";
import { getStartOfIsoWeek, STATUS_META, SUBJECT_COLOR_MAP } from "../../../../../utils/timetableShared";
import { studentService } from "../../../../../services/pages/student/studentService";

const DAY_NAMES = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];
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

function isToday(date) {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

export default function StudentWeeklyScheduleSection({ 
  weekOffset, 
  studentId, 
  onSelectDay, 
  onLessonSelect,
  lessons = [],
  isLoading = false,
  error = null,
  sessionView = "morning",
  setSessionView,
  selectedSubject = "Tất cả"
}) {
  const days = getWeekDates(weekOffset);

  const filteredLessons = useMemo(() => {
    if (selectedSubject === "Tất cả") return lessons;
    return lessons.filter((l) => l.subject === selectedSubject);
  }, [lessons, selectedSubject]);

  const getCellLesson = (dayIdx, period) => {
    const dayKey = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][dayIdx];
    return filteredLessons.find((l) => l.day === dayKey && l.periodStart <= period && l.periodEnd >= period) || null;
  };

  const isMorning = sessionView === "morning";
  const displayPeriods = isMorning ? [1, 2, 3, 4, 5] : [6, 7, 8, 9, 10];

  const buildLessonDetail = (lesson, dayIdx, period) => {
    const date = days[dayIdx];
    return {
      ...lesson,
      dayIndex: dayIdx,
      dayName: DAY_NAMES[dayIdx],
      dateLabel: date.toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      timeRange: PERIOD_TIME[period],
      session: period <= 5 ? "Sáng" : "Chiều",
    };
  };

  if (isLoading) {
    return (
      <div className="weekly-schedule-section">
        <div className="weekly-table-empty">Đang tải thời khóa biểu...</div>
      </div>
    );
  }

  if (error && lessons.length === 0) {
    return (
      <div className="weekly-schedule-section">
        <div className="weekly-table-empty">{error}</div>
      </div>
    );
  }

  return (
    <div className="weekly-schedule-section">
      <div className="weekly-table-wrapper">
        <table className="weekly-table">
          <thead>
            <tr>
              <th className="period-col">Thời gian</th>
              {days.map((date, idx) => (
                <th
                  key={idx}
                  className={`day-header ${isToday(date) ? "today-col" : ""}`}
                  onClick={() => onSelectDay && onSelectDay(idx)}
                >
                  <span className="day-name">{DAY_NAMES[idx]}</span>
                  <span className="day-date">
                    {date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}
                  </span>
                  {isToday(date) && <span className="today-badge">Hôm nay</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayPeriods.map((period) => (
              <tr key={period} className={period === 6 ? "break-row" : ""}>
                <td className="period-cell">
                  <span className="period-num">Tiết {period}</span>
                  <span className="period-time">{PERIOD_TIME[period]}</span>
                </td>
                {days.map((_, dayIdx) => {
                  const lesson = getCellLesson(dayIdx, period);
                  return (
                    <td
                      key={dayIdx}
                      className={`schedule-cell ${isToday(new Date(days[dayIdx])) ? "today-cell" : ""}`}
                    >
                      {lesson && (
                        <div
                          className={`lesson-card color-${lesson.color}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onLessonSelect?.(buildLessonDetail(lesson, dayIdx, period));
                          }}
                        >
                          <div className="lesson-header">
                            <div className="lesson-subject">{lesson.subject}</div>
                            <span className={`lesson-type-chip status-${lesson.status}`}>
                              {STATUS_META[lesson.status]?.label || "Bình thường"}
                            </span>
                          </div>
                          <div className="lesson-room">{lesson.room}</div>
                          <div className="lesson-extra">
                            <span>
                              <PersonRoundedIcon />
                              {lesson.teacher}
                            </span>
                            <span>
                              <AccessTimeRoundedIcon />
                              {PERIOD_TIME[period].split(" - ")[0]}
                            </span>
                          </div>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

