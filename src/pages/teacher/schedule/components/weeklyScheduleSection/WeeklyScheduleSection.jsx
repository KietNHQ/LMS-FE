import React, { useState } from "react";
import { FaRegMoon } from "react-icons/fa";
import { BsFillSunFill } from "react-icons/bs";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import "./WeeklyScheduleSection.css";

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

// Mock schedule data: { dayIndex (0=Mon): [{ period, subject, class, room, color }] }
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

function isToday(date) {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

export default function WeeklyScheduleSection({ weekOffset, selectedClass, onSelectDay, onLessonSelect }) {
  const [sessionView, setSessionView] = useState("morning");
  const days = getWeekDates(weekOffset);

  const getCellLesson = (dayIdx, period) => {
    const dayLessons = SCHEDULE_DATA[dayIdx] || [];
    const lesson = dayLessons.find((l) => l.period === period);
    if (!lesson) return null;
    if (selectedClass !== "Tất cả" && lesson.class !== selectedClass) return null;
    return lesson;
  };

  const isMorning = sessionView === "morning";
  const displayPeriods = isMorning ? [1, 2, 3, 4, 5] : [6, 7, 8, 9, 10];

  return (
    <div className="weekly-schedule-section">
      <div className="weekly-header-bar">
        <p className="weekly-schedule-title">Thời khóa biểu tuần</p>
        <button
          type="button"
          className={`tt-session-toggle-btn ${isMorning ? "tt-session-toggle-morning" : "tt-session-toggle-afternoon"}`}
          onClick={() => setSessionView(isMorning ? "afternoon" : "morning")}
        >
          <span className="tt-session-toggle-icon-wrap">
            {!isMorning ? (
              <FaRegMoon className="tt-session-toggle-icon moon" />
            ) : (
              <BsFillSunFill className="tt-session-toggle-icon sun" />
            )}
          </span>
          <span className={`tt-session-toggle-label ${isMorning ? "moon" : "sun"}`}>
            Đổi sang 5 tiết {isMorning ? "chiều" : "sáng"}
          </span>
        </button>
      </div>

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
                            onLessonSelect?.(lesson);
                          }}
                        >
                          <div className="lesson-header">
                            <div className="lesson-subject">{lesson.subject}</div>
                          </div>
                          <div className="lesson-room">{lesson.room}</div>
                          <div className="lesson-extra">
                            <span>
                              <SchoolRoundedIcon />
                              {lesson.class}
                            </span>
                            <span>
                              <AccessTimeRoundedIcon />
                              {PERIOD_TIME[period].split(" - ")[0]} - {PERIOD_TIME[period].split(" - ")[1]}
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
