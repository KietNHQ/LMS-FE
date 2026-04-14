import React, { useMemo, useState } from "react";
import { PageHeader } from "../../../components/common";
import HomeroomOverviewSection from "./components/homeroomOverviewSection/HomeroomOverviewSection";
import ClassStudentsSection from "../teachingClasses/components/classStudentsSection/ClassStudentsSection";
import HomeroomAttendanceSection from "./components/homeroomAttendanceSection/HomeroomAttendanceSection";
import { homeroomData } from "./data/homeroomData";
import { FiUsers, FiAward, FiCalendar } from "react-icons/fi";
import HomeroomActionDialog from "./components/homeroomActionDialog/HomeroomActionDialog";
import "./TeacherHomeroom.css";

export default function TeacherHomeroom() {
    const [activeSection, setActiveSection] = useState("overview");
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

    const overviewData = useMemo(() => classData, [classData]);

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
                {activeSection === "overview" && (
                    <HomeroomOverviewSection
                        data={overviewData}
                        onAddOfficersClick={openOfficerDialog}
                        onCreateActivityClick={openActivityDialog}
                    />
                )}
                {activeSection === "students" && <ClassStudentsSection students={classData.students} />}
                {activeSection === "attendance" && <HomeroomAttendanceSection data={classData} />}
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



