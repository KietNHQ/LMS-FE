import React, { useMemo, useState } from "react";
import "./StudentQuiz.css";

import QuizHeader from "./components/QuizHeader/QuizHeader";
import QuizToolbar from "./components/QuizToolbar/QuizToolbar";
import QuizCard from "./components/QuizCard/QuizCard";
import QuizTakingView from "./components/QuizTakingView/QuizTakingView";
import ResultSummary from "./components/ResultSummary/ResultSummary";

import { quizList } from "./data/quizData";

export default function StudentQuiz() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [subjectFilter, setSubjectFilter] = useState("all");

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

                    <div className="student-quiz-grid">
                        {filteredQuizzes.map((quiz) => (
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