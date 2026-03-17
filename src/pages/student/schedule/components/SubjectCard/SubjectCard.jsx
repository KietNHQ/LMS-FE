import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import "./SubjectCard.css";

export default function SubjectCard({ lesson, getAssessmentIcon }) {
    return (
        <div className={`lesson-pill ${lesson.color}`}>
            <div className="lesson-header">
                <div className="lesson-subject">{lesson.subject}</div>
                {getAssessmentIcon(lesson.assessment)}
            </div>
            <div className="lesson-room">{lesson.room}</div>

            <div className="lesson-extra">
                <span>
                    <SchoolRoundedIcon />
                    {lesson.teacher}
                </span>
                <span>
                    <AccessTimeRoundedIcon />
                    {lesson.start} - {lesson.end}
                </span>
            </div>

            <div className="lesson-tooltip">
                <p>
                    <strong>Topic:</strong> {lesson.lessonTopic}
                </p>
                <p>
                    <strong>Class activity:</strong> {lesson.activity}
                </p>
                <p>
                    <strong>Assessment:</strong> {lesson.assessment}
                </p>
            </div>
        </div>
    );
}
