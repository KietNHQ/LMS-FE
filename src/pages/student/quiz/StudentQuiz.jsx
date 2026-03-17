import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./StudentQuiz.css";
import {
    FiClock,
    FiCheck,
} from "react-icons/fi";
import QuizHeader from "./components/QuizHeader/QuizHeader";
import QuizCard from "./components/QuizCard/QuizCard";
import QuestionItem from "./components/QuestionItem/QuestionItem";
import ResultSummary from "./components/ResultSummary/ResultSummary";

const quizListData = [
    {
        id: 1,
        title: "Kiểm tra Toán chương 1",
        subject: "Toán",
        className: "10A1",
        duration: 45,
        questionCount: 5,
        status: "open",
        deadline: "2025-01-20",
        hasQuestions: true,
        questions: [
            {
                id: 1,
                text: "Giá trị của x trong phương trình 2x + 4 = 10 là?",
                point: 0.5,
                options: ["2", "3", "4", "5"],
                correctAnswer: 1,
            },
            {
                id: 2,
                text: "Diện tích hình tròn bán kính r là?",
                point: 0.5,
                options: ["πr", "2πr", "πr²", "2πr²"],
                correctAnswer: 2,
            },
            {
                id: 3,
                text: "Kết quả của 7 × 8 là?",
                point: 0.5,
                options: ["54", "56", "58", "64"],
                correctAnswer: 1,
            },
            {
                id: 4,
                text: "Số nguyên tố nhỏ nhất là số nào?",
                point: 0.5,
                options: ["0", "1", "2", "3"],
                correctAnswer: 2,
            },
            {
                id: 5,
                text: "Giá trị của 15 - 6 là?",
                point: 0.5,
                options: ["7", "8", "9", "10"],
                correctAnswer: 2,
            },
        ],
    },

    {
        id: 2,
        title: "Bài kiểm tra Ngữ văn HK1",
        subject: "Ngữ văn",
        className: "10A1",
        duration: 45,
        questionCount: 10,
        status: "open",
        deadline: "2025-01-22",
        hasQuestions: true,
        questions: [
            {
                id: 1,
                text: "Tác giả của Truyện Kiều là ai?",
                point: 0.5,
                options: ["Nguyễn Du", "Hồ Xuân Hương", "Nam Cao", "Xuân Diệu"],
                correctAnswer: 0,
            },
            {
                id: 2,
                text: "Biện pháp tu từ trong câu 'Mặt trời của bắp thì nằm trên đồi' là gì?",
                point: 0.5,
                options: ["So sánh", "Nhân hóa", "Ẩn dụ", "Hoán dụ"],
                correctAnswer: 2,
            },
        ],
    },

    {
        id: 3,
        title: "Bài kiểm tra Vật lý HK1",
        subject: "Vật lý",
        className: "10A1",
        duration: 60,
        questionCount: 25,
        status: "close",
        deadline: "2025-01-25",
        hasQuestions: true,
        questions: [],
    },

    {
        id: 4,
        title: "Quiz Hóa học chương 2",
        subject: "Hóa học",
        className: "10A1",
        duration: 30,
        questionCount: 15,
        status: "opening-soon",
        deadline: "2025-02-01",
        hasQuestions: true,
        questions: [],
    },

    {
        id: 5,
        title: "Tiếng Anh Unit 3",
        subject: "Tiếng Anh",
        className: "10A1",
        duration: 40,
        questionCount: 30,
        status: "open",
        deadline: "2025-02-05",
        hasQuestions: true,
        questions: [
            {
                id: 1,
                text: "Choose the correct word: She ___ to school every day.",
                point: 0.5,
                options: ["go", "goes", "going", "gone"],
                correctAnswer: 1,
            },
        ],
    },

    {
        id: 6,
        title: "Lịch sử Việt Nam giai đoạn đầu",
        subject: "Lịch sử",
        className: "10A1",
        duration: 35,
        questionCount: 20,
        status: "close",
        deadline: "2025-02-08",
        hasQuestions: true,
        questions: [],
    },
];

