import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar";
import "./AcademicStaffLayout.css";

export default function AcademicStaffLayout() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className={`academic-staff-layout ${isCollapsed ? "collapsed" : ""}`}>
            <Sidebar
                role="academic_staff"
                userName="Giáo Vụ"
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
            />
            <main className="academic-staff-layout__main">
                <div className="academic-staff-layout__content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
