import React from "react";
import { getTermLabel, getAcademicWeek } from "../../utils/teachingClassesUtils";
import "./ClassDetailHeader.css";

const ClassDetailHeader = ({ classData, onBack }) => {
  return (
    <div className="class-detail-header teacher-detail-header">
      <div className="class-detail-top">
        <button
          className="back-btn teacher-back-btn"
          onClick={onBack}
        >
          ← Quay lại
        </button>

        <div className="class-detail-title">
          <h1>{classData.name}</h1>
          <p>{classData.subject} • Khối {classData.grade}</p>
        </div>
      </div>

      <div className="class-detail-info">
        <div className="info-item">
          <span className="info-label">Giáo viên chủ nhiệm</span>
          <span className="info-value">{classData.teacher}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Tổng số học sinh</span>
          <span className="info-value">{classData.students?.length || 0}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Năm học</span>
          <span className="info-value">
            {classData.year} • {getTermLabel(classData.term)} • Tuần {getAcademicWeek(new Date())}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ClassDetailHeader;

