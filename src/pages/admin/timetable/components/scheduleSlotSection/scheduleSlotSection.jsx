import React from "react";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import "./scheduleSlotSection.css";

function SlotCard({ session, onEditSlot, onDeleteSlot }) {
    if (!session) return null;

    return (
        <article className="tt-slot-card">
            <h5>{session.subject}</h5>
            <p>{session.teacher}</p>
            <p>{session.room}</p>
            <span className={`tt-slot-status ${session.status === "Đã chốt" ? "ok" : "pending"}`}>
                {session.status}
            </span>
            <div className="tt-slot-actions" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="icon-btn" onClick={() => onEditSlot(session)} title="Sửa">
                    <FiEdit2 />
                </button>
                <button type="button" className="icon-btn delete" onClick={() => onDeleteSlot(session.id)} title="Xóa">
                    <FiTrash2 />
                </button>
            </div>
        </article>
    );
}

export default function ScheduleSlotSection({
    selectedClass,
    sessionView,
    days,
    periods,
    slotsMap,
    onCreateFromSlot,
    onEditSlot,
    onDeleteSlot,
    onSessionViewChange,
}) {
    const isMorning = sessionView === "morning";

    return (
        <section className="tt-schedule-section">
            <div className="tt-schedule-header">
                <div>
                    <h3>Thời khóa biểu lớp {selectedClass}</h3>
                </div>
                <button
                    type="button"
                    className="tt-session-toggle-btn"
                    onClick={() => onSessionViewChange(isMorning ? "afternoon" : "morning")}
                >
                    {isMorning ? "Đổi sang 5 tiết chiều" : "Đổi sang 5 tiết sáng"}
                </button>
            </div>

            <div className="tt-schedule-table-wrap">
                <table className="tt-schedule-table">
                    <thead>
                        <tr>
                            <th className="col-period">Tiết</th>
                            {days.map((day) => (
                                <th key={day}>{day}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {periods.map((period) => (
                            <tr key={period}>
                                <td className="period-cell">Tiết {period}</td>
                                {days.map((day) => {
                                    const key = `${day}-${period}`;
                                    const slot = slotsMap.get(key);
                                    return (
                                        <td key={key} className="slot-cell">
                                            {slot ? (
                                                <SlotCard
                                                    session={slot}
                                                    onEditSlot={onEditSlot}
                                                    onDeleteSlot={onDeleteSlot}
                                                />
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="tt-empty-slot-btn"
                                                    onClick={() => onCreateFromSlot(day, period)}
                                                >
                                                    <FiPlus />
                                                    Thêm
                                                </button>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

