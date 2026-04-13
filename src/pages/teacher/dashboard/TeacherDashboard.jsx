import React, { useState } from "react";
import "./TeacherDashboard.css";
import SchoolYearTermSelector from "../../../components/common/SchoolYearTermSelector/SchoolYearTermSelector";
import EventCalendar from "../../../components/common/EventCalendar/EventCalendar";

import OverviewCardsSection from "./components/overviewCardsSection/OverviewCardsSection";
import RecentActivitiesSection from "./components/recentActivitiesSection/RecentActivitiesSection";
import UpcomingScheduleSection from "./components/upcomingScheduleSection/UpcomingScheduleSection";
import QuizManagementSection from "./components/quizManagementSection/QuizManagementSection";

const TeacherDashboard = () => {
  const [selectedSchoolYear, setSelectedSchoolYear] = useState("2024-2025");
  const [selectedTerm, setSelectedTerm] = useState("hk2");

  const teacherEventTypes = [
    { value: "blue", label: "Ngày kiểm tra", description: "Thông báo kiểm tra" },
    { value: "teal", label: "Sự kiện lớp", description: "Sự kiện cấp lớp" },
    { value: "red", label: "Ngày lễ", description: "Ngày lễ trường" },
    { value: "orange", label: "Ngày nghỉ", description: "Ngày nghỉ toàn trường" },
  ];

  const teacherInitialEvents = [
    { startDay: 10, endDay: 10, title: "Kiểm tra Toán 15p", content: "Chương 1: Đại số", color: "blue", createdBy: "Lê Minh Hoàng", createdRole: "Giáo viên" },
    { startDay: 15, endDay: 15, title: "Họp phụ huynh", content: "Báo cáo giữa kỳ", color: "teal", createdBy: "Lê Minh Hoàng", createdRole: "Giáo viên" },
    { startDay: 15, endDay: 15, title: "Lễ kỷ niệm", content: "Sinh hoạt chung", color: "red", createdBy: "Trần Gia Bảo", createdRole: "Quản trị viên" },
    { startDay: 25, endDay: 25, title: "Nghỉ lễ", content: "Thông báo nghỉ", color: "orange", createdBy: "Trần Gia Bảo", createdRole: "Quản trị viên" },
  ];

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
            currentUser="Lê Minh Hoàng"
            eventTypes={teacherEventTypes}
            initialEvents={teacherInitialEvents}
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


