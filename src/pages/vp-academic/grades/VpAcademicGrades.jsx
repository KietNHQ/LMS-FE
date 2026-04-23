import { useState, useEffect } from "react";
import { PageHeader, SchoolYearTermSelector, Pagination } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { 
    FiCheckCircle, FiClock, FiAlertCircle, FiLock, 
    FiDownload, FiEye, FiAlertTriangle, FiSearch, 
    FiFilter, FiMail, FiBarChart2, FiTrendingUp, FiUsers, FiActivity, FiArrowUpRight, FiX, FiUserCheck, FiExternalLink,
    FiChevronLeft, FiChevronRight, FiMenu
} from "react-icons/fi";
import { toast } from "react-toastify";
import { Modal, Button, Select, Input } from "../../../components/ui";
import { 
    ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
    CartesianGrid, Tooltip, AreaChart, Area 
} from "recharts";
import "./VpAcademicGrades.css";

// ── MOCK DATA ──────────────────────────────────────────────────────

const CLASS_LIST = [
    { id: "10A1", grade: "10", students: 42, status: "locked", statusLabel: "Đã chốt sổ", gpa: 8.2, trend: "+0.3", progress: 100, warnings: 0 },
    { id: "10A2", grade: "10", students: 40, status: "pending", statusLabel: "Chờ phê duyệt", gpa: 7.8, trend: "+0.1", progress: 100, warnings: 0 },
    { id: "11A5", grade: "11", students: 38, status: "progress", statusLabel: "Đang nhập (7/12 môn)", gpa: 6.9, trend: "-0.5", progress: 58, warnings: 2, warnMsg: "Sụt giảm GPA Toán" },
    { id: "12A2", grade: "12", students: 35, status: "missing", statusLabel: "Chưa nhập điểm", gpa: 0, trend: "0.0", progress: 0, warnings: 1, warnMsg: "Trễ hạn 2 ngày" },
    { id: "12A3", grade: "12", students: 36, status: "locked", statusLabel: "Đã chốt sổ", gpa: 8.5, trend: "+0.2", progress: 100, warnings: 0 },
];

const MONTHLY_TREND = [
    { name: "Th9", gpa: 7.2 },
    { name: "Th10", gpa: 7.5 },
    { name: "Th11", gpa: 7.4 },
    { name: "Th12", gpa: 7.8 },
    { name: "Th1", gpa: 8.1 },
    { name: "Th2", gpa: 8.0 },
];

const SUBJECT_PERFORMANCE = [
    { sub: "Toán", avg: 8.2, status: "good", trend: "up" },
    { sub: "Văn", avg: 7.5, status: "normal", trend: "stable" },
    { sub: "Anh", avg: 8.8, status: "excellent", trend: "up" },
    { sub: "Lý", avg: 6.2, status: "warning", trend: "down" },
    { sub: "Hóa", avg: 7.1, status: "normal", trend: "up" },
    { sub: "Sinh", avg: 7.9, status: "good", trend: "stable" },
    { sub: "Sử", avg: 5.5, status: "warning", trend: "down" },
    { sub: "Địa", avg: 7.4, status: "normal", trend: "stable" },
];

const STUDENT_GRADES = [
    { id: "HS-001", name: "Nguyễn Trung Hiếu", math: 8.5, lit: 7.0, eng: 9.0, phy: 8.0, avg: 8.1, conduct: "Tốt" },
    { id: "HS-002", name: "Trần Mai Anh", math: 4.5, lit: 6.5, eng: 5.0, phy: 4.0, avg: 5.0, conduct: "Khá" }, 
    { id: "HS-003", name: "Lý Hải Anh", math: 7.0, lit: 8.0, eng: 7.5, phy: 6.5, avg: 7.2, conduct: "Tốt" },
    { id: "HS-004", name: "Phạm Bình Minh", math: 9.0, lit: 8.5, eng: 8.0, phy: 9.5, avg: 8.8, conduct: "Tốt" },
];

