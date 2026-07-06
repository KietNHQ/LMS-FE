import { NavLink, useLocation } from "react-router-dom";
import "./SidebarItem.css";

export default function SidebarItem({ item, onAction, onClick, badgeCount = 0, allPaths = [] }) {
  const location = useLocation();
  const currentPathname = location.pathname;

  const isActive = (() => {
    if (!item.path) return false;
    if (currentPathname === item.path) return true;
    if (currentPathname.startsWith(item.path + "/")) {
      // Find if there is a more specific path configured that matches the current URL
      const hasMoreSpecificMatch = allPaths.some((p) => {
        if (p === item.path) return false;
        return currentPathname === p || currentPathname.startsWith(p + "/");
      });
      return !hasMoreSpecificMatch;
    }
    return false;
  })();

  const Icon = item.icon;
  // Xác định có phải là mục Thông Báo không
  const isNotification =
    item.path === "/admin/notifications" ||
    item.path === "/student/notifications" ||
    item.path === "/parent/notifications" ||
    item.path === "/teacher/notifications";

  if (item.action) {
    return (
      <div
        className="sidebar-item"
        onClick={() => {
          onAction?.(item.action);
          onClick?.();
        }}
      >
        <span className="sidebar-item-icon">
          <Icon />
          {badgeCount > 0 && (
            <span className="sidebar-item-badge">
              {badgeCount > 9 ? "9+" : badgeCount}
            </span>
          )}
        </span>
        <span className="sidebar-item-label">{item.label}</span>
      </div>
    );
  }

  return (
    <NavLink
      to={item.path}
      className={`sidebar-item ${isActive ? "active" : ""}`}
      onClick={onClick}
    >
      <span className="sidebar-item-icon">
        <Icon />
        {badgeCount > 0 && (
          <span className="sidebar-item-badge">
            {badgeCount > 9 ? "9+" : badgeCount}
          </span>
        )}
      </span>
      <span className="sidebar-item-label">{item.label}</span>
    </NavLink>
  );
}
