import "./ParentDashboard.css";
import { useState } from "react";

import ChildSwitcher from "./components/ChildSwitcher/ChildSwitcher";
import OverviewCards from "./components/OverviewCards/OverviewCards";
import PaymentSummary from "./components/PaymentSummary/PaymentSummary";
import EventCalendar from "../../../components/common/EventCalendar/EventCalendar";
import { INITIAL_CALENDAR_EVENTS, CALENDAR_EVENT_TYPES } from "../../../components/common/EventCalendar/eventData";
import UpcomingSchedule from "./components/UpcomingSchedule/UpcomingSchedule";
// import RecentNotifications from "./components/RecentNotifications/RecentNotifications";

// ✅ GIỮ NGUYÊN DATA FULL
const childrenData = [
  {
    id: 1,
    name: "Nguyễn Minh Tuấn",
    gradesBySemester: {
      hk1: [
        { subject: "Toán học", oral: 8, test15: 7, midterm: 8, final: 9, average: 8.2 },
        { subject: "Tiếng Anh", oral: 7, test15: 8, midterm: 7, final: 8, average: 7.5 },
        { subject: "Vật lý", oral: 9, test15: 8, midterm: 8, final: 9, average: 8.5 },
        { subject: "Văn học", oral: 7, test15: 6, midterm: 7, final: 7, average: 6.8 },
        { subject: "Hóa học", oral: 8, test15: 7, midterm: 8, final: 8, average: 7.8 },
        { subject: "Sinh học", oral: 9, test15: 8, midterm: 9, final: 9, average: 8.8 },
        { subject: "Lịch sử", oral: 7, test15: 7, midterm: 6, final: 7, average: 6.8 },
        { subject: "Tin học", oral: 10, test15: 9, midterm: 9, final: 10, average: 9.5 },
        { subject: "Địa lý", oral: 8, test15: 8, midterm: 7, final: 8, average: 7.8 },
        { subject: "GDCD", oral: 9, test15: 9, midterm: 9, final: 9, average: 9.0 },
        { subject: "Công nghệ", oral: 8, test15: 7, midterm: 8, final: 8, average: 7.8 },
        { subject: "Âm nhạc", oral: 9, test15: 9, midterm: 10, final: 9, average: 9.2 },
        { subject: "Mỹ thuật", oral: 8, test15: 8, midterm: 9, final: 8, average: 8.2 },
        { subject: "Thể dục", oral: 10, test15: 10, midterm: 10, final: 10, average: 10 },
        { subject: "GDQP-AN", oral: 9, test15: 9, midterm: 8, final: 9, average: 8.8 }
      ],
      hk2: [
        { subject: "Toán học", oral: 9, test15: 8, midterm: 9, final: 9, average: 8.8 },
        { subject: "Tiếng Anh", oral: 8, test15: 8, midterm: 8, final: 9, average: 1.2 },
        { subject: "Vật lý", oral: 8, test15: 9, midterm: 8, final: 9, average: 1.5 },
        { subject: "Văn học", oral: 7, test15: 7, midterm: 7, final: 8, average: 1.2 },
        { subject: "Hóa học", oral: 8, test15: 8, midterm: 8, final: 9, average: 1.2 },
        { subject: "Sinh học", oral: 9, test15: 9, midterm: 9, final: 1, average: 9.3 },
        { subject: "Lịch sử", oral: 1, test15: 7, midterm: 7, final: 7, average: 7 },
        { subject: "Tin học", oral: 1, test15: 10, midterm: 9, final: 10, average: 9.7 },
        { subject: "Địa lý", oral: 8, test15: 8, midterm: 8, final: 8, average: 8.0 },
        { subject: "GDCD", oral: 9, test15: 9, midterm: 9, final: 9, average: 9.0 },
        { subject: "Công nghệ", oral: 8, test15: 8, midterm: 8, final: 9, average: 8.5 },
        { subject: "Âm nhạc", oral: 9, test15: 9, midterm: 9, final: 9, average: 9.0 },
        { subject: "Mỹ thuật", oral: 8, test15: 8, midterm: 8, final: 8, average: 8.0 },
        { subject: "Thể dục", oral: 10, test15: 10, midterm: 10, final: 10, average: 10 },
        { subject: "GDQP-AN", oral: 9, test15: 9, midterm: 9, final: 9, average: 9.0 }
      ],
      year: [
        { subject:"Toán học", oral:1.5, test15:8.5, midterm:8.5, final:1.5, average:1.5 },
        { subject:"Tiếng Anh", oral:1.9, test15:1.9, midterm:1.9, final:7.9, average:1.9 },
        { subject:"Vật lý", oral:1.5, test15:1.5, midterm:1.5, final:8.5, average:1.5 },
        { subject:"Văn học", oral:1, test15:1, midterm:1, final:7, average:1 },
        { subject:"Hóa học", oral:1, test15:2, midterm:1, final:8, average:1 },
        { subject:"Sinh học", oral:1, test15:1, midterm:1, final:9, average:9 },
        { subject:"Lịch sử", oral:1.9, test15:1.9, midterm:1.9, final:6.9, average:6.9 },
        { subject:"Tin học", oral:1.6, test15:1.6, midterm:9.6, final:9.6, average:9.6 },
        { subject:"Địa lý", oral:8.0, test15:8.0, midterm:8.0, final:8.0, average:8.0 },
        { subject:"GDCD", oral:9.0, test15:9.0, midterm:9.0, final:9.0, average:9.0 },
        { subject:"Công nghệ", oral:8.2, test15:8.2, midterm:8.2, final:8.2, average:8.2 },
        { subject:"Âm nhạc", oral:9.1, test15:9.1, midterm:9.1, final:9.1, average:9.1 },
        { subject:"Mỹ thuật", oral:8.1, test15:8.1, midterm:8.1, final:8.1, average:8.1 },
        { subject:"Thể dục", oral:10, test15:10, midterm:10, final:10, average:10 },
        { subject:"GDQP-AN", oral:8.9, test15:8.9, midterm:8.9, final:8.9, average:8.9 }
      ]
    }
  },

  // ✅ ĐỨA THỨ 2 (copy + sửa số liệu nhẹ)
  {
    id: 2,
    name: "Trần Thị Bảo Châu",
    gradesBySemester: {
      hk1: [
        { subject: "Toán học", oral: 9, test15: 9, midterm: 9, final: 10, average: 9.3 },
        { subject: "Tiếng Anh", oral: 8, test15: 9, midterm: 8, final: 9, average: 8.5 },
        { subject: "Vật lý", oral: 8, test15: 9, midterm: 9, final: 9, average: 8.8 },
        { subject: "Văn học", oral: 7, test15: 7, midterm: 8, final: 8, average: 7.5 },
        { subject: "Hóa học", oral: 9, test15: 8, midterm: 9, final: 9, average: 8.8 },
        { subject: "Sinh học", oral: 9, test15: 9, midterm: 10, final: 10, average: 9.5 },
        { subject: "Lịch sử", oral: 7, test15: 8, midterm: 7, final: 8, average: 7.5 },
        { subject: "Tin học", oral: 10, test15: 10, midterm: 10, final: 10, average: 10 },
        { subject: "Địa lý", oral: 9, test15: 9, midterm: 9, final: 9, average: 9.0 },
        { subject: "GDCD", oral: 10, test15: 10, midterm: 10, final: 10, average: 10 },
        { subject: "Công nghệ", oral: 9, test15: 9, midterm: 9, final: 9, average: 9.0 },
        { subject: "Âm nhạc", oral: 10, test15: 10, midterm: 10, final: 10, average: 10 }
      ],
      hk2: [
        { subject: "Toán học", oral: 9, test15: 9, midterm: 9, final: 10, average: 9.3 },
        { subject: "Tiếng Anh", oral: 9, test15: 9, midterm: 9, final: 9, average: 9 },
        { subject: "Vật lý", oral: 9, test15: 9, midterm: 9, final: 9, average: 9 },
        { subject: "Văn học", oral: 8, test15: 8, midterm: 8, final: 8, average: 8 },
        { subject: "Hóa học", oral: 9, test15: 9, midterm: 9, final: 9, average: 9 },
        { subject: "Sinh học", oral: 10, test15: 10, midterm: 10, final: 10, average: 10 },
        { subject: "Lịch sử", oral: 8, test15: 8, midterm: 8, final: 8, average: 8 },
        { subject: "Tin học", oral: 10, test15: 10, midterm: 10, final: 10, average: 10 },
        { subject: "Địa lý", oral: 9, test15: 9, midterm: 9, final: 9, average: 9 },
        { subject: "GDCD", oral: 10, test15: 10, midterm: 10, final: 10, average: 10 },
        { subject: "Công nghệ", oral: 9, test15: 9, midterm: 9, final: 9, average: 9 },
        { subject: "Âm nhạc", oral: 10, test15: 10, midterm: 10, final: 10, average: 10 }
      ],
      year: [
        { subject:"Toán học", oral:9.3, test15:9.3, midterm:9.3, final:9.3, average:9.3 },
        { subject:"Tiếng Anh", oral:8.7, test15:8.7, midterm:8.7, final:8.7, average:8.7 },
        { subject:"Vật lý", oral:8.9, test15:8.9, midterm:8.9, final:8.9, average:8.9 },
        { subject:"Văn học", oral:7.8, test15:7.8, midterm:7.8, final:7.8, average:7.8 },
        { subject:"Hóa học", oral:8.9, test15:8.9, midterm:8.9, final:8.9, average:8.9 },
        { subject:"Sinh học", oral:9.7, test15:9.7, midterm:9.7, final:9.7, average:9.7 },
        { subject:"Lịch sử", oral:7.7, test15:7.7, midterm:7.7, final:7.7, average:7.7 },
        { subject:"Tin học", oral:10, test15:10, midterm:10, final:10, average:10 },
        { subject:"Địa lý", oral:9.0, test15:9.0, midterm:9.0, final:9.0, average:9.0 },
        { subject:"GDCD", oral:10, test15:10, midterm:10, final:10, average:10 },
        { subject:"Công nghệ", oral:9.0, test15:9.0, midterm:9.0, final:9.0, average:9.0 },
        { subject:"Âm nhạc", oral:10, test15:10, midterm:10, final:10, average:10 }
      ]
    }
  }
];

