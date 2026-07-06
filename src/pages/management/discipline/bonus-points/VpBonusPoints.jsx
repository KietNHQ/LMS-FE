/**
 * VpBonusPoints - Bonus Points Management Page
 * Quản lý điểm cộng theo TT22
 */

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
    FiStar, FiAward, FiUsers, FiFilter,
    FiPlus, FiCheck, FiX, FiTrendingUp, FiFileText
} from "react-icons/fi";
import { toast } from "react-toastify";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import { LoadingSpinner } from "../../../../components/common";
import Select from "../../../../components/ui/Select/Select";
import Pagination from "../../../../components/ui/Pagination/Pagination";
import vpBonusPointService from "../../../../services/pages/management/vp-discipline/vpBonusPointService";
import { vpDisciplineService } from "../../../../services/pages/management/vp-discipline";
import { resolveSchoolYearId, resolveSemesterId } from "../../../../services/shared/schoolYearLookup";
import "./VpBonusPoints.css";

const CATEGORY_LABELS = {
    CLUB: "Câu lạc bộ",
    VOLUNTEER: "Tình nguyện",
    COMPETITION: "Thi đấu",
    CERTIFICATE: "Chứng chỉ",
};

const CATEGORY_COLORS = {
    CLUB: "#3b82f6",
    VOLUNTEER: "#10b981",
    COMPETITION: "#f59e0b",
    CERTIFICATE: "#8b5cf6",
};

const getRows = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.students)) return payload.students;
    if (Array.isArray(payload?.data?.students)) return payload.data.students;
    return [];
};

const getSummary = (payload) => payload?.summary || payload?.data?.summary || null;

const toNumber = (value, fallback = 0) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
};

