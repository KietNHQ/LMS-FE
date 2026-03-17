import React from "react";
import "./AssignQuizSection.css";

const choiceKeys = ["A", "B", "C", "D"];

export default function AssignQuizSection({
                                              formData,
                                              editingQuestionId,
                                              onChangeQuestion,
                                              onChangeAnswer,
                                              onSelectCorrect,
                                              onScoreChange,
                                              onCancel,
                                              onSubmit,
                                          }) {
    return (
        <section className="add-question-card">
            <div className="add-question-header">
                <h3>{editingQuestionId ? "Chỉnh sửa câu hỏi" : "Câu hỏi mới"}</h3>
            </div>

            <div className="quiz-form-group">
                <label htmlFor="quiz-question-input">Câu hỏi</label>
                <input
                    id="quiz-question-input"
                    type="text"
                    placeholder="Nhập câu hỏi..."
                    value={formData.question}
                    onChange={(e) => onChangeQuestion(e.target.value)}
                />
            </div>

            <div className="quiz-form-group">
                <label>Các đáp án (chọn đáp án đúng)</label>

                <div className="answers-grid">
                    {choiceKeys.map((key) => {
                        const isCorrect = formData.correctAnswer === key;

                        return (
                            <div
                                key={key}
                                className={`answer-input-wrap ${isCorrect ? "correct" : ""}`}
                            >
                                <button
                                    type="button"
                                    className={`answer-key ${isCorrect ? "correct" : ""}`}
                                    onClick={() => onSelectCorrect(key)}
                                    title={`Chọn đáp án ${key} là đáp án đúng`}
                                >
                                    {key}
                                </button>

                                <input
                                    type="text"
                                    placeholder={`Đáp án ${key}`}
                                    value={formData.answers[key]}
                                    onChange={(e) => onChangeAnswer(key, e.target.value)}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="quiz-form-group score-group">
                <label htmlFor="quiz-score-input">Điểm</label>
                <input
                    id="quiz-score-input"
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.score}
                    onChange={(e) => onScoreChange(e.target.value)}
                />
            </div>

            <div className="quiz-form-actions">
                <button type="button" className="cancel-btn" onClick={onCancel}>
                    Huỷ
                </button>

                <button type="button" className="submit-btn" onClick={onSubmit}>
                    {editingQuestionId ? "Cập nhật câu hỏi" : "Thêm câu hỏi"}
                </button>
            </div>
        </section>
    );
}