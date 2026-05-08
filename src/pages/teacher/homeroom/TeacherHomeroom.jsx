import React, { useMemo, useState, useEffect } from "react";
import teacherService from "../../../services/pages/teacher/teacherService";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import HomeroomOverviewSection from "./components/homeroomOverviewSection/HomeroomOverviewSection";
import HomeroomStudentsSection from "./components/homeroomStudentsSection/HomeroomStudentsSection";
import HomeroomAttendanceSection from "./components/homeroomAttendanceSection/HomeroomAttendanceSection";
import HomeroomActionDialog from "./components/homeroomActionDialog/HomeroomActionDialog";
import { homeroomData } from "./data/homeroomData";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { FiUsers, FiAward, FiCalendar, FiInfo } from "react-icons/fi";
import { toast } from "react-toastify";
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
    const [classData, setClassData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [actionDialog, setActionDialog] = useState({ open: false, mode: "officer" });

    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const teacherId = storedUser.teacherId;

    useEffect(() => {
        const fetchHomeroom = async () => {
            if (!teacherId) return;
            setIsLoading(true);
            try {
                // 1. Lấy danh sách lớp chủ nhiệm
                const homeroomRes = await teacherService.getHomeroomClasses({ 
                    mock: false,
                    pathParams: { id: teacherId }
                });

                if (homeroomRes.success && homeroomRes.data && homeroomRes.data.length > 0) {
                    const firstClass = homeroomRes.data[0];
                    
                    // 2. Lấy chi tiết lớp đó (học sinh, môn học...)
                    const detailRes = await teacherService.getClassDetails({
                        mock: false,
                        pathParams: { id: firstClass.id }
                    });

                    if (detailRes.success && detailRes.data) {
                        const apiData = detailRes.data;
                        const mappedData = {
                            ...homeroomData, // Giữ lại các stats mock (học lực, học phí)
                            id: apiData.id,
                            name: apiData.class_name,
                            room: apiData.room,
                            students: (apiData.students || []).map(s => ({
                                id: s.id,
                                name: s.fullName || `${s.surname} ${s.givenName}`,
                                avatar: null,
                                gender: s.gender,
                                dob: s.birthDate,
                                phone: s.phone || "N/A",
                                officerRole: null, // Cần BE trả về role ban cán sự
                                academicStatus: "Khá", // Mock vì BE chưa có
                                conductStatus: "Tốt", // Mock vì BE chưa có
                                tuitionStatus: "paid" // Mock vì BE chưa có
                            })),
                            // Các thông tin khác tạm thời giữ mock từ homeroomData
                        };
                        setClassData(mappedData);
                    }
                } else {
                    setClassData(homeroomData);
                }
            } catch (error) {
                console.error("Failed to fetch homeroom data:", error);
                setClassData(homeroomData);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHomeroom();
    }, [teacherId]);

    const handleSectionChange = (section) => {
        setActiveSection(section);
    };

    const officerRows = useMemo(() => {
        if (!classData || !classData.students) return [];
        return Object.entries(officerRoleConfig).map(([key, config]) => {
            const student = classData.students.find((item) => item.officerRole === key) || null;
            return {
                key,
                label: config.label,
                field: config.field,
                studentId: student?.id || null,
                studentName: student?.name || classData[config.field] || "Chưa phân công",
            };
        });
    }, [classData]);

    if (isLoading) {
        return (
            <div className="teacher-homeroom-page">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Đang tải dữ liệu lớp chủ nhiệm...</p>
                </div>
            </div>
        );
    }

    if (!classData) {
        return (
            <div className="teacher-homeroom-page">
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <FiInfo size={48} />
                    </div>
                    <h3>Không tìm thấy thông tin</h3>
                    <p>Hiện tại bạn chưa được phân công chủ nhiệm lớp nào trong học kỳ này.</p>
                </div>
            </div>
        );
    }

    const handleUpdateStudent = (studentId, updates) => {
        let isSaved = false;

        setClassData((prev) => {
            const currentStudent = prev.students.find((student) => student.id === studentId);
            if (!currentStudent) return prev;

            const nextRoleKey = updates.officerRole ?? null;

            if (nextRoleKey && !officerRoleConfig[nextRoleKey]) {
                toast.error("Vai trò không hợp lệ.");
                return prev;
            }

            if (nextRoleKey) {
                const roleOwner = prev.students.find((student) => student.id !== studentId && student.officerRole === nextRoleKey);
                if (roleOwner) {
                    toast.error(`Vai trò ${officerRoleConfig[nextRoleKey].label} đã có ${roleOwner.name} đảm nhiệm.`);
                    return prev;
                }
            }

            const nextStudents = prev.students.map((student) => {
                if (student.id !== studentId) return student;
                const nextStudent = { ...student, ...updates, officerRole: nextRoleKey };
                return nextStudent;
            });

            const updatedStudent = nextStudents.find((student) => student.id === studentId);
            const nextClassData = {
                ...prev,
                students: nextStudents,
            };

            if (currentStudent.officerRole && officerRoleConfig[currentStudent.officerRole]) {
                nextClassData[officerRoleConfig[currentStudent.officerRole].field] = "Chưa phân công";
            }

            if (updatedStudent?.officerRole && officerRoleConfig[updatedStudent.officerRole]) {
                nextClassData[officerRoleConfig[updatedStudent.officerRole].field] = updatedStudent.name;
            }

            isSaved = true;

            return nextClassData;
        });

        return isSaved;
    };

    const handleAssignOfficer = (studentId, roleKey) => {
        const selectedRole = officerRoleConfig[roleKey];
        if (!selectedRole) return false;

        const currentStudent = classData.students.find((student) => student.id === studentId);
        if (!currentStudent) return false;

        if (currentStudent.officerRole && currentStudent.officerRole !== roleKey) {
            const currentRoleLabel = officerRoleConfig[currentStudent.officerRole]?.label || "vai trò khác";
            toast.error(`Học sinh này đã được phân công ${currentRoleLabel}.`);
            return false;
        }

        if (currentStudent.officerRole === roleKey) {
            toast.info(`Học sinh này đã giữ vai trò ${selectedRole.label}.`);
            return true;
        }

        const roleOwner = classData.students.find((student) => student.officerRole === roleKey);
        if (roleOwner && roleOwner.id !== studentId) {
            toast.error(`Vai trò ${selectedRole.label} đã có ${roleOwner.name} đảm nhiệm.`);
            return false;
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

        toast.success(`Đã phân công ${selectedRole.label} cho ${currentStudent.name}.`);
        return true;
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
        } else if (actionDialog.mode === "officer") {
            const assignments = payload.assignments || [];
            const extraRoles = payload.extraRoles || [];

            const chosenIds = new Set();
            for (const item of assignments) {
                if (!item.studentId) continue;
                if (chosenIds.has(item.studentId)) {
                    toast.error("Mỗi học sinh chỉ được giữ 1 vai trò.");
                    return;
                }
                chosenIds.add(item.studentId);
            }

            for (const item of extraRoles) {
                if (!item.studentId) continue;
                if (chosenIds.has(item.studentId)) {
                    toast.error("Mỗi học sinh chỉ được giữ 1 vai trò.");
                    return;
                }
                chosenIds.add(item.studentId);
            }

            setClassData((prev) => {
                const nextStudents = prev.students.map((student) => ({
                    ...student,
                    officerRole: null,
                }));

                const nextClassData = {
                    ...prev,
                    students: nextStudents,
                    extraOfficers: [],
                    monitor: "Chưa phân công",
                    viceMonitor: "Chưa phân công",
                    secretary: "Chưa phân công",
                };

                assignments.forEach((item) => {
                    if (!item.studentId) return;

                    const student = nextClassData.students.find((entry) => entry.id === item.studentId);
                    if (!student) return;

                    const roleConfig = officerRoleConfig[item.key];
                    if (!roleConfig) return;

                    student.officerRole = item.key;
                    nextClassData[roleConfig.field] = student.name;
                });

                nextClassData.extraOfficers = extraRoles
                    .map((item) => {
                        const student = prev.students.find((entry) => entry.id === item.studentId);
                        if (!student) return null;
                        return {
                            id: `${item.id || item.role}-${student.id}`,
                            name: student.name,
                            role: item.role,
                            studentId: student.id,
                            note: item.note || "",
                        };
                    })
                    .filter(Boolean);

                return nextClassData;
            });

            toast.success("Đã cập nhật ban cán sự lớp.");
        }

        closeActionDialog();
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
                        onBanCanSuLopClick={openOfficerDialog}
                    />
                )}
                {activeSection === "attendance" && <HomeroomAttendanceSection data={classData} />}
            </div>

            <HomeroomActionDialog
                key={`${actionDialog.mode}-${actionDialog.open ? "open" : "closed"}`}
                open={actionDialog.open}
                mode={actionDialog.mode}
                students={classData.students}
                officerRows={officerRows}
                extraOfficers={classData.extraOfficers || []}
                onClose={closeActionDialog}
                onSubmit={handleSaveAction}
            />
        </div>
    );
}




