import React, { useRef } from "react";
import "./ScheduleFilterSection.css";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import Select from "../../../../../../../../components/ui/Select/Select";

const classes = ["Tất cả", "10A1", "10A2", "11B1", "11B2", "12A1"];
const quickDays = [
  { value: -1, label: "Hôm qua" },
  { value: 0, label: "Hôm nay" },
  { value: 1, label: "Ngày mai" },
];

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

export default function ScheduleFilterSection({ weekOffset, setWeekOffset, selectedClass, setSelectedClass, onQuickDaySelect }) {
  const days = getWeekDates(weekOffset);
  const dateInputRef = useRef(null);

  const goBack = () => setWeekOffset((w) => w - 1);
  const goForward = () => setWeekOffset((w) => w + 1);
  const goToday = () => setWeekOffset(0);

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

  return (
    <div className="schedule-filter-section">
      <div className="schedule-filter-week">
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
              // current monday as value to indicate current selection
              value={days[0].toISOString().split('T')[0]}
            />
          </div>

          <button className="week-nav-btn" onClick={goForward}>
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="schedule-filter-actions">
          <div className="class-filter-wrapper">
            <Select
              className="schedule-admin-select"
              variant="custom"
              options={classes}
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            />
          </div>
          <Select
            className="schedule-admin-select schedule-quick-select"
            variant="custom"
            options={quickDays}
            value={0}
            onChange={(e) => {
              const nextOffset = Number(e.target.value);
              if (typeof onQuickDaySelect === "function") {
                onQuickDaySelect(nextOffset);
              } else if (nextOffset === 0) {
                goToday();
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}



