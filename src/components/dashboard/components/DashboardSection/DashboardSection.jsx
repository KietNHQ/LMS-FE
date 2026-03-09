import React from "react";
import "./DashboardSection.css";

export default function DashboardSection({ title, children, role = "admin" }) {
    return (
        <div className={`dashboard-section role-${role}`}>
            <div className="section-header">
                <h3>{title}</h3>
            </div>

            <div className="section-body">{children}</div>
        </div>
    );
}