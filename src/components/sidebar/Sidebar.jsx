import { useNavigate } from "react-router-dom";
import { sidebarConfig } from "./sidebar.config";
import SidebarItem from "./SidebarItem";
import { FiChevronLeft, FiLogOut } from "react-icons/fi";
import { FaGraduationCap } from "react-icons/fa";

import "./Sidebar.css";

export default function Sidebar({
  role = "student",
  isCollapsed,
  setIsCollapsed
}) {

  const navigate = useNavigate();
  const items = sidebarConfig[role] || [];

  const handleLogout = () => {
    // Xóa token từ localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Quay về trang login
    navigate("/login");
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
              <FaGraduationCap />
            </div>

            <div className="sidebar-brand-text">
              <h2>EduVN</h2>
              <span>Học tập</span>
            </div>

          </div>


          {/* USER */}
          <div
            className="sidebar-user-card sidebar-user-card-top sidebar-user-card-link"
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
              />
            ))}

          </nav>

        </div>


        {/* FOOTER */}
        <div className="sidebar-footer">

          <button className="sidebar-logout-btn" onClick={handleLogout}>

            <FiLogOut />

            <span>Đăng xuất</span>

          </button>

        </div>

      </aside>

    </>
  );
}