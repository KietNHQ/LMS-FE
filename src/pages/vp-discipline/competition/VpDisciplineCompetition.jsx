import { useState } from "react";
import { PageHeader, WeekPicker } from "../../../components/common";
import DisciplineHeaderActions from "../components/DisciplineHeaderActions";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { FiAward, FiArrowUp, FiArrowDown, FiMinus, FiTrendingUp, FiTrendingDown, FiDownload } from "react-icons/fi";
import "./VpDisciplineCompetition.css";

export default function VpDisciplineCompetition() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [selectedWeek, setSelectedWeek] = useState(12); // mock tuần 12

    const rankingData = [
        { rank: 1, class: "12A1", homeroom: "Nguyễn Vĩ C", points: 98.5, trend: "up", change: 2 },
        { rank: 2, class: "10A1", homeroom: "Trần Mai Anh", points: 96.0, trend: "flat", change: 0 },
        { rank: 3, class: "11A2", homeroom: "Lê Minh H", points: 92.5, trend: "up", change: 1 },
        { rank: 4, class: "10A2", homeroom: "Phạm Bình Minh", points: 89.0, trend: "down", change: 1 },
        { rank: 35, class: "10A3", homeroom: "Trịnh Thùy L", points: -15.0, trend: "down", change: 5 }, // Bét bảng
    ];

    return (
        <div className="vp-competition">
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

            <div className="comp-toolbar">
                <div className="comp-filter">
                    <select className="comp-select">
                        <option value="all">Tất cả Khối</option>
                        <option value="10">Khối 10</option>
                        <option value="11">Khối 11</option>
                        <option value="12">Khối 12</option>
                    </select>

                    <WeekPicker 
                        value={selectedWeek} 
                        onChange={setSelectedWeek} 
                        totalWeeks={35}
                    />
                </div>
                <button className="btn-secondary" style={{padding: '0.625rem 1rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <FiDownload /> Xuất báo cáo Thi Đua
                </button>
            </div>

            <div className="comp-content">
                {/* ── Main Leaderboard ── */}
                <div className="comp-panel">
                    <h3 className="comp-panel-header"><FiAward /> Bảng Xếp Hạng Thi Đua Lớp</h3>
                    <div className="rank-table-wrap">
                        <table className="rank-table">
                            <thead>
                                <tr>
                                    <th>Hạng</th>
                                    <th>Lớp</th>
                                    <th>GV Chủ Nhiệm</th>
                                    <th>Tổng Điểm</th>
                                    <th>Xu hướng (so với kỳ trước)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rankingData.map(item => (
                                    <tr key={item.class}>
                                        <td>
                                            <div className={`rank-number ${item.rank <= 3 ? `top-${item.rank}` : ''}`}>
                                                {item.rank}
                                            </div>
                                        </td>
                                        <td><strong>{item.class}</strong></td>
                                        <td>{item.homeroom}</td>
                                        <td><strong>{item.points}</strong> đ</td>
                                        <td>
                                            {item.trend === 'up' && <span className="trend-up"><FiArrowUp /> Tăng {item.change} hạng</span>}
                                            {item.trend === 'down' && <span className="trend-down"><FiArrowDown /> Tụt {item.change} hạng</span>}
                                            {item.trend === 'flat' && <span className="trend-flat"><FiMinus /> Giữ nguyên</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Side Summary Panels ── */}
                <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                    <div className="comp-panel">
                        <h3 className="comp-panel-header" style={{fontSize: '1rem', color: '#16a34a'}}><FiTrendingUp /> Biểu dương (Tăng hạng)</h3>
                        <div className="summary-list">
                            <div className="summary-item good">
                                <div className="summary-info"><strong>Lớp 12A1</strong><span>Dẫn đầu toàn trường</span></div>
                                <div className="summary-points">98.5đ</div>
                            </div>
                            <div className="summary-item good">
                                <div className="summary-info"><strong>Lớp 11A2</strong><span>Có tiến bộ rõ rệt</span></div>
                                <div className="summary-points">92.5đ</div>
                            </div>
                        </div>
                    </div>

                    <div className="comp-panel">
                        <h3 className="comp-panel-header" style={{fontSize: '1rem', color: '#dc2626'}}><FiTrendingDown /> Cần Khắc phục (Đội sổ)</h3>
                        <div className="summary-list">
                            <div className="summary-item bad">
                                <div className="summary-info"><strong>Lớp 10A3</strong><span>Tụt 5 hạng trong tuần</span></div>
                                <div className="summary-points">-15.0đ</div>
                            </div>
                            <div className="summary-item bad">
                                <div className="summary-info"><strong>Lớp 10A2</strong><span>Vi phạm đồng phục nhiều</span></div>
                                <div className="summary-points">89.0đ</div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
