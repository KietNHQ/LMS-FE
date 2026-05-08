import React from "react";
import "./HomeroomClassSection.css";

export default function HomeroomClassSection({ subject, homeroomClass }) {
    if (!subject && !homeroomClass) return null;

    return (
        <div className="homeroom-class-section profile-info-card">
            <h3>Phụ trách giảng dạy</h3>
            <ul>
                {subject ? (
                    <li>
                        <span>Môn giảng dạy</span>
                        <strong>{subject}</strong>
                    </li>
                ) : null}
                {homeroomClass ? (
                    <li>
                        <span>Chủ nhiệm lớp</span>
                        <strong>{homeroomClass}</strong>
                    </li>
                ) : null}
            </ul>
        </div>
    );
}