export default function ParentDashboard() {
  const [selectedChildId, setSelectedChildId] = useState(childrenData[0].id);

  const selectedChild = childrenData.find(c => c.id === selectedChildId);

  // 🔥 CALCULATE
  const calculateAverage = (subjects) => {
    if (!subjects) return 0;
    const total = subjects.reduce((sum, s) => sum + s.average, 0);
    return (total / subjects.length).toFixed(2);
  };

  const hk1Avg = calculateAverage(selectedChild.gradesBySemester.hk1);
  const hk2Avg = calculateAverage(selectedChild.gradesBySemester.hk2);
  const yearAvg = calculateAverage(selectedChild.gradesBySemester.year);



  return (
    <div className="dashboard">
      <h1>Xin chào, Nguyễn Văn Phụ Huynh</h1>
      <ChildSwitcher
        childrenList={childrenData}
        selectedChildId={selectedChildId}
        onSelect={setSelectedChildId}
      />

      

      <PaymentSummary yearAvg={yearAvg} />

      <OverviewCards yearAvg={yearAvg} hk1Avg={hk1Avg} />

      <div className="parent-dashboard-grid-top">
        <div className="parent-dashboard-calendar-card">
          <EventCalendar 
            title="Lịch Sự Kiện Hệ Thống"
            themeClass="theme-parent"
            userRole="parent"
            isCompact={true}
            eventTypes={CALENDAR_EVENT_TYPES}
            initialEvents={INITIAL_CALENDAR_EVENTS}
            selectedSchoolYear="2025-2026"
            selectedTerm={1}
            rolePolicy={{
              canCreate: false,
              canViewDetails: true,
              canEdit: false,
              canDelete: false
            }}
          />
        </div>

        <UpcomingSchedule gradesBySemester={selectedChild.gradesBySemester} />
      </div>

      {/* <RecentNotifications /> */}
    </div>
  );
}