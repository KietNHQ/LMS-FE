import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { PageHeader, WeekPicker, Pagination, StatusBadge, LoadingSpinner } from "../../../../components/common";
import { getWeekDateObjects } from "../../../../components/common/WeekPicker/WeekPicker";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import { normalizePermissions } from "../../../../hooks/useAuth";
import Select from "../../../../components/ui/Select/Select";
import { FiSearch, FiFilter, FiAward, FiAlertCircle, FiClock, FiCheckCircle, FiChevronLeft, FiChevronRight, FiPlus, FiDownload, FiCalendar, FiActivity, FiArrowRight, FiEdit2, FiTrash2, FiEyeOff, FiEye, FiUser, FiBarChart2, FiLayers, FiShield, FiCheck, FiAlertTriangle } from "react-icons/fi";
import { toast } from "react-toastify";
import DisciplineHeaderActions from "../components/DisciplineHeaderActions";
import ViolationRecordModal from "../components/ViolationRecordModal";
import IncidentHandleModal from "../components/IncidentHandleModal";
import ManagementLeaveRequests from "../../leave-requests/ManagementLeaveRequests";
import { vpDisciplineService } from "../../../../services/pages/management/vp-discipline";
import { resolveSemesterId, resolveSchoolYearId } from "../../../../services/shared/schoolYearLookup";
import "./VpDisciplineMgmt.css";

