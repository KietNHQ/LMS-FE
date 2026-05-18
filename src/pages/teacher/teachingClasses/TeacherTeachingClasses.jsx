import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import teacherService from "../../../services/pages/teacher/teacherService";
import { useNavigate } from "react-router-dom";
import "./TeacherTeachingClasses.css";
import { SchoolYearTermSelector, PageHeader } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { teachingClassesData } from "./data/teachingClassesData";
import ClassToolbar from "./components/list/ClassToolbar";
import ClassGrid from "./components/list/ClassGrid";
import { formatName } from "../../../utils/nameUtils";


const TeacherTeachingClasses = () => {
  const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeToolbarFilter, setActiveToolbarFilter] = useState("all");

  const storedUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "{}");
  const teacherId = storedUser.profile?.id || storedUser.teacherId || (storedUser.role === 'teacher' ? storedUser.id : null);

  // Sử dụng TanStack Query cho danh sách lớp giảng dạy
  const { data: classesResponse, isLoading } = useQuery({
    queryKey: ["teacher-teaching-classes", teacherId, selectedSchoolYear, selectedTerm],
    queryFn: async () => {
      if (!teacherId) return { success: false, data: [] };
      
      // Ưu tiên gọi API consolidated mới, nếu lỗi thì fallback về API cũ
      try {
        const response = await teacherService.getConsolidatedTeachingClasses({
          params: { schoolYear: selectedSchoolYear, term: selectedTerm }
        });
        if (response.success) return response;
      } catch (e) {
        console.warn("Consolidated API not ready, falling back to legacy API");
      }

      return teacherService.getTeacherSubjects({ 
        mock: false,
        pathParams: { id: teacherId },
        params: { schoolYear: selectedSchoolYear, term: selectedTerm }
      });
    },
    enabled: !!teacherId,
  });

  const rawClasses = classesResponse?.success && classesResponse.data ? classesResponse.data : [];
  
  // Mapping logic tập trung để khớp với API mới
  const classes = classesResponse?.success 
    ? rawClasses.map(item => {
        // Lấy tên môn học đầu tiên trong danh sách môn giảng dạy tại lớp đó
        const subjectName = item.subjects && item.subjects.length > 0 
          ? item.subjects[0].name 
          : (item.subject_name || "N/A");

        return {
          id: item.class_id || item.id,
          name: item.class_name || item.name,
          grade: (item.grade || item.grade_level || "10").replace("Khối ", ""),
          subject: subjectName,
          year: selectedSchoolYear,
          term: selectedTerm,
          status: "Đang hoạt động",
          teacher: item.homeroomTeacher || item.homeroom_teacher_name || "Chưa cập nhật",
          studentsCount: parseInt(item.studentsCount ?? item.actual_students ?? item.student_count ?? 0) || 0,
          students: []
        };
      })
    : (isLoading ? [] : teachingClassesData);

  const filteredClasses = classes.filter((cls) => {
    const matchSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = activeToolbarFilter === "all" || cls.grade === activeToolbarFilter;
    return matchSearch && matchFilter;
  });

  const handleClassClick = (cls) => {
    navigate(`/teacher/teaching-classes/${cls.id}`, {
      state: { classData: cls },
    });
  };

  return (
    <div className="teacher-classes-page">
      <PageHeader 
        title="Lớp giảng dạy" 
        actions={
          <SchoolYearTermSelector
            selectedSchoolYear={selectedSchoolYear}
            selectedTerm={selectedTerm}
            onYearChange={handleYearArrow}
            onTermChange={handleTermChange}
          />
        }
      />

      <ClassToolbar 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm}
        activeFilter={activeToolbarFilter}
        onFilterChange={setActiveToolbarFilter}
      />

      <div className="admin-classes-body">
        {isLoading ? (
          <div className="loading-state">Đang tải danh sách lớp...</div>
        ) : (
          <ClassGrid 
            classes={filteredClasses} 
            onClassClick={handleClassClick} 
          />
        )}
      </div>
    </div>
  );
};

export default TeacherTeachingClasses;



