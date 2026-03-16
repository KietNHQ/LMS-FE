import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { sidebarConfig } from "./sidebar.config";
import SidebarItem from "./SidebarItem";
import ProfileDialog from "../common/Dialog/ProfileDialog/ProfileDialog";
import { FiChevronLeft, FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { FaGraduationCap } from "react-icons/fa";
import "./Sidebar.css";

const MOBILE_BREAKPOINT = 768;

export default function Sidebar({
                                  role = "student",
                                  userName = "User",
                                  userEmail,
                                  isCollapsed,
                                  setIsCollapsed
                                }) {
  const navigate = useNavigate();
  const items = sidebarConfig[role] || [];

  const getIsMobile = () => window.innerWidth <= MOBILE_BREAKPOINT;
  const getIsAtTop = () => window.scrollY <= 16;

  const [isMobile, setIsMobile] = useState(getIsMobile);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAtTop, setIsAtTop] = useState(getIsAtTop);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

  const prevIsMobileRef = useRef(isMobile);

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
      const nextIsMobile = getIsMobile();
      const prevIsMobile = prevIsMobileRef.current;

      if (nextIsMobile !== prevIsMobile) {
        setIsMobile(nextIsMobile);

        if (nextIsMobile) {
          setIsCollapsed(false);
        } else {
          setIsMobileOpen(false);
        }

        prevIsMobileRef.current = nextIsMobile;
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsCollapsed]);

  useEffect(() => {
    const handleScroll = () => {
      const nextIsAtTop = getIsAtTop();
      setIsAtTop((prev) => (prev === nextIsAtTop ? prev : nextIsAtTop));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const handleOpenProfile = () => {
    setIsProfileDialogOpen(true);
  };

  const handleCloseProfile = () => {
    setIsProfileDialogOpen(false);
  };

  const profileData = useMemo(() => ({
    name: userName,
    email: displayEmail
  }), [userName, displayEmail]);

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
              <button
                type="button"
                className="sidebar-user-card sidebar-user-card-top sidebar-user-card-link"
                onClick={handleOpenProfile}
              >
                <div className="sidebar-user-avatar">{avatarLetter}</div>

                <div className="sidebar-user-info">
                  <p className="sidebar-user-name">{userName}</p>
                  <span className="sidebar-user-role">{displayEmail}</span>
                </div>
              </button>

              <div className="sidebar-menu-wrapper">
                <nav className="sidebar-nav">
                  {items.map((item, index) => (
                      <SidebarItem
                          key={`${item.path || item.label}-${index}`}
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
                <button
                  type="button"
                  className="sidebar-user-card sidebar-user-card-top sidebar-user-card-link"
                  onClick={handleOpenProfile}
                >
                  <div className="sidebar-user-avatar">{avatarLetter}</div>

                  <div className="sidebar-user-info">
                    <p className="sidebar-user-name">{userName}</p>
                    <span className="sidebar-user-role">{displayEmail}</span>
                  </div>
                </button>

                <div className="sidebar-menu-wrapper">
                  <nav className="sidebar-nav">
                    {items.map((item, index) => (
                        <SidebarItem
                            key={`${item.path || item.label}-${index}`}
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

        <ProfileDialog
          open={isProfileDialogOpen}
          role={role}
          profile={profileData}
          onClose={handleCloseProfile}
        />
      </>
  );
}