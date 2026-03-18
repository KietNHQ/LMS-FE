import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import "./ScheduleToolbar.css";

export default function ScheduleToolbar({
    monthLabel,
    monday,
    friday,
    pickerOpen,
    pickerWrapperRef,
    setPickerOpen,
    changeWeek,
    changeViewMonth,
    viewMonth,
    selectedWeekStart,
    getWeeksForMonth,
    toWeekInputValue,
    getStartOfIsoWeek,
    setSelectedWeekStart,
    setViewMonth,
}) {
    return (
        <div className="schedule-week-bar">
            <div className="schedule-week-info">
                <CalendarMonthRoundedIcon className="week-icon" />
                <div className="week-info-text">
                    <span className="week-month-label">{monthLabel}</span>
                    <span className="week-date-range">
                        {monday} – {friday} • Lớp 10A1
                    </span>
                </div>
            </div>

            <div className="schedule-week-picker">
                <label htmlFor="weekPicker">Chọn tuần</label>
                <div className="schedule-week-controls">
                    <button type="button" onClick={() => changeWeek(-1)}>
                        <FiChevronLeft /> Tuần trước
                    </button>

                    <div
                        className={`week-input-wrapper${pickerOpen ? " open" : ""}`}
                        ref={pickerWrapperRef}
                        onClick={() => setPickerOpen((prev) => !prev)}
                    >
                        <CalendarMonthRoundedIcon className="week-input-cal-icon" />
                        <span className="week-input-week">
                            Tuần {Number(toWeekInputValue(selectedWeekStart).split("-W")[1])}
                        </span>
                        <span className="week-input-sep">·</span>
                        <span className="week-input-month">{monthLabel}</span>

                        {pickerOpen && (
                            <div className="week-picker-popup" onClick={(e) => e.stopPropagation()}>
                                <div className="week-picker-header">
                                    <button
                                        type="button"
                                        className="week-picker-nav"
                                        aria-label="Tháng trước"
                                        onClick={() => changeViewMonth(-1)}
                                    >
                                        <MdChevronLeft />
                                    </button>
                                    <span className="week-picker-title">
                                        {viewMonth.toLocaleString("vi-VN", { month: "long" })} {viewMonth.getFullYear()}
                                    </span>
                                    <button
                                        type="button"
                                        className="week-picker-nav"
                                        aria-label="Tháng sau"
                                        onClick={() => changeViewMonth(1)}
                                    >
                                        <MdChevronRight />
                                    </button>
                                </div>

                                <div className="week-picker-day-names">
                                    <span>Tuần</span>
                                    {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => (
                                        <span key={d}>{d}</span>
                                    ))}
                                </div>

                                {getWeeksForMonth(viewMonth.getFullYear(), viewMonth.getMonth()).map((weekMon) => {
                                    const weekDays = Array.from({ length: 7 }, (_, i) => {
                                        const d = new Date(weekMon);
                                        d.setDate(weekMon.getDate() + i);
                                        return d;
                                    });
                                    const wn = Number(toWeekInputValue(weekMon).split("-W")[1]);
                                    const isSelected =
                                        weekMon.getTime() === getStartOfIsoWeek(selectedWeekStart).getTime();
                                    const todayStr = new Date().toDateString();

                                    return (
                                        <div
                                            key={weekMon.toISOString()}
                                            className={`week-picker-row${isSelected ? " selected" : ""}`}
                                            onClick={() => {
                                                setSelectedWeekStart(new Date(weekMon));
                                                setPickerOpen(false);
                                            }}
                                        >
                                            <span className="week-picker-wn">{wn}</span>
                                            {weekDays.map((d, i) => (
                                                <span
                                                    key={i}
                                                    className={[
                                                        "week-picker-day-num",
                                                        d.getMonth() !== viewMonth.getMonth() ? "other" : "",
                                                        d.toDateString() === todayStr ? "today" : "",
                                                    ]
                                                        .filter(Boolean)
                                                        .join(" ")}
                                                >
                                                    {d.getDate()}
                                                </span>
                                            ))}
                                        </div>
                                    );
                                })}

                                <div className="week-picker-footer">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const now = getStartOfIsoWeek(new Date());
                                            setSelectedWeekStart(now);
                                            setViewMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                                            setPickerOpen(false);
                                        }}
                                    >
                                        Tuần này
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <button type="button" onClick={() => changeWeek(1)}>
                        Tuần sau <FiChevronRight />
                    </button>
                </div>
            </div>
        </div>
    );
}

