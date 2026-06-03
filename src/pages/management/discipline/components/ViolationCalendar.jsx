import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { FiChevronLeft, FiChevronRight, FiX, FiUser, FiAlertTriangle, FiClock, FiCheckCircle } from "react-icons/fi";
import { vpDisciplineService } from "../../../../services/pages/management/vp-discipline/vpDisciplineService";
import { resolveSemesterId } from "../../../../services/shared/schoolYearLookup";
import { getWeekDateObjects } from "../../../../components/common/WeekPicker/WeekPicker";
import StatusBadge from "../../../../components/common/StatusBadge/StatusBadge.jsx";
import "./ViolationCalendar.css";

const monthNames = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4",
  "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8",
  "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];
const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
const formatDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const formatDisplayDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const ViolationCalendar = ({
  selectedSchoolYear,
  selectedTerm,
  selectedGrade = "all",
  selectedClass = "all",
  selectedWeek,
}) => {
  const today = new Date();
  
  // Initialize currentDate based on selectedWeek if provided
  const initialDate = useMemo(() => {
    if (selectedWeek) {
        const { start } = getWeekDateObjects(selectedWeek);
        return new Date(start.getFullYear(), start.getMonth(), 1);
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  }, [selectedWeek]);

  const [currentDate, setCurrentDate] = useState(initialDate);
  
  // Sync when selectedWeek changes externally
  useEffect(() => {
      if (selectedWeek) {
          const { start } = getWeekDateObjects(selectedWeek);
          setCurrentDate(new Date(start.getFullYear(), start.getMonth(), 1));
      }
  }, [selectedWeek]);

  const [calendarView, setCalendarView] = useState("month"); // "month" | "week"
  const [selectedDayViolations, setSelectedDayViolations] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const { data: resolvedSemesterId } = useQuery({
    queryKey: ["semester-id-cal", selectedSchoolYear, selectedTerm],
    queryFn: () => resolveSemesterId(selectedSchoolYear, selectedTerm || "hk1"),
    enabled: Boolean(selectedSchoolYear),
    staleTime: 5 * 60 * 1000,
  });

  // Compute the start/end date range for the visible month
  const rangeStart = useMemo(() => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    return formatDate(d);
  }, [currentDate]);

  const rangeEnd = useMemo(() => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    return formatDate(d);
  }, [currentDate]);

  // Fetch violations for the visible month
  const { data: violations = [], isLoading: isLoadingViolations } = useQuery({
    queryKey: ["discipline-violations-cal", rangeStart, rangeEnd],
    queryFn: async () => {
      try {
        const res = await vpDisciplineService.callByKey("get_discipline_violations", {
          params: {
            startDate: rangeStart,
            endDate: rangeEnd,
            page: 1,
            limit: 500,
          },
        });
        const raw = res?.data || res?.data?.data || [];
        return raw.map((v) => ({
          id: v.id,
          student: v.student_name || "",
          class: v.class_name || "",
          grade: v.grade_name || "",
          type: v.violation_name || v.violation_type || "",
          level: v.violation_severity || v.severity || v.level || "low",
          date: v.date || "",
          reporter: v.verified_by_name || v.reporter || "",
          status: v.status || "pending",
          description: v.notes || "",
        }));
      } catch {
        return [];
      }
    },
    enabled: Boolean(rangeStart && rangeEnd),
    staleTime: 30_000,
  });

  // Filter violations by grade/class
  const filteredViolations = useMemo(() => {
    return violations.filter((v) => {
      const matchGrade = selectedGrade === "all" ||
        (v.grade || "").toLowerCase().includes(selectedGrade.toLowerCase()) ||
        selectedGrade.toLowerCase() === (v.grade || "").replace(/khối\s*/i, "").trim();
      const matchClass = selectedClass === "all" ||
        (v.class || "").toLowerCase().includes(selectedClass.toLowerCase());
      return matchGrade && matchClass;
    });
  }, [violations, selectedGrade, selectedClass]);

  // Group violations by date string (YYYY-MM-DD)
  const violationsByDate = useMemo(() => {
    const map = {};
    filteredViolations.forEach((v) => {
      if (!v.date) return;
      const d = new Date(v.date);
      if (isNaN(d.getTime())) return;
      const key = formatDate(d);
      if (!map[key]) map[key] = [];
      map[key].push(v);
    });
    return map;
  }, [filteredViolations]);

  // Build month grid
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthDays = [];
  for (let i = 0; i < firstDay; i++) monthDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) monthDays.push(i);

  // Build week grid from currentDate
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(today);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  }, []);

  const isToday = (day) => {
    if (!day) return false;
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const handleDayClick = (day) => {
    if (!day) return;
    const dateStr = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    const dayViolations = violationsByDate[dateStr] || [];
    setSelectedDayViolations({ date: dateStr, violations: dayViolations });
    setIsPanelOpen(true);
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    setSelectedDayViolations(null);
  };

  const getLevelLabel = (level) => {
    if (level === "high") return "Nghiêm trọng";
    if (level === "med") return "Vừa";
    return "Nhẹ";
  };

  const getStatusLabel = (status) => {
    if (status === "approved") return "Đã duyệt";
    if (status === "rejected") return "Từ chối";
    if (status === "processing") return "Đang xử lý";
    if (status === "resolved") return "Đã giải quyết";
    if (status === "closed") return "Đã đóng";
    return "Mới";
  };

  const getViolationDotColors = (dayViolations) => {
    const hasPending = dayViolations.some((v) => v.status === "pending" || v.status === "new");
    const hasApproved = dayViolations.some((v) => v.status === "approved");
    return { hasPending, hasApproved };
  };

  // Count total violations in visible month
  const monthTotal = filteredViolations.length;
  const pendingCount = filteredViolations.filter((v) => v.status === "pending" || v.status === "new").length;
  const approvedCount = filteredViolations.filter((v) => v.status === "approved").length;

  return (
    <div className="violation-calendar">
      {/* Header */}
      <div className="vc-header">
        <div className="vc-title">
          <h3>Lịch Vi Phạm</h3>
          <div className="vc-stats-pills">
            <span className="vc-stat-pill vc-stat-pill--total">
              {monthTotal} vi phạm
            </span>
            <span className="vc-stat-pill vc-stat-pill--pending">
              {pendingCount} chờ duyệt
            </span>
            <span className="vc-stat-pill vc-stat-pill--approved">
              {approvedCount} đã duyệt
            </span>
          </div>
        </div>
        <div className="vc-view-toggle">
          <button
            className={`vc-toggle-btn ${calendarView === "week" ? "active" : ""}`}
            onClick={() => setCalendarView("week")}
          >
            Tuần
          </button>
          <button
            className={`vc-toggle-btn ${calendarView === "month" ? "active" : ""}`}
            onClick={() => setCalendarView("month")}
          >
            Tháng
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="vc-nav">
        <button
          className="vc-btn-nav"
          onClick={() =>
            setCurrentDate(
              new Date(
                currentDate.getFullYear(),
                calendarView === "week"
                  ? currentDate.getMonth() - 1
                  : currentDate.getMonth() - 1,
                1
              )
            )
          }
        >
          <FiChevronLeft size={18} />
        </button>
        <div className="vc-month-year">
          {calendarView === "month"
            ? `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
            : `Tuần ${Math.ceil((today.getDate()) / 7)} - ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
        </div>
        <button
          className="vc-btn-nav"
          onClick={() =>
            setCurrentDate(
              new Date(
                currentDate.getFullYear(),
                calendarView === "week"
                  ? currentDate.getMonth() + 1
                  : currentDate.getMonth() + 1,
                1
              )
            )
          }
        >
          <FiChevronRight size={18} />
        </button>
      </div>

      {/* Legend */}
      <div className="vc-legend">
        <div className="vc-legend-item">
          <span className="vc-dot vc-dot--pending"></span>
          <span>Chờ duyệt</span>
        </div>
        <div className="vc-legend-item">
          <span className="vc-dot vc-dot--approved"></span>
          <span>Đã duyệt</span>
        </div>
      </div>

      {/* Month View */}
      {calendarView === "month" && (
        <div className="vc-grid-container">
          <div className="vc-weekdays">
            {dayNames.map((d) => (
              <div key={d} className="vc-weekday">{d}</div>
            ))}
          </div>
          <div className="vc-grid">
            {monthDays.map((day, idx) => {
              if (!day) {
                return <div key={`empty-${idx}`} className="vc-day vc-day--empty" />;
              }
              const dateStr = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
              const dayViolations = violationsByDate[dateStr] || [];
              const { hasPending, hasApproved } = getViolationDotColors(dayViolations);
              const hasViolations = dayViolations.length > 0;

              return (
                <div
                  key={day}
                  className={`vc-day ${isToday(day) ? "vc-day--today" : ""} ${hasViolations ? "vc-day--has-violations" : ""}`}
                  onClick={() => handleDayClick(day)}
                >
                  <div className="vc-day-number">{day}</div>
                  {hasViolations && (
                    <div className="vc-dots">
                      {hasPending && <span className="vc-dot vc-dot--pending" />}
                      {hasApproved && <span className="vc-dot vc-dot--approved" />}
                    </div>
                  )}
                  {dayViolations.length > 0 && (
                    <div className="vc-day-count">{dayViolations.length}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week View */}
      {calendarView === "week" && (
        <div className="vc-week-container">
          {weekDays.map((d) => {
            const dateStr = formatDate(d);
            const dayViolations = violationsByDate[dateStr] || [];
            const { hasPending, hasApproved } = getViolationDotColors(dayViolations);
            const hasViolations = dayViolations.length > 0;
            const isTodayWeek = formatDate(d) === formatDate(today);

            return (
              <div
                key={dateStr}
                className={`vc-week-day ${isTodayWeek ? "vc-week-day--today" : ""} ${hasViolations ? "vc-week-day--has-violations" : ""}`}
                onClick={() => {
                  setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1));
                  setSelectedDayViolations({ date: dateStr, violations: dayViolations });
                  setIsPanelOpen(true);
                }}
              >
                <div className="vc-week-day-name">{dayNames[d.getDay()]}</div>
                <div className="vc-week-day-number">{d.getDate()}</div>
                {hasViolations && (
                  <div className="vc-week-dots">
                    {hasPending && <span className="vc-dot vc-dot--pending" />}
                    {hasApproved && <span className="vc-dot vc-dot--approved" />}
                  </div>
                )}
                <div className="vc-week-count">{dayViolations.length} VP</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Side Panel for Day Violations */}
      {isPanelOpen && selectedDayViolations && createPortal(
        <div className="vc-panel-overlay" onClick={closePanel}>
          <div className="vc-panel" onClick={(e) => e.stopPropagation()}>
            <div className="vc-panel-header">
              <div>
                <h3 className="vc-panel-title">Vi phạm ngày {formatDisplayDate(selectedDayViolations.date)}</h3>
                <p className="vc-panel-subtitle">
                  {selectedDayViolations.violations.length} vi phạm
                </p>
              </div>
              <button className="vc-panel-close" onClick={closePanel}>
                <FiX size={20} />
              </button>
            </div>

            {isLoadingViolations ? (
              <div className="vc-panel-loading">
                <div className="vc-spinner" />
                <span>Đang tải...</span>
              </div>
            ) : selectedDayViolations.violations.length === 0 ? (
              <div className="vc-panel-empty">
                <FiCheckCircle size={40} className="vc-empty-icon" />
                <p>Không có vi phạm nào trong ngày này.</p>
              </div>
            ) : (
              <div className="vc-panel-list">
                {selectedDayViolations.violations.map((v) => (
                  <div key={v.id} className="vc-violation-card">
                    <div className="vc-card-top">
                      <div className="vc-student-info">
                        <div className="vc-avatar">{v.student.charAt(0)}</div>
                        <div>
                          <div className="vc-student-name">{v.student}</div>
                          <div className="vc-student-class">{v.class} · {v.grade}</div>
                        </div>
                      </div>
                      <StatusBadge status={v.status}>
                        {getStatusLabel(v.status)}
                      </StatusBadge>
                    </div>
                    <div className="vc-card-body">
                      <div className="vc-card-row">
                        <FiAlertTriangle className="vc-card-icon" />
                        <span className={`vc-level-badge vc-level--${v.level}`}>
                          {getLevelLabel(v.level)}
                        </span>
                        <span className="vc-violation-type">{v.type}</span>
                      </div>
                      {v.description && (
                        <div className="vc-card-row">
                          <FiClock className="vc-card-icon" />
                          <span className="vc-description">{v.description}</span>
                        </div>
                      )}
                      {v.reporter && (
                        <div className="vc-card-row">
                          <FiUser className="vc-card-icon" />
                          <span className="vc-reporter">Người ghi nhận: {v.reporter}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ViolationCalendar;
