import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import teacherService from "../../../services/pages/teacher/teacherService";
import WeeklyScheduleSection from "./components/weeklyScheduleSection/WeeklyScheduleSection";
import DailyScheduleSection from "./components/dailyScheduleSection/DailyScheduleSection";
import ScheduleFilterSection from "./components/scheduleFilterSection/ScheduleFilterSection";
import Modal from "../../../components/ui/Modal/Modal";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import "./TeacherSchedule.css";

const PERIOD_TIME = {
  1: "07:00 - 07:45",
  2: "07:50 - 08:35",
  3: "08:45 - 09:30",
  4: "09:35 - 10:20",
  5: "10:30 - 11:15",
  6: "13:00 - 13:45",
  7: "13:50 - 14:35",
  8: "14:45 - 15:30",
  9: "15:35 - 16:20",
  10: "16:25 - 17:10",
};

function getLessonType(note = "") {
  const lower = note.toLowerCase();
  if (lower.includes("kiểm tra")) return "Kiểm tra";
  if (lower.includes("ôn tập")) return "Ôn tập";
  if (lower.includes("bài tập")) return "Luyện tập";
  return "Bài mới";
}

function getTeachingGoal(note = "") {
  if (note.toLowerCase().includes("kiểm tra")) return "Đánh giá mức độ nắm bài của học sinh.";
  if (note.toLowerCase().includes("ôn tập")) return "Củng cố kiến thức trọng tâm và kỹ năng giải bài.";
  if (note.toLowerCase().includes("bài tập")) return "Rèn luyện vận dụng qua bài tập theo mức độ.";
  return "Giới thiệu kiến thức mới và luyện tập cơ bản.";
}

function getReminderByType(type) {
  if (type === "Kiểm tra") return ["Chuẩn bị đề kiểm tra", "Nhắc học sinh mang đầy đủ dụng cụ", "Ổn định lớp trước khi phát đề"];
  if (type === "Ôn tập") return ["Tổng hợp công thức trọng tâm", "Gọi 1-2 học sinh trình bày", "Chốt lỗi sai thường gặp"];
  if (type === "Luyện tập") return ["Phân nhóm bài dễ - khó", "Quan sát tiến độ theo nhóm", "Chữa nhanh bài đại diện"];
  return ["Nêu mục tiêu bài học đầu tiết", "Minh họa ví dụ trọng tâm", "Kiểm tra nhanh cuối tiết"];
}

function getTodayDayIndex() {
  const day = new Date().getDay(); // 0=Sun
  // Mon=0 ... Sat=5, Sun=6
  return day === 0 ? 6 : day - 1;
}

