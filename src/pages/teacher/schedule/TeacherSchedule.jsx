import React, { useState } from "react";
import WeeklyScheduleSection from "./components/weeklyScheduleSection/WeeklyScheduleSection";
import DailyScheduleSection from "./components/dailyScheduleSection/DailyScheduleSection";
import ScheduleFilterSection from "./components/scheduleFilterSection/ScheduleFilterSection";
import Modal from "../../../components/ui/Modal/Modal";
import "./TeacherSchedule.css";

function getTodayDayIndex() {
  const day = new Date().getDay(); // 0=Sun
  // Mon=0 ... Sat=5, Sun=6
  return day === 0 ? 6 : day - 1;
}

export default function TeacherSchedule() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedClass, setSelectedClass] = useState("Tất cả");
  const [selectedDay, setSelectedDay] = useState(getTodayDayIndex());
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isDailyModalOpen, setIsDailyModalOpen] = useState(false);

  const handleQuickDaySelect = (offset) => {
    const now = new Date();
    const target = new Date(now);
    target.setDate(now.getDate() + offset);
    setSelectedDay(((target.getDay() === 0 ? 6 : target.getDay() - 1) + 7) % 7);
    setWeekOffset(0);
    setIsDailyModalOpen(true);
  };

  const handleSelectDay = (idx) => {
    setSelectedDay(idx);
    setIsDailyModalOpen(true);
  };

  return (
    <div className="teacher-schedule">
      <div className="teacher-schedule-header">
        <h1>Thời khóa biểu</h1>
      </div>

      <ScheduleFilterSection
        weekOffset={weekOffset}
        setWeekOffset={setWeekOffset}
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        onQuickDaySelect={handleQuickDaySelect}
      />

      <div className="teacher-schedule-content">
        <WeeklyScheduleSection
          weekOffset={weekOffset}
          selectedClass={selectedClass}
          onSelectDay={handleSelectDay}
          onLessonSelect={setSelectedLesson}
        />
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
              <h3>{selectedLesson.subject}</h3>
              <span className={`modal-badge color-${selectedLesson.color}`}>
                Tiết {selectedLesson.period}
              </span>
            </div>
            <div className="modal-body-info">
              <p><strong>Lớp:</strong> {selectedLesson.class}</p>
              <p><strong>Phòng:</strong> {selectedLesson.room}</p>
              {selectedLesson.students && <p><strong>Sĩ số:</strong> {selectedLesson.students} học sinh</p>}
              {selectedLesson.note && <p><strong>Nội dung:</strong> {selectedLesson.note}</p>}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
