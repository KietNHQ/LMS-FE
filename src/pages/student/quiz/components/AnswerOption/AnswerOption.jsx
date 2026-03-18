import React from "react";
import "./AnswerOption.css";

export default function AnswerOption({
                                         label,
                                         option,
                                         selected,
                                         onSelect,
                                         disabled = false,
                                         isCorrect = false,
                                         isWrong = false,
                                         showResult = false,
                                     }) {
    return (
        <button
            type="button"
            className={[
                "answer-option",
                selected ? "selected" : "",
                disabled ? "disabled" : "",
                showResult && isCorrect ? "correct" : "",
                showResult && isWrong ? "wrong" : "",
            ].join(" ")}
            onClick={onSelect}
            disabled={disabled}
        >
            <span className="answer-option-label">{label}</span>
            <span className="answer-option-text">{option}</span>
        </button>
    );
}