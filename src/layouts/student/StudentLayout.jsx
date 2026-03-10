import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar.jsx";

export default function StudentLayout() {
    return (
        <div style={{ minHeight: "100vh", background: "#d9dfe9" }}>
            <Sidebar role="student" userName="Student User" />
            <main style={{ marginLeft: "clamp(16rem, 20vw, 20rem)", padding: "24px", minHeight: "100vh" }}>
                <Outlet />
            </main>
        </div>
    );
}