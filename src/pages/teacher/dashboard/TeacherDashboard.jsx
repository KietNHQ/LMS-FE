import React from "react";
import OverviewCardsSection from "./components/overviewCardsSection/OverviewCardsSection";
import RecentActivitiesSection from "./components/recentActivitiesSection/RecentActivitiesSection";
import UpcomingScheduleSection from "./components/upcomingScheduleSection/UpcomingScheduleSection";
import "./TeacherDashboard.css";

export default function TeacherDashboard() {
    return (
        <div className="teacher-dashboard">
            <h1>Teacher Dashboard</h1>
            <OverviewCardsSection />
            <RecentActivitiesSection />
            <UpcomingScheduleSection />
        </div>
    );
}

