import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../../../../services/shared/http/axiosClient";
import { PageHeader, SchoolYearTermSelector, Pagination, LoadingSpinner } from "../../../../components/common";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import { resolveSchoolYearId, resolveSemesterId } from "../../../../services/shared/schoolYearLookup";
import { classesService } from "../../../../services/pages/management/classes/classesService";
import { studentsService } from "../../../../services/pages/management/users/studentsService";
import { gradeService } from "../../../../services/pages/management/grades/gradeService";
import notificationService from "../../../../services/pages/management/notifications/notificationService";
import {
    FiClock, FiAlertCircle, FiLock,
    FiAlertTriangle, FiSearch,
    FiMail, FiBarChart2, FiTrendingUp, FiUsers, FiActivity, FiUserCheck, FiExternalLink,
    FiChevronLeft, FiChevronRight, FiUnlock, FiRefreshCw
} from "react-icons/fi";
import { toast } from "react-toastify";
import { Modal, Button, Select, Input } from "../../../../components/ui";
import {
    ResponsiveContainer, XAxis, YAxis,
    CartesianGrid, Tooltip, AreaChart, Area
} from "recharts";
import "./VpAcademicGrades.css";

// ── HELPERS ──────────────────────────────────────────────────────

const gradeColor = (avg) => {
  if (avg == null || avg === 0) return "missing";
  if (avg >= 8.0) return "excellent";
  if (avg >= 6.5) return "good";
  if (avg >= 5.0) return "normal";
  return "warning";
};

const scoreTrend = (sem1Avg, sem2Avg) => {
  if (sem1Avg == null || sem2Avg == null) return "0.0";
  const diff = sem2Avg - sem1Avg;
  return (diff >= 0 ? "+" : "") + diff.toFixed(1);
};

const toScore = (v) => (v != null ? parseFloat(parseFloat(v).toFixed(2)) : null);

const EMPTY_LOCK_STATUS = {
    status: "draft",
    totalGrades: 0,
    finalizedCount: 0,
    pendingCount: 0,
    draftCount: 0,
    finalizedGradeIds: [],
    byTeacher: [],
};

const unwrapApiData = (payload) => {
    if (payload && typeof payload === "object" && Object.prototype.hasOwnProperty.call(payload, "success") && Object.prototype.hasOwnProperty.call(payload, "data")) {
        return payload.data;
    }
    return payload;
};

const normalizeLockStatus = (payload) => {
    const data = unwrapApiData(payload) || {};
    return {
        ...EMPTY_LOCK_STATUS,
        ...data,
        status: data.status || EMPTY_LOCK_STATUS.status,
        totalGrades: Number(data.totalGrades || data.total_grades || 0),
        finalizedCount: Number(data.finalizedCount || data.finalized_count || 0),
        pendingCount: Number(data.pendingCount || data.pending_count || 0),
        draftCount: Number(data.draftCount || data.draft_count || 0),
        finalizedGradeIds: Array.isArray(data.finalizedGradeIds) ? data.finalizedGradeIds : [],
        byTeacher: Array.isArray(data.byTeacher) ? data.byTeacher : [],
    };
};

const getMutationData = (payload) => unwrapApiData(payload) || {};
const isMutationSuccess = (payload) => payload?.success !== false;

const mapWithConcurrency = async (items, limit, mapper) => {
    const results = new Array(items.length);
    let nextIndex = 0;

    const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
        while (nextIndex < items.length) {
            const currentIndex = nextIndex;
            nextIndex += 1;
            results[currentIndex] = await mapper(items[currentIndex], currentIndex);
        }
    });

    await Promise.all(workers);
    return results;
};

const getTermConduct = (reportCard, term) => {
    const conduct = reportCard?.conductClassification;
    const termConduct = term === "hk1" ? conduct?.semester1 : conduct?.semester2;
    return termConduct?.level || termConduct?.description || conduct?.level || conduct?.description || null;
};

const getStudentDisplayCode = (student = {}) =>
    student.studentCode || student.student_code || student.id || student.enrollmentId || "—";

const normalizeStudentReport = (student, reportCard, selectedTerm) => {
    const card = unwrapApiData(reportCard) || {};
    const hk1 = card?.grades?.semester1;
    const hk2 = card?.grades?.semester2;
    const hk1Gpa = toScore(card.hk1GPA ?? hk1?.gpa);
    const hk2Gpa = toScore(card.hk2GPA ?? hk2?.gpa);
    const yearGpa = toScore(card.yearGPA ?? card?.grades?.gpa ?? (hk1Gpa != null && hk2Gpa != null ? (hk1Gpa + 2 * hk2Gpa) / 3 : hk2Gpa ?? hk1Gpa));
    const currentGpa = selectedTerm === "hk1" ? hk1Gpa : hk2Gpa;

    return {
        id: getStudentDisplayCode(student),
        name: student.name || `${student.surname || ""} ${student.givenName || ""}`.trim() || "—",
        enrollmentId: student.enrollmentId || student.enrollment_id || student.id,
        avg: currentGpa,
        conduct: getTermConduct(card, selectedTerm),
        hk1Gpa,
        hk2Gpa,
        yearGpa,
        yearIsComplete: hk1Gpa != null && hk2Gpa != null,
        subjects: {
            hk1: Array.isArray(hk1?.results) ? hk1.results : [],
            hk2: Array.isArray(hk2?.results) ? hk2.results : [],
        },
    };
};

