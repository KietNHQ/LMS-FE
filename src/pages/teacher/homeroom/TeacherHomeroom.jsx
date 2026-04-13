import React, { useState } from "react";
import { PageHeader } from "../../../components/common";
import HomeroomOverviewSection from "./components/homeroomOverviewSection/HomeroomOverviewSection";
import ClassStudentsSection from "../teachingClasses/components/classStudentsSection/ClassStudentsSection";
import HomeroomAttendanceSection from "./components/homeroomAttendanceSection/HomeroomAttendanceSection";
import { homeroomData } from "./data/homeroomData";
import { FiUsers, FiAward, FiCalendar } from "react-icons/fi";
import "./TeacherHomeroom.css";

export default function TeacherHomeroom() {
    const [activeSection, setActiveSection] = useState("overview");
    const classData = homeroomData;

    return (
        <div className="teacher-homeroom-page">
            <PageHeader
                title={`Lớp chủ nhiệm: ${classData.name}`}
                eyebrow={`Khối ${classData.grade} • Năm học ${classData.year}`}
            />

            {/* Header info cards similar to admin dashboard */}
            <div className="homeroom-stats-grid">
                <div className="homeroom-stat-card">
                    <div className="stat-icon">
                        <FiUsers />
                    </div>
                    <div className="stat-info">
                        <h3>Sĩ số</h3>
                        <p>{classData.students.length} học sinh</p>
                    </div>
                </div>
                <div className="homeroom-stat-card">
                    <div className="stat-icon">
                        <FiAward />
                    </div>
                    <div className="stat-info">
                        <h3>Điểm thi đua</h3>
                        <p>Hạng 1 / 15</p>
                    </div>
                </div>
                <div className="homeroom-stat-card">
                    <div className="stat-icon">
                        <FiCalendar />
                    </div>
                    <div className="stat-info">
                        <h3>Lịch sinh hoạt</h3>
                        <p>Thứ 7, Tiết 5</p>
                    </div>
                </div>
            </div>

            <div className="homeroom-section-switch">
                <button
                    type="button"
                    className={`section-switch-btn ${activeSection === "overview" ? "active" : ""}`}
                    onClick={() => setActiveSection("overview")}
                >
                    Tổng quan
                </button>
                <button
                    type="button"
                    className={`section-switch-btn ${activeSection === "students" ? "active" : ""}`}
                    onClick={() => setActiveSection("students")}
                >
                    Danh sách học sinh
                </button>
                <button
                    type="button"
                    className={`section-switch-btn ${activeSection === "attendance" ? "active" : ""}`}
                    onClick={() => setActiveSection("attendance")}
                >
                    Theo dõi chuyên cần
                </button>
            </div>

            <div className="homeroom-section-content">
                {activeSection === "overview" && <HomeroomOverviewSection data={classData} />}
                {activeSection === "students" && <ClassStudentsSection students={classData.students} />}
                {activeSection === "attendance" && <HomeroomAttendanceSection data={classData} />}
            </div>
        </div>
    );
}



