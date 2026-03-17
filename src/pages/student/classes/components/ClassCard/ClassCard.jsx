import "./ClassCard.css";

export default function ClassCard({ item, onViewClassDetail }) {
    const examPreview = item.assignments?.[0]?.title || "Chưa có bài kiểm tra sắp tới";

    return (
        <article
            className="student-class-card"
            onClick={() => onViewClassDetail(item.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onViewClassDetail(item.id);
                }
            }}
        >
            <div className="student-class-card-top">
                <div>
                    <span className="student-class-tag">{item.className}</span>
                    <h3>{item.title}</h3>
                </div>

                <span className="student-class-pending">
                    {item.assignmentsPending} chưa hoàn thành
                </span>
            </div>

            <ul className="student-class-info-list">
                <li>Giáo viên: {item.teacher}</li>
                <li>Lịch học: {item.schedule}</li>
                <li>
                    Đã học: {item.completedLessons}/{item.totalLessons} buổi
                </li>
            </ul>

            <div className="student-class-progress-wrap">
                <div className="student-class-progress-label">
                    <span>Tiến độ môn học</span>
                    <strong>{item.progress}%</strong>
                </div>

                <div className="student-class-progress-track">
                    <div style={{ width: `${item.progress}%` }} />
                </div>
            </div>

            <div className="student-class-highlight">
                <span className="student-class-highlight-label">Bài nổi bật</span>
                <p>{examPreview}</p>
            </div>

            <div className="student-class-card-actions">
                <button
                    type="button"
                    className="student-class-secondary-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        onViewClassDetail(item.id);
                    }}
                >
                    Xem chi tiết lớp học
                </button>
            </div>
        </article>
    );
}
