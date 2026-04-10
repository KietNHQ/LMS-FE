import React from "react";
import { FiSearch } from "react-icons/fi";
import "./ClassToolbar.css";

const ClassToolbar = ({ searchTerm, onSearchChange, activeFilter, onFilterChange }) => {
  const grades = [
    { value: "all", label: "Tất cả" },
    { value: "10", label: "Khối 10" },
    { value: "11", label: "Khối 11" },
    { value: "12", label: "Khối 12" },
  ];

  return (
    <div className="admin-classes-toolbar teacher-classes-toolbar">
      <div className="admin-classes-search">
        <FiSearch aria-hidden="true" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm tên lớp, môn học, giáo viên..."
          aria-label="Tìm kiếm lớp học"
        />
      </div>

      <div className="admin-classes-grade-filter" role="tablist" aria-label="Lọc theo khối">
        {grades.map((grade) => (
          <button
            key={grade.value}
            type="button"
            className={`teacher-classes-grade-btn ${activeFilter === grade.value ? "is-active" : ""}`}
            onClick={() => onFilterChange(grade.value)}
          >
            {grade.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ClassToolbar;
