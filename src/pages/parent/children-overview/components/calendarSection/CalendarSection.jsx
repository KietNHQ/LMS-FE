import React, { useState } from "react";
import "./CalendarSection.css";

export default function CalendarSection({ schedule, events, compact = false }) {
    const [activeView, setActiveView] = useState("schedule");
    const [activeScheduleIndex, setActiveScheduleIndex] = useState(0);
    const [activeEventIndex, setActiveEventIndex] = useState(0);

    return (
        <div className={`calendar-card ${compact ? "compact" : ""}`}>
            <div className="calendar-heading">
                <div className="calendar-heading-text">
                    <h3>Lịch học & Sự kiện</h3>
                    <p>Bấm để xem nhanh lịch học hoặc sự kiện của con.</p>
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

            {activeView === "schedule" && (
                <div className="calendar-sub-block">
                    <h4>Lịch học hàng tuần</h4>

                    <div className="calendar-list">
                        {schedule.map((item, index) => (
                            <button
                                type="button"
                                key={`${item.subject}-${index}`}
                                className={`calendar-list-item ${activeScheduleIndex === index ? "active" : ""}`}
                                onClick={() => setActiveScheduleIndex(index)}
                            >
                                <div className="calendar-item-main">
                                    <strong>{item.subject}</strong>
                                    <p>
                                        {item.day} • {item.time}
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