import React, { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Modal } from "../../../components/ui";
import "./AdminQuiz.css";
import QuizListSection from "./components/quizListSection/quizListSection";
import CreateQuizDialog from "./components/createQuizDialog/CreateQuizDialog";
import QuizToolbar from "./components/quizToolbar/QuizToolbar";
import { SchoolYearTermSelector, Pagination } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import {
    DEFAULT_GRADE_FILTER_OPTIONS,
    formatDurationLabel,
    normalizeGrade,
    parseDurationMinutes,
} from "../../../services/shared/quiz/quizService";

const ITEMS_PER_PAGE = 4;

const initialQuizzes = [
    {
        id: 1,
        title: "Toán 10 - Kiểm tra giữa kỳ",
        description: "Bài kiểm tra giữa kỳ toán lớp 10",
        subject: "Toán",
        grade: "Khối 10",
        questions: 20,
        duration: 45,
        durationLabel: "1 tiết (45 phút)",
        status: "open",
        createdAt: "2024-03-20",
        createdByRole: "admin",
        createdByName: "Quản trị viên",
        examType: "Giữa kỳ",
        submissionCount: 12,
        gradingAssignment: {
            required: true,
            source: "random",
            assignedTeacherName: "Lê Minh Hoàng",
        },
        gradingStatus: "in-progress",
    },
    {
        id: 2,
        title: "Vật Lý 10 - Kiểm tra 15 phút Chương 1",
        description: "Bài kiểm tra chương 1 vật lý lớp 10",
        subject: "Vật Lý",
        grade: "Khối 10",
        questions: 15,
        duration: 15,
        durationLabel: "15 phút",
        status: "open",
        createdAt: "2024-03-19",
        createdByRole: "teacher",
        createdByName: "Lê Minh Hoàng",
        examType: "Thường xuyên",
        submissionCount: 8,
        gradingStatus: "ready",
    },
    {
        id: 3,
        title: "Hóa Học 10 - Cuối kỳ Chương 2",
        description: "Bài kiểm tra cuối kỳ hóa học lớp 10",
        subject: "Hóa Học",
        grade: "Khối 10",
        questions: 18,
        duration: 45,
        durationLabel: "1 tiết (45 phút)",
        status: "hidden",
        createdAt: "2024-03-18",
        createdByRole: "admin",
        createdByName: "Quản trị viên",
        examType: "Cuối kỳ",
        submissionCount: 0,
        gradingAssignment: {
            required: false,
            source: "none",
            assignedTeacherName: "",
        },
        gradingStatus: "no-submission",
    },
];

