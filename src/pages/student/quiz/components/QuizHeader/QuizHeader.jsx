import "./QuizHeader.css";

export default function QuizHeader({ title, subtitle }) {
    return (
        <div className="quiz-list-header">
            <h1>{title}</h1>
            <p>{subtitle}</p>
        </div>
    );
}
