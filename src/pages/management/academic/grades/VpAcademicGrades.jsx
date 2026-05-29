import { useState, useEffect, useCallback } from "react";
import { PageHeader, SchoolYearTermSelector, Pagination, LoadingSpinner } from "../../../../components/common";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import { resolveSchoolYearId, resolveSemesterId } from "../../../../services/shared/schoolYearLookup";
import { classesService } from "../../../../services/pages/management/classes/classesService";
import { studentsService } from "../../../../services/pages/management/users/studentsService";
import { gradeService } from "../../../../services/pages/management/grades/gradeService";
import notificationService from "../../../../services/pages/management/notifications/notificationService";
import {
    FiCheckCircle, FiClock, FiAlertCircle, FiLock,
    FiDownload, FiEye, FiAlertTriangle, FiSearch,
    FiFilter, FiMail, FiBarChart2, FiTrendingUp, FiUsers, FiActivity, FiArrowUpRight, FiX, FiUserCheck, FiExternalLink,
    FiChevronLeft, FiChevronRight, FiMenu
} from "react-icons/fi";
import { toast } from "react-toastify";
import { Modal, Button, Select, Input } from "../../../../components/ui";
import {
    ResponsiveContainer, LineChart, Line, XAxis, YAxis,
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

// ── CUSTOM COMPONENT ──────────────────────────────────────────────

export default function VpAcademicGrades() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
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
    const [classDetail, setClassDetail] = useState(null); // { students, gpa, trend, subjectPerf, auditLogs, semester1Gpa }
    const [isSendingRemind, setIsSendingRemind] = useState(false);

    const itemsPerPage = 5;

    // ── Load class list (sidebar) ─────────────────────────────────
    useEffect(() => {
        let cancelled = false;
        setClassesLoading(true);
        classesService.listClasses({})
            .then(rows => {
                if (!cancelled) setClasses(rows);
            })
            .catch(() => toast.error("Không thể tải danh sách lớp"))
            .finally(() => { if (!cancelled) setClassesLoading(false); });
        return () => { cancelled = true; };
    }, [selectedSchoolYear]);

    // ── Load detail for selected class ─────────────────────────────
    const loadClassDetail = useCallback(async (cls) => {
        if (!cls?.id) return;
        setClassDetailLoading(true);
        setClassDetail(null);

        try {
            const [semesterId, schoolYearId] = await Promise.all([
                resolveSemesterId(selectedSchoolYear, selectedTerm),
                resolveSchoolYearId(selectedSchoolYear),
            ]);
            const semValue = semesterId || (selectedTerm === "hk1" ? 1 : 2);

            // Load students + GPA in parallel
            const studentsRaw = await studentsService.getClassStudents(cls.id).catch(() => []);
            const studentsArr = Array.isArray(studentsRaw) ? studentsRaw : [];

            const studentGpas = await Promise.all(
                studentsArr.map(async (st) => {
                    const enrollmentId = st.enrollmentId || st.id;
                    const gpaRes = await gradeService.calculateSemesterGPA({ enrollmentId, semesterId: semValue }).catch(() => null);
                    const classifyRes = await gradeService.classifySemester({ enrollmentId, semesterId: semValue }).catch(() => null);
                    const conductRes = classifyRes?.data?.conduct;

                    return {
                        id: st.studentCode || st.id,
                        name: st.name || `${st.surname || ""} ${st.givenName || ""}`.trim(),
                        enrollmentId,
                        avg: gpaRes?.gpa != null ? toScore(gpaRes.gpa) : null,
                        conduct: conductRes?.level || conductRes?.description || null,
                        math: null, lit: null, eng: null, phy: null, // individual subject scores from report card
                    };
                })
            );

            // Class GPA = average of student GPAs
            const gpaValues = studentGpas.map(s => s.avg).filter(v => v != null);
            const classGpa = gpaValues.length > 0
                ? toScore(gpaValues.reduce((a, b) => a + b, 0) / gpaValues.length)
                : null;

            // Trend: compare with other semester
            const otherSem = selectedTerm === "hk1" ? 2 : 1;
            let trend = "0.0";
            if (gpaValues.length > 0 && schoolYearId) {
                const otherStudentGpas = await Promise.all(
                    studentsArr.map(async (st) => {
                        const enrollmentId = st.enrollmentId || st.id;
                        const r = await gradeService.calculateSemesterGPA({ enrollmentId, semesterId: otherSem }).catch(() => null);
                        return r?.gpa != null ? toScore(r.gpa) : null;
                    })
                );
                const otherVals = otherStudentGpas.filter(v => v != null);
                const otherGpa = otherVals.length > 0
                    ? otherVals.reduce((a, b) => a + b, 0) / otherVals.length
                    : null;
                if (otherGpa != null && classGpa != null) {
                    trend = scoreTrend(otherGpa, classGpa);
                }
            }

            // Subject performance: aggregate subject-level scores from student results
            const subjectMap = {};
            await Promise.all(
                studentsArr.slice(0, 10).map(async (st) => {
                    const enrollmentId = st.enrollmentId || st.id;
                    const gpaRes = await gradeService.calculateSemesterGPA({ enrollmentId, semesterId: semValue }).catch(() => null);
                    if (gpaRes?.results) {
                        gpaRes.results.forEach(r => {
                            if (!r.isGradedByScore) return;
                            if (!subjectMap[r.subjectName]) {
                                subjectMap[r.subjectName] = { sum: 0, count: 0 };
                            }
                            if (r.averageScore != null) {
                                subjectMap[r.subjectName].sum += r.averageScore;
                                subjectMap[r.subjectName].count++;
                            }
                        });
                    }
                })
            );

            const subjectPerf = Object.entries(subjectMap).map(([sub, { sum, count }]) => {
                const avg = count > 0 ? toScore(sum / count) : null;
                return { sub, avg, status: gradeColor(avg), trend: "stable" };
            });

            setClassDetail({
                students: studentGpas,
                gpa: classGpa,
                gpaCount: gpaValues.length,
                trend,
                subjectPerf,
                semester1Gpa: null,
            });
        } catch (err) {
            console.error("Failed to load class detail:", err);
            toast.error("Không thể tải chi tiết lớp");
        } finally {
            setClassDetailLoading(false);
        }
    }, [selectedSchoolYear, selectedTerm]);

    useEffect(() => {
        let cancelled = false;
        if (selectedClass) {
            loadClassDetail(selectedClass).then(() => { cancelled; });
        }
        return () => { cancelled = true; };
    }, [selectedClass, loadClassDetail]);

    // Reset pagination when tab or class changes
    useEffect(() => { setCurrentPage(1); }, [activeTableTab, selectedClass, studentSearch]);

    // ── Derived data ────────────────────────────────────────────────
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

    // ── Render ──────────────────────────────────────────────────────
    return (
        <div className="vpa-grades-cockpit">
        <div className="vpa-academic-layout">
            <PageHeader
                title="Giám sát Điểm số & Chất lượng"
                eyebrow="Hệ thống phân tích học vụ và kiểm soát chất lượng đào tạo"
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
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
                                const status = cls.gpa == null ? "missing" : cls.gpa >= 8.0 ? "locked" : cls.gpa >= 5.0 ? "progress" : "missing";
                                const statusLabel = cls.gpa == null ? "Chưa có điểm"
                                    : cls.gpa >= 8.0 ? "Tốt"
                                    : cls.gpa >= 5.0 ? "Đang nhập"
                                    : "Cần cải thiện";
                                return (
                                    <div
                                        key={cls.id}
                                        className={`vpa-class-card ${selectedClass?.id === cls.id ? 'active' : ''} ${status}`}
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
                                                    {status === "locked" && <FiLock />}
                                                    {status === "pending" && <FiClock />}
                                                    {status === "progress" && <FiActivity />}
                                                    {status === "missing" && <FiAlertCircle />}
                                                    <span>{statusLabel}</span>
                                                </div>
                                            </div>
                                        </div>
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
                        </div>
                    ) : (
                        <div className="vpa-analytics-container animate-fade-in">
                            {/* Header Bar */}
                            <div className="vpa-analytics-header">
                                <div className="ah-left">
                                    <div className="class-title-large">
                                        <h2>Chi tiết Học vụ: Lớp {selectedClassWithDetail.name}</h2>
                                        <span className={`status-badge ${selectedClassWithDetail.gpa == null ? "missing" : selectedClassWithDetail.gpa >= 8.0 ? "locked" : selectedClassWithDetail.gpa >= 5.0 ? "pending" : "missing"}`}>
                                            {selectedClassWithDetail.gpa == null ? "Chưa có điểm"
                                                : selectedClassWithDetail.gpa >= 8.0 ? "Tốt"
                                                : selectedClassWithDetail.gpa >= 5.0 ? "Đang nhập"
                                                : "Cần cải thiện"}
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
                                        <span className="kpi-label">GPA Trung Bình</span>
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
                                        {(summarySubjects.length > 0 ? summarySubjects : classDetail?.subjectPerf?.slice(0, 6) || []).map((s, i) => (
                                            <div key={i} className={`metric-item ${s.status}`}>
                                                <div className="m-left">
                                                    <span className="m-sub">{s.sub}</span>
                                                    <span className="m-avg">{s.avg ?? "—"}</span>
                                                </div>
                                                <div className={`m-trend ${s.trend}`}>
                                                    {s.trend === "up" ? "▲" : s.trend === "down" ? "▼" : "●"}
                                                </div>
                                            </div>
                                        ))}
                                        {students.length === 0 && (
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
                                                <th>Trung Bình</th>
                                                <th>Hạnh kiểm</th>
                                                <th>Audit</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedData.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} style={{ textAlign: "center", color: "var(--admin-text-muted)", padding: "2rem" }}>
                                                        Không có học sinh nào phù hợp
                                                    </td>
                                                </tr>
                                            ) : (
                                                paginatedData.map((s, i) => (
                                                    <tr key={i}>
                                                        <td className="td-student">
                                                            <div className="st-info">
                                                                <strong>{s.name}</strong>
                                                                <span>{s.id}</span>
                                                            </div>
                                                        </td>
                                                        <td className={`sc-cell ${s.avg != null && s.avg < 5 ? 'danger' : ''}`}>
                                                            {s.avg != null ? s.avg : "—"}
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
        </div>
    );
}
