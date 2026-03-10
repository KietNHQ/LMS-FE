import { sidebarLayoutConfig } from "./SidebarLayoutConfig";
import SidebarItem from "./SidebarItem";
import "./Sidebar.css";

export default function Sidebar({ role }) {

  const config = sidebarLayoutConfig[role];

  return (
    <div className="sidebar">

      {/* header */}

      <div className="sidebar-header">
        <div className="logo-icon">
          E
        </div>

        <div className="logo-text">
          <div className="logo-title">EduVN</div>
          <div className="logo-role">{role}</div>
        </div>
      </div>

      {/* menu */}

      <div className="sidebar-menu">
        {config.menu.map((item) => (
          <SidebarItem key={item.name} item={item} />
        ))}
      </div>

      {/* footer */}

      <div className="sidebar-footer">
        <button className="logout-btn">
          Đăng xuất
        </button>
      </div>

    </div>
  );
}