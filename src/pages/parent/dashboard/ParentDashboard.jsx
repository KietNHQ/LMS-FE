import "./ParentDashboard.css";
import { useState, useEffect } from "react";

import { PageHeader, SchoolYearTermSelector, LoadingSpinner } from "../../../components/common";
import ChildSwitcher from "./components/ChildSwitcher/ChildSwitcher";
import OverviewCards from "./components/OverviewCards/OverviewCards";
import PaymentSummary from "./components/PaymentSummary/PaymentSummary";
import EventCalendar from "../../../components/common/EventCalendar/EventCalendar";
import { INITIAL_CALENDAR_EVENTS, CALENDAR_EVENT_TYPES } from "../../../components/common/EventCalendar/eventData";
import UpcomingSchedule from "./components/UpcomingSchedule/UpcomingSchedule";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { parentService } from "../../../services/pages/parent/parentService";

const defaultChildrenData = [];

export default function ParentDashboard() {
  const [childrenList, setChildrenList] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch children data from API on component mount
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // [TỐI ƯU] Lấy dữ liệu từ localStorage trước để hiển thị ngay lập tức
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const localChildren = storedUser?.profile?.linkedStudents || 
                             storedUser?.linkedStudentIds || [];
        
        if (localChildren.length > 0) {
            // Chuyển đổi format và lọc bỏ dữ liệu mẫu cũ
            const formattedLocal = localChildren
                .filter(c => c.id !== "child1" && c.name !== "Nguyễn Minh Tuấn")
                .map(c => ({
                    ...c,
                    id: c.id || c.studentId,
                    name: c.name || `${c.surname || ""} ${c.given_name || ""}`.trim()
                }));
            
            if (formattedLocal.length > 0) {
                setChildrenList(formattedLocal);
                if (!selectedChildId) setSelectedChildId(formattedLocal[0].id);
            }
        }

        const response = await parentService.listChildren({ mock: false });
        console.log("📋 Parent Children API Response:", response);

        const children = response.data || response.parent_children || response || [];
        const childrenArray = (Array.isArray(children) ? children : [])
            .filter(c => (c.id || c.studentId) !== "child1" && c.name !== "Nguyễn Minh Tuấn");

        if (childrenArray.length > 0) {
            setChildrenList(childrenArray);
            if (!selectedChildId) {
                setSelectedChildId(childrenArray[0].id || childrenArray[0].studentId);
            }
        }
      } catch (err) {
        // [CẢI TIẾN] Nếu là lỗi 404 (do BE chưa có API) nhưng đã có dữ liệu local thì không báo lỗi đỏ
        if (err.response?.status === 404 || err.message?.includes("404")) {
            console.info("ℹ️ Parent API 404 - Using local profile data as fallback.");
        } else {
            console.error("❌ Error fetching parent children:", err);
            // Chỉ hiện lỗi lên UI nếu thực sự không có tí dữ liệu nào (kể cả local)
            if (childrenList.length === 0) {
                setError(err.message);
                setChildrenList(defaultChildrenData);
                if (defaultChildrenData.length > 0) {
                    setSelectedChildId(defaultChildrenData[0].id);
                }
            }
        }
      } finally {
        setIsLoading(false);
      }
    };


    fetchChildren();
  }, []);

  // Fetch grades for the selected child whenever selectedChildId changes
  useEffect(() => {
    if (!selectedChildId) return;

    const fetchGrades = async () => {
      try {
        const response = await parentService.getChildGrades({
          pathParams: { childId: selectedChildId },
          mock: false
        });

        if (response.success && response.data) {
          setChildrenList(prev => prev.map(child => {
            if ((child.id || child.studentId) === selectedChildId) {
              return { ...child, gradesBySemester: response.data };
            }
            return child;
          }));
        }
      } catch (err) {
        console.error("❌ Error fetching child grades:", err);
      }
    };

    fetchGrades();
  }, [selectedChildId]);

  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications to get unread count
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await parentService.listNotifications({ mock: false });
        if (response.success && response.data) {
          const count = response.data.filter(n => n.unread).length;
          setUnreadCount(count);
        }
      } catch (err) {
        console.error("❌ Error fetching notifications for count:", err);
      }
    };
    fetchNotifications();
  }, []);

  const selectedChild = (childrenList.length > 0 ? childrenList : defaultChildrenData).find(
    c => (c.id || c.studentId) === selectedChildId
  ) || (childrenList.length > 0 ? childrenList : defaultChildrenData)[0];

  const calculateAverage = (subjects) => {
    if (!subjects || !Array.isArray(subjects)) return 0;
    const total = subjects.reduce((sum, s) => sum + (s.average || 0), 0);
    return (total / subjects.length).toFixed(2);
  };

  const hk1Avg = selectedChild?.gradesBySemester?.hk1 ? calculateAverage(selectedChild.gradesBySemester.hk1) : 0;
  const yearAvg = selectedChild?.gradesBySemester?.year ? calculateAverage(selectedChild.gradesBySemester.year) : 0;

  return (
    <div className="dashboard">
      <PageHeader
        title="Trang chủ - Dữ liệu thực"
      />
      {error && (
        <div style={{
          padding: "1rem",
          marginBottom: "1rem",
          backgroundColor: "#fef2f2",
          borderLeft: "4px solid #dc2626",
          borderRadius: "0.5rem"
        }}>
          <strong style={{ color: "#dc2626" }}>⚠️ Lỗi:</strong> {error}
        </div>
      )}
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
          <OverviewCards yearAvg={yearAvg} hk1Avg={hk1Avg} unreadCount={unreadCount} />
          <div className="parent-dashboard-grid-top">
            <div className="parent-dashboard-calendar-card">
              <EventCalendar
                title="Lịch Sự Kiện Hệ Thống"
                themeClass="theme-parent"
                userRole="parent"
                isCompact={true}
                eventTypes={CALENDAR_EVENT_TYPES}
                initialEvents={[]}
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
