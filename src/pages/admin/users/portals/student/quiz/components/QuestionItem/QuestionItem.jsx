import React from "react";
import "./QuestionItem.css";
import AnswerOption from "../../AnswerOption/AnswerOption";

export default function QuestionItem({
                                         question,
                                         index,
                                         selectedAnswer,
                                         onChoose,
                                         disabled = false,
                                         showResult = false,
                                     }) {
    const labels = ["A", "B", "C", "D"];

    return (
        <div className="question-item">
            <div className="question-item-header">
                <span className="question-item-number">Câu {index + 1}</span>
                <h3>{question.text}</h3>
            </div>

            <div className="question-item-options">
                {question.options.map((option, optionIndex) => (
                    <AnswerOption
                        key={option}
                        label={labels[optionIndex]}
                        option={option}
                        selected={selectedAnswer === option}
                        onSelect={() => onChoose(question.id, option)}
                        disabled={disabled}
                        showResult={showResult}
                        isCorrect={question.correctAnswer === option}
                        isWrong={
                            selectedAnswer === option && question.correctAnswer !== option
                        }
                    />
                ))}
            </div>
        </div>
    );
}
