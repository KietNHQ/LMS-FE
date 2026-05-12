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
    const [classData, setClassData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [actionDialog, setActionDialog] = useState({ open: false, mode: "officer" });

    const storedUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "{}");
    const teacherId = storedUser.profile?.id || storedUser.teacherId;

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

                        // 3. Lấy tổng hợp học tập của lớp
                        const academicRes = await teacherService.getAcademicSummary({
                            mock: false,
                            pathParams: { id: apiData.id }
                        });

                        const mappedData = {
                            ...homeroomData, 
                            id: apiData.id,
                            name: apiData.class_name,
                            room: apiData.room,
                            grade: apiData.grade_level_name,
                            year: apiData.school_year_name,
                            monitor: apiData.monitor,
                            viceMonitor: apiData.viceMonitor,
                            secretary: apiData.secretary,
                            extraOfficers: apiData.extraOfficers || [],
                            academicStats: academicRes.success ? academicRes.data.academicStats : apiData.academicStats,
                            tuitionStats: apiData.tuitionStats,
                            activities: apiData.activities || [],
                            students: (apiData.students || []).map(s => ({
                                id: s.id,
                                name: `${s.surname || ""} ${s.given_name || ""}`.trim() || "Chưa rõ tên",
                                avatar: null,
                                gender: s.gender === 'M' ? 'Nam' : 'Nữ',
                                dob: s.birth_date,
                                phone: s.phone || "N/A",
                                parentName: s.parent_name || "Chưa cập nhật",
                                parentPhone: s.parent_phone || "N/A",
                                officerRole: s.officer_role,
                                email: s.email,
                                academicStatus: s.academic_status,
                                conductStatus: s.conduct_status,
                                tuitionStatus: s.tuition_status
                            })),
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
            const dbRole = key === 'viceMonitor' ? 'vice_monitor_academic' : key;
            const student = classData.students.find((item) => item.officerRole === dbRole) || null;
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
        // Local update for immediate feedback, but real logic should call API
        return true; 
    };

    const handleAssignOfficer = (studentId, roleKey) => {
        // Individual assignment not supported by single API call yet
        toast.info("Vui lòng sử dụng nút 'Ban cán sự lớp' để phân công chính thức.");
        return false;
    };

    const openOfficerDialog = () => setActionDialog({ open: true, mode: "officer" });
    const openActivityDialog = () => setActionDialog({ open: true, mode: "activity" });
    const closeActionDialog = () => setActionDialog({ open: false, mode: "officer" });

    const handleSaveAction = async (payload) => {
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
            toast.success("Đã thêm hoạt động lớp (mock).");
        } else if (actionDialog.mode === "officer") {
            const assignments = payload.assignments || [];
            
            try {
                const officers = assignments
                    .filter(a => a.studentId) // Chỉ lấy những vị trí đã chọn người
                    .map(a => ({
                        studentId: a.studentId,
                        officerRole: a.key === 'monitor' ? 'monitor' : (a.key === 'viceMonitor' ? 'vice_monitor_academic' : 'secretary')
                    }));

                const res = await teacherService.assignOfficers({
                    mock: false,
                    pathParams: { id: classData.id },
                    body: { officers }
                });

                if (res.success) {
                    toast.success("Đã cập nhật ban cán sự lớp lên hệ thống.");
                    // Refresh data
                    window.location.reload(); 
                } else {
                    toast.error(res.error || "Không thể cập nhật ban cán sự.");
                }
            } catch (error) {
                console.error("Failed to assign officers:", error);
                toast.error("Lỗi kết nối máy chủ.");
            }
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
