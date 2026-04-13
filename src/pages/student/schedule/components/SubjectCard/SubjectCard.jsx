import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import "./SubjectCard.css";

const subjectViMap = {
    Mathematics: "Toán học",
    Physics: "Vật lý",
    Chemistry: "Hóa học",
    Literature: "Ngữ văn",
    English: "Tiếng Anh",
    Art: "Mỹ thuật",
    "Physical Education": "Thể dục",
    Music: "Âm nhạc",
    Informatics: "Tin học",
    Biology: "Sinh học",
    History: "Lịch sử",
    Geography: "Địa lý",
    "Civic Education": "Giáo dục công dân",
};

const assessmentViMap = {
    "No assessment": "Không đánh giá",
    "Oral check": "Kiểm tra miệng",
    "15-minute quiz": "Kiểm tra 15 phút",
    "One-period test": "Kiểm tra 1 tiết",
    "Practical test": "Kiểm tra thực hành",
    "Project review": "Đánh giá dự án",
    "Project presentation": "Thuyết trình dự án",
    "Portfolio review": "Đánh giá hồ sơ",
    "Performance test": "Đánh giá biểu diễn",
    "Essay review": "Đánh giá bài viết",
    "Presentation review": "Đánh giá thuyết trình",
};

function toVietnameseSubject(subject) {
    return subjectViMap[subject] || subject;
}

function toVietnameseAssessment(assessment) {
    return assessmentViMap[assessment] || assessment;
}

export default function SubjectCard({ lesson, getAssessmentIcon }) {
    const displaySubject = toVietnameseSubject(lesson.subject);
    const displayAssessment = toVietnameseAssessment(lesson.assessment);

    return (
        <div className={`lesson-pill ${lesson.color}`}>
            <div className="lesson-header">
                <div className="lesson-subject">{displaySubject}</div>
                {getAssessmentIcon(displayAssessment)}
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
                    <strong>Chủ đề:</strong> {lesson.lessonTopic}
                </p>
                <p>
                    <strong>Hoạt động lớp:</strong> {lesson.activity}
                </p>
                <p>
                    <strong>Kiểm tra:</strong> {displayAssessment}
                </p>
            </div>
        </div>
    );
}
