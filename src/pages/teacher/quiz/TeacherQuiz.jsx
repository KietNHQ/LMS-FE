import React, { useMemo, useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { Modal } from "../../../components/ui";
import { LoadingSpinner } from "../../../components/common";
import { DEFAULT_PROFILE_BY_ROLE } from "../../../components/common/Dialog/ProfileDialog/profileData";
import {
    buildFinalScore,
    formatDurationLabel,
    parseDurationMinutes,
    quizService,
} from "../../../services/shared/quiz/quizService";
import { teacherService } from "../../../services/pages/teacher/teacherService";
import "./TeacherQuiz.css";
import TeacherQuizListSection from "./components/teacherQuizListSection/TeacherQuizListSection";
import CreateTeacherQuizDialog from "./components/createTeacherQuizDialog/CreateTeacherQuizDialog";
import SubmissionReviewDialog from "./components/submissionReviewDialog/SubmissionReviewDialog";
import { toast } from "react-toastify";

const ITEMS_PER_PAGE = 4;
const CURRENT_TEACHER_NAME = DEFAULT_PROFILE_BY_ROLE.teacher.name;

const buildSubmissionState = (submissions = []) => {
    const normalizedSubmissions = submissions.map((submission) => ({
        ...submission,
        finalScore: buildFinalScore({
            autoScore: submission.autoScore,
            essayScore: submission.essayScore,
        }),
    }));

    const pendingEssayCount = normalizedSubmissions.filter(
        (item) => item.essayMaxScore > 0 && !item.isEssayGraded
    ).length;

    return {
        submissions: normalizedSubmissions,
        pendingEssayCount,
        isScoreReadyForGradebook: pendingEssayCount === 0 && normalizedSubmissions.length > 0,
    };
};

const initialQuizzes = [
    {
        id: 1,
        title: "Toán 10 - Kiểm tra 15 phút Chương 1",
        description: "Bài kiểm tra nhanh chương 1 toán lớp 10",
        subject: "Toán",
        grade: "Khối 10",
        questions: 3,
        duration: 15,
        durationLabel: "15 phút",
        fullQuestions: [
            { id: 1, type: "multiple-choice", text: "1 + 1 bằng mấy?", options: ["1", "2", "3", "4"], correctAnswer: "2" },
            { id: 2, type: "multiple-choice", text: "Căn bậc hai của 16?", options: ["2", "4", "8", "6"], correctAnswer: "4" },
            { id: 3, type: "essay", text: "Nêu định nghĩa đạo hàm tại một điểm.", essayMaxScore: 2 },
        ],
        status: "open",
        isLocked: false,
        createdAt: "2024-03-20",
        createdByRole: "teacher",
        createdByName: "Lê Minh Hoàng",
        examType: "Thường xuyên",
        className: "10A1",
        ...buildSubmissionState([
            {
                id: "s-1",
                studentName: "Nguyễn Văn An",
                submittedAt: "08/04/2026 08:15",
                autoScore: 5.0,
                essayScore: 1.25,
                essayMaxScore: 2,
                isEssayGraded: true,
                answers: {
                    1: "2",
                    2: "2", // Wrong, correct is "4"
                    3: "Em trình bày đúng định lý và có ví dụ minh họa.",
                },
            },
            {
                id: "s-2",
                studentName: "Trần Mai Linh",
                submittedAt: "08/04/2026 08:22",
                autoScore: 10.0,
                essayScore: 0,
                essayMaxScore: 2,
                isEssayGraded: false,
                answers: {
                    1: "2",
                    2: "4",
                    3: "Bài làm có ý chính nhưng thiếu bước biến đổi cuối.",
                },
            },
        ]),
    },
    {
        id: 2,
        title: "Vật Lý 10 - Kiểm tra 1 tiết Chương 1",
        description: "Bài kiểm tra chương 1 vật lý lớp 10",
        subject: "Vật Lý",
        grade: "Khối 10",
        questions: 15,
        duration: 45,
        durationLabel: "1 tiết (45 phút)",
        status: "open",
        createdAt: "2024-03-19",
        createdByRole: "admin",
        createdByName: "Quản trị viên",
        examType: "Giữa kỳ",
        className: "10A2",
        gradingAssignment: {
            required: true,
            source: "random",
            assignedTeacherName: CURRENT_TEACHER_NAME,
        },
        ...buildSubmissionState([
            {
                id: "s-3",
                studentName: "Lê Hồng Phúc",
                submittedAt: "08/04/2026 10:01",
                autoScore: 6,
                essayScore: 0,
                essayMaxScore: 2,
                isEssayGraded: false,
                essayAnswer: "Em giải thích đúng khái niệm nhưng thiếu ví dụ thực tế.",
            },
        ]),
    },
    {
        id: 3,
        title: "Hóa Học 10 - Chương 2",
        description: "Bài kiểm tra chương 2 hóa học lớp 10",
        subject: "Hóa Học",
        grade: "Khối 10",
        questions: 18,
        duration: 45,
        durationLabel: "1 tiết (45 phút)",
        status: "hidden",
        createdAt: "2024-03-18",
        createdByRole: "teacher",
        createdByName: "Lê Minh Hoàng",
        examType: "Thường xuyên",
        className: "10A3",
        ...buildSubmissionState([]),
    },
];

export default function TeacherQuiz() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [quizzes, setQuizzes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [pendingDeleteQuizId, setPendingDeleteQuizId] = useState(null);
    const [editingQuizId, setEditingQuizId] = useState(null);
    const [reviewingQuizId, setReviewingQuizId] = useState(null);
    const [publishConfirmQuiz, setPublishConfirmQuiz] = useState(null);

    const fetchQuizzes = async () => {
        try {
            setIsLoading(true);
            setError(null);
            // Try real API first, fallback to mock if 401 or dev environment
            let response;
            try {
                response = await quizService.listQuizzes();
            } catch (apiErr) {
                console.warn("API listQuizzes failed, using mock:", apiErr);
                // If 401 or No refresh token, automatically use mock for demo purposes
                if (apiErr.message?.includes("401") || apiErr.message?.includes("refresh token")) {
                    response = await teacherService.listQuizzes({ mock: true });
                } else {
                    throw apiErr;
                }
            }
            
            setQuizzes(response.items || []);
        } catch (err) {
            console.error("Fetch quizzes error:", err);
            setError("Không thể tải danh sách bài kiểm tra.");
            toast.error("Đã xảy ra lỗi khi tải dữ liệu.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const reviewingQuiz = useMemo(
        () => quizzes.find((quiz) => quiz.id === reviewingQuizId) || null,
        [quizzes, reviewingQuizId]
    );

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

    const handleConfirmDeleteQuiz = async () => {
        if (pendingDeleteQuizId == null) return;

        try {
            await quizService.deleteQuiz(pendingDeleteQuizId);
            setQuizzes((prev) => prev.filter((q) => q.id !== pendingDeleteQuizId));
            toast.success("Xoá bài kiểm tra thành công.");
        } catch (err) {
            console.error("Delete quiz error:", err);
            toast.error("Không thể xoá bài kiểm tra.");
        } finally {
            setPendingDeleteQuizId(null);
        }
    };

    const pendingDeleteQuiz = quizzes.find((quiz) => quiz.id === pendingDeleteQuizId);

    const handleStatusChange = async (quizId, newStatus) => {
        try {
            if (newStatus === "open") {
                const quiz = quizzes.find((q) => q.id === quizId);
                if (quiz && quiz.quizType === "exam") {
                    setPublishConfirmQuiz(quiz);
                    return;
                }
                await quizService.publishQuiz(quizId, { scope: "class" });
            } else {
                await quizService.unpublishQuiz(quizId);
            }
            setQuizzes((prev) =>
                prev.map((q) => (q.id === quizId ? { ...q, status: newStatus } : q))
            );
            toast.success(newStatus === "open" ? "Đã hiển thị bài kiểm tra." : "Đã ẩn bài kiểm tra.");
        } catch (err) {
            console.error("Status change error:", err);
            toast.error("Không thể thay đổi trạng thái.");
        }
    };

    const handleConfirmPublish = async (quizId, scope) => {
        setPublishConfirmQuiz(null);
        try {
            await quizService.publishQuiz(quizId, { scope });
            setQuizzes((prev) =>
                prev.map((q) => (q.id === quizId ? { ...q, status: "open" } : q))
            );
            
            // Refresh list to fetch newly cloned exams
            fetchQuizzes();
            
            toast.success(scope === "grade" ? "Đã phát đề thi thành công cho toàn bộ lớp thuộc Khối!" : "Đã hiển thị bài kiểm tra.");
        } catch (err) {
            console.error("Publish error:", err);
            const errorMsg = err.response?.data?.error || "Không thể xuất bản bài kiểm tra.";
            toast.error(errorMsg);
        }
    };

    const handleLockToggle = async (quizId, isLocked) => {
        try {
            // Assuming lock is a property of updateQuiz or separate endpoint
            // For now, let's treat it as a status update if backend supports it
            await quizService.updateQuiz(quizId, { isLocked });
            setQuizzes((prev) =>
                prev.map((q) => (q.id === quizId ? { ...q, isLocked } : q))
            );
            toast.success(isLocked ? "Đã khóa bài làm." : "Đã mở khóa bài làm.");
        } catch (err) {
            console.error("Lock toggle error:", err);
            toast.error("Không thể thay đổi trạng thái khóa.");
        }
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
                    id: quiz.id,
                    title: quiz.title,
                    subject: quiz.subject,
                    grade: quiz.grade,
                    duration: quiz.durationLabel || formatDurationLabel(quiz.duration),
                    createdByRole: quiz.createdByRole || "teacher",
                    createdByName: quiz.createdByName || "",
                    classTeacherSubjectId: quiz.classTeacherSubjectId || quiz.class_teacher_subject_id,
                },
                mode: "edit",
            },
        });
    };

    const handleEditQuiz = (quiz) => {
        setEditingQuizId(quiz.id);
        setIsCreateDialogOpen(true);
    };

    const handleOpenSubmissionReview = (quiz) => {
        setReviewingQuizId(quiz.id);
    };

    const handleCloseSubmissionReview = () => {
        setReviewingQuizId(null);
    };

    const handleSaveEssayScore = (quizId, submissionId, essayScore) => {
        setQuizzes((prev) =>
            prev.map((quiz) => {
                if (quiz.id !== quizId) {
                    return quiz;
                }

                const nextSubmissions = (quiz.submissions || []).map((submission) => {
                    if (submission.id !== submissionId) {
                        return submission;
                    }

                    const nextFinalScore = buildFinalScore({
                        autoScore: submission.autoScore,
                        essayScore,
                    });

                    return {
                        ...submission,
                        essayScore,
                        isEssayGraded: submission.essayMaxScore > 0 ? true : submission.isEssayGraded,
                        finalScore: nextFinalScore,
                    };
                });

                const pendingEssayCount = nextSubmissions.filter(
                    (item) => item.essayMaxScore > 0 && !item.isEssayGraded
                ).length;

                return {
                    ...quiz,
                    submissions: nextSubmissions,
                    pendingEssayCount,
                    isScoreReadyForGradebook: pendingEssayCount === 0 && nextSubmissions.length > 0,
                };
            })
        );
    };

    const handleSubmitQuizMeta = async (quizMeta) => {
        if (editingQuizId == null) {
            handleCreateQuiz(quizMeta);
            return;
        }

        try {
            await quizService.updateQuiz(editingQuizId, {
                title: quizMeta.title,
                duration: quizMeta.duration,
                classTeacherSubjectId: quizMeta.classTeacherSubjectId,
                gradingMode: quizMeta.gradingMode,
                semesterId: quizMeta.semesterId,
                assessmentType: quizMeta.assessmentType,
                isSynchronous: quizMeta.isSynchronous,
            });

            setQuizzes((prev) =>
                prev.map((quiz) =>
                    quiz.id === editingQuizId
                        ? {
                            ...quiz,
                            title: quizMeta.title,
                            subject: quizMeta.subject,
                            grade: quizMeta.grade,
                            className: quizMeta.className,
                            semesterId: quizMeta.semesterId,
                            gradingMode: quizMeta.gradingMode,
                            duration: parseDurationMinutes(quizMeta.duration || quiz.duration),
                            durationLabel: formatDurationLabel(quizMeta.duration || quiz.durationLabel),
                            createdByRole: quizMeta.createdByRole,
                            createdByName:
                                quizMeta.createdByRole === "teacher"
                                    ? quizMeta.createdByName
                                    : "Quản trị viên",
                        }
                        : quiz
                )
            );
            
            toast.success("Cập nhật thông tin bài kiểm tra thành công.");
            handleCloseCreateDialog();
        } catch (err) {
            console.error("Failed to update quiz meta:", err);
            toast.error("Không thể lưu thay đổi bài kiểm tra.");
        }
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
                {isLoading ? (
                    <div className="teacher-quiz-loading">
                        <LoadingSpinner label="Đang tải danh sách bài kiểm tra..." />
                    </div>
                ) : error ? (
                    <div className="teacher-quiz-error">
                        <p>{error}</p>
                        <button onClick={fetchQuizzes} className="teacher-quiz-retry-btn">Thử lại</button>
                    </div>
                ) : (
                    <TeacherQuizListSection
                        quizzes={paginatedQuizzes}
                        onDelete={handleDeleteQuiz}
                        onStatusChange={handleStatusChange}
                        onEdit={handleEditQuiz}
                        onCardClick={handleOpenQuizQuestions}
                        onOpenSubmissionReview={handleOpenSubmissionReview}
                        onLockToggle={handleLockToggle}
                    />
                )}

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
                    className: editingQuiz.className,
                    classTeacherSubjectId: editingQuiz.classTeacherSubjectId,
                    duration: editingQuiz.durationLabel || formatDurationLabel(editingQuiz.duration),
                    createdByRole: editingQuiz.createdByRole || "teacher",
                    createdByName: editingQuiz.createdByName || "",
                    semesterId: editingQuiz.semesterId || editingQuiz.semester_id,
                    gradingMode: editingQuiz.gradingMode || editingQuiz.grading_mode,
                    assessmentType: editingQuiz.assessmentType || editingQuiz.assessment_type,
                    isSynchronous: editingQuiz.isSynchronous || editingQuiz.is_synchronous,
                } : undefined}
            />

            <SubmissionReviewDialog
                open={reviewingQuizId != null}
                quiz={reviewingQuiz}
                currentTeacherName={CURRENT_TEACHER_NAME}
                onClose={handleCloseSubmissionReview}
                onSaveEssayScore={handleSaveEssayScore}
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

            {/* Modal Xác nhận xuất bản Đề thi chung */}
            <Modal
                open={publishConfirmQuiz !== null}
                onClose={() => setPublishConfirmQuiz(null)}
                title="Xuất bản Đề thi chung cả Khối"
                className="teacher-quiz__publish-confirm-modal"
            >
                <div className="teacher-quiz__publish-confirm-content">
                    <p className="teacher-quiz__publish-confirm-text">
                        Bạn đang chuẩn bị xuất bản Đề thi định kỳ <strong>"{publishConfirmQuiz?.title}"</strong> môn <strong>{publishConfirmQuiz?.subject}</strong>.
                    </p>
                    <p className="teacher-quiz__publish-confirm-note">
                        Vui lòng lựa chọn phạm vi phát đề thi này:
                    </p>
                    
                    <div className="teacher-quiz__publish-confirm-options">
                        <button
                            type="button"
                            className="teacher-quiz__publish-btn-grade"
                            onClick={() => handleConfirmPublish(publishConfirmQuiz.id, "grade")}
                        >
                            <span className="teacher-quiz__btn-title">Phát đề cả Khối (Khuyên dùng)</span>
                            <span className="teacher-quiz__btn-desc">
                                Hệ thống tự động nhân bản đề thi và câu hỏi cho tất cả các lớp thuộc {publishConfirmQuiz?.grade} học môn {publishConfirmQuiz?.subject}.
                            </span>
                        </button>
                        
                        <button
                            type="button"
                            className="teacher-quiz__btn-class"
                            onClick={() => handleConfirmPublish(publishConfirmQuiz.id, "class")}
                        >
                            <span className="teacher-quiz__btn-title">Chỉ phát cho lớp hiện tại ({publishConfirmQuiz?.className})</span>
                            <span className="teacher-quiz__btn-desc">
                                Chỉ học sinh thuộc lớp {publishConfirmQuiz?.className} mới nhìn thấy và làm bài thi này.
                            </span>
                        </button>
                    </div>
                </div>
                
                <div className="teacher-quiz__publish-confirm-actions">
                    <button
                        type="button"
                        className="teacher-quiz__publish-confirm-cancel"
                        onClick={() => setPublishConfirmQuiz(null)}
                    >
                        Quay lại
                    </button>
                </div>
            </Modal>
        </div>
    );
}



