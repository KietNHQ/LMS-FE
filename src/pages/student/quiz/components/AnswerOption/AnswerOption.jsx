import "./AnswerOption.css";

export default function AnswerOption({
    option,
    optionIndex,
    isSelected,
    onChoose,
    letters,
}) {
    return (
        <button
            className={`answer-item ${isSelected ? "selected" : ""}`}
            onClick={onChoose}
            type="button"
        >
            <span className="answer-letter">{letters[optionIndex]}</span>
            <span className="answer-text">{option}</span>
        </button>
    );
}
