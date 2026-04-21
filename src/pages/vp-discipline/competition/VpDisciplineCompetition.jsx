import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader, WeekPicker, StatusBadge } from "../../../components/common";
import DisciplineHeaderActions from "../components/DisciplineHeaderActions";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import Select from "../../../components/ui/Select/Select";
import { 
    FiAward, FiArrowUp, FiArrowDown, FiMinus, FiTrendingUp, FiTrendingDown, 
    FiDownload, FiLayers, FiCalendar, FiStar, FiAlertCircle, FiActivity, FiArrowRight 
} from "react-icons/fi";
import "./VpDisciplineCompetition.css";

export default function VpDisciplineCompetition({ isEmbedded = false, onClassClick }) {
    const navigate = useNavigate();
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [selectedWeek, setSelectedWeek] = useState(12);
    const [selectedGrade, setSelectedGrade] = useState("all");

    const rankingData = [
        { rank: 1, class: "12A1", homeroom: "Nguyễn Vĩ C", points: 98.5, trend: "up", change: 2, attendance: "99.2%" },
        { rank: 2, class: "10A1", homeroom: "Trần Mai Anh", points: 96.0, trend: "flat", change: 0, attendance: "98.5%" },
        { rank: 3, class: "11A2", homeroom: "Lê Minh H", points: 92.5, trend: "up", change: 1, attendance: "97.8%" },
        { rank: 4, class: "10A2", homeroom: "Phạm Bình Minh", points: 89.0, trend: "down", change: 1, attendance: "95.0%" },
        { rank: 5, class: "12C3", homeroom: "Lê I", points: 85.0, trend: "up", change: 3, attendance: "96.5%" },
        { rank: 35, class: "10A3", homeroom: "Trịnh Thùy L", points: -15.0, trend: "down", change: 5, attendance: "82.0%" },
    ];

    const statsCards = [
        { title: "Tỷ lệ hiện diện", val: "98.5%", sub: "Toàn trường hôm nay", icon: <FiActivity />, color: "primary" },
        { title: "Cần Nhắc Nhở", val: "10A3", sub: "-15.0 điểm", icon: <FiAlertCircle />, color: "danger" },
        { title: "Điểm TB Tuần", val: "82.4", sub: "Giảm 2.1 so với tuần trước", icon: <FiActivity />, color: "info" },
        { title: "Tỷ lệ Chuyên cần", val: "97.2%", sub: "Đã qua kiểm tra", icon: <FiStar />, color: "success" },
    ];

    const handleClassClick = (className) => {
        if (onClassClick) {
            onClassClick(className);
        } else {
            navigate(`/vp-discipline/attendance?class=${className}`);
        }
    };

    return (
        <div className="vp-competition vp-discipline-layout">
            {!isEmbedded && (
                <PageHeader
                    title="Xếp Hạng Thi Đua"
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
                {statsCards.map((card, idx) => (
                    <div key={idx} className={`comp-stat-card ${card.color}`}>
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
                            totalWeeks={35}
                        />
                    </div>
                    <div className="filter-group">
                        <label><FiLayers /> Khối</label>
                        <Select 
                            variant="custom"
                            value={selectedGrade}
                            onChange={(e) => setSelectedGrade(e.target.value)}
                            options={[
                                { value: "all", label: "Tất cả" },
                                { value: "10", label: "Khối 10" },
                                { value: "11", label: "Khối 11" },
                                { value: "12", label: "Khối 12" }
                            ]}
                        />
                    </div>
                </div>

                <div className="dm-primary-actions-compact">
                    <button className="btn-export-reports">
                        <FiDownload /> Xuất báo cáo Thi Đua
                    </button>
                </div>
            </div>

            <div className="comp-main-grid">
                {/* Leaderboard Section */}
                <div className="comp-leaderboard-panel animate-fade-in">
                    <div className="panel-header">
                        <h3><FiAward /> Bảng Xếp Hạng Lớp</h3>
                        <p>Dữ liệu được tổng hợp từ điểm chuyên cần, nề nếp và học tập</p>
                    </div>
                    
                    <div className="rank-table-premium-wrap">
                        <table className="rank-table-premium">
                            <thead>
                                <tr>
                                    <th className="th-center">Hạng</th>
                                    <th>Lớp</th>
                                    <th>GV Chủ Nhiệm</th>
                                    <th>Chuyên Cần</th>
                                    <th className="th-center">Tổng Điểm</th>
                                    <th>Xu Hướng</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rankingData.map(item => (
                                    <tr 
                                        key={item.class} 
                                        className="clickable-row"
                                        onClick={() => handleClassClick(item.class)}
                                    >
                                        <td className="td-center">
                                            <div className={`rank-medal ${item.rank <= 3 ? `medal-${item.rank}` : 'medal-other'}`}>
                                                {item.rank}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="class-name-v2">{item.class}</span>
                                        </td>
                                        <td>{item.homeroom}</td>
                                        <td>
                                            <div className="attendance-mini-bar">
                                                <div className="bar-fill" style={{width: item.attendance}}></div>
                                                <span>{item.attendance}</span>
                                            </div>
                                        </td>
                                        <td className="td-center">
                                            <strong className="points-accent">{item.points}đ</strong>
                                        </td>
                                        <td>
                                            {item.trend === 'up' && <span className="trend-badge up"><FiTrendingUp /> +{item.change}</span>}
                                            {item.trend === 'down' && <span className="trend-badge down"><FiTrendingDown /> -{item.change}</span>}
                                            {item.trend === 'flat' && <span className="trend-badge flat"><FiMinus /></span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Highlights Side Column */}
                <div className="comp-highlights-column">
                    <div className="highlight-card success">
                        <h4><FiTrendingUp /> Biểu Dương</h4>
                        <div className="highlight-list">
                            <div className="h-item">
                                <div className="h-icon">🏆</div>
                                <div className="h-info">
                                    <strong>Lớp 12A1</strong>
                                    <span>Vô địch chuyên cần tuần 12</span>
                                </div>
                            </div>
                            <div className="h-item">
                                <div className="h-icon">🚀</div>
                                <div className="h-info">
                                    <strong>Lớp 11A2</strong>
                                    <span>Tăng 5 bậc so với tuần trước</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="highlight-card danger mt-lg">
                        <h4><FiTrendingDown /> Cần Khắc Phục</h4>
                        <div className="highlight-list">
                            <div className="h-item">
                                <div className="h-icon">⚠️</div>
                                <div className="h-info">
                                    <strong>Lớp 10A3</strong>
                                    <span>Điểm thi đua giảm sâu do nề nếp</span>
                                </div>
                            </div>
                            <div className="h-item">
                                <div className="h-icon">📉</div>
                                <div className="h-info">
                                    <strong>Lớp 10A2</strong>
                                    <span>Xếp hạng thấp nhất khối 10</span>
                                </div>
                            </div>
                        </div>
                        <button className="btn-view-incidents" onClick={() => navigate('/vp-discipline/discipline')}>
                            Xem chi tiết sai phạm <FiArrowRight />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
