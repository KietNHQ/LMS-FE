import { IoCaretBack, IoCaretForward } from "react-icons/io5";
import "./WeekPicker.css";

export default function WeekPicker({
  value = 1,
  onChange,
  totalWeeks = 35,
  label = "Tuần",
}) {
  const handlePrev = () => {
    if (value <= 1) return;
    onChange(value - 1);
  };

  const handleNext = () => {
    if (value >= totalWeeks) return;
    onChange(value + 1);
  };

  return (
    <div className="common-week-picker compact-pill">
      <button
        type="button"
        className="week-nav-btn bordered"
        onClick={handlePrev}
        disabled={value <= 1}
        aria-label="Tuần trước"
      >
        <IoCaretBack />
      </button>

      <div className="week-value-display bold">
        {label} {value}/{totalWeeks}
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
