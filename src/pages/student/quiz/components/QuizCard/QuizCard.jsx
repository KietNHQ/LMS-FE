import React from "react";
import {
    BiCalculator,
    BiBookOpen,
    BiAtom,
    BiRadioCircleMarked,
    BiTimeFive,
    BiCalendar,
    BiUser,
    BiLockAlt,
    BiPlayCircle,
    BiCheckCircle,
    BiXCircle,
    BiAlarm,
} from "react-icons/bi";
import "./QuizCard.css";

function getQuizIcon(icon) {
    switch (icon) {
        case "math":
            return <BiCalculator />;
        case "english":
            return <BiBookOpen />;
        case "science":
        case "biology":
        case "physics":
            return <BiAtom />;
        case "history":
            return <BiRadioCircleMarked />;
        default:
            return <BiBookOpen />;
    }
}

function getStatusInfo(status) {
    switch (status) {
        case "open":
            return {
                label: "Đang mở",
                className: "open",
                icon: <BiPlayCircle />,
            };
        case "done":
            return {
                label: "Đã hoàn thành",
                className: "done",
                icon: <BiCheckCircle />,
            };
        case "upcoming":
            return {
                label: "Sắp mở",
                className: "upcoming",
                icon: <BiAlarm />,
            };
        case "closed":
            return {
                label: "Đã đóng",
                className: "closed",
                icon: <BiLockAlt />,
            };
        default:
            return {
                label: "Không xác định",
                className: "closed",
                icon: <BiXCircle />,
            };
    }
}

export default function QuizCard({ quiz, onStart }) {
    const statusInfo = getStatusInfo(quiz.status);

    return (
        <div className="quiz-card">
            <div className="quiz-card-top">
                <div className="quiz-card-subject">
                    <span className="quiz-card-subject-icon">{getQuizIcon(quiz.icon)}</span>
                    <span>{quiz.subject}</span>
                </div>

                <div className={`quiz-card-status ${statusInfo.className}`}>
                    {statusInfo.icon}
                    <span>{statusInfo.label}</span>
                </div>
            </div>

            <h3>{quiz.title}</h3>
            <p>{quiz.description}</p>

            <div className="quiz-card-meta">
                <div className="quiz-card-meta-item">
                    <BiTimeFive />
                    <span>{quiz.duration} phút</span>
                </div>

                <div className="quiz-card-meta-item">
                    <BiCalendar />
                    <span>{quiz.dueDate}</span>
                </div>

                <div className="quiz-card-meta-item">
                    <BiUser />
                    <span>{quiz.teacher}</span>
                </div>
            </div>

            <div className="quiz-card-footer">
                <div className="quiz-card-footer-left">
                    <span className="quiz-card-type">{quiz.type}</span>
                    <span className="quiz-card-count">{quiz.questionsCount} câu hỏi</span>
                </div>

                {quiz.status === "open" ? (
                    <button className="quiz-card-btn" onClick={() => onStart(quiz)}>
                        Vào làm bài
                    </button>
                ) : quiz.status === "done" ? (
                    <button className="quiz-card-btn ghost" disabled>
                        Đã nộp
                    </button>
                ) : quiz.status === "upcoming" ? (
                    <button className="quiz-card-btn ghost" disabled>
                        Chưa mở
                    </button>
                ) : (
                    <button className="quiz-card-btn ghost closed" disabled>
                        Đã đóng
                    </button>
                )}
            </div>

            {quiz.score !== undefined && quiz.status === "done" && (
                <div className="quiz-card-score">Điểm: {quiz.score}</div>
            )}
        </div>
    );
}