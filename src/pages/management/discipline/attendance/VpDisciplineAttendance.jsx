import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader, WeekPicker, StatusBadge, Pagination } from "../../../../components/common";
import DisciplineHeaderActions from "../components/DisciplineHeaderActions";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import Select from "../../../../components/ui/Select/Select";
import {
  FiClock,
  FiDownload,
  FiSearch,
  FiCalendar,
  FiTrendingUp,
  FiLayers,
  FiActivity,
} from "react-icons/fi";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import BonusPointModal from "../components/BonusPointModal";
import "./VpDisciplineAttendance.css";

const ATTENDANCE_RECORDS = [
  { id: 1, studentName: "Nguyễn Văn A", className: "10A1", week: 12, dayOfWeek: 2, reason: "Sốt xuất huyết", type: "excused", points: -1, history: [ { date: "15/10/2026", type: "excused", reason: "Sốt xuất huyết" } ] },
  { id: 2, studentName: "Trần Thị B", className: "11A5", week: 12, dayOfWeek: 2, reason: "Không rõ lý do", type: "unexcused", points: -5, history: [ { date: "15/10/2026", type: "unexcused", reason: "Không rõ lý do" } ] },
  { id: 3, studentName: "Lê C", className: "12A2", week: 12, dayOfWeek: 3, reason: "Việc gia đình", type: "excused", points: -1, history: [{ date: "16/10/2026", type: "excused", reason: "Việc gia đình" }] },
  { id: 4, studentName: "Hoàng D", className: "11A5", week: 12, dayOfWeek: 2, reason: "Ngủ quên", type: "unexcused", points: -5, history: [ { date: "15/10/2026", type: "unexcused", reason: "Ngủ quên" } ] },
  { id: 92, studentName: "Phạm F", className: "12A1", week: 12, dayOfWeek: 4, reason: "Đến muộn tiết 2", type: "late", points: -2, history: [{ date: "17/10/2026", type: "late", reason: "Đến muộn tiết 2" }] },
  { id: 93, studentName: "Đỗ G", className: "12A1", week: 12, dayOfWeek: 5, reason: "Trèo tường bỏ tiết 4", type: "skipping", points: -10, history: [{ date: "18/10/2026", type: "skipping", reason: "Trèo tường bỏ tiết 4" }] },
  { id: 94, studentName: "Ngô H", className: "10A1", week: 12, dayOfWeek: 2, reason: "Bỏ giờ sinh hoạt", type: "skipping", points: -10, history: [{ date: "15/10/2026", type: "skipping", reason: "Bỏ giờ sinh hoạt" }] },
  { id: 95, studentName: "Lớp 12A1", className: "12A1", week: 12, dayOfWeek: 0, reason: "Thành tích chuyên cần xuất sắc", type: "bonus", points: 10, history: [] },
  { id: 96, studentName: "Bùi J", className: "11A5", week: 12, dayOfWeek: 3, reason: "Vắng mặt không báo trước", type: "unexcused", points: -5, history: [{ date: "16/10/2026", type: "unexcused", reason: "Vắng mặt không báo trước" }] },
  { id: 97, studentName: "Phan K", className: "10A2", week: 12, dayOfWeek: 4, reason: "Đi học đúng giờ nhiều ngày", type: "bonus", points: 5, history: [{ date: "17/10/2026", type: "bonus", reason: "Đi học đúng giờ nhiều ngày" }] },
  { id: 98, studentName: "Võ L", className: "12C3", week: 12, dayOfWeek: 6, reason: "Đến muộn tiết 1", type: "late", points: -2, history: [{ date: "19/10/2026", type: "late", reason: "Đến muộn tiết 1" }] },
  { id: 99, studentName: "Đặng M", className: "11B1", week: 12, dayOfWeek: 7, reason: "Bỏ tiết tự học", type: "skipping", points: -10, history: [{ date: "20/10/2026", type: "skipping", reason: "Bỏ tiết tự học" }] },
];

const DAYS = [
    { id: 2, label: "Thứ 2" },
    { id: 3, label: "Thứ 3" },
    { id: 4, label: "Thứ 4" },
    { id: 5, label: "Thứ 5" },
    { id: 6, label: "Thứ 6" },
    { id: 7, label: "Thứ 7" },
];

