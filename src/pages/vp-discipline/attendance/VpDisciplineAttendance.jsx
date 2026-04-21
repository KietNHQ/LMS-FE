import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader, WeekPicker, StatusBadge } from "../../../components/common";
import DisciplineHeaderActions from "../components/DisciplineHeaderActions";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import Select from "../../../components/ui/Select/Select";
import {
  FiClock, FiAlertCircle, FiPieChart, FiDownload, FiSearch, FiSend, 
  FiCheckCircle, FiFileText, FiUser, FiCalendar, FiTrendingUp, FiTrendingDown
} from "react-icons/fi";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import "./VpDisciplineAttendance.css";

const ATTENDANCE_RECORDS = [
  { id: 1, studentName: "Nguyễn Văn A", className: "10A1", date: "2026-10-15", reason: "Sốt xuất huyết", type: "excused", lessonCount: 3, weekAbsences: 1, history: [ { date: "2026-10-15", type: "excused", reason: "Sốt xuất huyết" }, { date: "2026-09-21", type: "excused", reason: "Việc gia đình" } ] },
  { id: 2, studentName: "Trần Thị B", className: "11A5", date: "2026-10-15", reason: "Không rõ lý do", type: "unexcused", lessonCount: 5, weekAbsences: 3, history: [ { date: "2026-10-15", type: "unexcused", reason: "Không rõ lý do" }, { date: "2026-10-14", type: "unexcused", reason: "Không phản hồi" } ] },
  { id: 3, studentName: "Lê C", className: "12A2", date: "2026-10-15", reason: "Việc gia đình", type: "excused", lessonCount: 2, weekAbsences: 1, history: [{ date: "2026-10-15", type: "excused", reason: "Việc gia đình" }] },
  { id: 4, studentName: "Hoàng D", className: "11A5", date: "2026-10-15", reason: "Ngủ quên", type: "unexcused", lessonCount: 4, weekAbsences: 2, history: [ { date: "2026-10-15", type: "unexcused", reason: "Ngủ quên" } ] },
  { id: 92, studentName: "Phạm F", className: "12A1", date: "2026-10-15", reason: "Đến muộn tiết 2", type: "late", lessonCount: 1, weekAbsences: 0, history: [{ date: "2026-10-15", type: "late", reason: "Đến muộn tiết 2" }] },
];

const ATTENDANCE_TREND = [
  { date: "10/10", attendanceRate: 98.9, totalAbsences: 12 },
  { date: "11/10", attendanceRate: 98.7, totalAbsences: 15 },
  { date: "12/10", attendanceRate: 98.4, totalAbsences: 18 },
  { date: "13/10", attendanceRate: 98.8, totalAbsences: 11 },
  { date: "14/10", attendanceRate: 98.1, totalAbsences: 24 },
  { date: "15/10", attendanceRate: 98.5, totalAbsences: 16 },
];

const DEFAULT_DATE = "2026-10-15";

