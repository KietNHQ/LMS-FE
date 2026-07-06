import React, { useMemo, useState } from "react";
import "./CalendarSection.css";
import { UnifiedTimetable } from "../../../../../components/common";
import {
    getClassWeekLessons,
    getStartOfIsoWeek,
    shiftWeek,
    PERIOD_SLOTS,
} from "../../../../../utils/timetableShared";

const DAY_NUM_TO_NAME = {
    1: "Sunday",
    2: "Monday",
    3: "Tuesday",
    4: "Wednesday",
    5: "Thursday",
    6: "Friday",
    7: "Saturday",
    8: "Sunday",
};

function enrichApiSchedule(rawSchedule) {
    return rawSchedule.map((item) => {
        const periodSlot = PERIOD_SLOTS.find(p => p.period === item.periodStart) || {};
        return {
            ...item,
            classId: item.classId || item.class_id || item.class_teacher_subject?.classes?.id || null,
            className: item.className || item.class_name || item.class_teacher_subject?.classes?.class_name || "",
            day: item.day || DAY_NUM_TO_NAME[item.day_of_week] || "",
            start: item.start || periodSlot.start || "",
            end: item.end || periodSlot.end || "",
            timeRange: (item.start || periodSlot.start) && (item.end || periodSlot.end)
                ? `${item.start || periodSlot.start} - ${item.end || periodSlot.end}`
                : "",
        };
    });
}

function normalizeClassName(value) {
    return String(value || "")
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .trim()
        .toLowerCase();
}

function matchesSelectedClass(lesson, selectedClassId, selectedClassKey) {
    if (!selectedClassId && !selectedClassKey) return true;
    const nameMatches = selectedClassKey && normalizeClassName(lesson.className) === selectedClassKey;
    if (selectedClassId && lesson.classId != null) {
        return String(lesson.classId) === String(selectedClassId) || Boolean(nameMatches);
    }
    return Boolean(nameMatches);
}

export default function CalendarSection({ schedule, events, compact = false, classNameValue, classIdValue, scheduleError }) {
    const [activeView, setActiveView] = useState("schedule");
    const [activeScheduleIndex, setActiveScheduleIndex] = useState(0);
    const [activeEventIndex, setActiveEventIndex] = useState(0);
    const [weekStart, setWeekStart] = useState(() => getStartOfIsoWeek(new Date()));

    const apiScheduleLessons = useMemo(
        () => enrichApiSchedule(Array.isArray(schedule) ? schedule : []),
        [schedule]
    );

    const mockLessons = useMemo(
        () => (classNameValue ? getClassWeekLessons(classNameValue, weekStart) : []),
        [classNameValue, weekStart]
    );

    const lessons = useMemo(() => {
        if (!Array.isArray(schedule)) return mockLessons;
        const selectedClassKey = normalizeClassName(classNameValue);
        const selectedClassId = classIdValue || null;
        return apiScheduleLessons.filter((lesson) =>
            matchesSelectedClass(lesson, selectedClassId, selectedClassKey)
        );
    }, [apiScheduleLessons, classIdValue, classNameValue, mockLessons, schedule]);

    const showNotEnrolled = scheduleError && !apiScheduleLessons.length;
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

            {activeView === "schedule" && showNotEnrolled && (
                <div className="calendar-sub-block">
                    <div className="not-enrolled-message">
                        <p>{scheduleError || "Học sinh chưa được xếp lớp"}</p>
                    </div>
                </div>
            )}

            {activeView === "schedule" && compact && (
                <div className="calendar-sub-block">
                    <h4>Lịch học hàng tuần</h4>

                    <div className="calendar-list">
                        {compactLessons.length === 0 ? (
                            <div className="not-enrolled-message">
                                <p>Chưa có lịch học trong học kỳ này.</p>
                            </div>
                        ) : compactLessons.map((item, index) => (
                            <button
                                type="button"
                                key={item.id || `schedule-${index}`}
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
                        {events.length === 0 ? (
                            <div className="not-enrolled-message">
                                <p>Chưa có sự kiện trong học kỳ này.</p>
                            </div>
                        ) : events.map((item, index) => (
                            <button
                                type="button"
                                key={item.id || item.date || `event-${index}`}
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
