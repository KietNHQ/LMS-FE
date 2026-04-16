import React, { useEffect, useMemo, useState } from "react";
import "./CalendarSection.css";
import { UnifiedTimetable } from "../../../../../components/common";
import {
    getClassWeekLessons,
    getStartOfIsoWeek,
    shiftWeek,
} from "../../../../../utils/timetableShared";

export default function CalendarSection({ events, compact = false, classNameValue, selectedChildId }) {
    const [activeView, setActiveView] = useState("schedule");
    const [activeScheduleIndex, setActiveScheduleIndex] = useState(0);
    const [activeEventIndex, setActiveEventIndex] = useState(0);
    const [weekStart, setWeekStart] = useState(() => getStartOfIsoWeek(new Date()));

    useEffect(() => {
        setActiveScheduleIndex(0);
        setActiveEventIndex(0);
        setWeekStart(getStartOfIsoWeek(new Date()));
    }, [selectedChildId]);

    const lessons = useMemo(
        () => (classNameValue ? getClassWeekLessons(classNameValue, weekStart) : []),
        [classNameValue, weekStart]
    );

    const compactLessons = useMemo(() => lessons.slice(0, 4), [lessons]);

    return (
        <div className={`calendar-card ${compact ? "compact" : ""}`}>
            <div className="calendar-heading">
                <div className="calendar-heading-text">
                    <h3>Lịch học & Sự kiện</h3>
                </div>
            </div>

            <div className="calendar-view-switch" role="tablist" aria-label="Chuyển lịch học và sự kiện">
                <button
                    type="button"
                    className={`calendar-switch-btn ${activeView === "schedule" ? "active" : ""}`}
                    onClick={() => setActiveView("schedule")}
                >
                    Lịch học
                </button>
                <button
                    type="button"
                    className={`calendar-switch-btn ${activeView === "events" ? "active" : ""}`}
                    onClick={() => setActiveView("events")}
                >
                    Sự kiện
                </button>
            </div>

            {activeView === "schedule" && compact && (
                <div className="calendar-sub-block">
                    <h4>Lịch học hàng tuần</h4>

                    <div className="calendar-list">
                        {compactLessons.map((item, index) => (
                            <button
                                type="button"
                                key={`${item.id}-${index}`}
                                className={`calendar-list-item ${activeScheduleIndex === index ? "active" : ""}`}
                                onClick={() => setActiveScheduleIndex(index)}
                            >
                                <div className="calendar-item-main">
                                    <strong>{item.subject}</strong>
                                    <p>
                                        Tiết {item.periodStart}{item.periodEnd > item.periodStart ? `-${item.periodEnd}` : ""} • {item.timeRange}
                                    </p>
                                </div>

                                <div className="calendar-item-tag room-tag">
                                    Phòng: {item.room}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {activeView === "schedule" && !compact && (
                <UnifiedTimetable
                    title="Thoi khoa bieu phu huynh"
                    weekStart={weekStart}
                    lessons={lessons}
                    classNameValue={classNameValue}
                    onPrevWeek={() => setWeekStart((prev) => shiftWeek(prev, -1))}
                    onNextWeek={() => setWeekStart((prev) => shiftWeek(prev, 1))}
                    onResetWeek={() => setWeekStart(getStartOfIsoWeek(new Date()))}
                    compact
                />
            )}

            {activeView === "events" && (
                <div className="calendar-sub-block">
                    <h4>Sự kiện sắp tới</h4>

                    <div className="event-list">
                        {events.map((item, index) => (
                            <button
                                type="button"
                                key={`${item.title}-${index}`}
                                className={`event-item ${activeEventIndex === index ? "active" : ""}`}
                                onClick={() => setActiveEventIndex(index)}
                            >
                                <div className="calendar-item-main">
                                    <strong>{item.title}</strong>
                                    <p>{item.date}</p>
                                </div>

                                <div className="calendar-item-tag type-tag">
                                    Loại: {item.type}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}


        </div>
    );
}