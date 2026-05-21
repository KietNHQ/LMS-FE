import { FiEdit2, FiPlus, FiTrash2, FiUser, FiMapPin, FiAlertTriangle, FiBookOpen, FiRefreshCw } from "react-icons/fi";
import { BsFillSunFill } from "react-icons/bs";
import { FaRegMoon } from "react-icons/fa";
import "./scheduleSlotSection.css";

function getStatusClass(status) {
    const normalized = String(status || "").trim().toLowerCase();
    if (normalized.includes("huy")) return "status-cancelled";
    if (normalized.includes("doi")) return "status-rescheduled";
    if (normalized.includes("nghi")) return "status-holiday";
    if (normalized.includes("bu")) return "status-makeup";
    return "status-ok";
}

function SlotCard({ session, onEditSlot, onDeleteSlot, canManage }) {
    if (!session) return null;

    return (
        <article className="tt-slot-card">
            <div className="tt-slot-main">
                <h5 className="tt-slot-subject">{session.subject}</h5>
                <div className="tt-slot-meta">
                    <span className="meta-item"><FiUser /> {session.teacher}</span>
                    <span className="meta-item"><FiMapPin /> Phòng {session.room}</span>
                    <span className="meta-item">Tiết {session.period}{(session.periodEnd || session.period) > session.period ? `-${session.periodEnd}` : ""}</span>
                    <span className="meta-item">{session.start} - {session.end}</span>
                    <span className="meta-item">{session.mode || "Offline"}</span>
                </div>
                {session.note ? <p className="tt-slot-note">{session.note}</p> : null}
            </div>
            <div className="tt-slot-footer">
                <div className={`tt-status-pill ${getStatusClass(session.status)}`}>
                    {session.status}
                </div>
                {canManage && (
                    <div className="tt-slot-actions" onClick={(e) => e.stopPropagation()}>
                        <button type="button" className="tt-action-btn edit" onClick={() => onEditSlot(session)} title="Chỉnh sửa">
                            <FiEdit2 />
                        </button>
                        <button type="button" className="tt-action-btn delete" onClick={() => onDeleteSlot(session.id)} title="Gỡ tiết">
                            <FiTrash2 />
                        </button>
                    </div>
                )}
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
    onCreateSession,
    onReset,
    currentPeriods,
    maxPeriods,
    canManage = false,
}) {
    const isMorning = sessionView === "morning";

    return (
        <section className="tt-schedule-section">
            <div className="tt-schedule-header">
                <div>
                    <h3>Thời khóa biểu lớp {selectedClass}</h3>
                </div>
                <div className="tt-schedule-actions">
                    {canManage && (
                        <>
                            <button type="button" className="tt-reset-btn" onClick={onReset} title="Xóa các tiết đang hiển thị">
                                <FiRefreshCw />
                                <span>Xóa lịch</span>
                            </button>
                            <button type="button" className="tt-add-btn" onClick={onCreateSession}>
                                <FiPlus />
                                <span>Thêm tiết học</span>
                            </button>
                        </>
                    )}
                    <div className="tt-norm-indicator">
                        <FiBookOpen />
                        <span>Định mức: <strong>{currentPeriods}/{maxPeriods || 30}</strong> tiết</span>
                    </div>
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
                                    
                                    // [NEW] Nếu tiết này là phần tiếp theo của một tiết đôi/tiết dài, ta bỏ qua không render <td>
                                    if (slot && slot.period < period) {
                                        return null;
                                    }

                                    // [NEW] Tính toán rowSpan dựa trên độ dài của tiết học
                                    const span = (slot && slot.period === period) 
                                        ? ((slot.periodEnd || slot.period) - slot.period + 1) 
                                        : 1;

                                    return (
                                        <td key={key} className="slot-cell" rowSpan={span}>
                                            {slot ? (
                                                <SlotCard
                                                    session={slot}
                                                    onEditSlot={onEditSlot}
                                                    onDeleteSlot={onDeleteSlot}
                                                    canManage={canManage}
                                                />
                                            ) : canManage ? (
                                                <button
                                                    type="button"
                                                    className="tt-empty-slot-btn"
                                                    onClick={() => onCreateFromSlot(day, period)}
                                                >
                                                    <FiPlus />
                                                    <span>Thêm tiết</span>
                                                </button>
                                            ) : (
                                                <span className="passive-empty-slot">—</span>
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

