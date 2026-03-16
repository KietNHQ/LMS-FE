import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar";
import "./StudentLayout.css";

export default function StudentLayout() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className={`student-layout ${isCollapsed ? "collapsed" : ""}`}>
            <Sidebar
                role="student"
                userName="Nguyễn Minh Tuấn"
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
            />

            <main className="student-layout__main">
                <div className="student-layout__content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}