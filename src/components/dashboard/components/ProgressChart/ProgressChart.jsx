import React from "react";
import "./ProgressChart.css";

export default function ProgressChart({ role = "admin", title = "Progress Overview" }) {
    return (
        <div className={`progress-chart theme-${role}`}>
            <div className="progress-chart-header">
                <h4>{title}</h4>
            </div>

            <div className="progress-chart-body">
                <div className="progress-bar-item"><div className="bar bar-1"></div></div>
                <div className="progress-bar-item"><div className="bar bar-2"></div></div>
                <div className="progress-bar-item"><div className="bar bar-3"></div></div>
                <div className="progress-bar-item"><div className="bar bar-4"></div></div>
                <div className="progress-bar-item"><div className="bar bar-5"></div></div>
            </div>
        </div>
    );
}