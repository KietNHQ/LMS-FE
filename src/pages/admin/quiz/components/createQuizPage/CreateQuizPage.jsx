import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiArrowLeft, FiDownload, FiMenu, FiPlus, FiUpload, FiX } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { Modal } from "../../../../../components/ui";
import CreateEditQuizSection from "../../../../teacher/quiz/components/createEditQuizSection/CreateEditQuizSection";
import AssignQuizSection from "../../../../teacher/quiz/components/assignQuizSection/AssignQuizSection";
import QuizListSection from "../../../../teacher/quiz/components/quizListSection/QuizListSection";
import CreateQuizDialog from "../createQuizDialog/CreateQuizDialog";
import "./CreateQuizPage.css";

const MAX_QUESTION_SCORE = 10;
const MAX_QUIZ_TOTAL_SCORE = 10;
const ADMIN_SCORE_STEP = 0.25;

const emptyForm = {
    question: "",
    questionImage: "",
    answers: {
        A: "",
        B: "",
        C: "",
        D: "",
    },
    correctAnswer: "A",
    score: "0.25",
};

const createQuizFromMeta = (meta = {}) => ({
    id: Date.now(),
    title: meta.title || "Bài kiểm tra mới",
    subject: meta.subject || "",
    className: meta.grade || "",
    duration: meta.duration || "45 phút",
    createdByRole: meta.createdByRole || "admin",
    createdByName:
        meta.createdByRole === "teacher"
            ? meta.createdByName || ""
            : "Quản trị viên",
    questions: [],
});

const getQuestionScoreValue = (score) => {
    const parsed = Number.parseFloat(score);
    return Number.isFinite(parsed) ? parsed : 0;
};

const getTotalScore = (questions = []) =>
    questions.reduce((sum, item) => sum + getQuestionScoreValue(item.score), 0);

const parseDurationMinutes = (durationValue) => {
    const matched = String(durationValue || "").match(/\d+/);
    return matched ? Number(matched[0]) : 45;
};

const buildQuizCardPayload = (quizData, quizCardId) => ({
    id: quizCardId || Date.now(),
    title: quizData.title,
    description: `Bài kiểm tra ${quizData.subject || ""}`.trim(),
    subject: quizData.subject || "",
    grade: quizData.className || "",
    questions: quizData.questions.length,
    duration: parseDurationMinutes(quizData.duration),
    status: "open",
    createdAt: new Date().toISOString().slice(0, 10),
    createdByRole: quizData.createdByRole || "admin",
    createdByName:
        quizData.createdByRole === "teacher"
            ? quizData.createdByName || ""
            : "Quản trị viên",
});

