import { useState, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, Pagination, EmptyState } from "../../../../components/common";
import DisciplineHeaderActions from "../components/DisciplineHeaderActions";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import { classDeductionLogsService } from "../../../../services/pages/management/discipline/classDeductionLogsService";
import { shiftSchoolYear } from "../../../../utils/dateUtils";
import {
  FiAward, FiAlertTriangle, FiSearch, FiArrowLeft,
  FiTrendingUp, FiTrendingDown, FiMinus, FiCalendar,
  FiFilter
} from "react-icons/fi";
import {
  formatDateForDisplay,
  getSchoolYearForDate,
  getTermForDate,
  getWeekDateRange,
  getWeekForDate,
} from "../../../../utils/competitionUtils";
import "./VpClassDeductionLogs.css";

const ITEMS_PER_PAGE = 15;
const TOTAL_COMPETITION_WEEKS = 35;

const STATUS_LABELS = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
};

const SEVERITY_LABELS = {
  low: "Nhẹ",
  med: "Vừa",
  high: "Nghiêm trọng",
};

// Map snake_case BE → camelCase FE
function mapViolation(v) {
  return {
    id: v.id,
    studentName: v.student_name || v.studentName || "",
    studentCode: v.student_code || v.studentCode || "",
    className: v.class_name || v.className || "",
    violationType: v.violation_name || v.violation_type || v.violationType || "",
    violationTypeId: v.violation_type_id || v.violationTypeId,
    severity: v.severity || v.violation_severity || v.level || "low",
    pointsDeducted: v.points_deducted || v.pointsDeducted || 0,
    date: v.date || v.recorded_at || "",
    status: v.status || "pending",
    verifiedBy: v.verified_by_name || v.verifiedBy || "",
    verifiedAt: v.verified_at || v.verifiedAt || "",
    notes: v.notes || "",
    scoreContribution: v.score_contribution || v.scoreContribution || 0,
  };
}

function mapReward(r) {
  return {
    id: r.id,
    studentName: r.student_name || r.studentName || "",
    studentCode: r.student_code || r.studentCode || "",
    className: r.class_name || r.className || "",
    rewardType: r.reward_name || r.reward_type || r.rewardType || "",
    rewardTypeId: r.reward_type_id || r.rewardTypeId,
    pointsAdded: r.points_earned || r.points_added || r.pointsAdded || 0,
    date: r.date || r.recorded_at || "",
    status: r.status || "pending",
    verifiedBy: r.verified_by_name || r.verifiedBy || "",
    notes: r.notes || "",
  };
}

