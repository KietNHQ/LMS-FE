import React from "react";
import ClassCard from "./ClassCard";
import "./ClassGrid.css";

const ClassGrid = ({ classes, onClassClick }) => {
  if (classes.length === 0) {
    return (
      <div className="admin-classes-empty-state">
        <h3>Không tìm thấy lớp phù hợp</h3>
        <p>Thử đổi năm học, học kỳ hoặc bộ lọc khối.</p>
      </div>
    );
  }

  return (
    <div className="teacher-class-list-grid">
      {classes.map((cls) => (
        <ClassCard 
          key={cls.id} 
          cls={cls} 
          onClick={() => onClassClick(cls)} 
        />
      ))}
    </div>
  );
};

export default ClassGrid;