export default function CreateQuizPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const routeQuizMeta = location.state?.quizMeta;

    const [quiz, setQuiz] = useState(() => createQuizFromMeta(routeQuizMeta));
    const [showSetupDialog, setShowSetupDialog] = useState(!routeQuizMeta);
    const [formData, setFormData] = useState(emptyForm);
    const [questionType, setQuestionType] = useState("multiple-choice");
    const [editingQuestionId, setEditingQuestionId] = useState(null);
    const [showAddQuestionForm, setShowAddQuestionForm] = useState(false);
    const [animatedQuestionId, setAnimatedQuestionId] = useState(null);
    const [moveDirection, setMoveDirection] = useState(null);
    const [savedQuizCardPayload, setSavedQuizCardPayload] = useState(null);
    const [showScrollQuickActions, setShowScrollQuickActions] = useState(false);
    const [isScrollQuickActionsOpen, setIsScrollQuickActionsOpen] = useState(false);
    const [pendingDeleteQuestionId, setPendingDeleteQuestionId] = useState(null);

    const reorderAnimationTimeoutRef = useRef(null);
    const excelInputRef = useRef(null);

    useEffect(() => {
        return () => {
            if (reorderAnimationTimeoutRef.current) {
                clearTimeout(reorderAnimationTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const mainScrollContainer = document.querySelector(".admin-layout__main");
        const getScrollTop = () =>
            mainScrollContainer instanceof HTMLElement
                ? mainScrollContainer.scrollTop
                : window.scrollY;

        const handleScroll = () => {
            const hasScrolledDown = getScrollTop() > 80;
            setShowScrollQuickActions(hasScrolledDown);

            if (!hasScrolledDown) {
                setIsScrollQuickActionsOpen(false);
            }
        };

        handleScroll();

        if (mainScrollContainer instanceof HTMLElement) {
            mainScrollContainer.addEventListener("scroll", handleScroll, { passive: true });
            return () => mainScrollContainer.removeEventListener("scroll", handleScroll);
        }

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const activeQuiz = useMemo(() => quiz, [quiz]);

    const handleChangeQuestion = (value) => {
        setFormData((prev) => ({
            ...prev,
            question: value,
        }));
    };

    const handleChangeQuestionImage = (value) => {
        setFormData((prev) => ({
            ...prev,
            questionImage: value,
        }));
    };

    const handleChangeAnswer = (key, value) => {
        setFormData((prev) => ({
            ...prev,
            answers: {
                ...prev.answers,
                [key]: value,
            },
        }));
    };

    const handleSelectCorrect = (key) => {
        setFormData((prev) => ({
            ...prev,
            correctAnswer: key,
        }));
    };

    const handleScoreChange = (value) => {
        if (value === "") {
            setFormData((prev) => ({
                ...prev,
                score: "",
            }));
            return;
        }

        const parsed = Number.parseFloat(value);
        const normalized = Number.isFinite(parsed)
            ? Math.min(MAX_QUESTION_SCORE, Math.max(0, parsed))
            : 0;

        setFormData((prev) => ({
            ...prev,
            score: String(normalized),
        }));
    };

    const resetForm = () => {
        setFormData(emptyForm);
        setQuestionType("multiple-choice");
        setEditingQuestionId(null);
        setShowAddQuestionForm(false);
    };

    const validateForm = () => {
        const trimmedQuestion = formData.question.trim();
        const trimmedAnswers = Object.values(formData.answers).map((item) => item.trim());

        if (!trimmedQuestion) {
            alert("Vui lòng nhập câu hỏi.");
            return false;
        }

        if (questionType === "multiple-choice") {
            if (trimmedAnswers.some((item) => !item)) {
                alert("Vui lòng nhập đầy đủ 4 đáp án.");
                return false;
            }

            if (!formData.correctAnswer) {
                alert("Vui lòng chọn đáp án đúng.");
                return false;
            }
        }

        const questionScore = getQuestionScoreValue(formData.score);
        if (questionScore > MAX_QUESTION_SCORE) {
            alert(`Điểm mỗi câu hỏi không được vượt quá ${MAX_QUESTION_SCORE} điểm.`);
            return false;
        }

        return true;
    };

    const validateQuizBeforeSave = () => {
        const hasQuestionOverMax = quiz.questions.some(
            (item) => getQuestionScoreValue(item.score) > MAX_QUESTION_SCORE
        );

        if (hasQuestionOverMax) {
            alert(`Có câu hỏi vượt quá ${MAX_QUESTION_SCORE} điểm. Vui lòng kiểm tra lại.`);
            return false;
        }

        const totalScore = getTotalScore(quiz.questions);
        if (totalScore > MAX_QUIZ_TOTAL_SCORE) {
            alert(`Tổng điểm bài kiểm tra không được vượt quá ${MAX_QUIZ_TOTAL_SCORE} điểm.`);
            return false;
        }

        if (!quiz.questions.length) {
            alert("Vui lòng thêm ít nhất 1 câu hỏi trước khi lưu.");
            return false;
        }

        return true;
    };

    const saveQuizAndReturnCard = ({ showSuccessAlert = true } = {}) => {
        if (!validateQuizBeforeSave()) {
            return null;
        }

        const nextSavedCard = buildQuizCardPayload(quiz, savedQuizCardPayload?.id);
        setSavedQuizCardPayload(nextSavedCard);

        if (showSuccessAlert) {
            alert("Đã lưu bài kiểm tra thành công.");
        }

        return nextSavedCard;
    };

    const handleAddOrUpdateQuestion = () => {
        if (!validateForm()) return;

        const questionPayload = {
            id: editingQuestionId ?? Date.now(),
            type: questionType,
            question: formData.question.trim(),
            questionImage: formData.questionImage || "",
            answers:
                questionType === "multiple-choice"
                    ? {
                        A: formData.answers.A.trim(),
                        B: formData.answers.B.trim(),
                        C: formData.answers.C.trim(),
                        D: formData.answers.D.trim(),
                    }
                    : {},
            correctAnswer:
                questionType === "multiple-choice" ? formData.correctAnswer : null,
            score: Number(formData.score) || 0.25,
        };

        const nextQuestions = editingQuestionId
            ? activeQuiz.questions.map((item) =>
                item.id === editingQuestionId ? questionPayload : item
            )
            : [...activeQuiz.questions, questionPayload];

        const nextTotalScore = getTotalScore(nextQuestions);
        if (nextTotalScore > MAX_QUIZ_TOTAL_SCORE) {
            alert(
                `Tổng điểm bài kiểm tra không được vượt quá ${MAX_QUIZ_TOTAL_SCORE} điểm.`
            );
            return;
        }

        setQuiz((prev) => ({
            ...prev,
            questions: nextQuestions,
        }));

        resetForm();
    };

    const handleDeleteQuestion = (questionId) => {
        setPendingDeleteQuestionId(questionId);
    };

    const handleCancelDeleteQuestion = () => {
        setPendingDeleteQuestionId(null);
    };

    const handleConfirmDeleteQuestion = () => {
        if (pendingDeleteQuestionId == null) return;

        setQuiz((prev) => ({
            ...prev,
            questions: prev.questions.filter((item) => item.id !== pendingDeleteQuestionId),
        }));

        if (editingQuestionId === pendingDeleteQuestionId) {
            resetForm();
        }

        setPendingDeleteQuestionId(null);
    };

    const handleEditQuestion = (question) => {
        setEditingQuestionId(question.id);
        const nextType = question.type || "multiple-choice";
        setQuestionType(nextType);
        setFormData({
            question: question.question,
            questionImage: question.questionImage || "",
            answers: {
                A: question.answers?.A || "",
                B: question.answers?.B || "",
                C: question.answers?.C || "",
                D: question.answers?.D || "",
            },
            correctAnswer: question.correctAnswer || "A",
            score: String(question.score),
        });
        setShowAddQuestionForm(true);
    };

    const handleMoveQuestion = (questionId, direction) => {
        setQuiz((prev) => {
            const currentIndex = prev.questions.findIndex((item) => item.id === questionId);
            if (currentIndex === -1) return prev;

            const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
            if (targetIndex < 0 || targetIndex >= prev.questions.length) return prev;

            const nextQuestions = [...prev.questions];
            [nextQuestions[currentIndex], nextQuestions[targetIndex]] = [
                nextQuestions[targetIndex],
                nextQuestions[currentIndex],
            ];

            setAnimatedQuestionId(questionId);
            setMoveDirection(direction);
            if (reorderAnimationTimeoutRef.current) {
                clearTimeout(reorderAnimationTimeoutRef.current);
            }
            reorderAnimationTimeoutRef.current = setTimeout(() => {
                setAnimatedQuestionId(null);
                setMoveDirection(null);
            }, 420);

            return {
                ...prev,
                questions: nextQuestions,
            };
        });
    };

    const handleDownloadExcelTemplate = () => {
        const header = [
            "question",
            "type",
            "optionA",
            "optionB",
            "optionC",
            "optionD",
            "correctAnswer",
            "score",
            "questionImage",
        ];

        const sampleRows = [
            [
                "Thủ đô của Việt Nam là gì?",
                "multiple-choice",
                "Hà Nội",
                "Đà Nẵng",
                "TP.HCM",
                "Cần Thơ",
                "A",
                "0.5",
                "",
            ],
            [
                "Nêu định nghĩa phản ứng oxi hóa khử",
                "essay",
                "",
                "",
                "",
                "",
                "",
                "1",
                "",
            ],
        ];

        const csvRows = [header, ...sampleRows]
            .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
            .join("\n");

        const blob = new Blob([csvRows], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "mau-import-bai-kiem-tra.csv";
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
    };

    const handleOpenExcelUpload = () => {
        excelInputRef.current?.click();
    };

    const handleUploadExcelFile = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const allowedExtensions = [".xlsx", ".xls", ".csv"];
        const loweredName = file.name.toLowerCase();
        const isAllowed = allowedExtensions.some((ext) => loweredName.endsWith(ext));

        if (!isAllowed) {
            alert("Vui lòng chọn file Excel (.xlsx, .xls) hoặc CSV (.csv).");
            event.target.value = "";
            return;
        }

        alert(`Đã tải lên file: ${file.name}. Hệ thống sẽ hỗ trợ đọc file ở bước tiếp theo.`);
        event.target.value = "";
    };

    const handleOpenAddForm = () => {
        setEditingQuestionId(null);
        setQuestionType("multiple-choice");
        setFormData(emptyForm);
        setShowAddQuestionForm(true);

        setTimeout(() => {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth",
            });
        }, 100);
    };

    const handleSetupQuiz = (quizMeta) => {
        setQuiz((prev) => ({
            ...prev,
            title: quizMeta.title,
            subject: quizMeta.subject,
            className: quizMeta.grade,
            createdByRole: quizMeta.createdByRole || "admin",
            createdByName:
                quizMeta.createdByRole === "teacher"
                    ? quizMeta.createdByName || ""
                    : "Quản trị viên",
        }));
        setShowSetupDialog(false);
    };

    const handleBackToQuizList = () => {
        const savedCard = saveQuizAndReturnCard({ showSuccessAlert: false });
        if (!savedCard) return;

        navigate("/admin/quiz", {
            state: {
                createdQuiz: savedCard,
            },
        });
    };

    const handleCancelCreateQuiz = () => {
        // If there are no questions yet, treat cancel as dropping the whole draft.
        if (!quiz.questions.length) {
            setQuiz(createQuizFromMeta(routeQuizMeta));
            resetForm();
            navigate("/admin/quiz");
            return;
        }

        const confirmed = window.confirm(
            "Bạn có chắc muốn huỷ? Các thay đổi chưa lưu sẽ bị bỏ."
        );
        if (!confirmed) return;

        setQuiz(createQuizFromMeta(routeQuizMeta));
        resetForm();
        navigate("/admin/quiz");
    };

    const handleToggleScrollQuickActions = () => {
        setIsScrollQuickActionsOpen((prev) => !prev);
    };

    const handleQuickActionBack = () => {
        setIsScrollQuickActionsOpen(false);
        handleBackToQuizList();
    };

    const handleQuickActionCancel = () => {
        setIsScrollQuickActionsOpen(false);
        handleCancelCreateQuiz();
    };

    const handleQuickActionTemplate = () => {
        setIsScrollQuickActionsOpen(false);
        handleDownloadExcelTemplate();
    };

    const handleQuickActionUpload = () => {
        setIsScrollQuickActionsOpen(false);
        handleOpenExcelUpload();
    };

    const pendingDeleteQuestion = activeQuiz.questions.find(
        (item) => item.id === pendingDeleteQuestionId
    );

    return (
        <div className="admin-create-quiz-page">
            <div className="admin-create-quiz__header">
                <div className="admin-create-quiz__header-left">
                    <button
                        type="button"
                        className="admin-create-quiz__back-btn"
                        onClick={handleBackToQuizList}
                    >
                        <FiArrowLeft aria-hidden="true" />
                        <span>Quay lại</span>
                    </button>

                    <h1>Soạn thảo Quiz</h1>
                </div>

                <div className="admin-create-quiz__header-actions">
                    <button
                        type="button"
                        className="admin-create-quiz__cancel-btn"
                        onClick={handleCancelCreateQuiz}
                    >
                        <FiX aria-hidden="true" />
                        <span>Huỷ</span>
                    </button>

                    <button
                        type="button"
                        className="admin-create-quiz__template-btn"
                        onClick={handleDownloadExcelTemplate}
                    >
                        <FiDownload aria-hidden="true" />
                        <span>Tải file Excel mẫu</span>
                    </button>

                    <button
                        type="button"
                        className="admin-create-quiz__upload-btn"
                        onClick={handleOpenExcelUpload}
                    >
                        <FiUpload aria-hidden="true" />
                        <span>Up file Excel</span>
                    </button>
                </div>
            </div>

            <CreateEditQuizSection activeQuiz={activeQuiz} />

            <QuizListSection
                questions={activeQuiz?.questions || []}
                onDelete={handleDeleteQuestion}
                onEdit={handleEditQuestion}
                onMove={handleMoveQuestion}
                animatedQuestionId={animatedQuestionId}
                moveDirection={moveDirection}
                editingQuestionId={editingQuestionId}
                renderInlineEditor={() => (
                    <AssignQuizSection
                        formData={formData}
                        editingQuestionId={editingQuestionId}
                        questionType={questionType}
                        maxScore={MAX_QUESTION_SCORE}
                        scoreStep={ADMIN_SCORE_STEP}
                        questionImage={formData.questionImage}
                        onChangeQuestionImage={handleChangeQuestionImage}
                        onChangeQuestionType={setQuestionType}
                        onChangeQuestion={handleChangeQuestion}
                        onChangeAnswer={handleChangeAnswer}
                        onSelectCorrect={handleSelectCorrect}
                        onScoreChange={handleScoreChange}
                        onCancel={resetForm}
                        onSubmit={handleAddOrUpdateQuestion}
                    />
                )}
            />

            {!showAddQuestionForm && (
                <button
                    type="button"
                    className="admin-create-quiz__add-question-btn"
                    onClick={handleOpenAddForm}
                >
                    <FiPlus className="admin-create-quiz__add-question-icon" aria-hidden="true" />
                    <span>Thêm câu hỏi mới</span>
                </button>
            )}

            {showAddQuestionForm && editingQuestionId == null && (
                <AssignQuizSection
                    formData={formData}
                    editingQuestionId={editingQuestionId}
                    questionType={questionType}
                    maxScore={MAX_QUESTION_SCORE}
                    scoreStep={ADMIN_SCORE_STEP}
                    questionImage={formData.questionImage}
                    onChangeQuestionImage={handleChangeQuestionImage}
                    onChangeQuestionType={setQuestionType}
                    onChangeQuestion={handleChangeQuestion}
                    onChangeAnswer={handleChangeAnswer}
                    onSelectCorrect={handleSelectCorrect}
                    onScoreChange={handleScoreChange}
                    onCancel={resetForm}
                    onSubmit={handleAddOrUpdateQuestion}
                />
            )}

            {showScrollQuickActions ? (
                <div className={`admin-create-quiz__floating-actions ${isScrollQuickActionsOpen ? "open" : ""}`.trim()}>
                    {isScrollQuickActionsOpen ? (
                        <div className="admin-create-quiz__floating-panel">
                            <button type="button" onClick={handleQuickActionBack}>
                                <FiArrowLeft aria-hidden="true" />
                                <span>Quay lại</span>
                            </button>

                            <button type="button" onClick={handleQuickActionCancel}>
                                <FiX aria-hidden="true" />
                                <span>Huỷ</span>
                            </button>

                            <button type="button" onClick={handleQuickActionTemplate}>
                                <FiDownload aria-hidden="true" />
                                <span>Tải mẫu Excel</span>
                            </button>

                            <button type="button" className="admin-create-quiz__floating-upload" onClick={handleQuickActionUpload}>
                                <FiUpload aria-hidden="true" />
                                <span>Up file Excel</span>
                            </button>
                        </div>
                    ) : null}

                    <button
                        type="button"
                        className="admin-create-quiz__floating-toggle"
                        onClick={handleToggleScrollQuickActions}
                        aria-label="Mở nhanh thao tác tệp Excel và điều hướng"
                    >
                        <FiMenu aria-hidden="true" />
                    </button>
                </div>
            ) : null}

            <input
                ref={excelInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleUploadExcelFile}
                style={{ display: "none" }}
            />

            <CreateQuizDialog
                open={showSetupDialog}
                title="Tạo bài kiểm tra"
                submitLabel="Tạo bài kiểm tra"
                onClose={() => navigate("/admin/quiz")}
                onSubmit={handleSetupQuiz}
                initialValues={routeQuizMeta}
            />

            <Modal
                open={pendingDeleteQuestionId != null}
                onClose={handleCancelDeleteQuestion}
                title="Xác nhận xoá câu hỏi"
                className="admin-create-quiz__delete-confirm"
            >
                <p className="admin-create-quiz__delete-confirm-text">
                    Bạn có chắc muốn xoá câu hỏi
                    {" "}
                    <strong>
                        {pendingDeleteQuestion?.question
                            ? `"${pendingDeleteQuestion.question}"`
                            : "này"}
                    </strong>
                    ?
                </p>
                <div className="admin-create-quiz__delete-confirm-actions">
                    <button
                        type="button"
                        className="admin-create-quiz__delete-confirm-cancel"
                        onClick={handleCancelDeleteQuestion}
                    >
                        Không xoá
                    </button>
                    <button
                        type="button"
                        className="admin-create-quiz__delete-confirm-submit"
                        onClick={handleConfirmDeleteQuestion}
                    >
                        Xoá câu hỏi
                    </button>
                </div>
            </Modal>
        </div>
    );
}