export default function VpDisciplineAttendance() {
  const [searchParams] = useSearchParams();
  const urlClass = searchParams.get("class");

  const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();

  const [records, setRecords] = useState(ATTENDANCE_RECORDS);
  const [selectedDate, setSelectedDate] = useState(DEFAULT_DATE);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedClass, setSelectedClass] = useState(urlClass || "all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedRecordId, setSelectedRecordId] = useState(null);

  // Sync with URL if changed
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

  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      const matchesDate = item.date === selectedDate;
      const matchesGrade = selectedGrade === "all" || item.className.startsWith(selectedGrade);
      const matchesClass = selectedClass === "all" || item.className === selectedClass;
      const matchesType = typeFilter === "all" || item.type === typeFilter;
      const matchesSearch = [item.studentName, item.className, item.reason].join(" ").toLowerCase().includes(searchTerm.toLowerCase());
      return matchesDate && matchesGrade && matchesClass && matchesType && matchesSearch;
    });
  }, [records, selectedDate, selectedGrade, selectedClass, typeFilter, searchTerm]);

  const overview = { totalPercent: 98.5, excused: 10, unexcused: 6, late: 12 };

  const handleQuickAction = (action, recordId) => {
    if (action === "mark-excused") {
      setRecords((prev) => prev.map((item) => (item.id === recordId ? { ...item, type: "excused", reason: "Đã xác minh có phép" } : item)));
      toast.success("Đã xác minh phép thành công.");
    }
  };

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(filteredRecords);
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, "Attendance_Report.xlsx");
    toast.success("Đã xuất báo cáo chuyên cần.");
  };

  return (
    <div className="vp-attendance vp-discipline-layout">
      <PageHeader
        title="Quản lý Chuyên cần"
        actions={
          <DisciplineHeaderActions
            selectedSchoolYear={selectedSchoolYear}
            selectedTerm={selectedTerm}
            onYearChange={handleYearArrow}
            onTermChange={handleTermChange}
          />
        }
      />

      <div className="att-stats-grid">
        <div className="att-stat-card primary">
          <div className="stat-card-icon"><FiPieChart /></div>
          <div className="stat-card-content">
            <span className="stat-label">Tỷ lệ hiện diện</span>
            <span className="stat-value">{overview.totalPercent}%</span>
            <span className="stat-sub">Toàn trường hôm nay</span>
          </div>
        </div>
        <div className="att-stat-card">
          <div className="stat-card-content">
            <span className="stat-label">Vắng có phép</span>
            <span className="stat-value">{overview.excused}</span>
            <span className="stat-sub">Đã gửi minh chứng</span>
          </div>
        </div>
        <div className="att-stat-card">
          <div className="stat-card-content">
            <span className="stat-label">Vắng không phép</span>
            <span className="stat-value danger">{overview.unexcused}</span>
            <span className="stat-sub">Cần xử lý ngay</span>
          </div>
        </div>
        <div className="att-stat-card">
          <div className="stat-card-content">
            <span className="stat-label">Đi muộn</span>
            <span className="stat-value warning">{overview.late}</span>
            <span className="stat-sub">Tiết 1 & 2</span>
          </div>
        </div>
      </div>

      <div className="dm-toolbar-integrated mb-lg">
        <div className="dm-toolbar-content">
          <div className="dm-filters-complex">
             <div className="filter-group">
                <label><FiCalendar /> Ngày</label>
                <input type="date" className="ihm-date-input" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
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
                <label><FiClock /> Trạng thái</label>
                <Select variant="custom" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} options={[{value:'all', label:'Tất cả'}, {value:'unexcused', label:'Không phép'}, {value:'excused', label:'Có phép'}, {value:'late', label:'Đi muộn'}]} />
             </div>
          </div>
          <div className="dm-primary-actions-compact">
             <button className="btn-export-reports" onClick={exportExcel}><FiDownload /> Xuất báo cáo</button>
          </div>
        </div>
      </div>

      <div className="att-main-content">
        <div className="att-table-panel">
          <div className="panel-header">
            <h3><FiSearch /> Danh sách Vắng mặt & Đi muộn</h3>
            <div className="search-box-pill">
                <FiSearch />
                <input placeholder="Tìm học sinh..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>

          <table className="dm-table-premium">
            <thead>
              <tr>
                <th>Học sinh</th>
                <th className="th-center">Lớp</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th>Lý do</th>
                <th className="th-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map(item => (
                <tr key={item.id}>
                  <td><strong>{item.studentName}</strong></td>
                  <td className="th-center"><span className="class-badge-v2">{item.className}</span></td>
                  <td><span className="td-time">{item.date}</span></td>
                  <td>
                    <StatusBadge status={item.type === 'excused' ? 'resolved' : (item.type === 'late' ? 'warning' : 'critical')}>
                      {item.type === 'excused' ? 'Có phép' : (item.type === 'late' ? 'Đi muộn' : 'Không phép')}
                    </StatusBadge>
                  </td>
                  <td className="td-reason">{item.reason}</td>
                  <td className="th-center">
                    <div className="att-row-actions">
                        <button className="att-btn-mini" onClick={() => handleQuickAction('mark-excused', item.id)} title="Xác minh phép"><FiCheckCircle /></button>
                        <button className="att-btn-mini" title="Nhắc nhở"><FiSend /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="att-side-trends">
           <div className="trend-card">
              <h4><FiTrendingUp /> Xu hướng Chuyên cần</h4>
              <div className="mini-chart-wrap">
                {ATTENDANCE_TREND.map(p => (
                    <div key={p.date} className="chart-bar-item">
                        <div className="bar" style={{height: `${(p.attendanceRate - 90) * 8}px`}}></div>
                        <span className="bar-date">{p.date}</span>
                    </div>
                ))}
              </div>
           </div>

           <div className="highlight-card danger mt-lg">
              <h4><FiTrendingDown /> Vắng nhiều nhất</h4>
              <div className="h-list">
                 <div className="h-item">
                    <strong>12A2</strong>
                    <span>8 lượt vắng không phép</span>
                 </div>
                 <div className="h-item">
                    <strong>10A3</strong>
                    <span>5 lượt vắng không phép</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
