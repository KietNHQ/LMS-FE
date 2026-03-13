import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { sidebarConfig } from "./sidebar.config";
import SidebarItem from "./SidebarItem";
import { FiChevronLeft, FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { FaGraduationCap } from "react-icons/fa";
import "./Sidebar.css";

export default function Sidebar({
                                  role = "student",
                                  userName = "User",
                                  userEmail,
                                  isCollapsed,
                                  setIsCollapsed
                                }) {
  const navigate = useNavigate();
  const location = useLocation();
  const items = sidebarConfig[role] || [];

  const mobileBreakpoint = 768;
  const [isMobile, setIsMobile] = useState(window.innerWidth <= mobileBreakpoint);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);

  const roleLabel = useMemo(() => {
    switch (role) {
      case "student":
        return "Học sinh";
      case "teacher":
        return "Giáo viên";
      case "parent":
        return "Phụ huynh";
      case "admin":
        return "Quản trị viên";
      default:
        return "Người dùng";
    }
  }, [role]);

  const displayEmail = useMemo(() => {
    if (userEmail) return userEmail;

    switch (role) {
      case "student":
        return "student@eduvn.edu.vn";
      case "teacher":
        return "teacher@eduvn.edu.vn";
      case "parent":
        return "parent@eduvn.edu.vn";
      case "admin":
        return "admin@eduvn.edu.vn";
      default:
        return "user@eduvn.edu.vn";
    }
  }, [role, userEmail]);

  const avatarLetter = useMemo(() => {
    const source = userName?.trim?.() || "U";
    return source.charAt(0).toUpperCase();
  }, [userName]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= mobileBreakpoint;
      setIsMobile(mobile);

      if (mobile) {
        setIsCollapsed(false);
      } else {
        setIsMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsCollapsed]);

  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY <= 16);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleToggle = () => {
    if (isMobile) {
      setIsMobileOpen((prev) => !prev);
      return;
    }

    setIsCollapsed(!isCollapsed);
  };

  const handleCloseMobileMenu = () => {
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  return (
      <>
        {isMobile && isMobileOpen && (
            <div
                className="sidebar-mobile-overlay"
                onClick={handleCloseMobileMenu}
            />
        )}

        <aside
            className={[
              "sidebar",
              `role-${role}`,
              isCollapsed ? "collapsed" : "",
              isMobile ? "mobile-mode" : "",
              isMobileOpen ? "mobile-open" : "",
              isMobile && isAtTop ? "mobile-at-top" : "",
              isMobile && !isAtTop ? "mobile-scrolled" : ""
            ].join(" ").trim()}
        >
          <button
              className="sidebar-toggle-btn"
              onClick={handleToggle}
              type="button"
              aria-label="Toggle sidebar"
          >
            {isMobile ? (isMobileOpen ? <FiX /> : <FiMenu />) : <FiChevronLeft />}
          </button>

          <div className="sidebar-top-section">
            <div className="sidebar-brand">
              <div className="sidebar-brand-badge">
                <FaGraduationCap />
              </div>

              <div className="sidebar-brand-text">
                <h2>EduVN</h2>
                <span>{roleLabel}</span>
              </div>
            </div>

            <div className="sidebar-mobile-expand-panel">
              <div className="sidebar-user-card sidebar-user-card-top sidebar-user-card-link">
                <div className="sidebar-user-avatar">{avatarLetter}</div>

                <div className="sidebar-user-info">
                  <p className="sidebar-user-name">{userName}</p>
                  <span className="sidebar-user-role">{displayEmail}</span>
                </div>
              </div>

              <div className="sidebar-menu-wrapper">
                <nav className="sidebar-nav">
                  {items.map((item, index) => (
                      <SidebarItem
                          key={`${item.path}-${index}`}
                          item={item}
                          onClick={handleCloseMobileMenu}
                      />
                  ))}
                </nav>
              </div>

              <div className="sidebar-footer">
                <button
                    className="sidebar-logout-btn"
                    onClick={handleLogout}
                    type="button"
                >
                  <FiLogOut />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          </div>

          {!isMobile && (
              <>
                <div className="sidebar-user-card sidebar-user-card-top sidebar-user-card-link">
                  <div className="sidebar-user-avatar">{avatarLetter}</div>

                  <div className="sidebar-user-info">
                    <p className="sidebar-user-name">{userName}</p>
                    <span className="sidebar-user-role">{displayEmail}</span>
                  </div>
                </div>

                <div className="sidebar-menu-wrapper">
                  <nav className="sidebar-nav">
                    {items.map((item, index) => (
                        <SidebarItem
                            key={`${item.path}-${index}`}
                            item={item}
                        />
                    ))}
                  </nav>
                </div>

                <div className="sidebar-footer">
                  <button
                      className="sidebar-logout-btn"
                      onClick={handleLogout}
                      type="button"
                  >
                    <FiLogOut />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </>
          )}
        </aside>
      </>
  );
}