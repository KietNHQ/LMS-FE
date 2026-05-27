import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader, WeekPicker, StatusBadge, Pagination, LoadingSpinner } from "../../../../components/common";
import DisciplineHeaderActions from "../components/DisciplineHeaderActions";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import axiosClient from "../../../../services/shared/http/axiosClient";
import Select from "../../../../components/ui/Select/Select";
import { useQuery } from "@tanstack/react-query";
import { vpDisciplineService } from "../../../../services/pages/management/vp-discipline";
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
  const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();

  const [selectedWeek, setSelectedWeek] = useState(12);
  const [selectedDay, setSelectedDay] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedClass, setSelectedClass] = useState(urlClass || "all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch grade levels from API
  const { data: gradeLevelsData = [] } = useQuery({
      queryKey: ["grade-levels-attendance"],
      queryFn: async () => {
          const res = await vpDisciplineService.getGradeLevels();
          return res?.data || [];
      },
      staleTime: 10 * 60_000,
  });

  // Build grade options from API
  const gradeOptions = useMemo(() => {
      const defaultOption = [{ value: "all", label: "Tất cả" }];
      if (!gradeLevelsData.length) {
          return [
              { value: "all", label: "Tất cả" },
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

  // Fetch attendance records from API
  const [allRecords, setAllRecords] = useState([]);
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (urlClass) {
        setSelectedClass(urlClass);
        const grade = urlClass.slice(0, 2);
        if (["10", "11", "12"].includes(grade)) setSelectedGrade(grade);
    }
  }, [urlClass]);

  // Fetch attendance data from API
  useEffect(() => {
    const fetchAttendanceData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let statsRes;
        if (selectedClass === "all") {
          statsRes = await axiosClient.get("/attendance/stats", {
            params: { semesterId: selectedTerm },
          });
        } else {
          statsRes = await axiosClient.get(`/attendance/class/${selectedClass}/stats`, {
            params: { semesterId: selectedTerm },
          });
        }

        const statsData = statsRes?.data?.data || statsRes?.data || statsRes || {};
        const details = statsData.details || [];

        const transformedRecords = details.map((student, idx) => ({
          id: student.enrollment_id || idx + 1,
          studentName: student.student_name || student.studentName || "Unknown",
          className: student.class_name || student.className || selectedClass,
          week: selectedWeek,
          dayOfWeek: selectedDay,
          reason: student.whole_day_status || student.status || "",
          type: mapAttendanceStatus(student.whole_day_status || student.status),
          points: calculatePoints(student.whole_day_status || student.status),
          history: [],
        }));

        setAllRecords(transformedRecords);
        setRecords(transformedRecords);
      } catch (err) {
        console.error("Failed to fetch attendance:", err);
        setError(err.message || "Không thể tải dữ liệu điểm danh");
        setRecords([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendanceData();
  }, [selectedClass, selectedTerm, selectedWeek]);

  const mapAttendanceStatus = (status) => {
    const statusMap = {
      present: "bonus",
      absent: "unexcused",
      late: "late",
      excused: "excused",
      permit: "excused",
    };
    return statusMap[status] || "unexcused";
  };

  const calculatePoints = (status) => {
    const pointMap = {
      present: 0,
      absent: -5,
      late: -2,
      excused: -1,
      permit: 0,
    };
    return pointMap[status] || 0;
  };

  const classOptions = useMemo(() => {
    const classes = Array.from(new Set(allRecords.map((item) => item.className))).sort();
    return classes.map(c => ({ value: c, label: c }));
  }, [allRecords]);

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
      const dayStr = String(item.dayOfWeek);
      const matchesDay = selectedDay === "all" || dayStr === selectedDay || dayStr === "0"; // 0 for weekly bonuses
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
                    onChange={e => setSelectedDay(e.target.value)} 
                    options={[
                        { value: 'all', label: 'Cả tuần' },
                        ...DAYS.map(d => ({ value: String(d.id), label: d.label }))
                    ]} 
                />
             </div>
             <div className="filter-group">
                <label><FiLayers /> Khối</label>
                <Select variant="custom" value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)} options={gradeOptions} />
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
        {isLoading ? (
          <>
            <div className="att-stat-card skeleton">
              <div className="stat-card-content">
                <LoadingSpinner size="sm" />
              </div>
            </div>
            <div className="att-stat-card skeleton">
              <div className="stat-card-content">
                <LoadingSpinner size="sm" />
              </div>
            </div>
            <div className="att-stat-card skeleton">
              <div className="stat-card-content">
                <LoadingSpinner size="sm" />
              </div>
            </div>
            <div className="att-stat-card skeleton">
              <div className="stat-card-content">
                <LoadingSpinner size="sm" />
              </div>
            </div>
            <div className="att-stat-card primary skeleton">
              <div className="stat-card-content">
                <LoadingSpinner size="sm" />
              </div>
            </div>
          </>
        ) : error ? (
          <div className="att-error-banner">
            <span>{error}</span>
          </div>
        ) : selectedClass === "all" ? (
          <div className="att-empty-state">
            <FiActivity />
            <span>Vui lòng chọn lớp để xem dữ liệu chuyên cần</span>
          </div>
        ) : (
          <>
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
                        <span className="rank-badge-mini">{records.length} học sinh</span>
                    ) : (
                        "Toàn tuần"
                    )}
                </span>
              </div>
            </div>
          </>
        )}
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

