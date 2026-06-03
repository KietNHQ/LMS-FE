import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const HistoryCalendar = ({ 
  calendarMonthLabel, 
  calendarViewDate, 
  setCalendarViewDate, 
  calendarCells, 
  onSelectDate,
  minDate,
  maxDate
}) => {
  const minD = minDate ? new Date(minDate) : null;
  const maxD = maxDate ? new Date(maxDate) : null;

  const canGoPrev = !minD || new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth(), 0) >= minD;
  const canGoNext = !maxD || new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 1) <= maxD;

  return (
    <div className="lesson-calendar-popover">
      <div className="lesson-calendar-header">
        <button
          type="button"
          className="lesson-calendar-nav-btn"
          onClick={() => canGoPrev &&
            setCalendarViewDate(
              new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() - 1, 1)
            )
          }
          disabled={!canGoPrev}
          aria-label="Tháng trước"
        >
          <FiChevronLeft />
        </button>
        <strong>{calendarMonthLabel}</strong>
        <button
          type="button"
          className="lesson-calendar-nav-btn"
          onClick={() => canGoNext &&
            setCalendarViewDate(
              new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 1)
            )
          }
          disabled={!canGoNext}
          aria-label="Tháng sau"
        >
          <FiChevronRight />
        </button>
      </div>

      <table className="lesson-calendar-table">
        <thead>
          <tr>
            <th>T2</th>
            <th>T3</th>
            <th>T4</th>
            <th>T5</th>
            <th>T6</th>
            <th>T7</th>
            <th>CN</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }, (_, weekIdx) => (
            <tr key={`week-${weekIdx}`}>
              {calendarCells.slice(weekIdx * 7, weekIdx * 7 + 7).map((cell) => {
                const cellD = new Date(cell.dateKey);
                const isOutOfRange = (minD && cellD < minD) || (maxD && cellD > maxD);
                
                return (
                  <td key={cell.dateKey}>
                    <button
                      type="button"
                      className={`lesson-calendar-day ${cell.isCurrentMonth ? "" : "out-month"} ${
                        cell.hasReview ? "has-review" : ""
                      } ${cell.hasLesson ? "has-lesson" : ""} ${cell.isSelected ? "selected" : ""} ${cell.isToday ? "today" : ""} ${isOutOfRange ? "disabled" : ""}`.trim()}
                      onClick={() => !isOutOfRange && onSelectDate(cell.dateKey)}
                      disabled={isOutOfRange}
                    >
                      {cell.day}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HistoryCalendar;

