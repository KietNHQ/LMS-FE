import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { FiAlertTriangle, FiUsers, FiClock, FiAward, FiBarChart2, FiArrowRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./VpDisciplineDashboard.css";

export default function VpDisciplineDashboard() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const navigate = useNavigate();

    // Mock Business Data
    const stats = {
        violationsToday: 18,
        studentsInvolved: 22,
        attendanceRate: 98.5,
        topRank: "12A1"
    };

    const alerts = [
        { id: 1, title: "⚠️ Lớp 10A3 có 15 vi phạm tuần này", desc: "Tăng 50% so với tuần trước. Chủ yếu là đi học trễ.", path: "/vp-discipline/discipline-management?class=10A3" },
        { id: 2, title: "⚠️ Lớp 11A1 chuyên cần tụt dốc", desc: "Hôm nay vắng 4 học sinh không có phép.", path: "/vp-discipline/attendance" },
        { id: 3, title: "⚠️ 5 học sinh vi phạm nghiêm trọng", desc: "Đã vi phạm trên 3 lần trong nửa đầu tháng này.", path: "/vp-discipline/discipline-management?filter=serious" },
    ];

    const chartData = [
        { day: 'T2', value: 12, h: '40%' },
        { day: 'T3', value: 8, h: '30%' },
        { day: 'T4', value: 18, h: '60%' },
        { day: 'T5', value: 25, h: '90%' },
        { day: 'T6', value: 10, h: '35%' },
        { day: 'T7', value: 5, h: '15%' },
    ];

    return (
        <div className="vp-dashboard">
            <PageHeader
                title="Bảng Điều Khiển Nề Nếp"
                eyebrow="Radar giám sát kỷ luật & thi đua toàn trường"
                actions={
                    <SchoolYearTermSelector
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
                        <p className="vp-stat-label">% Chuyên cần toàn trường</p>
                        <h3 className="vp-stat-value">{stats.attendanceRate}%</h3>
                    </div>
                </div>
                <div className="vp-stat-card primary">
                    <div className="vp-stat-icon"><FiAward /></div>
                    <div className="vp-stat-body">
                        <p className="vp-stat-label">Lớp dẫn đầu thi đua</p>
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
                                <button className="btn-resolve" onClick={() => navigate(alert.path)}>
                                    Kiểm tra <FiArrowRight />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Panel 2: Biểu đồ vi phạm */}
                <div className="vp-panel">
                    <div className="vp-panel-header">
                        <h3><FiBarChart2 /> Biểu đồ số lượt vi phạm trong tuần</h3>
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
        </div>
    );
}
