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

  const getWeekDateRange = (weekNum) => {
    // Mốc bắt đầu: Thứ 2, 25/08/2025
    const startDate = new Date(2025, 7, 25);
    let totalDays = (weekNum - 1) * 7;
    
    // Cộng thêm các tuần nghỉ/thi (Gaps) để 35 tuần thực học trải dài đến hết tháng 5
    if (weekNum > 8) totalDays += 7;  // Thi Giữa HK1
    if (weekNum > 17) totalDays += 14; // Thi Cuối HK1 + Nghỉ giữa học kỳ
    if (weekNum > 22) totalDays += 14; // Nghỉ Tết Nguyên Đán (thường 2 tuần)
    if (weekNum > 30) totalDays += 7;  // Thi Giữa HK2

    startDate.setDate(startDate.getDate() + totalDays);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    
    const format = (d) => `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    return `${format(startDate)} - ${format(endDate)}`;
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

      <div className="week-value-display bold" style={{ minWidth: "150px" }}>
        {label} {value} <span style={{fontWeight: '500', opacity: 0.8, fontSize: '11px', marginLeft: '4px'}}>({getWeekDateRange(value)})</span>
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

