import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader, Pagination, EmptyState } from "../../../../components/common";
import DisciplineHeaderActions from "../components/DisciplineHeaderActions";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import Select from "../../../../components/ui/Select/Select";
import {
    FiAlertCircle, FiCheckCircle, FiSave, FiSearch,
    FiLayers, FiTrendingUp, FiTrendingDown, FiMinus,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import { vpDisciplineService } from "../../../../services/pages/management/vp-discipline";
import { getWeekDateRange } from "../../../../utils/competitionUtils";
import "./VpDisciplineConduct.css";

const ITEMS_PER_PAGE = 7;
const DEFAULT_WEEK = 1;

function mapStudentScore(s) {
    return {
        enrollmentId: s.enrollmentId || s.enrollment_id,
        studentId: s.studentId || s.student_id,
        studentCode: s.studentCode || s.student_code,
        studentName: s.studentName || s.student_name || "",
        className: s.className || s.class_name || "",
        rewardPoints: s.rewardPoints ?? s.reward_points ?? 0,
        rewardCount: s.rewardCount ?? s.reward_count ?? 0,
        violationPoints: s.violationPoints ?? s.violation_points ?? 0,
        violationCount: s.violationCount ?? s.violation_count ?? 0,
        disciplineScore: s.disciplineScore ?? s.discipline_score ?? 100,
    };
}

const GRADE_OPTIONS = [
    { value: "", label: "Chưa cập nhật" },
    { value: "Tốt", label: "Tốt" },
    { value: "Khá", label: "Khá" },
    { value: "Trung bình", label: "Trung bình" },
    { value: "Yếu", label: "Yếu" },
];

export default function VpDisciplineConduct({ isEmbedded = false }) {
    const [searchParams] = useSearchParams();
    const urlClass = searchParams.get("class");
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();

    const [selectedGrade, setSelectedGrade] = useState("10");
    const [selectedClass, setSelectedClass] = useState(urlClass || "");
    const [selectedWeek, setSelectedWeek] = useState(DEFAULT_WEEK);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [conductGrades, setConductGrades] = useState({});

    useEffect(() => {
        if (urlClass) {
            setSelectedClass(urlClass);
            const grade = urlClass.slice(0, 2);
            if (["10", "11", "12"].includes(grade)) setSelectedGrade(grade);
        }
    }, [urlClass]);

    // Load class list
    const { data: classesData } = useQuery({
        queryKey: ["classes-for-conduct", selectedSchoolYear],
        queryFn: async () => {
            const res = await vpDisciplineService.callByKey("get_classes", {
                params: { schoolYearId: selectedSchoolYear, gradeLevelId: selectedGrade === "all" ? undefined : parseInt(selectedGrade) },
            });
            return res?.data || [];
        },
        select: (data) => (Array.isArray(data) ? data : data?.data || []),
        staleTime: 5 * 60_000,
    });

    const classOptions = useMemo(() => {
        if (!classesData) return [];
        return classesData.map((c) => ({
            value: c.id || c.name || c.class_name || "",
            label: c.name || c.class_name || "",
            grade: String(c.grade_level || c.gradeLevel || (c.name || "").slice(0, 2)),
        }));
    }, [classesData]);

    // Compute date range from week
    const { startDate, endDate } = useMemo(
        () => getWeekDateRange(selectedSchoolYear, selectedTerm, selectedWeek),
        [selectedSchoolYear, selectedTerm, selectedWeek],
    );

    // Load student scores for selected class
    const { data: scoresData, isLoading: scoresLoading, isError: scoresError } = useQuery({
        queryKey: ["discipline-class-scores", selectedClass, startDate, endDate],
        queryFn: async () => {
            if (!selectedClass || !startDate || !endDate) return [];
            const res = await vpDisciplineService.callByKey("get_discipline_class_by_classid_scores", {
                pathParams: { classId: selectedClass },
                params: { startDate, endDate },
            });
            return res?.data || [];
        },
        select: (data) => {
            if (Array.isArray(data)) return data.map(mapStudentScore);
            if (data?.data) return data.data.map(mapStudentScore);
            return [];
        },
        enabled: Boolean(selectedClass && startDate && endDate),
        staleTime: 30_000,
    });

    const studentList = useMemo(() => {
        if (!scoresData) return [];
        return scoresData.filter((s) => {
            const matchesSearch = s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (s.studentCode || "").toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        });
    }, [scoresData, searchTerm]);

    const totalPages = Math.max(1, Math.ceil(studentList.length / ITEMS_PER_PAGE));
    const safePage = Math.min(Math.max(1, currentPage), totalPages);

    useEffect(() => {
        setCurrentPage((prev) => Math.min(prev, totalPages));
    }, [totalPages]);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedClass, searchTerm]);

    const paginatedStudents = useMemo(() => {
        const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
        return studentList.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [studentList, safePage]);

    const handleGradeChange = (enrollmentId, newGrade) => {
        setConductGrades((prev) => ({ ...prev, [enrollmentId]: newGrade }));
    };

    const handleSave = () => {
        toast.success(`Đã lưu dự kiến hạnh kiểm cho ${classOptions.find((c) => c.value === selectedClass)?.label || selectedClass}`);
    };

    const handleApprove = () => {
        const ungraded = studentList.filter((s) => !conductGrades[s.enrollmentId] && !s.grade);
        if (ungraded.length > 0) {
            toast.error(`Không thể phê duyệt! Còn ${ungraded.length} học sinh chưa được đánh giá hạnh kiểm.`);
            return;
        }
        toast.success(`Đã phê duyệt dự kiến hạnh kiểm. Thông báo đã được gửi đến GVCN, Phụ huynh và Học sinh.`);
    };

    // Suggest grade based on violation count
    const suggestGrade = (violationCount) => {
        if (violationCount === 0) return "Tốt";
        if (violationCount <= 3) return "Khá";
        if (violationCount <= 7) return "Trung bình";
        return "Yếu";
    };

    // Filter class options by grade
    const filteredClassOptions = useMemo(() => {
        if (selectedGrade === "all") return classOptions;
        return classOptions.filter((c) => c.grade === selectedGrade);
    }, [classOptions, selectedGrade]);

    const conductStats = useMemo(() => {
        if (!studentList.length) return [
            { title: "Hạnh kiểm Tốt", val: "—", sub: "", icon: <FiCheckCircle />, color: "success" },
            { title: "Biến động tích cực", val: "—", sub: "", icon: <FiTrendingUp />, color: "primary" },
            { title: "Cần Can Thiệp", val: "—", sub: "", icon: <FiAlertCircle />, color: "danger" },
            { title: "Chưa Phê Duyệt", val: "—", sub: "", icon: <FiCheckCircle />, color: "warning" },
        ];

        const good = studentList.filter((s) => {
            const g = conductGrades[s.enrollmentId] || s.grade;
            return g === "Tốt";
        }).length;
        const improved = studentList.filter((s) => s.violationCount < (s.violationCount_prev || s.violationCount + 1)).length;
        const needsHelp = studentList.filter((s) => s.violationCount > 5).length;
        const ungraded = studentList.filter((s) => !conductGrades[s.enrollmentId] && !s.grade).length;

        return [
            { title: "Hạnh kiểm Tốt", val: good, sub: "học sinh", icon: <FiCheckCircle />, color: "success" },
            { title: "Tiến bộ", val: improved, sub: "học sinh", icon: <FiTrendingUp />, color: "primary" },
            { title: "Cần Can Thiệp", val: needsHelp, sub: "học sinh", icon: <FiAlertCircle />, color: "danger" },
            { title: "Chưa Đánh giá", val: ungraded, sub: "học sinh", icon: <FiCheckCircle />, color: "warning" },
        ];
    }, [studentList, conductGrades]);

    return (
        <div className="vp-conduct vp-discipline-layout">
            {!isEmbedded && (
                <PageHeader
                    title="Dự Kiến Hạnh Kiểm"
                    actions={
                        <DisciplineHeaderActions
                            selectedSchoolYear={selectedSchoolYear}
                            selectedTerm={selectedTerm}
                            onYearChange={handleYearArrow}
                            onTermChange={handleTermChange}
                        />
                    }
                />
            )}

            {/* Top Metrics */}
            <div className="cd-stats-grid">
                {conductStats.map((card, idx) => (
                    <div key={idx} className={`cd-stat-card ${card.color}`}>
                        <div className="stat-card-icon">{card.icon}</div>
                        <div className="stat-card-content">
                            <span className="stat-label">{card.title}</span>
                            <span className="stat-value">{card.val}</span>
                            <span className="stat-sub">{card.sub}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Integrated Toolbar */}
            <div className="dm-toolbar-integrated">
                <div className="dm-filters-complex">
                    <div className="filter-group">
                        <label><FiLayers /> Khối</label>
                        <Select
                            variant="custom"
                            value={selectedGrade}
                            onChange={(e) => {
                                const newGrade = e.target.value;
                                setSelectedGrade(newGrade);
                                const firstClass = filteredClassOptions.find((c) => !newGrade || newGrade === "all" || c.grade === newGrade);
                                if (firstClass) setSelectedClass(firstClass.value);
                            }}
                            options={[
                                { value: "10", label: "Khối 10" },
                                { value: "11", label: "Khối 11" },
                                { value: "12", label: "Khối 12" },
                            ]}
                        />
                    </div>
                    <div className="filter-group">
                        <label><FiLayers /> Lớp</label>
                        <Select
                            variant="custom"
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            options={filteredClassOptions.map((c) => ({ value: c.value, label: c.label }))}
                        />
                    </div>
                    <div className="filter-group">
                        <label><FiLayers /> Tuần</label>
                        <select
                            value={selectedWeek}
                            onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                            style={{
                                border: "1px solid #cbd5e1",
                                borderRadius: "0.5rem",
                                padding: "0.45rem 0.6rem",
                                fontSize: "0.88rem",
                                width: "100%",
                            }}
                        >
                            {Array.from({ length: 18 }, (_, i) => i + 1).map((w) => (
                                <option key={w} value={w}>Tuần {w}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-group" style={{ minWidth: "200px" }}>
                        <label><FiSearch /> Tìm học sinh</label>
                        <div className="ihm-search-box" style={{ margin: 0 }}>
                            <input
                                placeholder="Tên học sinh..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="dm-primary-actions-compact">
                    <button className="btn-save-draft" onClick={handleSave}>
                        <FiSave /> Lưu Bản Nháp
                    </button>
                    <button className="btn-add-violation-premium" style={{ width: "auto" }} onClick={handleApprove}>
                        <FiCheckCircle /> Phê Duyệt & Gửi Thông Báo
                    </button>
                </div>
            </div>

            <div className="cd-main-panel animate-fade-in">
                <div className="panel-header">
                    <h3>Dự Kiến Hạnh Kiểm: {classOptions.find((c) => c.value === selectedClass)?.label || selectedClass || "—"}</h3>
                    <p>
                        Tuần {selectedWeek} — {startDate} → {endDate}
                    </p>
                </div>

                <div className="cd-table-premium-wrap">
                    {scoresLoading && <div className="cd-loading">Đang tải dữ liệu...</div>}
                    {scoresError && <div className="cd-error">Không thể tải dữ liệu. Hãy thử lại.</div>}
                    {!scoresLoading && !scoresError && studentList.length === 0 && (
                        <EmptyState title="Không tìm thấy học sinh" description="Chọn lớp hoặc thay đổi bộ lọc." compact />
                    )}
                    {!scoresLoading && !scoresError && studentList.length > 0 && (
                        <table className="dm-table-premium">
                            <thead>
                                <tr>
                                    <th>Học sinh</th>
                                    <th className="th-center">Lớp</th>
                                    <th className="th-center">Vi phạm</th>
                                    <th>Điểm RL</th>
                                    <th className="th-center">Hạnh kiểm Dự kiến</th>
                                    <th>Gợi ý</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedStudents.map((s) => {
                                    const currentGrade = conductGrades[s.enrollmentId] || s.grade || "";
                                    const suggested = suggestGrade(s.violationCount);
                                    return (
                                        <tr key={s.enrollmentId || s.studentId}>
                                            <td className="td-student">
                                                <div className="student-profile-mini">
                                                    <div className="s-avatar">{s.studentName?.charAt(0) || "?"}</div>
                                                    <div>
                                                        <strong>{s.studentName}</strong>
                                                        <br />
                                                        <small>{s.studentCode}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="th-center">{s.className}</td>
                                            <td className="th-center">
                                                <span className={`viol-count ${s.violationCount > 5 ? "danger" : ""}`}>
                                                    {s.violationCount} lỗi
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`score-cell ${s.disciplineScore < 90 ? "low" : "good"}`}>
                                                    {s.disciplineScore}đ
                                                </span>
                                            </td>
                                            <td className="th-center">
                                                <div style={{ width: "140px", margin: "0 auto" }}>
                                                    <Select
                                                        variant="custom"
                                                        value={currentGrade}
                                                        onChange={(e) => handleGradeChange(s.enrollmentId, e.target.value)}
                                                        options={GRADE_OPTIONS}
                                                    />
                                                </div>
                                            </td>
                                            <td>
                                                {s.violationCount > 3 ? (
                                                    <div className="suggestion-pill warning">
                                                        <FiAlertCircle /> Đề xuất: {suggested}
                                                    </div>
                                                ) : (
                                                    <div className="suggestion-pill success">
                                                        <FiCheckCircle /> Đề xuất: Tốt
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="dm-footer-pagination">
                    <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
            </div>
        </div>
    );
}
