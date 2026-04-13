import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TeacherTeachingClasses.css";
import { SchoolYearTermSelector, PageHeader } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { teachingClassesData } from "./data/teachingClassesData";
import ClassToolbar from "./components/list/ClassToolbar";
import ClassGrid from "./components/list/ClassGrid";

const TeacherTeachingClasses = () => {
  const [classes] = useState(teachingClassesData);
  const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeToolbarFilter, setActiveToolbarFilter] = useState("all");

  const filteredClasses = classes.filter((cls) => {
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


