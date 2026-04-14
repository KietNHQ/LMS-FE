import React, { useMemo } from "react";
import {
  PERIOD_SLOTS,
  WEEK_DAYS,
  STATUS_META,
  MODE_META,
  formatWeekRangeLabel,
  getLessonsByDayAndPeriod,
  getPeriodRangeLabel,
} from "../../../utils/timetableShared";
import "./UnifiedTimetable.css";

const STATUS_ORDER = ["normal", "rescheduled", "cancelled", "holiday", "makeup"];

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.normal;
  return <span className={`ut-status ut-status-${meta.tone}`}>{meta.label}</span>;
}

function SlotCard({ lesson, period }) {
  const continued = period > lesson.periodStart;

  return (
    <article className={`ut-lesson ut-color-${lesson.color} ${continued ? "ut-lesson-continued" : ""}`}>
      <header className="ut-lesson-header">
        <strong>{lesson.subject}</strong>
        <StatusBadge status={lesson.status} />
      </header>

      <div className="ut-lesson-meta">
        <span>{lesson.room}</span>
        <span>{lesson.teacher}</span>
      </div>

      <div className="ut-lesson-meta ut-lesson-meta-row">
        <span>{getPeriodRangeLabel(lesson.periodStart, lesson.periodEnd)}</span>
        <span>{MODE_META[lesson.mode] || MODE_META.offline}</span>
      </div>

      <p className="ut-lesson-note">{lesson.note || "Khong co ghi chu"}</p>
    </article>
  );
}

export default function UnifiedTimetable({
  title,
  weekStart,
  lessons,
  onPrevWeek,
  onNextWeek,
  onResetWeek,
  classNameValue,
  readOnly = true,
  compact = false,
}) {
  const lessonMap = useMemo(() => getLessonsByDayAndPeriod(lessons || []), [lessons]);

  const legendItems = useMemo(
    () => STATUS_ORDER.map((key) => ({ key, ...STATUS_META[key] })),
    []
  );

  const groupedByDay = useMemo(() => {
    const map = {};
    WEEK_DAYS.forEach((day) => {
      map[day.key] = (lessons || [])
        .filter((item) => item.day === day.key)
        .sort((a, b) => a.periodStart - b.periodStart);
    });
    return map;
  }, [lessons]);

  return (
    <section className={`ut-wrap ${readOnly ? "ut-wrap-readonly" : ""} ${compact ? "ut-wrap-compact" : ""}`}>
      <header className="ut-header">
        <div>
          <h3>{title}</h3>
          <p>
            Lop {classNameValue} | Tuan {formatWeekRangeLabel(weekStart)}
          </p>
          {readOnly && <span className="ut-readonly-pill">Chi xem</span>}
        </div>

        <div className="ut-actions">
          <button type="button" onClick={onPrevWeek}>Truoc</button>
          <button type="button" onClick={onResetWeek}>Hien tai</button>
          <button type="button" onClick={onNextWeek}>Sau</button>
        </div>
      </header>

      <div className="ut-legend" aria-label="Quy uoc trang thai">
        {legendItems.map((item) => (
          <span key={item.key} className={`ut-legend-item ut-status-${item.tone}`}>
            {item.label}
          </span>
        ))}
      </div>

      <div className="ut-desktop-table">
        <table>
          <thead>
            <tr>
              <th>Tiet</th>
              {WEEK_DAYS.map((day) => (
                <th key={day.key}>{day.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERIOD_SLOTS.map((slot) => (
              <tr key={slot.period}>
                <td className="ut-period-cell">
                  <strong>Tiet {slot.period}</strong>
                  <span>{slot.start} - {slot.end}</span>
                </td>
                {WEEK_DAYS.map((day) => {
                  const key = `${day.key}-${slot.period}`;
                  const cellLessons = lessonMap.get(key) || [];
                  return (
                    <td key={key}>
                      <div className="ut-cell-stack">
                        {cellLessons.length ? (
                          cellLessons.map((lesson) => (
                            <SlotCard key={`${lesson.id}-${slot.period}`} lesson={lesson} period={slot.period} />
                          ))
                        ) : (
                          <span className="ut-empty">-</span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ut-mobile-list">
        {WEEK_DAYS.map((day) => (
          <section key={day.key} className="ut-mobile-day">
            <h4>{day.label}</h4>
            {groupedByDay[day.key]?.length ? (
              groupedByDay[day.key].map((lesson) => (
                <SlotCard key={lesson.id} lesson={lesson} period={lesson.periodStart} />
              ))
            ) : (
              <p className="ut-empty">Khong co tiet hoc</p>
            )}
          </section>
        ))}
      </div>
    </section>
  );
}
