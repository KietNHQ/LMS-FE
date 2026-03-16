import React from "react";
import "./AchievementsSection.css";

export default function AchievementsSection({ achievements = [] }) {
    if (!achievements.length) return null;

    return (
        <div className="achievements-section profile-info-card">
            <h3>Thành tích</h3>
            <ul>
                {achievements.map((item) => (
                    <li key={item}>{item}</li>
                ))}
            </ul>
        </div>
    );
}

