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
import { resolveSemesterId } from "../../../../services/shared/schoolYearLookup";
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
    { value: "Đạt", label: "Đạt" },
    { value: "Chưa đạt", label: "Chưa đạt" },
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
    const [disciplineScoreSnapshot, setDisciplineScoreSnapshot] = useState({});

    // Fetch grade levels from API
    const { data: gradeLevelsData = [] } = useQuery({
        queryKey: ["grade-levels-conduct"],
        queryFn: async () => {
            const res = await vpDisciplineService.getGradeLevels();
            return res?.data || [];
        },
        staleTime: 10 * 60_000,
    });

    // Build grade options from API
    const gradeOptions = useMemo(() => {
        if (!gradeLevelsData.length) {
            return [
                { value: "10", label: "Khối 10" },
                { value: "11", label: "Khối 11" },
                { value: "12", label: "Khối 12" },
            ];
        }
        return gradeLevelsData
            .map(gl => ({
                value: String(gl.level_number || gl.levelNumber || gl.id),
                label: gl.name || `Khối ${gl.level_number || gl.levelNumber}`,
            }))
            .sort((a, b) => parseInt(a.value) - parseInt(b.value));
    }, [gradeLevelsData]);
    const [viewMode, setViewMode] = useState("weekly"); // "weekly" | "annual"
    const [hk1Id, setHk1Id] = useState(null);
    const [hk2Id, setHk2Id] = useState(null);

    useEffect(() => {
        if (urlClass) {
            setSelectedClass(urlClass);
            const grade = urlClass.slice(0, 2);
            if (["10", "11", "12"].includes(grade)) setSelectedGrade(grade);
        }
    }, [urlClass]);

    // Resolve HK1/HK2 semester IDs whenever school year changes
    useEffect(() => {
        let cancelled = false;
        const resolve = async () => {
            const [id1, id2] = await Promise.all([
                resolveSemesterId(selectedSchoolYear, "hk1"),
                resolveSemesterId(selectedSchoolYear, "hk2"),
            ]);
            if (!cancelled) {
                setHk1Id(id1);
                setHk2Id(id2);
            }
        };
        resolve();
        return () => { cancelled = true; };
    }, [selectedSchoolYear]);

    // Load class list
    const { data: classesData } = useQuery({
        queryKey: ["classes-for-conduct", selectedSchoolYear, selectedGrade],
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

    // Lưu snapshot discipline score khi dữ liệu mới được load
    useEffect(() => {
        if (scoresData && scoresData.length > 0) {
            const snapshot = {};
            scoresData.forEach((s) => {
                snapshot[s.enrollmentId] = s.disciplineScore;
            });
            setDisciplineScoreSnapshot(snapshot);
        }
    }, [scoresData]);

    // Kiểm tra xem discipline score có thay đổi không so với lúc load
    const disciplineScoreChanged = useMemo(() => {
        if (!scoresData || scoresData.length === 0) return false;
        return scoresData.some((s) => {
            const original = disciplineScoreSnapshot[s.enrollmentId];
            if (original === undefined) return false;
            return original !== s.disciplineScore;
        });
    }, [scoresData, disciplineScoreSnapshot]);
    const { data: annualData, isLoading: annualLoading, refetch: refetchAnnual } = useQuery({
        queryKey: ["conduct-class-summary", selectedClass, hk1Id, hk2Id],
        queryFn: async () => {
            if (!selectedClass || !hk1Id || !hk2Id) return null;
            const res = await vpDisciplineService.getConductClassSummary(
                selectedClass,
                hk1Id,
                hk2Id,
            );
            return res?.data || null;
        },
        enabled: Boolean(selectedClass && hk1Id && hk2Id),
        staleTime: 60_000,
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

    const handleSaveStudentConduct = async (enrollmentId, semesterId, conductLevel) => {
        try {
            await vpDisciplineService.saveStudentConduct(enrollmentId, semesterId, conductLevel);
            toast.success("Đã lưu hạnh kiểm học sinh.");
            refetchAnnual();
        } catch {
            toast.error("Không thể lưu hạnh kiểm.");
        }
    };

    const handleSave = async () => {
        if (viewMode === "annual" && annualData?.students) {
            let saved = 0;
            let errors = 0;
            for (const [key, value] of Object.entries(conductGrades)) {
                const [enrollmentId, semesterId] = key.split("__");
                if (semesterId && value) {
                    try {
                        await handleSaveStudentConduct(enrollmentId, semesterId, value);
                        saved++;
                    } catch {
                        errors++;
                    }
                }
            }
            if (saved === 0 && errors === 0) {
                toast.info("Không có thay đổi để lưu.");
            } else if (errors === 0) {
                toast.success(`Đã lưu ${saved} hạnh kiểm.`);
                setConductGrades({});
            } else {
                toast.error(`Đã lưu ${saved}, thất bại ${errors}.`);
            }
            return;
        }
        if (Object.keys(conductGrades).length === 0) {
            toast.info("Không có thay đổi để lưu.");
            return;
        }
        let saved = 0;
        let errors = 0;
        for (const [enrollmentId, grade] of Object.entries(conductGrades)) {
            const semesterId = selectedTerm === "hk2" ? hk2Id : hk1Id;
            if (!semesterId) continue;
            try {
                await handleSaveStudentConduct(enrollmentId, semesterId, grade);
                saved++;
            } catch {
                errors++;
            }
        }
        if (errors === 0) {
            toast.success(`Đã lưu ${saved} hạnh kiểm.`);
            setConductGrades({});
        } else {
            toast.error(`Đã lưu ${saved}, thất bại ${errors}.`);
        }
    };

    const handleApprove = async () => {
        const ungraded = studentList.filter((s) => !conductGrades[s.enrollmentId] && !s.grade);
        if (ungraded.length > 0) {
            toast.error(`Không thể phê duyệt! Còn ${ungraded.length} học sinh chưa được đánh giá hạnh kiểm.`);
            return;
        }
        try {
            if (viewMode === "annual") {
                const semesterId = selectedTerm === "hk2" ? hk2Id : hk1Id;
                if (semesterId) {
                    await vpDisciplineService.finalizeConductSemester(semesterId);
                }
            } else {
                await vpDisciplineService.submitConduct(selectedClass);
            }
            toast.success(`Đã phê duyệt dự kiến hạnh kiểm. Thông báo đã được gửi đến GVCN, Phụ huynh và Học sinh.`);
            refetchAnnual();
        } catch {
            toast.error("Không thể phê duyệt hạnh kiểm.");
        }
    };

    // TT22-aligned suggest grade based on base score and attendance rate
    const suggestGrade = (baseScore, attendanceRate = 100) => {
        if (baseScore >= 95 && attendanceRate >= 98) return "Tốt";
        if (baseScore >= 85 && attendanceRate >= 93) return "Khá";
        if (baseScore >= 70 && attendanceRate >= 85) return "Đạt";
        return "Chưa đạt";
    };

    // Filter class options by grade
    const filteredClassOptions = useMemo(() => {
        if (selectedGrade === "all") return classOptions;
        return classOptions.filter((c) => c.grade === selectedGrade);
    }, [classOptions, selectedGrade]);

    const conductStats = useMemo(() => {
        if (!studentList.length) return [
            { key: "good", title: "Hạnh kiểm Tốt", val: "—", sub: "", icon: <FiCheckCircle />, color: "success" },
            { key: "improved", title: "Biến động tích cực", val: "—", sub: "", icon: <FiTrendingUp />, color: "primary" },
            { key: "needs-help", title: "Cần Can Thiệp", val: "—", sub: "", icon: <FiAlertCircle />, color: "danger" },
            { key: "ungraded", title: "Chưa Phê Duyệt", val: "—", sub: "", icon: <FiCheckCircle />, color: "warning" },
        ];

        const good = studentList.filter((s) => {
            const g = conductGrades[s.enrollmentId] || s.grade;
            return g === "Tốt";
        }).length;
        const improved = studentList.filter((s) => s.violationCount < (s.violationCount_prev || s.violationCount + 1)).length;
        const needsHelp = studentList.filter((s) => s.violationCount > 5).length;
        const ungraded = studentList.filter((s) => !conductGrades[s.enrollmentId] && !s.grade).length;

        return [
            { key: "good", title: "Hạnh kiểm Tốt", val: good, sub: "học sinh", icon: <FiCheckCircle />, color: "success" },
            { key: "improved", title: "Tiến bộ", val: improved, sub: "học sinh", icon: <FiTrendingUp />, color: "primary" },
            { key: "needs-help", title: "Cần Can Thiệp", val: needsHelp, sub: "học sinh", icon: <FiAlertCircle />, color: "danger" },
            { key: "ungraded", title: "Chưa Đánh giá", val: ungraded, sub: "học sinh", icon: <FiCheckCircle />, color: "warning" },
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
                {conductStats.map((card) => (
                    <div key={card.key} className={`cd-stat-card ${card.color}`}>
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
                            options={gradeOptions}
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
                    <div className="filter-group" style={{ minWidth: "180px" }}>
                        <label><FiLayers /> Chế độ xem</label>
                        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                            <button
                                type="button"
                                className={`btn-save-draft ${viewMode === "weekly" ? "" : "btn-outline"}`}
                                style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem", flex: 1 }}
                                onClick={() => setViewMode("weekly")}
                            >
                                Tuần
                            </button>
                            <button
                                type="button"
                                className={`btn-save-draft ${viewMode === "annual" ? "" : "btn-outline"}`}
                                style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem", flex: 1 }}
                                onClick={() => setViewMode("annual")}
                            >
                                Cả năm
                            </button>
                        </div>
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

            {/* Warning banner khi discipline score thay đổi */}
            {disciplineScoreChanged && (
                <div className="cd-warning-banner">
                    <FiAlertCircle size={18} />
                    <span>
                        <strong>Cảnh báo:</strong> Điểm kỷ luật đã thay đổi sau lần lưu gần nhất.
                        Đề nghị xem lại xếp loại hạnh kiểm trước khi phê duyệt.
                    </span>
                </div>
            )}

            <div className="cd-main-panel animate-fade-in">
                <div className="panel-header">
                    <h3>Dự Kiến Hạnh Kiểm: {classOptions.find((c) => c.value === selectedClass)?.label || selectedClass || "—"}</h3>
                    {viewMode === "weekly" ? (
                        <p>Tuần {selectedWeek} — {startDate} → {endDate}</p>
                    ) : (
                        <p>Học kỳ I + Học kỳ II — Năm học {selectedSchoolYear}</p>
                    )}
                </div>

                {viewMode === "annual" ? (
                    <>
                        {annualLoading && <div className="cd-loading">Đang tải dữ liệu...</div>}
                        {!annualLoading && !annualData && (
                            <EmptyState title="Không tìm thấy dữ liệu" description="Chọn lớp để xem tổng kết hạnh kiểm cả năm." compact />
                        )}
                        {!annualLoading && annualData && (
                            <>
                                {annualData.stats && (
                                    <div className="cd-stats-grid" style={{ marginBottom: "1rem" }}>
                                        <div className="cd-stat-card success">
                                            <div className="stat-card-content">
                                                <span className="stat-label">Tổng số</span>
                                                <span className="stat-value">{annualData.stats.total ?? "—"}</span>
                                            </div>
                                        </div>
                                        <div className="cd-stat-card primary">
                                            <div className="stat-card-content">
                                                <span className="stat-label">Tốt (HK I)</span>
                                                <span className="stat-value">{annualData.stats.hk1Levels?.Tốt ?? annualData.stats.hk1Levels?.Tot ?? 0}</span>
                                            </div>
                                        </div>
                                        <div className="cd-stat-card primary">
                                            <div className="stat-card-content">
                                                <span className="stat-label">Tốt (HK II)</span>
                                                <span className="stat-value">{annualData.stats.hk2Levels?.Tốt ?? annualData.stats.hk2Levels?.Tot ?? 0}</span>
                                            </div>
                                        </div>
                                        <div className="cd-stat-card success">
                                            <div className="stat-card-content">
                                                <span className="stat-label">Tốt (Cả năm)</span>
                                                <span className="stat-value">{annualData.stats.annualLevels?.Tốt ?? annualData.stats.annualLevels?.Tot ?? 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="cd-table-premium-wrap">
                                    <table className="dm-table-premium">
                                        <thead>
                                            <tr>
                                                <th>Học sinh</th>
                                                <th className="th-center">HK I</th>
                                                <th className="th-center">HK II</th>
                                                <th className="th-center">Cả năm</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(annualData.students || []).map((student) => {
                                                const hk1Key = student.enrollmentId + "__" + hk1Id;
                                                const hk2Key = student.enrollmentId + "__" + hk2Id;
                                                const hk1Val = conductGrades[hk1Key] || student.hk1Level || "";
                                                const hk2Val = conductGrades[hk2Key] || student.hk2Level || "";
                                                const annualVal = student.annualLevel || "";
                                                return (
                                                    <tr key={student.enrollmentId}>
                                                        <td className="td-student">
                                                            <div className="student-profile-mini">
                                                                <div className="s-avatar">{(student.studentName || "?").charAt(0)}</div>
                                                                <div>
                                                                    <strong>{student.studentName || "—"}</strong>
                                                                    <br />
                                                                    <small>{student.studentCode}</small>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="th-center">
                                                            <div style={{ width: "120px", margin: "0 auto" }}>
                                                                <Select
                                                                    variant="custom"
                                                                    value={hk1Val}
                                                                    onChange={(e) => setConductGrades((prev) => ({ ...prev, [hk1Key]: e.target.value }))}
                                                                    options={GRADE_OPTIONS}
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="th-center">
                                                            <div style={{ width: "120px", margin: "0 auto" }}>
                                                                <Select
                                                                    variant="custom"
                                                                    value={hk2Val}
                                                                    onChange={(e) => setConductGrades((prev) => ({ ...prev, [hk2Key]: e.target.value }))}
                                                                    options={GRADE_OPTIONS}
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="th-center">
                                                            <span className={`suggestion-pill ${annualVal === "Tốt" ? "success" : annualVal ? "warning" : ""}`}>
                                                                {annualVal || "Chưa có"}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <>
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
                                            <th className="th-center">
                                                Điểm KL
                                                <span className="th-sub-label">(tự động)</span>
                                            </th>
                                            <th className="th-center">
                                                Xếp loại HK
                                                <span className="th-sub-label">(do GVCN chọn)</span>
                                            </th>
                                            <th>Gợi ý</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedStudents.map((s) => {
                                            const currentGrade = conductGrades[s.enrollmentId] || s.grade || "";
                                            const suggested = suggestGrade(s.disciplineScore);
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
                                                        <div className={`suggestion-pill ${suggested === "Tốt" ? "success" : "warning"}`}>
                                                            {suggested === "Tốt" ? <FiCheckCircle /> : <FiAlertCircle />}
                                                            Đề xuất: {suggested}
                                                        </div>
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
                    </>
                )}
            </div>
        </div>
    );
}
