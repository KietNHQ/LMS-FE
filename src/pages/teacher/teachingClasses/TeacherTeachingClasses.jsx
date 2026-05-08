import React, { useState, useEffect } from "react";
import teacherService from "../../../services/pages/teacher/teacherService";
import { useNavigate } from "react-router-dom";
import "./TeacherTeachingClasses.css";
import { SchoolYearTermSelector, PageHeader } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { teachingClassesData } from "./data/teachingClassesData";
import ClassToolbar from "./components/list/ClassToolbar";
import ClassGrid from "./components/list/ClassGrid";

const TeacherTeachingClasses = () => {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeToolbarFilter, setActiveToolbarFilter] = useState("all");

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const teacherId = storedUser.teacherId;

  useEffect(() => {
    const fetchClasses = async () => {
      if (!teacherId) return;
      setIsLoading(true);
      try {
        const response = await teacherService.getTeacherSubjects({ 
          mock: false,
          pathParams: { id: teacherId },
          params: { schoolYear: selectedSchoolYear }
        });

        if (response.success && response.data && response.data.length > 0) {
          const mapped = response.data.map(item => ({
            id: item.class_id,
            name: item.class_name,
            grade: item.grade_level?.replace("Khối ", "") || "10",
            subject: item.subject_name,
            year: selectedSchoolYear, // Fallback to current selected
            term: selectedTerm,       // Fallback to current selected
            status: "Đang hoạt động",
            teacher: "Chưa cập nhật", // BE chưa trả về tên GVCN trong list này
            students: [], // Sẽ load ở trang detail
            paidStudents: 0
          }));
          setClasses(mapped);
        } else {
          setClasses(teachingClassesData);
        }
      } catch (error) {
        console.error("Failed to fetch teaching classes:", error);
        setClasses(teachingClassesData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, [teacherId, selectedSchoolYear, selectedTerm]);

  const filteredClasses = classes.filter((cls) => {
    // Nếu là data thật, ta đã map year/term trùng với filter ở trên
    // Nếu là data mock, ta check filter
    const matchYear = cls.year === selectedSchoolYear;
    const matchTerm = cls.term === selectedTerm;
    const matchSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchYear && matchTerm && matchSearch;
  });

  const visibleClasses = filteredClasses.filter((cls) => {
    if (activeToolbarFilter === "all") return true;
    return cls.grade === activeToolbarFilter;
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
        <ClassGrid 
          classes={visibleClasses} 
          onClassClick={handleClassClick} 
        />
      </div>
    </div>
  );
};

export default TeacherTeachingClasses;



