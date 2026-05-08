import React, { useState, useEffect, useMemo } from "react";
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
  const [localProfile, setLocalProfile] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const hasAuth = !!localStorage.getItem("accessToken");
        const response = await studentService.getStudentSchedule({ mock: !hasAuth });

        if (response.success && Array.isArray(response.data)) {
          const PERIOD_TIME = {
            1: "07:00", 2: "07:50", 3: "08:45", 4: "09:35", 5: "10:30",
            6: "13:00", 7: "13:50", 8: "14:45", 9: "15:35", 10: "16:25",
          };

          const mapped = response.data.map((p, idx) => {
            const beToFeDayMap = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 0: 6 };
            const dayIdx = beToFeDayMap[p.day_of_week];
            const dayKey = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][dayIdx];

            let timeStr = "";
            if (p.start_time) {
              const s = String(p.start_time);
              timeStr = s.includes("T") ? s.split("T")[1].slice(0, 5) : s.slice(0, 5);
            }
            
            let periodNum = 1;
            for (const [pNum, pTime] of Object.entries(PERIOD_TIME)) {
              if (pTime === timeStr) {
                periodNum = parseInt(pNum);
                break;
              }
            }

            const subjectName = p.class_teacher_subject?.subject_assignments?.display_name || "Môn học";
            
            const teacherObj = p.class_teacher_subject?.teachers;
            let teacherName = "Chưa phân công";
            if (teacherObj) {
              const surname = teacherObj.surname || "";
              const givenName = teacherObj.given_name || "";
              const initials = surname.split(" ").filter(Boolean).map(s => s[0].toUpperCase()).join(".");
              teacherName = `Thầy ${initials ? initials + "." : ""}${givenName}`;
            }
            
            return {
              id: p.id || `lesson-${idx}`,
              day: dayKey,
              periodStart: periodNum,
              periodEnd: periodNum,
              subject: subjectName,
              teacher: teacherName,
              room: p.room || "—",
              status: p.status || "normal",
              mode: p.mode || "offline",
              color: p.color || (subjectName.includes("Toán") ? "teal" : subjectName.includes("Văn") ? "pink" : "blue"),
            };
          });
          setLessons(mapped);
        } else {
          setLessons([]);
        }
      } catch (err) {
        console.error("Timetable fetch error:", err);
        setError("Không thể tải thời khóa biểu.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimetable();
  }, [selectedSchoolYear, selectedTerm]);

  // 1. Lấy thông tin từ localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (storedUser?.profile) {
      setLocalProfile(storedUser.profile);
    }
  }, []);

  const [sessionView, setSessionView] = useState("morning");

  const studentId = localProfile?.id || "STU_LOADING";
  const classNameValue = localProfile?.className || "—";

  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isDailyModalOpen, setIsDailyModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(getTodayDayIndex());
  const [selectedSubject, setSelectedSubject] = useState("Tất cả");

  const uniqueSubjects = useMemo(() => {
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
