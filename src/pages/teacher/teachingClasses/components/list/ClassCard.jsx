import React from "react";
import { LuSchool } from "react-icons/lu";
import { PiStudent } from "react-icons/pi";
import "./ClassCard.css";

const ClassCard = ({ cls, onClick }) => {
  return (
    <article className="teacher-class-list-card" onClick={onClick}>
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
  );
};

export default ClassCard;
