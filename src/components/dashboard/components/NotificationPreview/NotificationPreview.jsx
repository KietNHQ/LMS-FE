import React from "react";
import "./NotificationPreview.css";

export default function NotificationPreview({ items = [] }) {
    const defaultItems = [
        { type: "warning", text: "Midterm schedule updated" },
        { type: "info", text: "3 new student registrations" },
        { type: "success", text: "Monthly report generated successfully" },
    ];

    const notifications = items.length ? items : defaultItems;

    return (
        <div className="notification-preview">
            {notifications.map((item, index) => (
                <div key={index} className={`notification-item ${item.type}`}>
                    {item.text}
                </div>
            ))}
        </div>
    );
}