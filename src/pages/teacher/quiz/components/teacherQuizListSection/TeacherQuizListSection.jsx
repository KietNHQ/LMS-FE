import React from "react";
import {
    FiEye,
    FiEyeOff,
    FiEdit2,
    FiTrash2,
} from "react-icons/fi";
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
}) {
    return (
        <div className="teacher-quiz-list-section">
            {quizzes && quizzes.length > 0 ? (
                <div className="teacher-quiz-list-grid">
                    {quizzes.map((quiz) => (
                        <article
                            key={quiz.id}
                            className={`teacher-quiz-card ${
                                quiz.status === "hidden" ? "teacher-quiz-card--hidden" : ""
                            }`.trim()}
                            onClick={() => onCardClick?.(quiz)}
                        >
                            <div className="teacher-quiz-card__header">
                                <div className="teacher-quiz-card__heading">
                                    <h3 className="teacher-quiz-card__title">{quiz.title}</h3>
                                </div>
                                <div className="teacher-quiz-card__actions">
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
                                        className="teacher-quiz-action-btn"
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
                                        className="teacher-quiz-action-btn teacher-quiz-action-btn--delete"
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

                            <div className="teacher-quiz-card__chips-row">
                                <div className="teacher-quiz-card__chips">
                                    <span className="teacher-quiz-chip">{quiz.subject}</span>
                                    <span className="teacher-quiz-chip teacher-quiz-chip--neutral">
                                        {quiz.grade}
                                    </span>
                                </div>

                                <span className="teacher-quiz-date">
                                    Tạo ngày: {new Date(quiz.createdAt).toLocaleDateString("vi-VN")}
                                </span>
                            </div>

                            <p className="teacher-quiz-card__description">
                                {quiz.description}
                            </p>

                            <p className="teacher-quiz-card__creator">{getCreatorText(quiz)}</p>

                            <div className="teacher-quiz-card__stats">
                                <div className="teacher-quiz-stat-item">
                                    <span className="teacher-quiz-stat-label">Câu hỏi</span>
                                    <span className="teacher-quiz-stat-value">
                                        {quiz.questions}
                                    </span>
                                </div>
                                <div className="teacher-quiz-stat-item">
                                    <span className="teacher-quiz-stat-label">Thời gian</span>
                                    <span className="teacher-quiz-stat-value">
                                        {quiz.duration} phút
                                    </span>
                                </div>
                            </div>

                        </article>
                    ))}
                </div>
            ) : (
                <div className="teacher-quiz-empty-state">
                    <p>Chưa có bài kiểm tra nào</p>
                </div>
            )}

        </div>
    );
}