const buildSubjectPerformance = (studentRows, selectedTerm) => {
    const subjectMap = new Map();

    const addScore = (subjectName, termKey, score) => {
        if (!subjectName || score == null) return;
        if (!subjectMap.has(subjectName)) {
            subjectMap.set(subjectName, { hk1Sum: 0, hk1Count: 0, hk2Sum: 0, hk2Count: 0 });
        }
        const entry = subjectMap.get(subjectName);
        entry[`${termKey}Sum`] += Number(score);
        entry[`${termKey}Count`] += 1;
    };

    studentRows.forEach((student) => {
        ["hk1", "hk2"].forEach((termKey) => {
            (student.subjects?.[termKey] || []).forEach((result) => {
                if (result.isGradedByScore === false) return;
                addScore(result.subjectName, termKey, result.averageScore);
            });
        });
    });

    return Array.from(subjectMap.entries())
        .map(([sub, entry]) => {
            const hk1Avg = entry.hk1Count > 0 ? entry.hk1Sum / entry.hk1Count : null;
            const hk2Avg = entry.hk2Count > 0 ? entry.hk2Sum / entry.hk2Count : null;
            const avg = selectedTerm === "hk1" ? hk1Avg : hk2Avg;
            const diff = hk1Avg != null && hk2Avg != null ? hk2Avg - hk1Avg : 0;
            const trend = diff > 0.15 ? "up" : diff < -0.15 ? "down" : "stable";
            return { sub, avg: toScore(avg), status: gradeColor(avg), trend };
        })
        .sort((a, b) => (a.sub || "").localeCompare(b.sub || "", "vi"));
};

// ── CUSTOM COMPONENT ──────────────────────────────────────────────

