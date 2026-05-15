import React, { useState } from "react";
import { FaRegMoon } from "react-icons/fa";
import { BsFillSunFill } from "react-icons/bs";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import "./WeeklyScheduleSection.css";
import { 
  getTeacherWeekLessons, 
  getStartOfIsoWeek, 
  SUBJECT_COLOR_MAP,
  SUBJECT_DISPLAY 
} from "../../../../../utils/timetableShared";

const DAY_NAMES = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// period -> time range
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

function getLessonStatus(note) {
  const lower = (note || "").toLowerCase();
  if (lower.includes("kiểm tra")) return { key: "quiz", label: "Kiểm tra" };
  if (lower.includes("ôn") || lower.includes("bài tập") || lower.includes("luyện")) {
    return { key: "review", label: "Ôn luyện" };
  }
  return { key: "lesson", label: "Bài mới" };
}

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

export default function WeeklyScheduleSection({ 
  weekOffset, 
  selectedClass, 
  onSelectDay, 
  onLessonSelect,
  sessionView,
  setSessionView,
  apiData = [],
  isLoading = false
}) {
  const days = getWeekDates(weekOffset);
  const weekStart = days[0];
  
    // Logic map từ API sang format của UI
    const mappedLessons = React.useMemo(() => {
      // Create local date to avoid mutating dependency warning from React Compiler
      const monday = getStartOfIsoWeek(new Date());
      monday.setDate(monday.getDate() + weekOffset * 7);

      const baseLessons = getTeacherWeekLessons(monday, selectedClass);
      
      if (!apiData || apiData.length === 0) return baseLessons;
      
      const dayMapping = {
        2: "Monday",
        3: "Tuesday",
        4: "Wednesday",
        5: "Thursday",
        6: "Friday",
        7: "Saturday",
        8: "Sunday"
      };

      // Map API data to UI format
      const apiLessons = apiData.map((item, idx) => {
        const subjectKey = item.subject_code || "Toan";
        return {
          id: item.id || idx,
          day: dayMapping[item.day_of_week] || item.day_of_week,
          periodStart: item.period_number,
          periodEnd: item.period_number,
          subject: item.subject_name || SUBJECT_DISPLAY[subjectKey] || subjectKey,
          className: item.class_name || "Lớp",
          room: item.room || "Phòng học",
          teacher: item.teacher_name || "Giáo viên",
          color: item.color || SUBJECT_COLOR_MAP[subjectKey] || "teal",
          note: item.notes || "",
          status: item.status || "normal",
          start_time: item.start_time,
          end_time: item.end_time
        };
      });

      return apiLessons;
    }, [apiData, weekOffset, selectedClass]);

  const lessons = mappedLessons;

  const getCellLesson = (dayIdx, period) => {
    const dayKey = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][dayIdx];
    const lesson = lessons.find((l) => l.day === dayKey && l.periodStart <= period && l.periodEnd >= period);
    if (!lesson) return null;
    return {
      period,
      subject: lesson.subject,
      class: lesson.className,
      room: lesson.room,
      students: 35,
      color: lesson.color,
      note: lesson.note,
      teacher: (() => {
        if (!lesson.teacher) return "Chưa phân công";
        const parts = lesson.teacher.split(" ");
        if (parts.length < 2) return lesson.teacher;
        const givenName = parts.pop();
        const initials = parts.map(s => s[0].toUpperCase()).join(".");
        return `Thầy ${initials ? initials + "." : ""}${givenName}`;
      })(),
      status: lesson.status,
      periodStart: lesson.periodStart,
      periodEnd: lesson.periodEnd,
      start: lesson.start_time,
      end: lesson.end_time,
    };
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
      lessonType: getLessonStatus(lesson.note).label,
      status: lesson.status,
    };
  };

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
                  onClick={() => onSelectDay(idx)}
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
                  const lessonStatus = lesson ? getLessonStatus(lesson.note) : null;
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
                            <span className={`lesson-type-chip status-${lessonStatus?.key}`}>
                              {lessonStatus?.label}
                            </span>
                          </div>
                          <div className="lesson-room">{lesson.room}</div>
                          <div className="lesson-extra">
                            <span>
                              <SchoolRoundedIcon />
                              {lesson.class}
                            </span>
                            <span>
                              <AccessTimeRoundedIcon />
                              {lesson.start && lesson.end 
                                ? `${lesson.start} - ${lesson.end}`
                                : `${PERIOD_TIME[period].split(" - ")[0]} - ${PERIOD_TIME[period].split(" - ")[1]}`
                              }
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

