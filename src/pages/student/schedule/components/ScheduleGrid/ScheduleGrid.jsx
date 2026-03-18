import React from "react";
import WbSunnyRoundedIcon from "@mui/icons-material/WbSunnyRounded";
import WbTwilightRoundedIcon from "@mui/icons-material/WbTwilightRounded";
import SubjectCard from "../SubjectCard/SubjectCard";
import "./ScheduleGrid.css";

export default function ScheduleGrid({ days, periods, getLesson, getAssessmentIcon }) {
    return (
        <div className="schedule-board-wrapper">
            <div className="schedule-board-scroller">
                <div className="schedule-board">
                    <div className="schedule-grid schedule-grid-header">
                        <div className="grid-head time-head">TIẾT / NGÀY</div>
                        {days.map((day) => (
                            <div key={day.key} className="grid-head">
                                {day.label}
                            </div>
                        ))}
                    </div>

                    {periods.map((p, idx) => {
                        const isFirstMorning =
                            p.session === "Sáng" &&
                            (idx === 0 || periods[idx - 1].session !== "Sáng");
                        const isFirstAfternoon =
                            p.session === "Chiều" &&
                            (idx === 0 || periods[idx - 1].session === "Sáng");

                        return (
                            <React.Fragment key={p.period}>
                                {isFirstMorning && (
                                    <div className="schedule-session-divider morning-divider">
                                        <div className="session-div-line" />
                                        <div className="session-div-chip morning-chip">
                                            <WbSunnyRoundedIcon className="session-div-icon" />
                                            <span className="session-div-label">Buổi sáng</span>
                                            <span className="session-div-badge">Tiết 1–5</span>
                                        </div>
                                        <div className="session-div-line" />
                                    </div>
                                )}
                                {isFirstAfternoon && (
                                    <div className="schedule-session-divider afternoon-divider">
                                        <div className="session-div-line afternoon-line" />
                                        <div className="session-div-chip afternoon-chip">
                                            <WbTwilightRoundedIcon className="session-div-icon" />
                                            <span className="session-div-label">Buổi chiều</span>
                                            <span className="session-div-badge">Tiết 6–10</span>
                                        </div>
                                        <div className="session-div-line afternoon-line" />
                                    </div>
                                )}

                                <div
                                    className={`schedule-grid schedule-grid-row ${
                                        p.session === "Sáng" ? "session-morning" : "session-afternoon"
                                    }`}
                                >
                                    <div className="time-cell">
                                        <div className="period-label">Tiết {p.period}</div>
                                        <div className="period-time">
                                            {p.start} - {p.end}
                                        </div>
                                    </div>

                                    {days.map((day) => {
                                        const lesson = getLesson(day.key, p.period);

                                        return (
                                            <div className="lesson-cell" key={`${day.key}-${p.period}`}>
                                                {lesson ? (
                                                    <SubjectCard
                                                        lesson={lesson}
                                                        getAssessmentIcon={getAssessmentIcon}
                                                    />
                                                ) : (
                                                    <div className="lesson-empty">-</div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
