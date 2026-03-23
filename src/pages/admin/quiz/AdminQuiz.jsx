import React, { useState } from "react";
import "./AdminQuiz.css";
import QuizListSection from "./components/quizListSection/quizListSection";
import QuizDetailDialog from "./components/quizDetailDialog/QuizDetailDialog";

const initialQuizzes = [
    {
        id: 1,
        title: "Toán 10 - Chương 1",
        description: "Bài kiểm tra chương 1 toán lớp 10",
        subject: "Toán",
        grade: "Khối 10",
        questions: 20,
        duration: 45,
        status: "open",
        createdAt: "2024-03-20",
    },
    {
        id: 2,
        title: "Vật Lý 10 - Chương 1",
        description: "Bài kiểm tra chương 1 vật lý lớp 10",
        subject: "Vật Lý",
        grade: "Khối 10",
        questions: 15,
        duration: 30,
        status: "open",
        createdAt: "2024-03-19",
    },
    {
        id: 3,
        title: "Hóa Học 10 - Chương 2",
        description: "Bài kiểm tra chương 2 hóa học lớp 10",
        subject: "Hóa Học",
        grade: "Khối 10",
        questions: 18,
        duration: 40,
        status: "hidden",
        createdAt: "2024-03-18",
    },
];

export default function AdminQuiz() {
    const [quizzes, setQuizzes] = useState(initialQuizzes);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

    const handleViewQuiz = (quiz) => {
        setSelectedQuiz(quiz);
        setIsDetailDialogOpen(true);
    };

    const handleEditQuiz = (updatedQuiz) => {
        setQuizzes((prev) =>
            prev.map((q) => (q.id === updatedQuiz.id ? updatedQuiz : q))
        );
        setIsDetailDialogOpen(false);
        setSelectedQuiz(null);
    };

    const handleDeleteQuiz = (quizId) => {
        setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
    };

    const handleStatusChange = (quizId, newStatus) => {
        setQuizzes((prev) =>
            prev.map((q) =>
                q.id === quizId ? { ...q, status: newStatus } : q
            )
        );
    };

    return (
        <div className="admin-quiz">
            <div className="admin-quiz__header">
                <div className="admin-quiz__content">
                    <h1>Bài Kiểm Tra</h1>
                    <p>{quizzes.length} bài kiểm tra</p>
                </div>
                <button className="admin-quiz__create-btn">
                    <span>+</span>
                    Tạo bài kiểm tra
                </button>
            </div>

            <QuizListSection
                quizzes={quizzes}
                onView={handleViewQuiz}
                onDelete={handleDeleteQuiz}
                onStatusChange={handleStatusChange}
            />

            {isDetailDialogOpen && selectedQuiz && (
                <QuizDetailDialog
                    quiz={selectedQuiz}
                    onClose={() => setIsDetailDialogOpen(false)}
                    onSave={handleEditQuiz}
                />
            )}
        </div>
    );
}

