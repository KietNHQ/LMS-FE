import React, { useEffect, useMemo, useRef, useState } from "react";
import { BiArrowBack, BiCheckCircle, BiTimeFive } from "react-icons/bi";
import {
    FaSquareRootAlt,
    FaAtom,
    FaFlask,
    FaBookOpen,
    FaLanguage,
    FaMicroscope,
    FaLaptopCode,
    FaGlobeAsia,
    FaDumbbell,
    FaPalette,
    FaMusic,
    FaGraduationCap,
} from "react-icons/fa";
import { BiBook, BiWorld, BiLeaf } from "react-icons/bi";
import "./QuizTakingView.css";
import QuestionItem from "../QuestionItem/QuestionItem";

const subjectIconByKey = {
    math: FaSquareRootAlt,
    english: FaLanguage,
    science: FaFlask,
    biology: FaMicroscope,
    physics: FaAtom,
    history: BiBook,
};

const subjectIconByName = {
    "toán": FaSquareRootAlt,
    "toán học": FaSquareRootAlt,
    "vật lý": FaAtom,
    "hóa học": FaFlask,
    "ngữ văn": FaBookOpen,
    "tiếng anh": FaLanguage,
    "sinh học": FaMicroscope,
    "lịch sử": BiBook,
    "địa lý": FaGlobeAsia,
    "tin học": FaLaptopCode,
    "giáo dục công dân": BiWorld,
    "thể dục": FaDumbbell,
    "mỹ thuật": FaPalette,
    "âm nhạc": FaMusic,
    "công nghệ": BiLeaf,
};

function getQuizSubjectIcon(quiz) {
    const iconKey = String(quiz.icon || "").trim().toLowerCase();
    if (iconKey && subjectIconByKey[iconKey]) {
        return subjectIconByKey[iconKey];
    }

    const subjectName = String(quiz.subject || "").trim().toLowerCase();
    return subjectIconByName[subjectName] || FaGraduationCap;
}

export default function QuizTakingView({ quiz, onBack, onSubmit }) {
    const [answers, setAnswers] = useState({});
    const [remainingSeconds, setRemainingSeconds] = useState(() => {
        if (quiz.timeRemaining !== undefined) return quiz.timeRemaining;
        return Math.max(0, Math.round(Number(quiz.duration || 0) * 60));
    });
    const hasAutoSubmittedRef = useRef(false);
    const answersRef = useRef(answers);

    useEffect(() => {
        answersRef.current = answers;
    }, [answers]);

    const answeredCount = useMemo(() => {
        return Object.keys(answers).length;
    }, [answers]);

    const progress = useMemo(() => {
        if (!quiz.questions.length) return 0;
        return Math.round((answeredCount / quiz.questions.length) * 100);
    }, [answeredCount, quiz.questions.length]);

    useEffect(() => {
        const timer = window.setInterval(() => {
            setRemainingSeconds((prev) => {
                if (prev <= 1) {
                    if (!hasAutoSubmittedRef.current) {
                        hasAutoSubmittedRef.current = true;
                        onSubmit(quiz, answersRef.current);
                    }
                    return 0;
                }

                return prev - 1;
            });
        }, 1000);

        return () => window.clearInterval(timer);
    }, [onSubmit, quiz]);

    const formattedTime = useMemo(() => {
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }, [remainingSeconds]);

    const isTimerWarning = remainingSeconds > 0 && remainingSeconds <= 60;
    const isTimerExpired = remainingSeconds <= 0;
    const SubjectIcon = getQuizSubjectIcon(quiz);

    const handleChoose = (questionId, option) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: option,
        }));
    };

    const handleSubmit = () => {
        hasAutoSubmittedRef.current = true;
        onSubmit(quiz, answers);
    };

    return (
        <div className="quiz-taking-view">
            <div className="quiz-taking-content">
                <div className="quiz-taking-main">
                    <div className="quiz-taking-header">
                        <div className="quiz-taking-header-main">
                            <span className="quiz-taking-badge">
                                <SubjectIcon />
                                <span>{quiz.subject}</span>
                            </span>
                            <h1>{quiz.title}</h1>
                            <p>
                                Giáo viên: {quiz.teacher} · Thời lượng: {quiz.duration} phút
                            </p>
                        </div>

                        <div className="quiz-taking-header-actions">
                            <button
                                className="quiz-back-btn quiz-back-btn--compact"
                                onClick={onBack}
                            >
                                <BiArrowBack />
                                <span>Quay lại danh sách</span>
                            </button>
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
                                disabled={isTimerExpired}
                            />
                        ))}
                    </div>
                </div>

                <aside className="quiz-floating-widget-wrap">
                    <div className="quiz-floating-widget">
                        <div className="quiz-progress-card">
                            <span>Tiến độ</span>
                            <strong>
                                {answeredCount}/{quiz.questions.length} câu
                            </strong>
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

                        <div
                            className={`quiz-timer-card ${isTimerWarning ? "is-warning" : ""} ${
                                isTimerExpired ? "is-expired" : ""
                            }`}
                        >
                            <div className="quiz-timer-card__label">
                                <BiTimeFive />
                                <span>Thời gian còn lại</span>
                            </div>
                            <strong>{formattedTime}</strong>
                        </div>

                        <button
                            className="quiz-submit-btn"
                            onClick={handleSubmit}
                            disabled={isTimerExpired}
                        >
                            <BiCheckCircle />
                            <span>{isTimerExpired ? "Đã hết giờ" : "Nộp bài"}</span>
                        </button>

                    </div>
                </aside>
            </div>
        </div>
    );
}

