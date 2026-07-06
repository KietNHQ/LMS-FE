import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader, WeekPicker, Pagination } from "../../../../components/common";
import DisciplineHeaderActions from "../components/DisciplineHeaderActions";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import Select from "../../../../components/ui/Select/Select";
import {
    FiAward, FiArrowUp, FiArrowDown, FiMinus, FiTrendingUp, FiTrendingDown,
    FiDownload, FiLayers, FiCalendar, FiStar, FiActivity, FiArrowRight,
    FiUserCheck, FiSearch, FiSliders
} from "react-icons/fi";
import { Trophy, TrendingDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { vpDisciplineService } from "../../../../services/pages/management/vp-discipline";
import {
    formatDateForDisplay,
    getSchoolYearForDate,
    getTermForDate,
    getWeekDateRange,
    getWeekForDate,
    parseGradeFromClass,
} from "../../../../utils/competitionUtils";
import { exportRankingToExcel } from "../../../../utils/rankingExportUtils";
import { resolveSchoolYearId, resolveSemesterId } from "../../../../services/shared/schoolYearLookup";
import { toast } from "react-toastify";
import "./VpDisciplineCompetition.css";

const ITEMS_PER_PAGE = 6;
const TOTAL_COMPETITION_WEEKS = 35;

const toNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

function mapRanking(r) {
    const grade = parseGradeFromClass(r.className || r.class_name);
    const rawTrend = `${r.trend || "stable"}`.toLowerCase();
    return {
        rank: toNumber(r.rank, 0),
        classId: r.classId || r.class_id,
        class: r.className || r.class_name || "",
        homeroom: r.homeroomTeacher || r.homeroomTeacherName || r.homeroom_teacher_name || "",
        points: toNumber(r.currentScore ?? r.avgScore ?? r.avgDisciplineScore ?? r.avg_discipline_score ?? r.totalPoints, 0),
        rawScore: r.baseScore ?? r.rawScore ?? r.raw_score ?? null,
        bonusPoints: toNumber(r.bonusPoints ?? r.bonus_points, 0),
        penaltyPoints: toNumber(r.deductedPoints ?? r.penaltyPoints ?? r.penalty_points, 0),
        normalizedScore: r.normalizedScore ?? r.normalized_score ?? null,
        trend: rawTrend,
        previousRank: r.previousRank ?? r.previous_rank ?? null,
        rankChange: toNumber(r.rankChange ?? r.rank_change, 0),
        violationBreakdown: r.violationBreakdown ?? r.violation_breakdown ?? null,
        rewardBreakdown: r.rewardBreakdown ?? r.reward_breakdown ?? null,
        attendance: null,
        conduct: "",
        studentCount: toNumber(r.totalStudents ?? r.studentCount ?? r.student_count, 0),
        grade,
        isNew: rawTrend === "new" || (r.isNew ?? r.is_new ?? false),
    };
}

/**
 * Build a human-readable tooltip string for violation breakdown
 */
function buildViolationTooltip(breakdown) {
    if (!breakdown) return "Chưa có chi tiết vi phạm";
    if (Array.isArray(breakdown)) {
        return breakdown
            .map((b) => `${b.type || b.violation_type || "?"}: ${b.count || 0} lần (${b.points || 0}đ)`)
            .join("\n");
    }
    if (typeof breakdown === "object") {
        return Object.entries(breakdown)
            .map(([type, data]) => `${type}: ${data.count || 0} lần (${data.points || 0}đ)`)
            .join("\n");
    }
    return "Chưa có chi tiết vi phạm";
}

export default function VpDisciplineCompetition({ isEmbedded = false, onClassClick }) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const urlWeek = Number(searchParams.get("week"));
    const hasUrlWeek = Number.isFinite(urlWeek) && urlWeek > 0;
    const urlSchoolYear = searchParams.get("schoolYear");
    const urlTerm = searchParams.get("term");
    const urlDate = searchParams.get("date");
    const {
        selectedSchoolYear,
        selectedTerm,
        handleYearArrow,
        handleTermChange,
        setSelectedSchoolYear,
    } = useSchoolYearTerm();
    const [selectedWeek, setSelectedWeek] = useState(() => (hasUrlWeek ? urlWeek : 1));
    const [selectedDate, setSelectedDate] = useState(urlDate || "");
    const [selectedGrade, setSelectedGrade] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [normalizeBySize, setNormalizeBySize] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const selectedTermKey =
        typeof selectedTerm === "string"
            ? selectedTerm
            : selectedTerm?.key || selectedTerm?.id || "";
    const selectedTermLabel = selectedTermKey === "hk2" ? "Học kỳ 2" : "Học kỳ 1";

    const { startDate, endDate } = useMemo(
        () => getWeekDateRange(selectedSchoolYear, selectedTerm, selectedWeek),
        [selectedSchoolYear, selectedTerm, selectedWeek],
    );

    const weekRangeLabel = useMemo(() => {
        if (!startDate || !endDate) return "";
        return `${formatDateForDisplay(startDate)} - ${formatDateForDisplay(endDate)}`;
    }, [startDate, endDate]);

    // Fetch grade levels from API
    const { data: gradeLevelsData = [] } = useQuery({
        queryKey: ["grade-levels-competition"],
        queryFn: async () => {
            const res = await vpDisciplineService.getGradeLevels();
            return res?.data || [];
        },
        staleTime: 10 * 60_000,
    });

    const { data: semesterId } = useQuery({
        queryKey: ["competition-semester-id", selectedSchoolYear, selectedTermKey],
        queryFn: () => resolveSemesterId(selectedSchoolYear, selectedTermKey),
        enabled: Boolean(selectedSchoolYear && selectedTermKey),
        staleTime: 5 * 60_000,
    });

    const { data: schoolYearId } = useQuery({
        queryKey: ["competition-school-year-id", selectedSchoolYear],
        queryFn: () => resolveSchoolYearId(selectedSchoolYear),
        enabled: Boolean(selectedSchoolYear),
        staleTime: 5 * 60_000,
    });

    // Build grade options from API
    const gradeOptions = useMemo(() => {
        const defaultOption = [{ value: "all", label: "Tất cả" }];
        if (!gradeLevelsData.length) {
            return [
                { value: "all", label: "Tất cả" },
                { value: "10", label: "Khối 10" },
                { value: "11", label: "Khối 11" },
                { value: "12", label: "Khối 12" },
            ];
        }
        const apiOptions = gradeLevelsData
            .map(gl => ({
                value: String(gl.level_number || gl.levelNumber || gl.id),
                label: gl.name || `Khối ${gl.level_number || gl.levelNumber}`,
            }))
            .sort((a, b) => parseInt(a.value) - parseInt(b.value));
        return [...defaultOption, ...apiOptions];
    }, [gradeLevelsData]);

    const { data: rankingResult, isLoading, isError } = useQuery({
        queryKey: ["discipline-rankings", startDate, endDate, schoolYearId, semesterId, normalizeBySize],
        queryFn: async () => {
            const res = await vpDisciplineService.callByKey("get_discipline_class_rankings", {
                params: {
                    startDate,
                    endDate,
                    schoolYearId: schoolYearId || undefined,
                    semesterId: semesterId || undefined,
                    normalizeBySize,
                    week: selectedWeek,
                },
            });
            return res?.data || [];
        },
        select: (data) => {
            if (Array.isArray(data)) return data.map(mapRanking);
            if (data?.data) return data.data.map(mapRanking);
            return [];
        },
        staleTime: 30_000,
        enabled: Boolean(startDate && endDate),
    });

    const filteredRanking = useMemo(() => {
        if (!rankingResult) return [];
        return rankingResult.filter((item) => {
            const matchesGrade = selectedGrade === "all" || item.grade === selectedGrade;
            const matchesSearch = item.class.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesGrade && matchesSearch;
        });
    }, [rankingResult, selectedGrade, searchTerm]);

    // Detect ties: group consecutive items with the same points
    const rankedWithTies = useMemo(() => {
        if (!filteredRanking.length) return [];
        const result = [];
        let i = 0;
        while (i < filteredRanking.length) {
            const group = [filteredRanking[i]];
            let j = i + 1;
            while (j < filteredRanking.length && filteredRanking[j].points === filteredRanking[i].points) {
                group.push(filteredRanking[j]);
                j++;
            }
            // Mark all in the group as tied
            group.forEach((item) => {
                result.push({ ...item, tied: group.length > 1, tieGroup: group });
            });
            i = j;
        }
        return result;
    }, [filteredRanking]);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedWeek, selectedGrade, searchTerm, normalizeBySize]);

    useEffect(() => {
        if (urlSchoolYear && urlSchoolYear !== selectedSchoolYear && setSelectedSchoolYear) {
            setSelectedSchoolYear(urlSchoolYear);
        }
    }, [selectedSchoolYear, setSelectedSchoolYear, urlSchoolYear]);

    useEffect(() => {
        if (urlTerm && urlTerm !== selectedTermKey) {
            handleTermChange(urlTerm);
        }
    }, [handleTermChange, selectedTermKey, urlTerm]);

    useEffect(() => {
        if (hasUrlWeek) {
            setSelectedWeek(urlWeek);
        }
    }, [hasUrlWeek, urlWeek]);

    useEffect(() => {
        if (urlDate) {
            setSelectedDate(urlDate);
        }
    }, [urlDate]);

    useEffect(() => {
        if (hasUrlWeek) return;
        if (selectedTermKey === "hk1" && selectedWeek > 18) {
            setSelectedWeek(1);
        } else if (selectedTermKey === "hk2" && selectedWeek <= 18) {
            setSelectedWeek(19);
        }
    }, [hasUrlWeek, selectedTermKey, selectedWeek]);

    const handleDateJump = (value) => {
        setSelectedDate(value);
        if (!value) return;

        const targetSchoolYear = getSchoolYearForDate(value);
        const targetTerm = getTermForDate(targetSchoolYear, value);
        const targetWeek = getWeekForDate(
            targetSchoolYear,
            targetTerm,
            value,
            TOTAL_COMPETITION_WEEKS,
        );

        if (!targetSchoolYear || !targetTerm || !targetWeek) {
            toast.warning("Ngày này không nằm trong lịch tuần thi đua hiện tại.");
            return;
        }

        if (targetSchoolYear !== selectedSchoolYear) {
            if (setSelectedSchoolYear) {
                setSelectedSchoolYear(targetSchoolYear);
            } else {
                toast.info(`Ngày đã chọn thuộc năm học ${targetSchoolYear}. Hãy đổi năm học nếu cần xem dữ liệu năm đó.`);
            }
        }

        if (targetTerm !== selectedTermKey) {
            handleTermChange(targetTerm);
        }

        setSelectedWeek(targetWeek.week);
        toast.success(`Đã chuyển đến tuần ${targetWeek.week} (${formatDateForDisplay(targetWeek.startDate)} - ${formatDateForDisplay(targetWeek.endDate)}).`);
    };

    const totalPages = Math.max(1, Math.ceil(rankedWithTies.length / ITEMS_PER_PAGE));
    const safePage = Math.min(Math.max(1, currentPage), totalPages);

    const avgScore = useMemo(() => {
        if (!rankedWithTies.length) return 0;
        const sum = rankedWithTies.reduce((acc, r) => acc + r.points, 0);
        return (sum / rankedWithTies.length).toFixed(1);
    }, [rankedWithTies]);

    const topClass = rankedWithTies.find((r) => r.rank === 1);

    const commendationClasses = useMemo(() => {
        if (!rankedWithTies.length) return [];
        const topByGrade = {};
        rankedWithTies.forEach((item) => {
            if (!topByGrade[item.grade] || item.rank < topByGrade[item.grade].rank) {
                topByGrade[item.grade] = item;
            }
        });
        return Object.values(topByGrade).sort((a, b) => a.class.localeCompare(b.class));
    }, [rankedWithTies]);

    const improvementClasses = useMemo(() => {
        return rankedWithTies
            .filter((item) => item.trend === "down")
            .sort((a, b) => a.points - b.points)
            .slice(0, 3);
    }, [rankedWithTies]);

    const paginatedRanking = useMemo(() => {
        const start = (safePage - 1) * ITEMS_PER_PAGE;
        return rankedWithTies.slice(start, start + ITEMS_PER_PAGE);
    }, [rankedWithTies, safePage]);

	const statsCards = [
	    { key: "avg-score", title: "Điểm Thi Đua TB", val: avgScore, sub: "Điểm toàn trường", icon: <FiStar />, color: "success" },
	    { key: "top-class", title: "Lớp Dẫn Đầu", val: topClass?.class || "—", sub: topClass ? `${topClass.points}đ - Hạng ${topClass.rank}` : "Chưa có dữ liệu", icon: <FiAward />, color: "primary" },
	    { key: "total-classes", title: "Tổng Lớp", val: rankedWithTies.length, sub: "Lớp trong bảng xếp hạng", icon: <FiLayers />, color: "info" },
	    { key: "top-3-grade", title: "Top 3 Khối", val: commendationClasses.length, sub: "Lớp xuất sắc nhất", icon: <FiUserCheck />, color: "success" },
	];

	const getCurrentPeriodParams = () => {
	    const termParam =
	        typeof selectedTerm === "string"
	            ? selectedTerm
	            : selectedTerm?.key || selectedTerm?.id || "";
	    const params = {
	        week: String(selectedWeek),
	        startDate: startDate || "",
	        endDate: endDate || "",
	        schoolYear: selectedSchoolYear || "",
	        term: termParam,
	    };

	    if (selectedDate) {
	        params.date = selectedDate;
	    }

	    return Object.fromEntries(
	        Object.entries(params).filter(([, value]) => value !== ""),
	    );
	};

	const handleClassClick = (classItem) => {
	    const periodParams = getCurrentPeriodParams();
        const classRef = classItem.classId || classItem.class;
	    if (onClassClick) {
	        onClassClick(classRef, {
                ...periodParams,
                className: classItem.class,
            });
	    } else {
	        const query = new URLSearchParams({
	            class: String(classRef),
                className: classItem.class,
	            tab: "attendance",
	            ...periodParams,
	        });
	        navigate(`/management/competition?${query.toString()}`);
	    }
	};

    const goToClassLogs = (classItem) => {
        const classRef = classItem.classId || classItem.class;
        const query = new URLSearchParams({
            className: classItem.class || "",
            ...getCurrentPeriodParams(),
        });
        navigate(`/management/discipline/class-deduction-logs/${encodeURIComponent(String(classRef))}?${query.toString()}`);
    };

    const handleExportExcel = async () => {
        if (!rankedWithTies.length) return;
        setIsExporting(true);
        try {
            await exportRankingToExcel(rankedWithTies, {
                schoolYear: selectedSchoolYear,
                term: selectedTermLabel,
                week: selectedWeek,
                normalizeBySize,
            });
            toast.success("Đã xuất file Excel bảng xếp hạng.");
        } catch (err) {
            toast.error("Xuất Excel thất bại.");
            console.error("[VpDisciplineCompetition] export error:", err);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="vp-competition vp-discipline-layout">
            {!isEmbedded && (
                <PageHeader
                    title="Tổng Hợp Thi Đua & Nề Nếp"
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

            {/* KPI Metrics Bar */}
            <div className="comp-stats-grid">
                {statsCards.map((card) => (
                    <div key={card.key} className={`comp-stat-card ${card.color}`}>
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
            <div className="dm-toolbar-integrated mb-lg">
                <div className="dm-filters-complex">
                    <div className="filter-group">
                        <label><FiCalendar /> Tuần</label>
                        <WeekPicker
                            className="dm-week-picker"
                            value={selectedWeek}
                            onChange={setSelectedWeek}
                            totalWeeks={TOTAL_COMPETITION_WEEKS}
                            rangeLabel={weekRangeLabel}
                        />
                    </div>
                    <div className="filter-group comp-date-jump-group">
                        <label><FiCalendar /> Chọn ngày</label>
                        <input
                            className="comp-date-jump-input"
                            type="date"
                            value={selectedDate}
                            onChange={(e) => handleDateJump(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <label><FiLayers /> Khối</label>
                        <Select
                            variant="custom"
                            value={selectedGrade}
                            onChange={(e) => setSelectedGrade(e.target.value)}
                            options={gradeOptions}
                        />
                    </div>
                    <div className="filter-group" style={{ minWidth: "220px" }}>
                        <label><FiSearch /> Tìm lớp</label>
                        <div className="comp-search-box">
                            <input
                                placeholder="Nhập tên lớp..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="dm-primary-actions-compact">
                    <label className="normalize-toggle">
                        <input
                            type="checkbox"
                            checked={normalizeBySize}
                            onChange={(e) => setNormalizeBySize(e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                        <span className="toggle-label"><FiSliders /> Chuẩn hóa theo sĩ số</span>
                    </label>
                    <button
                        className="btn-export-reports"
                        onClick={handleExportExcel}
                        disabled={isExporting}
                    >
                        <FiDownload /> {isExporting ? "Đang xuất..." : "Xuất Excel"}
                    </button>
                </div>
            </div>

            {isLoading && (
                <div className="comp-loading">Đang tải bảng xếp hạng...</div>
            )}

            {!isLoading && isError && (
                <div className="comp-error">Không thể tải bảng xếp hạng. Hãy thử lại.</div>
            )}

            {!isLoading && !isError && rankedWithTies.length === 0 && (
                <div className="comp-empty">Chưa có dữ liệu xếp hạng cho tuần này.</div>
            )}

            {!isLoading && !isError && rankedWithTies.length > 0 && (
                <div className="comp-main-grid">
                    {/* Leaderboard Section */}
                    <div className="comp-leaderboard-panel animate-fade-in">
                        <div className="panel-header">
                            <h3><FiAward /> Bảng Xếp Hạng Lớp</h3>
                            <p>Dữ liệu được tổng hợp từ điểm thi đua nề nếp tuần {selectedWeek}</p>
                        </div>

                        <div className="rank-table-premium-wrap">
                            <table className="rank-table-premium">
                                <thead>
                                    <tr>
                                        <th className="th-center">Hạng</th>
                                        <th>Lớp</th>
                                        <th>GV Chủ Nhiệm</th>
                                        <th className="th-center">Điểm Gốc</th>
                                        <th className="th-center">Cộng Thưởng</th>
                                        <th className="th-center">Trừ Phạt</th>
                                        <th className="th-center">Điểm Thi Đua</th>
                                        <th>SL HS</th>
                                        <th>Xu Hướng</th>
                                        <th className="th-center">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedRanking.map((item) => (
                                        <tr
                                            key={item.classId || item.class}
                                            className={`clickable-row${item.tied ? " tied-row" : ""}`}
                                            onClick={() => handleClassClick(item)}
                                        >
                                            <td className="td-center">
                                                <div className={`rank-medal ${item.rank <= 3 ? `medal-${item.rank}` : "medal-other"}`}>
                                                    {item.tied ? <span className="tie-equal">=</span> : item.rank}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="class-name-v2">{item.class}</span>
                                            </td>
                                            <td>{item.homeroom}</td>
                                            <td className="td-center td-score">{item.rawScore != null ? Number(item.rawScore).toFixed(1) : "—"}</td>
                                            <td className="td-center td-bonus">+{Number(item.bonusPoints || 0).toFixed(1)}</td>
                                            <td className="td-center td-penalty">
                                                {item.penaltyPoints != null && item.penaltyPoints !== 0 ? (
                                                    <span
                                                        className="penalty-value"
                                                        title={buildViolationTooltip(item.violationBreakdown)}
                                                    >
                                                        {Number(item.penaltyPoints).toFixed(1)}
                                                    </span>
                                                ) : "0.0"}
                                            </td>
                                            <td className="td-points">
                                                <strong className="points-accent">{item.points}đ</strong>
                                            </td>
                                            <td>{item.studentCount}</td>
                                            <td>
                                                {item.isNew ? (
                                                    <span className="trend-badge new-badge">Mới</span>
                                                ) : item.previousRank != null ? (
                                                    item.rankChange > 0 ? (
                                                        <span className="trend-badge up"><FiTrendingUp /> +{item.rankChange}</span>
                                                    ) : item.rankChange < 0 ? (
                                                        <span className="trend-badge down"><FiTrendingDown /> {item.rankChange}</span>
                                                    ) : (
                                                        <span className="trend-badge flat"><FiMinus /></span>
                                                    )
                                                ) : (
                                                    item.trend === "up" ? <span className="trend-badge up"><FiTrendingUp /></span> :
                                                    item.trend === "down" ? <span className="trend-badge down"><FiTrendingDown /></span> :
                                                    <span className="trend-badge flat"><FiMinus /></span>
                                                )}
                                            </td>
                                            <td>
                                                <button
                                                    className="btn-view-details"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        goToClassLogs(item);
                                                    }}
                                                    title="Xem chi tiết"
                                                >
                                                    <FiArrowRight />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="comp-pagination-row">
                            <Pagination
                                currentPage={safePage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                ariaLabel="Phân trang bảng xếp hạng lớp"
                            />
                        </div>
                    </div>

                    {/* Highlights Side Column */}
                    <div className="comp-highlights-column">
                        <div className="highlight-card success">
                            <h4><FiTrendingUp /> Biểu Dương</h4>
                            <div className="highlight-list">
                                {commendationClasses.slice(0, 4).map((cls) => (
                                    <div key={cls.classId || cls.class} className="h-item" onClick={() => goToClassLogs(cls)}>
                                        <div className="h-icon">
                                            <Trophy size={20} className="icon-gold" />
                                        </div>
                                        <div className="h-info">
                                            <strong>Lớp {cls.class}</strong>
                                            <span>{cls.points}đ</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="highlight-card danger mt-lg">
                            <h4><FiTrendingDown /> Cần Khắc Phục</h4>
                            <div className="highlight-list">
                                {improvementClasses.map((cls) => (
                                    <div key={cls.classId || cls.class} className="h-item" onClick={() => goToClassLogs(cls)}>
                                        <div className="h-icon"><TrendingDown size={20} className="icon-danger" /></div>
                                        <div className="h-info">
                                            <strong>Lớp {cls.class}</strong>
                                            <span>{cls.points}đ</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="btn-view-incidents" onClick={() => navigate("/management/discipline")}>
                                Xem chi tiết sai phạm <FiArrowRight />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
