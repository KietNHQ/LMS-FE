import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Modal } from "../../../components/ui";
import "./ManagementQuiz.css";
import QuizListSection from "./components/quizListSection/quizListSection";
import CreateQuizDialog from "./components/createQuizDialog/CreateQuizDialog";
import QuizToolbar from "./components/quizToolbar/QuizToolbar";
import { SchoolYearTermSelector, Pagination } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import {
    DEFAULT_GRADE_FILTER_OPTIONS,
    formatDurationLabel,
    normalizeGrade,
    quizService,
} from "../../../services/shared/quiz/quizService";

const ITEMS_PER_PAGE = 4;

export default function ManagementQuiz() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const navigate = useNavigate();
    const location = useLocation();
    const [quizzes, setQuizzes] = useState([]);
    const [assignmentOptions, setAssignmentOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [pendingDeleteQuizId, setPendingDeleteQuizId] = useState(null);
    const [editingQuizId, setEditingQuizId] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("Tất cả môn");
    const [selectedGrade, setSelectedGrade] = useState("Tất cả khối");
    const [loadError, setLoadError] = useState("");

    const loadQuizzes = async () => {
        setIsLoading(true);
        setLoadError("");
        try {
            const result = await quizService.listQuizzes();
            setQuizzes(result.items || []);
        } catch (error) {
            setQuizzes([]);
            const msg = error?.response?.data?.message || error?.response?.data?.error || "Không tải được danh sách bài kiểm tra.";
            setLoadError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const loadAssignmentOptions = async () => {
        try {
            const options = await quizService.listClassTeacherSubjects();
            setAssignmentOptions(options);
        } catch {
            setAssignmentOptions([]);
        }
    };

    useEffect(() => {
        loadQuizzes();
        loadAssignmentOptions();
    }, []);

    useEffect(() => {
        if (location.state?.refreshList) {
            loadQuizzes();
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.pathname, location.state, navigate]);

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

    const handleConfirmDeleteQuiz = async () => {
        if (pendingDeleteQuizId == null) return;

        try {
            await quizService.deleteQuiz(pendingDeleteQuizId);
            setQuizzes((prev) => {
                const nextQuizzes = prev.filter((q) => q.id !== pendingDeleteQuizId);
                const nextTotalPages = Math.max(1, Math.ceil(nextQuizzes.length / ITEMS_PER_PAGE));
                setCurrentPage((prevPage) => Math.min(prevPage, nextTotalPages));
                return nextQuizzes;
            });
            setPendingDeleteQuizId(null);
        } catch (error) {
            alert(error?.response?.data?.message || error?.response?.data?.error || "Không xóa được bài kiểm tra.");
        }
    };

    const pendingDeleteQuiz = quizzes.find((quiz) => quiz.id === pendingDeleteQuizId);

    const handleStatusChange = async (quizId, newStatus) => {
        try {
            if (newStatus === "open") {
                await quizService.publishQuiz(quizId);
            } else {
                await quizService.unpublishQuiz(quizId);
            }

            setQuizzes((prev) =>
                prev.map((q) => (q.id === quizId ? { ...q, status: newStatus } : q))
            );
        } catch (error) {
            alert(error?.response?.data?.message || error?.response?.data?.error || "Không đổi được trạng thái bài kiểm tra.");
        }
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
        navigate("/management/quiz/create", {
            state: {
                quizMeta,
            },
        });
    };

    const handleOpenQuizQuestions = (quiz) => {
        navigate("/management/quiz/create", {
            state: {
                quizId: quiz.id,
                quizMeta: {
                    title: quiz.title,
                    subject: quiz.subject,
                    grade: quiz.grade,
                    classTeacherSubjectId: quiz.classTeacherSubjectId,
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

    const handleSubmitQuizMeta = async (quizMeta) => {
        if (editingQuizId == null) {
            handleCreateQuiz(quizMeta);
            return;
        }

        try {
            await quizService.updateQuiz(editingQuizId, {
                title: quizMeta.title,
                description: quizMeta.description,
                duration: quizMeta.duration,
                examType: quizMeta.examType,
            });

            await loadQuizzes();
            handleCloseCreateDialog();
        } catch (error) {
            alert(error?.response?.data?.message || error?.response?.data?.error || "Không cập nhật được bài kiểm tra.");
        }
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
                {isLoading ? (
                    <div style={{ textAlign: "center", color: "#666", marginTop: "2rem" }}>
                        Đang tải dữ liệu...
                    </div>
                ) : loadError ? (
                    <div style={{ textAlign: "center", color: "#666", marginTop: "2rem" }}>
                        {loadError}
                    </div>
                ) : filteredQuizzes.length === 0 ? (
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
                assignmentOptions={assignmentOptions}
                requireAssignment={!editingQuiz}
                initialValues={editingQuiz ? {
                    title: editingQuiz.title,
                    subject: editingQuiz.subject,
                    grade: editingQuiz.grade,
                    classTeacherSubjectId: editingQuiz.classTeacherSubjectId,
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

