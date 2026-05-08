import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import "./SubjectCard.css";
function getStatusTone(status = "") {
    const normalized = String(status).toLowerCase();
    if (normalized.includes("huy")) return "cancelled";
    if (normalized.includes("doi")) return "rescheduled";
    if (normalized.includes("nghi")) return "holiday";
    if (normalized.includes("bu")) return "makeup";
    return "normal";
}

function getStatusLabel(status = "") {
    const normalized = String(status).toLowerCase();
    if (normalized.includes("huy")) return "Hủy";
    if (normalized.includes("doi")) return "Đổi lịch";
    if (normalized.includes("nghi")) return "Nghỉ lễ";
    if (normalized.includes("bu")) return "Học bù";
    return "Bình thường";
}

export default function SubjectCard({ lesson, getAssessmentIcon }) {
    const statusTone = getStatusTone(lesson.status);
    const timeRange = lesson.timeRange || `${lesson.start} - ${lesson.end}`;

    return (
        <div className={`lesson-pill ${lesson.color} lesson-pill--${statusTone}`}>
            <div className="lesson-header">
                <div className="lesson-subject">{lesson.subject}</div>
                <span className={`lesson-status status-${statusTone}`}>{getStatusLabel(lesson.status)}</span>
            </div>
            <div className="lesson-room">Phòng {lesson.room}</div>

            <div className="lesson-extra">
                <span>
                    <SchoolRoundedIcon />
                    {lesson.teacher}
                </span>
                <span>
                    <AccessTimeRoundedIcon />
                    {timeRange}
                </span>
                {lesson.className && (
                    <span>
                        <SchoolRoundedIcon />
                        {lesson.className}
                    </span>
                )}
            </div>

            <div className="lesson-note">{lesson.note || "Không có ghi chú"}</div>

            {lesson.lessonTopic || lesson.activity || getAssessmentIcon ? (
                <div className="lesson-tooltip">
                    {lesson.lessonTopic ? (
                        <p>
                            <strong>Chủ đề:</strong> {lesson.lessonTopic}
                        </p>
                    ) : null}
                    {lesson.activity ? (
                        <p>
                            <strong>Hoạt động:</strong> {lesson.activity}
                        </p>
                    ) : null}
                    {getAssessmentIcon ? <p className="lesson-tooltip-muted">Tiết học chỉ xem</p> : null}
                </div>
            ) : null}
        </div>
    );
}

