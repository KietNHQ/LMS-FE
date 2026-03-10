import Sidebar from "./Sidebar";
import "./SidebarLayout.css";

export default function SidebarLayout({ role, children }) {
  return (
    <div className={`sidebar-layout layout-${role}`}>
      
      <Sidebar role={role} />

      <div className="sidebar-content">
        {children}
      </div>

    </div>
  );
}