import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar";
import "./VpAcademicLayout.css";

export default function VpAcademicLayout() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className={`vp-academic-layout ${isCollapsed ? "collapsed" : ""}`}>
            <Sidebar
                role="vp_academic"
                userName="Phó Hiệu Trưởng"
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
            />
            <main className="vp-academic-layout__main">
                <div className="vp-academic-layout__content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
