import { IoCaretBack, IoCaretForward } from "react-icons/io5";
import { getWeekDateRangeStr } from "./weekPickerUtils";
import "./WeekPicker.css";

export default function WeekPicker({
  value = 1,
  onChange,
  totalWeeks = 35,
  label = "Tuần",
  rangeLabel,
  className = "",
}) {
  const handlePrev = () => {
    if (value <= 1) return;
    onChange(value - 1);
  };

  const handleNext = () => {
    if (value >= totalWeeks) return;
    onChange(value + 1);
  };

  const displayRange = rangeLabel || getWeekDateRangeStr(value);

  return (
    <div className={`common-week-picker compact-pill ${className}`.trim()}>
      <button
        type="button"
        className="week-nav-btn bordered"
        onClick={handlePrev}
        disabled={value <= 1}
        aria-label="Tuần trước"
      >
        <IoCaretBack />
      </button>

      <div className="week-value-display bold" style={{ minWidth: "150px" }}>
        {label} {value} <span style={{fontWeight: '500', opacity: 0.8, fontSize: '11px', marginLeft: '4px'}}>({displayRange})</span>
      </div>

      <button
        type="button"
        className="week-nav-btn bordered"
        onClick={handleNext}
        disabled={value >= totalWeeks}
        aria-label="Tuần sau"
      >
        <IoCaretForward />
      </button>
    </div>
  );
}
