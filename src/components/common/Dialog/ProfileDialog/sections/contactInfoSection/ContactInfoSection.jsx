import React from "react";
import "./ContactInfoSection.css";

export default function ContactInfoSection({ fields = [] }) {
    if (!fields.length) return null;

    return (
        <div className="contact-info-section profile-info-card">
            <h3>Liên hệ</h3>
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

