import React from "react";
import WeeklyScheduleSection from "./components/weeklyScheduleSection/WeeklyScheduleSection";
import DailyScheduleSection from "./components/dailyScheduleSection/DailyScheduleSection";
import ScheduleFilterSection from "./components/scheduleFilterSection/ScheduleFilterSection";
import "./TeacherSchedule.css";

export default function TeacherSchedule() {
    return (
        <div className="teacher-schedule">
            <h1>Thời khóa biểu</h1>
            <ScheduleFilterSection />
            <WeeklyScheduleSection />
            <DailyScheduleSection />
        </div>
    );
}

