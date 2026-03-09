import React from "react";
import "./StatCard.css";

export default function StatCard({ title, value, icon, role = "admin" }) {
    return (
        <div className={`stat-card role-${role}`}>
            <div className="stat-card-info">
                <p className="stat-title">{title}</p>
                <h2 className="stat-value">{value}</h2>
            </div>

            {icon && <div className="stat-icon">{icon}</div>}
        </div>
    );
}