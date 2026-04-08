import {
    FiEye,
    FiEyeOff,
    FiEdit2,
    FiTrash2,
    FiClipboard,
    FiLock,
    FiUnlock,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { formatDurationLabel } from "../../../../../services/shared/quiz/quizService";
import { Tooltip } from "../../../../../components/ui";
import "./TeacherQuizListSection.css";

const getCreatorText = (quiz) => {
    if (quiz.createdByRole === "teacher") {
        const teacherName = quiz.createdByName || "Chưa cập nhật";
        return `Người tạo: Giáo viên - ${teacherName}`;
    }

    return "Người tạo: Admin";
};

export default function TeacherQuizListSection({
    quizzes,
    onDelete,
    onStatusChange,
    onEdit,
    onCardClick,
    onOpenSubmissionReview,
    onLockToggle,
}) {
    const navigate = useNavigate();

    return (
        <div className="teacher-quiz-list-section">
            {quizzes && quizzes.length > 0 ? (
                <div className="teacher-quiz-list-grid">
                    {quizzes.map((quiz) => {
                        const hasSubmissions = (quiz.submissions?.length || 0) > 0;

                        return (
                        <article
                            key={quiz.id}
                            className={`teacher-quiz-card ${
                                quiz.status === "hidden" ? "teacher-quiz-card--hidden" : ""
                            } ${quiz.isLocked ? "teacher-quiz-card--locked" : ""}`.trim()}
                            onClick={() => onCardClick?.(quiz)}
                        >
                            <div className="teacher-quiz-card__header">
                                <div className="teacher-quiz-card__heading">
                                    <h3 className="teacher-quiz-card__title">{quiz.title}</h3>
                                </div>
                                <div className="teacher-quiz-card__actions">
                                    <Tooltip text="Xem bài đã nộp" position="top">
                                        <button
                                            type="button"
                                            className="teacher-quiz-action-btn teacher-quiz-action-btn--primary"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                navigate(`/teacher/quiz/${quiz.id}/submissions`);
                                            }}
                                            disabled={!hasSubmissions}
                                        >
                                            <FiClipboard />
                                            <span>Bài nộp</span>
                                        </button>
                                    </Tooltip>

                                    <Tooltip 
                                        text={quiz.status === "open" ? "Đang mở - bấm để ẩn" : "Đang ẩn - bấm để mở"} 
                                        position="top"
                                    >
                                        <button
                                            type="button"
                                            className={`teacher-quiz-action-btn ${
                                                quiz.status === "hidden"
                                                    ? "teacher-quiz-action-btn--status-hidden"
                                                    : "teacher-quiz-action-btn--status-open"
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

                                    <Tooltip 
                                        text={quiz.isLocked ? "Bấm để mở khóa làm bài" : "Bấm để khóa bài làm"} 
                                        position="top"
                                    >
                                        <button
                                            type="button"
                                            className={`teacher-quiz-action-btn ${
                                                quiz.isLocked
                                                    ? "teacher-quiz-action-btn--locked"
                                                    : "teacher-quiz-action-btn--unlocked"
                                            }`}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                onLockToggle?.(quiz.id, !quiz.isLocked);
                                            }}
                                            aria-label={
                                                quiz.isLocked
                                                    ? "Mở khóa bài làm"
                                                    : "Khóa bài làm"
                                            }
                                        >
                                            {quiz.isLocked ? (
                                                <FiLock />
                                            ) : (
                                                <FiUnlock />
                                            )}
                                        </button>
                                    </Tooltip>

                                    <Tooltip text="Chỉnh sửa" position="top">
                                        <button
                                            type="button"
                                            className="teacher-quiz-action-btn"
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
                                            className="teacher-quiz-action-btn teacher-quiz-action-btn--delete"
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

                            <div className="teacher-quiz-card__chips-row">
                                <div className="teacher-quiz-card__chips">
                                    {quiz.className && (
                                        <span className="teacher-quiz-chip teacher-quiz-chip--class">
                                            Lớp: {quiz.className}
                                        </span>
                                    )}
                                    <span className="teacher-quiz-chip">{quiz.subject}</span>
                                    <span className="teacher-quiz-chip teacher-quiz-chip--neutral">
                                        {quiz.grade}
                                    </span>
                                    {quiz.examType ? (
                                        <span className="teacher-quiz-chip teacher-quiz-chip--outlined">
                                            {quiz.examType}
                                        </span>
                                    ) : null}
                                    {quiz.isLocked && (
                                        <span className="teacher-quiz-chip teacher-quiz-chip--error">
                                            <FiLock style={{ fontSize: '10px', marginRight: '4px' }} />
                                            Đã khóa
                                        </span>
                                    )}
                                </div>

                                <span className="teacher-quiz-date">
                                    Tạo ngày: {new Date(quiz.createdAt).toLocaleDateString("vi-VN")}
                                </span>
                            </div>

                            <p className="teacher-quiz-card__description">
                                {quiz.description}
                            </p>

                            <p className="teacher-quiz-card__creator">{getCreatorText(quiz)}</p>

                            {hasSubmissions ? (
                                <p className="teacher-quiz-card__grading-status">
                                    Đã nộp: {quiz.submissions.length} - {quiz.isScoreReadyForGradebook ? "Đã hoàn tất chấm" : "Đang chờ chấm tự luận"}
                                </p>
                            ) : (
                                <p className="teacher-quiz-card__grading-status teacher-quiz-card__grading-status--muted">
                                    Chưa có học sinh nộp bài.
                                </p>
                            )}

                            {quiz.gradingAssignment?.required ? (
                                <p className="teacher-quiz-card__assignment">
                                    Phân công chấm: {quiz.gradingAssignment.assignedTeacherName || "Chưa phân công"}
                                </p>
                            ) : null}

                            <div className="teacher-quiz-card__stats">
                                <div className="teacher-quiz-stat-item">
                                    <span className="teacher-quiz-stat-label">Câu hỏi</span>
                                    <span className="teacher-quiz-stat-value">
                                        {quiz.questions}
                                    </span>
                                </div>
                                <div className="teacher-quiz-stat-item">
                                    <span className="teacher-quiz-stat-label">Thời gian</span>
                                    <span className="teacher-quiz-stat-value teacher-quiz-stat-value--duration">
                                        {quiz.durationLabel || formatDurationLabel(quiz.duration)}
                                    </span>
                                </div>
                            </div>

                        </article>
                    );})}
                </div>
            ) : (
                <div className="teacher-quiz-empty-state">
                    <p>Chưa có bài kiểm tra nào</p>
                </div>
            )}

        </div>
    );
}
