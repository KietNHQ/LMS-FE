import React from "react";
import { sidebarConfig, roleTheme } from "./sidebar.config";
import "./Sidebar.css";
import SidebarItem from "./SidebarItem";
import { FiLogOut } from "react-icons/fi";
import { useNavigate, NavLink } from "react-router-dom";

export default function Sidebar({
                                    role = "student",
                                    systemName = "LMS System",
                                    userName = "User Name"
                                }) {
    const items = sidebarConfig[role] || sidebarConfig.student;
    const theme = roleTheme[role] || roleTheme.student;
    const navigate = useNavigate();

    // Lấy profile path từ config
    const profileItem = items.find(item => item.label === "Profile");
    const profilePath = profileItem?.path || `/${role}/profile`;

    const handleLogout = () => {
        navigate("/login", { replace: true });
    };

    // Filter items để loại bỏ Profile khỏi menu
    const menuItems = items.filter(item => item.label !== "Profile");

    return (
        <aside className={`sidebar ${theme.className}`}>
            <div className="sidebar-brand">
                <div className="sidebar-brand-badge">{theme.shortLabel}</div>
                <div className="sidebar-brand-text">
                    <h2>{systemName}</h2>
                    <span>{theme.label}</span>
                </div>
            </div>

            <NavLink to={profilePath} className={({ isActive }) => `sidebar-user-card sidebar-user-card-top sidebar-user-card-link ${isActive ? "active" : ""}`}>
                <div className="sidebar-user-avatar">
                    {theme.shortLabel}
                </div>

                <div className="sidebar-user-info">
                    <p className="sidebar-user-name">{userName}</p>
                    <span className="sidebar-user-role">{theme.label}</span>
                </div>
            </NavLink>

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <SidebarItem key={item.path} item={item} />
                ))}
            </nav>

            <div className="sidebar-footer">
                <button type="button" className="sidebar-logout-btn" onClick={handleLogout}>
                    <FiLogOut />
                    <span>Log Out</span>
                </button>
            </div>
        </aside>
    );
}