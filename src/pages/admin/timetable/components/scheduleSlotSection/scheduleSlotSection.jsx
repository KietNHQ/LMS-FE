import { FiEdit2, FiPlus, FiTrash2, FiUser, FiMapPin, FiAlertTriangle } from "react-icons/fi";
import { MdWbSunny, MdWbTwilight } from "react-icons/md";
import { BsFillSunFill } from "react-icons/bs";
import { FaRegMoon } from "react-icons/fa";
import "./scheduleSlotSection.css";

function SlotCard({ session, onEditSlot, onDeleteSlot }) {
    if (!session) return null;

    return (
        <article className="tt-slot-card">
            <div className="tt-slot-main">
                <h5 className="tt-slot-subject">{session.subject}</h5>
                <div className="tt-slot-meta">
                    <span className="meta-item"><FiUser /> {session.teacher}</span>
                    <span className="meta-item"><FiMapPin /> Phòng {session.room}</span>
                </div>
            </div>
            <div className="tt-slot-footer">
                <div className={`tt-status-pill ${session.status === "Đã chốt" ? "status-ok" : "status-pending"}`}>
                    {session.status}
                </div>
                <div className="tt-slot-actions" onClick={(e) => e.stopPropagation()}>
                    <button type="button" className="tt-action-btn edit" onClick={() => onEditSlot(session)} title="Chỉnh sửa">
                        <FiEdit2 />
                    </button>
                    <button type="button" className="tt-action-btn delete" onClick={() => onDeleteSlot(session.id)} title="Gỡ tiết">
                        <FiTrash2 />
                    </button>
                </div>
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
    onOpenConflicts,
    conflictCount,
}) {
    const isMorning = sessionView === "morning";

    return (
        <section className="tt-schedule-section">
            <div className="tt-schedule-header">
                <div>
                    <h3>Thời khóa biểu lớp {selectedClass}</h3>
                </div>
                <div className="tt-schedule-actions">
                    <button type="button" className="tt-conflict-grid-btn" onClick={onOpenConflicts}>
                        <FiAlertTriangle />
                        <span>Xung đột <strong>{conflictCount}</strong></span>
                    </button>
                    <button
                        type="button"
                        className={`tt-session-toggle-btn ${isMorning ? "tt-session-toggle-morning" : "tt-session-toggle-afternoon"}`}
                        onClick={() => onSessionViewChange(isMorning ? "afternoon" : "morning")}
                    >
                        <span className="tt-session-toggle-icon-wrap">
                            {!isMorning ? (
                                <FaRegMoon className="tt-session-toggle-icon moon" />
                            ) : (
                                <BsFillSunFill className="tt-session-toggle-icon sun" />
                            )}
                        </span>
                        <span className={`tt-session-toggle-label ${isMorning ? "moon" : "sun"}`}>
                            {isMorning ? "Sáng" : "Chiều"}
                        </span>
                    </button>
                </div>
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
                                                    <span>Thêm tiết</span>
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
