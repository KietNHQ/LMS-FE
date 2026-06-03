import React from "react";
import "./QuestionItem.css";
import AnswerOption from "../AnswerOption/AnswerOption";

function normalizeQuestionText(question) {
    return question.text || question.question_text || question.question || "";
}

function normalizeQuestionImage(question) {
    if (question.questionImage) return question.questionImage;
    if (question.imageUrl) return question.imageUrl;
    if (question.image) return question.image;

    const payload = question.payload;
    if (payload && typeof payload === "object") {
        return payload.questionImage || "";
    }

    return "";
}

function normalizeOptions(question) {
    const options = question.options || question.answers || question.quiz_answers || [];
    return options.map((option) => {
        if (typeof option === "string") return option;
        return option.answer_text || option.text || option.label || "";
    });
}

function normalizeCorrectAnswer(question) {
    if (question.correctAnswer) return question.correctAnswer;

    const options = question.answers || question.quiz_answers || [];
    const correctOption = options.find((option) => option && option.is_correct);
    if (correctOption) {
        return correctOption.answer_text || correctOption.text || correctOption.label || "";
    }

    return "";
}

function normalizeQuestionType(question) {
    const rawType = question.type || question.questionType || question.question_type || "";
    return String(rawType).trim().toLowerCase();
}

export default function QuestionItem({
                                         question,
                                         index,
                                         selectedAnswer,
                                         onChoose,
                                         disabled = false,
                                         showResult = false,
                                     }) {
    const labels = ["A", "B", "C", "D"];
    const questionText = normalizeQuestionText(question);
    const questionImage = normalizeQuestionImage(question);
    const options = normalizeOptions(question);
    const correctAnswer = normalizeCorrectAnswer(question);
    const questionType = normalizeQuestionType(question);
    const isEssayQuestion = questionType === "essay";

    return (
        <div className="question-item">
            <div className="question-item-header">
                <span className="question-item-number">Câu {index + 1}</span>
                <h3>{questionText}</h3>
            </div>

            {questionImage ? (
                <div className="question-item-image-wrap">
                    <img className="question-item-image" src={questionImage} alt={questionText} />
                </div>
            ) : null}

            {isEssayQuestion ? (
                <div className="question-item-essay">
                    <textarea
                        className="question-item-essay-input"
                        placeholder="Nhập câu trả lời tự luận của bạn..."
                        value={selectedAnswer || ""}
                        onChange={(event) => onChoose(question.id, event.target.value)}
                        disabled={disabled}
                        rows={6}
                    />
                </div>
            ) : (
                <div className="question-item-options">
                    {options.map((option, optionIndex) => (
                        <AnswerOption
                            key={optionIndex}
                            label={labels[optionIndex]}
                            option={option}
                            selected={selectedAnswer === option}
                            onSelect={() => onChoose(question.id, option)}
                            disabled={disabled}
                            showResult={showResult}
                            isCorrect={correctAnswer === option}
                            isWrong={
                                selectedAnswer === option && correctAnswer !== option
                            }
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

