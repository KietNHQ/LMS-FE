import React from "react";
import { FiPlus } from "react-icons/fi";
import "./accountsOverviewSection.css";

export default function AccountsOverviewSection({
    totalUsers,
    children,
}) {
    return (
        <div className="accounts-overview-section">
            <div className="accounts-overview-left">
                <div className="accounts-overview-title-row">
                    <h1>Quản lý Người dùng</h1>
                    <div className="accounts-overview-total-badge" aria-live="polite">
                        <span className="accounts-overview-total-number">{totalUsers}</span>
                        <span className="accounts-overview-total-label">người dùng</span>
                    </div>
                </div>
            </div>

            <div className="accounts-overview-actions">
                {children}
            </div>
        </div>
    );
}
