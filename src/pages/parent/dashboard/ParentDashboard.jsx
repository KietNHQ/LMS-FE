import "./ParentDashboard.css";
import { useState, useMemo } from "react";
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
import { resolveSchoolYearId, resolveSemesterId } from "../../../services/shared/schoolYearLookup";
import { getRows, transformParentGradesData } from "../shared/parentGradeUtils";

const defaultChildrenData = [];

const buildFullName = (child = {}) =>
  child.name ||
  child.fullName ||
  [child.surname, child.given_name || child.givenName].filter(Boolean).join(" ").trim() ||
  "Chưa có thông tin";

const normalizeChild = (child = {}, selectedSchoolYear) => {
  const name = buildFullName(child);
  return {
    ...child,
    id: child.id ?? child.student_id ?? child.studentId,
    studentId: child.studentId || child.student_id || child.id,
    studentCode: child.studentCode || child.student_code || child.code || child.id,
    name,
    classId: child.classId || child.class_id || child.currentClassId || child.current_class_id || null,
    className: child.className || child.class_name || "Chưa xếp lớp",
    homeroomTeacher: child.homeroomTeacher || child.teacherName || child.teacher_name || "Chưa phân công",
    schoolYear: child.schoolYear || child.school_year_name || selectedSchoolYear,
  };
};

const EVENT_TYPE_TO_COLOR = {
  holiday: "red",
  exam: "blue",
  test: "blue",
  examination: "blue",
  school_event: "teal",
  "school-event": "teal",
  class_event: "teal",
  "class-event": "teal",
  day_off: "orange",
  dayoff: "orange",
  no_school: "orange",
};

const normalizeEventColor = (eventType) => {
  const normalized = `${eventType || ""}`.trim().toLowerCase();
  return EVENT_TYPE_TO_COLOR[normalized] || "teal";
};

const normalizeCalendarColor = (event = {}) => {
  const rawColor = `${event.color || ""}`.trim().toLowerCase();
  const allowedColors = ["blue", "red", "orange", "teal", "purple", "emerald"];

  if (allowedColors.includes(rawColor)) {
    return rawColor;
  }

  return normalizeEventColor(event.eventType || event.event_type || event.type);
};

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
    return Array.isArray(data) ? data.map((child) => normalizeChild(child, selectedSchoolYear)) : [];
  }, [childrenResponse, selectedSchoolYear]);

  const effectiveSelectedChildId = useMemo(
    () => selectedChildId || childrenList[0]?.id || childrenList[0]?.studentId || null,
    [childrenList, selectedChildId]
  );

  // 2. Lấy điểm của đứa con đang chọn
  const { data: gradesResponse, isLoading: isLoadingGrades } = useQuery({
    queryKey: ["child-grades", effectiveSelectedChildId, selectedSchoolYear, selectedTerm],
    queryFn: async () => {
      const schoolYearId = await resolveSchoolYearId(selectedSchoolYear);

      return parentService.getChildGrades({
        pathParams: { childId: effectiveSelectedChildId },
        params: {
          ...(schoolYearId ? { school_year_id: schoolYearId } : {}),
        },
        mock: false
      });
    },
    enabled: !!effectiveSelectedChildId,
    staleTime: 5 * 60 * 1000,
  });

  // 3. Lấy thông báo để đếm số chưa đọc
  const { data: notificationsResponse } = useQuery({
    queryKey: ["parent-notifications"],
    queryFn: () => parentService.listNotifications({ mock: false }),
    staleTime: 2 * 60 * 1000,
  });

  // 4. Lấy sự kiện hệ thống cho lịch
  const { data: systemEventsResponse } = useQuery({
    queryKey: ["system-events", selectedSchoolYear, selectedTerm],
    queryFn: async () => {
      const [schoolYearId, semesterId] = await Promise.all([
        resolveSchoolYearId(selectedSchoolYear),
        resolveSemesterId(selectedSchoolYear, selectedTerm),
      ]);

      return parentService.getSystemEvents({
        params: {
          // Semester IDs are globally unique; using semester only also supports
          // legacy events whose school_year_id is empty but semester_id is set.
          ...(semesterId ? { semesterId } : {}),
          ...(!semesterId && schoolYearId ? { schoolYearId } : {}),
        },
        mock: false
      });
    },
    enabled: !!selectedSchoolYear,
    staleTime: 10 * 60 * 1000,
  });

  const calendarEvents = useMemo(() => {
    if (!systemEventsResponse?.success || !systemEventsResponse?.data) return [];
    return systemEventsResponse.data.map(event => ({
      id: event.id,
      title: event.title,
      date: event.date,
      endDate: event.endDate,
      type: normalizeEventColor(event.eventType || event.event_type || event.type),
      color: normalizeCalendarColor(event),
      content: event.description || event.content || "",
      createdBy: event.createdBy || event.created_by || "",
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
    const child = childrenList.find(c => String(c.id || c.studentId) === String(effectiveSelectedChildId)) || childrenList[0];
    if (child && gradesResponse?.success) {
      const groupedGrades = transformParentGradesData(getRows(gradesResponse));
      return { ...child, gradesBySemester: groupedGrades };
    }
    return child;
  }, [childrenList, effectiveSelectedChildId, gradesResponse]);

  const isLoading = isLoadingChildren || (!!effectiveSelectedChildId && isLoadingGrades);

  const calculateAverage = (subjects) => {
    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) return 0;
    const valid = subjects.filter(s => s.average != null && !isNaN(s.average));
    if (valid.length === 0) return 0;
    const total = valid.reduce((sum, s) => sum + Number(s.average), 0);
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
        selectedChildId={effectiveSelectedChildId}
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
