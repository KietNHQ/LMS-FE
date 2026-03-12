import { NavLink } from "react-router-dom";
import "./SidebarItem.css";

export default function SidebarItem({ item, onAction }) {
  const Icon = item.icon;

  // ITEM ACTION (profile)
  if (item.action) {
    return (
      <div
        className="sidebar-item"
        onClick={() => onAction(item.action)}
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

  // ITEM ROUTE
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `sidebar-item ${isActive ? "active" : ""}`
      }
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