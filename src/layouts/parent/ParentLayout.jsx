import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar";
import "./ParentLayout.css";

export default function ParentLayout() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className={`parent-layout ${isCollapsed ? "collapsed" : ""}`}>
            <Sidebar
                role="parent"
                userName="Parent User"
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
            />

            <main className="parent-layout__main">
                <div className="parent-layout__content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}