export default function VpAcademicGrades() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange, setSelectedSchoolYear } = useSchoolYearTerm();
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [filterGrade, setFilterGrade] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [showAudit, setShowAudit] = useState(false);
    const [showAllSubjects, setShowAllSubjects] = useState(false);
    const [activeStudent, setActiveStudent] = useState(null);
    const [activeTableTab, setActiveTableTab] = useState("all");
    const [studentSearch, setStudentSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isRemindModalOpen, setIsRemindModalOpen] = useState(false);
    const [remindMessage, setRemindMessage] = useState('');
    const [remindTitle, setRemindTitle] = useState('');

    const [classesLoading, setClassesLoading] = useState(true);
    const [classDetailLoading, setClassDetailLoading] = useState(false);
    const [classDetailProgress, setClassDetailProgress] = useState({ loaded: 0, total: 0 });
    const [classDetail, setClassDetail] = useState(null); // { students, gpa, trend, subjectPerf, auditLogs, semester1Gpa }
    const [isSendingRemind, setIsSendingRemind] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [classLockStatus, setClassLockStatus] = useState("draft"); // draft | pending | finalized
    const [classLockStatusMap, setClassLockStatusMap] = useState({}); // classId -> status
    const [lockStatusMapLoading, setLockStatusMapLoading] = useState(false);
    const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [isLocking, setIsLocking] = useState(false);
    const [finalizedGradeIds, setFinalizedGradeIds] = useState([]);

    const itemsPerPage = 5;
    const queryClient = useQueryClient();
    const detailRequestRef = useRef(0);

    const { data: lockStatusData } = useQuery({
        queryKey: ["grade-lock-status", selectedClass?.id, selectedSchoolYear, selectedTerm],
        queryFn: async () => {
            if (!selectedClass?.id) return null;
            const semId = await resolveSemesterId(selectedSchoolYear, selectedTerm);
            if (!semId) return null;
            const res = await gradeService.getLockStatus({ classId: selectedClass.id, semesterId: semId });
            return res;
        },
        enabled: !!selectedClass?.id,
        staleTime: 15 * 1000,
    });

    const { data: schoolYearsData = [] } = useQuery({
        queryKey: ["school-years-dropdown"],
        queryFn: async () => {
            const res = await axiosClient.get("/school-years");
            const rows = res?.data ?? res?.items ?? [];
            return Array.isArray(rows) ? rows : [];
        },
        staleTime: 10 * 60 * 1000,
    });

    useEffect(() => {
        if (!lockStatusData) {
            setClassLockStatus("draft");
            setFinalizedGradeIds([]);
            return;
        }
        const d = normalizeLockStatus(lockStatusData);
        setClassLockStatus(d.status);
        setFinalizedGradeIds(d.finalizedGradeIds);
        if (selectedClass?.id) {
            setClassLockStatusMap(prev => ({ ...prev, [selectedClass.id]: d.status }));
        }
    }, [lockStatusData, selectedClass?.id]);

    const refreshSelectedLockStatus = useCallback(async () => {
        if (!selectedClass?.id) return EMPTY_LOCK_STATUS;
        const semId = await resolveSemesterId(selectedSchoolYear, selectedTerm);
        if (!semId) return EMPTY_LOCK_STATUS;
        const response = await gradeService.getLockStatus({ classId: selectedClass.id, semesterId: semId });
        const status = normalizeLockStatus(response);
        setClassLockStatus(status.status);
        setFinalizedGradeIds(status.finalizedGradeIds);
        setClassLockStatusMap(prev => ({ ...prev, [selectedClass.id]: status.status }));
        queryClient.setQueryData(["grade-lock-status", selectedClass.id, selectedSchoolYear, selectedTerm], status);
        return status;
    }, [queryClient, selectedClass?.id, selectedSchoolYear, selectedTerm]);

    // Batch unlock (VP uses unlockClassGrades API)
    const handleUnlockClassGrades = async () => {
        if (finalizedGradeIds.length === 0) { toast.info("Không có điểm nào đã chốt để mở khóa."); return; }
        const confirmed = window.confirm(`Mở khóa chỉnh sửa cho ${finalizedGradeIds.length} điểm đã chốt của lớp ${selectedClass?.name}?`);
        if (!confirmed) return;
        setIsUnlocking(true);
        try {
            const semId = await resolveSemesterId(selectedSchoolYear, selectedTerm);
            const res = await gradeService.unlockClassGrades(selectedClass.id, {
                semesterId: semId,
                notes: "VP mở khóa chỉnh sửa điểm",
            });
            const data = getMutationData(res);
            if (isMutationSuccess(res)) {
                toast.success(`Đã mở khóa ${data.unlockedCount || finalizedGradeIds.length} điểm!`);
                await refreshSelectedLockStatus();
                if (selectedClass) await loadClassDetail(selectedClass);
            } else {
                toast.error(res?.error || "Không thể mở khóa điểm.");
            }
            queryClient.invalidateQueries({ queryKey: ["grade-lock-status", selectedClass?.id] });
            setIsUnlockModalOpen(false);
        } catch (err) {
            console.error("Unlock error:", err);
            toast.error("Lỗi khi mở khóa điểm.");
        } finally {
            setIsUnlocking(false);
        }
    };

    // Khóa tất cả điểm PENDING trong lớp (VP gọi batch finalize)
    const handleLockAllClassGrades = async () => {
        const confirmed = window.confirm(
            `Chốt tất cả điểm đang chờ duyệt của lớp ${selectedClass?.name}?\nHành động này không thể hoàn tác.`
        );
        if (!confirmed) return;
        setIsLocking(true);
        try {
            const semId = await resolveSemesterId(selectedSchoolYear, selectedTerm);
            const res = await gradeService.finalizeClass(selectedClass.id, {
                semesterId: semId,
                notes: "VP chốt điểm lớp",
            });
            const data = getMutationData(res);
            if (isMutationSuccess(res)) {
                toast.success(`Đã chốt ${data.finalizedCount || 0} điểm!`);
                await refreshSelectedLockStatus();
                if (selectedClass) await loadClassDetail(selectedClass);
            } else {
                toast.error(res?.error || "Không thể chốt điểm.");
            }
            queryClient.invalidateQueries({ queryKey: ["grade-lock-status", selectedClass?.id] });
        } catch (err) {
            console.error("Lock error:", err);
            toast.error("Lỗi khi chốt điểm.");
        } finally {
            setIsLocking(false);
        }
    };

    // ── Load class list (sidebar) ─────────────────────────────────
    useEffect(() => {
        let cancelled = false;
        setClassesLoading(true);
        setClasses([]);
        setSelectedClass(null);
        setClassDetail(null);
        setClassLockStatusMap({});
        classesService.listClasses({ schoolYearName: selectedSchoolYear })
            .then(rows => {
                if (!cancelled) setClasses(rows);
            })
            .catch(() => toast.error("Không thể tải danh sách lớp"))
            .finally(() => { if (!cancelled) setClassesLoading(false); });
        return () => { cancelled = true; };
    }, [selectedSchoolYear]);

    useEffect(() => {
        if (classesLoading) return;
        if (classes.length === 0) {
            setSelectedClass(null);
            return;
        }

        const stillExists = selectedClass && classes.some((cls) => String(cls.id) === String(selectedClass.id));
        if (!stillExists) {
            setSelectedClass(classes[0]);
        }
    }, [classes, classesLoading, selectedClass?.id]);

    useEffect(() => {
        if (!classes.length) {
            setClassLockStatusMap({});
            return undefined;
        }

        let cancelled = false;
        const loadSidebarLockStatuses = async () => {
            setLockStatusMapLoading(true);
            try {
                const semId = await resolveSemesterId(selectedSchoolYear, selectedTerm);
                if (!semId) return;
                const entries = await mapWithConcurrency(classes, 6, async (cls) => {
                    try {
                        const response = await gradeService.getLockStatus({ classId: cls.id, semesterId: semId });
                        return [cls.id, normalizeLockStatus(response).status];
                    } catch {
                        return [cls.id, "draft"];
                    }
                });
                if (!cancelled) {
                    setClassLockStatusMap(Object.fromEntries(entries));
                }
            } finally {
                if (!cancelled) setLockStatusMapLoading(false);
            }
        };

        loadSidebarLockStatuses();
        return () => { cancelled = true; };
    }, [classes, selectedSchoolYear, selectedTerm]);

    // ── Load detail for selected class ─────────────────────────────
    const loadClassDetail = useCallback(async (cls) => {
        if (!cls?.id) return;
        const requestId = detailRequestRef.current + 1;
        detailRequestRef.current = requestId;
        setClassDetailLoading(true);
        setClassDetail(null);
        setClassDetailProgress({ loaded: 0, total: 0 });

        try {
            const [schoolYearId] = await Promise.all([
                resolveSchoolYearId(selectedSchoolYear),
            ]);
            const studentsRaw = await studentsService.getClassStudents(cls.id, { schoolYearId }).catch(() => []);
            const studentsArr = Array.isArray(studentsRaw) ? studentsRaw : [];

            if (requestId !== detailRequestRef.current) return;
            setClassDetailProgress({ loaded: 0, total: studentsArr.length });

            if (studentsArr.length === 0) {
                setClassDetail({
                    students: [],
                    gpa: null,
                    gpaCount: 0,
                    trend: "0.0",
                    subjectPerf: [],
                    semester1Gpa: null,
                });
                return;
            }

            const studentGpas = await mapWithConcurrency(studentsArr, 6, async (st) => {
                const enrollmentId = st.enrollmentId || st.enrollment_id || st.id;
                let reportCard = null;
                try {
                    reportCard = await gradeService.getReportCard(enrollmentId, { schoolYearId });
                } catch (err) {
                    console.warn("[VP Grades] Failed to load report card", { enrollmentId, err });
                } finally {
                    if (requestId === detailRequestRef.current) {
                        setClassDetailProgress((prev) => ({
                            ...prev,
                            loaded: Math.min(prev.loaded + 1, prev.total || studentsArr.length),
                            total: prev.total || studentsArr.length,
                        }));
                    }
                }

                return normalizeStudentReport(st, reportCard, selectedTerm);
            });

            if (requestId !== detailRequestRef.current) return;

            // Class GPA = average of student GPAs
            const gpaValues = studentGpas.map(s => s.avg).filter(v => v != null);
            const classGpa = gpaValues.length > 0
                ? toScore(gpaValues.reduce((a, b) => a + b, 0) / gpaValues.length)
                : null;

            // Trend: compare with other semester
            let trend = "0.0";
            const otherVals = studentGpas
                .map((s) => selectedTerm === "hk1" ? s.hk2Gpa : s.hk1Gpa)
                .filter(v => v != null);
            const otherGpa = otherVals.length > 0
                ? otherVals.reduce((a, b) => a + b, 0) / otherVals.length
                : null;
            if (otherGpa != null && classGpa != null) {
                trend = scoreTrend(otherGpa, classGpa);
            }

            const subjectPerf = buildSubjectPerformance(studentGpas, selectedTerm);

            setClassDetail({
                students: studentGpas,
                gpa: classGpa,
                gpaCount: gpaValues.length,
                trend,
                subjectPerf,
                semester1Gpa: null,
            });
        } catch (err) {
            if (requestId !== detailRequestRef.current) return;
            console.error("Failed to load class detail:", err);
            toast.error("Không thể tải chi tiết lớp");
        } finally {
            if (requestId === detailRequestRef.current) {
                setClassDetailLoading(false);
            }
        }
    }, [selectedSchoolYear, selectedTerm]);

    useEffect(() => {
        if (selectedClass) {
            loadClassDetail(selectedClass);
        }
    }, [selectedClass, loadClassDetail]);

    // Reset pagination when tab or class changes
    useEffect(() => { setCurrentPage(1); }, [activeTableTab, selectedClass, studentSearch]);

    // ── Derived data ────────────────────────────────────────────────
    const currentLockStats = normalizeLockStatus(lockStatusData);
    const filteredClasses = classes.filter(c => {
        const gradeNum = (c.grade || "").replace(/\D/g, "");
        const matchesGrade = filterGrade === "all" || gradeNum === filterGrade;
        const matchesSearch = (c.name || "").toLowerCase().includes(searchQuery.toLowerCase());
        return matchesGrade && matchesSearch;
    });

    const students = classDetail?.students || [];
    const tableFiltered = students.filter(s => {
        if (activeTableTab === "excellent") return s.avg != null && s.avg >= 8.0;
        if (activeTableTab === "warning") return s.avg != null && s.avg < 5.0;
        return true;
    }).filter(s => {
        if (!studentSearch) return true;
        return s.name.toLowerCase().includes(studentSearch.toLowerCase());
    });

    const totalPages = Math.ceil(tableFiltered.length / itemsPerPage);
    const paginatedData = tableFiltered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const excellentCount = students.filter(s => s.avg != null && s.avg >= 8.0).length;
    const warningCount = students.filter(s => s.avg != null && s.avg < 5.0).length;

    const upSubjects = (classDetail?.subjectPerf || []).filter(s => s.trend === "up");
    const downSubjects = (classDetail?.subjectPerf || []).filter(s => s.trend === "down");
    const summarySubjects = [...upSubjects.slice(0, 2), ...downSubjects.slice(0, 2)];
    const visibleSubjectMetrics = summarySubjects.length > 0
        ? summarySubjects
        : classDetail?.subjectPerf?.slice(0, 6) || [];

    // Class status derived from GPA progress
    const selectedClassWithDetail = selectedClass
        ? {
            ...selectedClass,
            gpa: classDetail?.gpa ?? selectedClass.gpa,
            trend: classDetail?.trend ?? selectedClass.trend,
            warnings: warningCount,
            warnMsg: warningCount > 0 ? `${warningCount} HS có điểm dưới 5.0` : undefined,
        }
        : null;

    // ── Handlers ────────────────────────────────────────────────────

    const handleOpenRemindModal = () => {
        if (!selectedClassWithDetail) return;
        const cls = selectedClassWithDetail;

        let title = `Nhắc nhở học vụ: Lớp ${cls.name}`;
        let message = `Kính gửi GVCN lớp ${cls.name},\n\n`;

        if (cls.warnings > 0) {
            title = `[Cảnh báo] Vấn đề chất lượng lớp ${cls.name}`;
            message += `Hệ thống ghi nhận lớp đang có vấn đề: ${cls.warnMsg}.\n\n`;
        }

        if (classDetail?.gpa == null) {
            message += `Lớp chưa có dữ liệu điểm số cho học kỳ hiện tại.\n\n`;
        } else {
            message += `Điểm trung bình lớp hiện tại: ${classDetail.gpa}/10.\n\n`;
        }

        message += `Đề nghị thầy/cô kiểm tra, đôn đốc các giáo viên bộ môn và xử lý kịp thời.\n\nTrân trọng,\nPhó Hiệu Trưởng Học Vụ`;

        setRemindTitle(title);
        setRemindMessage(message);
        setIsRemindModalOpen(true);
    };

    const handleSendRemind = async () => {
        if (!remindTitle.trim()) { toast.error("Vui lòng nhập tiêu đề"); return; }
        if (!remindMessage.trim()) { toast.error("Vui lòng nhập nội dung"); return; }
        setIsSendingRemind(true);
        try {
            await notificationService.createNotification({
                title: remindTitle,
                body: remindMessage,
                type: "reminder",
            });
            toast.success(`Đã gửi thông báo đến GVCN lớp ${selectedClass?.name}`);
            setIsRemindModalOpen(false);
        } catch (err) {
            toast.error("Không thể gửi thông báo");
        } finally {
            setIsSendingRemind(false);
        }
    };

    const handleOpenAudit = (student) => {
        setActiveStudent(student);
        setShowAudit(true);
    };

    const handleClassSelect = (cls) => {
        setSelectedClass(cls);
        setClassDetail(null);
    };

    const handleRefresh = async () => {
        if (!selectedClass) return;
        setIsRefreshing(true);
        try {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["grade-lock-status", selectedClass.id] }),
            ]);
            await loadClassDetail(selectedClass);
            toast.success("Đã làm mới dữ liệu");
        } catch (err) {
            toast.error("Không thể làm mới dữ liệu");
        } finally {
            setIsRefreshing(false);
        }
    };

    // ── Render ──────────────────────────────────────────────────────
    return (
        <div className="vpa-grades-cockpit">
        <div className="vpa-academic-layout">
            <PageHeader
                title="Giám sát Điểm số & Chất lượng"
                eyebrow="Hệ thống phân tích học vụ và kiểm soát chất lượng đào tạo"
                actions={
                    <div className="vpa-school-year-header">
                        <select
                            className="vpa-school-year-dropdown"
                            value={selectedSchoolYear}
                            onChange={(e) => {
                                const sy = e.target.value;
                                setSelectedSchoolYear(sy);
                            }}
                        >
                            {schoolYearsData.map((sy) => {
                                const label = sy.name || sy.school_year_name || sy.schoolYearName || String(sy);
                                return (
                                    <option key={sy.id || label} value={label}>
                                        {label}
                                    </option>
                                );
                            })}
                        </select>
                        <SchoolYearTermSelector
                            selectedSchoolYear={selectedSchoolYear}
                            selectedTerm={selectedTerm}
                            onYearChange={handleYearArrow}
                            onTermChange={handleTermChange}
                        />
                    </div>
                }
            />

            <div className={`vpa-grades-grid ${!isSidebarOpen ? 'sidebar-closed' : ''}`}>
                {!isSidebarOpen && (
                    <button className="btn-floating-toggle" onClick={() => setIsSidebarOpen(true)} title="Mở danh sách lớp">
                        <FiChevronRight className="toggle-icon" />
                    </button>
                )}

                {/* ── SIDEBAR ── */}
                <aside className="vpa-grades-sidebar">
                    <div className="sidebar-toolbar">
                        <div className="sidebar-toggle-row">
                            <h3 className="sidebar-title">Danh sách lớp</h3>
                            <button className="btn-toggle-sidebar" onClick={() => setIsSidebarOpen(false)}>
                                <FiChevronLeft />
                            </button>
                        </div>
                        <div className="vpa-search-box">
                            <FiSearch />
                            <input
                                type="text"
                                placeholder="Tìm lớp (VD: 10A1)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="vpa-sidebar-select">
                            <Select
                                variant="custom"
                                value={filterGrade}
                                onChange={(e) => setFilterGrade(e.target.value)}
                                options={[
                                    { value: 'all', label: 'Tất cả khối' },
                                    { value: '10', label: 'Khối 10' },
                                    { value: '11', label: 'Khối 11' },
                                    { value: '12', label: 'Khối 12' },
                                ]}
                                placeholder="Chọn khối lớp"
                            />
                        </div>
                    </div>

                    <div className="sidebar-list custom-scrollbar">
                        {classesLoading ? (
                            <div style={{ padding: "1rem", textAlign: "center", color: "var(--admin-text-muted)" }}>
                                Đang tải...
                            </div>
                        ) : filteredClasses.length === 0 ? (
                            <div style={{ padding: "1rem", textAlign: "center", color: "var(--admin-text-muted)" }}>
                                Không tìm thấy lớp nào
                            </div>
                        ) : (
                            filteredClasses.map(cls => {
                                const lockStatus = classLockStatusMap[cls.id] || (lockStatusMapLoading ? "checking" : "draft");
                                const lockLabel = lockStatus === "finalized" ? "Đã chốt"
                                    : lockStatus === "pending" ? "Chờ duyệt"
                                    : lockStatus === "mixed" ? "Trộn lẫn"
                                    : lockStatus === "checking" ? "Đang kiểm tra"
                                    : "Bản nháp";
                                return (
                                    <div
                                        key={cls.id}
                                        className={`vpa-class-card ${selectedClass?.id === cls.id ? 'active' : ''} ${lockStatus}`}
                                        onClick={() => handleClassSelect(cls)}
                                    >
                                        <div className="card-main">
                                            <div className="card-icon-hex">
                                                <span>{cls.name}</span>
                                            </div>
                                            <div className="card-info">
                                                <div className="info-top">
                                                    <strong>{cls.name}</strong>
                                                    <span className="student-tag">{cls.students || 0} HS</span>
                                                </div>
                                                <div className="info-status">
                                                    {lockStatus === "finalized" && <FiLock />}
                                                    {lockStatus === "pending" && <FiClock />}
                                                    {lockStatus === "mixed" && <FiAlertTriangle />}
                                                    {lockStatus === "checking" && <FiRefreshCw className="spin" />}
                                                    {lockStatus === "draft" && <FiActivity />}
                                                    <span>{lockLabel}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {lockStatus === "finalized" && (
                                            <div className="card-alert-strip card-alert-strip--finalized">
                                                <div className="pulse-dot pulse-dot--locked"></div>
                                                <span>Đã chốt điểm</span>
                                            </div>
                                        )}
                                        {cls.warnings > 0 && (
                                            <div className="card-alert-strip">
                                                <div className="pulse-dot"></div>
                                                <span>{cls.warnings} HS cần cải thiện</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </aside>

                {/* ── MAIN ── */}
                <main className="vpa-grades-main">
                    {!selectedClassWithDetail ? (
                        <div className="vpa-empty-state">
                            <div className="empty-glow-icon">
                                <FiBarChart2 />
                            </div>
                            <h3>Phòng Điều Hành Học Vụ</h3>
                            <p>Vui lòng chọn một lớp học từ danh sách bên trái để bắt đầu phân tích chất lượng điểm số và tiến độ nhập liệu.</p>
                        </div>
                    ) : classDetailLoading ? (
                        <div className="layout-loading-wrapper">
                            <LoadingSpinner size="lg" label="Đang đồng bộ dữ liệu học vụ..." role="admin" />
                            {classDetailProgress.total > 0 && (
                                <div className="vpa-loading-progress">
                                    Đã tải {classDetailProgress.loaded}/{classDetailProgress.total} học bạ
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="vpa-analytics-container animate-fade-in">
                            {/* Header Bar */}
                            <div className="vpa-analytics-header">
                                <div className="ah-left">
                                    <div className="class-title-large">
                                        <h2>Chi tiết Học vụ: Lớp {selectedClassWithDetail.name}</h2>
                                        <span className={`status-badge ${classLockStatus === "finalized" ? "locked" : classLockStatus === "pending" || classLockStatus === "mixed" ? "pending" : classLockStatus === "draft" ? "progress" : "missing"}`}>
                                            {classLockStatus === "finalized" ? "Đã chốt"
                                                : classLockStatus === "pending" ? "Chờ duyệt"
                                                : classLockStatus === "mixed" ? "Trộn lẫn"
                                                : classLockStatus === "draft" ? "Bản nháp"
                                                : "Chưa rõ"}
                                        </span>
                                    </div>
                                </div>

                                <div className="ah-center">
                                    {selectedClassWithDetail.teacher && selectedClassWithDetail.teacher !== "Chưa phân công" && (
                                        <div className="gvcn-highlight">
                                            <div className="gvcn-icon"><FiUserCheck /></div>
                                            <div className="gvcn-text">
                                                <span>GIÁO VIÊN CHỦ NHIỆM</span>
                                                <strong>{selectedClassWithDetail.teacher}</strong>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="ah-right">
                                    <button
                                        className="vpa-btn-icon"
                                        onClick={handleRefresh}
                                        disabled={isRefreshing || !selectedClass}
                                        title="Làm mới dữ liệu"
                                    >
                                        <FiRefreshCw className={isRefreshing ? "spin" : ""} />
                                        {isRefreshing ? "Đang tải..." : "Làm mới"}
                                    </button>
                                    <span className={`vpa-lock-status-badge ${classLockStatus === "finalized" ? "badge-finalized" : classLockStatus === "pending" || classLockStatus === "mixed" ? "badge-pending" : "badge-draft"}`}>
                                        {classLockStatus === "finalized" ? "Điểm đã khóa"
                                            : classLockStatus === "pending" ? "Đang chờ khóa"
                                            : classLockStatus === "mixed" ? "Có điểm nháp/chờ duyệt/đã khóa"
                                            : "Điểm đang ở chế độ nháp"}
                                    </span>
                                    {currentLockStats.finalizedCount > 0 && (
                                        <button className="vpa-btn-unlock" onClick={() => setIsUnlockModalOpen(true)}>
                                            <FiUnlock /> Mở khóa ({currentLockStats.finalizedCount})
                                        </button>
                                    )}
                                    {currentLockStats.pendingCount > 0 && (
                                        <button className="vpa-btn-lock" onClick={handleLockAllClassGrades} disabled={isLocking}>
                                            <FiLock /> {isLocking ? "Đang chốt..." : `Khóa điểm (${currentLockStats.pendingCount})`}
                                        </button>
                                    )}
                                    <Button variant="outline" className="vpa-btn-icon" onClick={handleOpenRemindModal}><FiMail /> Nhắc GV</Button>
                                </div>
                            </div>

                            <div className="vpa-header-footer">
                                <p className="ah-meta">
                                    {selectedTerm === "hk1" ? "Học kỳ 1" : "Học kỳ 2"} · Năm học {selectedSchoolYear}
                                    {classDetail?.gpaCount != null && ` · ${classDetail.gpaCount} HS đã có điểm`}
                                </p>
                            </div>

                            {/* KPI Grid */}
                            <div className="vpa-kpi-grid">
                                <div className="vpa-kpi-card">
                                    <div className="kpi-icon navy"><FiTrendingUp /></div>
                                    <div className="kpi-data">
                                        <span className="kpi-label">GPA {selectedTerm === "hk1" ? "Học kỳ 1" : "Học kỳ 2"}</span>
                                        <div className="kpi-value-row">
                                            <h3>{classDetail?.gpa ?? "—"}</h3>
                                            {classDetail?.gpa != null && (
                                                <span className={`kpi-trend ${selectedClassWithDetail.trend.startsWith('+') ? 'up' : 'down'}`}>
                                                    {selectedClassWithDetail.trend}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="vpa-kpi-card">
                                    <div className="kpi-icon blue"><FiActivity /></div>
                                    <div className="kpi-data">
                                        <span className="kpi-label">Học Sinh Đã Chấm</span>
                                        <h3>{classDetail?.gpaCount ?? 0} <small>/ {students.length} HS</small></h3>
                                    </div>
                                </div>
                                <div className="vpa-kpi-card">
                                    <div className="kpi-icon amber"><FiAlertTriangle /></div>
                                    <div className="kpi-data">
                                        <span className="kpi-label">Cảnh Báo Chất Lượng</span>
                                        <h3>{warningCount} <small>vấn đề</small></h3>
                                    </div>
                                </div>
                                <div className="vpa-kpi-card">
                                    <div className="kpi-icon purple"><FiUsers /></div>
                                    <div className="kpi-data">
                                        <span className="kpi-label">Số Lượng Học Sinh</span>
                                        <h3>{students.length} <small>học sinh</small></h3>
                                    </div>
                                </div>
                            </div>

                            {/* Charts Row */}
                            <div className="vpa-charts-row">
                                <div className="vpa-chart-box trend-box">
                                    <div className="box-header">
                                        <h4>Điểm trung bình lớp</h4>
                                        <span className="box-tag">{selectedTerm === "hk1" ? "Học kỳ 1" : "Học kỳ 2"}</span>
                                    </div>
                                    <div className="chart-container">
                                        {students.length > 0 ? (
                                            <ResponsiveContainer width="100%" height={220}>
                                                <AreaChart data={students.map((s, i) => ({ name: s.name?.split(" ").pop() || i + 1, gpa: s.avg }))}>
                                                    <defs>
                                                        <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="var(--admin-primary)" stopOpacity={0.3}/>
                                                            <stop offset="95%" stopColor="var(--admin-primary)" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                                    <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                                    <Tooltip />
                                                    <Area type="monotone" dataKey="gpa" stroke="var(--admin-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorGpa)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div style={{ textAlign: "center", color: "var(--admin-text-muted)", padding: "2rem" }}>Chưa có dữ liệu điểm</div>
                                        )}
                                    </div>
                                </div>

                                <div className="vpa-chart-box metrics-box">
                                    <div className="box-header">
                                        <h4>Hiệu năng theo Môn học</h4>
                                        <div className="box-actions">
                                            <button
                                                className="vpa-btn-detail"
                                                title="Xem báo cáo chi tiết"
                                                onClick={() => setShowAllSubjects(true)}
                                            >
                                                <span>Xem chi tiết</span>
                                                <div className="vpa-icon-circle"><FiExternalLink /></div>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="metrics-grid custom-scrollbar">
                                        {visibleSubjectMetrics.length > 0 ? (
                                            visibleSubjectMetrics.map((s, i) => (
                                                <div key={i} className={`metric-item ${s.status}`}>
                                                    <div className="m-left">
                                                        <span className="m-sub">{s.sub}</span>
                                                        <span className="m-avg">{s.avg ?? "—"}</span>
                                                    </div>
                                                    <div className={`m-trend ${s.trend}`}>
                                                        {s.trend === "up" ? "▲" : s.trend === "down" ? "▼" : "●"}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div style={{ color: "var(--admin-text-muted)", fontSize: "0.8rem", padding: "1rem" }}>Chưa có dữ liệu môn học</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Student Table */}
                            <div className="vpa-table-section shadow-premium">
                                <div className="section-header">
                                    <div className="sh-left">
                                        <div className="vpa-header-select">
                                            <Select
                                                variant="custom"
                                                value={activeTableTab}
                                                onChange={(e) => setActiveTableTab(e.target.value)}
                                                options={[
                                                    { value: 'all', label: `Tất cả học sinh (${students.length})` },
                                                    { value: 'excellent', label: `Học sinh Giỏi (${excellentCount})` },
                                                    { value: 'warning', label: `Cần lưu ý (${warningCount})` }
                                                ]}
                                            />
                                        </div>
                                        <div className="sh-search">
                                            <FiSearch />
                                            <input
                                                type="text"
                                                placeholder="Tìm tên học sinh..."
                                                value={studentSearch}
                                                onChange={(e) => setStudentSearch(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="vpa-table-scroll custom-scrollbar">
                                    <table className="vpa-premium-table">
                                        <thead>
                                            <tr>
                                                <th>Học sinh</th>
                                                <th>HK1</th>
                                                <th>HK2</th>
                                                <th>TB Cả năm</th>
                                                <th>Hạnh kiểm</th>
                                                <th>Audit</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedData.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} style={{ textAlign: "center", color: "var(--admin-text-muted)", padding: "2rem" }}>
                                                        Không có học sinh nào phù hợp
                                                    </td>
                                                </tr>
                                            ) : (
                                                paginatedData.map((s, i) => (
                                                    <tr key={s.enrollmentId || i}>
                                                        <td className="td-student">
                                                            <div className="st-info">
                                                                <strong>{s.name}</strong>
                                                                <span>{s.id}</span>
                                                            </div>
                                                        </td>
                                                        <td className={`sc-cell ${s.hk1Gpa != null && s.hk1Gpa < 5 ? 'danger' : ''}`}>
                                                            {s.hk1Gpa != null ? s.hk1Gpa : "—"}
                                                        </td>
                                                        <td className={`sc-cell ${s.hk2Gpa != null && s.hk2Gpa < 5 ? 'danger' : ''}`}>
                                                            {s.hk2Gpa != null ? s.hk2Gpa : "—"}
                                                        </td>
                                                        <td className={`sc-cell ${s.yearGpa != null && s.yearGpa < 5 ? 'danger' : ''}`}>
                                                            {s.yearGpa != null ? (
                                                                <>
                                                                    {s.yearGpa}
                                                                    {!s.yearIsComplete && <small className="gpa-provisional">(Tạm tính)</small>}
                                                                </>
                                                            ) : "—"}
                                                        </td>
                                                        <td className="td-conduct">
                                                            {s.conduct
                                                                ? <span className="conduct-tag">{s.conduct}</span>
                                                                : <span style={{ color: "var(--admin-text-muted)", fontSize: "0.8rem" }}>—</span>}
                                                        </td>
                                                        <td className="td-action">
                                                            <button
                                                                className="btn-audit-vpa"
                                                                title="Xem lịch sử chỉnh sửa"
                                                                onClick={() => handleOpenAudit(s)}
                                                            >
                                                                <FiClock />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {totalPages > 1 && (
                                    <div className="vpa-table-footer">
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={setCurrentPage}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>

            {/* ── Audit Modal ── */}
            <Modal
                open={showAudit}
                onClose={() => setShowAudit(false)}
                title={`Nhật ký sửa điểm - ${activeStudent?.name}`}
                maxWidth="600px"
            >
                <div className="vpa-audit-modal">
                    {activeStudent && (
                        <div className="audit-info-header">
                            <div className="aih-item">
                                <span>HS:</span> <strong>{activeStudent.name}</strong>
                            </div>
                            <div className="aih-item">
                                <span>Điểm TB:</span> <strong>{activeStudent.avg ?? "—"}</strong>
                            </div>
                        </div>
                    )}
                    <div className="audit-timeline">
                        <div style={{ color: "var(--admin-text-muted)", fontSize: "0.9rem", textAlign: "center", padding: "2rem" }}>
                            Nhật ký chỉnh sửa điểm sẽ được tải từ hệ thống khi có dữ liệu.
                        </div>
                    </div>
                    <div className="modal-footer-vpa">
                        <Button primary onClick={() => setShowAudit(false)}>Đã rõ</Button>
                    </div>
                </div>
            </Modal>

            {/* ── All Subjects Modal ── */}
            <Modal
                open={showAllSubjects}
                onClose={() => setShowAllSubjects(false)}
                title="Báo cáo Chi tiết: Hiệu năng Môn học"
                width="800px"
            >
                <div className="vpa-all-subjects-modal">
                    <p className="modal-sub-vpa">
                        Phân tích toàn diện hiệu năng giảng dạy và kết quả học tập của lớp {selectedClassWithDetail?.name} trong học kỳ hiện tại.
                    </p>

                    <div className="modal-subjects-grid">
                        {(classDetail?.subjectPerf || []).length === 0 ? (
                            <div style={{ gridColumn: "1/-1", color: "var(--admin-text-muted)", textAlign: "center", padding: "2rem" }}>
                                Chưa có dữ liệu hiệu năng môn học
                            </div>
                        ) : (
                            classDetail.subjectPerf.map((s, i) => (
                                <div key={i} className={`metric-item large ${s.status}`}>
                                    <div className="m-left">
                                        <span className="m-sub">{s.sub}</span>
                                        <span className="m-avg">{s.avg ?? "—"}</span>
                                    </div>
                                    <div className={`m-trend ${s.trend}`}>
                                        {s.trend === "up" ? "▲" : s.trend === "down" ? "▼" : "●"}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="modal-footer-vpa">
                        <Button variant="outline" onClick={() => setShowAllSubjects(false)}>Đóng</Button>
                    </div>
                </div>
            </Modal>

            {/* ── Remind Modal ── */}
            <Modal
                open={isRemindModalOpen}
                onClose={() => setIsRemindModalOpen(false)}
                title="Nhắc nhở Giáo viên Chủ nhiệm"
                className="vpa-remind-modal"
            >
                <div className="vpa-remind-form">
                    {selectedClassWithDetail?.teacher && selectedClassWithDetail.teacher !== "Chưa phân công" && (
                        <div className="form-group">
                            <label>Gửi đến</label>
                            <div className="vpa-recipient-box">
                                <div className="recipient-avatar"><FiUserCheck /></div>
                                <div className="recipient-info">
                                    <strong>{selectedClassWithDetail.teacher}</strong>
                                    <span>Giáo viên chủ nhiệm lớp {selectedClassWithDetail?.name}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <Input
                        label="Tiêu đề"
                        type="text"
                        value={remindTitle}
                        onChange={(e) => setRemindTitle(e.target.value)}
                    />

                    <div className="form-group">
                        <label>Nội dung thông báo</label>
                        <textarea
                            className="vpa-textarea"
                            rows="6"
                            value={remindMessage}
                            onChange={(e) => setRemindMessage(e.target.value)}
                        ></textarea>
                    </div>

                    <div className="modal-actions">
                        <Button variant="outline" onClick={() => setIsRemindModalOpen(false)}>Hủy</Button>
                        <Button
                            primary
                            className="vpa-btn-glow"
                            onClick={handleSendRemind}
                            disabled={isSendingRemind}
                        >
                            <FiMail />
                            {isSendingRemind ? "Đang gửi..." : "Gửi thông báo"}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* ── Unlock Modal ── */}
            <Modal
                open={isUnlockModalOpen}
                onClose={() => !isUnlocking && setIsUnlockModalOpen(false)}
                title="Mở khóa chỉnh sửa điểm"
                className="vpa-unlock-modal"
            >
                <div className="vpa-unlock-form">
                    <div className="unlock-warning-box">
                        <FiAlertCircle style={{ fontSize: "1.5rem", color: "#dc2626" }} />
                        <div>
                            <strong>Xác nhận mở khóa</strong>
                            <p>
                                Bạn có chắc muốn mở khóa <strong>{finalizedGradeIds.length} điểm đã chốt</strong> của lớp <strong>{selectedClassWithDetail?.name}</strong>?
                                Việc mở khóa cho phép giáo viên chỉnh sửa điểm sau khi đã được phê duyệt.
                            </p>
                        </div>
                    </div>
                    <div className="modal-actions">
                        <Button variant="outline" onClick={() => setIsUnlockModalOpen(false)} disabled={isUnlocking}>Hủy</Button>
                        <Button
                            primary
                            className="vpa-btn-unlock-confirm"
                            onClick={handleUnlockClassGrades}
                            disabled={isUnlocking}
                        >
                            <FiUnlock />
                            {isUnlocking ? "Đang mở khóa..." : `Mở khóa ${finalizedGradeIds.length} điểm`}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
