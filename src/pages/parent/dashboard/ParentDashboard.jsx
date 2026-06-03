import "./ParentDashboard.css";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { PageHeader, SchoolYearTermSelector, LoadingSpinner } from "../../../components/common";
import ChildSwitcher from "./components/ChildSwitcher/ChildSwitcher";
import OverviewCards from "./components/OverviewCards/OverviewCards";
import PaymentSummary from "./components/PaymentSummary/PaymentSummary";
import EventCalendar from "../../../components/common/EventCalendar/EventCalendar";
import { CALENDAR_EVENT_TYPES } from "../../../components/common/EventCalendar/eventData";
import UpcomingSchedule from "./components/UpcomingSchedule/UpcomingSchedule";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { parentService } from "../../../services/pages/parent/parentService";

const defaultChildrenData = [];

export default function ParentDashboard() {
  const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
  const [selectedChildId, setSelectedChildId] = useState(null);

  // 1. Lấy danh sách con cái
  const { data: childrenResponse, isLoading: isLoadingChildren } = useQuery({
    queryKey: ["parent-children"],
    queryFn: () => parentService.listChildren({ mock: false }),
    staleTime: 5 * 60 * 1000,
  });

  const childrenList = useMemo(() => {
    // API trả về: { success: true, data: [...children] }
    // Mapper đã chạy nên response.data = mapped array
    const data = childrenResponse?.data || [];
    console.log("[DEBUG] childrenList:", data);
    return Array.isArray(data) ? data : [];
  }, [childrenResponse]);

  // Tự động chọn đứa con đầu tiên nếu chưa chọn
  useEffect(() => {
    if (childrenList.length > 0 && !selectedChildId) {
      setSelectedChildId(childrenList[0].id || childrenList[0].studentId);
    }
  }, [childrenList, selectedChildId]);

  // 2. Lấy điểm của đứa con đang chọn
  const { data: gradesResponse, isLoading: isLoadingGrades } = useQuery({
    queryKey: ["child-grades", selectedChildId],
    queryFn: () => parentService.getChildGrades({
      pathParams: { childId: selectedChildId },
      mock: false
    }),
    enabled: !!selectedChildId,
    staleTime: 5 * 60 * 1000,
  });

  console.log("[DEBUG] gradesResponse:", gradesResponse);

  // 3. Lấy thông báo để đếm số chưa đọc
  const { data: notificationsResponse } = useQuery({
    queryKey: ["parent-notifications"],
    queryFn: () => parentService.listNotifications({ mock: false }),
    staleTime: 2 * 60 * 1000,
  });

  // 4. Lấy sự kiện hệ thống cho lịch
  const { data: systemEventsResponse } = useQuery({
    queryKey: ["system-events", selectedSchoolYear, selectedTerm],
    queryFn: () => parentService.getSystemEvents({
      params: {
        schoolYearId: selectedSchoolYear,
        semesterId: selectedTerm,
      },
      mock: false
    }),
    enabled: !!selectedSchoolYear,
    staleTime: 10 * 60 * 1000,
  });

  const calendarEvents = useMemo(() => {
    if (!systemEventsResponse?.success || !systemEventsResponse?.data) return [];
    return systemEventsResponse.data.map(event => ({
      id: event.id,
      title: event.title,
      date: event.date,
      type: event.eventType || event.type || "other",
    }));
  }, [systemEventsResponse]);

  // 5. Lấy tổng hợp thanh toán để hiển thị học phí chưa đóng
  const { data: paymentsResponse } = useQuery({
    queryKey: ["parent-payments-summary"],
    queryFn: () => parentService.listPayments({ params: { limit: 100 }, mock: false }),
    staleTime: 5 * 60 * 1000,
  });

  const unpaidAmount = useMemo(() => {
    if (!paymentsResponse?.success || !paymentsResponse?.data?.summary) return 0;
    return paymentsResponse.data.summary.unpaid || 0;
  }, [paymentsResponse]);

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return "0đ";
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  const unreadCount = useMemo(() => {
    if (!notificationsResponse?.success || !notificationsResponse?.data) return 0;
    return notificationsResponse.data.filter(n => n.unread).length;
  }, [notificationsResponse]);

  const selectedChild = useMemo(() => {
    const child = childrenList.find(c => (c.id || c.studentId) === selectedChildId) || childrenList[0];
    if (child && gradesResponse?.success) {
      return { ...gradesResponse.data, ...child, gradesBySemester: gradesResponse.data };
    }
    return child;
  }, [childrenList, selectedChildId, gradesResponse]);

  const isLoading = isLoadingChildren || (!!selectedChildId && isLoadingGrades);

  const calculateAverage = (subjects) => {
    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) return 0;
    const valid = subjects.filter(s => s.score != null && !isNaN(s.score));
    if (valid.length === 0) return 0;
    const total = valid.reduce((sum, s) => sum + Number(s.score), 0);
    return (total / valid.length).toFixed(2);
  };

  const hk1Avg = selectedChild?.gradesBySemester?.hk1 ? calculateAverage(selectedChild.gradesBySemester.hk1) : 0;
  const yearAvg = selectedChild?.gradesBySemester?.year ? calculateAverage(selectedChild.gradesBySemester.year) : 0;

  return (
    <div className="dashboard">
      <PageHeader
        title="Trang chủ Phụ huynh"
      />
      
      <ChildSwitcher
        childrenList={childrenList.length > 0 ? childrenList : defaultChildrenData}
        selectedChildId={selectedChildId}
        onSelect={setSelectedChildId}
        extraControl={
          <SchoolYearTermSelector
            selectedSchoolYear={selectedSchoolYear}
            selectedTerm={selectedTerm}
            onYearChange={handleYearArrow}
            onTermChange={handleTermChange}
          />
        }
      />

      {isLoading ? (
        <div className="layout-loading-wrapper">
          <LoadingSpinner size="lg" label="Đang cập nhật kết quả con em..." role="parent" />
        </div>
      ) : (
        <>
          <PaymentSummary selectedChild={selectedChild} yearAvg={yearAvg} />
          <OverviewCards yearAvg={yearAvg} hk1Avg={hk1Avg} unreadCount={unreadCount} unpaidAmount={formatCurrency(unpaidAmount)} />
          <div className="parent-dashboard-grid-top">
            <div className="parent-dashboard-calendar-card">
              <EventCalendar
                title="Lịch Sự Kiện Hệ Thống"
                themeClass="theme-parent"
                userRole="parent"
                isCompact={true}
                eventTypes={CALENDAR_EVENT_TYPES}
                initialEvents={calendarEvents}
                selectedSchoolYear={selectedSchoolYear}
                selectedTerm={selectedTerm}
                rolePolicy={{
                  canCreate: false,
                  canViewDetails: true,
                  canEdit: false,
                  canDelete: false
                }}
              />
            </div>
            <UpcomingSchedule gradesBySemester={selectedChild?.gradesBySemester || { hk1: [], hk2: [], year: [] }} />
          </div>
        </>
      )}
    </div>
  );
}
