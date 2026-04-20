import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar";
import "./PrincipalLayout.css";

export default function PrincipalLayout() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className={`principal-layout theme-principal ${isCollapsed ? "collapsed" : ""}`}>
            <Sidebar
                role="principal"
                userName="Hiệu Trưởng"
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
            />
            <main className="principal-layout__main">
                <div className="principal-layout__content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
