import { useMemo, useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  formatDateForDisplay,
  getSchoolYearForDate,
  getTermForDate,
  getWeekDateRange,
  getWeekForDate,
} from "../../../../utils/competitionUtils";
import { PageHeader, WeekPicker, StatusBadge, Pagination, LoadingSpinner } from "../../../../components/common";
import DisciplineHeaderActions from "../components/DisciplineHeaderActions";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import axiosClient from "../../../../services/shared/http/axiosClient";
import Select from "../../../../components/ui/Select/Select";
import { useQuery } from "@tanstack/react-query";
import { vpDisciplineService } from "../../../../services/pages/management/vp-discipline";
import { resolveSchoolYearId } from "../../../../services/shared/schoolYearLookup";
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

const TOTAL_ATTENDANCE_WEEKS = 35;

const getSchoolYearDateRange = (schoolYear) => {
  const [startRaw, endRaw] = `${schoolYear || ""}`.split("-");
  const startYear = Number(startRaw);
  const endYear = Number(endRaw);

  if (!Number.isFinite(startYear) || !Number.isFinite(endYear)) {
    return {};
  }

  return {
    startDate: `${startYear}-08-01`,
    endDate: `${endYear}-07-31`,
  };
};

const toDateInputValue = (value) => {
  if (!value) return "";
  if (typeof value === "string") {
    const matched = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (matched) return matched[1];
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function VpDisciplineAttendance({ isEmbedded = false }) {
  const [searchParams] = useSearchParams();
  const urlClass = searchParams.get("class");
  const urlClassName = searchParams.get("className");
  const urlWeek = searchParams.get("week");
  const urlStartDate = searchParams.get("startDate");
  const urlEndDate = searchParams.get("endDate");
  const urlDate = searchParams.get("date");
  const urlSchoolYear = searchParams.get("schoolYear");
  const urlTerm = searchParams.get("term");
  const {
    selectedSchoolYear,
    selectedTerm,
    handleYearArrow,
    handleTermChange,
    setSelectedSchoolYear,
  } = useSchoolYearTerm();

  const [viewMode, setViewMode] = useState("weekly");
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDay, setSelectedDay] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedClass, setSelectedClass] = useState(urlClass || "all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateJumpRange, setDateJumpRange] = useState(null);
  const autoJumpKeyRef = useRef("");
  const appliedUrlPeriodRef = useRef("");
  const itemsPerPage = 10;
  const selectedTermKey =
    typeof selectedTerm === "string"
      ? selectedTerm
      : selectedTerm?.key || selectedTerm?.id || "";

  const dateRange = useMemo(() => {
    if (dateJumpRange && viewMode === "weekly") {
      return dateJumpRange;
    }
    if (viewMode === "annual") {
      return getSchoolYearDateRange(selectedSchoolYear);
    }
    return getWeekDateRange(selectedSchoolYear, selectedTerm, selectedWeek);
  }, [dateJumpRange, selectedSchoolYear, selectedTerm, selectedWeek, viewMode]);

  const weekRangeLabel = useMemo(() => {
    if (!dateRange.startDate || !dateRange.endDate) return "";
    return `${formatDateForDisplay(dateRange.startDate)} - ${formatDateForDisplay(dateRange.endDate)}`;
  }, [dateRange]);

  const activePeriodLabel = viewMode === "annual" ? "Cả năm" : `Tuần ${selectedWeek}`;

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

  const { data: classesData = [] } = useQuery({
    queryKey: ["classes-for-attendance", selectedSchoolYear, selectedGrade],
    queryFn: async () => {
      if (!selectedSchoolYear) return [];
      const schoolYearId = await resolveSchoolYearId(selectedSchoolYear);
      if (!schoolYearId) return [];
      const res = await vpDisciplineService.callByKey("get_classes", {
        params: {
          schoolYearId,
          gradeLevelId: selectedGrade === "all" ? undefined : parseInt(selectedGrade, 10),
        },
      });
      const payload = res?.data || res || [];
      return Array.isArray(payload) ? payload : payload?.data || [];
    },
    staleTime: 5 * 60_000,
  });

  const classDirectoryOptions = useMemo(() => {
    return classesData
      .map((c) => {
        const label = c.name || c.class_name || c.className || "";
        return {
          value: String(c.id),
          label,
          grade: String(c.grade_level || c.gradeLevel || label.slice(0, 2)),
        };
      })
      .filter((item) => item.value && item.label);
  }, [classesData]);

  const selectedClassLabel = useMemo(() => {
    if (selectedClass === "all") return "";
    return (
      classDirectoryOptions.find((item) => String(item.value) === String(selectedClass))?.label ||
      urlClassName ||
      selectedClass
    );
  }, [classDirectoryOptions, selectedClass, urlClassName]);

  // Fetch attendance records from API
  const [allRecords, setAllRecords] = useState([]);
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (urlClass) {
        const foundClass = classDirectoryOptions.find(
          (item) =>
            String(item.value) === String(urlClass) ||
            item.label === urlClass ||
            item.label === urlClassName,
        );

        if (foundClass) {
          setSelectedClass(foundClass.value);
          if (["10", "11", "12"].includes(foundClass.grade)) {
            setSelectedGrade(foundClass.grade);
          }
          return;
        }

        setSelectedClass(urlClass);
        const grade = (urlClassName || urlClass).slice(0, 2);
        if (["10", "11", "12"].includes(grade)) setSelectedGrade(grade);
    }
  }, [classDirectoryOptions, urlClass, urlClassName]);

  useEffect(() => {
    const urlPeriodKey = [
      urlClass || "",
      urlWeek || "",
      urlStartDate || "",
      urlEndDate || "",
      urlDate || "",
      urlSchoolYear || "",
      urlTerm || "",
    ].join("|");

    if (!urlWeek && !urlStartDate && !urlEndDate && !urlDate) {
      appliedUrlPeriodRef.current = "";
      return;
    }

    if (appliedUrlPeriodRef.current === urlPeriodKey) return;
    appliedUrlPeriodRef.current = urlPeriodKey;

    const weekNumber = Number(urlWeek);
    const nextSelectedDate = urlDate || urlStartDate || "";

    if (urlSchoolYear && urlSchoolYear !== selectedSchoolYear && setSelectedSchoolYear) {
      setSelectedSchoolYear(urlSchoolYear);
    }

    if (urlTerm && urlTerm !== selectedTermKey) {
      handleTermChange(urlTerm);
    }

    if (Number.isFinite(weekNumber) && weekNumber > 0) {
      setSelectedWeek(weekNumber);
    }

    if (nextSelectedDate) {
      setSelectedDate(nextSelectedDate);
    }

    if (urlStartDate && urlEndDate) {
      setDateJumpRange({
        startDate: urlStartDate,
        endDate: urlEndDate,
      });
    } else if (Number.isFinite(weekNumber) && weekNumber > 0) {
      setDateJumpRange(null);
    }

    setViewMode("weekly");
  }, [
    handleTermChange,
    selectedSchoolYear,
    selectedTermKey,
    setSelectedSchoolYear,
    urlClass,
    urlDate,
    urlEndDate,
    urlSchoolYear,
    urlStartDate,
    urlTerm,
    urlWeek,
  ]);

  useEffect(() => {
    const shouldAutoJump =
      urlClass &&
      selectedClass !== "all" &&
      !urlWeek &&
      !urlStartDate &&
      !urlEndDate &&
      !urlDate &&
      !selectedDate &&
      viewMode === "weekly" &&
      !dateJumpRange;

    if (!shouldAutoJump) return;

    const jumpKey = `${selectedClass}|${selectedSchoolYear}`;
    if (autoJumpKeyRef.current === jumpKey) return;

    const { startDate, endDate } = getSchoolYearDateRange(selectedSchoolYear);
    if (!startDate || !endDate) return;

    let cancelled = false;
    autoJumpKeyRef.current = jumpKey;

    const autoJumpToLatestViolation = async () => {
      try {
        const statsRes = await axiosClient.get(`/attendance/class/${selectedClass}/monitoring`, {
          params: { startDate, endDate },
        });
        if (cancelled) return;

	        const violations = statsRes?.data?.data || statsRes?.data || [];
	        const latestViolation = [...violations]
	          .filter((violation) => {
	            const hasDate = toDateInputValue(violation.date);
	            const hasDeduction = Number(violation.points || 0) < 0;
	            return hasDate && hasDeduction && violation.type !== "excused";
	          })
	          .sort((a, b) => {
            const bTime = new Date(`${toDateInputValue(b.date)}T00:00:00`).getTime();
            const aTime = new Date(`${toDateInputValue(a.date)}T00:00:00`).getTime();
            return bTime - aTime;
          })[0];

        const latestDate = toDateInputValue(latestViolation?.date);
        if (!latestDate) return;

        const targetSchoolYear = getSchoolYearForDate(latestDate);
        const targetTerm = getTermForDate(targetSchoolYear, latestDate);
        const targetWeek = getWeekForDate(
          targetSchoolYear,
          targetTerm,
          latestDate,
          TOTAL_ATTENDANCE_WEEKS,
        );

        if (!targetSchoolYear || !targetTerm || !targetWeek) return;

        if (targetSchoolYear !== selectedSchoolYear && setSelectedSchoolYear) {
          setSelectedSchoolYear(targetSchoolYear);
        }
        if (targetTerm !== selectedTermKey) {
          handleTermChange(targetTerm);
        }

        setSelectedDate(latestDate);
        setSelectedWeek(targetWeek.week);
        setDateJumpRange({
          startDate: targetWeek.startDate,
          endDate: targetWeek.endDate,
        });
      } catch (err) {
        console.warn("Failed to auto-jump to latest attendance violation:", err);
      }
    };

    autoJumpToLatestViolation();

    return () => {
      cancelled = true;
    };
  }, [
	    dateJumpRange,
	    handleTermChange,
	    selectedClass,
	    selectedDate,
	    selectedSchoolYear,
	    selectedTermKey,
    setSelectedSchoolYear,
    urlClass,
    urlDate,
    urlEndDate,
    urlStartDate,
    urlWeek,
    viewMode,
  ]);

  // Fetch attendance data from API
  useEffect(() => {
    const fetchAttendanceData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (selectedClass === "all") {
          // If no specific class is selected, clear data
          setAllRecords([]);
          setRecords([]);
          setIsLoading(false);
          return;
        }

        const { startDate, endDate } = dateRange;
        if (!startDate || !endDate) {
          setAllRecords([]);
          setRecords([]);
          setIsLoading(false);
          return;
        }

        const statsRes = await axiosClient.get(`/attendance/class/${selectedClass}/monitoring`, {
          params: {
            startDate,
            endDate
          },
        });

        const violations = statsRes?.data?.data || statsRes?.data || [];

        const transformedRecords = violations.map((violation) => {
          const vDate = new Date(violation.date);
          const dayOfWeek = vDate.getDay() === 0 ? 8 : vDate.getDay() + 1; // 2=Thứ 2, ..., 8=CN
          return {
            id: violation.id,
            studentName: violation.studentName || "Unknown",
            studentCode: violation.studentCode,
            className: violation.className || selectedClass,
            date: violation.date,
            dateLabel: formatDateForDisplay(violation.date),
            week: selectedWeek,
            dayOfWeek: dayOfWeek.toString(), // string format to match selectedDay
            reason: violation.reason || "",
            type: violation.type, // 'excused', 'unexcused', 'late', 'skipping'
            points: -Math.abs(violation.points || 0),
            history: [],
          };
        });

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
  }, [selectedClass, selectedWeek, dateRange]);

  const handleDateJump = (value) => {
    setSelectedDate(value);
    if (!value) return;

    const targetSchoolYear = getSchoolYearForDate(value);
    const targetTerm = getTermForDate(targetSchoolYear, value);
    const targetWeek = getWeekForDate(
      targetSchoolYear,
      targetTerm,
      value,
      TOTAL_ATTENDANCE_WEEKS,
    );

    if (!targetSchoolYear || !targetTerm || !targetWeek) {
      toast.warning("Ngày này không nằm trong lịch tuần chuyên cần.");
      return;
    }

    if (targetSchoolYear !== selectedSchoolYear) {
      if (setSelectedSchoolYear) {
        setSelectedSchoolYear(targetSchoolYear);
      } else {
        toast.info(`Ngày đã chọn thuộc năm học ${targetSchoolYear}.`);
      }
    }

    if (targetTerm !== selectedTermKey) {
      handleTermChange(targetTerm);
    }

    setViewMode("weekly");
    setSelectedWeek(targetWeek.week);
    setDateJumpRange({
      startDate: targetWeek.startDate,
      endDate: targetWeek.endDate,
    });
    toast.success(`Đã chuyển đến tuần ${targetWeek.week} (${formatDateForDisplay(targetWeek.startDate)} - ${formatDateForDisplay(targetWeek.endDate)}).`);
  };

  const recordClassOptions = useMemo(() => {
    const classes = new Set(allRecords.map((item) => item.className));
    if (selectedClassLabel) {
      classes.add(selectedClassLabel);
    }
    const sortedClasses = Array.from(classes).sort();
    return sortedClasses.map(c => ({ value: c, label: c }));
  }, [allRecords, selectedClassLabel]);

  // Fetch attendance data from API
  useEffect(() => {
    const fetchAttendanceData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (selectedClass === "all") {
          // If no specific class is selected, clear data
          setAllRecords([]);
          setRecords([]);
          setIsLoading(false);
          return;
        }

        const { startDate, endDate } = getWeekDateRange(selectedSchoolYear, selectedTerm, selectedWeek);

        const statsRes = await axiosClient.get(`/attendance/class/${selectedClass}/monitoring`, {
          params: {
            startDate,
            endDate
          },
        });

        const violations = statsRes?.data?.data || statsRes?.data || [];

        const transformedRecords = violations.map((violation) => {
          const vDate = new Date(violation.date);
          const dayOfWeek = vDate.getDay() === 0 ? 8 : vDate.getDay() + 1; // 2=Thứ 2, ..., 8=CN
          return {
            id: violation.id,
            studentName: violation.studentName || "Unknown",
            className: selectedClass,
            week: selectedWeek,
            dayOfWeek: dayOfWeek.toString(), // string format to match selectedDay
            reason: violation.reason || "",
            type: violation.type, // 'excused', 'unexcused', 'late', 'skipping'
            points: -Math.abs(violation.points || 0),
            history: [],
          };
        });

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
  }, [selectedClass, selectedTerm, selectedWeek, selectedSchoolYear]);

  const mapViolationToType = (violationName) => {
    const name = violationName?.toLowerCase() || "";
    if (name.includes("muộn")) return "late";
    if (name.includes("không phép") || name.includes("vắng mặt")) return "unexcused";
    if (name.includes("trốn")) return "skipping";
    return "unexcused";
  };

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
    const directoryOptions = selectedGrade === "all"
      ? classDirectoryOptions
      : classDirectoryOptions.filter((item) => item.grade === selectedGrade);

    if (directoryOptions.length > 0) {
      return directoryOptions;
    }

    return recordClassOptions;
  }, [classDirectoryOptions, recordClassOptions, selectedGrade]);

  // Weekly Context for KPI calculations (Grade & Class still apply)
  const weeklyRecords = useMemo(() => {
    return records.filter((item) => {
      const matchesWeek = viewMode === "annual" || item.week === selectedWeek;
      const matchesGrade = selectedGrade === "all" || item.className.startsWith(selectedGrade);
      const matchesClass =
        selectedClass === "all" ||
        item.className === selectedClass ||
        item.className === selectedClassLabel;
      return matchesWeek && matchesGrade && matchesClass;
    });
  }, [records, selectedWeek, selectedGrade, selectedClass, selectedClassLabel, viewMode]);

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
  }, [selectedWeek, selectedDay, selectedGrade, selectedClass, typeFilter, searchTerm, viewMode]);

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
    XLSX.writeFile(wb, `Attendance_${viewMode === "annual" ? selectedSchoolYear : `Week_${selectedWeek}`}.xlsx`);
    toast.success(`Đã xuất báo cáo chuyên cần ${viewMode === "annual" ? "cả năm" : "tuần"}.`);
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
                <WeekPicker
                  value={selectedWeek}
                  onChange={(week) => {
                    setDateJumpRange(null);
                    setViewMode("weekly");
                    setSelectedWeek(week);
                  }}
                  totalWeeks={TOTAL_ATTENDANCE_WEEKS}
                  rangeLabel={viewMode === "weekly" ? weekRangeLabel : undefined}
                />
             </div>
             <div className="filter-group att-date-jump-group">
                <label><FiCalendar /> Chọn ngày</label>
                <input
                  className="att-date-jump-input"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateJump(e.target.value)}
                />
             </div>
             <div className="filter-group att-view-mode-group">
                <label><FiLayers /> Chế độ xem</label>
                <div className="att-view-mode-toggle">
                  <button
                    type="button"
                    className={viewMode === "weekly" ? "active" : ""}
                    onClick={() => {
                      setDateJumpRange(null);
                      setViewMode("weekly");
                    }}
                  >
                    Tuần
                  </button>
                  <button
                    type="button"
                    className={viewMode === "annual" ? "active" : ""}
                    onClick={() => setViewMode("annual")}
                  >
                    Cả năm
                  </button>
                </div>
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
                <span className="stat-sub">{activePeriodLabel}</span>
              </div>
            </div>
            <div className="att-stat-card">
              <div className="stat-card-content">
                <span className="stat-label">Vắng không phép</span>
                <span className="stat-value danger">{dynamicStats.unexcused}</span>
                <span className="stat-sub">{activePeriodLabel}</span>
              </div>
            </div>
            <div className="att-stat-card">
              <div className="stat-card-content">
                <span className="stat-label">Đi muộn</span>
                <span className="stat-value warning">{dynamicStats.late}</span>
                <span className="stat-sub">{activePeriodLabel}</span>
              </div>
            </div>
            <div className="att-stat-card">
              <div className="stat-card-content">
                <span className="stat-label">Trốn học / Bỏ tiết</span>
                <span className="stat-value danger">{dynamicStats.skipping}</span>
                <span className="stat-sub">{activePeriodLabel}</span>
              </div>
            </div>
            <div className="att-stat-card primary">
              <div className="stat-card-content">
                <span className="stat-label">Tổng điểm thi đua</span>
                <span className="stat-value">{dynamicStats.totalPoints > 0 ? `+${dynamicStats.totalPoints}` : dynamicStats.totalPoints}đ</span>
                <span className="stat-sub">
                    {selectedDay === 'all' ? (
                        <span className="rank-badge-mini">{activePeriodLabel}</span>
                    ) : (
                        activePeriodLabel
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
	                    <div className="td-date-stack">
	                      <span className="td-day-badge">
	                          {String(item.dayOfWeek) === "0" ? "Tuần" : `Thứ ${item.dayOfWeek}`}
	                      </span>
	                      {item.dateLabel && <span className="td-date-text">{item.dateLabel}</span>}
	                    </div>
	                  </td>
                  <td>
                    <StatusBadge status={item.type === 'excused' ? 'success' : (item.type === 'late' ? 'warning' : (item.type === 'bonus' ? 'success' : 'critical'))}>
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
        initialClassName={selectedClassLabel}
        rewardDate={dateRange.startDate}
        selectedSchoolYear={selectedSchoolYear}
        selectedTerm={selectedTerm}
      />
    </div>
  );
}
