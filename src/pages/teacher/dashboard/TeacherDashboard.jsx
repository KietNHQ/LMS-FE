import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import teacherService from "../../../services/pages/teacher/teacherService";
import "./TeacherDashboard.css";
import SchoolYearTermSelector from "../../../components/common/SchoolYearTermSelector/SchoolYearTermSelector";
import EventCalendar from "../../../components/common/EventCalendar/EventCalendar";
import LoadingSpinner from "../../../components/common/LoadingSpinner/LoadingSpinner";
import { CALENDAR_EVENT_TYPES } from "../../../components/common/EventCalendar/eventData";

import OverviewCardsSection from "./components/overviewCardsSection/OverviewCardsSection";
import RecentActivitiesSection from "./components/recentActivitiesSection/RecentActivitiesSection";
import UpcomingScheduleSection from "./components/upcomingScheduleSection/UpcomingScheduleSection";
import QuizManagementSection from "./components/quizManagementSection/QuizManagementSection";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";

const TeacherDashboard = () => {
  const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
  const queryClient = useQueryClient();

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

  const calendarEvents = React.useMemo(() => {
    return (dashboardData?.schoolEvents || []).map((event) => ({
      date: event.date ? new Date(event.date).toISOString().slice(0, 10) : undefined,
      endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 10) : undefined,
      title: event.title,
      content: event.content || "",
      color: event.color || "blue",
      createdBy: event.createdBy || "",
      createdRole: event.createdRole || "",
      target: "all",
    }));
  }, [dashboardData?.schoolEvents]);

  const calendarTargetOptions = React.useMemo(() => {
    const classes = dashboardData?.classes || [];
    const options = [
      { value: "all", label: "Tất cả lớp giảng dạy" },
      { value: "homeroom", label: "Lớp chủ nhiệm" },
    ];

    classes.forEach((item) => {
      const className = item.class_name || item.className || item.name;
      if (!className) return;
      options.push({
        value: String(item.id),
        label: `Lớp ${className}`,
      });
    });

    return options;
  }, [dashboardData?.classes]);

  const handleYearChange = (direction) => {
    handleYearArrow(direction);
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
          onTermChange={handleTermChange}
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
                currentUser={dashboardData?.teacherName || "Giáo viên"}
                eventTypes={CALENDAR_EVENT_TYPES}
                initialEvents={calendarEvents}
                selectedSchoolYear={selectedSchoolYear}
                selectedTerm={selectedTerm}
                targetOptions={calendarTargetOptions}
                rolePolicy={{
                  canCreate: true,
                  canViewDetails: true,
                  canEdit: true,
                  canDelete: true
                }}
                onAddEvent={(newEvent) => {
                  let mappedEventType = 'other';
                  if (newEvent.color === 'blue') mappedEventType = 'exam';
                  else if (newEvent.color === 'orange') mappedEventType = 'holiday';
                  else if (newEvent.color === 'teal') mappedEventType = 'meeting';
                  else if (newEvent.color === 'red') mappedEventType = 'ceremony';

                  teacherService.createSchoolEvent({
                    body: {
                      title: newEvent.title,
                      description: newEvent.content,
                      date: newEvent.date,
                      endDate: newEvent.endDate,
                      eventType: mappedEventType,
                      color: newEvent.color,
                      schoolYear: selectedSchoolYear,
                      term: selectedTerm,
                      affectedClasses: newEvent.target === 'all' ? [] : [String(newEvent.target)],
                    }
                  }).then(() => {
                    queryClient.invalidateQueries(["teacher-dashboard", selectedSchoolYear, selectedTerm]);
                    alert("Tạo sự kiện thành công!");
                  }).catch(err => {
                    console.error(err);
                    alert("Có lỗi xảy ra khi tạo sự kiện. Vui lòng kiểm tra console.");
                  });
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




