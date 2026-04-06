import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./TeacherTeachingClasses.css";
import ClassDetailSection from "./components/classDetailSection/ClassDetailSection";
import ClassStudentsSection from "./components/classStudentsSection/ClassStudentsSection";
import { teachingClassesData } from "./data/teachingClassesData";

const TeacherTeachingClassDetail = () => {
  const { classId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("students");

  const fallbackClass = teachingClassesData.find((item) => item.id === Number(classId));
  const classData = state?.classData || fallbackClass;

  if (!classData) {
    return (
      <div className="class-detail-page">
        <button 
          className="back-btn teacher-back-btn" 
          onClick={() => navigate("/teacher/teaching-classes")}
        >
          ← Quay lại
        </button>
        <div className="empty-state">
          <p>Không tìm thấy lớp học này</p>
        </div>
      </div>
    );
  }

  return (
    <div className="class-detail-page">
      {/* Header Section */}
      <div className="class-detail-header teacher-detail-header">
        <div className="class-detail-top">
          <button
            className="back-btn teacher-back-btn"
            onClick={() => navigate("/teacher/teaching-classes")}
          >
            ← Quay lại
          </button>

          <div className="class-detail-title">
            <h1>{classData.name}</h1>
            <p>{classData.subject} • Khối {classData.grade}</p>
          </div>
        </div>

        <div className="class-detail-info">
          <div className="info-item">
            <span className="info-label">Giáo viên chủ nhiệm</span>
            <span className="info-value">{classData.teacher}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Tổng số học sinh</span>
            <span className="info-value">{classData.students.length}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Năm học</span>
            <span className="info-value">{classData.year}</span>
          </div>
        </div>
      </div>

      <div className="class-detail-section-switch">
        <button
          type="button"
          className={`section-switch-btn switch-students ${activeSection === "students" ? "active" : ""}`.trim()}
          onClick={() => setActiveSection("students")}
        >
          Danh sách học sinh
        </button>
        <button
          type="button"
          className={`section-switch-btn switch-details ${activeSection === "details" ? "active" : ""}`.trim()}
          onClick={() => setActiveSection("details")}
        >
          Đánh giá tiết học
        </button>
      </div>

      {activeSection === "students" ? (
        <ClassStudentsSection students={classData.students} />
      ) : (
        <ClassDetailSection classData={classData} />
      )}
    </div>
  );
};

export default TeacherTeachingClassDetail;
