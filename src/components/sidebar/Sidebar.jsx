import React, { useState } from "react";
import { sidebarConfig, roleTheme } from "./sidebar.config";
import "./Sidebar.css";
import SidebarItem from "./SidebarItem";
import { FiLogOut, FiChevronLeft } from "react-icons/fi";
import { useNavigate, NavLink } from "react-router-dom";

export default function Sidebar({
                                  role = "student",
                                  systemName = "LMS System",
                                  userName = "User Name",
                                  isCollapsed: controlledCollapsed,
                                  setIsCollapsed: setControlledCollapsed
                                }) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  const isControlled = typeof controlledCollapsed === "boolean";
  const isCollapsed = isControlled ? controlledCollapsed : internalCollapsed;

  const items = sidebarConfig[role] || sidebarConfig.student;
  const theme = roleTheme[role] || roleTheme.student;
  const navigate = useNavigate();

  const profileItem = items.find((item) => item.label === "Profile");
  const dashboardItem = items.find((item) => item.label === "Dashboard");
  const profilePath = profileItem?.path || dashboardItem?.path || `/${role}`;

  const handleLogout = () => {
    navigate("/login", { replace: true });
  };

  const toggleSidebar = () => {
    if (isControlled && typeof setControlledCollapsed === "function") {
      setControlledCollapsed((prev) => !prev);
      return;
    }
    setInternalCollapsed((prev) => !prev);
  };

  const menuItems = items.filter((item) => item.label !== "Profile");

  return (
      <aside
          className={`sidebar ${theme.className} ${isCollapsed ? "collapsed" : ""}`}
      >
        <button
            type="button"
            className="sidebar-toggle-btn"
            onClick={toggleSidebar}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <FiChevronLeft />
        </button>

        <div className="sidebar-top-section">
          <div className="sidebar-brand">
            <div className="sidebar-brand-badge">{theme.shortLabel}</div>

            <div className="sidebar-brand-text">
              <h2>{systemName}</h2>
              <span>{theme.label}</span>
            </div>
          </div>

          <NavLink
              to={profilePath}
              className={({ isActive }) =>
                  `sidebar-user-card sidebar-user-card-top sidebar-user-card-link ${
                      isActive ? "active" : ""
                  }`
              }
          >
            <div className="sidebar-user-avatar">{theme.shortLabel}</div>

            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{userName}</p>
              <span className="sidebar-user-role">{theme.label}</span>
            </div>
          </NavLink>
        </div>

        <div className="sidebar-menu-wrapper">
          <nav className="sidebar-nav">
            {menuItems.map((item) => (
                <SidebarItem
                    key={item.path}
                    item={item}
                    isCollapsed={isCollapsed}
                />
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          <button
              type="button"
              className="sidebar-logout-btn"
              onClick={handleLogout}
          >
            <FiLogOut />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
  );
}