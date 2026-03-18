import React, { useEffect, useMemo, useState } from "react";
import "./StudentQuiz.css";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Card } from "../../../components/ui";

import QuizHeader from "./components/QuizHeader/QuizHeader";
import QuizToolbar from "./components/QuizToolbar/QuizToolbar";
import QuizCard from "./components/QuizCard/QuizCard";
import QuizTakingView from "./components/QuizTakingView/QuizTakingView";
import ResultSummary from "./components/ResultSummary/ResultSummary";

import { quizList } from "./data/quizData";

const ITEMS_PER_PAGE = 4;

export default function StudentQuiz() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [subjectFilter, setSubjectFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);

    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [quizResult, setQuizResult] = useState(null);

    const subjects = useMemo(() => {
        const uniqueSubjects = [...new Set(quizList.map((quiz) => quiz.subject))];
        return uniqueSubjects;
    }, []);

    const stats = useMemo(() => {
        return {
            total: quizList.length,
            open: quizList.filter((quiz) => quiz.status === "open").length,
            done: quizList.filter((quiz) => quiz.status === "done").length,
        };
    }, []);

    const filteredQuizzes = useMemo(() => {
        return quizList.filter((quiz) => {
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
    }, [search, statusFilter, subjectFilter]);

    const totalPages = useMemo(() => {
        return Math.max(1, Math.ceil(filteredQuizzes.length / ITEMS_PER_PAGE));
    }, [filteredQuizzes.length]);

    const paginatedQuizzes = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredQuizzes.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredQuizzes, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, subjectFilter]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const handleStartQuiz = (quiz) => {
        if (quiz.status !== "open") return;
        setQuizResult(null);
        setSelectedQuiz(quiz);
    };

    const handleSubmitQuiz = (quiz, answers) => {
        const correctCount = quiz.questions.filter(
            (question) => answers[question.id] === question.correctAnswer
        ).length;

        const total = quiz.questions.length;
        const score = Number(((correctCount / total) * 10).toFixed(1));

        setQuizResult({
            quizTitle: quiz.title,
            score,
            correctCount,
            total,
            answers,
            questions: quiz.questions,
        });

        setSelectedQuiz(null);
    };

    const handleBackToList = () => {
        setSelectedQuiz(null);
        setQuizResult(null);
    };

    return (
        <div className="student-quiz-page">
            {!selectedQuiz && !quizResult && (
                <>
                    <QuizHeader stats={stats} />

                    <QuizToolbar
                        search={search}
                        onSearchChange={setSearch}
                        statusFilter={statusFilter}
                        onStatusChange={setStatusFilter}
                        subjectFilter={subjectFilter}
                        onSubjectChange={setSubjectFilter}
                        subjects={subjects}
                    />

                    <Card className="student-quiz-main-card" bodyClassName="student-quiz-main-card__body">
                        <div className="student-quiz-grid">
                            {paginatedQuizzes.map((quiz) => (
                                <QuizCard
                                    key={quiz.id}
                                    quiz={quiz}
                                    onStart={handleStartQuiz}
                                />
                            ))}
                        </div>

                        {filteredQuizzes.length === 0 && (
                            <div className="student-quiz-empty">
                                <h3>Không tìm thấy bài kiểm tra phù hợp</h3>
                                <p>Hãy thử thay đổi từ khóa hoặc bộ lọc.</p>
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
                                        <span>{currentPage}</span>
                                        <small>/ {totalPages}</small>
                                    </div>

                                    <button
                                        type="button"
                                        className="student-quiz-page-btn"
                                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
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