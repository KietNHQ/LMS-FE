import AnswerOption from "../AnswerOption/AnswerOption";
import "./QuestionItem.css";

export default function QuestionItem({ question, index, answers, onChooseAnswer, letters }) {
    return (
        <div className="question-card">
            <div className="question-title">
                <span>
                    {index + 1}. {question.text}
                </span>
                <strong>({question.point} điểm)</strong>
            </div>

            <div className="answer-list">
                {question.options.map((option, optionIndex) => {
                    const isSelected = answers[question.id] === optionIndex;

                    return (
                        <AnswerOption
                            key={optionIndex}
                            option={option}
                            optionIndex={optionIndex}
                            isSelected={isSelected}
                            onChoose={() => onChooseAnswer(question.id, optionIndex)}
                            letters={letters}
                        />
                    );
                })}
            </div>
        </div>
    );
}
