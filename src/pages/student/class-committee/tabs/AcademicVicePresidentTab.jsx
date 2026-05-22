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
        // Fetch classmates and academic summary in parallel
        const [studentsRes, summaryRes] = await Promise.all([
          teacherService.getClassStudents({
            mock: false,
            pathParams: { id: classId }
          }),
          teacherService.getAcademicSummary({
            mock: false,
            pathParams: { id: classId }
          })
        ]);

        if (studentsRes.success && studentsRes.data) {
          const performanceMap = {};
          if (summaryRes.success && summaryRes.data?.studentPerformance) {
            summaryRes.data.studentPerformance.forEach(p => {
              performanceMap[p.studentId] = p;
            });
          }

          const mappedStudents = studentsRes.data.map(s => {
            const perf = performanceMap[s.id] || {};
            return {
              id: s.id,
              name: s.full_name || s.fullName || `${s.surname || ""} ${s.given_name || s.givenName || ""}`.trim() || "Chưa rõ tên",
              dob: s.birth_date || s.birthDate || null,
              email: s.email,
              gender: s.gender,
              status: "Đang học",
              enrollmentId: s.enrollment_id,
              parentName: s.parent_name || "Chưa cập nhật",
              parentPhone: s.parent_phone || "N/A",
              averageScore: perf.totalPoints || 0,
              assessment: perf.reports?.length ? `${perf.reports.length} vi phạm` : "Không có vi phạm"
            };
          });

          setStudents(mappedStudents);
        }

        if (summaryRes.success && summaryRes.data) {
          setAcademicStats(summaryRes.data.academicStats);
        }
      } catch (error) {
        console.error("Failed to fetch academic summary and student list:", error);
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
        <ClassStudentsSection classId={classId} students={students} readOnly={true} isStudentView={true} />
      </div>
    </div>
  );
}

