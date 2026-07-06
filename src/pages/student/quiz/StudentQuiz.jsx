import React, { useMemo, useState } from "react";
import "./StudentQuiz.css";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Card } from "../../../components/ui";

import QuizHeader from "./components/QuizHeader/QuizHeader";
import QuizToolbar from "./components/QuizToolbar/QuizToolbar";
import QuizCard from "./components/QuizCard/QuizCard";
import QuizTakingView from "./components/QuizTakingView/QuizTakingView";
import ResultSummary from "./components/ResultSummary/ResultSummary";

import { SchoolYearTermSelector } from "../../../components/common";
import { LoadingSpinner } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import studentService from "../../../services/pages/student/studentService";

const ITEMS_PER_PAGE = 4;

function getCurrentStudentId() {
    const storedUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "{}");
    return storedUser?.profile?.id || storedUser?.id || null;
}

function getApiErrorMessage(error, fallback = "Lỗi khi nộp bài") {
    const payload = error?.response?.data || error;

    if (Array.isArray(payload?.details) && payload.details.length > 0) {
        return payload.details
            .map((detail) => detail?.message)
            .filter(Boolean)
            .join("\n") || fallback;
    }

    return payload?.message || payload?.error || error?.message || fallback;
}

function isAlreadySubmittedError(error) {
    const message = getApiErrorMessage(error, "").toLowerCase();
    return message.includes("already submitted") || message.includes("đã nộp");
}

function normalizeQuizAnswer(question, answer) {
    const questionType = String(
        question?.type || question?.questionType || question?.question_type || ""
    ).toLowerCase();

    if (questionType === "essay") {
        return {
            questionId: Number(question.id),
            answerId: null,
            essayAnswer: typeof answer === "string" ? answer : "",
        };
    }

    const selectedAnswer = question?.quiz_answers?.find(
        (item) => item.answer_text === answer || item.answerText === answer
    );

    return {
        questionId: Number(question.id),
        answerId: selectedAnswer?.id ? Number(selectedAnswer.id) : null,
        essayAnswer: null,
    };
}

