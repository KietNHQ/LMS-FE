import React, { useRef, useMemo } from "react";
import "./ScheduleFilterSection.css";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import Select from "../../../../../components/ui/Select/Select";
import { CLASS_OPTIONS } from "../../../../../utils/timetableShared";
import { useQuery } from "@tanstack/react-query";
import teacherService from "../../../../../services/pages/teacher/teacherService";

import { FaRegMoon } from "react-icons/fa";
import { BsFillSunFill } from "react-icons/bs";

function getWeekDates(offset = 0) {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + offset * 7);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

function formatWeekRange(days) {
  const opts = { day: "2-digit", month: "2-digit" };
  return `${days[0].toLocaleDateString("vi-VN", opts)} - ${days[6].toLocaleDateString("vi-VN", opts)} / ${days[0].getFullYear()}`;
}

export default function ScheduleFilterSection({ 
  weekOffset, 
  setWeekOffset, 
  selectedGrade,
  setSelectedGrade,
  selectedClass, 
  setSelectedClass,
  sessionView = "morning",
  setSessionView,
  availableClasses = []
}) {
  const days = getWeekDates(weekOffset);
  const dateInputRef = useRef(null);

  const goBack = () => setWeekOffset((w) => w - 1);
  const goForward = () => setWeekOffset((w) => w + 1);

  const handleDateChange = (e) => {
    if (!e.target.value) return;
    const selectedDate = new Date(e.target.value);

    const getMonday = (d) => {
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const mon = new Date(d);
      mon.setDate(diff);
      mon.setHours(0, 0, 0, 0);
      return mon;
    };

    const now = new Date();
    const mondayNow = getMonday(now);
    const mondaySelected = getMonday(selectedDate);
    const diffTime = mondaySelected.getTime() - mondayNow.getTime();
    const diffWeeks = Math.round(diffTime / (1000 * 60 * 60 * 24 * 7));

    setWeekOffset(diffWeeks);
  };

  const openPicker = () => {
    if (dateInputRef.current && dateInputRef.current.showPicker) {
      dateInputRef.current.showPicker();
    } else {
      dateInputRef.current?.focus();
    }
  };

  const isMorning = sessionView === "morning";

  // Fetch grade levels from API
  const { data: gradeLevelsData = [] } = useQuery({
    queryKey: ["teacher-schedule-grade-levels"],
    queryFn: async () => {
      try {
        const res = await teacherService.getGradeLevels({ mock: false });
        return res?.data || res || [];
      } catch {
        return [];
      }
    },
    staleTime: 10 * 60 * 1000,
  });

  const gradeOptions = [
    { label: "Tất cả", value: "Tất cả" },
    ...gradeLevelsData.map(g => ({
      label: g.name || `Khối ${g.level_number}`,
      value: g.name || `Khối ${g.level_number}`,
    })),
  ];

  // Cascading Filter Logic - build from API grade levels
  const gradeLevelMap = useMemo(() => {
    const map = {};
    (gradeLevelsData || []).forEach(g => {
      const name = g.name || `Khối ${g.level_number}`;
      const gradeNum = String(g.level_number || name.replace(/\D/g, ""));
      map[name] = gradeNum;
    });
    return map;
  }, [gradeLevelsData]);

  const filteredClasses = useMemo(() => {
    const baseList = availableClasses.length > 0 ? availableClasses : CLASS_OPTIONS;
    if (selectedGrade === "Tất cả") return ["Tất cả", ...baseList];
    const gradeNum = gradeLevelMap[selectedGrade] || selectedGrade.replace("Khối ", "").replace("khối ", "");
    const filtered = baseList.filter(cls => cls.startsWith(gradeNum));
    return ["Tất cả", ...filtered];
  }, [selectedGrade, availableClasses, gradeLevelMap]);

  const handleGradeChange = (e) => {
    setSelectedGrade(e.target.value);
    setSelectedClass("Tất cả");
  };

  return (
    <div className="schedule-filter-section">
      <div className="schedule-filter-left">
        <div className="schedule-filter-week-nav">
          <button className="week-nav-btn" onClick={goBack}>
            <ChevronLeft size={18} />
          </button>

          <div className="week-label" onClick={openPicker} title="Chọn ngày để chuyển tuần">
            <Calendar size={16} />
            <span>{formatWeekRange(days)}</span>
            <input
              type="date"
              ref={dateInputRef}
              onChange={handleDateChange}
              style={{ position: 'absolute', opacity: 0, width: 0, padding: 0, border: 'none' }}
              value={days[0].toISOString().split('T')[0]}
            />
          </div>

          <button className="week-nav-btn" onClick={goForward}>
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="schedule-filter-grade-class-group">
          <div className="grade-filter-wrapper">
            <Select
              className="schedule-admin-select"
              variant="custom"
              options={gradeOptions}
              value={selectedGrade}
              onChange={handleGradeChange}
            />
          </div>

          {selectedGrade !== "Tất cả" && (
            <div className="class-filter-wrapper">
              <Select
                className="schedule-admin-select"
                variant="custom"
                options={filteredClasses}
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      <div className="schedule-filter-right">
        <button
          type="button"
          className={`tt-session-toggle-btn ${isMorning ? "tt-session-toggle-morning" : "tt-session-toggle-afternoon"}`}
          onClick={() => setSessionView(isMorning ? "afternoon" : "morning")}
        >
          <span className="tt-session-toggle-icon-wrap">
            {!isMorning ? (
              <FaRegMoon className="tt-session-toggle-icon moon" />
            ) : (
              <BsFillSunFill className="tt-session-toggle-icon sun" />
            )}
          </span>
          <span className={`tt-session-toggle-label ${isMorning ? "moon" : "sun"}`}>
            Đổi sang 5 tiết {isMorning ? "chiều" : "sáng"}
          </span>
        </button>
      </div>
    </div>
  );
}




