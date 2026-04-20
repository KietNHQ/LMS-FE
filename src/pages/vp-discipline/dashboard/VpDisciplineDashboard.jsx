import { useState } from "react";
import { PageHeader, WeekPicker, EventCalendar } from "../../../components/common";
import DisciplineHeaderActions from "../components/DisciplineHeaderActions";
import Select from "../../../components/ui/Select/Select";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { FiAlertTriangle, FiUsers, FiClock, FiAward, FiBarChart2, FiArrowRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { INITIAL_CALENDAR_EVENTS, CALENDAR_EVENT_TYPES } from "../../../components/common/EventCalendar/eventData";
import "./VpDisciplineDashboard.css";

export default function VpDisciplineDashboard() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const navigate = useNavigate();
    const [selectedWeek, setSelectedWeek] = useState(10);
    const [leaderboardGrade, setLeaderboardGrade] = useState("all");
    const [conductGrade, setConductGrade] = useState("all");

    // Mock Business Data
    const stats = {
        violationsToday: 18,
        studentsInvolved: 22,
        attendanceRate: 98.5,
        topRank: "12A1"
    };

    const alerts = [
        { id: 1, title: "Lớp vi phạm nhiều nhất tuần này: 10A3", desc: "Tổng cộng 15 vi phạm. Tăng 50% so với tuần trước. Chủ yếu là đi học trễ.", path: "/vp-discipline/discipline-management?class=10A3" },
        { id: 2, title: "Lớp có dấu hiệu tụt dốc trong ngày: 11A1", desc: "Hôm nay vắng 4 học sinh không phép và 2 trường hợp vi phạm tác phong.", path: "/vp-discipline/attendance" },
        { id: 3, title: "Các học sinh vi phạm nhiều nhất trong tháng", desc: "Nguyễn Văn A (12A2), Lê Thị B (10A1)... Cần mời phụ huynh làm việc.", path: "/vp-discipline/discipline-management?filter=serious" },
    ];

    const approvals = [
        { id: 1, title: "Biên bản lớp 11A5", subtitle: "GVCN gửi 10p trước", status: "Chờ duyệt" },
        { id: 2, title: "Đề nghị nâng mức kỷ luật", subtitle: "Giám thị 01 gửi", status: "Chờ duyệt" },
        { id: 3, title: "Đơn xin gỡ điểm trừ 10C2", subtitle: "Học sinh gửi 1h trước", status: "Mới" },
        { id: 4, title: "Báo cáo nề nếp tháng 3", subtitle: "Tổ trưởng gửi", status: "Chờ duyệt" },
    ].slice(0, 3);

    const incidents = [
        { id: 1, title: "Xô xát tại sân trường", subtitle: "Cần xử lý trước 16/10", status: "Khẩn cấp" },
        { id: 2, title: "Tái phạm đi trễ 3 lần", subtitle: "Gửi hồ sơ GVCN", status: "Giao việc" },
        { id: 3, title: "Mất trật tự trong giờ học", subtitle: "Hòa giải trực tiếp", status: "Đã xử lý" },
    ].slice(0, 3);

    const fullLeaderboard = [
        { id: 1, grade: 12, name: "Lớp 12A1", score: 98.5, rank: 1 },
        { id: 2, grade: 10, name: "Lớp 10A1", score: 96.0, rank: 2 },
        { id: 3, grade: 11, name: "Lớp 11A2", score: 92.5, rank: 3 },
        { id: 4, grade: 12, name: "Lớp 12A5", score: 91.0, rank: 4 },
        { id: 5, grade: 10, name: "Lớp 10B2", score: 89.5, rank: 5 },
        { id: 6, grade: 11, name: "Lớp 11C1", score: 88.0, rank: 6 },
    ];

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
            <div className="vp-panel-grid-3">
                {/* 1. Hàng đợi phê duyệt */}
                <div className="vp-panel">
                    <div className="vp-panel-header">
                        <h3><FiClock /> Hàng đợi phê duyệt</h3>
                    </div>
                    <div className="mini-stat-list">
                        {approvals.map(item => (
                            <div key={item.id} className="m-stat-item clickable" onClick={() => navigate("/vp-discipline/approvals")}>
                                <div className="m-stat-info">
                                    <strong>{item.title}</strong>
                                    <span>{item.subtitle}</span>
                                </div>
                                <span className={`status-chip ${item.status === 'Mới' ? 'new' : 'pending'}`}>{item.status}</span>
                            </div>
                        ))}
                    </div>
                </div>

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
                                <span className={`status-chip ${item.status === 'Khẩn cấp' ? 'serious' : item.status === 'Giao việc' ? 'serious' : 'success'}`}>
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
