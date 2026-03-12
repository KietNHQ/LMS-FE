import React from "react"
import "./ChildHeader.css"

export default function ChildHeader({ child }) {
    return (
        <div className="child-header-card">
            <div className="child-header-main">
                <div className="child-avatar">
                    {child.avatarLetter}
                </div>

                <div className="child-info">
                    <div className="child-info-top">
                        <h2>{child.name}</h2>
                        <span className="child-status">{child.status}</span>
                    </div>

                    <div className="child-meta">
                        <span>ID: {child.studentId}</span>
                        <span>Lớp: {child.className}</span>
                        <span>Năm học: {child.schoolYear}</span>
                    </div>

                    <div className="child-extra">
                        <span>Phụ huynh: {child.parentName}</span>
                        <span>Giáo viên chủ nhiệm: {child.homeroomTeacher}</span>
                    </div>
                </div>
            </div>

            <div className="child-header-stats">
                <div className="child-stat-box">
                    <span>GPA</span>
                    <strong>{child.gpa}</strong>
                </div>


                <div className="child-stat-box">
                    <span>Bài tập</span>
                    <strong>{child.assignmentsDone}</strong>
                </div>
            </div>
        </div>
    )
}