import React from "react";
import HomeroomOverviewSection from "./components/homeroomOverviewSection/HomeroomOverviewSection";
import HomeroomStudentsSection from "./components/homeroomStudentsSection/HomeroomStudentsSection";
import HomeroomAttendanceSection from "./components/homeroomAttendanceSection/HomeroomAttendanceSection";
import "./TeacherHomeroom.css";

export default function TeacherHomeroom() {
    return (
        <div className="teacher-homeroom">
            <h1>Lớp chủ nhiệm</h1>
            <HomeroomOverviewSection />
            <HomeroomStudentsSection />
            <HomeroomAttendanceSection />
        </div>
    );
}

