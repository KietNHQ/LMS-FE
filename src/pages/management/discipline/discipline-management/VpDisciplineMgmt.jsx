import { useState, useEffect } from "react";
import { PageHeader, WeekPicker, Pagination, StatusBadge, LoadingSpinner } from "../../../../components/common";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import Select from "../../../../components/ui/Select/Select";
import { FiSearch, FiFilter, FiAward, FiAlertCircle, FiClock, FiCheckCircle, FiChevronLeft, FiChevronRight, FiPlus, FiDownload, FiCalendar, FiActivity, FiArrowRight, FiEdit2, FiTrash2, FiEyeOff, FiEye, FiUser, FiBarChart2, FiLayers, FiShield, FiCheck, FiAlertTriangle } from "react-icons/fi";
import { toast } from "react-toastify";
import DisciplineHeaderActions from "../components/DisciplineHeaderActions";
import ViolationRecordModal from "../components/ViolationRecordModal";
import IncidentHandleModal from "../components/IncidentHandleModal";
import ManagementLeaveRequests from "../../leave-requests/ManagementLeaveRequests";
import "./VpDisciplineMgmt.css";

export default function VpDisciplineMgmt() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [isLoading, setIsLoading] = useState(true);
    const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
    const [isHandleModalOpen, setIsHandleModalOpen] = useState(false);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [editingIncident, setEditingIncident] = useState(null);
    const [hiddenIncidents, setHiddenIncidents] = useState(new Set());
    const [isViolationModalOpen, setIsViolationModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Tab Navigation States
    const [activeTab, setActiveTab] = useState("discipline");
    const [canViewLeaveRequests, setCanViewLeaveRequests] = useState(false);

    useEffect(() => {
        try {
            const isPersistent = localStorage.getItem("isPersistent") === "true";
            const userStr = sessionStorage.getItem("user") || (isPersistent ? localStorage.getItem("user") : null);
            if (userStr) {
                const user = JSON.parse(userStr);
                const perms = user.permissions || [];
                const role = user.role?.toLowerCase() || "";
                const hasPerm = perms.includes("leave_requests:read") || perms.includes("leave_requests:manage") || role === "admin" || role === "principal";
                setCanViewLeaveRequests(hasPerm);
            }
        } catch (e) {
            console.warn("Failed to check permissions in VpDisciplineMgmt", e);
        }
    }, []);
    
    // Filter States
    const [selectedGrade, setSelectedGrade] = useState("all");
    const [selectedClass, setSelectedClass] = useState("all");
    const [selectedWeek, setSelectedWeek] = useState(1);
    const [selectedViolationType, setSelectedViolationType] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;
    const [selectedSeverity, setSelectedSeverity] = useState("all");

    // Mock Data
    const [incidents, setIncidents] = useState([
        { id: 1, student: "Nguyễn Văn A", class: "10A1", grade: "10", type: "Vắng không phép", level: "med", date: "20/4/2026", reporter: "GV. Trần Y", status: "new" },
        { id: 2, student: "Lê Thị B", class: "11A5", grade: "11", type: "Sử dụng điện thoại", level: "low", date: "20/4/2026", reporter: "Lớp trưởng", status: "resolved" },
        { id: 3, student: "Trần Minh C", class: "12A2", grade: "12", type: "Đánh nhau", level: "high", date: "19/4/2026", reporter: "Giám thị 01", status: "processing", assignedTo: "Giám thị 01" },
        { id: 4, student: "Hoàng Anh E", class: "10A2", grade: "10", type: "Nói tục", level: "med", date: "19/4/2026", reporter: "GV. Trần Y", status: "new" },
        { id: 5, student: "Lê Văn C", class: "12A2", grade: "12", type: "Gian lận thi cử", level: "high", date: "20/4/2026", reporter: "PHT Nề nếp", status: "processing", assignedTo: "PHT Nề nếp" },
        { id: 6, student: "Vũ Thu F", class: "11B1", grade: "11", type: "Vẽ bậy", level: "low", date: "20/4/2026", reporter: "PHT Nề nếp", status: "resolved" },
        { id: 10, student: "Lê I", class: "12C3", grade: "12", type: "Bỏ tiết", level: "med", date: "18/4/2026", reporter: "Giám thị 01", status: "new" },
        { id: 11, student: "Trần Minh C", class: "12A2", grade: "12", type: "Mất trật tự", level: "med", date: "15/4/2026", reporter: "GV. Bộ môn", status: "closed" },
        { id: 12, student: "Trần Minh C", class: "12A2", grade: "12", type: "Đi trễ", level: "low", date: "10/4/2026", reporter: "Cờ đỏ", status: "closed" },
        { id: 13, student: "Lê Văn C", class: "12A2", grade: "12", type: "Không làm bài", level: "low", date: "15/4/2026", reporter: "GV. Bộ môn", status: "closed" },
        { id: 14, student: "Hoàng Anh E", class: "10A2", grade: "10", type: "Đi trễ", level: "low", date: "12/4/2026", reporter: "Cờ đỏ", status: "closed" },
    ]);

    const categoryStats = [
        { title: "Chuyên cần", icon: <FiClock />, incidents: 63, detail: "12 học sinh", trend: "+15%", level: "Cần chú ý", status: "warning" },
        { title: "Nề nếp", icon: <FiUser />, incidents: 45, detail: "8 học sinh", trend: "-5%", level: "Ổn định", status: "success" },
        { title: "Tài sản", icon: <FiLayers />, incidents: 15, detail: "4 học sinh", trend: "+2%", level: "Bình thường", status: "neutral" },
        { title: "Học tập", icon: <FiAlertCircle />, incidents: 28, detail: "9 học sinh", trend: "+8%", level: "Nghiêm trọng", status: "critical" },
    ];

    const handleAddIncident = (newInc, isEdit = false) => {
        if (isEdit) {
            setIncidents(prev => prev.map(inc => inc.id === newInc.id ? newInc : inc));
        } else {
            setIncidents(prev => [newInc, ...prev]);
        }
        setEditingIncident(null);
        setIsViolationModalOpen(false);
    };

    const handleEditIncident = (inc) => {
        setEditingIncident(inc);
        setIsViolationModalOpen(true);
    };

    const handleDeleteIncident = (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa hồ sơ vi phạm này? Hành động này không thể hoàn tác.")) {
            setIncidents(prev => prev.filter(inc => inc.id !== id));
            toast.success("Đã xóa hồ sơ vi phạm!");
        }
    };

    const handleToggleHide = (id) => {
        setHiddenIncidents(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
        toast.info("Đã thay đổi trạng thái hiển thị hồ sơ.");
    };

    const handleUpdateIncident = (updated) => {
        setIncidents(prev => prev.map(inc => inc.id === updated.id ? updated : inc));
    };

    const handleOpenIncident = (incident) => {
        setSelectedIncident(incident);
        setIsHandleModalOpen(true);
    };

    const classOptions = {
        "all": [{ value: "all", label: "Tất cả" }],
        "10": [{ value: "all", label: "Tất cả" }, { value: "10A1", label: "10A1" }, { value: "10A2", label: "10A2" }],
        "11": [{ value: "all", label: "Tất cả" }, { value: "11A5", label: "11A5" }, { value: "11B1", label: "11B1" }],
        "12": [{ value: "all", label: "Tất cả" }, { value: "12A2", label: "12A2" }, { value: "12C3", label: "12C3" }],
    };

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, [selectedSchoolYear, selectedTerm, selectedWeek, selectedGrade, selectedClass]);

    const getOccurrenceCount = (studentName, currentIncidentId, allIncidents) => {
        const studentHistory = allIncidents
            .filter(inc => inc.student === studentName)
            .sort((a, b) => {
                const dateA = new Date(a.date.split('/').reverse().join('-'));
                const dateB = new Date(b.date.split('/').reverse().join('-'));
                if (dateA - dateB !== 0) return dateA - dateB;
                return a.id - b.id;
            });
        const index = studentHistory.findIndex(inc => inc.id === currentIncidentId);
        return index + 1;
    };

    const filteredIncidents = incidents.filter(inc => {
        if (hiddenIncidents.has(inc.id)) return false;
        const matchGrade = selectedGrade === "all" || inc.grade === selectedGrade;
        const matchClass = selectedClass === "all" || inc.class === selectedClass;
        const matchType = selectedViolationType === "all" || inc.type.toLowerCase().includes(selectedViolationType.toLowerCase()) || (selectedViolationType === "late" && inc.type === "Đi trễ") || (selectedViolationType === "absence" && inc.type.includes("Vắng"));
        const matchSeverity = selectedSeverity === "all" || inc.level === selectedSeverity;
        return matchGrade && matchClass && matchType && matchSeverity;
    });

    const totalPages = Math.ceil(filteredIncidents.length / itemsPerPage) || 1;
    const paginatedIncidents = filteredIncidents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="vp-discipline-mgmt vp-discipline-layout discipline-layout-centered">
            <PageHeader
                title="Quản Lý Nề Nếp"
                subtitle="Theo dõi và quản lý hồ sơ vi phạm học sinh toàn trường"
                actions={
                    <DisciplineHeaderActions
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            {/* Elegant Premium Tabs for Tabbed Navigation */}
            {canViewLeaveRequests && (
                <div className="dm-portal-tabs-wrapper">
                    <button
                        className={`dm-portal-tab-btn ${activeTab === "discipline" ? "active" : ""}`}
                        onClick={() => setActiveTab("discipline")}
                    >
                        <FiAlertTriangle className="tab-icon" />
                        Hồ sơ vi phạm
                    </button>
                    <button
                        className={`dm-portal-tab-btn ${activeTab === "leave-requests" ? "active" : ""}`}
                        onClick={() => setActiveTab("leave-requests")}
                    >
                        <FiCalendar className="tab-icon" />
                        Đơn xin nghỉ phép
                    </button>
                </div>
            )}

            {activeTab === "discipline" ? (
                <>
                    <div className="dm-summary-grid">
                        {categoryStats.map((cat, idx) => (
                            <div key={idx} className={`dm-status-card ${cat.status}`}>
                                <div className="card-inner">
                                    <div className="card-top">
                                        <span className="card-label">{cat.title}</span>
                                        <span className={`status-pill`}>{cat.level}</span>
                                    </div>
                                    <div className="card-mid">
                                        <div className="main-count">
                                            {cat.incidents}
                                            <span className="count-unit">lượt</span>
                                        </div>
                                        <div className="card-icon-bg">{cat.icon}</div>
                                    </div>
                                    <div className="card-bottom">
                                        <span className="trend-val">{cat.trend} tháng này</span>
                                        <span className="sep">•</span>
                                        <span className="detail-val">{cat.detail}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="dm-main-container">
                        <div className="dm-panel main-ops-panel-full">
                            <div className="dm-header-v2">
                                <div className="dm-toolbar-integrated">
                                    <div className="dm-filters-complex">
                                        <div className="filter-group">
                                            <label><FiCalendar /> Tuần</label>
                                            <WeekPicker className="dm-week-picker" value={selectedWeek} onChange={setSelectedWeek} totalWeeks={35} />
                                        </div>
                                        <div className="filter-group">
                                            <label><FiLayers /> Khối</label>
                                            <Select variant="custom" value={selectedGrade} onChange={(e) => { setSelectedGrade(e.target.value); setSelectedClass("all"); }} options={[{ value: "all", label: "Tất cả" }, { value: "10", label: "Khối 10" }, { value: "11", label: "Khối 11" }, { value: "12", label: "Khối 12" }]} />
                                        </div>
                                        {selectedGrade !== "all" && (
                                            <div className="filter-group animate-slide-in">
                                                <label><FiLayers /> Lớp</label>
                                                <Select variant="custom" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} options={classOptions[selectedGrade]} />
                                            </div>
                                        )}
                                        <div className="filter-group">
                                            <label><FiAlertCircle /> Loại lỗi</label>
                                            <Select variant="custom" value={selectedViolationType} onChange={(e) => setSelectedViolationType(e.target.value)} options={[{ value: "all", label: "Tất cả" }, { value: "late", label: "Đi trễ" }, { value: "absence", label: "Vắng" }, { value: "uniform", label: "Đồng phục" }, { value: "behavior", label: "Thái độ" }]} />
                                        </div>
                                        <div className="filter-group">
                                            <label><FiActivity /> Mức độ</label>
                                            <Select variant="custom" value={selectedSeverity} onChange={(e) => setSelectedSeverity(e.target.value)} options={[{ value: "all", label: "Tất cả" }, { value: "low", label: "Nhẹ" }, { value: "med", label: "Vừa" }, { value: "high", label: "Nghiêm trọng" }]} />
                                        </div>
                                    </div>
                                    <div className="dm-primary-actions-compact">
                                        <button className="btn-export-reports"><FiDownload /> Báo cáo</button>
                                        <button className="btn-add-violation-premium" onClick={() => setIsViolationModalOpen(true)}>
                                            <FiPlus /> Ghi nhận mới
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="ui-table-loading">
                                    <LoadingSpinner size="lg" label="Đang cập nhật hồ sơ nề nếp..." />
                                </div>
                            ) : (
                                <>
                                    <div className="dm-table-wrap">
                                        <table className="dm-table-premium">
                                            <thead>
                                                <tr>
                                                    <th>Học sinh</th>
                                                    <th>Lớp</th>
                                                    <th>Loại Vi Phạm</th>
                                                    <th>Mức Độ</th>
                                                    <th>Trạng Thái</th>
                                                    <th>Thời Gian</th>
                                                    <th className="th-actions">Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedIncidents.map(incident => (
                                                    <tr key={incident.id} className="row-hover-effect">
                                                        <td className="td-student">
                                                            <div className="student-profile-mini">
                                                                <div className="s-avatar">{incident.student.charAt(0)}</div>
                                                                <span>{incident.student}</span>
                                                            </div>
                                                        </td>
                                                        <td><span className="class-badge-v2">{incident.class}</span></td>
                                                        <td><span className="violation-type">{incident.type}</span></td>
                                                        <td>
                                                            <div className="td-level-combined">
                                                                <span className={`level-pill ${incident.level}`}>
                                                                    {incident.level === 'high' ? 'Nghiêm trọng' : (incident.level === 'med' ? 'Vừa' : 'Nhẹ')}
                                                                </span>
                                                                <span className="occurrence-badge">{getOccurrenceCount(incident.student, incident.id, incidents)}</span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <StatusBadge status={incident.status || 'new'}>
                                                                {incident.status === 'processing' ? 'Đang xử lý' : (incident.status === 'resolved' ? 'Đã giải quyết' : (incident.status === 'closed' ? 'Đã đóng' : 'Mới'))}
                                                            </StatusBadge>
                                                        </td>
                                                        <td><span className="td-time">{incident.date}</span></td>
                                                        <td className="dm-td-actions">
                                                            <div className="dm-action-group">
                                                                <button className="dm-btn-action edit" title="Sửa" onClick={() => handleEditIncident(incident)}><FiEdit2 /></button>
                                                                <button className="dm-btn-action process" title="Xử lý" onClick={() => handleOpenIncident(incident)}><FiActivity /></button>
                                                                <button className="dm-btn-action hide" title="Ẩn" onClick={() => handleToggleHide(incident.id)}><FiEyeOff /></button>
                                                                <button className="dm-btn-action delete" title="Xóa" onClick={() => handleDeleteIncident(incident.id)}><FiTrash2 /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="dm-footer-pagination">
                                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(page) => setCurrentPage(page)} />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <ManagementLeaveRequests />
            )}
            <ViolationRecordModal 
                isOpen={isViolationModalOpen} 
                onClose={() => {
                    setIsViolationModalOpen(false);
                    setEditingIncident(null);
                }}
                onSuccess={handleAddIncident}
                incidents={incidents}
                editData={editingIncident}
            />
            <IncidentHandleModal 
                isOpen={isHandleModalOpen}
                onClose={() => setIsHandleModalOpen(false)}
                incident={selectedIncident}
                onUpdateIncident={handleUpdateIncident}
            />
        </div>
    );
}

