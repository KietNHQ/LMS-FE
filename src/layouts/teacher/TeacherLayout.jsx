import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar";
import "./TeacherLayout.css";

export default function TeacherLayout() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className={`teacher-layout theme-teacher ${isCollapsed ? "collapsed" : ""}`}>
            <Sidebar
                role="teacher"
                userName="Lê Minh Hoàng"
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
            />

            <main className="teacher-layout__main">
                <div className="teacher-layout__content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

