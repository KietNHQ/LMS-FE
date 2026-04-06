import React from "react";
import "./ClassListSection.css";

const ClassListSection = ({ classes, onSelect, selectedClassId }) => {
  return (
    <div className="tc-class-list">
      {classes.map((cls) => (
        <div
          key={cls.id}
          className={`tc-class-card ${selectedClassId === cls.id ? "is-active" : ""}`}
          onClick={() => onSelect(cls)}
        >
          <div className="tc-card-top">
            <h4>{cls.name}</h4>
            <span className={`tc-status ${cls.status.toLowerCase()}`}>
              {cls.status}
            </span>
          </div>

          <p className="tc-card-subject">{cls.subject}</p>
          <p className="tc-card-year">{cls.year}</p>

          <div className="tc-card-footer">
            <span>{cls.students.length} students</span>
            <button type="button" className="tc-card-view-btn">View</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClassListSection;