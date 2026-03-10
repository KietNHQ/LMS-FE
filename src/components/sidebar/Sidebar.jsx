import React, { useState, useRef, useEffect } from "react";
import { sidebarConfig, roleTheme } from "./sidebar.config";
import "./Sidebar.css";
import SidebarItem from "./SidebarItem";
import { FiLogOut, FiChevronLeft } from "react-icons/fi";
import { useNavigate, NavLink } from "react-router-dom";

export default function Sidebar({
                                    role = "student",
                                    systemName = "LMS System",
                                    userName = "User Name"
                                }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [buttonPosition, setButtonPosition] = useState(50); // % từ top
    const [isDragging, setIsDragging] = useState(false);
    const sidebarRef = useRef(null);
    const buttonRef = useRef(null);

    const items = sidebarConfig[role] || sidebarConfig.student;
    const theme = roleTheme[role] || roleTheme.student;
    const navigate = useNavigate();

    // Lấy profile path từ config
    const profileItem = items.find(item => item.label === "Profile");
    const profilePath = profileItem?.path || `/${role}/profile`;

    const handleLogout = () => {
        navigate("/login", { replace: true });
    };

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    // Xử lý kéo nút
    const handleMouseDown = (e) => {
        if (e.target.closest('.sidebar-toggle-btn')) {
            setIsDragging(true);
            e.preventDefault();
        }
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !sidebarRef.current) return;

        const sidebar = sidebarRef.current;
        const sidebarRect = sidebar.getBoundingClientRect();
        const mouseY = e.clientY - sidebarRect.top;
        const percentage = (mouseY / sidebarRect.height) * 100;

        // Giới hạn từ 10% đến 90%
        const clampedPercentage = Math.max(10, Math.min(90, percentage));
        setButtonPosition(clampedPercentage);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'grabbing';
            document.body.style.userSelect = 'none';
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isDragging]);

    // Filter items để loại bỏ Profile khỏi menu
    const menuItems = items.filter(item => item.label !== "Profile");

    return (
        <aside ref={sidebarRef} className={`sidebar ${theme.className} ${isCollapsed ? "collapsed" : ""}`}>
            <button
                ref={buttonRef}
                className="sidebar-toggle-btn"
                onClick={toggleSidebar}
                onMouseDown={handleMouseDown}
                style={{ top: `${buttonPosition}%` }}
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                <FiChevronLeft />
            </button>

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