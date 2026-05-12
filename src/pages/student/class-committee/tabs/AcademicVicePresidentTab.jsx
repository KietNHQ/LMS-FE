import React, { useState, useEffect } from "react";
import teacherService from "../../../../services/pages/teacher/teacherService";
import ClassStudentsSection from "../../../teacher/teachingClasses/components/classStudentsSection/ClassStudentsSection";
import "./AcademicVicePresidentTab.css";

export default function AcademicVicePresidentTab({ classId }) {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [academicStats, setAcademicStats] = useState(null);

  useEffect(() => {
    const fetchAcademicData = async () => {
      if (!classId) return;
      setIsLoading(true);
      try {
        const res = await teacherService.getAcademicSummary({
          mock: false,
          pathParams: { id: classId }
        });
        if (res.success && res.data) {
          setStudents((res.data.studentPerformance || []).map(s => ({
            id: s.id,
            name: s.fullName,
            dob: s.dob || "N/A",
            parentName: s.parentName || "N/A",
            phone: s.phone || "N/A",
            averageScore: s.averageScore,
            assessment: s.assessment
          })));
          setAcademicStats(res.data.academicStats);
        }
      } catch (error) {
        console.error("Failed to fetch academic summary:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAcademicData();
  }, [classId]);

  if (isLoading) return <div className="avp-loading">Đang tải dữ liệu học tập...</div>;

  return (
    <div className="academic-vice-president-tab tc-student-theme-override">
      {academicStats && (
        <div className="academic-stats-summary">
          <div className="stat-item excellent">Giỏi: {academicStats.excellent}</div>
          <div className="stat-item good">Khá: {academicStats.good}</div>
          <div className="stat-item average">Trung bình: {academicStats.average}</div>
          <div className="stat-item weak">Yếu: {academicStats.weak}</div>
        </div>
      )}
      <div className="avp-tracking">
        <ClassStudentsSection students={students} readOnly={true} />
      </div>
    </div>
  );
}
