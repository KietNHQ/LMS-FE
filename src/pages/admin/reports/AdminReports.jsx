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
      <div className="admin-reports__header">
        <h2>Báo cáo tổng hợp</h2>
        <p>Theo dõi học lực, chuyên cần và tiến độ giảng dạy theo chuẩn quản trị admin.</p>
      </div>

      <div className="admin-reports__content">
        <AcademicReportSection />
        <AttendanceReportSection />
        <QuizExamReportSection />
        <TeacherProgressReportSection />
        <ExportReportSection />
      </div>
    </div>
  );
};

export default AdminReports;