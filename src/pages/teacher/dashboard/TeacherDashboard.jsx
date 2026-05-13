import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import teacherService from "../../../services/pages/teacher/teacherService";
import "./TeacherDashboard.css";
import SchoolYearTermSelector from "../../../components/common/SchoolYearTermSelector/SchoolYearTermSelector";
import EventCalendar from "../../../components/common/EventCalendar/EventCalendar";
import LoadingSpinner from "../../../components/common/LoadingSpinner/LoadingSpinner";
import { INITIAL_CALENDAR_EVENTS, CALENDAR_EVENT_TYPES } from "../../../components/common/EventCalendar/eventData";

import OverviewCardsSection from "./components/overviewCardsSection/OverviewCardsSection";
import RecentActivitiesSection from "./components/recentActivitiesSection/RecentActivitiesSection";
import UpcomingScheduleSection from "./components/upcomingScheduleSection/UpcomingScheduleSection";
import QuizManagementSection from "./components/quizManagementSection/QuizManagementSection";

const TeacherDashboard = () => {
  const [selectedSchoolYear, setSelectedSchoolYear] = useState("2024-2025");
  const [selectedTerm, setSelectedTerm] = useState("hk2");

  // Sử dụng TanStack Query để quản lý dữ liệu dashboard
  const { data: dashboardResponse, isLoading, error } = useQuery({
    queryKey: ["teacher-dashboard", selectedSchoolYear, selectedTerm],
    queryFn: () => teacherService.getDashboard({ 
      mock: false,
      params: { schoolYear: selectedSchoolYear, term: selectedTerm }
    }),
    staleTime: 5 * 60 * 1000, // 5 phút
  });

  const dashboardData = React.useMemo(() => {
    const rawData = dashboardResponse?.success ? dashboardResponse.data : null;
    if (!rawData) return null;

    const data = { ...rawData };
    // Trích xuất tên lớp chủ nhiệm nếu chưa có trong stats
    if (data.classes && data.stats && !data.stats.homeroomClassName) {
      const homeroom = data.classes.find(c => 
        c.isHomeroom || 
        c.role === 'GVCN' || 
        c.role === 'LỚP CHỦ NHIỆM' ||
        c.type === 'LỚP CHỦ NHIỆM'
      );
      if (homeroom) {
        data.stats.homeroomClassName = homeroom.class_name || homeroom.name;
      }
    }
    return data;
  }, [dashboardResponse]);

  const handleYearChange = (direction) => {
    const years = selectedSchoolYear.split("-").map(Number);
    if (direction === "next") {
      setSelectedSchoolYear(`${years[0] + 1}-${years[1] + 1}`);
    } else {
      setSelectedSchoolYear(`${years[0] - 1}-${years[1] - 1}`);
    }
  };

  if (error) {
    return (
      <div className="teacher-dashboard-error">
        <h3>Đã xảy ra lỗi khi tải dữ liệu</h3>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div className="teacher-dashboard-container theme-teacher">
      {/* Header */}
      <div className="teacher-dashboard-header">
        <div className="header-left">
          <h2>Xin chào, Giáo viên!</h2>
        </div>
        <SchoolYearTermSelector
          selectedSchoolYear={selectedSchoolYear}
          selectedTerm={selectedTerm}
          onYearChange={handleYearChange}
          onTermChange={setSelectedTerm}
        />
      </div>

      {isLoading ? (
        <div className="layout-loading-wrapper">
          <LoadingSpinner size="lg" label="Đang cập nhật dữ liệu giảng dạy..." role="teacher" />
        </div>
      ) : (
        <>
          {/* Cards */}
          <OverviewCardsSection stats={dashboardData?.stats} />

          {/* Middle */}
          <div className="teacher-dashboard-middle">
            {/* Classes in charge */}
            <UpcomingScheduleSection classes={dashboardData?.classes} />

            {/* Event Calendar */}
            <div className="teacher-dashboard-calendar">
              <EventCalendar
                title="Lịch Sự Kiện"
                themeClass="theme-teacher"
                userRole="teacher"
                isCompact={true}
                currentUser="Giáo viên"
                eventTypes={CALENDAR_EVENT_TYPES}
                initialEvents={INITIAL_CALENDAR_EVENTS}
                selectedSchoolYear={selectedSchoolYear}
                selectedTerm={selectedTerm}
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
            <RecentActivitiesSection activities={dashboardData?.recentActivity} />
            <QuizManagementSection />
          </div>
        </>
      )}
    </div>
  );
};

export default TeacherDashboard;




