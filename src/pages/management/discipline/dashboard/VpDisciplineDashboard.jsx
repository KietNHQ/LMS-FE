import { useEffect, useState } from "react";
import { PageHeader, WeekPicker, EventCalendar } from "../../../../components/common";
import DisciplineHeaderActions from "../components/DisciplineHeaderActions";
import Select from "../../../../components/ui/Select/Select";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import { resolveSemesterId } from "../../../../services/shared/schoolYearLookup";
import { vpDisciplineService } from "../../../../services/pages/management/vp-discipline";
import { FiAlertTriangle, FiUsers, FiClock, FiAward, FiBarChart2, FiArrowRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { INITIAL_CALENDAR_EVENTS, CALENDAR_EVENT_TYPES } from "../../../../components/common/EventCalendar/eventData";
import "./VpDisciplineDashboard.css";

const STATUS_LABELS = { open: "Mở", in_progress: "Đang xử lý", resolved: "Đã giải quyết", closed: "Đóng" };
const INCIDENT_STATUS_LABELS = { open: "Khẩn cấp", in_progress: "Giao việc", resolved: "Đã xử lý", closed: "Đã đóng" };

export default function VpDisciplineDashboard() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const navigate = useNavigate();
    const [selectedWeek, setSelectedWeek] = useState(10);
    const [leaderboardGrade, setLeaderboardGrade] = useState("all");
    const [conductGrade, setConductGrade] = useState("all");

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

                const [summaryResult, rankingsResult, escalationsResult] = await Promise.allSettled([
                    semesterId
                        ? vpDisciplineService.getReportSummary(semesterId, {
                            params: { schoolYearId: selectedSchoolYear },
                        })
                        : Promise.reject(new Error("No semester")),
                    semesterId
                        ? vpDisciplineService.getClassRankings({
                            params: { schoolYearId: selectedSchoolYear, semesterId },
                        })
                        : Promise.reject(new Error("No semester")),
                    semesterId
                        ? vpDisciplineService.callByKey("get_discipline_escalations_stats_by_semesterid", {
                            pathParams: { semesterId },
                        })
                        : Promise.reject(new Error("No semester")),
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

                // ── Alerts: top escalations by priority ──
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

                // ── Incidents: recent escalations ──
                setIncidents(
                    sortedEscalations.slice(0, 3).map((e) => ({
                        id: e.id,
                        title: e.title || e.incident_title || "Sự vụ",
                        subtitle: e.due_date ? `Hạn: ${e.due_date}` : "",
                        status: INCIDENT_STATUS_LABELS[e.status] || e.status || "Mở",
                        priority: e.priority,
                    }))
                );

                // ── Leaderboard: class rankings ──
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

    const chartData = [
        { day: 'T2', value: 12, h: '40%' },
        { day: 'T3', value: 8, h: '30%' },
        { day: 'T4', value: 18, h: '60%' },
        { day: 'T5', value: 25, h: '90%' },
        { day: 'T6', value: 10, h: '35%' },
        { day: 'T7', value: 5, h: '15%' },
    ];

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
                <EventCalendar 
                    title="Lịch Vận Hành Nghiệp Vụ"
                    selectedSchoolYear={selectedSchoolYear}
                    selectedTerm={selectedTerm}
                    themeClass="theme-discipline"
                    userRole="admin"
                    isCompact={false}
                    initialEvents={INITIAL_CALENDAR_EVENTS}
                    eventTypes={CALENDAR_EVENT_TYPES}
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
                            options={[
                                { value: "all", label: "Tất cả khối" },
                                { value: "10", label: "Khối 10" },
                                { value: "11", label: "Khối 11" },
                                { value: "12", label: "Khối 12" }
                            ]}
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
                            (Tổng {conductGrade === 'all' ? '1,250' : (conductGrade === '10' ? '420' : (conductGrade === '11' ? '410' : '420'))} HS)
                        </span>
                    </h3>
                    <Select 
                        className="panel-select-mini-wrap"
                        variant="custom"
                        value={conductGrade}
                        onChange={(e) => setConductGrade(e.target.value)}
                        options={[
                            { value: "all", label: "Toàn trường" },
                            { value: "10", label: "Khối 10" },
                            { value: "11", label: "Khối 11" },
                            { value: "12", label: "Khối 12" }
                        ]}
                    />
                </div>
                <div className="pulse-bar-container">
                    <div className="pulse-row">
                        <div className="pulse-label">
                            <span>Hạnh kiểm Tốt (85.2%)</span>
                            <strong>1,065 học sinh</strong>
                        </div>
                        <div className="pulse-track">
                            <div className="pulse-fill tot" style={{width: '85.2%'}}></div>
                        </div>
                    </div>
                    <div className="pulse-row">
                        <div className="pulse-label">
                            <span>Hạnh kiểm Khá (10.4%)</span>
                            <strong>130 học sinh</strong>
                        </div>
                        <div className="pulse-track">
                            <div className="pulse-fill kha" style={{width: '10.4%'}}></div>
                        </div>
                    </div>
                    <div className="pulse-row">
                        <div className="pulse-label">
                            <span>Trung bình (3.8%)</span>
                            <strong>48 học sinh</strong>
                        </div>
                        <div className="pulse-track">
                            <div className="pulse-fill tb" style={{width: '3.8%'}}></div>
                        </div>
                    </div>
                    <div className="pulse-row">
                        <div className="pulse-label">
                            <span>Hạnh kiểm Yếu (0.6%)</span>
                            <strong>7 học sinh</strong>
                        </div>
                        <div className="pulse-track">
                            <div className="pulse-fill yeu" style={{width: '0.6%'}}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

