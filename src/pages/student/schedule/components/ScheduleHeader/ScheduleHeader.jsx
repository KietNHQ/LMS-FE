import { BsFillSunFill } from "react-icons/bs";
import { FaRegMoon } from "react-icons/fa";
import "./ScheduleHeader.css";

export default function ScheduleHeader({ classNameValue, sessionView, onToggleSessionView }) {
    const isMorning = sessionView === "morning";

    return (
        <div className="schedule-page-header">
            <div className="schedule-page-header__main">
                <div>
                    <p className="schedule-page-header__eyebrow">Thời khóa biểu học sinh</p>
                    <h1>Lớp {classNameValue}</h1>
                </div>
                <button
                    type="button"
                    className={`tt-session-toggle-btn ${isMorning ? "tt-session-toggle-morning" : "tt-session-toggle-afternoon"}`}
                    onClick={onToggleSessionView}
                >
                    <span className="tt-session-toggle-icon-wrap">
                        {isMorning ? (
                            <BsFillSunFill className="tt-session-toggle-icon sun" />
                        ) : (
                            <FaRegMoon className="tt-session-toggle-icon moon" />
                        )}
                    </span>
                    <span className={`tt-session-toggle-label ${isMorning ? "moon" : "sun"}`}>
                        Đổi sang 5 tiết {isMorning ? "chiều" : "sáng"}
                    </span>
                </button>
            </div>
            <p className="schedule-inline-subtitle">
                Giao diện đồng bộ theo lưới quản lý, không hiển thị thao tác tạo hoặc chỉnh sửa.
            </p>
            <div className="schedule-header-legend">
                <span className="schedule-header-chip chip-class">Lớp {classNameValue}</span>
                <span className="schedule-header-chip chip-rescheduled">Đổi lịch</span>
                <span className="schedule-header-chip chip-cancelled">Hủy</span>
                <span className="schedule-header-chip chip-holiday">Nghỉ lễ</span>
                <span className="schedule-header-chip chip-makeup">Học bù</span>
            </div>
        </div>
    );
}
