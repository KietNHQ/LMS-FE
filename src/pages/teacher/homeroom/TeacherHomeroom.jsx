import React, { useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import teacherService from "../../../services/pages/teacher/teacherService";
import { gradeService } from "../../../services/pages/management/grades/gradeService";
import { resolveSemesterId } from "../../../services/shared/schoolYearLookup";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import HomeroomOverviewSection from "./components/homeroomOverviewSection/HomeroomOverviewSection";
import HomeroomStudentsSection from "./components/homeroomStudentsSection/HomeroomStudentsSection";
import HomeroomActionDialog from "./components/homeroomActionDialog/HomeroomActionDialog";
import HomeroomLeaveRequestsSection from "./components/homeroomLeaveRequestsSection/HomeroomLeaveRequestsSection";
import HomeroomConductSection from "./components/homeroomConductSection/HomeroomConductSection";
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
    const [hkSemesterIds, setHkSemesterIds] = useState({ hk1: null, hk2: null });
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
        } else if (tab === "conduct") {
            setActiveSection("conduct");
        }
    }, [location.search]);

    // Resolve HK1/HK2 semester IDs for conduct summary
    useEffect(() => {
        let cancelled = false;
        const resolve = async () => {
            const [hk1Id, hk2Id] = await Promise.all([
                resolveSemesterId(selectedSchoolYear, "hk1"),
                resolveSemesterId(selectedSchoolYear, "hk2"),
            ]);
            if (!cancelled) setHkSemesterIds({ hk1: hk1Id, hk2: hk2Id });
        };
        resolve();
        return () => { cancelled = true; };
    }, [selectedSchoolYear]);

    const storedUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "{}");
    const teacherId = storedUser.profile?.id || storedUser.teacherId;

    // Sử dụng TanStack Query cho dữ liệu lớp chủ nhiệm
    const { data: classData, isLoading, refetch } = useQuery({
        queryKey: ["teacher-homeroom", teacherId, selectedSchoolYear, selectedTerm],
        queryFn: async () => {
            if (!teacherId) return null;

            let classResData = null;

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
                    classResData = consolidatedRes.data;
                }
            } catch (e) {
                // Silently fallback to multiple calls if consolidated API is not ready
            }

            // Fallback: Gọi chuỗi API cũ
            if (!classResData) {
                const homeroomRes = await teacherService.getHomeroomClasses({
                    mock: false,
                    pathParams: { id: teacherId }
                });

                if (homeroomRes.success && homeroomRes.data && homeroomRes.data.length > 0) {
                    const firstClass = homeroomRes.data[0];
                    const detailRes = await teacherService.getClassDetails({ pathParams: { id: firstClass.id } });
                    if (detailRes.success && detailRes.data) {
                        classResData = detailRes.data;
                    }
                }
            }

            if (!classResData) return homeroomData;

            // Fetch actual grades for accurate academic stats
            let academicData = null;
            try {
                const semId = selectedTerm === 'hk1' 
                    ? await resolveSemesterId(selectedSchoolYear, "hk1") 
                    : await resolveSemesterId(selectedSchoolYear, "hk2");

                const gradesRes = await teacherService.getGradesByClass({ 
                    pathParams: { classId: classResData.id }, 
                    params: semId ? { semesterId: semId } : undefined 
                });

                if (gradesRes.success && gradesRes.data && classResData.students) {
                    const grades = gradesRes.data;
                    const students = classResData.students;
                    
                    const studentSubjectScores = {}; 
                    
                    grades.forEach(g => {
                        const eid = g.student_enrollment_id || g.enrollment_id;
                        const sid = g.subject_assignment_id || g.subject_name || "unknown";
                        if (!eid) return;
                        
                        if (!studentSubjectScores[eid]) studentSubjectScores[eid] = {};
                        if (!studentSubjectScores[eid][sid]) {
                            studentSubjectScores[eid][sid] = { regular: [], midterm: null, final: null };
                        }
                        
                        const normalizeText = (val) => String(val || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
                        
                        const catRaw = g.category_name || "";
                        const itemRaw = g.grade_item_name || g.name || "";
                        const cat = normalizeText(`${catRaw} ${itemRaw}`);
                        const score = g.score !== null && g.score !== "" ? Number(g.score) : null;
                        
                        if (score !== null && !isNaN(score)) {
                            if (cat.includes("giua ky") || cat.includes("midterm")) studentSubjectScores[eid][sid].midterm = score;
                            else if (cat.includes("cuoi ky") || cat.includes("final")) studentSubjectScores[eid][sid].final = score;
                            else studentSubjectScores[eid][sid].regular.push(score);
                        }
                    });

                    let excellent = 0, good = 0, average = 0, weak = 0;

                    students.forEach(s => {
                        const eid = s.enrollment_id || s.id;
                        const subjects = studentSubjectScores[eid] || {};
                        const subjectAverages = [];

                        Object.values(subjects).forEach(subj => {
                            const { regular, midterm, final } = subj;
                            const weightedSum = regular.reduce((a, b) => a + b, 0) + 
                                (midterm !== null ? midterm * 2 : 0) + 
                                (final !== null ? final * 3 : 0);
                            const denominator = regular.length + 
                                (midterm !== null ? 2 : 0) + 
                                (final !== null ? 3 : 0);
                            
                            if (denominator > 0) {
                                subjectAverages.push(weightedSum / denominator);
                            }
                        });

                        if (subjectAverages.length > 0) {
                            const gpa = subjectAverages.reduce((a, b) => a + b, 0) / subjectAverages.length;
                            if (gpa >= 8.0) excellent++;
                            else if (gpa >= 6.5) good++;
                            else if (gpa >= 5.0) average++;
                            else weak++;
                        }
                    });

                    academicData = { academicStats: { excellent, good, average, weak } };
                }
            } catch (err) {
                console.error("Failed to compute grades for academic stats:", err);
            }

            let teacherSubjectName = null;
            try {
                const subjectsRes = await teacherService.getTeacherSubjects({ pathParams: { id: teacherId } });
                if (subjectsRes.success && subjectsRes.data && subjectsRes.data.length > 0) {
                    const subj = subjectsRes.data.find(s => s.class_id === classResData.id);
                    if (subj && subj.subject_name) {
                        teacherSubjectName = subj.subject_name;
                    } else {
                        teacherSubjectName = subjectsRes.data[0].subject_name;
                    }
                }
            } catch (err) {
                console.error("Failed to fetch teacher subject:", err);
            }

            return mapApiDataToUI({ ...classResData, subject: teacherSubjectName }, academicData);
        },
        enabled: !!teacherId,
    });

    // Load conduct summary for homeroom class
    const { data: conductData, refetch: refetchConduct } = useQuery({
        queryKey: ["teacher-homeroom-conduct", classData?.id, selectedTerm, hkSemesterIds],
        queryFn: async () => {
            if (!classData?.id) return null;

            const students = classData.students || [];

            // Per-student classifySemester for the selected term
            const hk1Id = hkSemesterIds.hk1;
            const hk2Id = hkSemesterIds.hk2;

            // Determine which semester IDs to fetch based on term
            const semesterIdsToFetch = [];
            if (selectedTerm === "hk1" || selectedTerm === "all") {
                if (hk1Id) semesterIdsToFetch.push({ key: "hk1", id: hk1Id });
            }
            if (selectedTerm === "hk2" || selectedTerm === "all") {
                if (hk2Id) semesterIdsToFetch.push({ key: "hk2", id: hk2Id });
            }

            if (semesterIdsToFetch.length === 0) return null;

            const conductRows = await Promise.all(
                students.map(async (student) => {
                    const enrollmentId = String(student.id || student.enrollment_id || "");
                    if (!enrollmentId) return null;

                    const results = await Promise.all(
                        semesterIdsToFetch.map(async ({ key, id }) => {
                            try {
                                const res = await gradeService.classifySemester({ enrollmentId, semesterId: id });
                                return {
                                    key,
                                    level: res?.data?.conduct?.level || res?.description || null,
                                };
                            } catch {
                                return { key, level: null };
                            }
                        })
                    );

                    const row = {
                        enrollmentId,
                        studentName: student.full_name || student.name || "—",
                        studentCode: student.student_code || student.code || student.studentCode || "—",
                    };
                    for (const r of results) {
                        row[r.key + "Level"] = r.level;
                    }
                    // annualLevel = hk2Level when both are available
                    if (hk1Id && hk2Id) {
                        const hk1Res = results.find((r) => r.key === "hk1");
                        const hk2Res = results.find((r) => r.key === "hk2");
                        row.annualLevel = hk2Res?.level || hk1Res?.level || null;
                    } else if (hk2Id) {
                        const hk2Res = results.find((r) => r.key === "hk2");
                        row.annualLevel = hk2Res?.level || null;
                    } else {
                        const hk1Res = results.find((r) => r.key === "hk1");
                        row.annualLevel = hk1Res?.level || null;
                    }
                    return row;
                })
            );

            const validRows = conductRows.filter(Boolean);

            // Build stats
            const stats = { total: validRows.length };
            for (const key of ["hk1Levels", "hk2Levels", "annualLevels"]) {
                stats[key] = { "Tốt": 0, "Khá": 0, "Đạt": 0, "Chưa đạt": 0, null: 0 };
            }
            const levelKey = { Tốt: "Tốt", Khá: "Khá", Đạt: "Đạt", "Chưa đạt": "Chưa đạt" };
            for (const row of validRows) {
                const countStat = (map, level) => {
                    if (map[level] !== undefined) map[level]++;
                    else map.null++;
                };
                if (row.hk1Level) countStat(stats.hk1Levels, levelKey[row.hk1Level] || row.hk1Level);
                if (row.hk2Level) countStat(stats.hk2Levels, levelKey[row.hk2Level] || row.hk2Level);
                if (row.annualLevel) countStat(stats.annualLevels, levelKey[row.annualLevel] || row.annualLevel);
            }

            return { students: validRows, stats };
        },
        enabled: Boolean(classData?.id),
        staleTime: 60_000,
    });

    // Load teacher's own timetable for "Mốc tiết học" section
    const { data: teacherTimetableData } = useQuery({
        queryKey: ["teacher-timetable", teacherId, selectedSchoolYear, selectedTerm],
        queryFn: async () => {
            if (!teacherId) return null;
            try {
                const res = await teacherService.getTimetable({
                    params: { schoolYear: selectedSchoolYear, term: selectedTerm }
                });
                return res?.data || res || null;
            } catch {
                return null;
            }
        },
        enabled: !!teacherId,
        staleTime: 5 * 60_000,
    });

    const lessonMarkers = useMemo(() => {
        const lessons = teacherTimetableData?.lessons || teacherTimetableData || [];
        const markers = {};
        const dayLabels = { 2: "Thứ 2", 3: "Thứ 3", 4: "Thứ 4", 5: "Thứ 5", 6: "Thứ 6", 7: "Thứ 7" };
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        lessons.forEach((lesson) => {
            const dow = lesson.dayOfWeek;
            if (!dayLabels[dow]) return;

            // Find next occurrence of this day-of-week from today
            const nextDate = new Date(today);
            const diff = (dow - today.getDay() + 7) % 7 || 7;
            nextDate.setDate(today.getDate() + diff);

            const dateKey = nextDate.toISOString().split("T")[0];
            if (!markers[dateKey]) {
                markers[dateKey] = {
                    date: dateKey,
                    displayDate: `${String(nextDate.getDate()).padStart(2, "0")}/${String(nextDate.getMonth() + 1).padStart(2, "0")}`,
                    dayLabel: dayLabels[dow],
                    isToday: dateKey === today.toISOString().split("T")[0],
                    lessons: [],
                    count: 0,
                };
            }
            markers[dateKey].lessons.push({
                period: lesson.period,
                subjectName: lesson.subjectName,
                className: lesson.className,
                roomName: lesson.roomName,
                teacherName: lesson.teacherName,
            });
            markers[dateKey].count += 1;
        });

        // Sort by date and take next 14 days
        return Object.values(markers)
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(0, 14);
    }, [teacherTimetableData]);

    // Hàm mapping dữ liệu từ API sang cấu trúc UI
    const mapApiDataToUI = (apiData, academicData = null) => {
        return {
            ...homeroomData,
            id: apiData.id,
            name: apiData.class_name,
            room: apiData.room,
            grade: apiData.grade_level_name,
            year: apiData.school_year_name,
            subject: apiData.subject || null,
            disciplineScore: apiData.disciplineScore,
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
                        officerRole: a.role
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
                        <p>{classData.disciplineScore !== undefined && classData.disciplineScore !== null ? `${classData.disciplineScore} điểm` : "Chưa cập nhật"}</p>
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
                <button
                    type="button"
                    className={`section-switch-btn ${activeSection === "conduct" ? "active" : ""}`}
                    onClick={() => setActiveSection("conduct")}
                >
                    Hạnh kiểm
                </button>
            </div>

            <div className="homeroom-section-content">
                {activeSection === "overview" && (
                    <HomeroomOverviewSection
                        data={{
                            ...classData,
                            subject: classData.subject || teacherTimetableData?.lessons?.[0]?.subjectName || "Chưa cập nhật"
                        }}
                        lessonMarkers={lessonMarkers}
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
                {activeSection === "conduct" && (
                    <HomeroomConductSection
                        classId={classData.id}
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        conductData={conductData}
                        isLoading={false}
                    />
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
