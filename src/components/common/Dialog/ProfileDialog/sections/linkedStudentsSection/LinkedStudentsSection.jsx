import React from "react";
import "./LinkedStudentsSection.css";

export default function LinkedStudentsSection({ children = [], total = 0 }) {
    if (!children.length && !total) return null;

    return (
        <div className="linked-students-section profile-info-card">
            <h3>Con đang học tại trường</h3>
            {total ? <p className="linked-total">Số con đang học: {total}</p> : null}
            <ul>
                {children.map((child) => (
                    <li key={`${child.name}-${child.className}`}>
                        <span>{child.name}</span>
                        <strong>Lớp {child.className}</strong>
                    </li>
                ))}
            </ul>
        </div>
    );
}


