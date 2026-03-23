import React from "react";
import "./classDetailSection.css";

export default function ClassDetailSection({ classData, onClose }) {
    if (!classData) return null;

    return (
        <div className="class-detail-modal-overlay" onClick={onClose}>
            <div className="class-detail-modal" onClick={(e) => e.stopPropagation()}>
                <h2>Chi tiết lớp {classData.name}</h2>

                <div className="class-detail-list">
                    <div className="detail-row">
                        <span>Khối lớp</span>
                        <strong>{classData.grade.replace("Khối ", "")}</strong>
                    </div>

                    <div className="detail-row">
                        <span>Năm học</span>
                        <strong>{classData.year}</strong>
                    </div>

                    <div className="detail-row">
                        <span>GVCN</span>
                        <strong>{classData.teacher}</strong>
                    </div>

                    <div className="detail-row">
                        <span>Số học sinh</span>
                        <strong>{classData.students}</strong>
                    </div>
                </div>

                <div className="class-detail-subjects">
                    <p>Môn học ({classData.subjects.length})</p>
                    <div className="subject-chip-list">
                        {classData.subjects.map((subject) => (
                            <span className="subject-chip" key={subject}>
                {subject}
              </span>
                        ))}
                    </div>
                </div>

                <button type="button" className="detail-close-btn" onClick={onClose}>
                    Đóng
                </button>
            </div>
        </div>
    );
}