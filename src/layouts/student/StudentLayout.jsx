import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar.jsx";

export default function StudentLayout() {
    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f6f8fc" }}>
            <Sidebar role="student" userName="Student User" />
            <main style={{ flex: 1, padding: "24px" }}>
                <Outlet />
            </main>
        </div>
    );
}