export default function AdminQuiz() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const navigate = useNavigate();
    const location = useLocation();
    const createdQuizFromState = location.state?.createdQuiz;

    const [quizzes, setQuizzes] = useState(() =>
        createdQuizFromState
            ? [{
                ...createdQuizFromState,
                duration: parseDurationMinutes(createdQuizFromState.duration),
                durationLabel: formatDurationLabel(createdQuizFromState.durationLabel || createdQuizFromState.duration),
                examType: createdQuizFromState.examType || "Thường xuyên",
                submissionCount: createdQuizFromState.submissionCount || 0,
                gradingStatus: createdQuizFromState.gradingStatus || "no-submission",
            }, ...initialQuizzes]
            : initialQuizzes
    );
    const [currentPage, setCurrentPage] = useState(1);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [pendingDeleteQuizId, setPendingDeleteQuizId] = useState(null);
    const [editingQuizId, setEditingQuizId] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("Tất cả môn");
    const [selectedGrade, setSelectedGrade] = useState("Tất cả khối");

    const subjectOptions = useMemo(() => {
        const subjects = new Set(quizzes.map((q) => q.subject));
        return ["Tất cả môn", ...Array.from(subjects)];
    }, [quizzes]);

    const gradeOptions = useMemo(() => {
        const grades = quizzes.map((q) => q.grade).filter(Boolean);
        const uniqueGradeOptions = Array.from(new Set(grades));

        return Array.from(new Set([...DEFAULT_GRADE_FILTER_OPTIONS, ...uniqueGradeOptions]));
    }, [quizzes]);

    const filteredQuizzes = useMemo(() => {
        return quizzes.filter((quiz) => {
            const term = searchTerm.toLowerCase();
            const matchSearch =
                quiz.title.toLowerCase().includes(term) ||
                quiz.description.toLowerCase().includes(term);
            const matchSubject =
                selectedSubject === "Tất cả môn" || quiz.subject === selectedSubject;
            const matchGrade =
                selectedGrade === "Tất cả khối" ||
                normalizeGrade(quiz.grade) === normalizeGrade(selectedGrade);

            return matchSearch && matchSubject && matchGrade;
        });
    }, [quizzes, searchTerm, selectedSubject, selectedGrade]);

    // Reset pagination when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedSubject, selectedGrade]);

    const totalPages = Math.max(1, Math.ceil(filteredQuizzes.length / ITEMS_PER_PAGE));
    const paginatedQuizzes = filteredQuizzes.slice(
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
        setCurrentPage(nextPage);
    };

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
        navigate("/admin/quiz/create", {
            state: {
                quizMeta,
            },
        });
    };

    const handleOpenQuizQuestions = (quiz) => {
        navigate("/admin/quiz/create", {
            state: {
                quizMeta: {
                    title: quiz.title,
                    subject: quiz.subject,
                    grade: quiz.grade,
                    duration: quiz.durationLabel || formatDurationLabel(quiz.duration),
                    examFormat: quiz.examFormat || "Trắc nghiệm",
                    examType: quiz.examType || "Thường xuyên",
                    createdByRole: quiz.createdByRole || "admin",
                    createdByName: quiz.createdByName || "Quản trị viên",
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
                        duration: parseDurationMinutes(quizMeta.duration || quiz.duration),
                        durationLabel: formatDurationLabel(quizMeta.duration || quiz.durationLabel),
                        examFormat: quizMeta.examFormat,
                        examType: quizMeta.examType || "Thường xuyên",
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
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
                <QuizToolbar
                    searchTerm={searchTerm}
                    selectedSubject={selectedSubject}
                    selectedGrade={selectedGrade}
                    subjectOptions={subjectOptions}
                    gradeOptions={gradeOptions}
                    onSearchChange={setSearchTerm}
                    onSubjectChange={setSelectedSubject}
                    onGradeChange={setSelectedGrade}
                    onCreateClick={handleOpenCreateDialog}
                />
            </div>

            <div className="admin-quiz__body">
                {filteredQuizzes.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>
                        Không có bài kiểm tra nào phù hợp với bộ lọc.
                    </div>
                ) : (
                    <QuizListSection
                        quizzes={paginatedQuizzes}
                        onDelete={handleDeleteQuiz}
                        onStatusChange={handleStatusChange}
                        onEdit={handleEditQuiz}
                        onCardClick={handleOpenQuizQuestions}
                    />
                )}

                {filteredQuizzes.length > 0 && (
                    <div className="admin-quiz-pagination-row">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            ariaLabel="Phân trang bài kiểm tra"
                        />
                    </div>
                )}
            </div>

            <CreateQuizDialog
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
                    duration: editingQuiz.durationLabel || formatDurationLabel(editingQuiz.duration),
                    examFormat: editingQuiz.examFormat || "Trắc nghiệm",
                    examType: editingQuiz.examType || "Thường xuyên",
                    createdByRole: editingQuiz.createdByRole || "admin",
                    createdByName: editingQuiz.createdByName || "",
                } : undefined}
            />

            <Modal
                open={pendingDeleteQuizId != null}
                onClose={handleCancelDeleteQuiz}
                title="Xác nhận xoá bài kiểm tra"
                className="admin-quiz-delete-confirm"
            >
                <p className="admin-quiz-delete-confirm__text">
                    Bạn có chắc muốn xoá thẻ
                    {" "}
                    <strong>{pendingDeleteQuiz?.title || "bài kiểm tra này"}</strong>
                    {" "}
                    không?
                </p>

                <div className="admin-quiz-delete-confirm__actions">
                    <button
                        type="button"
                        className="admin-quiz-delete-confirm__cancel"
                        onClick={handleCancelDeleteQuiz}
                    >
                        Huỷ
                    </button>
                    <button
                        type="button"
                        className="admin-quiz-delete-confirm__submit"
                        onClick={handleConfirmDeleteQuiz}
                    >
                        Xoá
                    </button>
                </div>
            </Modal>
        </div>
    );
}