const letters = ["A", "B", "C", "D", "E", "F"];

export default function StudentQuiz() {

    const [view, setView] = useState("list");

    const [quizList] = useState(quizListData);

    const [selectedQuiz, setSelectedQuiz] = useState(null);

    const [answers, setAnswers] = useState({});

    const [timeLeft, setTimeLeft] = useState(0);

    const [submittedResult, setSubmittedResult] = useState(null);

    const [quizResults, setQuizResults] = useState(() => {
        try {
            const saved = localStorage.getItem("quizResults");
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });


    useEffect(() => {

        localStorage.setItem("quizResults", JSON.stringify(quizResults));

    }, [quizResults]);


    const answeredCount = useMemo(() => {

        return Object.keys(answers).length;

    }, [answers]);


    const handleStartQuiz = (quiz) => {

        const canStart =
            quiz.status === "open" &&
            quiz.hasQuestions &&
            quiz.questions.length > 0;

        if (!canStart) return;

        setSelectedQuiz(quiz);

        setAnswers({});

        setSubmittedResult(null);

        setTimeLeft(quiz.duration * 60);

        setView("doing");
    };


    const handleChooseAnswer = (questionId, optionIndex) => {

        if (view !== "doing") return;

        setAnswers((prev) => ({
            ...prev,
            [questionId]: optionIndex,
        }));
    };


    const buildResult = (quiz, answerMap) => {

        const total = quiz.questions.reduce((sum, q) => sum + q.point, 0);

        let achieved = 0;
        let correct = 0;

        quiz.questions.forEach((q) => {

            if (answerMap[q.id] === q.correctAnswer) {

                achieved += q.point;

                correct += 1;
            }

        });

        const percent = total > 0 ? Math.round((achieved / total) * 100) : 0;

        return {
            quiz,
            answers: answerMap,
            achievedScore: achieved,
            totalScore: total,
            correctCount: correct,
            totalQuestions: quiz.questions.length,
            percent,
        };
    };


    const handleSubmit = () => {

        if (!selectedQuiz) return;

        const result = buildResult(selectedQuiz, answers);

        setQuizResults((prev) => ({
            ...prev,
            [selectedQuiz.id]: result,
        }));

        setSubmittedResult(result);

        setView("result");
    };


    const handleSubmitAuto = useCallback(() => {

        if (!selectedQuiz) return;

        const result = buildResult(selectedQuiz, answers);

        setQuizResults((prev) => ({
            ...prev,
            [selectedQuiz.id]: result,
        }));

        setSubmittedResult(result);

        setView("result");
    }, [answers, selectedQuiz]);


    useEffect(() => {

        if (view !== "doing" || timeLeft <= 0) return;

        const timer = setInterval(() => {

            setTimeLeft((prev) => {

                if (prev <= 1) {

                    clearInterval(timer);

                    handleSubmitAuto();

                    return 0;
                }

                return prev - 1;

            });

        }, 1000);

        return () => clearInterval(timer);

    }, [view, timeLeft, handleSubmitAuto]);


    const handleBackToList = () => {

        setView("list");

        setSelectedQuiz(null);

        setAnswers({});

        setSubmittedResult(null);

        setTimeLeft(0);
    };


    const formatTime = (seconds) => {

        const mins = Math.floor(seconds / 60);

        const secs = seconds % 60;

        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };


    const getStatusLabel = (status) => {

        switch (status) {

            case "open":
                return "Đang mở";

            case "close":
                return "Đã đóng";

            case "opening-soon":
                return "Sắp mở";

            default:
                return status;
        }
    };


    const getButtonText = (quiz) => {

        if (quiz.status === "open" && quiz.hasQuestions && quiz.questions.length > 0) {
            return "Bắt đầu làm bài";
        }

        if (quiz.status === "close") {
            return "Bài kiểm tra đã đóng";
        }

        if (quiz.status === "opening-soon") {
            return "Sắp mở";
        }

        return "Chưa có câu hỏi";
    };


    const renderQuizList = () => {

        return (

            <div className="student-quiz-page">

                <QuizHeader title="Danh sách Quiz" subtitle="Chọn bài kiểm tra để bắt đầu làm" />


                <div className="quiz-grid">

                    {quizList.map((quiz) => {

                        const canStart =
                            quiz.status === "open" &&
                            quiz.hasQuestions &&
                            quiz.questions.length > 0;

                        const hasDone = quizResults[quiz.id];

                        return (

                            <QuizCard
                                key={quiz.id}
                                quiz={quiz}
                                hasDone={hasDone}
                                canStart={canStart}
                                getStatusLabel={getStatusLabel}
                                getButtonText={getButtonText}
                                onStart={() => handleStartQuiz(quiz)}
                                onReview={() => {
                                    setSubmittedResult(quizResults[quiz.id]);
                                    setView("result");
                                }}
                            />

                        );

                    })}

                </div>

            </div>

        );
    };


    const renderDoingQuiz = () => {

        if (!selectedQuiz) return null;

        return (

            <div className="quiz-doing-page">

                <div className="quiz-doing-header">

                    <div>

                        <h2>{selectedQuiz.title}</h2>

                        <p>
                            {selectedQuiz.questions.length} câu • {answeredCount}/
                            {selectedQuiz.questions.length} đã trả lời
                        </p>

                    </div>


                    <div className="quiz-header-actions">

                        <div className="quiz-timer-box">

                            <FiClock />

                            <span>{formatTime(timeLeft)}</span>

                        </div>


                        <button className="quiz-submit-btn" onClick={handleSubmit}>
                            Nộp bài
                        </button>

                    </div>

                </div>


                <div className="quiz-questions-wrap">

                    {selectedQuiz.questions.map((question, index) => (

                        <QuestionItem
                            key={question.id}
                            question={question}
                            index={index}
                            answers={answers}
                            onChooseAnswer={handleChooseAnswer}
                            letters={letters}
                        />

                    ))}

                </div>

            </div>

        );
    };


    const renderResult = () => {

        if (!submittedResult) return null;

        return (

            <div className="quiz-result-page">

                <ResultSummary submittedResult={submittedResult} onBackToList={handleBackToList} />


                <div className="result-detail-section">

                    <h3>Đáp án chi tiết</h3>

                    <div className="result-detail-list">

                        {submittedResult.quiz.questions.map((question, index) => {

                            const selectedIndex = submittedResult.answers[question.id];

                            const isCorrect = selectedIndex === question.correctAnswer;

                            return (

                                <div
                                    key={question.id}
                                    className={`result-question-card ${
                                        isCorrect ? "correct-block" : "wrong-block"
                                    }`}
                                >

                                    <div className="result-question-title">
                                        {index + 1}. {question.text}
                                    </div>


                                    <div className="result-options">

                                        {question.options.map((option, optionIndex) => {

                                            const isUserChoice = selectedIndex === optionIndex;

                                            const isCorrectChoice =
                                                question.correctAnswer === optionIndex;

                                            return (

                                                <div
                                                    key={optionIndex}
                                                    className={`result-option
                                                    ${isCorrectChoice ? "is-correct-answer" : ""}
                                                    ${
                                                        isUserChoice && !isCorrectChoice
                                                            ? "is-wrong-answer"
                                                            : ""
                                                    }`}
                                                >

                                                    <span className="result-option-left">
                                                        {letters[optionIndex]}. {option}
                                                    </span>

                                                    {isCorrectChoice && (
                                                        <span className="result-option-icon">
                                                            <FiCheck />
                                                        </span>
                                                    )}

                                                </div>

                                            );
                                        })}

                                    </div>

                                </div>

                            );
                        })}

                    </div>

                </div>

            </div>

        );
    };


    return (
        <>
            {view === "list" && renderQuizList()}
            {view === "doing" && renderDoingQuiz()}
            {view === "result" && renderResult()}
        </>
    );
}