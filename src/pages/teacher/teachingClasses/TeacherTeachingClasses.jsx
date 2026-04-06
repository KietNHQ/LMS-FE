import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TeacherTeachingClasses.css";
import { SchoolYearTermSelector, PageHeader } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { LuSchool } from "react-icons/lu";
import { PiStudent } from "react-icons/pi";
import { FiSearch } from "react-icons/fi";
import { teachingClassesData } from "./data/teachingClassesData";

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
    if (activeToolbarFilter === "all") {
      return true;
    }

    return cls.grade === activeToolbarFilter;
  });

  return (
    <div className="teacher-classes-page">
      <PageHeader 
        title="Lớp giảng dạy" 
        eyebrow={`${visibleClasses.length} / ${classes.length} lớp`}
        actions={
          <SchoolYearTermSelector
            selectedSchoolYear={selectedSchoolYear}
            selectedTerm={selectedTerm}
            onYearChange={handleYearArrow}
            onTermChange={handleTermChange}
          />
        }
      />

      <div className="admin-classes-toolbar teacher-classes-toolbar">
        <div className="admin-classes-search">
          <FiSearch aria-hidden="true" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm tên lớp, môn học, giáo viên..."
            aria-label="Tìm kiếm lớp học"
          />
        </div>

        <div className="admin-classes-grade-filter" role="tablist" aria-label="Lọc theo khối">
          <button
            key="all"
            type="button"
            className={`teacher-classes-grade-btn ${activeToolbarFilter === "all" ? "is-active" : ""}`}
            onClick={() => setActiveToolbarFilter("all")}
          >
            Tất cả
          </button>
          <button
            key="10"
            type="button"
            className={`teacher-classes-grade-btn ${activeToolbarFilter === "10" ? "is-active" : ""}`}
            onClick={() => setActiveToolbarFilter("10")}
          >
            Khối 10
          </button>
          <button
            key="11"
            type="button"
            className={`teacher-classes-grade-btn ${activeToolbarFilter === "11" ? "is-active" : ""}`}
            onClick={() => setActiveToolbarFilter("11")}
          >
            Khối 11
          </button>
          <button
            key="12"
            type="button"
            className={`teacher-classes-grade-btn ${activeToolbarFilter === "12" ? "is-active" : ""}`}
            onClick={() => setActiveToolbarFilter("12")}
          >
            Khối 12
          </button>
        </div>
      </div>

      <div className="admin-classes-body">
        {visibleClasses.length > 0 ? (
          <div className="teacher-class-list-grid">
            {visibleClasses.map((cls) => (
              <article
                key={cls.id}
                className="teacher-class-list-card"
                onClick={() =>
                  navigate(`/teacher/teaching-classes/${cls.id}`, {
                    state: { classData: cls },
                  })
                }
              >
                <div className="teacher-class-list-card__top">
                  <div className="teacher-class-list-card__icon">
                    <LuSchool />
                  </div>

                  <div className="teacher-class-list-card__heading">
                    <h3>{cls.name}</h3>
                    <p>
                      {cls.subject} • {cls.term === "hk1" ? "Học kỳ 1" : "Học kỳ 2"}
                    </p>
                  </div>
                </div>

                <div className="teacher-class-list-card__meta">
                  <div className="teacher-meta-row">
                    <span className="teacher-meta-left">
                      <PiStudent />
                      Học sinh
                    </span>
                    <strong>{cls.students.length}</strong>
                  </div>
                </div>

                <div className="teacher-class-list-card__teacher">
                  <span>GVCN</span>
                  <strong>{cls.teacher}</strong>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="admin-classes-empty-state">
            <h3>Không tìm thấy lớp phù hợp</h3>
            <p>Thử đổi năm học, học kỳ hoặc bộ lọc khối.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherTeachingClasses;