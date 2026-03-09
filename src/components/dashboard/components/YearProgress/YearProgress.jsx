import React from "react";
import "./YearProgress.css";

export default function YearProgress({ role = "student" }) {
    const items = [
        { label: "Semester 1", value: "8.2", width: "82%" },
        { label: "Semester 2", value: "8.7", width: "87%" },
        { label: "Full Year", value: "8.5", width: "85%" },
    ];

    return (
        <div className={`year-progress theme-${role}`}>
            {items.map((item, index) => (
                <div className="year-progress-item" key={index}>
                    <div className="year-progress-top">
                        <span>{item.label}</span>
                        <span>{item.value}</span>
                    </div>

                    <div className="year-progress-track">
                        <div
                            className="year-progress-fill"
                            style={{ width: item.width }}
                        ></div>
                    </div>
                </div>
            ))}
        </div>
    );
}