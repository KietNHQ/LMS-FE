import { useEffect, useState, useMemo } from "react";
import { PageHeader, WeekPicker, EventCalendar } from "../../../../components/common";
import DisciplineHeaderActions from "../components/DisciplineHeaderActions";
import Select from "../../../../components/ui/Select/Select";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import { resolveSemesterId } from "../../../../services/shared/schoolYearLookup";
import { vpDisciplineService } from "../../../../services/pages/management/vp-discipline";
import { disciplineService } from "../../../../services/pages/management/discipline/disciplineService";
import axiosClient from "../../../../services/shared/http/axiosClient";
import { FiAlertTriangle, FiUsers, FiClock, FiAward, FiBarChart2, FiArrowRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { INITIAL_CALENDAR_EVENTS, CALENDAR_EVENT_TYPES } from "../../../../components/common/EventCalendar/eventData";
import "./VpDisciplineDashboard.css";

const STATUS_LABELS = { open: "Mở", in_progress: "Đang xử lý", resolved: "Đã giải quyết", closed: "Đóng" };
const INCIDENT_STATUS_LABELS = { open: "Khẩn cấp", in_progress: "Giao việc", resolved: "Đã xử lý", closed: "Đã đóng" };

// Tính ngày bắt đầu/kết thúc của 1 tuần trong năm học
const getWeekDateRange = (weekNumber, schoolYear) => {
    if (!schoolYear) return null;
    const [startYear] = schoolYear.split("-").map(Number);
    // Năm học bắt đầu tháng 9
    const yearStart = new Date(startYear, 8, 1); // Sept 1
    // Tính ngày bắt đầu tuần (Thứ 2)
    const daysOffset = (weekNumber - 1) * 7;
    const weekStart = new Date(yearStart);
    weekStart.setDate(weekStart.getDate() + daysOffset);
    // Ngày kết thúc tuần (CN)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    return {
        startDate: weekStart.toISOString().split("T")[0],
        endDate: weekEnd.toISOString().split("T")[0],
    };
};

// Chuyển đổi violations thành calendar events
const violationsToCalendarEvents = (violations) => {
    if (!Array.isArray(violations)) return [];
    return violations.map((v, idx) => ({
        startDay: new Date(v.violation_date || v.date || Date.now()).getDate(),
        endDay: new Date(v.violation_date || v.date || Date.now()).getDate(),
        title: v.student_name || v.studentName || `VP #${v.id}`,
        content: v.violation_type_name || v.violationTypeName || v.description || "",
        color: v.severity === "high" ? "red" : v.severity === "medium" ? "orange" : "yellow",
        target: "all",
        type: "violation",
        violationId: v.id,
        studentId: v.student_id || v.studentId,
    }));
};

