import { NavLink } from "react-router-dom";
import "./SidebarItem.css";

export default function SidebarItem({ item, onAction, onClick }) {
  const Icon = item.icon;

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
        </span>

          <span className="sidebar-item-label">
          {item.label}
        </span>
        </div>
    );
  }

  return (
      <NavLink
          to={item.path}
          className={({ isActive }) =>
              `sidebar-item ${isActive ? "active" : ""}`
          }
          onClick={onClick}
      >
      <span className="sidebar-item-icon">
        <Icon />
      </span>

        <span className="sidebar-item-label">
        {item.label}
      </span>
      </NavLink>
  );
}