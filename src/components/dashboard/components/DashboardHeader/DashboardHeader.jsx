import React from "react";
import "./DashboardHeader.css";

export default function DashboardHeader({
                                            title,
                                            subtitle,
                                            role = "admin",
                                        }) {
    return (
        <div className={`dashboard-header role-${role}`}>
            <div className="dashboard-header-text">
                <h1>{title}</h1>
                {subtitle && <p>{subtitle}</p>}
            </div>

            <div className="dashboard-header-actions">
                <button className="dashboard-btn">Refresh</button>
            </div>
        </div>
    );
}