export default function VpBonusPoints() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();

    const { data: schoolYearId } = useQuery({
        queryKey: ["school-year-id", selectedSchoolYear],
        queryFn: () => resolveSchoolYearId(selectedSchoolYear),
        enabled: Boolean(selectedSchoolYear),
    });
    
    // Resolve semesterId for API calls
    const { data: semesterId } = useQuery({
        queryKey: ["semester-id", selectedSchoolYear, selectedTerm],
        queryFn: () => resolveSemesterId(selectedSchoolYear, selectedTerm || "hk1"),
        enabled: Boolean(selectedSchoolYear),
    });
    
    // State
    const [isLoading, setIsLoading] = useState(true);
    const [rules, setRules] = useState([]);
    const [students, setStudents] = useState([]);
    const [classSummary, setClassSummary] = useState(null);
    
    // Filters
    const [selectedGrade, setSelectedGrade] = useState("all");
    const [selectedClass, setSelectedClass] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    
    // Award form state
    const [awardForm, setAwardForm] = useState({
        enrollmentId: "",
        ruleCode: "",
        semesterId: "",
        value: "",
        notes: "",
    });

    const selectedClassSummary = useQuery({
        queryKey: ["bonus-class-summary", selectedClass, schoolYearId, semesterId],
        queryFn: async () => {
            const res = await vpBonusPointService.getClassBonusPointsSummary(selectedClass, {
                schoolYearId,
                semesterId,
            });
            return res?.data || res;
        },
        enabled: Boolean(selectedClass && selectedClass !== "all" && schoolYearId),
        staleTime: 30_000,
    });

    // Fetch classes from API
    const { data: classesData = [] } = useQuery({
        queryKey: ["classes-for-bonus", selectedSchoolYear, selectedGrade],
        queryFn: async () => {
            const res = await vpDisciplineService.callByKey("get_classes", {
                params: { schoolYearId, gradeLevelId: selectedGrade === "all" ? undefined : parseInt(selectedGrade) },
            });
            return res?.data || [];
        },
        select: (data) => (Array.isArray(data) ? data : data?.data || []),
        enabled: Boolean(schoolYearId),
        staleTime: 5 * 60_000,
    });

    // Build class options from API
    const classOptions = useMemo(() => {
        const grouped = {};
        classesData.forEach(c => {
            const grade = String(c.grade_level || c.gradeLevel || (c.name || "").slice(0, 2));
            if (!grouped[grade]) grouped[grade] = [];
            grouped[grade].push({ value: c.id || c.name || c.class_name || "", label: c.name || c.class_name || "" });
        });
        return grouped;
    }, [classesData]);

    // Fetch grade levels from API
    const { data: gradeLevelsData = [] } = useQuery({
        queryKey: ["grade-levels-bonus-page"],
        queryFn: async () => {
            const res = await vpDisciplineService.getGradeLevels();
            return res?.data || [];
        },
        staleTime: 10 * 60_000,
    });

    // Build grade options from API
    const gradeOptions = useMemo(() => {
        const defaultOption = [{ value: "all", label: "Tất cả khối" }];
        if (!gradeLevelsData.length) {
            return defaultOption;
        }
        const apiOptions = gradeLevelsData
            .map(gl => ({
                value: String(gl.level_number || gl.levelNumber || gl.id),
                label: gl.name || `Khối ${gl.level_number || gl.levelNumber}`,
            }))
            .sort((a, b) => parseInt(a.value) - parseInt(b.value));
        return [...defaultOption, ...apiOptions];
    }, [gradeLevelsData]);

    // Fetch students for selected class from API
    const { data: apiStudents = [] } = useQuery({
        queryKey: ["class-students-bonus", selectedClass, semesterId],
        queryFn: async () => {
            if (!selectedClass || selectedClass === "all") return [];
            try {
                const res = await vpDisciplineService.callByKey("get_classes_by_id_students", {
                    pathParams: { id: selectedClass },
                });
                return res?.data || res || [];
            } catch {
                return [];
            }
        },
        enabled: Boolean(selectedClass && selectedClass !== "all"),
        staleTime: 30_000,
    });

    // Transform API students
    const apiFormattedStudents = useMemo(() => {
        const classBonusRows = getRows(selectedClassSummary.data);
        const bonusByEnrollmentId = new Map(
            classBonusRows.map((row) => [
                String(row.enrollment_id || row.enrollmentId || row.id),
                row,
            ])
        );

        return apiStudents.map(s => {
            const enrollmentId = s.enrollmentId || s.studentEnrollmentId || s.enrollment_id || s.id;
            const bonusRow = bonusByEnrollmentId.get(String(enrollmentId));
            return ({
            id: s.id || s.student_id || s.enrollmentId,
            enrollmentId,
            studentCode: s.student_code || s.code || s.id || "",
            name: s.name || s.full_name || s.studentName || "",
            className: s.class_name || s.className || s.class || "",
            grade: s.grade || s.grade_level || s.gradeLevel || "",
            totalBonus: toNumber(bonusRow?.total_bonus_points || bonusRow?.totalBonus),
            bonusCount: toNumber(bonusRow?.bonus_count || bonusRow?.bonusCount),
            });
        });
    }, [apiStudents, selectedClassSummary.data]);

    useEffect(() => {
        setStudents(apiFormattedStudents);
    }, [apiFormattedStudents]);

    useEffect(() => {
        const summaryFromApi = getSummary(selectedClassSummary.data);
        if (summaryFromApi) {
            setClassSummary(summaryFromApi);
            return;
        }

        const totalAwards = apiFormattedStudents.reduce((sum, student) => sum + toNumber(student.bonusCount), 0);
        const totalPoints = apiFormattedStudents.reduce((sum, student) => sum + toNumber(student.totalBonus), 0);
        setClassSummary({
            totalStudents: apiFormattedStudents.length,
            totalAwards,
            totalPoints,
        });
    }, [apiFormattedStudents, selectedClassSummary.data]);

    // Load data
    useEffect(() => {
        loadData();
    }, [selectedSchoolYear, selectedTerm, apiFormattedStudents]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Load rules
            const rulesResponse = await vpBonusPointService.getBonusPointRules();
            if (rulesResponse?.rules) {
                setRules(rulesResponse.rules);
            } else if (rulesResponse?.data?.rules) {
                setRules(rulesResponse.data.rules);
            } else if (Array.isArray(rulesResponse)) {
                setRules(rulesResponse);
            } else {
                setRules([]);
            }
            
            setStudents(apiFormattedStudents);
        } catch (error) {
            console.error("Failed to load bonus points data:", error);
            setStudents([]);
            setClassSummary({ totalStudents: 0, totalAwards: 0, totalPoints: 0 });
            toast.error("Không thể tải dữ liệu điểm cộng.");
        } finally {
            setIsLoading(false);
        }
    };

    // Filter students
    const filteredStudents = useMemo(() => {
        return students.filter(student => {
            const matchGrade = selectedGrade === "all" || student.grade === selectedGrade;
            const matchClass = selectedClass === "all" || selectedClass === "all" || student.className === selectedClass;
            const matchSearch = searchTerm === "" || 
                student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.studentCode.toLowerCase().includes(searchTerm.toLowerCase());
            return matchGrade && matchClass && matchSearch;
        });
    }, [students, selectedGrade, selectedClass, searchTerm]);

    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
    const paginatedStudents = filteredStudents.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Group rules by category
    const rulesByCategory = useMemo(() => {
        const grouped = {};
        rules.forEach(rule => {
            const cat = rule.category || "OTHER";
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(rule);
        });
        return grouped;
    }, [rules]);

    // Open award modal
    const openAwardModal = (student = null) => {
        if (student) {
            setAwardForm({
                enrollmentId: student.enrollmentId,
                ruleCode: "",
                semesterId: selectedTerm,
                value: "",
                notes: "",
            });
        } else {
            setAwardForm({
                enrollmentId: "",
                ruleCode: "",
                semesterId: selectedTerm,
                value: "",
                notes: "",
            });
        }
        setEditingRecord(null);
        setIsModalOpen(true);
    };

    // Handle award submission
    const handleAwardSubmit = async () => {
        if (!awardForm.ruleCode) {
            toast.error("Vui lòng chọn loại điểm cộng!");
            return;
        }

        try {
            const rule = rules.find(r => r.code === awardForm.ruleCode);
            const value = awardForm.value || rule?.per_semester || rule?.per_year || rule?.flat_amount || 0.1;

            await vpBonusPointService.awardBonusPoint({
                enrollmentId: awardForm.enrollmentId,
                ruleCode: awardForm.ruleCode,
                schoolYearId: selectedSchoolYear,
                semesterId: awardForm.semesterId,
                value,
                notes: awardForm.notes,
            });

            toast.success(`Đã cộng ${value} điểm cho học sinh!`);
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            toast.error("Không thể cộng điểm: " + error.message);
        }
    };

    // Get value display for a rule
    const getRuleValueDisplay = (rule) => {
        if (rule.flat_amount) return `+${rule.flat_amount}`;
        if (rule.per_semester) return `+${rule.per_semester}/HK`;
        if (rule.per_year) return `+${rule.per_year}/Năm`;
        return "+0.1";
    };

    return (
        <div className="vp-bonus-points">
            {/* Header */}
            <div className="bp-header">
                <div className="bp-header-content">
                    <div className="bp-title-section">
                        <div className="bp-icon-wrapper">
                            <FiStar />
                        </div>
                        <div>
                            <h1>Bảng Điểm Cộng</h1>
                            <p>Quản lý điểm cộng theo Thông tư 22 - Hoạt động ngoại khóa</p>
                        </div>
                    </div>
                    <div className="bp-header-actions">
                        <button className="bp-btn-primary" onClick={() => openAwardModal()}>
                            <FiPlus /> Cộng điểm
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="bp-summary-grid">
                <div className="bp-summary-card">
                    <div className="bp-summary-icon" style={{ background: "#3b82f6" }}>
                        <FiUsers />
                    </div>
                    <div className="bp-summary-content">
                        <span className="bp-summary-value">{classSummary?.totalStudents || 0}</span>
                        <span className="bp-summary-label">Tổng HS</span>
                    </div>
                </div>
                <div className="bp-summary-card">
                    <div className="bp-summary-icon" style={{ background: "#10b981" }}>
                        <FiAward />
                    </div>
                    <div className="bp-summary-content">
                        <span className="bp-summary-value">{classSummary?.totalAwards || 0}</span>
                        <span className="bp-summary-label">Đã cộng điểm</span>
                    </div>
                </div>
                <div className="bp-summary-card">
                    <div className="bp-summary-icon" style={{ background: "#f59e0b" }}>
                        <FiTrendingUp />
                    </div>
                    <div className="bp-summary-content">
                        <span className="bp-summary-value">+{classSummary?.totalPoints?.toFixed(1) || 0}</span>
                        <span className="bp-summary-label">Tổng điểm cộng</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="bp-main-container">
                {/* Rules Reference */}
                <div className="bp-rules-panel">
                    <h3><FiFileText /> Quy tắc điểm cộng</h3>
                    <div className="bp-rules-grid">
                        {Object.entries(rulesByCategory).map(([category, categoryRules]) => (
                            <div key={category} className="bp-rules-category">
                                <h4 style={{ color: CATEGORY_COLORS[category] || "#6b7280" }}>
                                    {CATEGORY_LABELS[category] || category}
                                </h4>
                                <ul>
                                    {categoryRules.map(rule => (
                                        <li key={rule.code}>
                                            <span className="rule-name">{rule.name_vi || rule.name}</span>
                                            <span className="rule-value" style={{ color: CATEGORY_COLORS[category] }}>
                                                {getRuleValueDisplay(rule)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Student Table */}
                <div className="bp-students-panel">
                    <div className="bp-panel-header">
                        <h3><FiUsers /> Danh sách học sinh</h3>
                        <div className="bp-filters">
                            <div className="bp-filter-group">
                                <Select
                                    variant="custom"
                                    value={selectedGrade}
                                    onChange={(e) => {
                                        setSelectedGrade(e.target.value);
                                        setSelectedClass("all");
                                    }}
                                    options={gradeOptions}
                                />
                            </div>
                            {selectedGrade !== "all" && (
                                <div className="bp-filter-group">
                                    <Select
                                        variant="custom"
                                        value={selectedClass}
                                        onChange={(e) => setSelectedClass(e.target.value)}
                                        options={[
                                            { value: "all", label: "Tất cả lớp" },
                                            ...(classOptions[selectedGrade] || []),
                                        ]}
                                    />
                                </div>
                            )}
                            <div className="bp-search-input">
                                <FiFilter />
                                <input
                                    type="text"
                                    placeholder="Tìm học sinh..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="bp-loading">
                            <LoadingSpinner size="lg" label="Đang tải dữ liệu..." />
                        </div>
                    ) : (
                        <>
                            <div className="bp-table-wrapper">
                                <table className="bp-table">
                                    <thead>
                                        <tr>
                                            <th>STT</th>
                                            <th>Mã HS</th>
                                            <th>Họ tên</th>
                                            <th>Lớp</th>
                                            <th>Điểm cộng</th>
                                            <th>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedStudents.map((student, index) => (
                                            <tr key={student.id}>
                                                <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                <td>{student.studentCode}</td>
                                                <td className="bp-student-name">{student.name}</td>
                                                <td>
                                                    <span className="bp-class-badge">{student.className}</span>
                                                </td>
                                                <td>
                                                    <span className={`bp-bonus-badge ${student.totalBonus > 0 ? 'has-bonus' : ''}`}>
                                                        +{student.totalBonus.toFixed(1)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="bp-action-buttons">
                                                        <button
                                                            className="bp-btn-action award"
                                                            title="Cộng điểm"
                                                            onClick={() => openAwardModal(student)}
                                                        >
                                                            <FiPlus />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {paginatedStudents.length === 0 && (
                                            <tr>
                                                <td colSpan="6" className="bp-empty-row">
                                                    Không có học sinh nào
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="bp-pagination-wrapper">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Award Modal */}
            {isModalOpen && (
                <div className="bp-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="bp-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="bp-modal-header">
                            <h3>
                                <FiAward /> Cộng Điểm Cộng
                            </h3>
                            <button className="bp-modal-close" onClick={() => setIsModalOpen(false)}>
                                <FiX />
                            </button>
                        </div>
                        <div className="bp-modal-body">
                            <div className="bp-form-group">
                                <label>Chọn loại điểm cộng</label>
                                <div className="bp-rules-selector">
                                    {Object.entries(rulesByCategory).map(([category, categoryRules]) => (
                                        <div key={category} className="bp-rule-category-group">
                                            <h5 style={{ color: CATEGORY_COLORS[category] }}>
                                                {CATEGORY_LABELS[category]}
                                            </h5>
                                            {categoryRules.map(rule => (
                                                <label key={rule.code} className="bp-rule-option">
                                                    <input
                                                        type="radio"
                                                        name="ruleCode"
                                                        value={rule.code}
                                                        checked={awardForm.ruleCode === rule.code}
                                                        onChange={() => setAwardForm(prev => ({
                                                            ...prev,
                                                            ruleCode: rule.code,
                                                            value: rule.flat_amount || rule.per_semester || rule.per_year || "",
                                                        }))}
                                                    />
                                                    <span className="rule-label">
                                                        {rule.name_vi || rule.name}
                                                    </span>
                                                    <span className="rule-value" style={{ color: CATEGORY_COLORS[category] }}>
                                                        {getRuleValueDisplay(rule)}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bp-form-row">
                                <div className="bp-form-group">
                                    <label>Giá trị điểm cộng</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={awardForm.value}
                                        onChange={(e) => setAwardForm(prev => ({ ...prev, value: e.target.value }))}
                                        placeholder="0.1"
                                    />
                                </div>
                                <div className="bp-form-group">
                                    <label>Ghi chú</label>
                                    <input
                                        type="text"
                                        value={awardForm.notes}
                                        onChange={(e) => setAwardForm(prev => ({ ...prev, notes: e.target.value }))}
                                        placeholder="Ghi chú bổ sung..."
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="bp-modal-footer">
                            <button className="bp-btn-secondary" onClick={() => setIsModalOpen(false)}>
                                Hủy
                            </button>
                            <button className="bp-btn-primary" onClick={handleAwardSubmit}>
                                <FiCheck /> Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
