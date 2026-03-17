import React from "react";
import { FiArrowDown, FiArrowUp, FiEdit2, FiTrash2 } from "react-icons/fi";
import "./QuizListSection.css";

const answerKeys = ["A", "B", "C", "D"];

export default function QuizListSection({
                                            questions,
                                            onDelete,
                                            onEdit,
                                            onMove,
                                        }) {
    if (!questions.length) {
        return (
            <section className="quiz-empty-state">
                <p>Chưa có câu hỏi nào. Hãy thêm câu hỏi đầu tiên cho bài quiz này.</p>
            </section>
        );
    }

    return (
        <div className="quiz-question-list">
            {questions.map((item, index) => (
                <article key={item.id} className="quiz-question-card">
                    <div className="question-top-row">
                        <div className="question-index">{index + 1}</div>

                        <div className="question-main">
                            <div className="question-header-row">
                                <h3>{item.question}</h3>

                                <div className="question-actions">
                                    <span className="question-score">{item.score} điểm</span>

                                    <button
                                        type="button"
                                        className="question-action-icon-btn"
                                        aria-label="Di chuyển câu hỏi lên trên"
                                        onClick={() => onMove(item.id, "up")}
                                    >
                                        <FiArrowUp aria-hidden="true" />
                                    </button>

                                    <button
                                        type="button"
                                        className="question-action-icon-btn"
                                        aria-label="Di chuyển câu hỏi xuống dưới"
                                        onClick={() => onMove(item.id, "down")}
                                    >
                                        <FiArrowDown aria-hidden="true" />
                                    </button>

                                    <button type="button" onClick={() => onEdit(item)}>
                                        <FiEdit2 aria-hidden="true" />
                                        Sửa
                                    </button>

                                    <button
                                        type="button"
                                        className="danger"
                                        onClick={() => onDelete(item.id)}
                                    >
                                        <FiTrash2 aria-hidden="true" />
                                        Xoá
                                    </button>
                                </div>
                            </div>

                            <div className="question-answers-grid">
                                {answerKeys.map((key) => {
                                    const isCorrect = item.correctAnswer === key;

                                    return (
                                        <div
                                            key={key}
                                            className={`question-answer-item ${isCorrect ? "correct" : ""}`}
                                        >
                      <span className={`answer-badge ${isCorrect ? "correct" : ""}`}>
                        {key}
                      </span>
                                            <span>{item.answers[key]}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
}