import React from "react";
import "./RadarChart.css";

export default function RadarChart({ role = "student" }) {
    return (
        <div className={`radar-chart theme-${role}`}>
            <div className="radar-circle radar-outer"></div>
            <div className="radar-circle radar-middle"></div>
            <div className="radar-circle radar-inner"></div>
            <div className="radar-shape"></div>
            <div className="radar-center-dot"></div>
        </div>
    );
}