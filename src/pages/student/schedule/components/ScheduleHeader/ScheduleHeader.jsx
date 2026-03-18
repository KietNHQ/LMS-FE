import "./ScheduleHeader.css";

export default function ScheduleHeader() {
    return (
        <div className="schedule-page-header">
            <div className="schedule-title-row">
                <h1>Thời khóa biểu</h1>
                <p className="schedule-inline-subtitle">
                    Lịch học theo tuần của <span className="schedule-class-name">Lớp 10A1</span>
                </p>
            </div>
        </div>
    );
}
