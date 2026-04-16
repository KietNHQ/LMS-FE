import React, { useState } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import HomeroomOverviewSection from "./components/homeroomOverviewSection/HomeroomOverviewSection";
import ClassStudentsSection from "../teachingClasses/components/classStudentsSection/ClassStudentsSection";
import HomeroomAttendanceSection from "./components/homeroomAttendanceSection/HomeroomAttendanceSection";
import HomeroomParentChatSection from "./components/homeroomParentChatSection/HomeroomParentChatSection";
import HomeroomActionDialog from "./components/homeroomActionDialog/HomeroomActionDialog";
import { homeroomData } from "./data/homeroomData";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { FiUsers, FiAward, FiCalendar } from "react-icons/fi";
import "./TeacherHomeroom.css";

export default function TeacherHomeroom() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [activeSection, setActiveSection] = useState("overview");
    const [hasUnreadMessages, setHasUnreadMessages] = useState(true); // Mock unread state
    const [classData, setClassData] = useState(() => ({
        ...homeroomData,
        extraOfficers: homeroomData.extraOfficers || [],
    }));
    const [actionDialog, setActionDialog] = useState({ open: false, mode: "officer" });

    const openOfficerDialog = () => setActionDialog({ open: true, mode: "officer" });
    const openActivityDialog = () => setActionDialog({ open: true, mode: "activity" });
    const closeActionDialog = () => setActionDialog({ open: false, mode: "officer" });

    const handleSaveAction = (payload) => {
        if (actionDialog.mode === "activity") {
            const nextActivity = {
                title: payload.title,
                type: payload.type,
                time: payload.time,
                location: payload.location,
                status: "upcoming",
                note: payload.note,
            };

            setClassData((prev) => ({
                ...prev,
                activities: [...(prev.activities || []), nextActivity],
            }));
        } else {
            const nextOfficer = {
                name: payload.name,
                role: payload.role,
                note: payload.note,
            };

            setClassData((prev) => ({
                ...prev,
                extraOfficers: [...(prev.extraOfficers || []), nextOfficer],
            }));
        }

        closeActionDialog();
    };

    // Handle clearing notifications when entering chat
    const handleSectionChange = (section) => {
        setActiveSection(section);
        if (section === "parent-chat") {
            setHasUnreadMessages(false);
            // Notify Sidebar to clear its dot
            const event = new CustomEvent("teacher-homeroom-read");
            window.dispatchEvent(event);
        }
    };

    return (
        <div className="teacher-homeroom-page">
            <PageHeader
                title={`Lớp chủ nhiệm: ${classData.name}`}
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
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
                    onClick={() => handleSectionChange("attendance")}
                >
                    Theo dõi chuyên cần
                </button>
                <button
                    type="button"
                    className={`section-switch-btn ${activeSection === "parent-chat" ? "active" : ""}`}
                    onClick={() => handleSectionChange("parent-chat")}
                >
                    Trò chuyện phụ huynh
                    {hasUnreadMessages && <span className="unread-dot-tab"></span>}
                </button>
            </div>

            <div className="homeroom-section-content">
                {activeSection === "overview" && (
                    <HomeroomOverviewSection
                        data={classData}
                        onAddOfficersClick={openOfficerDialog}
                        onCreateActivityClick={openActivityDialog}
                    />
                )}
                {activeSection === "students" && <ClassStudentsSection students={classData.students} />}
                {activeSection === "attendance" && <HomeroomAttendanceSection data={classData} />}
                {activeSection === "parent-chat" && <HomeroomParentChatSection data={classData} />}
            </div>

            <HomeroomActionDialog
                open={actionDialog.open}
                mode={actionDialog.mode}
                onClose={closeActionDialog}
                onSubmit={handleSaveAction}
            />
        </div>
    );
}



