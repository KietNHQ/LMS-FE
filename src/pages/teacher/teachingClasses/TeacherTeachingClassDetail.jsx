import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./TeacherTeachingClasses.css";
import ClassStudentsSection from "./components/classStudentsSection/ClassStudentsSection";
import ClassDetailHeader from "./components/detail/ClassDetailHeader";
import { teachingClassesData } from "./data/teachingClassesData";

import teacherService from "../../../services/pages/teacher/teacherService";

const TeacherTeachingClassDetail = () => {
  const { classId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "{}");
  const teacherId = storedUser.profile?.id || storedUser.teacherId;
  const [classData, setClassData] = React.useState(state?.classData || null);
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch students
        const studentsRes = await teacherService.getClassStudents({
          mock: false,
          pathParams: { id: classId }
        });

        setClassData((prevClassData) => {
          let updatedClassData = { ...prevClassData };

          if (studentsRes.success && studentsRes.data) {
            // Map API students to UI format
            const mappedStudents = studentsRes.data.map(s => ({
              id: s.id,
              name: s.full_name || s.fullName || `${s.surname || ""} ${s.given_name || s.givenName || ""}`.trim() || "Chưa rõ tên",
              dob: s.birthDate,
              email: s.email,
              gender: s.gender,
              className: prevClassData?.name || "Lớp",
              status: "Đang học",
              enrollmentId: s.enrollment_id,
              parentName: s.parent_name || "Chưa cập nhật",
              parentPhone: s.parent_phone || "N/A"
            }));
            updatedClassData.students = mappedStudents;
          }

          // Nếu chưa có classData (vào trực tiếp bằng URL), ta fetch thông tin lớp
          if (!prevClassData) {
            // Tạm thời lấy từ mock nếu không có API get class by id chi tiết cho teacher
            const fallback = teachingClassesData.find((item) => item.id === Number(classId));
            updatedClassData = { ...fallback, ...updatedClassData };
          }

          return updatedClassData;
        });
      } catch (error) {
        console.error("Failed to fetch class detail:", error);
      }
    };

    fetchData();
  }, [classId]);

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
      <ClassStudentsSection 
        classId={classId}
        students={classData.students} 
      />
    </div>
  );
};

export default TeacherTeachingClassDetail;
