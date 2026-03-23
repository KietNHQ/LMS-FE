import React from "react";
import { FiEye, FiEdit2, FiTrash2 } from "react-icons/fi";
import "./quizListSection.css";

const statusOptions = [
    { value: "open", label: "Mở", color: "is-open" },
    { value: "hidden", label: "Ẩn", color: "is-hidden" },
];

export default function QuizListSection({
    quizzes,
    onView,
    onDelete,
    onStatusChange,
}) {
    return (
        <div className="quiz-list-section">
            {quizzes && quizzes.length > 0 ? (
                <div className="quiz-list-grid">
                    {quizzes.map((quiz) => (
                        <article key={quiz.id} className="quiz-card">
                            <div className="quiz-card__header">
                                <h3 className="quiz-card__title">{quiz.title}</h3>
                                <div className="quiz-card__actions">
                                    <button
                                        type="button"
                                        className="quiz-action-btn"
                                        onClick={() => onView(quiz)}
                                        title="Xem chi tiết"
                                    >
                                        <FiEye />
                                    </button>
                                    <button
                                        type="button"
                                        className="quiz-action-btn"
                                        title="Chỉnh sửa"
                                    >
                                        <FiEdit2 />
                                    </button>
                                    <button
                                        type="button"
                                        className="quiz-action-btn quiz-action-btn--delete"
                                        onClick={() => onDelete(quiz.id)}
                                        title="Xóa"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>

                            <p className="quiz-card__description">{quiz.description}</p>

                            <div className="quiz-card__meta">
                                <div className="meta-item">
                                    <span className="meta-label">Môn:</span>
                                    <span className="meta-value">{quiz.subject}</span>
                                </div>
                                <div className="meta-item">
                                    <span className="meta-label">Khối:</span>
                                    <span className="meta-value">{quiz.grade}</span>
                                </div>
                                <div className="meta-item">
                                    <span className="meta-label">Câu hỏi:</span>
                                    <span className="meta-value">{quiz.questions}</span>
                                </div>
                                <div className="meta-item">
                                    <span className="meta-label">Thời gian:</span>
                                    <span className="meta-value">{quiz.duration} phút</span>
                                </div>
                            </div>

                            <div className="quiz-card__footer">
                                <select
                                    value={quiz.status}
                                    onChange={(e) =>
                                        onStatusChange(quiz.id, e.target.value)
                                    }
                                    className={`quiz-status-select ${
                                        statusOptions.find(
                                            (s) => s.value === quiz.status
                                        )?.color || ""
                                    }`}
                                >
                                    {statusOptions.map((status) => (
                                        <option
                                            key={status.value}
                                            value={status.value}
                                        >
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
                                <span className="quiz-date">
                                    {new Date(quiz.createdAt).toLocaleDateString(
                                        "vi-VN"
                                    )}
                                </span>
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

