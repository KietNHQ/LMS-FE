import React from "react"
import "./ChildHeader.css"

export default function ChildHeader({ child, onStatClick }) {
    const averageStats = [
        { label: "TBHK I", value: child.averageScores?.semester1, semesterKey: "hk1" },
        { label: "TBHK II", value: child.averageScores?.semester2, semesterKey: "hk2" },
        { label: "Cả năm", value: child.averageScores?.fullYear, semesterKey: "year" }
    ]

    return (
        <div className="child-header-card">
            <div className="child-header-main">
                <div className="child-avatar" style={child.avatarColor ? { background: child.avatarColor } : undefined}>
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

            <div className="child-header-stats-panel">
                <span className="child-header-stats-title">Điểm trung bình</span>

                <div className="child-header-stats">
                    {averageStats.map((stat) => (
                        <button
                            key={stat.label}
                            type="button"
                            className="child-stat-box"
                            onClick={() => onStatClick?.(stat.semesterKey)}
                        >
                            <span>{stat.label}</span>
                            <strong>{stat.value}</strong>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}