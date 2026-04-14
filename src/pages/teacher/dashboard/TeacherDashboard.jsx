import React, { useState } from "react";
import "./TeacherDashboard.css";
import SchoolYearTermSelector from "../../../components/common/SchoolYearTermSelector/SchoolYearTermSelector";
import EventCalendar from "../../../components/common/EventCalendar/EventCalendar";
import { INITIAL_CALENDAR_EVENTS, CALENDAR_EVENT_TYPES } from "../../../components/common/EventCalendar/eventData";

import OverviewCardsSection from "./components/overviewCardsSection/OverviewCardsSection";
import RecentActivitiesSection from "./components/recentActivitiesSection/RecentActivitiesSection";
import UpcomingScheduleSection from "./components/upcomingScheduleSection/UpcomingScheduleSection";
import QuizManagementSection from "./components/quizManagementSection/QuizManagementSection";

const TeacherDashboard = () => {
  const [selectedSchoolYear, setSelectedSchoolYear] = useState("2024-2025");
  const [selectedTerm, setSelectedTerm] = useState("hk2");

  const handleYearChange = (direction) => {
    const years = selectedSchoolYear.split("-").map(Number);
    if (direction === "next") {
      setSelectedSchoolYear(`${years[0] + 1}-${years[1] + 1}`);
    } else {
      setSelectedSchoolYear(`${years[0] - 1}-${years[1] - 1}`);
    }
  };

  return (
    <div className="teacher-dashboard-container theme-teacher">
      {/* Header */}
      <div className="teacher-dashboard-header">
        <div className="header-left">
          <h2>Xin chào, Hương! 👋</h2>
        </div>
        <SchoolYearTermSelector
          selectedSchoolYear={selectedSchoolYear}
          selectedTerm={selectedTerm}
          onYearChange={handleYearChange}
          onTermChange={setSelectedTerm}
        />
      </div>

      {/* Cards */}
      <OverviewCardsSection />

      {/* Middle */}
      <div className="teacher-dashboard-middle">
        {/* Classes in charge (moved from right) */}
        <UpcomingScheduleSection />

        {/* Event Calendar (new) */}
        <div className="teacher-dashboard-calendar">
          <EventCalendar 
            title="Lịch Sự Kiện"
            themeClass="theme-teacher"
            userRole="teacher"
            isCompact={true}
            currentUser="Lê Minh Hoàng"
            eventTypes={CALENDAR_EVENT_TYPES}
            initialEvents={INITIAL_CALENDAR_EVENTS}
            rolePolicy={{
              canCreate: true,
              canViewDetails: true,
              canEdit: true,
              canDelete: true
            }}
          />
        </div>
      </div>


      {/* Bottom */}
      <div className="teacher-dashboard-bottom">
        <RecentActivitiesSection />
        <QuizManagementSection />
      </div>
    </div>
  );
};

export default TeacherDashboard;