export default function StudentQuiz() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [subjectFilter, setSubjectFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);

    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [quizResult, setQuizResult] = useState(null);

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            const studentId = getCurrentStudentId();
            if (!studentId) {
                setError("Không tìm thấy thông tin học sinh.");
                return;
            }

            const response = await studentService.listQuizzes({
                pathParams: { id: studentId },
                params: {
                    schoolYear: selectedSchoolYear,
                    term: selectedTerm,
                },
                mock: false,
            });
            if (response.success) {
                // Handle both old array structure and new { items, total } structure
                const quizzesData = Array.isArray(response.data) 
                  ? response.data 
                  : (response.data.items || []);

                // Map backend data to UI format if needed
                const mappedQuizzes = quizzesData.map(q => {
                    const latestAttempt = q.quiz_attempts?.[0] || null;
                    const teacherName = q.teacher
                        || (q.class_teacher_subject?.teachers
                            ? `${q.class_teacher_subject.teachers.surname} ${q.class_teacher_subject.teachers.given_name}`
                            : "Giáo viên");
                    const status = q.status || (
                        latestAttempt?.status === "submitted" || latestAttempt?.status === "graded"
                            ? "done"
                            : q.is_published === false
                                ? "closed"
                                : "open"
                    );
                    const normalizedQuestions = (q.questions || []).map((question) => ({
                        ...question,
                        text: question.text || question.question_text,
                        options: (question.answers || question.quiz_answers || []).map((answer) => answer.answer_text),
                        correctAnswer: (question.answers || question.quiz_answers || []).find((answer) => answer.is_correct)?.answer_text || "",
                        questionImage: question.questionImage || "",
                    }));

                    return {
                        id: q.id,
                        title: q.title,
                        description: q.description || "Không có mô tả",
                        subject: q.subject || q.class_teacher_subject?.subject_assignments?.display_name || "Môn học",
                        teacher: teacherName,
                        duration: q.duration || q.duration_minutes || 0,
                        dueDate: q.dueDate || (q.end_date ? new Date(q.end_date).toLocaleDateString("vi-VN") : "Không thời hạn"),
                        status,
                        type: q.type || (q.quiz_type === "exam" ? "Bài thi" : q.quiz_type === "practice" ? "Luyện tập" : "Bài tập"),
                        questionsCount: q.questionsCount || q._count?.questions || 0,
                        score: q.score ?? latestAttempt?.total_score ?? latestAttempt?.totalScore ?? null,
                        questions: normalizedQuestions,
                    };
                });
                setQuizzes(mappedQuizzes);
            } else {
                setError(response.message || "Không thể tải danh sách bài kiểm tra");
            }
        } catch (err) {
            console.error("Fetch quizzes error:", err);
            setError("Đã xảy ra lỗi khi kết nối máy chủ");
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchQuizzes();
    }, [selectedSchoolYear, selectedTerm]);

    const subjects = useMemo(() => {
        return [...new Set(quizzes.map((quiz) => quiz.subject))];
    }, [quizzes]);

    const stats = useMemo(() => {
        return {
            total: quizzes.length,
            open: quizzes.filter((quiz) => quiz.status === "open").length,
            done: quizzes.filter((quiz) => quiz.status === "done").length,
        };
    }, [quizzes]);

    const filteredQuizzes = useMemo(() => {
        return quizzes.filter((quiz) => {
            const matchesSearch =
                quiz.title.toLowerCase().includes(search.toLowerCase()) ||
                quiz.subject.toLowerCase().includes(search.toLowerCase()) ||
                quiz.teacher.toLowerCase().includes(search.toLowerCase());

            const matchesStatus =
                statusFilter === "all" ? true : quiz.status === statusFilter;

            const matchesSubject =
                subjectFilter === "all" ? true : quiz.subject === subjectFilter;

            return matchesSearch && matchesStatus && matchesSubject;
        });
    }, [quizzes, search, statusFilter, subjectFilter]);

    const totalPages = useMemo(() => {
        return Math.max(1, Math.ceil(filteredQuizzes.length / ITEMS_PER_PAGE));
    }, [filteredQuizzes.length]);

    const visibleCurrentPage = Math.min(currentPage, totalPages);

    const paginatedQuizzes = useMemo(() => {
        const start = (visibleCurrentPage - 1) * ITEMS_PER_PAGE;
        return filteredQuizzes.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredQuizzes, visibleCurrentPage]);

    const handleStartQuiz = async (quiz) => {
        try {
            setLoading(true);
            const response = await studentService.startQuiz({ pathParams: { id: quiz.id }, mock: false });
            if (response.success) {
                const quizData = response.data.quiz;
                const attemptData = response.data.attempt;
                const questions = response.data.questions || [];

                setSelectedQuiz({
                    ...quiz,
                    questions: questions.map(q => ({
                        id: q.id,
                        text: q.question_text,
                        type: q.question_type,
                        points: q.points,
                        options: q.quiz_answers?.map(a => a.answer_text) || [],
                        quiz_answers: q.quiz_answers,
                        questionImage: q.questionImage || "",
                        correctAnswer: q.quiz_answers?.find(a => a.is_correct)?.answer_text || "",
                    })),
                    attemptId: attemptData.id,
                    timeRemaining: response.data.timeRemaining
                });
                setQuizResult(null);
            } else {
                setError(response.message || "Không thể bắt đầu bài kiểm tra");
            }
        } catch (err) {
            console.error("Start quiz error:", err);
            setError("Lỗi khi bắt đầu bài kiểm tra");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitQuiz = async (quiz, answers) => {
        try {
            setLoading(true);
            const responses = Object.entries(answers)
                .map(([qId, ans]) => {
                    const question = quiz.questions.find(q => Number(q.id) === Number(qId));
                    return question ? normalizeQuizAnswer(question, ans) : null;
                })
                .filter(Boolean);

            const response = await studentService.submitQuiz({
                pathParams: { attemptId: quiz.attemptId },
                body: { responses },
                mock: false,
            });

            if (response.success) {
                const attempt = response.data?.data || response.data || {};
                const hasEssayQuestions = quiz.questions.some((question) => {
                    const questionType = String(
                        question?.type || question?.questionType || question?.question_type || ""
                    ).toLowerCase();
                    return questionType === "essay";
                });

                const objectiveQuestions = quiz.questions.filter((question) => {
                    const questionType = String(
                        question?.type || question?.questionType || question?.question_type || ""
                    ).toLowerCase();
                    return questionType !== "essay";
                });

                const correctCount = objectiveQuestions.reduce((count, question) => {
                    const selected = answers[question.id];
                    return count + (selected && selected === question.correctAnswer ? 1 : 0);
                }, 0);

                const isPendingReview = hasEssayQuestions || attempt.status === "pending_review";
                const autoScore = Number(attempt.score_auto ?? attempt.scoreAuto ?? 0);
                const manualScore = Number(attempt.score_manual ?? attempt.scoreManual ?? 0);
                const finalScore = Number(
                    attempt.total_score ?? attempt.totalScore ?? attempt.score ?? autoScore + manualScore
                );
                setQuizResult({
                    quizTitle: quiz.title,
                    score: isPendingReview ? null : finalScore,
                    autoScore,
                    manualScore,
                    pendingReview: isPendingReview,
                    correctCount,
                    total: objectiveQuestions.length || quiz.questions.length,
                    answers,
                    questions: quiz.questions.map((question) => ({
                        ...question,
                        correctAnswer: question.correctAnswer || (question.quiz_answers || []).find((answer) => answer.is_correct)?.answer_text || "",
                    })),
                    attempt,
                });
                setSelectedQuiz(null);
                fetchQuizzes(); // Refresh list to show 'done' status
            } else {
                if (isAlreadySubmittedError(response)) {
                    alert("Bài làm đã được nộp trước đó.");
                    setSelectedQuiz(null);
                    await fetchQuizzes();
                    return;
                }
                alert(getApiErrorMessage(response));
            }
        } catch (err) {
            console.error("Submit quiz error:", err);
            if (isAlreadySubmittedError(err)) {
                alert("Bài làm đã được nộp trước đó.");
                setSelectedQuiz(null);
                await fetchQuizzes();
                return;
            }
            alert(getApiErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleBackToList = () => {
        setSelectedQuiz(null);
        setQuizResult(null);
    };

    return (
        <div className="student-quiz-page">
            {!selectedQuiz && !quizResult && (
                <>
                    <QuizHeader
                        stats={stats}
                        actions={
                            <SchoolYearTermSelector
                                selectedSchoolYear={selectedSchoolYear}
                                selectedTerm={selectedTerm}
                                onYearChange={handleYearArrow}
                                onTermChange={handleTermChange}
                            />
                        }
                    />

                    <QuizToolbar
                        search={search}
                        onSearchChange={(value) => {
                            setSearch(value);
                            setCurrentPage(1);
                        }}
                        statusFilter={statusFilter}
                        onStatusChange={(value) => {
                            setStatusFilter(value);
                            setCurrentPage(1);
                        }}
                        subjectFilter={subjectFilter}
                        onSubjectChange={(value) => {
                            setSubjectFilter(value);
                            setCurrentPage(1);
                        }}
                        subjects={subjects}
                    />

                    <Card className="student-quiz-main-card" bodyClassName="student-quiz-main-card__body">
                        {loading ? (
                            <div className="student-quiz-loading">
                                <LoadingSpinner />
                                <p>Đang tải danh sách bài kiểm tra...</p>
                            </div>
                        ) : error ? (
                            <div className="student-quiz-error">
                                <p>{error}</p>
                                <button onClick={fetchQuizzes} className="student-quiz-retry-btn">
                                    Thử lại
                                </button>
                            </div>
                        ) : (
                            <div className="student-quiz-grid">
                                {paginatedQuizzes.map((quiz) => (
                                    <QuizCard
                                        key={quiz.id}
                                        quiz={quiz}
                                        onStart={handleStartQuiz}
                                    />
                                ))}
                            </div>
                        )}

                        {!loading && !error && filteredQuizzes.length === 0 && (
                            <div className="student-quiz-empty">
                                <h3>Không tìm thấy bài kiểm tra nào</h3>
                                <p>Hiện tại chưa có bài kiểm tra nào được giao cho bạn trong khoảng thời gian này.</p>
                            </div>
                        )}

                        {filteredQuizzes.length > 0 && totalPages > 1 && (
                            <div className="student-quiz-pagination-wrap">
                                <div className="student-quiz-pagination">
                                    <button
                                        type="button"
                                        className="student-quiz-page-btn"
                                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        aria-label="Trang trước"
                                    >
                                        <FiChevronLeft />
                                    </button>

                                    <div className="student-quiz-page-indicator">
                                        <span>{visibleCurrentPage}</span>
                                        <small>/ {totalPages}</small>
                                    </div>

                                    <button
                                        type="button"
                                        className="student-quiz-page-btn"
                                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                        disabled={visibleCurrentPage === totalPages}
                                        aria-label="Trang sau"
                                    >
                                        <FiChevronRight />
                                    </button>
                                </div>
                            </div>
                        )}
                    </Card>
                </>
            )}

            {selectedQuiz && (
                <QuizTakingView
                    quiz={selectedQuiz}
                    onBack={handleBackToList}
                    onSubmit={handleSubmitQuiz}
                />
            )}

            {quizResult && (
                <ResultSummary
                    result={quizResult}
                    onBack={handleBackToList}
                />
            )}
        </div>
    );
}
