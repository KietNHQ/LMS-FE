import {
    FiEye,
    FiEyeOff,
    FiEdit2,
    FiTrash2,
    FiClipboard,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { formatDurationLabel } from "../../../../../services/shared/quiz/quizService";
import { Tooltip } from "../../../../../components/ui";
import "./quizListSection.css";

const getCreatorText = (quiz) => {
    if (quiz.createdByRole === "teacher") {
        const teacherName = quiz.createdByName || "Chưa cập nhật";
        return `Người tạo: Giáo viên - ${teacherName}`;
    }

    return "Người tạo: Admin";
};

const GRADING_STATUS_TEXT = {
    "no-submission": "Chưa có bài nộp",
    "in-progress": "Đang chấm",
    ready: "Hoàn tất chấm",
};

export default function QuizListSection({
    quizzes,
    onDelete,
    onStatusChange,
    onEdit,
    onCardClick,
}) {
    const navigate = useNavigate();

    return (
        <div className="quiz-list-section">
            {quizzes && quizzes.length > 0 ? (
                <div className="quiz-list-grid">
                    {quizzes.map((quiz) => (
                        <article
                            key={quiz.id}
                            className={`quiz-card ${
                                quiz.status === "hidden" ? "quiz-card--hidden" : ""
                            }`.trim()}
                            onClick={() => onCardClick?.(quiz)}
                        >
                            <div className="quiz-card__header">
                                <div className="quiz-card__heading">
                                    <h3 className="quiz-card__title">{quiz.title}</h3>
                                </div>
                                <div className="quiz-card__actions">
                                    <Tooltip text="Xem bài đã nộp" position="top">
                                        <button
                                            type="button"
                                            className="quiz-action-btn quiz-action-btn--primary"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                // Admin now uses dedicated admin route
                                                navigate(`/admin/quiz/${quiz.id}/submissions`);
                                            }}
                                        >
                                            <FiClipboard />
                                        </button>
                                    </Tooltip>

                                    <Tooltip 
                                        text={quiz.status === "open" ? "Đang mở - bấm để ẩn" : "Đang ẩn - bấm để mở"}
                                        position="top"
                                    >
                                        <button
                                            type="button"
                                            className={`quiz-action-btn ${
                                                quiz.status === "hidden"
                                                    ? "quiz-action-btn--status-hidden"
                                                    : "quiz-action-btn--status-open"
                                            }`}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                onStatusChange(
                                                    quiz.id,
                                                    quiz.status === "open"
                                                        ? "hidden"
                                                        : "open"
                                                );
                                            }}
                                            aria-label={
                                                quiz.status === "open"
                                                    ? "Đổi trạng thái sang ẩn"
                                                    : "Đổi trạng thái sang mở"
                                            }
                                        >
                                            {quiz.status === "open" ? (
                                                <FiEye />
                                            ) : (
                                                <FiEyeOff />
                                            )}
                                        </button>
                                    </Tooltip>

                                    <Tooltip text="Chỉnh sửa" position="top">
                                        <button
                                            type="button"
                                            className="quiz-action-btn"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                onEdit?.(quiz);
                                            }}
                                        >
                                            <FiEdit2 />
                                        </button>
                                    </Tooltip>

                                    <Tooltip text="Xóa" position="top">
                                        <button
                                            type="button"
                                            className="quiz-action-btn quiz-action-btn--delete"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                onDelete(quiz.id);
                                            }}
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </Tooltip>
                                </div>
                            </div>

                            <div className="quiz-card__chips-row">
                                <div className="quiz-card__chips">
                                    <span className="quiz-chip">{quiz.subject}</span>
                                    <span className="quiz-chip quiz-chip--neutral">
                                        {quiz.grade}
                                    </span>
                                    {quiz.examType ? (
                                        <span className="quiz-chip quiz-chip--outlined">{quiz.examType}</span>
                                    ) : null}
                                </div>

                                <span className="quiz-date">
                                    Tạo ngày: {new Date(quiz.createdAt).toLocaleDateString("vi-VN")}
                                </span>
                            </div>

                            <p className="quiz-card__description">
                                {quiz.description}
                            </p>

                            <p className="quiz-card__creator">{getCreatorText(quiz)}</p>

                            <p className="quiz-card__grading-status">
                                {GRADING_STATUS_TEXT[quiz.gradingStatus] || "Đang cập nhật"}
                                {quiz.submissionCount ? ` - ${quiz.submissionCount} bài nộp` : ""}
                            </p>

                            {quiz.gradingAssignment?.required ? (
                                <p className="quiz-card__assignment">
                                    GV chấm: {quiz.gradingAssignment.assignedTeacherName || "Chưa phân công"}
                                </p>
                            ) : null}

                            <div className="quiz-card__stats">
                                <div className="quiz-stat-item">
                                    <span className="quiz-stat-label">Câu hỏi</span>
                                    <span className="quiz-stat-value">
                                        {quiz.questions}
                                    </span>
                                </div>
                                <div className="quiz-stat-item">
                                    <span className="quiz-stat-label">Thời gian</span>
                                    <span className="quiz-stat-value quiz-stat-value--duration">
                                        {quiz.durationLabel || formatDurationLabel(quiz.duration)}
                                    </span>
                                </div>
                            </div>

                        </article>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <p>Chưa có bài kiểm tra nào</p>
                </div>
            )}

        </div>
    );
}
