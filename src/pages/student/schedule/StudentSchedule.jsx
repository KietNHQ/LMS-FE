import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import StudentWeeklyScheduleSection from "./components/StudentWeeklyScheduleSection/StudentWeeklyScheduleSection";
import StudentScheduleFilterSection from "./components/StudentScheduleFilterSection/StudentScheduleFilterSection";
import StudentDailyScheduleSection from "./components/StudentDailyScheduleSection/StudentDailyScheduleSection";
import Modal from "../../../components/ui/Modal/Modal";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { STATUS_META } from "../../../utils/timetableShared";
import { studentService } from "../../../services/pages/student/studentService";
import "./StudentSchedule.css";

function getTodayDayIndex() {
  const day = new Date().getDay(); // 0=Sun
  return day === 0 ? 6 : day - 1;
}

export default function StudentSchedule() {
  const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
  const storedUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "{}");
  const localProfile = storedUser?.profile || null;
  const studentId = localProfile?.id || "STU_LOADING";
  const classNameValue = localProfile?.className || "—";

  // Use TanStack Query for timetable
  const { data: lessons = [], isLoading, error } = useQuery({
    queryKey: ["student-schedule", selectedSchoolYear, selectedTerm],
    queryFn: async () => {
      const hasAuth = !!(localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken"));
      const result = await studentService.getStudentScheduleMapped({
        mock: !hasAuth,
        params: { schoolYear: selectedSchoolYear, term: selectedTerm }
      });
      return result;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes cache
  });

  const [sessionView, setSessionView] = useState("morning");

  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isDailyModalOpen, setIsDailyModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(getTodayDayIndex());
  const [selectedSubject, setSelectedSubject] = useState("Tất cả");

  const uniqueSubjects = useMemo(() => {
    if (!Array.isArray(lessons)) return ["Tất cả"];
    const subs = lessons.map((l) => l.subject);
    return ["Tất cả", ...new Set(subs)];
  }, [lessons]);

  const handleSelectDay = (idx) => {
    setSelectedDay(idx);
    setIsDailyModalOpen(true);
  };

  return (
    <div className="student-schedule-page">
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

      <div className="student-schedule-main-card">
        <StudentScheduleFilterSection
          weekOffset={weekOffset}
          setWeekOffset={setWeekOffset}
          sessionView={sessionView}
          setSessionView={setSessionView}
          selectedSubject={selectedSubject}
          setSelectedSubject={setSelectedSubject}
          subjects={uniqueSubjects}
        />
        
        <StudentWeeklyScheduleSection
          weekOffset={weekOffset}
          studentId={studentId}
          onSelectDay={handleSelectDay}
          onLessonSelect={setSelectedLesson}
          lessons={lessons}
          isLoading={isLoading}
          error={error}
          sessionView={sessionView}
          setSessionView={setSessionView}
          selectedSubject={selectedSubject}
        />
      </div>

      {/* Modal for Daily Schedule */}
      <Modal
        open={isDailyModalOpen}
        onClose={() => setIsDailyModalOpen(false)}
        className="student-daily-modal"
      >
        <StudentDailyScheduleSection
          weekOffset={weekOffset}
          selectedDay={selectedDay}
          lessons={lessons}
          onLessonSelect={(lesson) => {
            setSelectedLesson(lesson);
          }}
        />
      </Modal>

      <Modal
        open={!!selectedLesson}
        title="Chi tiết tiết học"
        onClose={() => setSelectedLesson(null)}
        className="student-lesson-modal"
      >
        {selectedLesson && (
          <div className="student-lesson-modal-content">
            <div className="modal-header-info">
              <div>
                <h3>{selectedLesson.subject}</h3>
                <p className="modal-header-subtitle">
                  {selectedLesson.dayName || "Lịch học"} - {selectedLesson.dateLabel || "Chưa cập nhật ngày"}
                </p>
              </div>
              <div className="modal-header-badges">
                <span className={`modal-badge color-${selectedLesson.color}`}>
                  {selectedLesson.timeRange}
                </span>
                <span className={`modal-type-badge status-${selectedLesson.status}`}>
                  {STATUS_META[selectedLesson.status]?.label || "Bình thường"}
                </span>
              </div>
            </div>

            <div className="modal-info-grid">
              <div className="modal-info-card">
                <h4>Thông tin lớp</h4>
                <p><strong>Lớp:</strong> {classNameValue}</p>
                <p><strong>Phòng học:</strong> {selectedLesson.room}</p>
                <p><strong>Giáo viên:</strong> {selectedLesson.teacher}</p>
                <p><strong>Hình thức:</strong> {selectedLesson.mode === "online" ? "Trực tuyến" : "Trực tiếp"}</p>
              </div>

              <div className="modal-info-card">
                <h4>Thời gian</h4>
                <p><strong>Khung giờ:</strong> {selectedLesson.timeRange}</p>
                <p><strong>Tiết:</strong> {selectedLesson.periodStart} - {selectedLesson.periodEnd}</p>
                <p><strong>Buổi học:</strong> {selectedLesson.session}</p>
              </div>

              <div className="modal-info-card modal-info-card-wide">
                <h4>Ghi chú từ giáo viên</h4>
                <p>
                  {selectedLesson.note || "Không có ghi chú nào cho tiết học này."}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