export default function VpDisciplineMgmt() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const queryClient = useQueryClient();
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
                const perms = normalizePermissions(user.permissions || []);
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

    // Resolve semesterId from selectedSchoolYear and selectedTerm
    const { data: resolvedSemesterId } = useQuery({
        queryKey: ["semester-id", selectedSchoolYear, selectedTerm],
        queryFn: () => resolveSemesterId(selectedSchoolYear, selectedTerm || "hk1"),
        enabled: Boolean(selectedSchoolYear),
        staleTime: 5 * 60 * 1000,
    });

    // Fetch incidents from real violations API
    const { data: incidents = [], isLoading: isIncidentsLoading, isError: isIncidentsError } = useQuery({
        queryKey: ["discipline-violations", resolvedSemesterId],
        queryFn: async () => {
            if (!resolvedSemesterId) return [];
            try {
                const res = await vpDisciplineService.callByKey("get_discipline_violations", {
                    params: { semesterId: resolvedSemesterId },
                });
                const raw = res?.data || [];
                return raw.map(e => ({
                    id: e.id,
                    student: e.student_name || "",
                    class: e.class_name || "",
                    grade: e.grade_name || "",
                    type: e.violation_name || e.violation_type || "",
                    level: e.violation_severity || e.severity || e.level || "low",
                    date: e.date || "",
                    reporter: e.verified_by_name || e.reporter || "",
                    status: e.status || "pending",
                    assignedTo: "",
                    description: e.notes || "",
                }));
            } catch {
                return [];
            }
        },
        enabled: Boolean(resolvedSemesterId),
        staleTime: 30_000,
    });

    // Expose incident actions for mutation invalidation
    const invalidateIncidents = () => {
        queryClient.invalidateQueries({ queryKey: ["discipline-escalations"] });
    };

    // ── Category Stats from Real API ──
    const { data: categoryStatsRaw } = useQuery({
        queryKey: ["discipline-category-stats", resolvedSemesterId],
        queryFn: async () => {
            if (!resolvedSemesterId) return [];
            try {
                const res = await vpDisciplineService.getCategoryStats(resolvedSemesterId);
                console.log("[DEBUG] getCategoryStats response:", res);
                return res?.violations || res?.data?.violations || [];
            } catch (err) {
                console.error("[DEBUG] getCategoryStats error:", err);
                return [];
            }
        },
        enabled: Boolean(resolvedSemesterId),
        staleTime: 30_000,
    });

    const categoryStats = useMemo(() => {
        if (!categoryStatsRaw || !Array.isArray(categoryStatsRaw) || categoryStatsRaw.length === 0) {
            return [
                { key: "attendance", title: "Chuyên cần", icon: <FiClock />, incidents: 0, detail: "0 học sinh", trend: "—", level: "—", status: "neutral" },
                { key: "discipline", title: "Nề nếp", icon: <FiUser />, incidents: 0, detail: "0 học sinh", trend: "—", level: "—", status: "neutral" },
                { key: "property", title: "Tài sản", icon: <FiLayers />, incidents: 0, detail: "0 học sinh", trend: "—", level: "—", status: "neutral" },
                { key: "academic", title: "Học tập", icon: <FiAlertCircle />, incidents: 0, detail: "0 học sinh", trend: "—", level: "—", status: "neutral" },
            ];
        }
        const catMap = {
            attendance: { title: "Chuyên cần", icon: <FiClock />, status: "warning" },
            discipline: { title: "Nề nếp", icon: <FiUser />, status: "success" },
            property: { title: "Tài sản", icon: <FiLayers />, status: "neutral" },
            academic: { title: "Học tập", icon: <FiAlertCircle />, status: "critical" },
        };
        const result = [];
        const keys = ["attendance", "discipline", "property", "academic"];
        keys.forEach(key => {
            const item = categoryStatsRaw.find(v => v.category === key);
            const info = catMap[key] || { title: key, icon: <FiAlertCircle />, status: "neutral" };
            const count = item?.total_count || 0;
            const students = item?.unique_students || 0;
            result.push({
                ...info,
                key, // unique key
                incidents: count,
                detail: `${students} học sinh`,
                trend: "—",
                level: count > 20 ? "Nghiêm trọng" : (count > 10 ? "Cần chú ý" : "Bình thường"),
            });
        });
        return result;
    }, [categoryStatsRaw]);

    const approveMutation = useMutation({
        mutationFn: async (id) => {
            return vpDisciplineService.callByKey("put_discipline_violations_by_id_approve", {
                pathParams: { id },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["discipline-violations"] });
            queryClient.invalidateQueries({ queryKey: ["discipline-category-stats"] });
            toast.success("Duyệt vi phạm thành công. Đã cập nhật điểm thi đua và hạnh kiểm!");
        },
        onError: (err) => {
            toast.error(err?.message || "Lỗi khi duyệt vi phạm.");
        }
    });

    const handleApproveIncident = (id) => {
        if (window.confirm("Bạn có chắc chắn muốn duyệt vi phạm này? Hệ thống sẽ trừ điểm thi đua của lớp và hạnh kiểm của học sinh.")) {
            approveMutation.mutate(id);
        }
    };

    const handleAddIncident = (newInc, isEdit = false) => {
        // Mutation is handled by ViolationRecordModal; just refresh the list
        invalidateIncidents();
        setEditingIncident(null);
        setIsViolationModalOpen(false);
    };

    const handleEditIncident = (inc) => {
        setEditingIncident(inc);
        setIsViolationModalOpen(true);
    };

    const handleDeleteIncident = (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa hồ sơ vi phạm này? Hành động này không thể hoàn tác.")) {
            // TODO: Wire up DELETE endpoint when available; invalidate to refresh
            invalidateIncidents();
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

    const handleOpenIncident = (incident) => {
        setSelectedIncident(incident);
        setIsHandleModalOpen(true);
    };

    // Fetch classes from API
    const { data: classesData } = useQuery({
        queryKey: ["classes-for-discipline", selectedSchoolYear, selectedGrade],
        queryFn: async () => {
            const resolvedSchoolYearId = await resolveSchoolYearId(selectedSchoolYear);
            const res = await vpDisciplineService.callByKey("get_classes", {
                params: { schoolYearId: resolvedSchoolYearId, gradeLevelId: selectedGrade === "all" ? undefined : parseInt(selectedGrade) },
            });
            return res?.data || [];
        },
        select: (data) => (Array.isArray(data) ? data : data?.data || []),
        staleTime: 5 * 60_000,
    });

    // Fetch grade levels from API
    const { data: gradeLevelsData } = useQuery({
        queryKey: ["grade-levels-for-discipline"],
        queryFn: async () => {
            const res = await vpDisciplineService.getGradeLevels();
            return res?.data || [];
        },
        staleTime: 10 * 60_000,
    });

    // Fetch violation types from API
    const { data: violationTypesData } = useQuery({
        queryKey: ["violation-types-for-discipline"],
        queryFn: async () => {
            const res = await vpDisciplineService.callByKey("get_violation_types");
            return res?.data || res || [];
        },
        staleTime: 10 * 60_000,
    });

    // Build grade options from API
    const gradeOptions = useMemo(() => {
        const defaultOption = [{ value: "all", label: "Tất cả" }];
        if (!gradeLevelsData?.length) return defaultOption;
        const apiOptions = gradeLevelsData
            .map(gl => ({
                value: String(gl.level_number || gl.levelNumber || gl.id),
                label: gl.name || `Khối ${gl.level_number || gl.levelNumber}`,
            }))
            .sort((a, b) => parseInt(a.value) - parseInt(b.value));
        return [...defaultOption, ...apiOptions];
    }, [gradeLevelsData]);

    // Build violation type filter options from API
    const violationTypeOptions = useMemo(() => {
        const defaultOption = [{ value: "all", label: "Tất cả" }];
        if (!violationTypesData?.length) return defaultOption;
        const apiOptions = violationTypesData.map(vt => ({
            value: vt.id?.toString() || vt.name,
            label: vt.name || vt.violation_name || "",
        }));
        return [...defaultOption, ...apiOptions];
    }, [violationTypesData]);

    // Severity options (constant values, could come from config in future)
    const severityOptions = useMemo(() => [
        { value: "all", label: "Tất cả" },
        { value: "low", label: "Nhẹ" },
        { value: "med", label: "Vừa" },
        { value: "high", label: "Nghiêm trọng" },
    ], []);

    const classOptions = useMemo(() => {
        const defaultOption = { value: "all", label: "Tất cả" };
        if (!classesData || !classesData.length) return { "all": [defaultOption], [selectedGrade]: [defaultOption] };
        
        const mapped = classesData.map(c => ({
            value: c.class_name || c.name || c.id || "",
            label: c.class_name || c.name || ""
        }));
        
        return {
            "all": [defaultOption, ...mapped],
            [selectedGrade]: [defaultOption, ...mapped]
        };
    }, [classesData, selectedGrade]);

    const isDataLoading = isIncidentsLoading || isLoading;

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 300);
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

        const { start: weekStart, end: weekEnd } = getWeekDateObjects(selectedWeek);
        const incDate = new Date(inc.date);
        const matchWeek = incDate >= weekStart && incDate <= weekEnd;

        const matchGrade = selectedGrade === "all" || 
            (inc.grade || "").toLowerCase().includes(selectedGrade.toLowerCase()) ||
            selectedGrade.toLowerCase() === (inc.grade || "").replace(/khối\s*/i, "").trim();
        const matchClass = selectedClass === "all" || (inc.class || "").toLowerCase().includes(selectedClass.toLowerCase());
        const matchType = selectedViolationType === "all" || (inc.type || "").toLowerCase().includes(selectedViolationType.toLowerCase()) || (selectedViolationType === "late" && (inc.type || "") === "Đi trễ") || (selectedViolationType === "absence" && (inc.type || "").includes("Vắng"));
        const matchSeverity = selectedSeverity === "all" || inc.level === selectedSeverity;
        return matchWeek && matchGrade && matchClass && matchType && matchSeverity;
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
                        {categoryStats.map((cat) => (
                            <div key={cat.key} className={`dm-status-card ${cat.status}`}>
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
                                            <Select variant="custom" value={selectedGrade} onChange={(e) => { setSelectedGrade(e.target.value); setSelectedClass("all"); }} options={gradeOptions} />
                                        </div>
                                        {selectedGrade !== "all" && (
                                            <div className="filter-group animate-slide-in">
                                                <label><FiLayers /> Lớp</label>
                                                <Select variant="custom" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} options={classOptions[selectedGrade] || [{ value: "all", label: "Tất cả" }]} />
                                            </div>
                                        )}
                                        <div className="filter-group">
                                            <label><FiAlertCircle /> Loại lỗi</label>
                                            <Select variant="custom" value={selectedViolationType} onChange={(e) => setSelectedViolationType(e.target.value)} options={violationTypeOptions} />
                                        </div>
                                        <div className="filter-group">
                                            <label><FiActivity /> Mức độ</label>
                                            <Select variant="custom" value={selectedSeverity} onChange={(e) => setSelectedSeverity(e.target.value)} options={severityOptions} />
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

                            {isDataLoading ? (
                                <div className="ui-table-loading">
                                    <LoadingSpinner size="lg" label="Đang cập nhật hồ sơ nề nếp..." />
                                </div>
                            ) : isIncidentsError ? (
                                <div className="ui-table-loading">
                                    <p style={{ color: "var(--color-danger)" }}>Không thể tải dữ liệu sự vụ.</p>
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
                                                {paginatedIncidents.map((incident, index) => (
                                                    <tr key={incident.id || `incident-${index}`} className="row-hover-effect">
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
                                                                {incident.status === 'processing' ? 'Đang xử lý' : 
                                                                 incident.status === 'resolved' ? 'Đã giải quyết' : 
                                                                 incident.status === 'closed' ? 'Đã đóng' : 
                                                                 incident.status === 'approved' ? 'Đã duyệt' : 
                                                                 incident.status === 'rejected' ? 'Từ chối' : 'Mới'}
                                                            </StatusBadge>
                                                        </td>
                                                        <td><span className="td-time">{new Date(incident.date).toLocaleDateString('vi-VN')}</span></td>
                                                        <td className="dm-td-actions">
                                                            <div className="dm-action-group">
                                                                <button className="dm-btn-action edit" title="Sửa" onClick={() => handleEditIncident(incident)}><FiEdit2 /></button>
                                                                {incident.status === 'pending' && (
                                                                    <button className="dm-btn-action process" title="Duyệt vi phạm" onClick={() => handleApproveIncident(incident.id)} style={{ color: 'var(--color-success)', borderColor: 'var(--color-success)' }}>
                                                                        <FiCheck />
                                                                    </button>
                                                                )}
                                                                <button className="dm-btn-action process" title="Xử lý / Leo thang" onClick={() => handleOpenIncident(incident)}><FiActivity /></button>
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
                <div className="leave-requests-wrapper">
                    <ManagementLeaveRequests />
                </div>
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
                onUpdateIncident={invalidateIncidents}
            />
        </div>
    );
}

