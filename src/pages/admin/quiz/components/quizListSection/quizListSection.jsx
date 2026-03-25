import React from "react";
import {
    FiEye,
    FiEyeOff,
    FiEdit2,
    FiTrash2,
} from "react-icons/fi";
import "./quizListSection.css";

const getCreatorText = (quiz) => {
    if (quiz.createdByRole === "teacher") {
        const teacherName = quiz.createdByName || "Chưa cập nhật";
        return `Người tạo: Giáo viên - ${teacherName}`;
    }

    return "Người tạo: Admin";
};

export default function QuizListSection({
    quizzes,
    onDelete,
    onStatusChange,
    onEdit,
    onCardClick,
}) {
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
                                        title={
                                            quiz.status === "open"
                                                ? "Đang mở - bấm để ẩn"
                                                : "Đang ẩn - bấm để mở"
                                        }
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
                                    <button
                                        type="button"
                                        className="quiz-action-btn"
                                        title="Chỉnh sửa"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            onEdit?.(quiz);
                                        }}
                                    >
                                        <FiEdit2 />
                                    </button>
                                    <button
                                        type="button"
                                        className="quiz-action-btn quiz-action-btn--delete"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            onDelete(quiz.id);
                                        }}
                                        title="Xóa"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>

                            <div className="quiz-card__chips-row">
                                <div className="quiz-card__chips">
                                    <span className="quiz-chip">{quiz.subject}</span>
                                    <span className="quiz-chip quiz-chip--neutral">
                                        {quiz.grade}
                                    </span>
                                </div>

                                <span className="quiz-date">
                                    Tạo ngày: {new Date(quiz.createdAt).toLocaleDateString("vi-VN")}
                                </span>
                            </div>

                            <p className="quiz-card__description">
                                {quiz.description}
                            </p>

                            <p className="quiz-card__creator">{getCreatorText(quiz)}</p>

                            <div className="quiz-card__stats">
                                <div className="quiz-stat-item">
                                    <span className="quiz-stat-label">Câu hỏi</span>
                                    <span className="quiz-stat-value">
                                        {quiz.questions}
                                    </span>
                                </div>
                                <div className="quiz-stat-item">
                                    <span className="quiz-stat-label">Thời gian</span>
                                    <span className="quiz-stat-value">
                                        {quiz.duration} phút
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

