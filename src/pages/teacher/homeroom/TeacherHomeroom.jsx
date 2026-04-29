import React, { useMemo, useState } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import HomeroomOverviewSection from "./components/homeroomOverviewSection/HomeroomOverviewSection";
import HomeroomStudentsSection from "./components/homeroomStudentsSection/HomeroomStudentsSection";
import HomeroomAttendanceSection from "./components/homeroomAttendanceSection/HomeroomAttendanceSection";
import HomeroomActionDialog from "./components/homeroomActionDialog/HomeroomActionDialog";
import { homeroomData } from "./data/homeroomData";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { FiUsers, FiAward, FiCalendar } from "react-icons/fi";
import "./TeacherHomeroom.css";

const officerRoleConfig = {
    monitor: { label: "Lớp trưởng", field: "monitor" },
    viceMonitor: { label: "Phó học tập", field: "viceMonitor" },
    secretary: { label: "Bí thư", field: "secretary" },
};

export default function TeacherHomeroom() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [activeSection, setActiveSection] = useState("overview");
    const [hasUnreadMessages] = useState(true); // Mock unread state
    const [classData, setClassData] = useState(() => ({
        ...homeroomData,
        students: (homeroomData.students || []).map((student) => ({
            ...student,
            officerRole: student.officerRole || null,
        })),
        extraOfficers: homeroomData.extraOfficers || [],
    }));
    const [actionDialog, setActionDialog] = useState({ open: false, mode: "officer" });

    const officerRows = useMemo(() => (
        Object.entries(officerRoleConfig).map(([key, config]) => {
            const student = classData.students.find((item) => item.officerRole === key) || null;
            return {
                key,
                label: config.label,
                field: config.field,
                studentId: student?.id || null,
                studentName: student?.name || classData[config.field] || "Chưa phân công",
            };
        })
    ), [classData]);

    const handleUpdateStudent = (studentId, updates) => {
        setClassData((prev) => {
            const nextStudents = prev.students.map((student) => {
                if (student.id !== studentId) return student;
                const nextStudent = { ...student, ...updates };
                return nextStudent;
            });

            const updatedStudent = nextStudents.find((student) => student.id === studentId);
            const nextClassData = {
                ...prev,
                students: nextStudents,
            };

            if (updatedStudent?.officerRole && officerRoleConfig[updatedStudent.officerRole]) {
                nextClassData[officerRoleConfig[updatedStudent.officerRole].field] = updatedStudent.name;
            }

            return nextClassData;
        });
    };

    const handleAssignOfficer = (studentId, roleKey) => {
        const selectedRole = officerRoleConfig[roleKey];
        if (!selectedRole) return;

        const roleOwner = classData.students.find((student) => student.officerRole === roleKey);
        if (roleOwner && roleOwner.id !== studentId) {
            window.alert(`Vai trò ${selectedRole.label} đã có người nắm.`);
            return;
        }

        setClassData((prev) => {
            const nextStudents = prev.students.map((student) => {
                if (student.id === studentId) {
                    return { ...student, officerRole: roleKey };
                }

                if (student.officerRole === roleKey) {
                    return { ...student, officerRole: null };
                }

                return student;
            });

            const assignedStudent = nextStudents.find((student) => student.id === studentId);

            return {
                ...prev,
                students: nextStudents,
                [selectedRole.field]: assignedStudent?.name || prev[selectedRole.field],
            };
        });
    };

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

    // Handle clearing notifications
    const handleSectionChange = (section) => {
        setActiveSection(section);
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
            </div>

            <div className="homeroom-section-content">
                {activeSection === "overview" && (
                    <HomeroomOverviewSection
                        data={classData}
                        onAddOfficersClick={openOfficerDialog}
                        onCreateActivityClick={openActivityDialog}
                    />
                )}
                {activeSection === "students" && (
                    <HomeroomStudentsSection
                        students={classData.students}
                        officers={officerRows}
                        onUpdateStudent={handleUpdateStudent}
                        onAssignOfficer={handleAssignOfficer}
                    />
                )}
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



