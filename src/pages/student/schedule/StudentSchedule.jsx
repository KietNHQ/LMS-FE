import React, { useMemo, useState } from "react";
import "./StudentSchedule.css";
import ScheduleHeader from "./components/ScheduleHeader/ScheduleHeader";
import ScheduleToolbar from "./components/ScheduleToolbar/ScheduleToolbar";
import ScheduleGrid from "./components/ScheduleGrid/ScheduleGrid";
import {
    getStartOfIsoWeek,
    getStudentWeekLessonsById,
    shiftWeek,
} from "../../../utils/timetableShared";

const days = [
    { key: "Monday", label: "THỨ 2" },
    { key: "Tuesday", label: "THỨ 3" },
    { key: "Wednesday", label: "THỨ 4" },
    { key: "Thursday", label: "THỨ 5" },
    { key: "Friday", label: "THỨ 6" },
];

const periods = [
    { period: 1, start: "07:00", end: "07:45", session: "Sáng" },
    { period: 2, start: "07:50", end: "08:35", session: "Sáng" },
    { period: 3, start: "08:45", end: "09:30", session: "Sáng" },
    { period: 4, start: "09:35", end: "10:20", session: "Sáng" },
    { period: 5, start: "10:30", end: "11:15", session: "Sáng" },
    { period: 6, start: "13:00", end: "13:45", session: "Chiều" },
    { period: 7, start: "13:50", end: "14:35", session: "Chiều" },
    { period: 8, start: "14:45", end: "15:30", session: "Chiều" },
    { period: 9, start: "15:35", end: "16:20", session: "Chiều" },
    { period: 10, start: "16:25", end: "17:10", session: "Chiều" },
];

function getWeekLabel(weekStart) {
    const monday = getStartOfIsoWeek(weekStart);
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    const formatDate = (date) => date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    return `${formatDate(monday)} - ${formatDate(friday)}`;
}

export default function StudentSchedule() {
    const studentId = "STU1024";
    const classNameValue = "10A1";
    const [weekStart, setWeekStart] = useState(() => getStartOfIsoWeek(new Date()));
    const [sessionView, setSessionView] = useState("morning");

    const lessons = useMemo(
        () => getStudentWeekLessonsById(studentId, weekStart),
        [studentId, weekStart]
    );

    const weekLabel = useMemo(() => getWeekLabel(weekStart), [weekStart]);

    const visiblePeriods = useMemo(() => {
        return periods.filter((period) => (sessionView === "morning" ? period.session === "Sáng" : period.session === "Chiều"));
    }, [sessionView]);

    const getLesson = (dayKey, period) => lessons.find((item) => item.day === dayKey && item.periodStart <= period && item.periodEnd >= period);

    return (
        <div className="student-schedule-page">
            <ScheduleHeader
                classNameValue={classNameValue}
                sessionView={sessionView}
                onToggleSessionView={() => setSessionView((prev) => (prev === "morning" ? "afternoon" : "morning"))}
            />

            <ScheduleToolbar
                weekLabel={weekLabel}
                classNameValue={classNameValue}
                onPrevWeek={() => setWeekStart((prev) => shiftWeek(prev, -1))}
                onNextWeek={() => setWeekStart((prev) => shiftWeek(prev, 1))}
                onToday={() => setWeekStart(getStartOfIsoWeek(new Date()))}
            />

            <ScheduleGrid
                days={days}
                periods={visiblePeriods}
                getLesson={getLesson}
            />
        </div>
    );
}