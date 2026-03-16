import React from "react";
import "./BasicInfoSection.css";

export default function BasicInfoSection({ title = "Thông tin cơ bản", fields = [] }) {
    if (!fields.length) return null;

    return (
        <div className="basic-info-section profile-info-card">
            <h3>{title}</h3>
            <ul>
                {fields.map((item) => (
                    <li key={item.label}>
                        <span>{item.label}</span>
                        <strong>{item.value || "-"}</strong>
                    </li>
                ))}
            </ul>
        </div>
    );
}

