import React, { useMemo, useState } from "react";
import "./StudentSchedule.css";
import { FiCalendar, FiClock } from "react-icons/fi";
import { MdOutlineSchool } from "react-icons/md";

const days = [
    { key: "Monday", label: "THỨ 2" },
    { key: "Tuesday", label: "THỨ 3" },
    { key: "Wednesday", label: "THỨ 4" },
    { key: "Thursday", label: "THỨ 5" },
    { key: "Friday", label: "THỨ 6" },
];

const periods = [
    { period: 1, start: "07:00", end: "07:45" },
    { period: 2, start: "07:50", end: "08:35" },
    { period: 3, start: "08:45", end: "09:30" },
    { period: 4, start: "09:40", end: "10:25" },
    { period: 5, start: "10:35", end: "11:20" },
];

const scheduleData = [
    {
        day: "Monday",
        period: 1,
        subject: "Toán",
        teacher: "Nguyễn Văn A",
        room: "P.101",
        start: "07:00",
        end: "07:45",
        color: "math",
    },
    {
        day: "Monday",
        period: 2,
        subject: "Vật lý",
        teacher: "Trần Văn B",
        room: "P.102",
        start: "07:50",
        end: "08:35",
        color: "physics",
    },
    {
        day: "Tuesday",
        period: 1,
        subject: "Hóa học",
        teacher: "Lê Văn C",
        room: "P.Lab1",
        start: "07:00",
        end: "07:45",
        color: "chemistry",
    },
    {
        day: "Tuesday",
        period: 3,
        subject: "Ngữ văn",
        teacher: "Phạm Thị D",
        room: "P.101",
        start: "08:45",
        end: "09:30",
        color: "literature",
    },
    {
        day: "Wednesday",
        period: 2,
        subject: "Tiếng Anh",
        teacher: "Sarah Johnson",
        room: "P.103",
        start: "07:50",
        end: "08:35",
        color: "english",
    },
    {
        day: "Wednesday",
        period: 4,
        subject: "Toán",
        teacher: "Nguyễn Văn A",
        room: "P.101",
        start: "09:40",
        end: "10:25",
        color: "math",
    },
    {
        day: "Thursday",
        period: 1,
        subject: "Vật lý",
        teacher: "Trần Văn B",
        room: "P.Lab2",
        start: "07:00",
        end: "07:45",
        color: "physics",
    },
    {
        day: "Thursday",
        period: 3,
        subject: "Hóa học",
        teacher: "Lê Văn C",
        room: "P.Lab1",
        start: "08:45",
        end: "09:30",
        color: "chemistry",
    },
    {
        day: "Friday",
        period: 2,
        subject: "Tiếng Anh",
        teacher: "Sarah Johnson",
        room: "P.103",
        start: "07:50",
        end: "08:35",
        color: "english",
    },
    {
        day: "Friday",
        period: 4,
        subject: "Ngữ văn",
        teacher: "Phạm Thị D",
        room: "P.101",
        start: "09:40",
        end: "10:25",
        color: "literature",
    },
    {
        day: "Friday",
        period: 5,
        subject: "Toán",
        teacher: "Nguyễn Văn A",
        room: "P.101",
        start: "10:35",
        end: "11:20",
        color: "math",
    },
];

function getMondayAndFridayFromWeek(weekValue) {
    if (!weekValue) return { monday: "13/01/2025", friday: "17/01/2025" };

    const [year, week] = weekValue.split("-W").map(Number);
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dayOfWeek = simple.getDay();
    const monday = new Date(simple);
    if (dayOfWeek <= 4) {
        monday.setDate(simple.getDate() - simple.getDay() + 1);
    } else {
        monday.setDate(simple.getDate() + 8 - simple.getDay());
    }

    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);

    const format = (date) =>
        `${String(date.getDate()).padStart(2, "0")}/${String(
            date.getMonth() + 1
        ).padStart(2, "0")}/${date.getFullYear()}`;

    return {
        monday: format(monday),
        friday: format(friday),
    };
}

export default function StudentSchedule() {
    const [selectedWeek, setSelectedWeek] = useState("2025-W03");

    const { monday, friday } = useMemo(
        () => getMondayAndFridayFromWeek(selectedWeek),
        [selectedWeek]
    );

    const getLesson = (day, period) =>
        scheduleData.find((item) => item.day === day && item.period === period);

    return (
        <div className="student-schedule-page">
            <div className="schedule-page-header">
                <h1>Thời khóa biểu</h1>
                <p>Lịch học tuần của lớp 10A1</p>
            </div>

            <div className="schedule-week-bar">
                <div className="schedule-week-info">
                    <FiCalendar className="week-icon" />
                    <span>
            Tuần: {monday} — {friday} • Lớp 10A1
          </span>
                </div>

                <div className="schedule-week-picker">
                    <label htmlFor="weekPicker">Chọn tuần</label>
                    <input
                        id="weekPicker"
                        type="week"
                        value={selectedWeek}
                        onChange={(e) => setSelectedWeek(e.target.value)}
                    />
                </div>
            </div>

            <div className="schedule-board">
                <div className="schedule-grid schedule-grid-header">
                    <div className="grid-head time-head">TIẾT / THỨ</div>
                    {days.map((day) => (
                        <div key={day.key} className="grid-head">
                            {day.label}
                        </div>
                    ))}
                </div>

                {periods.map((p) => (
                    <div className="schedule-grid schedule-grid-row" key={p.period}>
                        <div className="time-cell">
                            <div className="period-label">Tiết {p.period}</div>
                            <div className="period-time">
                                ({p.start})
                            </div>
                        </div>

                        {days.map((day) => {
                            const lesson = getLesson(day.key, p.period);

                            return (
                                <div className="lesson-cell" key={`${day.key}-${p.period}`}>
                                    {lesson ? (
                                        <div className={`lesson-pill ${lesson.color}`}>
                                            <div className="lesson-subject">{lesson.subject}</div>
                                            <div className="lesson-room">{lesson.room}</div>

                                            <div className="lesson-extra">
                        <span>
                          <MdOutlineSchool />
                            {lesson.teacher}
                        </span>
                                                <span>
                          <FiClock />
                                                    {lesson.start} - {lesson.end}
                        </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="lesson-empty">—</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}