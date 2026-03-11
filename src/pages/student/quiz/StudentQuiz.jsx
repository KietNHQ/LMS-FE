import React, { useEffect, useMemo, useState } from "react";
import "./StudentQuiz.css";
import {
    FiClock,
    FiChevronRight,
    FiAward,
    FiCheck,
} from "react-icons/fi";

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
            {
                id: 3,
                text: "Phong cách ngôn ngữ nghệ thuật thường dùng trong lĩnh vực nào?",
                point: 0.5,
                options: ["Hành chính", "Văn chương", "Khoa học", "Báo chí"],
                correctAnswer: 1,
            },
            {
                id: 4,
                text: "Câu nào là câu nghi vấn?",
                point: 0.5,
                options: [
                    "Hôm nay trời đẹp quá.",
                    "Bạn đi đâu đấy?",
                    "Tôi rất vui.",
                    "Chúng tôi học bài.",
                ],
                correctAnswer: 1,
            },
            {
                id: 5,
                text: "Từ nào là từ láy?",
                point: 0.5,
                options: ["Học sinh", "Long lanh", "Cây bút", "Nhà cửa"],
                correctAnswer: 1,
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
            {
                id: 2,
                text: "What is the past tense of 'eat'?",
                point: 0.5,
                options: ["eated", "ate", "eaten", "eats"],
                correctAnswer: 1,
            },
            {
                id: 3,
                text: "Which one is a noun?",
                point: 0.5,
                options: ["beautiful", "run", "teacher", "quickly"],
                correctAnswer: 2,
            },
            {
                id: 4,
                text: "Choose the correct article: ___ apple a day keeps the doctor away.",
                point: 0.5,
                options: ["A", "An", "The", "No article"],
                correctAnswer: 1,
            },
            {
                id: 5,
                text: "Which sentence is correct?",
                point: 0.5,
                options: [
                    "He don't like milk.",
                    "He doesn't likes milk.",
                    "He doesn't like milk.",
                    "He not like milk.",
                ],
                correctAnswer: 2,
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
    {
        id: 7,
        title: "Địa lý tự nhiên Việt Nam",
        subject: "Địa lý",
        className: "10A1",
        duration: 35,
        questionCount: 20,
        status: "opening-soon",
        deadline: "2025-02-10",
        hasQuestions: true,
        questions: [],
    },
    {
        id: 8,
        title: "Sinh học tế bào",
        subject: "Sinh học",
        className: "10A1",
        duration: 30,
        questionCount: 18,
        status: "open",
        deadline: "2025-02-12",
        hasQuestions: true,
        questions: [
            {
                id: 1,
                text: "Đơn vị cơ bản của sự sống là gì?",
                point: 0.5,
                options: ["Mô", "Tế bào", "Cơ quan", "Phân tử"],
                correctAnswer: 1,
            },
            {
                id: 2,
                text: "Bào quan nào được gọi là nhà máy năng lượng của tế bào?",
                point: 0.5,
                options: ["Nhân", "Lục lạp", "Ti thể", "Ribosome"],
                correctAnswer: 2,
            },
            {
                id: 3,
                text: "ADN nằm chủ yếu ở đâu?",
                point: 0.5,
                options: ["Màng tế bào", "Tế bào chất", "Nhân", "Không bào"],
                correctAnswer: 2,
            },
            {
                id: 4,
                text: "Lục lạp có nhiều ở loại tế bào nào?",
                point: 0.5,
                options: [
                    "Tế bào động vật",
                    "Tế bào thực vật",
                    "Tế bào nấm",
                    "Tế bào vi khuẩn",
                ],
                correctAnswer: 1,
            },
            {
                id: 5,
                text: "Chức năng chính của ribosome là gì?",
                point: 0.5,
                options: [
                    "Tổng hợp protein",
                    "Tạo năng lượng",
                    "Vận chuyển nước",
                    "Phân giải chất",
                ],
                correctAnswer: 0,
            },
        ],
    },
    {
        id: 9,
        title: "Tin học cơ bản",
        subject: "Tin học",
        className: "10A1",
        duration: 25,
        questionCount: 12,
        status: "open",
        deadline: "2025-02-15",
        hasQuestions: true,
        questions: [
            {
                id: 1,
                text: "CPU là viết tắt của cụm từ nào?",
                point: 0.5,
                options: [
                    "Central Process Unit",
                    "Central Processing Unit",
                    "Computer Personal Unit",
                    "Control Program Unit",
                ],
                correctAnswer: 1,
            },
            {
                id: 2,
                text: "Thiết bị nào dùng để nhập dữ liệu?",
                point: 0.5,
                options: ["Màn hình", "Máy in", "Bàn phím", "Loa"],
                correctAnswer: 2,
            },
            {
                id: 3,
                text: "Phần mềm nào dùng để soạn thảo văn bản?",
                point: 0.5,
                options: ["Excel", "Word", "Paint", "PowerPoint"],
                correctAnswer: 1,
            },
            {
                id: 4,
                text: "Internet là gì?",
                point: 0.5,
                options: [
                    "Một phần mềm",
                    "Một mạng máy tính toàn cầu",
                    "Một thiết bị",
                    "Một ngôn ngữ lập trình",
                ],
                correctAnswer: 1,
            },
            {
                id: 5,
                text: "Tệp văn bản thường có phần mở rộng nào?",
                point: 0.5,
                options: [".mp3", ".jpg", ".docx", ".exe"],
                correctAnswer: 2,
            },
        ],
    },
    {
        id: 10,
        title: "Giáo dục công dân - Công dân với pháp luật",
        subject: "GDCD",
        className: "10A1",
        duration: 20,
        questionCount: 10,
        status: "close",
        deadline: "2025-02-18",
        hasQuestions: true,
        questions: [],
    },
    {
        id: 11,
        title: "Công nghệ nông nghiệp cơ bản",
        subject: "Công nghệ",
        className: "10A1",
        duration: 25,
        questionCount: 10,
        status: "opening-soon",
        deadline: "2025-02-20",
        hasQuestions: true,
        questions: [],
    },
    {
        id: 12,
        title: "Giáo dục quốc phòng - an ninh",
        subject: "QPAN",
        className: "10A1",
        duration: 20,
        questionCount: 10,
        status: "close",
        deadline: "2025-02-22",
        hasQuestions: true,
        questions: [],
    },
    {
        id: 13,
        title: "Thể dục vận động cơ bản",
        subject: "Thể dục",
        className: "10A1",
        duration: 15,
        questionCount: 8,
        status: "opening-soon",
        deadline: "2025-02-24",
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
    }, [view, timeLeft]);

    const answeredCount = useMemo(() => {
        return Object.keys(answers).length;
    }, [answers]);

    const handleStartQuiz = (quiz) => {
        const canStart =
            quiz.status === "open" && quiz.hasQuestions && quiz.questions.length > 0;

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
        setSubmittedResult(result);
        setView("result");
    };

    const handleSubmitAuto = () => {
        if (!selectedQuiz) return;

        const result = buildResult(selectedQuiz, answers);
        setSubmittedResult(result);
        setView("result");
    };

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
                <div className="quiz-list-header">
                    <h1>Danh sách Quiz</h1>
                    <p>Chọn bài kiểm tra để bắt đầu làm</p>
                </div>

                <div className="quiz-grid">
                    {quizList.map((quiz) => {
                        const canStart =
                            quiz.status === "open" &&
                            quiz.hasQuestions &&
                            quiz.questions.length > 0;

                        return (
                            <div className="quiz-card" key={quiz.id}>
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

                                    <span className={`quiz-badge ${quiz.status}`}>
                    {getStatusLabel(quiz.status)}
                  </span>
                                </div>

                                <div className="quiz-deadline">Hạn nộp: {quiz.deadline}</div>

                                {canStart ? (
                                    <button
                                        className="quiz-main-btn"
                                        onClick={() => handleStartQuiz(quiz)}
                                    >
                                        {getButtonText(quiz)} <FiChevronRight />
                                    </button>
                                ) : (
                                    <button className="quiz-disabled-btn" disabled>
                                        {getButtonText(quiz)}
                                    </button>
                                )}
                            </div>
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
                        <div className="question-card" key={question.id}>
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
                                        <button
                                            key={optionIndex}
                                            className={`answer-item ${isSelected ? "selected" : ""}`}
                                            onClick={() =>
                                                handleChooseAnswer(question.id, optionIndex)
                                            }
                                        >
                      <span className="answer-letter">
                        {letters[optionIndex]}
                      </span>
                                            <span className="answer-text">{option}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderResult = () => {
        if (!submittedResult) return null;

        return (
            <div className="quiz-result-page">
                <div className="quiz-result-summary">
                    <div
                        className={`result-percent-circle ${
                            submittedResult.percent >= 50 ? "pass" : "fail"
                        }`}
                    >
                        {submittedResult.percent}%
                    </div>

                    <h2>{submittedResult.quiz.title}</h2>
                    <p>Bạn đã hoàn thành bài kiểm tra!</p>

                    <div className="result-stats">
                        <div className="result-stat-box">
                            <h3>{submittedResult.achievedScore.toFixed(1)}</h3>
                            <span>Điểm đạt</span>
                        </div>

                        <div className="result-stat-box">
                            <h3>{submittedResult.totalScore.toFixed(1)}</h3>
                            <span>Tổng điểm</span>
                        </div>

                        <div className="result-stat-box">
                            <h3>
                                {submittedResult.correctCount}/{submittedResult.totalQuestions}
                            </h3>
                            <span>Câu đúng</span>
                        </div>
                    </div>

                    <button className="back-list-btn" onClick={handleBackToList}>
                        Quay lại danh sách
                    </button>
                </div>

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