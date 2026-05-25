import React, { useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import teacherService from "../../../services/pages/teacher/teacherService";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import HomeroomOverviewSection from "./components/homeroomOverviewSection/HomeroomOverviewSection";
import HomeroomStudentsSection from "./components/homeroomStudentsSection/HomeroomStudentsSection";
import HomeroomActionDialog from "./components/homeroomActionDialog/HomeroomActionDialog";
import HomeroomLeaveRequestsSection from "./components/homeroomLeaveRequestsSection/HomeroomLeaveRequestsSection";
import { homeroomData } from "./data/homeroomData";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { FiUsers, FiAward, FiCalendar, FiInfo } from "react-icons/fi";
import { toast } from "react-toastify";
import "./TeacherHomeroom.css";
import { formatName } from "../../../utils/nameUtils";


const officerRoleConfig = {
    monitor: { label: "Lớp trưởng", field: "monitor" },
    viceMonitor: { label: "Phó học tập", field: "viceMonitor" },
    secretary: { label: "Bí thư", field: "secretary" },
};

export default function TeacherHomeroom() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [activeSection, setActiveSection] = useState("overview");
    const [actionDialog, setActionDialog] = useState({ open: false, mode: "officer", editingData: null });
    const location = useLocation();

    // Xử lý chuyển tab từ URL params
    const [initialViewMode, setInitialViewMode] = useState("info");
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get("tab");
        const mode = params.get("mode");
        
        if (tab === "attendance") {
            setActiveSection("students");
            setInitialViewMode("attendance");
        } else if (tab === "students") {
            setActiveSection("students");
            if (mode) setInitialViewMode(mode);
        }
    }, [location.search]);

    const storedUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "{}");
    const teacherId = storedUser.profile?.id || storedUser.teacherId;

    // Sử dụng TanStack Query cho dữ liệu lớp chủ nhiệm
    const { data: classData, isLoading, refetch } = useQuery({
        queryKey: ["teacher-homeroom", teacherId, selectedSchoolYear, selectedTerm],
        queryFn: async () => {
            if (!teacherId) return null;

            try {
                // Thử gọi API Consolidated trước
                const consolidatedRes = await teacherService.getConsolidatedHomeroom({
                    pathParams: { id: teacherId },
                    params: { 
                        schoolYear: selectedSchoolYear,
                        term: selectedTerm 
                    }
                });
                if (consolidatedRes.success && consolidatedRes.data) {
                    return mapApiDataToUI(consolidatedRes.data);
                }
            } catch (e) {
                // Silently fallback to multiple calls if consolidated API is not ready
            }

            // Fallback: Gọi chuỗi API cũ
            const homeroomRes = await teacherService.getHomeroomClasses({
                mock: false,
                pathParams: { id: teacherId }
            });

            if (homeroomRes.success && homeroomRes.data && homeroomRes.data.length > 0) {
                const firstClass = homeroomRes.data[0];
                const [detailRes, academicRes] = await Promise.all([
                    teacherService.getClassDetails({ pathParams: { id: firstClass.id } }),
                    teacherService.getAcademicSummary({ pathParams: { id: firstClass.id } })
                ]);

                if (detailRes.success && detailRes.data) {
                    return mapApiDataToUI(detailRes.data, academicRes.success ? academicRes.data : null);
                }
            }

            return homeroomData;
        },
        enabled: !!teacherId,
    });

    // Hàm mapping dữ liệu từ API sang cấu trúc UI
    const mapApiDataToUI = (apiData, academicData = null) => {
        return {
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
            academicStats: academicData ? academicData.academicStats : apiData.academicStats,
            tuitionStats: apiData.tuitionStats,
            activities: (apiData.activities || []).map(act => {
                const actDate = act.activity_date ? new Date(act.activity_date) : null;
                const actTime = act.activity_time ? new Date(act.activity_time) : null;
                
                const schedule = actDate && !isNaN(actDate.getTime()) 
                    ? actDate.toISOString().split('T')[0] 
                    : "";
                
                let hour = "";
                if (actTime && !isNaN(actTime.getTime())) {
                    const h = String(actTime.getUTCHours()).padStart(2, '0');
                    const m = String(actTime.getUTCMinutes()).padStart(2, '0');
                    hour = `${h}:${m}`;
                } else if (typeof act.activity_time === 'string') {
                    const match = act.activity_time.match(/(\d{2}):(\d{2})/);
                    if (match) hour = `${match[1]}:${match[2]}`;
                }

                const displayDate = actDate && !isNaN(actDate.getTime())
                    ? `${String(actDate.getDate()).padStart(2, '0')}/${String(actDate.getMonth() + 1).padStart(2, '0')}/${actDate.getFullYear()}`
                    : "";
                const displayTime = hour ? `${hour} ngày ${displayDate}` : displayDate;

                return {
                    id: act.id,
                    title: act.title,
                    type: act.type,
                    schedule,
                    hour,
                    time: displayTime,
                    location: act.location,
                    note: act.description || "",
                    status: "upcoming"
                };
            }),
            students: (apiData.students || []).map(s => ({
                id: s.id,
                name: formatName(s),
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
                tuitionStatus: s.tuition_status,
                violationCount: s.violationCount ?? s.violation_count ?? 0,
                meritCount: s.meritCount ?? s.merit_count ?? 0,
                attendanceScore: (s.attendanceScore ?? s.attendance_score ?? 10.0).toString()
            })),
            classRank: apiData.class_rank || apiData.classRank || null,
            totalClasses: apiData.total_classes || apiData.totalClasses || null,
            homeroomSchedule: apiData.homeroom_schedule || apiData.homeroomSchedule || null,
        };
    };

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
        // Local update logic
        return true;
    };

    const handleAssignOfficer = (studentId, roleKey) => {
        toast.info("Vui lòng sử dụng nút 'Ban cán sự lớp' để phân công chính thức.");
        return false;
    };

    const openOfficerDialog = () => setActionDialog({ open: true, mode: "officer", editingData: null });
    const openActivityDialog = (activity = null) => setActionDialog({ open: true, mode: "activity", editingData: activity });
    const closeActionDialog = () => setActionDialog({ open: false, mode: "officer", editingData: null });

    const handleEditActivity = (activity) => {
        openActivityDialog(activity);
    };

    const handleDeleteActivity = async (activity) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa hoạt động "${activity.title}"?`)) {
            try {
                const res = await teacherService.deleteClassActivity({
                    pathParams: { id: classData.id, activityId: activity.id }
                });
                if (res.success) {
                    toast.success(`Đã xóa hoạt động: ${activity.title}`);
                    refetch();
                } else {
                    toast.error(res.error || "Không thể xóa hoạt động.");
                }
            } catch (error) {
                console.error("Failed to delete activity:", error);
                toast.error("Lỗi kết nối máy chủ khi xóa hoạt động.");
            }
        }
    };

    const handleSaveAction = async (payload) => {
        if (actionDialog.mode === "activity") {
            const isEdit = !!actionDialog.editingData;
            try {
                const body = {
                    title: payload.title,
                    description: payload.note,
                    activity_date: payload.schedule,
                    activity_time: payload.hour,
                    location: payload.location,
                    type: payload.type
                };

                let res;
                if (isEdit) {
                    res = await teacherService.updateClassActivity({
                        pathParams: { id: classData.id, activityId: actionDialog.editingData.id },
                        body
                    });
                } else {
                    res = await teacherService.createClassActivity({
                        pathParams: { id: classData.id },
                        body
                    });
                }

                if (res.success) {
                    toast.success(isEdit ? "Cập nhật hoạt động lớp thành công." : "Tạo hoạt động lớp mới thành công.");
                    refetch();
                } else {
                    toast.error(res.error || "Không thể lưu hoạt động lớp.");
                }
            } catch (error) {
                console.error("Failed to save activity:", error);
                toast.error("Lỗi kết nối máy chủ.");
            }
        } else if (actionDialog.mode === "officer") {
            const assignments = payload.assignments || [];
            try {
                const officers = assignments
                    .filter(a => a.studentId)
                    .map(a => ({
                        studentId: a.studentId,
                        officerRole: a.key === 'monitor' ? 'monitor' : (a.key === 'viceMonitor' ? 'vice_monitor_academic' : 'secretary')
                    }));

                const res = await teacherService.assignOfficers({
                    pathParams: { id: classData.id },
                    body: { officers }
                });

                if (res.success) {
                    toast.success("Đã cập nhật ban cán sự lớp thành công.");
                    refetch();
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
                        <p>{classData.students?.length || 0} học sinh</p>
                    </div>
                </div>
                <div className="homeroom-stat-card">
                    <div className="stat-icon">
                        <FiAward />
                    </div>
                    <div className="stat-info">
                        <h3>Điểm thi đua</h3>
                        <p>{classData.classRank ? `Hạng ${classData.classRank} / ${classData.totalClasses || "?"}` : "Chưa cập nhật"}</p>
                    </div>
                </div>
                <div className="homeroom-stat-card">
                    <div className="stat-icon">
                        <FiCalendar />
                    </div>
                    <div className="stat-info">
                        <h3>Lịch sinh hoạt</h3>
                        <p>{classData.homeroomSchedule || "Chưa cập nhật"}</p>
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
                    onClick={() => {
                        setActiveSection("students");
                        setInitialViewMode("info");
                    }}
                >
                    Danh sách học sinh
                </button>
                <button
                    type="button"
                    className={`section-switch-btn ${activeSection === "leave" ? "active" : ""}`}
                    onClick={() => setActiveSection("leave")}
                >
                    Đơn xin phép
                </button>
            </div>

            <div className="homeroom-section-content">
                {activeSection === "overview" && (
                    <HomeroomOverviewSection
                        data={classData}
                        onAddOfficersClick={openOfficerDialog}
                        onCreateActivityClick={() => openActivityDialog()}
                        onEditActivityClick={handleEditActivity}
                        onDeleteActivityClick={handleDeleteActivity}
                    />
                )}
                {activeSection === "students" && (
                    <HomeroomStudentsSection
                        students={classData.students}
                        officers={officerRows}
                        onBanCanSuLopClick={openOfficerDialog}
                        initialViewMode={initialViewMode}
                    />
                )}
                {activeSection === "leave" && (
                    <HomeroomLeaveRequestsSection classId={classData.id} />
                )}
            </div>

            <HomeroomActionDialog
                key={`${actionDialog.mode}-${actionDialog.open ? "open" : "closed"}`}
                open={actionDialog.open}
                mode={actionDialog.mode}
                editingData={actionDialog.editingData}
                students={classData.students}
                officerRows={officerRows}
                extraOfficers={classData.extraOfficers || []}
                onClose={closeActionDialog}
                onSubmit={handleSaveAction}
            />
        </div>
    );
}