export default function VpDisciplineDashboard() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const navigate = useNavigate();
    const [selectedWeek, setSelectedWeek] = useState(10);
    const [leaderboardGrade, setLeaderboardGrade] = useState("all");
    const [conductGrade, setConductGrade] = useState("all");

    // Resolve semesterId from selectedSchoolYear and selectedTerm
    const { data: resolvedSemesterId } = useQuery({
        queryKey: ["semester-id", selectedSchoolYear, selectedTerm],
        queryFn: () => resolveSemesterId(selectedSchoolYear, selectedTerm || "hk1"),
        enabled: Boolean(selectedSchoolYear),
        staleTime: 5 * 60 * 1000,
    });

    // Tính date range của tuần được chọn
    const weekDateRange = useMemo(() => {
        return getWeekDateRange(selectedWeek, selectedSchoolYear);
    }, [selectedWeek, selectedSchoolYear]);

    // Fetch violations cho tuần được chọn
    const { data: weekViolations = [] } = useQuery({
        queryKey: ["discipline-violations-week", resolvedSemesterId, weekDateRange],
        queryFn: async () => {
            if (!resolvedSemesterId || !weekDateRange) return [];
            try {
                const res = await axiosClient.get("/discipline/violations", {
                    params: {
                        semesterId: resolvedSemesterId,
                        startDate: weekDateRange.startDate,
                        endDate: weekDateRange.endDate,
                    },
                });
                const data = res?.data?.data || res?.data || [];
                return Array.isArray(data) ? data : [];
            } catch { return []; }
        },
        enabled: Boolean(resolvedSemesterId && weekDateRange),
        staleTime: 30_000,
    });

    // Chuyển violations thành calendar events cho tuần
    const violationEvents = useMemo(() => {
        return violationsToCalendarEvents(weekViolations);
    }, [weekViolations]);

    // Fetch violations trend cho biểu đồ
    const { data: trendRaw = [] } = useQuery({
        queryKey: ["discipline-dashboard-trend", resolvedSemesterId],
        queryFn: async () => {
            if (!resolvedSemesterId) return [];
            try {
                const res = await vpDisciplineService.getViolationsTrend({ params: { semesterId: resolvedSemesterId } });
                return res?.data || res || [];
            } catch { return []; }
        },
        enabled: Boolean(resolvedSemesterId),
        staleTime: 60_000,
    });

    // Gộp violation events vào calendar
    const calendarEvents = useMemo(() => {
        return [...INITIAL_CALENDAR_EVENTS, ...violationEvents];
    }, [violationEvents]);

    // Fetch grade levels from API
    const { data: gradeLevelsData = [] } = useQuery({
        queryKey: ["grade-levels-dashboard"],
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
            return [
                { value: "all", label: "Tất cả khối" },
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

    // ── Dashboard state (populated from real API) ──
    const [stats, setStats] = useState({
        violationsToday: 0,
        studentsInvolved: 0,
        attendanceRate: 0,
        topRank: "—",
    });
    const [alerts, setAlerts] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [fullLeaderboard, setFullLeaderboard] = useState([]);

    useEffect(() => {
        let isMounted = true;

        const loadDashboardData = async () => {
            try {
                const semesterId = await resolveSemesterId(selectedSchoolYear, selectedTerm);
                if (!semesterId || !isMounted) return;

                const [summaryResult, rankingsResult, escalationsResult] = await Promise.allSettled([
                    vpDisciplineService.getReportSummary(semesterId, {
                        params: { schoolYearId: selectedSchoolYear },
                    }),
                    vpDisciplineService.getClassRankings({
                        params: { schoolYearId: selectedSchoolYear, semesterId },
                    }),
                    vpDisciplineService.callByKey("get_discipline_escalations_stats_by_semesterid", {
                        pathParams: { semesterId },
                    }),
                ]);

                if (!isMounted) return;

                const summary = summaryResult.status === "fulfilled" ? (summaryResult.value || {}) : {};
                const rankings = rankingsResult.status === "fulfilled" ? (rankingsResult.value || []) : [];
                const escalations = escalationsResult.status === "fulfilled" ? (escalationsResult.value || []) : [];

                const topRank =
                    Array.isArray(rankings) && rankings.length > 0
                        ? rankings[0]?.label || rankings[0]?.className || rankings[0]?.name || "—"
                        : "—";

                setStats((prev) => ({
                    ...prev,
                    violationsToday: Number(summary.totalViolations ?? summary.violationsToday ?? prev.violationsToday) || prev.violationsToday,
                    studentsInvolved: Number(summary.totalStudents ?? summary.studentCount ?? prev.studentsInvolved) || prev.studentsInvolved,
                    attendanceRate: Number(summary.attendanceRate ?? prev.attendanceRate) || prev.attendanceRate,
                    topRank,
                }));

                const sortedEscalations = [...(Array.isArray(escalations) ? escalations : [])].sort(
                    (a, b) => {
                        const pOrder = { high: 0, medium: 1, low: 2 };
                        return (pOrder[a.priority] ?? 3) - (pOrder[b.priority] ?? 3);
                    }
                );
                setAlerts(
                    sortedEscalations.slice(0, 5).map((e, idx) => ({
                        id: e.id ?? idx,
                        title: e.title || e.incident_title || `Sự vụ #${e.id}`,
                        desc: e.description || e.incident_description || "",
                        path: `/vp-discipline/discipline-management?incident=${e.id}`,
                    }))
                );
                setIncidents(
                    sortedEscalations.slice(0, 3).map((e) => ({
                        id: e.id,
                        title: e.title || e.incident_title || "Sự vụ",
                        subtitle: e.due_date ? `Hạn: ${e.due_date}` : "",
                        status: INCIDENT_STATUS_LABELS[e.status] || e.status || "Mở",
                        priority: e.priority,
                    }))
                );
                setFullLeaderboard(
                    rankings.map((r, idx) => ({
                        id: r.id ?? idx,
                        grade: r.grade ?? 0,
                        name: r.label || r.className || r.name || "—",
                        score: r.score ?? r.discipline_score ?? 0,
                        rank: idx + 1,
                    }))
                );
            } catch {
                // silent — stats remain at zero
            }
        };

        if (selectedSchoolYear && selectedTerm) {
            loadDashboardData();
        }
        return () => { isMounted = false; };
    }, [selectedSchoolYear, selectedTerm]);

    const filteredLeaderboard = (leaderboardGrade === "all" 
        ? fullLeaderboard 
        : fullLeaderboard.filter(l => l.grade === parseInt(leaderboardGrade))
    ).slice(0, 3);

    // chartData uses trendRaw from line 101

    const chartData = useMemo(() => {
        if (!trendRaw || !Array.isArray(trendRaw) || trendRaw.length === 0) {
            return [
                { day: 'T2', value: 0, h: '10%' },
                { day: 'T3', value: 0, h: '10%' },
                { day: 'T4', value: 0, h: '10%' },
                { day: 'T5', value: 0, h: '10%' },
                { day: 'T6', value: 0, h: '10%' },
                { day: 'T7', value: 0, h: '10%' },
            ];
        }
        // Group by month label
        const maxVal = Math.max(...trendRaw.map(r => Number(r.total_violations || 0)), 1);
        return trendRaw.slice(0, 6).map(r => ({
            day: r.month ? r.month.slice(5) : '?',
            value: Number(r.total_violations || 0),
            h: `${Math.max(4, (Number(r.total_violations || 0) / maxVal) * 100)}%`,
        }));
    }, [trendRaw]);

    // Total students count from API
    const { data: totalStudentsRaw } = useQuery({
        queryKey: ["discipline-dashboard-total-students", resolvedSemesterId],
        queryFn: async () => {
            if (!resolvedSemesterId) return 0;
            try {
                const res = await vpDisciplineService.getReportSummary(resolvedSemesterId);
                return res?.data?.totalStudents || res?.totalStudents || 0;
            } catch { return 0; }
        },
        enabled: Boolean(resolvedSemesterId),
        staleTime: 60_000,
    });

    const totalStudentsDisplay = totalStudentsRaw > 0
        ? totalStudentsRaw.toLocaleString('vi-VN')
        : "—";

    // Fetch conduct distribution from API
    const { data: conductStatsRaw } = useQuery({
        queryKey: ["discipline-dashboard-conduct", resolvedSemesterId],
        queryFn: async () => {
            if (!resolvedSemesterId) return null;
            try {
                const res = await vpDisciplineService.getReportSummary(resolvedSemesterId);
                // Try to get conduct distribution from summary response
                return {
                    tot: res?.totCount || res?.tot_count || 0,
                    kha: res?.khaCount || res?.kha_count || 0,
                    tb: res?.tbCount || res?.tb_count || 0,
                    yeu: res?.yeuCount || res?.yeu_count || 0,
                    totPct: res?.totPct || 0,
                    khaPct: res?.khaPct || 0,
                    tbPct: res?.tbPct || 0,
                    yeuPct: res?.yeuPct || 0,
                };
            } catch { return null; }
        },
        enabled: Boolean(resolvedSemesterId),
        staleTime: 60_000,
    });

    const conductData = useMemo(() => {
        if (!conductStatsRaw || !totalStudentsRaw) {
            return [
                { label: "Hạnh kiểm Tốt", pct: 0, count: 0, cls: "tot", width: "10%" },
                { label: "Hạnh kiểm Khá", pct: 0, count: 0, cls: "kha", width: "10%" },
                { label: "Trung bình", pct: 0, count: 0, cls: "tb", width: "10%" },
                { label: "Hạnh kiểm Yếu", pct: 0, count: 0, cls: "yeu", width: "10%" },
            ];
        }
        const total = totalStudentsRaw || 1;
        return [
            { label: "Hạnh kiểm Tốt", pct: conductStatsRaw.totPct, count: conductStatsRaw.tot, cls: "tot", width: `${Math.max(1, conductStatsRaw.totPct)}%` },
            { label: "Hạnh kiểm Khá", pct: conductStatsRaw.khaPct, count: conductStatsRaw.kha, cls: "kha", width: `${Math.max(1, conductStatsRaw.khaPct)}%` },
            { label: "Trung bình", pct: conductStatsRaw.tbPct, count: conductStatsRaw.tb, cls: "tb", width: `${Math.max(1, conductStatsRaw.tbPct)}%` },
            { label: "Hạnh kiểm Yếu", pct: conductStatsRaw.yeuPct, count: conductStatsRaw.yeu, cls: "yeu", width: `${Math.max(1, conductStatsRaw.yeuPct)}%` },
        ];
    }, [conductStatsRaw, totalStudentsRaw]);

    return (
        <div className="vp-dashboard discipline-layout">
            <PageHeader
                title="Trung Tâm Điều Hành Nề Nếp"
                actions={
                    <DisciplineHeaderActions
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            <div className="vp-stats-grid">
                <div className="vp-stat-card danger">
                    <div className="vp-stat-icon"><FiAlertTriangle /></div>
                    <div className="vp-stat-body">
                        <p className="vp-stat-label">Tổng vi phạm (Hôm nay)</p>
                        <h3 className="vp-stat-value">{stats.violationsToday}</h3>
                    </div>
                </div>
                <div className="vp-stat-card warning">
                    <div className="vp-stat-icon"><FiUsers /></div>
                    <div className="vp-stat-body">
                        <p className="vp-stat-label">HS Vi Phạm (Tuần này)</p>
                        <h3 className="vp-stat-value">{stats.studentsInvolved} HS</h3>
                    </div>
                </div>
                <div className="vp-stat-card success">
                    <div className="vp-stat-icon"><FiClock /></div>
                    <div className="vp-stat-body">
                        <p className="vp-stat-label">Tỷ lệ chuyên cần toàn trường</p>
                        <h3 className="vp-stat-value">{stats.attendanceRate}%</h3>
                    </div>
                </div>
                <div className="vp-stat-card primary">
                    <div className="vp-stat-icon"><FiAward /></div>
                    <div className="vp-stat-body">
                        <p className="vp-stat-label">Lớp dẫn đầu toàn trường</p>
                        <h3 className="vp-stat-value">{stats.topRank}</h3>
                    </div>
                </div>
            </div>

            <div className="vp-panels">
                {/* Panel 1: Top Cảnh báo Mức Đỏ */}
                <div className="vp-panel urgent">
                    <div className="vp-panel-header">
                        <h3><FiAlertTriangle /> Top Cảnh Báo Khẩn Cấp</h3>
                    </div>
                    <div className="alert-list">
                        {alerts.map(alert => (
                            <div className="alert-item" key={alert.id}>
                                <div className="alert-info">
                                    <strong>{alert.title}</strong>
                                    <span>{alert.desc}</span>
                                </div>
                                <button className="btn-resolve" onClick={() => navigate(alert.path)} aria-label="Kiểm tra">
                                    <FiArrowRight />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Panel 2: Biểu đồ vi phạm */}
                <div className="vp-panel">
                    <div className="vp-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'nowrap' }}>
                        <h3 style={{ whiteSpace: 'nowrap', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            <FiBarChart2 /> Biểu đồ số lượt vi phạm
                        </h3>
                        <WeekPicker 
                            value={selectedWeek} 
                            onChange={setSelectedWeek} 
                            totalWeeks={35}
                        />
                    </div>
                    <div className="mock-chart">
                        {chartData.map(c => (
                            <div className="chart-bar-wrap" key={c.day}>
                                <div className="chart-bar" style={{height: c.h}}>
                                    <span>{c.value}</span>
                                </div>
                                <div className="chart-label">{c.day}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div style={{marginTop: '2rem'}}>
                {/* Violations summary for selected week */}
                <div className="vp-panel" style={{ marginBottom: '1rem' }}>
                    <div className="vp-panel-header">
                        <h3><FiAlertTriangle /> Vi Phạm Tuần {selectedWeek}</h3>
                        <span style={{ color: weekViolations.length > 0 ? '#e53e3e' : '#48bb78', fontWeight: 'bold' }}>
                            {weekViolations.length} vi phạm
                        </span>
                    </div>
                </div>
                <EventCalendar 
                    title="Lịch Vận Hành Nghiệp Vụ"
                    selectedSchoolYear={selectedSchoolYear}
                    selectedTerm={selectedTerm}
                    themeClass="theme-discipline"
                    userRole="admin"
                    isCompact={false}
                    initialEvents={calendarEvents}
                    eventTypes={[...CALENDAR_EVENT_TYPES, { value: "red", label: "Vi phạm nặng" }, { value: "orange", label: "Vi phạm vừa" }, { value: "yellow", label: "Vi phạm nhẹ" }]}
                    rolePolicy={{
                        canCreate: false,
                        canViewDetails: true,
                        canEdit: false,
                        canDelete: false
                    }}
                />
            </div>

            {/* ── Operational Insight Grid ── */}
            <div className="vp-panel-grid-2">

                {/* 2. Theo dõi Sự vụ */}
                <div className="vp-panel">
                    <div className="vp-panel-header">
                        <h3><FiAlertTriangle /> Theo dõi Sự vụ Nổi bật</h3>
                    </div>
                    <div className="mini-stat-list">
                        {incidents.map(item => (
                            <div key={item.id} className="m-stat-item clickable" onClick={() => navigate("/vp-discipline/discipline-management")}>
                                <div className="m-stat-info">
                                    <strong>{item.title}</strong>
                                    <span>{item.subtitle}</span>
                                </div>
                                <span className={`status-chip ${item.priority === 'high' || item.priority === 'medium' ? 'serious' : 'success'}`}>
                                    {item.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. Bảng xếp hạng Thi đua */}
                <div className="vp-panel">
                    <div className="vp-panel-header">
                        <h3><FiAward /> Bảng xếp hạng Thi đua</h3>
                        <Select 
                            className="panel-select-mini-wrap"
                            variant="custom"
                            value={leaderboardGrade}
                            onChange={(e) => setLeaderboardGrade(e.target.value)}
                            options={gradeOptions}
                        />
                    </div>
                    <div className="mini-stat-list">
                        {filteredLeaderboard.map(item => (
                            <div key={item.id} className="m-stat-item clickable" onClick={() => navigate("/vp-discipline/discipline-management?tab=competition")}>
                                <div className="m-stat-info">
                                    <strong>{item.name}</strong>
                                    <span>Điểm: {item.score}</span>
                                </div>
                                {item.rank <= 3 ? (
                                    <div className={`rank-badge top rank-${item.rank}`}><FiAward /></div>
                                ) : (
                                    <div className="rank-badge">{item.rank}</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Conduct Pulse Section ── */}
            <div className="vp-panel pulse-panel">
                <div className="vp-panel-header">
                    <h3>
                        <FiBarChart2 /> 
                        Phân bộ Hạnh kiểm {conductGrade === 'all' ? 'Toàn trường' : `Khối ${conductGrade}`}
                        <span className="header-count-badge">
                            (Tổng {totalStudentsDisplay} HS)
                        </span>
                    </h3>
                    <Select 
                        className="panel-select-mini-wrap"
                        variant="custom"
                        value={conductGrade}
                        onChange={(e) => setConductGrade(e.target.value)}
                        options={gradeOptions}
                    />
                </div>
                <div className="pulse-bar-container">
                    {conductData.map(row => (
                    <div className="pulse-row">
                        <div className="pulse-label">
                            <span>{row.label} ({row.pct > 0 ? row.pct.toFixed(1) + '%' : '—'})</span>
                            <strong>{row.count > 0 ? row.count.toLocaleString('vi-VN') + ' học sinh' : 'Chưa có dữ liệu'}</strong>
                        </div>
                        <div className="pulse-track">
                            <div className={`pulse-fill ${row.cls}`} style={{width: row.width}}></div>
                        </div>
                    </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

