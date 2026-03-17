import "./ScheduleHeader.css";

export default function ScheduleHeader() {
    return (
        <div className="schedule-page-header">
            <div className="schedule-title-row">
                <h1>Class Schedule</h1>
                <p className="schedule-inline-subtitle">
                    Weekly timetable for <span className="schedule-class-name">Grade 10A1</span>
                </p>
            </div>
        </div>
    );
}