export default function VpDisciplineAttendance({ isEmbedded = false }) {
  const [searchParams] = useSearchParams();
  const urlClass = searchParams.get("class");
  // Force update for 1-row layout refresh


  const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();

  const [records, setRecords] = useState(ATTENDANCE_RECORDS);
  const [selectedWeek, setSelectedWeek] = useState(12);
  const [selectedDay, setSelectedDay] = useState(2); // Monday by default
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedClass, setSelectedClass] = useState(urlClass || "all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sync with URL
  useEffect(() => {
    if (urlClass) {
        setSelectedClass(urlClass);
        const grade = urlClass.slice(0, 2);
        if (["10", "11", "12"].includes(grade)) setSelectedGrade(grade);
    }
  }, [urlClass]);

  const classOptions = useMemo(() => {
    const classes = Array.from(new Set(records.map((item) => item.className))).sort();
    return classes.map(c => ({ value: c, label: c }));
  }, [records]);

  // Weekly Context for KPI calculations (Grade & Class still apply)
  const weeklyRecords = useMemo(() => {
    return records.filter((item) => {
      const matchesWeek = item.week === selectedWeek;
      const matchesGrade = selectedGrade === "all" || item.className.startsWith(selectedGrade);
      const matchesClass = selectedClass === "all" || item.className === selectedClass;
      return matchesWeek && matchesGrade && matchesClass;
    });
  }, [records, selectedWeek, selectedGrade, selectedClass]);

  // Dynamic stats derived from weekly context
  const dynamicStats = useMemo(() => {
    const pointsSum = weeklyRecords.reduce((acc, r) => acc + (r.points || 0), 0);
    return {
      excused: weeklyRecords.filter(r => r.type === 'excused').length,
      unexcused: weeklyRecords.filter(r => r.type === 'unexcused').length,
      late: weeklyRecords.filter(r => r.type === 'late').length,
      skipping: weeklyRecords.filter(r => r.type === 'skipping').length,
      totalPoints: pointsSum
    };
  }, [weeklyRecords]);

  // Table Data: Weekly records filtered by the selected DAY + Status + Search
  const filteredRecords = useMemo(() => {
    return weeklyRecords.filter((item) => {
      const matchesDay = selectedDay === "all" || item.dayOfWeek === selectedDay || item.dayOfWeek === 0; // 0 for weekly bonuses
      const matchesType = typeFilter === "all" || item.type === typeFilter;
      const matchesSearch = [item.studentName, item.className, item.reason].join(" ").toLowerCase().includes(searchTerm.toLowerCase());
      return matchesDay && matchesType && matchesSearch;
    });
  }, [weeklyRecords, selectedDay, typeFilter, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / itemsPerPage));

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedWeek, selectedDay, selectedGrade, selectedClass, typeFilter, searchTerm]);

  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRecords, currentPage]);

  const handleAddBonus = () => {
    setIsBonusModalOpen(true);
  };

  const handleBonusSuccess = (rewardData) => {
    if (rewardData.targetType === "collective") {
        setRecords(prev => [rewardData, ...prev]);
    }
  };

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(filteredRecords);
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, `Attendance_Week_${selectedWeek}.xlsx`);
    toast.success("Đã xuất báo cáo chuyên cần tuần.");
  };

  return (
    <div className="vp-attendance vp-discipline-layout">
      {!isEmbedded && (
          <PageHeader
              title="Quản Lý Chuyên Cần"
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

      {/* Integrated Over-Toolbar */}
      <div className="dm-toolbar-integrated">
          <div className="dm-filters-complex">
             <div className="filter-group">
                <label><FiCalendar /> Tuần</label>
                <WeekPicker value={selectedWeek} onChange={setSelectedWeek} />
             </div>
             <div className="filter-group">
                <label><FiClock /> Thứ</label>
                <Select 
                    variant="custom" 
                    value={selectedDay} 
                    onChange={e => setSelectedDay(e.target.value === 'all' ? 'all' : parseInt(e.target.value))} 
                    options={[
                        { value: 'all', label: 'Cả tuần' },
                        ...DAYS.map(d => ({ value: d.id, label: d.label }))
                    ]} 
                />
             </div>
             <div className="filter-group">
                <label><FiLayers /> Khối</label>
                <Select variant="custom" value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)} options={[{value:'all', label:'Tất cả'}, {value:'10', label:'Khối 10'}, {value:'11', label:'Khối 11'}, {value:'12', label:'Khối 12'}]} />
             </div>
             <div className="filter-group">
                <label><FiLayers /> Lớp</label>
                <Select variant="custom" value={selectedClass} onChange={e => setSelectedClass(e.target.value)} options={[{value:'all', label:'Tất cả'}, ...classOptions]} />
             </div>
             <div className="filter-group">
                <label><FiActivity /> Trạng thái</label>
                <Select variant="custom" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} options={[{value:'all', label:'Tất cả'}, {value:'unexcused', label:'Không phép'}, {value:'excused', label:'Có phép'}, {value:'late', label:'Đi muộn'}, {value:'skipping', label:'Trốn học / Bỏ tiết'}]} />
             </div>
          </div>
          <div className="dm-primary-actions-compact">
             <button className="btn-add-bonus" onClick={handleAddBonus}><FiTrendingUp /> Cộng điểm thưởng</button>
             <button className="btn-export-reports" onClick={exportExcel}><FiDownload /> Xuất báo cáo</button>
          </div>
      </div>

      <div className="att-stats-grid">
        <div className="att-stat-card">
          <div className="stat-card-content">
            <span className="stat-label">Vắng có phép</span>
            <span className="stat-value">{dynamicStats.excused}</span>
            <span className="stat-sub">Tuần {selectedWeek}</span>
          </div>
        </div>
        <div className="att-stat-card">
          <div className="stat-card-content">
            <span className="stat-label">Vắng không phép</span>
            <span className="stat-value danger">{dynamicStats.unexcused}</span>
            <span className="stat-sub">Trừ điểm nặng</span>
          </div>
        </div>
        <div className="att-stat-card">
          <div className="stat-card-content">
            <span className="stat-label">Đi muộn</span>
            <span className="stat-value warning">{dynamicStats.late}</span>
            <span className="stat-sub">Vi phạm tiết đầu</span>
          </div>
        </div>
        <div className="att-stat-card">
          <div className="stat-card-content">
            <span className="stat-label">Trốn học / Bỏ tiết</span>
            <span className="stat-value danger">{dynamicStats.skipping}</span>
            <span className="stat-sub">Cần xử lý gấp</span>
          </div>
        </div>
        <div className="att-stat-card primary">
          <div className="stat-card-content">
            <span className="stat-label">Tổng điểm thi đua</span>
            <span className="stat-value">{dynamicStats.totalPoints > 0 ? `+${dynamicStats.totalPoints}` : dynamicStats.totalPoints}đ</span>
            <span className="stat-sub">
                {selectedDay === 'all' ? (
                    <span className="rank-badge-mini">Hạng 5 / 24 lớp</span>
                ) : (
                    "Toàn tuần"
                )}
            </span>
          </div>
        </div>
      </div>

      <div className="att-full-panel animate-fade-in">
        <div className="att-table-panel">
          <div className="panel-header">
            <h3>Danh sách giám sát chuyên cần</h3>
            <div className="panel-header-actions">
                <div className="search-box-pill">
                    <FiSearch />
                    <input placeholder="Tìm học sinh..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
            </div>
          </div>


          <table className="dm-table-premium">
            <thead>
              <tr>
                <th>Học sinh</th>
                <th className="th-center">Lớp</th>
                <th>Thứ / Ngày</th>
                <th>Trạng thái</th>
                <th className="th-center">Điểm</th>
                <th>Lý do</th>
              </tr>

            </thead>
            <tbody>
              {paginatedRecords.map(item => (
                <tr key={item.id}>
                  <td><strong>{item.studentName}</strong></td>
                  <td className="th-center"><span className="class-badge-v2">{item.className}</span></td>
                  <td>
                    <span className="td-day-badge">
                        {item.dayOfWeek === 0 ? "Tuần" : `Thứ ${item.dayOfWeek}`}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={item.type === 'excused' ? 'resolved' : (item.type === 'late' ? 'warning' : (item.type === 'bonus' ? 'success' : 'critical'))}>
                      {item.type === 'excused' ? 'Có phép' : (item.type === 'late' ? 'Đi muộn' : (item.type === 'skipping' ? 'Trốn học' : (item.type === 'bonus' ? 'Điểm thưởng' : 'Không phép')))}
                    </StatusBadge>
                  </td>
                  <td className="th-center">
                    <span className={`points-indicator ${item.points >= 0 ? 'plus' : 'minus'}`}>
                        {item.points >= 0 ? `+${item.points}` : item.points}
                    </span>
                  </td>
                  <td className="td-reason">{item.reason}</td>
                </tr>

              ))}
            </tbody>
          </table>

          <div className="dm-footer-pagination">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </div>
      </div>

      <BonusPointModal 
        isOpen={isBonusModalOpen} 
        onClose={() => setIsBonusModalOpen(false)}
        onSuccess={handleBonusSuccess}
        initialClass={selectedClass === "all" ? "" : selectedClass}
      />
    </div>
  );
}