export default function TeacherSchedule() {
  const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
  const storedUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "{}");
  const teacherId = storedUser.profile?.id || storedUser.id;

  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedGrade, setSelectedGrade] = useState("Tất cả");
  const [selectedClass, setSelectedClass] = useState("Tất cả");
  const [selectedDay, setSelectedDay] = useState(getTodayDayIndex());
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isDailyModalOpen, setIsDailyModalOpen] = useState(false);
  const [sessionView, setSessionView] = useState("morning");

  // Use TanStack Query for timetable
  const { data: timetableData = [], isLoading } = useQuery({
    queryKey: ["teacher-schedule", teacherId, selectedSchoolYear, selectedTerm],
    queryFn: async () => {
      try {
        const response = await teacherService.getTimetable({ 
          mock: false,
          params: { schoolYear: selectedSchoolYear, term: selectedTerm }
        });
        // The axios interceptor returns response.data directly
        if (response?.success && response?.data?.lessons !== undefined) {
          return response.data.lessons;
        }
        if (Array.isArray(response)) return response;
        return null; // signal "no data yet" so React Query doesn't cache []
      } catch (apiErr) {
        console.warn("API getTimetable failed:", apiErr);
      }
      return null;
    },
    staleTime: 0, // always refetch on mount to avoid 304 caching issues
  });

  const safeTimetableData = useMemo(() => {
    if (Array.isArray(timetableData)) return timetableData;
    return [];
  }, [timetableData]);
  
  const handleSelectDay = (idx) => {
    setSelectedDay(idx);
    setIsDailyModalOpen(true);
  };

  const lessonType = selectedLesson ? selectedLesson.lessonType || getLessonType(selectedLesson.note) : "";
  const timeRange = selectedLesson
    ? selectedLesson.timeRange || PERIOD_TIME[selectedLesson.period] || "Chưa cập nhật"
    : "";
  const reminderList = selectedLesson ? getReminderByType(lessonType) : [];

  // Fetch teacher classes from API for filter dropdown
  const { data: teacherClassesData = [] } = useQuery({
    queryKey: ["teacher-classes", teacherId],
    queryFn: async () => {
      try {
        const res = await teacherService.getTeacherClasses({ mock: false, pathParams: { id: teacherId } });
        return res?.data || res || [];
      } catch {
        return [];
      }
    },
    staleTime: 10 * 60 * 1000,
    enabled: !!teacherId,
  });

  const uniqueClasses = useMemo(() => {
    // Use teacher's assigned classes from API (teacherClassesData has flat class_name field)
    if (teacherClassesData && teacherClassesData.length > 0) {
      const seen = new Set();
      const classes = [];
      for (const c of teacherClassesData) {
        const name = c.class_name || c.name;
        if (name && !seen.has(name)) {
          seen.add(name);
          classes.push(name);
        }
      }
      return classes.sort();
    }
    // Fallback: extract from timetable data
    if (safeTimetableData && safeTimetableData.length > 0) {
      const seen = new Set();
      for (const item of safeTimetableData) {
        const name = item.class_name || item.className;
        if (name) seen.add(name);
      }
      return [...seen].sort();
    }
    return [];
  }, [teacherClassesData, safeTimetableData]);

  return (
    <div className="teacher-schedule-page">
      <PageHeader
        title="Thời khóa biểu"
        actions={
          <SchoolYearTermSelector
            selectedSchoolYear={selectedSchoolYear}
            selectedTerm={selectedTerm}
            onYearChange={handleYearArrow}
            onTermChange={handleTermChange}
          />
        }
      />

      <div className="teacher-schedule-main-card">
        <ScheduleFilterSection
          weekOffset={weekOffset}
          setWeekOffset={setWeekOffset}
          selectedGrade={selectedGrade}
          setSelectedGrade={setSelectedGrade}
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
          sessionView={sessionView}
          setSessionView={setSessionView}
          availableClasses={uniqueClasses}
        />

        <div className="teacher-schedule-content">
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
              Đang tải lịch giảng dạy...
            </div>
          ) : safeTimetableData.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
              <p style={{ marginBottom: "0.5rem", fontWeight: 500 }}>Chưa có lịch giảng dạy cho học kỳ này.</p>
              <p style={{ fontSize: "0.9rem" }}>Vui lòng liên hệ phòng bộ môn để được phân công.</p>
            </div>
          ) : (
            <WeeklyScheduleSection
              weekOffset={weekOffset}
              selectedClass={selectedClass}
              onSelectDay={handleSelectDay}
              onLessonSelect={setSelectedLesson}
              sessionView={sessionView}
              setSessionView={setSessionView}
              apiData={safeTimetableData}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>

      {/* Modal for Daily Schedule */}
      <Modal
        open={isDailyModalOpen}
        onClose={() => setIsDailyModalOpen(false)}
        className="teacher-daily-modal"
      >
        <DailyScheduleSection
          weekOffset={weekOffset}
          selectedDay={selectedDay}
          selectedClass={selectedClass}
          onLessonSelect={setSelectedLesson}
          apiData={safeTimetableData}
        />
      </Modal>

      <Modal
        open={!!selectedLesson}
        title="Chi tiết tiết học"
        onClose={() => setSelectedLesson(null)}
        className="teacher-lesson-modal"
      >
        {selectedLesson && (
          <div className="teacher-lesson-modal-content">
            <div className="modal-header-info">
              <div>
                <h3>{selectedLesson.subject}</h3>
                <p className="modal-header-subtitle">
                  {selectedLesson.dayName || "Lịch học"} - {selectedLesson.dateLabel || "Chưa cập nhật ngày"}
                </p>
              </div>
              <div className="modal-header-badges">
                <span className={`modal-badge color-${selectedLesson.color}`}>Tiết {selectedLesson.period}</span>
                <span className="modal-type-badge">{lessonType}</span>
              </div>
            </div>

            <div className="modal-info-grid">
              <div className="modal-info-card">
                <h4>Tổng quan</h4>
                <p><strong>Lớp:</strong> {selectedLesson.class}</p>
                <p><strong>Phòng học:</strong> {selectedLesson.room}</p>
                <p><strong>Sĩ số:</strong> {selectedLesson.students || 0} học sinh</p>
                <p><strong>Buổi học:</strong> {selectedLesson.session || (selectedLesson.period <= 5 ? "Sáng" : "Chiều")}</p>
              </div>

              <div className="modal-info-card">
                <h4>Thời gian</h4>
                <p><strong>Khung giờ:</strong> {timeRange}</p>
                <p><strong>Tiết:</strong> {selectedLesson.period}</p>
                <p><strong>Loại tiết:</strong> {lessonType}</p>
              </div>

              <div className="modal-info-card modal-info-card-wide">
                <h4>Nội dung giảng dạy</h4>
                <p><strong>Nội dung chính:</strong> {selectedLesson.note || "Chưa cập nhật nội dung."}</p>
                <p><strong>Mục tiêu:</strong> {getTeachingGoal(selectedLesson.note)}</p>
              </div>

              <div className="modal-info-card modal-info-card-wide">
                <h4>Nhắc nhớ cho tiết này</h4>
                <ul className="modal-reminder-list">
                  {reminderList.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}




