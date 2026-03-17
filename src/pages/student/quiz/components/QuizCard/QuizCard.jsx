import { FiClock, FiChevronRight, FiAward } from "react-icons/fi";
import "./QuizCard.css";

export default function QuizCard({
    quiz,
    hasDone,
    canStart,
    getStatusLabel,
    getButtonText,
    onStart,
    onReview,
}) {
    return (
        <div className="quiz-card">
            <div className="quiz-card-top">
                <div className="quiz-card-icon">
                    <FiAward />
                </div>

                <div className="quiz-card-title-wrap">
                    <h3>{quiz.title}</h3>
                    <p>
                        {quiz.subject} • {quiz.className}
                    </p>
                </div>
            </div>

            <div className="quiz-meta">
                <span>
                    <FiClock /> {quiz.duration} phút
                </span>
                <span>{quiz.questionCount} câu hỏi</span>
                <span className={`quiz-badge ${quiz.status}`}>{getStatusLabel(quiz.status)}</span>
            </div>

            <div className="quiz-deadline">Hạn nộp: {quiz.deadline}</div>

            {hasDone ? (
                <button className="quiz-main-btn" onClick={onReview} type="button">
                    Review <FiChevronRight />
                </button>
            ) : canStart ? (
                <button className="quiz-main-btn" onClick={onStart} type="button">
                    {getButtonText(quiz)} <FiChevronRight />
                </button>
            ) : (
                <button className="quiz-disabled-btn" disabled type="button">
                    {getButtonText(quiz)}
                </button>
            )}
        </div>
    );
}