export default function VpClassDeductionLogs() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    selectedSchoolYear,
    selectedTerm,
    handleTermChange,
    setSelectedSchoolYear,
  } = useSchoolYearTerm();
  const [periodSchoolYear, setPeriodSchoolYear] = useState(
    () => searchParams.get("schoolYear") || selectedSchoolYear,
  );
  const [periodTerm, setPeriodTerm] = useState(
    () => searchParams.get("term") || selectedTerm,
  );
  const getInitialWeek = () => {
    const week = Number(searchParams.get("week"));
    if (Number.isFinite(week) && week > 0) return week;
    return periodTerm === "hk2" ? 19 : 1;
  };
  const [selectedWeek, setSelectedWeek] = useState(() => {
    return getInitialWeek();
  });
  const [activeTab, setActiveTab] = useState("violations"); // "violations" | "rewards"

  // Compute date range from week
  const dateRange = useMemo(
    () => getWeekDateRange(periodSchoolYear, periodTerm, selectedWeek),
    [periodSchoolYear, periodTerm, selectedWeek],
  );

  // Filter states
  const [startDate, setStartDate] = useState(() => searchParams.get("startDate") || dateRange.startDate || "");
  const [endDate, setEndDate] = useState(() => searchParams.get("endDate") || dateRange.endDate || "");
  const [selectedDate, setSelectedDate] = useState(() => searchParams.get("date") || "");
  const [violationTypeId, setViolationTypeId] = useState("all");
  const [rewardTypeId, setRewardTypeId] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [studentSearch, setStudentSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch violation types
  const { data: violationTypesData = [] } = useQuery({
    queryKey: ["cdl-violation-types"],
    queryFn: async () => {
      const res = await classDeductionLogsService.getViolationTypes();
      return res?.data || res || [];
    },
    staleTime: 10 * 60_000,
  });

  const violationTypeOptions = useMemo(() => {
    const defaultOption = [{ value: "all", label: "Tất cả loại vi phạm" }];
    const apiOptions = (Array.isArray(violationTypesData) ? violationTypesData : [])
      .map((vt) => ({
        value: String(vt.id || vt.violation_type_id || ""),
        label: vt.name || vt.violation_name || "",
      }));
    return [...defaultOption, ...apiOptions];
  }, [violationTypesData]);

  // Fetch reward types
  const { data: rewardTypesData = [] } = useQuery({
    queryKey: ["cdl-reward-types"],
    queryFn: async () => {
      const res = await classDeductionLogsService.getRewardTypes();
      return res?.data || res || [];
    },
    staleTime: 10 * 60_000,
  });

  const rewardTypeOptions = useMemo(() => {
    const defaultOption = [{ value: "all", label: "Tất cả loại thưởng" }];
    const apiOptions = (Array.isArray(rewardTypesData) ? rewardTypesData : [])
      .map((rt) => ({
        value: String(rt.id || rt.reward_type_id || ""),
        label: rt.name || rt.reward_name || "",
      }));
    return [...defaultOption, ...apiOptions];
  }, [rewardTypesData]);

  // Fetch violation logs
  const {
    data: violationsResult,
    isLoading: violationsLoading,
    isError: violationsError,
  } = useQuery({
    queryKey: ["cdl-violations", classId, startDate, endDate, violationTypeId, statusFilter, studentSearch, currentPage],
    queryFn: async () => {
      if (!classId) return { data: [], total: 0 };
      const res = await classDeductionLogsService.getClassViolationLogs(classId, {
        startDate,
        endDate,
        violationTypeId: violationTypeId !== "all" ? violationTypeId : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        studentName: studentSearch || undefined,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      });
      return {
        data: res?.data || res || [],
        total: res?.pagination?.total || res?.total || res?.totalCount || (Array.isArray(res?.data) ? res.data.length : 0),
      };
    },
    enabled: Boolean(classId && activeTab === "violations"),
    staleTime: 30_000,
  });

  // Fetch reward logs
  const {
    data: rewardsResult,
    isLoading: rewardsLoading,
    isError: rewardsError,
  } = useQuery({
    queryKey: ["cdl-rewards", classId, startDate, endDate, rewardTypeId, statusFilter, studentSearch, currentPage],
    queryFn: async () => {
      if (!classId) return { data: [], total: 0 };
      const res = await classDeductionLogsService.getClassRewardLogs(classId, {
        startDate,
        endDate,
        rewardTypeId: rewardTypeId !== "all" ? rewardTypeId : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        studentName: studentSearch || undefined,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      });
      return {
        data: res?.data || res || [],
        total: res?.pagination?.total || res?.total || res?.totalCount || (Array.isArray(res?.data) ? res.data.length : 0),
      };
    },
    enabled: Boolean(classId && activeTab === "rewards"),
    staleTime: 30_000,
  });

  // Fetch class discipline summary
  const { data: summaryData } = useQuery({
    queryKey: ["cdl-summary", classId, startDate, endDate],
    queryFn: async () => {
      if (!classId) return null;
      const res = await classDeductionLogsService.getClassDisciplineSummary(classId, startDate, endDate);
      return res?.data || res || null;
    },
    enabled: Boolean(classId && (startDate || endDate)),
    staleTime: 60_000,
  });

  // Transform data
  const violations = useMemo(() => {
    const raw = violationsResult?.data || [];
    return raw.map(mapViolation);
  }, [violationsResult]);

  const rewards = useMemo(() => {
    const raw = rewardsResult?.data || [];
    return raw.map(mapReward);
  }, [rewardsResult]);

  // Summary cards
  const summary = useMemo(() => {
    if (!summaryData) {
      return {
        baseScore: 100,
        totalBonus: 0,
        totalDeduction: 0,
        netScore: 100,
      };
    }
    return {
      baseScore: summaryData.base_score ?? summaryData.baseScore ?? 100,
      totalBonus: summaryData.total_bonus ?? summaryData.totalBonus ?? summaryData.totalRewardPoints ?? 0,
      totalDeduction: summaryData.total_deduction ?? summaryData.totalDeduction ?? summaryData.totalViolationPoints ?? 0,
      netScore: summaryData.net_score ?? summaryData.netScore ?? summaryData.finalScore ?? summaryData.avgDisciplineScore ?? 100,
    };
  }, [summaryData]);

  const isLoading = activeTab === "violations" ? violationsLoading : rewardsLoading;
  const isError = activeTab === "violations" ? violationsError : rewardsError;
  const currentData = activeTab === "violations" ? violations : rewards;
  const totalItems = activeTab === "violations"
    ? (violationsResult?.total || 0)
    : (rewardsResult?.total || 0);
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  const handleResetFilters = () => {
    const range = getWeekDateRange(periodSchoolYear, periodTerm, selectedWeek);
    setStartDate(range.startDate || "");
    setEndDate(range.endDate || "");
    setSelectedDate("");
    setViolationTypeId("all");
    setRewardTypeId("all");
    setStatusFilter("all");
    setStudentSearch("");
    setCurrentPage(1);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const applyPeriodRange = (schoolYear, term, week) => {
    const range = getWeekDateRange(schoolYear, term, week);
    setStartDate(range.startDate || "");
    setEndDate(range.endDate || "");
    setSelectedDate("");
    setCurrentPage(1);
  };

  const handlePeriodYearChange = (direction) => {
    const nextSchoolYear = shiftSchoolYear(periodSchoolYear, direction);
    setPeriodSchoolYear(nextSchoolYear);
    if (setSelectedSchoolYear) {
      setSelectedSchoolYear(nextSchoolYear);
    }
    applyPeriodRange(nextSchoolYear, periodTerm, selectedWeek);
  };

  const handlePeriodTermChange = (term) => {
    const fallbackWeek = term === "hk2" ? 19 : 1;
    setPeriodTerm(term);
    setSelectedWeek(fallbackWeek);
    handleTermChange(term);
    applyPeriodRange(periodSchoolYear, term, fallbackWeek);
  };

  const handleDateJump = (value) => {
    setSelectedDate(value);
    if (!value) return;

    const targetSchoolYear = getSchoolYearForDate(value);
    const targetTerm = getTermForDate(targetSchoolYear, value);
    const targetWeek = getWeekForDate(targetSchoolYear, targetTerm, value, TOTAL_COMPETITION_WEEKS);

    if (!targetSchoolYear || !targetTerm || !targetWeek) {
      setStartDate(value);
      setEndDate(value);
      setCurrentPage(1);
      return;
    }

    if (setSelectedSchoolYear) {
      setSelectedSchoolYear(targetSchoolYear);
    }
    handleTermChange(targetTerm);
    setPeriodSchoolYear(targetSchoolYear);
    setPeriodTerm(targetTerm);
    setSelectedWeek(targetWeek.week);
    setStartDate(targetWeek.startDate);
    setEndDate(targetWeek.endDate);
    setCurrentPage(1);
  };

  const goToConductRating = () => {
    const query = new URLSearchParams({
      class: String(classId),
      tab: "conduct",
      schoolYear: periodSchoolYear || "",
      term: periodTerm || "",
      week: String(selectedWeek),
      startDate: startDate || "",
      endDate: endDate || "",
    });
    navigate(`/management/competition?${query.toString()}`);
  };

  return (
    <div className="vp-class-deduction-logs">
      <PageHeader
        title="Nhật ký thi đua lớp"
        subtitle={`Xem chi tiết vi phạm và khen thưởng của lớp`}
        actions={
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <button className="cdl-back-btn" onClick={handleBack}>
              <FiArrowLeft /> Quay lại
            </button>
            <button className="cdl-back-btn" onClick={goToConductRating}>
              <FiAward /> Đánh giá hạnh kiểm
            </button>
            <DisciplineHeaderActions
              selectedSchoolYear={periodSchoolYear}
              selectedTerm={periodTerm}
              onYearChange={handlePeriodYearChange}
              onTermChange={handlePeriodTermChange}
            />
          </div>
        }
      />

      {/* Score Summary Cards */}
      <div className="cdl-score-summary">
        <div className="cdl-score-card base">
          <div className="cdl-score-icon">
            <FiMinus />
          </div>
          <div className="cdl-score-content">
            <span className="cdl-score-label">Điểm cơ sở</span>
            <span className="cdl-score-value">{summary.baseScore}</span>
            <span className="cdl-score-sub">điểm</span>
          </div>
        </div>

        <div className="cdl-score-card bonus">
          <div className="cdl-score-icon">
            <FiTrendingUp />
          </div>
          <div className="cdl-score-content">
            <span className="cdl-score-label">Điểm cộng</span>
            <span className="cdl-score-value">+{summary.totalBonus}</span>
            <span className="cdl-score-sub">khen thưởng</span>
          </div>
        </div>

        <div className="cdl-score-card deduction">
          <div className="cdl-score-icon">
            <FiTrendingDown />
          </div>
          <div className="cdl-score-content">
            <span className="cdl-score-label">Điểm trừ</span>
            <span className="cdl-score-value">-{summary.totalDeduction}</span>
            <span className="cdl-score-sub">vi phạm</span>
          </div>
        </div>

        <div className="cdl-score-card net">
          <div className="cdl-score-icon">
            <FiAward />
          </div>
          <div className="cdl-score-content">
            <span className="cdl-score-label">Điểm thi đua</span>
            <span className="cdl-score-value">{summary.netScore}</span>
            <span className="cdl-score-sub">điểm ròng</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="cdl-tabs">
        <button
          className={`cdl-tab-btn danger ${activeTab === "violations" ? "active" : ""}`}
          onClick={() => { setActiveTab("violations"); setCurrentPage(1); }}
        >
          <FiAlertTriangle />
          Vi phạm ({totalItems})
        </button>
        <button
          className={`cdl-tab-btn success ${activeTab === "rewards" ? "active" : ""}`}
          onClick={() => { setActiveTab("rewards"); setCurrentPage(1); }}
        >
          <FiAward />
          Khen thưởng
        </button>
      </div>

      {/* Filter Bar */}
      <div className="cdl-filter-bar">
        <div className="cdl-filter-group">
          <label><FiCalendar /> Chọn ngày</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateJump(e.target.value)}
          />
        </div>

        <div className="cdl-filter-group">
          <label><FiCalendar /> Từ ngày</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
          />
        </div>

        <div className="cdl-filter-group">
          <label><FiCalendar /> Đến ngày</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
          />
        </div>

        {activeTab === "violations" ? (
          <div className="cdl-filter-group">
            <label><FiAlertTriangle /> Loại vi phạm</label>
            <select
              value={violationTypeId}
              onChange={(e) => { setViolationTypeId(e.target.value); setCurrentPage(1); }}
            >
              {violationTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="cdl-filter-group">
            <label><FiAward /> Loại thưởng</label>
            <select
              value={rewardTypeId}
              onChange={(e) => { setRewardTypeId(e.target.value); setCurrentPage(1); }}
            >
              {rewardTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}

        <div className="cdl-filter-group">
          <label><FiFilter /> Trạng thái</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="all">Tất cả</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
          </select>
        </div>

        <div className="cdl-search-box" style={{ flex: 1, maxWidth: "280px" }}>
          <FiSearch size={16} />
          <input
            type="text"
            placeholder="Tìm học sinh..."
            value={studentSearch}
            onChange={(e) => { setStudentSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>

        <div className="cdl-filter-actions">
          <button className="cdl-btn-reset" onClick={handleResetFilters}>
            Đặt lại
          </button>
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="cdl-main-panel">
        <div className="cdl-panel-header">
          <div>
            <h3>
              {activeTab === "violations" ? (
                <>
                  <FiAlertTriangle style={{ color: "#dc2626" }} />
                  Danh sách vi phạm
                </>
              ) : (
                <>
                  <FiAward style={{ color: "#16a34a" }} />
                  Danh sách khen thưởng
                </>
              )}
            </h3>
            <p>
              {startDate && endDate
                ? `Từ ${formatDateForDisplay(startDate)} đến ${formatDateForDisplay(endDate)}`
                : `Tuần ${selectedWeek}`}
              {classId && ` • Lớp ${classId}`}
            </p>
          </div>
        </div>

        <div className="cdl-table-wrap">
          {isLoading ? (
            <div className="cdl-loading">Đang tải dữ liệu...</div>
          ) : isError ? (
            <div className="cdl-loading" style={{ color: "#dc2626" }}>
              Không thể tải dữ liệu. Vui lòng thử lại.
            </div>
          ) : currentData.length === 0 ? (
            <EmptyState
              title={activeTab === "violations" ? "Không có vi phạm" : "Không có khen thưởng"}
              description="Chưa ghi nhận bản ghi nào trong khoảng thời gian này."
              compact
            />
          ) : (
            <>
              {activeTab === "violations" ? (
                <table className="cdl-table">
                  <thead>
                    <tr>
                      <th>Ngày</th>
                      <th>Học sinh</th>
                      <th>Loại vi phạm</th>
                      <th className="th-center">Mức độ</th>
                      <th className="th-center">Điểm trừ</th>
                      <th className="th-center">Trạng thái duyệt</th>
                      <th>Người duyệt</th>
                      <th>Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {violations.map((v) => (
                      <tr key={v.id}>
                        <td>{formatDateForDisplay(v.date) || "—"}</td>
                        <td>
                          <div className="cdl-student-profile">
                            <div className="cdl-student-avatar">
                              {v.studentName?.charAt(0) || "?"}
                            </div>
                            <div className="cdl-student-info">
                              <strong>{v.studentName || "—"}</strong>
                              <small>{v.studentCode}</small>
                            </div>
                          </div>
                        </td>
                        <td>{v.violationType || "—"}</td>
                        <td className="td-center">
                          <span className={`cdl-severity-badge ${v.severity}`}>
                            {SEVERITY_LABELS[v.severity] || v.severity}
                          </span>
                        </td>
                        <td className="td-center">
                          <span className="cdl-points-badge deduct">
                            -{v.pointsDeducted}
                          </span>
                        </td>
                        <td className="td-center">
                          <span className={`cdl-status-badge ${v.status}`}>
                            {STATUS_LABELS[v.status] || v.status}
                          </span>
                        </td>
                        <td>{v.verifiedBy || "—"}</td>
                        <td>{v.notes || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="cdl-table">
                  <thead>
                    <tr>
                      <th>Ngày</th>
                      <th>Học sinh</th>
                      <th>Loại thưởng</th>
                      <th className="th-center">Điểm cộng</th>
                      <th className="th-center">Trạng thái duyệt</th>
                      <th>Người duyệt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rewards.map((r) => (
                      <tr key={r.id}>
                        <td>{formatDateForDisplay(r.date) || "—"}</td>
                        <td>
                          <div className="cdl-student-profile">
                            <div className="cdl-student-avatar">
                              {r.studentName?.charAt(0) || "?"}
                            </div>
                            <div className="cdl-student-info">
                              <strong>{r.studentName || "—"}</strong>
                              <small>{r.studentCode}</small>
                            </div>
                          </div>
                        </td>
                        <td>{r.rewardType || "—"}</td>
                        <td className="td-center">
                          <span className="cdl-points-badge bonus">
                            +{r.pointsAdded}
                          </span>
                        </td>
                        <td className="td-center">
                          <span className={`cdl-status-badge ${r.status}`}>
                            {STATUS_LABELS[r.status] || r.status}
                          </span>
                        </td>
                        <td>{r.verifiedBy || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>

        {!isLoading && !isError && currentData.length > 0 && (
          <div className="cdl-pagination">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
