import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar";
import "./VpDisciplineLayout.css";

export default function VpDisciplineLayout() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className={`vp-discipline-layout theme-vp_discipline ${isCollapsed ? "collapsed" : ""}`}>
            <Sidebar
                role="vp_discipline"
                userName="Phó Hiệu Trưởng"
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
            />
            <main className="vp-discipline-layout__main">
                <div className="vp-discipline-layout__content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
