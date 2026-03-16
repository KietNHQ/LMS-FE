import React from "react";
import "./RoleDescriptionSection.css";

export default function RoleDescriptionSection({ descriptions = [] }) {
    if (!descriptions.length) return null;

    return (
        <div className="role-description-section profile-info-card">
            <h3>Giới thiệu chức năng</h3>
            <ul>
                {descriptions.map((item) => (
                    <li key={item}>{item}</li>
                ))}
            </ul>
        </div>
    );
}

