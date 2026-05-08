import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "./ScheduleToolbar.css";

export default function ScheduleToolbar({
    weekLabel,
    classNameValue,
    onPrevWeek,
    onNextWeek,
    onToday,
}) {
    return (
        <div className="schedule-week-bar schedule-week-bar--readonly">
            <div className="schedule-week-info">
                <div className="week-info-text">
                    <span className="week-month-label">{weekLabel}</span>
                    <span className="week-date-range">Lớp {classNameValue}</span>
                </div>
            </div>

            <div className="schedule-week-picker schedule-week-picker--readonly">
                <div className="schedule-week-controls">
                    <button type="button" onClick={onPrevWeek}>
                        <FiChevronLeft /> Tuần trước
                    </button>
                    <button type="button" onClick={onToday}>
                        Tuần này
                    </button>
                    <button type="button" onClick={onNextWeek}>
                        Tuần sau <FiChevronRight />
                    </button>
                </div>
            </div>
        </div>
    );
}


