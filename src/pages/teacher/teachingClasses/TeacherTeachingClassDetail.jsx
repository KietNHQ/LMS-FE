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
  const [classData, setClassData] = React.useState(state?.classData || null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch students
        const studentsRes = await teacherService.getClassStudents({
          mock: false,
          pathParams: { id: classId }
        });

        let updatedClassData = { ...classData };

        if (studentsRes.success && studentsRes.data) {
          // Map API students to UI format
          const mappedStudents = studentsRes.data.map(s => ({
            id: s.id,
            name: s.fullName || `${s.surname} ${s.givenName}`,
            dob: s.birthDate,
            email: s.email,
            gender: s.gender,
            className: classData?.name || "Lớp",
            status: "Đang học",
            parentName: "Chưa cập nhật",
            parentPhone: "N/A"
          }));
          updatedClassData.students = mappedStudents;
        }

        // Nếu chưa có classData (vào trực tiếp bằng URL), ta fetch thông tin lớp
        if (!classData) {
          // Tạm thời lấy từ mock nếu không có API get class by id chi tiết cho teacher
          const fallback = teachingClassesData.find((item) => item.id === Number(classId));
          updatedClassData = { ...fallback, ...updatedClassData };
        }

        setClassData(updatedClassData);
      } catch (error) {
        console.error("Failed to fetch class detail:", error);
      } finally {
        setIsLoading(false);
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
      <ClassStudentsSection students={classData.students} />
    </div>
  );
};

export default TeacherTeachingClassDetail;

