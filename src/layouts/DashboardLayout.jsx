import Sidebar from "../components/sidebar/Sidebar";
import "./DashboardLayout.css";

export default function DashboardLayout({ role, children }) {
  return (
    <div className={`dashboard-layout layout-${role}`}>
      
      <Sidebar role={role} />

      <div className="dashboard-content">
        {children}
      </div>

    </div>
  );
}