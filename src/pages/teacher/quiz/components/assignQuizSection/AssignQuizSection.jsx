import React, { useRef } from "react";
import { FiImage, FiUpload, FiX } from "react-icons/fi";
import "./AssignQuizSection.css";

const choiceKeys = ["A", "B", "C", "D"];
const SCORE_STEP = 0.5;
const MIN_SCORE = 0;

export default function AssignQuizSection({
                                              formData,
                                              editingQuestionId,
                                              questionType = "multiple-choice",
                                              maxScore,
                                              scoreStep = SCORE_STEP,
                                              scorePresets = [],
                                              questionImage,
                                              onChangeQuestionImage,
                                              onChangeQuestionType,
                                              onChangeQuestion,
                                              onChangeAnswer,
                                              onSelectCorrect,
                                              onScoreChange,
                                              onCancel,
                                              onSubmit,
                                          }) {
    const canSwitchQuestionType = typeof onChangeQuestionType === "function";
    const canUploadQuestionImage = typeof onChangeQuestionImage === "function";
    const isEssay = questionType === "essay";
    const hasMaxScore = Number.isFinite(maxScore);
    const questionImageInputRef = useRef(null);

    const normalizedScoreStep =
        Number.isFinite(scoreStep) && scoreStep > 0 ? scoreStep : SCORE_STEP;

    const getSafeScore = () => {
        const parsed = Number.parseFloat(formData.score);
        return Number.isFinite(parsed) ? parsed : MIN_SCORE;
    };

    const updateScoreBy = (delta) => {
        const currentScore = getSafeScore();
        const clampedMax = hasMaxScore ? maxScore : Number.POSITIVE_INFINITY;
        const nextScore = Math.min(
            clampedMax,
            Math.max(MIN_SCORE, Math.round((currentScore + delta) * 100) / 100)
        );
        onScoreChange(String(nextScore));
    };

    const handleScoreInputChange = (value) => {
        if (value === "") {
            onScoreChange("");
            return;
        }

        const parsed = Number.parseFloat(value);
        if (!Number.isFinite(parsed)) return;

        const clampedMax = hasMaxScore ? maxScore : Number.POSITIVE_INFINITY;
        const normalized = Math.min(clampedMax, Math.max(MIN_SCORE, parsed));
        onScoreChange(String(normalized));
    };

    const handleOpenImagePicker = () => {
        questionImageInputRef.current?.click();
    };

    const handleQuestionImageFileChange = (event) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) return;

        if (!selectedFile.type.startsWith("image/")) {
            alert("Vui lòng chọn file ảnh hợp lệ.");
            return;
        }

        onChangeQuestionImage?.(selectedFile);

        event.target.value = "";
    };

    return (
        <section className="add-question-card">
            <div className="add-question-header add-question-header--row">
                <h3>{editingQuestionId ? "Chỉnh sửa câu hỏi" : "Câu hỏi mới"}</h3>

                {canSwitchQuestionType ? (
                    <div className="question-type-toggle" role="group" aria-label="Chọn loại câu hỏi">
                        <button
                            type="button"
                            className={`question-type-btn ${!isEssay ? "active" : ""}`.trim()}
                            onClick={() => onChangeQuestionType("multiple-choice")}
                        >
                            Trắc nghiệm
                        </button>

                        <button
                            type="button"
                            className={`question-type-btn ${isEssay ? "active" : ""}`.trim()}
                            onClick={() => onChangeQuestionType("essay")}
                        >
                            Tự luận
                        </button>
                    </div>
                ) : null}
            </div>

            <div className="quiz-form-group">
                <label htmlFor="quiz-question-input">Câu hỏi</label>

                {canUploadQuestionImage ? (
                    <div className="question-image-actions">
                        <button
                            type="button"
                            className="question-image-upload-btn"
                            onClick={handleOpenImagePicker}
                        >
                            <FiUpload aria-hidden="true" />
                            <span>Up ảnh câu hỏi</span>
                        </button>

                        <input
                            ref={questionImageInputRef}
                            type="file"
                            accept="image/*"
                            className="question-image-input-hidden"
                            onChange={handleQuestionImageFileChange}
                        />
                    </div>
                ) : null}

                <input
                    id="quiz-question-input"
                    type="text"
                    placeholder="Nhập câu hỏi..."
                    value={formData.question}
                    onChange={(e) => onChangeQuestion(e.target.value)}
                />

                {canUploadQuestionImage ? (
                    questionImage ? (
                        <div className="question-image-preview-card">
                            <img src={questionImage} alt="Ảnh minh họa câu hỏi" />

                            <button
                                type="button"
                                className="question-image-remove-btn"
                                onClick={() => onChangeQuestionImage("")}
                            >
                                <FiX aria-hidden="true" />
                                Bỏ ảnh
                            </button>
                        </div>
                    ) : (
                        <div className="question-image-empty-hint">
                            <FiImage aria-hidden="true" />
                            <span>Chưa có ảnh minh họa cho câu hỏi</span>
                        </div>
                    )
                ) : null}
            </div>

            {!isEssay && (
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
            )}

            <div className="quiz-form-group score-group">
                <label htmlFor="quiz-score-input">Điểm</label>

                <div className="score-stepper">
                    <button
                        type="button"
                        className="score-stepper-btn"
                        onClick={() => updateScoreBy(-normalizedScoreStep)}
                        aria-label="Giảm điểm"
                        disabled={getSafeScore() <= MIN_SCORE}
                    >
                        -
                    </button>

                    <input
                        id="quiz-score-input"
                        type="number"
                        min="0"
                        max={hasMaxScore ? maxScore : undefined}
                        step={normalizedScoreStep}
                        value={formData.score}
                        onChange={(e) => handleScoreInputChange(e.target.value)}
                    />

                    <button
                        type="button"
                        className="score-stepper-btn"
                        onClick={() => updateScoreBy(normalizedScoreStep)}
                        aria-label="Tăng điểm"
                        disabled={hasMaxScore && getSafeScore() >= maxScore}
                    >
                        +
                    </button>
                </div>

                {scorePresets.length ? (
                    <div className="score-presets" role="group" aria-label="Mức điểm gợi ý">
                        {scorePresets.map((preset) => {
                            const numericPreset = Number(preset);
                            if (!Number.isFinite(numericPreset)) return null;

                            const isActive = Number(formData.score) === numericPreset;

                            return (
                                <button
                                    key={String(numericPreset)}
                                    type="button"
                                    className={`score-preset-btn ${isActive ? "active" : ""}`.trim()}
                                    onClick={() => onScoreChange(String(numericPreset))}
                                >
                                    {numericPreset}
                                </button>
                            );
                        })}
                    </div>
                ) : null}
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