const AUDIT_HISTORY = [
    { time: "14:20 22/04", user: "GV. Nguyễn Văn A", action: "Sửa điểm Toán", old: "7.0", new: "8.5", reason: "Chấm sót ý" },
    { time: "09:15 21/04", user: "GV. Trần Thị B", action: "Nhập điểm Văn", old: "-", new: "7.0", reason: "Nhập mới" },
    { time: "16:00 20/04", user: "Hệ thống", action: "Khóa sổ điểm", old: "Mở", new: "Khóa", reason: "Hết hạn" },
];

// ── CUSTOM COMPONENTS ──────────────────────────────────────────────

export default function VpAcademicGrades() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [selectedClass, setSelectedClass] = useState(null);
    const [filterGrade, setFilterGrade] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [showAudit, setShowAudit] = useState(false);
    const [showAllSubjects, setShowAllSubjects] = useState(false);
    const [activeStudent, setActiveStudent] = useState(null);
    const [activeTableTab, setActiveTableTab] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isRemindModalOpen, setIsRemindModalOpen] = useState(false);
    const [remindMessage, setRemindMessage] = useState('');
    const [remindTitle, setRemindTitle] = useState('');
    const itemsPerPage = 5;

    const filteredClasses = CLASS_LIST.filter(c => {
        const matchesGrade = filterGrade === "all" || c.grade === filterGrade;
        const matchesSearch = c.id.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesGrade && matchesSearch;
    });

    const upSubjects = SUBJECT_PERFORMANCE.filter(s => s.trend === 'up');
    const downSubjects = SUBJECT_PERFORMANCE.filter(s => s.trend === 'down');
    const summarySubjects = [...upSubjects.slice(0, 2), ...downSubjects.slice(0, 2)];

    const tableData = STUDENT_GRADES.filter(s => {
        if (activeTableTab === "excellent") return s.avg >= 8.0;
        if (activeTableTab === "warning") return s.avg < 5.0 || s.math < 5.0 || s.lit < 5.0 || s.eng < 5.0 || s.phy < 5.0;
        return true;
    });

    const totalPages = Math.ceil(tableData.length / itemsPerPage);
    const paginatedData = tableData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Reset page when filtering
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTableTab, selectedClass]);

    const handleOpenRemindModal = () => {
        if (!selectedClass) return;
        
        let title = `Nhắc nhở học vụ: Lớp ${selectedClass.id}`;
        let message = `Kính gửi GVCN lớp ${selectedClass.id},\n\n`;

        if (selectedClass.warnings > 0) {
            title = `[Cảnh báo] Vấn đề chất lượng lớp ${selectedClass.id}`;
            message += `Hệ thống ghi nhận lớp đang có vấn đề: ${selectedClass.warnMsg}.\n\n`;
        }
        
        if (selectedClass.progress < 100) {
            message += `Tiến độ nhập điểm hiện tại chỉ mới đạt ${selectedClass.progress}%. \n\n`;
        }

        if (selectedClass.status === 'pending') {
            message += `Lớp đã nhập đủ điểm nhưng chưa được phê duyệt sổ điểm. Vui lòng rà soát và trình phê duyệt.\n\n`;
        }

        if (selectedClass.warnings === 0 && selectedClass.progress === 100 && selectedClass.status === 'locked') {
            title = `Thông báo học vụ: Lớp ${selectedClass.id}`;
            message += `Tình hình học tập và điểm số của lớp đang rất ổn định. Đề nghị thầy/cô tiếp tục phát huy.\n\n`;
        } else {
            message += `Đề nghị thầy/cô kiểm tra, đôn đốc các giáo viên bộ môn và xử lý kịp thời.\n\n`;
        }
        
        message += `Trân trọng,\nPhó Hiệu Trưởng Học Vụ`;

        setRemindTitle(title);
        setRemindMessage(message);
        setIsRemindModalOpen(true);
    };

    const handleOpenAudit = (student) => {
        setActiveStudent(student);
        setShowAudit(true);
    };

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
                {/* ── SIDEBAR: CLASS NAVIGATOR ── */}
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
                        {filteredClasses.map(cls => (
                            <div 
                                key={cls.id} 
                                className={`vpa-class-card ${selectedClass?.id === cls.id ? 'active' : ''} ${cls.status}`}
                                onClick={() => setSelectedClass(cls)}
                            >
                                <div className="card-main">
                                    <div className="card-icon-hex">
                                        <span>{cls.id}</span>
                                    </div>
                                    <div className="card-info">
                                        <div className="info-top">
                                            <strong>Lớp {cls.id}</strong>
                                            <span className="student-tag">{cls.students} HS</span>
                                        </div>
                                        <div className="info-status">
                                            {cls.status === 'locked' && <FiLock />}
                                            {cls.status === 'pending' && <FiClock />}
                                            {cls.status === 'progress' && <FiActivity />}
                                            {cls.status === 'missing' && <FiAlertCircle />}
                                            <span>{cls.statusLabel}</span>
                                        </div>
                                    </div>
                                </div>
                                {cls.warnings > 0 && (
                                    <div className="card-alert-strip">
                                        <div className="pulse-dot"></div>
                                        <span>{cls.warnMsg}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </aside>

                {/* ── MAIN CONTENT: ANALYTICS COCKPIT ── */}
                <main className="vpa-grades-main">
                    {!selectedClass ? (
                        <div className="vpa-empty-state">
                            <div className="empty-glow-icon">
                                <FiBarChart2 />
                            </div>
                            <h3>Phòng Điều Hành Học Vụ</h3>
                            <p>Vui lòng chọn một lớp học từ danh sách bên trái để bắt đầu phân tích chất lượng điểm số và tiến độ nhập liệu.</p>
                        </div>
                    ) : (
                        <div className="vpa-analytics-container animate-fade-in">
                            {/* 1. Header Bar */}
                            <div className="vpa-analytics-header">
                                <div className="ah-left">
                                    <div className="class-title-large">
                                        <h2>Chi tiết Học vụ: Lớp {selectedClass.id}</h2>
                                        <span className={`status-badge ${selectedClass.status}`}>{selectedClass.statusLabel}</span>
                                    </div>
                                </div>

                                <div className="ah-center">
                                    <div className="gvcn-highlight">
                                        <div className="gvcn-icon"><FiUserCheck /></div>
                                        <div className="gvcn-text">
                                            <span>GIÁO VIÊN CHỦ NHIỆM</span>
                                            <strong>GV. Nguyễn Văn A</strong>
                                        </div>
                                    </div>
                                </div>

                                <div className="ah-right">
                                    <Button variant="outline" className="vpa-btn-icon" onClick={handleOpenRemindModal}><FiMail /> Nhắc GV</Button>
                                    <Button variant="outline" className="vpa-btn-icon"><FiDownload /> Xuất báo cáo</Button>
                                </div>
                            </div>
                            
                            <div className="vpa-header-footer">
                                <p className="ah-meta">Cập nhật lần cuối: 10 phút trước • Học kỳ 2 • 2025-2026</p>
                                {selectedClass.status === 'pending' && (
                                    <Button primary className="vpa-btn-glow"><FiCheckCircle /> Phê duyệt sổ điểm</Button>
                                )}
                            </div>

                            {/* 2. KPI Stats Bar */}
                            <div className="vpa-kpi-grid">
                                <div className="vpa-kpi-card">
                                    <div className="kpi-icon emerald"><FiTrendingUp /></div>
                                    <div className="kpi-data">
                                        <span className="kpi-label">GPA Trung Bình</span>
                                        <div className="kpi-value-row">
                                            <h3>{selectedClass.gpa}</h3>
                                            <span className={`kpi-trend ${selectedClass.trend.startsWith('+') ? 'up' : 'down'}`}>
                                                {selectedClass.trend}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="vpa-kpi-card">
                                    <div className="kpi-icon blue"><FiActivity /></div>
                                    <div className="kpi-data">
                                        <span className="kpi-label">Tiến Độ Nhập Điểm</span>
                                        <div className="kpi-progress-row">
                                            <h3>{selectedClass.progress}%</h3>
                                            <div className="mini-progress-bar">
                                                <div className="fill" style={{ width: `${selectedClass.progress}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="vpa-kpi-card">
                                    <div className="kpi-icon amber"><FiAlertTriangle /></div>
                                    <div className="kpi-data">
                                        <span className="kpi-label">Cảnh Báo Chất Lượng</span>
                                        <h3>{selectedClass.warnings} <small>vấn đề</small></h3>
                                    </div>
                                </div>
                                <div className="vpa-kpi-card">
                                    <div className="kpi-icon purple"><FiUsers /></div>
                                    <div className="kpi-data">
                                        <span className="kpi-label">Số Lượng Học Sinh</span>
                                        <h3>{selectedClass.students} <small>học sinh</small></h3>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Charts & Analytics Row */}
                            <div className="vpa-charts-row">
                                <div className="vpa-chart-box trend-box">
                                    <div className="box-header">
                                        <h4>Biến động GPA qua các tháng</h4>
                                        <span className="box-tag">Học kỳ 2</span>
                                    </div>
                                    <div className="chart-container">
                                        <ResponsiveContainer width="100%" height={220}>
                                            <AreaChart data={MONTHLY_TREND}>
                                                <defs>
                                                    <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                                <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                                <Tooltip 
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                                />
                                                <Area type="monotone" dataKey="gpa" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorGpa)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
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
                                        {summarySubjects.map((s, i) => (
                                            <div key={i} className={`metric-item ${s.status}`}>
                                                <div className="m-left">
                                                    <span className="m-sub">{s.sub}</span>
                                                    <span className="m-avg">{s.avg}</span>
                                                </div>
                                                <div className={`m-trend ${s.trend}`}>
                                                    {s.trend === 'up' ? '▲' : s.trend === 'down' ? '▼' : '●'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* 4. Grade Table Drill-down */}
                            <div className="vpa-table-section shadow-premium">
                                <div className="section-header">
                                    <div className="sh-left">
                                        <div className="vpa-header-select">
                                            <Select 
                                                variant="custom"
                                                value={activeTableTab}
                                                onChange={(e) => setActiveTableTab(e.target.value)}
                                                options={[
                                                    { value: 'all', label: `Tất cả học sinh (${STUDENT_GRADES.length})` },
                                                    { value: 'excellent', label: `Học sinh Giỏi (${STUDENT_GRADES.filter(s => s.avg >= 8).length})` },
                                                    { value: 'warning', label: `Cần lưu ý (${STUDENT_GRADES.filter(s => s.avg < 5 || s.math < 5 || s.lit < 5 || s.eng < 5 || s.phy < 5).length})` }
                                                ]}
                                            />
                                        </div>
                                        <div className="sh-search">
                                            <FiSearch />
                                            <input type="text" placeholder="Tìm tên học sinh..." />
                                        </div>
                                    </div>
                                    <div className="sh-right">
                                        <Button variant="ghost" className="btn-vpa-export"><FiDownload /> Xuất danh sách</Button>
                                    </div>
                                </div>
                                <div className="vpa-table-scroll custom-scrollbar">
                                    <table className="vpa-premium-table">
                                        <thead>
                                            <tr>
                                                <th>Học sinh</th>
                                                <th>Toán</th>
                                                <th>Văn</th>
                                                <th>Anh</th>
                                                <th>Lý</th>
                                                <th>Hạnh kiểm</th>
                                                <th>Trung Bình</th>
                                                <th>Audit</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedData.map((s, i) => (
                                                <tr key={i}>
                                                    <td className="td-student">
                                                        <div className="st-info">
                                                            <strong>{s.name}</strong>
                                                            <span>{s.id}</span>
                                                        </div>
                                                    </td>
                                                    <td className={`sc-cell ${s.math < 5 ? 'danger' : ''}`}>{s.math}</td>
                                                    <td className={`sc-cell ${s.lit < 5 ? 'danger' : ''}`}>{s.lit}</td>
                                                    <td className={`sc-cell ${s.eng < 5 ? 'danger' : ''}`}>{s.eng}</td>
                                                    <td className={`sc-cell ${s.phy < 5 ? 'danger' : ''}`}>{s.phy}</td>
                                                    <td className="td-conduct"><span className="conduct-tag">{s.conduct}</span></td>
                                                    <td className="td-avg"><strong>{s.avg}</strong></td>
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
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="vpa-table-footer">
                                    <Pagination 
                                        currentPage={currentPage} 
                                        totalPages={totalPages} 
                                        onPageChange={setCurrentPage} 
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>

            {/* ── AUDIT HISTORY MODAL ── */}
            <Modal
                open={showAudit}
                onClose={() => setShowAudit(false)}
                title={`Nhật ký sửa điểm - ${activeStudent?.name}`}
                maxWidth="600px"
            >
                <div className="vpa-audit-modal">
                    <div className="audit-info-header">
                        <div className="aih-item">
                            <span>Mã HS:</span> <strong>{activeStudent?.id}</strong>
                        </div>
                        <div className="aih-item">
                            <span>Lớp:</span> <strong>{selectedClass?.id}</strong>
                        </div>
                    </div>
                    
                    <div className="audit-timeline">
                        {AUDIT_HISTORY.map((log, i) => (
                            <div key={i} className="audit-card">
                                <div className="audit-card-top">
                                    <span className="log-time">{log.time}</span>
                                    <span className="log-action">{log.action}</span>
                                </div>
                                <div className="audit-diff">
                                    <div className="diff-item old">Từ: {log.old}</div>
                                    <div className="diff-arrow">→</div>
                                    <div className="diff-item new">Sang: {log.new}</div>
                                </div>
                                <div className="audit-footer">
                                    <span className="log-user">Bởi: {log.user}</span>
                                    <div className="log-reason">Lý do: {log.reason}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="modal-footer-vpa">
                        <Button primary onClick={() => setShowAudit(false)}>Đã rõ</Button>
                    </div>
                </div>
            </Modal>
            {/* 🔥 MODAL: ALL SUBJECT PERFORMANCE */}
            <Modal
                open={showAllSubjects}
                onClose={() => setShowAllSubjects(false)}
                title="Báo cáo Chi tiết: Hiệu năng Môn học"
                width="800px"
            >
                <div className="vpa-all-subjects-modal">
                    <p className="modal-sub-vpa">Phân tích toàn diện hiệu năng giảng dạy và kết quả học tập của lớp {selectedClass?.id} trong học kỳ hiện tại.</p>
                    
                    <div className="modal-subjects-grid">
                        {SUBJECT_PERFORMANCE.map((s, i) => (
                            <div key={i} className={`metric-item ${s.status} large`}>
                                <div className="m-left">
                                    <span className="m-sub">{s.sub}</span>
                                    <span className="m-avg">{s.avg}</span>
                                </div>
                                <div className="m-right-vpa">
                                    <div className={`m-trend ${s.trend}`}>
                                        {s.trend === 'up' ? '▲' : s.trend === 'down' ? '▼' : '●'}
                                    </div>
                                    <span className="trend-label-vpa">
                                        {s.trend === 'up' ? 'Tăng trưởng' : s.trend === 'down' ? 'Sụt giảm' : 'Ổn định'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="modal-footer-vpa">
                        <Button variant="outline" onClick={() => setShowAllSubjects(false)}>Đóng</Button>
                        <Button primary><FiDownload /> Xuất báo cáo chi tiết</Button>
                    </div>
                </div>
            </Modal>

            {/* ── MODALS ── */}
            <Modal 
                open={isRemindModalOpen} 
                onClose={() => setIsRemindModalOpen(false)}
                title="Nhắc nhở Giáo viên Chủ nhiệm"
                className="vpa-remind-modal"
            >
                <div className="vpa-remind-form">
                    <div className="form-group">
                        <label>Gửi đến</label>
                        <div className="vpa-recipient-box">
                            <div className="recipient-avatar"><FiUserCheck /></div>
                            <div className="recipient-info">
                                <strong>GV. Nguyễn Văn A</strong>
                                <span>Giáo viên chủ nhiệm lớp {selectedClass?.id}</span>
                            </div>
                        </div>
                    </div>
                    
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
                        <Button primary className="vpa-btn-glow" onClick={() => {
                            toast.success(`Đã gửi thông báo đến GVCN lớp ${selectedClass?.id}`);
                            setIsRemindModalOpen(false);
                        }}>
                            <FiMail /> Gửi thông báo
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
