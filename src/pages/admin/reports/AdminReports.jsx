import React from "react";
import "./AdminReports.css";

import AcademicReportSection from "./components/academicReportSection/AcademicReportSection";
import AttendanceReportSection from "./components/attendanceReportSection/AttendanceReportSection";
import ExportReportSection from "./components/exportReportSection/ExportReportSection";
import QuizExamReportSection from "./components/quizExamReportSection/QuizExamReportSection";
import TeacherProgressReportSection from "./components/teacherProgressReportSection/TeacherProgressReportSection";

const AdminReports = () => {
  return (
    <div className="admin-reports">
      <AcademicReportSection />
      <AttendanceReportSection />
      <QuizExamReportSection />
      <TeacherProgressReportSection />
      <ExportReportSection />
    </div>
  );
};

export default AdminReports;