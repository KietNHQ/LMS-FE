import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader, WeekPicker, Pagination } from "../../../../components/common";
import DisciplineHeaderActions from "../components/DisciplineHeaderActions";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import Select from "../../../../components/ui/Select/Select";
import { 
    FiAward, FiArrowUp, FiArrowDown, FiMinus, FiTrendingUp, FiTrendingDown, 
    FiDownload, FiLayers, FiCalendar, FiStar, FiAlertCircle, FiActivity, FiArrowRight,
    FiUserCheck, FiSearch
} from "react-icons/fi";
import { Trophy, Medal, Rocket, TrendingDown } from "lucide-react";
import "./VpDisciplineCompetition.css";

export default function VpDisciplineCompetition({ isEmbedded = false, onClassClick }) {
    const navigate = useNavigate();
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [selectedWeek, setSelectedWeek] = useState(12);
    const [selectedGrade, setSelectedGrade] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [conductFilter, setConductFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 6;

    const rankingData = [
        { rank: 1, class: "12A1", homeroom: "Nguyễn Vĩ C", points: 98.5, trend: "up", change: 2, attendance: "99.2%", conduct: "Tốt" },
        { rank: 2, class: "10A1", homeroom: "Trần Mai Anh", points: 96.0, trend: "flat", change: 0, attendance: "98.5%", conduct: "Tốt" },
        { rank: 3, class: "11A2", homeroom: "Lê Minh H", points: 92.5, trend: "up", change: 1, attendance: "97.8%", conduct: "Khá" },
        { rank: 4, class: "10A2", homeroom: "Phạm Bình Minh", points: 89.0, trend: "down", change: 1, attendance: "95.0%", conduct: "Khá" },
        { rank: 5, class: "12C2", homeroom: "Lê I", points: 85.0, trend: "up", change: 3, attendance: "96.5%", conduct: "Tốt" },
        { rank: 6, class: "11B1", homeroom: "Vũ K", points: 82.0, trend: "down", change: 2, attendance: "94.0%", conduct: "Khá" },
        { rank: 7, class: "11C1", homeroom: "Ngô Thùy D", points: 79.5, trend: "up", change: 1, attendance: "93.2%", conduct: "Khá" },
        { rank: 35, class: "10A3", homeroom: "Trịnh Thùy L", points: -15.0, trend: "down", change: 5, attendance: "82.0%", conduct: "Trung bình" },
    ];

    const statsCards = [
        { title: "Điểm Thi Đua TB", val: "84.2", sub: "Điểm toàn trường", icon: <FiStar />, color: "success" },
        { title: "Lớp Dẫn Đầu", val: "12A1", sub: "98.5đ - Hạng 1", icon: <FiAward />, color: "primary" },
        { title: "Tỷ lệ Chuyên cần", val: "97.2%", sub: "Bình quân tuần này", icon: <FiActivity />, color: "info" },
        { title: "Hạnh Kiểm Tốt", val: "92%", sub: "Tỷ lệ Tốt / Khá", icon: <FiUserCheck />, color: "success" },
    ];

    const filteredRanking = useMemo(() => {
        return rankingData.filter(item => {
            const matchesGrade = selectedGrade === "all" || item.class.startsWith(selectedGrade);
            const matchesSearch = item.class.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesConduct = conductFilter === "all" || item.conduct === conductFilter;
            return matchesGrade && matchesSearch && matchesConduct;
        });
    }, [rankingData, selectedGrade, searchTerm, conductFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedWeek, selectedGrade, searchTerm, conductFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredRanking.length / ITEMS_PER_PAGE));

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const commendationClasses = useMemo(() => {
        const topByGrade = {};
        rankingData.forEach(item => {
            const grade = item.class.slice(0, 2);
            if (!topByGrade[grade] || item.rank < topByGrade[grade].rank) {
                topByGrade[grade] = item;
            }
        });
        return Object.values(topByGrade).sort((a, b) => a.class.localeCompare(b.class));
    }, [rankingData]);

    const improvementClasses = useMemo(() => {
        return rankingData
            .filter(item => item.trend === "down")
            .sort((a, b) => a.points - b.points)
            .slice(0, 3);
    }, [rankingData]);

    const paginatedRanking = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredRanking.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredRanking, currentPage]);

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
                    <div className="filter-group">
                        <label><FiUserCheck /> Hạnh Kiểm</label>
                        <Select 
                            variant="custom"
                            value={conductFilter}
                            onChange={(e) => setConductFilter(e.target.value)}
                            options={[
                                { value: "all", label: "Tất cả" },
                                { value: "Tốt", label: "Tốt" },
                                { value: "Khá", label: "Khá" },
                                { value: "Trung bình", label: "Trung bình" }
                            ]}
                        />
                    </div>
                    <div className="filter-group" style={{minWidth: '220px'}}>
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
                                    <th>Thi Đua</th>
                                    <th>Chuyên Cần</th>
                                    <th>Hạnh Kiểm (Dự kiến)</th>
                                    <th>Xu Hướng</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedRanking.map(item => (
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
                                        <td className="td-points">
                                            <strong className="points-accent">{item.points}đ</strong>
                                        </td>
                                        <td>
                                            <div className="attendance-mini-bar">
                                                <div className="bar-fill" style={{width: item.attendance}}></div>
                                                <span>{item.attendance}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`conduct-badge ${item.conduct === 'Tốt' ? 'success' : 'warning'}`}>
                                                {item.conduct}
                                            </span>
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

                    <div className="comp-pagination-row">
                        <Pagination
                            currentPage={currentPage}
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
                            {commendationClasses.map(cls => (
                                <div key={cls.class} className="h-item" onClick={() => handleClassClick(cls.class)}>
                                    <div className="h-icon">
                                        <Trophy size={20} className="icon-gold" />
                                    </div>
                                    <div className="h-info">
                                        <strong>Lớp {cls.class}</strong>
                                        <span>Dẫn đầu Khối {cls.class.slice(0, 2)} - {cls.points}đ</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="highlight-card danger mt-lg">
                        <h4><FiTrendingDown /> Cần Khắc Phục</h4>
                        <div className="highlight-list">
                            {improvementClasses.map(cls => (
                                <div key={cls.class} className="h-item" onClick={() => handleClassClick(cls.class)}>
                                    <div className="h-icon"><TrendingDown size={20} className="icon-danger" /></div>
                                    <div className="h-info">
                                        <strong>Lớp {cls.class}</strong>
                                        <span>Xu hướng giảm {cls.change} bậc - {cls.points}đ</span>
                                    </div>
                                </div>
                            ))}
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
