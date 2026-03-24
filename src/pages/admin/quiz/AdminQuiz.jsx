import React, { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "./AdminQuiz.css";
import QuizListSection from "./components/quizListSection/quizListSection";

const ITEMS_PER_PAGE = 4;

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
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.max(1, Math.ceil(quizzes.length / ITEMS_PER_PAGE));
    const paginatedQuizzes = quizzes.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleDeleteQuiz = (quizId) => {
        setQuizzes((prev) => {
            const nextQuizzes = prev.filter((q) => q.id !== quizId);
            const nextTotalPages = Math.max(
                1,
                Math.ceil(nextQuizzes.length / ITEMS_PER_PAGE)
            );

            setCurrentPage((prevPage) => Math.min(prevPage, nextTotalPages));
            return nextQuizzes;
        });
    };

    const handleStatusChange = (quizId, newStatus) => {
        setQuizzes((prev) =>
            prev.map((q) =>
                q.id === quizId ? { ...q, status: newStatus } : q
            )
        );
    };

    const handlePageChange = (nextPage) => {
        if (nextPage < 1 || nextPage > totalPages) {
            return;
        }
        setCurrentPage(nextPage);
    };

    const goPrevPage = () => handlePageChange(currentPage - 1);
    const goNextPage = () => handlePageChange(currentPage + 1);

    return (
        <div className="admin-quiz">
            <div className="admin-quiz__header">
                <div className="admin-quiz__content">
                    <div className="admin-quiz__title-row">
                        <h1>Quản lý bài kiểm tra</h1>
                        <span className="admin-quiz__count">
                            {quizzes.length} bài kiểm tra
                        </span>
                    </div>
                </div>
                <button className="admin-quiz__create-btn">
                    <span>+</span>
                    Tạo bài kiểm tra
                </button>
            </div>

            <div className="admin-quiz__body">
                <QuizListSection
                    quizzes={paginatedQuizzes}
                    onDelete={handleDeleteQuiz}
                    onStatusChange={handleStatusChange}
                />

                {quizzes.length > 0 && (
                    <div className="admin-quiz-pagination">
                        <button
                            type="button"
                            className="admin-quiz-page-btn"
                            onClick={goPrevPage}
                            disabled={currentPage === 1}
                            aria-label="Trang trước"
                        >
                            <FiChevronLeft />
                        </button>

                        <div className="admin-quiz-page-indicator">
                            <span>{currentPage}</span>
                            <small>/ {totalPages}</small>
                        </div>

                        <button
                            type="button"
                            className="admin-quiz-page-btn"
                            onClick={goNextPage}
                            disabled={currentPage === totalPages}
                            aria-label="Trang sau"
                        >
                            <FiChevronRight />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

