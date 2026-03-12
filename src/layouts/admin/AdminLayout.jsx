import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar";
import "./AdminLayout.css";

export default function AdminLayout() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className={`admin-layout ${isCollapsed ? "collapsed" : ""}`}>
            <Sidebar
                role="admin"
                userName="Admin User"
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
            />

            <main className="admin-layout__main">
                <div className="admin-layout__content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
