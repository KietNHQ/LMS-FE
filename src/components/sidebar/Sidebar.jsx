import React, { useState } from "react";
import { sidebarConfig } from "./sidebar.config";
import SidebarItem from "./SidebarItem";
import StudentProfile from "../../pages/student/profile/StudentProfile";
import { FiChevronLeft, FiLogOut } from "react-icons/fi";

import "./Sidebar.css";

export default function Sidebar({
  role = "student",
  isCollapsed,
  setIsCollapsed
}) {

  const items = sidebarConfig[role] || [];
  const [showProfile, setShowProfile] = useState(false);

  const handleSidebarAction = (action) => {
    if (action === "profile") {
      setShowProfile(true);
    }
  };

  return (
    <>
      <aside className={`sidebar role-${role} ${isCollapsed ? "collapsed" : ""}`}>

        {/* TOGGLE */}
        <button
          className="sidebar-toggle-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <FiChevronLeft />
        </button>


        {/* TOP */}
        <div className="sidebar-top-section">

          {/* BRAND */}
          <div className="sidebar-brand">

            <div className="sidebar-brand-badge">
              🎓
            </div>

            <div className="sidebar-brand-text">
              <h2>EduVN</h2>
              <span>Học sinh</span>
            </div>

          </div>


          {/* USER */}
          <div
            className="sidebar-user-card sidebar-user-card-top sidebar-user-card-link"
            onClick={() => setShowProfile(true)}
          >

            <div className="sidebar-user-avatar">
              N
            </div>

            <div className="sidebar-user-info">
              <p className="sidebar-user-name">
                Nguyễn Minh Tuấn
              </p>

              <span className="sidebar-user-role">
                tuan.nguyen@student.edu.vn
              </span>
            </div>

          </div>

        </div>


        {/* MENU */}
        <div className="sidebar-menu-wrapper">

          <nav className="sidebar-nav">

            {items.map((item, index) => (
              <SidebarItem
                key={index}
                item={item}
                onAction={handleSidebarAction}
              />
            ))}

          </nav>

        </div>


        {/* FOOTER */}
        <div className="sidebar-footer">

          <button className="sidebar-logout-btn">

            <FiLogOut />

            <span>Đăng xuất</span>

          </button>

        </div>

      </aside>


      {/* PROFILE DIALOG */}
      {showProfile && (
        <StudentProfile
          onClose={() => setShowProfile(false)}
        />
      )}

    </>
  );
}