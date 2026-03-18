import React, { useMemo, useState } from "react";
import { BiArrowBack, BiCheckCircle } from "react-icons/bi";
import "./QuizTakingView.css";
import QuestionItem from "../QuestionItem/QuestionItem";

export default function QuizTakingView({ quiz, onBack, onSubmit }) {
    const [answers, setAnswers] = useState({});

    const answeredCount = useMemo(() => {
        return Object.keys(answers).length;
    }, [answers]);

    const progress = useMemo(() => {
        if (!quiz.questions.length) return 0;
        return Math.round((answeredCount / quiz.questions.length) * 100);
    }, [answeredCount, quiz.questions.length]);

    const handleChoose = (questionId, option) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: option,
        }));
    };

    const handleSubmit = () => {
        onSubmit(quiz, answers);
    };

    return (
        <div className="quiz-taking-view">
            <div className="quiz-taking-topbar">
                <button className="quiz-back-btn" onClick={onBack}>
                    <BiArrowBack />
                    <span>Quay lại danh sách</span>
                </button>

                <div className="quiz-progress-card">
                    <span>Tiến độ</span>
                    <strong>
                        {answeredCount}/{quiz.questions.length} câu
                    </strong>
                </div>
            </div>

            <div className="quiz-taking-header">
                <div>
                    <span className="quiz-taking-badge">{quiz.subject}</span>
                    <h1>{quiz.title}</h1>
                    <p>
                        Giáo viên: {quiz.teacher} · Thời lượng: {quiz.duration} phút
                    </p>
                </div>

                <div className="quiz-taking-progress">
                    <div className="quiz-taking-progress-bar">
                        <div
                            className="quiz-taking-progress-fill"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <span>{progress}% hoàn thành</span>
                </div>
            </div>

            <div className="quiz-taking-questions">
                {quiz.questions.map((question, index) => (
                    <QuestionItem
                        key={question.id}
                        question={question}
                        index={index}
                        selectedAnswer={answers[question.id]}
                        onChoose={handleChoose}
                    />
                ))}
            </div>

            <div className="quiz-taking-actions">
                <button className="quiz-submit-btn" onClick={handleSubmit}>
                    <BiCheckCircle />
                    <span>Nộp bài</span>
                </button>
            </div>
        </div>
    );
}