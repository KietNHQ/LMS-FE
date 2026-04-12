import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./TeacherTeachingClasses.css";
import ClassStudentsSection from "./components/classStudentsSection/ClassStudentsSection";
import ClassDetailHeader from "./components/detail/ClassDetailHeader";
import { teachingClassesData } from "./data/teachingClassesData";

const TeacherTeachingClassDetail = () => {
  const { classId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const fallbackClass = teachingClassesData.find((item) => item.id === Number(classId));
  const classData = state?.classData || fallbackClass;

  const handleBack = () => {
    navigate("/teacher/teaching-classes");
  };

  if (!classData) {
    return (
      <div className="class-detail-page">
        <button 
          className="back-btn teacher-back-btn" 
          onClick={handleBack}
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
      <ClassDetailHeader classData={classData} onBack={handleBack} />
      <ClassStudentsSection students={classData.students} />
    </div>
  );
};

export default TeacherTeachingClassDetail;
