import React, { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { Modal } from "../../../components/ui";
import "./TeacherQuiz.css";
import TeacherQuizListSection from "./components/teacherQuizListSection/TeacherQuizListSection";
import CreateTeacherQuizDialog from "./components/createTeacherQuizDialog/CreateTeacherQuizDialog";

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
        createdByRole: "teacher",
        createdByName: "Lê Minh Hoàng",
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
        createdByRole: "teacher",
        createdByName: "Lê Minh Hoàng",
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
        createdByRole: "teacher",
        createdByName: "Lê Minh Hoàng",
    },
];

export default function TeacherQuiz() {
    const navigate = useNavigate();
    const location = useLocation();
    const createdQuizFromState = location.state?.createdQuiz;

    const [quizzes, setQuizzes] = useState(() =>
        createdQuizFromState ? [createdQuizFromState, ...initialQuizzes] : initialQuizzes
    );
    const [currentPage, setCurrentPage] = useState(1);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [pendingDeleteQuizId, setPendingDeleteQuizId] = useState(null);
    const [editingQuizId, setEditingQuizId] = useState(null);


    const totalPages = Math.max(1, Math.ceil(quizzes.length / ITEMS_PER_PAGE));
    const paginatedQuizzes = quizzes.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleDeleteQuiz = (quizId) => {
        setPendingDeleteQuizId(quizId);
    };

    const handleCancelDeleteQuiz = () => {
        setPendingDeleteQuizId(null);
    };

    const handleConfirmDeleteQuiz = () => {
        if (pendingDeleteQuizId == null) return;

        setQuizzes((prev) => {
            const nextQuizzes = prev.filter((q) => q.id !== pendingDeleteQuizId);
            const nextTotalPages = Math.max(
                1,
                Math.ceil(nextQuizzes.length / ITEMS_PER_PAGE)
            );

            setCurrentPage((prevPage) => Math.min(prevPage, nextTotalPages));
            return nextQuizzes;
        });

        setPendingDeleteQuizId(null);
    };

    const pendingDeleteQuiz = quizzes.find((quiz) => quiz.id === pendingDeleteQuizId);

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

    const handleOpenCreateDialog = () => {
        setEditingQuizId(null);
        setIsCreateDialogOpen(true);
    };

    const handleCloseCreateDialog = () => {
        setIsCreateDialogOpen(false);
        setEditingQuizId(null);
    };

    const handleCreateQuiz = (quizMeta) => {
        handleCloseCreateDialog();
        navigate("/teacher/quiz/create", {
            state: {
                quizMeta,
            },
        });
    };

    const handleOpenQuizQuestions = (quiz) => {
        navigate("/teacher/quiz/create", {
            state: {
                quizMeta: {
                    title: quiz.title,
                    subject: quiz.subject,
                    grade: quiz.grade,
                    duration: `${quiz.duration} phút`,
                    createdByRole: quiz.createdByRole || "teacher",
                    createdByName: quiz.createdByName || "",
                },
                mode: "edit",
            },
        });
    };

    const handleEditQuiz = (quiz) => {
        setEditingQuizId(quiz.id);
        setIsCreateDialogOpen(true);
    };

    const handleSubmitQuizMeta = (quizMeta) => {
        if (editingQuizId == null) {
            handleCreateQuiz(quizMeta);
            return;
        }

        setQuizzes((prev) =>
            prev.map((quiz) =>
                quiz.id === editingQuizId
                    ? {
                        ...quiz,
                        title: quizMeta.title,
                        subject: quizMeta.subject,
                        grade: quizMeta.grade,
                        createdByRole: quizMeta.createdByRole,
                        createdByName:
                            quizMeta.createdByRole === "teacher"
                                ? quizMeta.createdByName
                                : "Quản trị viên",
                    }
                    : quiz
            )
        );

        handleCloseCreateDialog();
    };

    const editingQuiz = quizzes.find((quiz) => quiz.id === editingQuizId) || null;

    return (
        <div className="teacher-quiz">
            <div className="teacher-quiz__header">
                <div className="teacher-quiz__content">
                    <div className="teacher-quiz__title-row">
                        <h1>Quản lý bài kiểm tra</h1>
                        <span className="teacher-quiz__count">
                            {quizzes.length} bài kiểm tra
                        </span>
                    </div>
                </div>
                <button
                    type="button"
                    className="teacher-quiz__create-btn"
                    onClick={handleOpenCreateDialog}
                >
                    <span>+</span>
                    Tạo bài kiểm tra
                </button>
            </div>

            <div className="teacher-quiz__body">
                <TeacherQuizListSection
                    quizzes={paginatedQuizzes}
                    onDelete={handleDeleteQuiz}
                    onStatusChange={handleStatusChange}
                    onEdit={handleEditQuiz}
                    onCardClick={handleOpenQuizQuestions}
                />

                {quizzes.length > 0 && (
                    <div className="teacher-quiz-pagination">
                        <button
                            type="button"
                            className="teacher-quiz-page-btn"
                            onClick={goPrevPage}
                            disabled={currentPage === 1}
                            aria-label="Trang trước"
                        >
                            <FiChevronLeft />
                        </button>

                        <div className="teacher-quiz-page-indicator">
                            <span>{currentPage}</span>
                            <small>/ {totalPages}</small>
                        </div>

                        <button
                            type="button"
                            className="teacher-quiz-page-btn"
                            onClick={goNextPage}
                            disabled={currentPage === totalPages}
                            aria-label="Trang sau"
                        >
                            <FiChevronRight />
                        </button>
                    </div>
                )}
            </div>

            <CreateTeacherQuizDialog
                key={editingQuizId != null ? `edit-${editingQuizId}` : (isCreateDialogOpen ? "create-open" : "create-closed")}
                open={isCreateDialogOpen}
                onClose={handleCloseCreateDialog}
                onSubmit={handleSubmitQuizMeta}
                title={editingQuiz ? "Sửa thông tin bài kiểm tra" : "Tạo bài kiểm tra mới"}
                submitLabel={editingQuiz ? "Lưu thông tin" : "Tạo"}
                initialValues={editingQuiz ? {
                    title: editingQuiz.title,
                    subject: editingQuiz.subject,
                    grade: editingQuiz.grade,
                    createdByRole: editingQuiz.createdByRole || "teacher",
                    createdByName: editingQuiz.createdByName || "",
                } : undefined}
            />

            <Modal
                open={pendingDeleteQuizId != null}
                onClose={handleCancelDeleteQuiz}
                title="Xác nhận xoá bài kiểm tra"
                className="teacher-quiz-delete-confirm"
            >
                <p className="teacher-quiz-delete-confirm__text">
                    Bạn có chắc muốn xoá thẻ
                    {" "}
                    <strong>{pendingDeleteQuiz?.title || "bài kiểm tra này"}</strong>
                    {" "}
                    không?
                </p>

                <div className="teacher-quiz-delete-confirm__actions">
                    <button
                        type="button"
                        className="teacher-quiz-delete-confirm__cancel"
                        onClick={handleCancelDeleteQuiz}
                    >
                        Huỷ
                    </button>
                    <button
                        type="button"
                        className="teacher-quiz-delete-confirm__submit"
                        onClick={handleConfirmDeleteQuiz}
                    >
                        Xoá
                    </button>
                </div>
            </Modal>
        </div>
    );
}