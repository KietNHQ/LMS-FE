import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiArrowLeft, FiDownload, FiMenu, FiPlus, FiUpload, FiX } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { Modal } from "../../../../../components/ui";
import CreateEditQuizSection from "../createEditQuizSection/CreateEditQuizSection";
import AssignQuizSection from "../assignQuizSection/AssignQuizSection";
import QuizListSection from "../quizListSection/QuizListSection";
import CreateTeacherQuizDialog from "../createTeacherQuizDialog/CreateTeacherQuizDialog";
import {
    DEFAULT_QUIZ_DURATION_LABEL,
    formatDurationLabel,
    parseDurationMinutes,
    quizService,
} from "../../../../../services/shared/quiz/quizService";
import { toast } from "react-toastify";
import { teacherService } from "../../../../../services/pages/teacher/teacherService";
import "./TeacherCreateQuizPage.css";

const MAX_QUESTION_SCORE = 10;
const MAX_QUIZ_TOTAL_SCORE = 10;
const TEACHER_SCORE_STEP = 0.25;

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

const getQuestionScoreValue = (score) => {
    const parsed = Number.parseFloat(score);
    return Number.isFinite(parsed) ? parsed : 0;
};

const getTotalScore = (questions = []) =>
    questions.reduce((sum, item) => sum + getQuestionScoreValue(item.score), 0);

const normalizeQuestionTypeFromApi = (questionType) => {
    if (questionType === "multiple_choice") return "multiple-choice";
    if (questionType === "true_false") return "true-false";
    return questionType || "multiple-choice";
};

const mapQuestionFromApiToView = (apiQuestion) => {
    const type = normalizeQuestionTypeFromApi(apiQuestion.questionType || apiQuestion.question_type);
    const answers = { A: "", B: "", C: "", D: "" };
    let correctAnswer = "A";

    const apiAnswers = Array.isArray(apiQuestion.quiz_answers)
        ? apiQuestion.quiz_answers
        : Array.isArray(apiQuestion.answers)
            ? apiQuestion.answers
            : [];

    if (type === "multiple-choice" && apiAnswers.length > 0) {
        const labels = ["A", "B", "C", "D"];
        apiAnswers.forEach((ans, idx) => {
            if (idx < 4) {
                const label = labels[idx];
                answers[label] = ans.answer_text || ans.answerText || "";
                if (ans.is_correct ?? ans.isCorrect) {
                    correctAnswer = label;
                }
            }
        });
    }

    return {
        id: apiQuestion.id,
        type,
        question: apiQuestion.questionText || apiQuestion.question_text || "",
        questionImage: apiQuestion.questionImage || apiQuestion.payload?.questionImage || "",
        answers,
        correctAnswer,
        score: apiQuestion.points || 0.25,
    };
};

const creationCache = {};

export default function TeacherCreateQuizPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const routeQuizMeta = location.state?.quizMeta;

    const [quiz, setQuiz] = useState({
        id: null,
        title: "",
        subject: "",
        grade: "",
        className: "",
        duration: "",
        createdByRole: "teacher",
        createdByName: "",
        questions: [],
    });
    const [showSetupDialog, setShowSetupDialog] = useState(false);
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
        const initializeQuiz = async () => {
            if (routeQuizMeta?.id) {
                // EDIT MODE
                try {
                    const apiQuestions = await quizService.listQuestions(routeQuizMeta.id);
                    const mappedQuestions = apiQuestions.map(mapQuestionFromApiToView);
                    setQuiz({
                        id: routeQuizMeta.id,
                        title: routeQuizMeta.title || "Bài kiểm tra",
                        subject: routeQuizMeta.subject || "",
                        grade: routeQuizMeta.grade || "",
                        className: routeQuizMeta.className || "",
                        duration: formatDurationLabel(routeQuizMeta.duration || DEFAULT_QUIZ_DURATION_LABEL),
                        createdByRole: routeQuizMeta.createdByRole || "teacher",
                        createdByName: routeQuizMeta.createdByName || "",
                        questions: mappedQuestions,
                    });
                } catch (err) {
                    console.error("Failed to load questions:", err);
                    toast.error("Không thể tải danh sách câu hỏi.");
                }
            } else if (routeQuizMeta) {
                // NEW MODE: Create quiz on backend right away so we have a valid quiz ID
                try {
                    let targetCtsId = routeQuizMeta.classTeacherSubjectId;
                    
                    if (!targetCtsId) {
                        const storedUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "{}");
                        const teacherId = storedUser.profile?.id || storedUser.teacherId || (storedUser.role === 'teacher' ? storedUser.id : null);
                        
                        if (teacherId) {
                            const teacherSubs = await teacherService.getTeacherSubjects({
                                mock: false,
                                pathParams: { id: teacherId }
                            });
                            if (teacherSubs && teacherSubs.success && Array.isArray(teacherSubs.data)) {
                                const matched = teacherSubs.data.find(
                                    a => a.class_name === routeQuizMeta.className &&
                                         (a.subjects?.[0]?.name === routeQuizMeta.subject || a.subject_name === routeQuizMeta.subject)
                                );
                                if (matched) {
                                    targetCtsId = matched.class_teacher_subject_id || matched.id;
                                }
                            }
                        }
                    }
                    
                    if (!targetCtsId) {
                        // Ultimate fallback: check listClassTeacherSubjects
                        const assignments = await quizService.listClassTeacherSubjects();
                        const matched = assignments.find((item) => item.className === routeQuizMeta.className);
                        if (matched) {
                            targetCtsId = matched.value;
                        }
                    }
 
                    if (!targetCtsId) {
                        throw new Error(`Không tìm thấy phân công giảng dạy cho lớp ${routeQuizMeta.className} môn ${routeQuizMeta.subject}.`);
                    }
 
                    const durationMin = parseDurationMinutes(routeQuizMeta.duration);
                    
                    // Create quiz on backend with caching to prevent StrictMode duplicates
                    const cacheKey = `${routeQuizMeta.title}_${routeQuizMeta.className}_${routeQuizMeta.subject}`;
                    let response;
                    if (creationCache[cacheKey]) {
                        response = await creationCache[cacheKey];
                    } else {
                        creationCache[cacheKey] = quizService.createQuiz({
                            classTeacherSubjectId: targetCtsId,
                            title: routeQuizMeta.title,
                            description: `Bài kiểm tra môn ${routeQuizMeta.subject} lớp ${routeQuizMeta.className}`,
                            durationMinutes: durationMin,
                            quizType: durationMin >= 45 ? "exam" : "practice",
                            isPublished: false,
                        });
                        try {
                            response = await creationCache[cacheKey];
                        } finally {
                            delete creationCache[cacheKey];
                        }
                    }
 
                    const created = response.data?.data || response.data || response;
                    
                    // CRITICAL: Replace route state so refreshes don't re-create the quiz!
                    navigate(".", {
                        replace: true,
                        state: {
                            ...location.state,
                            quizMeta: {
                                ...routeQuizMeta,
                                id: created.id,
                            }
                        }
                    });

                    setQuiz({
                        id: created.id,
                        title: routeQuizMeta.title,
                        subject: routeQuizMeta.subject,
                        grade: routeQuizMeta.grade,
                        className: routeQuizMeta.className,
                        duration: formatDurationLabel(routeQuizMeta.duration),
                        createdByRole: "teacher",
                        createdByName: routeQuizMeta.createdByName || "",
                        questions: [],
                    });
                    toast.success("Khởi tạo bài kiểm tra thành công.");
                } catch (err) {
                    console.error("Failed to initialize new quiz on backend:", err);
                    const errorMsg = err.response?.data?.error || err.message || "Không thể tạo bài kiểm tra.";
                    alert(`Lỗi: ${errorMsg}`);
                    navigate("/teacher/quiz");
                }
            } else {
                // No meta passed, show setup dialog
                setShowSetupDialog(true);
            }
        };

        initializeQuiz();
    }, [routeQuizMeta?.id, routeQuizMeta]);

    useEffect(() => {
        const mainScrollContainer = document.querySelector(".teacher-layout__main");
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
        setFormData((prev) => ({ ...prev, question: value }));
    };

    const handleChangeQuestionImage = async (value) => {
        if (value instanceof File) {
            let loadingToast;
            try {
                loadingToast = toast.loading("Đang tải ảnh lên Cloudinary...");
                const response = await quizService.uploadQuestionImage(value);
                const uploadResult = response.data?.data || response.data || response;
                
                if (uploadResult && uploadResult.url) {
                    setFormData((prev) => ({ ...prev, questionImage: uploadResult.url }));
                    toast.update(loadingToast, {
                        render: "Tải ảnh lên thành công!",
                        type: "success",
                        isLoading: false,
                        autoClose: 2000,
                    });
                } else {
                    throw new Error("Không lấy được URL ảnh.");
                }
            } catch (err) {
                console.error("Cloudinary upload failed:", err);
                if (loadingToast) {
                    toast.update(loadingToast, {
                        render: "Tải ảnh lên Cloudinary thất bại!",
                        type: "error",
                        isLoading: false,
                        autoClose: 3000,
                    });
                } else {
                    toast.error("Tải ảnh lên Cloudinary thất bại!");
                }
            }
        } else {
            setFormData((prev) => ({ ...prev, questionImage: value }));
        }
    };

    const handleChangeAnswer = (key, value) => {
        setFormData((prev) => ({
            ...prev,
            answers: { ...prev.answers, [key]: value },
        }));
    };

    const handleSelectCorrect = (key) => {
        setFormData((prev) => ({ ...prev, correctAnswer: key }));
    };

    const handleScoreChange = (value) => {
        if (value === "") {
            setFormData((prev) => ({ ...prev, score: "" }));
            return;
        }

        const parsed = Number.parseFloat(value);
        const normalized = Number.isFinite(parsed)
            ? Math.min(MAX_QUESTION_SCORE, Math.max(0, parsed))
            : 0;

        setFormData((prev) => ({ ...prev, score: String(normalized) }));
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

        return true;
    };

    const handleAddOrUpdateQuestion = async () => {
        if (!validateForm()) return;

        const apiOptions = questionType === "multiple-choice" ? [
            { text: formData.answers.A.trim(), isCorrect: formData.correctAnswer === "A" },
            { text: formData.answers.B.trim(), isCorrect: formData.correctAnswer === "B" },
            { text: formData.answers.C.trim(), isCorrect: formData.correctAnswer === "C" },
            { text: formData.answers.D.trim(), isCorrect: formData.correctAnswer === "D" }
        ] : [];

        try {
            let savedQuestion;
            if (editingQuestionId) {
                // Delete old and add new to completely replace all question answers and fields safely
                await quizService.deleteQuestion(quiz.id, editingQuestionId);
                const response = await quizService.addQuestion(quiz.id, {
                    question: formData.question.trim(),
                    type: questionType,
                    score: Number(formData.score) || 0.25,
                    questionImage: formData.questionImage || "",
                    options: apiOptions,
                    correctAnswer: formData.correctAnswer,
                });
                savedQuestion = response.data?.data || response.data || response;
            } else {
                const response = await quizService.addQuestion(quiz.id, {
                    question: formData.question.trim(),
                    type: questionType,
                    score: Number(formData.score) || 0.25,
                    questionImage: formData.questionImage || "",
                    options: apiOptions,
                    correctAnswer: formData.correctAnswer,
                });
                savedQuestion = response.data?.data || response.data || response;
            }

            const mappedSaved = mapQuestionFromApiToView(savedQuestion);

            setQuiz((prev) => {
                const nextQuestions = editingQuestionId
                    ? prev.questions.map((item) => (item.id === editingQuestionId ? mappedSaved : item))
                    : [...prev.questions, mappedSaved];
                return { ...prev, questions: nextQuestions };
            });

            toast.success(editingQuestionId ? "Cập nhật câu hỏi thành công." : "Thêm câu hỏi thành công.");
            resetForm();
        } catch (err) {
            console.error("Save question error:", err);
            let errorMsg = err.response?.data?.error || err.message || "Không thể lưu câu hỏi.";
            if (err.response?.data?.details && Array.isArray(err.response.data.details)) {
                const detailMsgs = err.response.data.details.map(d => d.message).join("\n");
                errorMsg = `${errorMsg}:\n${detailMsgs}`;
            }
            alert(`Lỗi: ${errorMsg}`);
        }
    };

    const handleDeleteQuestion = (questionId) => {
        setPendingDeleteQuestionId(questionId);
    };

    const handleCancelDeleteQuestion = () => {
        setPendingDeleteQuestionId(null);
    };

    const handleConfirmDeleteQuestion = async () => {
        if (pendingDeleteQuestionId == null) return;

        try {
            await quizService.deleteQuestion(quiz.id, pendingDeleteQuestionId);
            setQuiz((prev) => ({
                ...prev,
                questions: prev.questions.filter((item) => item.id !== pendingDeleteQuestionId),
            }));

            if (editingQuestionId === pendingDeleteQuestionId) {
                resetForm();
            }
            toast.success("Xoá câu hỏi thành công.");
        } catch (err) {
            console.error("Delete question error:", err);
            toast.error("Không thể xoá câu hỏi.");
        } finally {
            setPendingDeleteQuestionId(null);
        }
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

            return { ...prev, questions: nextQuestions };
        });
    };

    const handleDownloadExcelTemplate = () => {
        const header = [
            "question", "type", "optionA", "optionB", "optionC", "optionD",
            "correctAnswer", "score", "questionImage",
        ];

        const sampleRows = [
            ["Thủ đô của Việt Nam là gì?", "multiple-choice", "Hà Nội", "Đà Nẵng", "TP.HCM", "Cần Thơ", "A", "0.5", ""],
            ["Nêu định nghĩa phản ứng oxi hóa khử", "essay", "", "", "", "", "", "1", ""],
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
            window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
        }, 100);
    };

    const handleSetupQuiz = async (quizMeta) => {
        try {
            const assignments = await quizService.listClassTeacherSubjects();
            const matched = assignments.find((item) => item.className === quizMeta.className);
            if (!matched) {
                throw new Error(`Không tìm thấy lớp học ${quizMeta.className} được phân công.`);
            }

            const durationMin = parseDurationMinutes(quizMeta.duration);

            const response = await quizService.createQuiz({
                classTeacherSubjectId: matched.value,
                title: quizMeta.title,
                description: `Bài kiểm tra môn ${quizMeta.subject} lớp ${quizMeta.className}`,
                durationMinutes: durationMin,
                quizType: durationMin >= 45 ? "exam" : "practice",
                isPublished: false,
            });

            const created = response.data?.data || response.data || response;

            setQuiz({
                id: created.id,
                title: quizMeta.title,
                subject: quizMeta.subject,
                grade: quizMeta.grade,
                className: quizMeta.className,
                duration: formatDurationLabel(quizMeta.duration),
                createdByRole: "teacher",
                createdByName: quizMeta.createdByName || "",
                questions: [],
            });
            setShowSetupDialog(false);
            toast.success("Khởi tạo bài kiểm tra thành công.");
        } catch (err) {
            console.error("Failed to setup quiz:", err);
            const errorMsg = err.response?.data?.error || err.message || "Không thể tạo bài kiểm tra.";
            alert(`Lỗi: ${errorMsg}`);
        }
    };

    const handleBackToQuizList = () => {
        if (!validateQuizBeforeSave()) {
            return;
        }
        navigate("/teacher/quiz");
    };

    const handleCancelCreateQuiz = () => {
        navigate("/teacher/quiz");
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
        <div className="teacher-create-quiz-page">
            <div className="teacher-create-quiz__header">
                <div className="teacher-create-quiz__header-left">
                    <button
                        type="button"
                        className="teacher-create-quiz__back-btn"
                        onClick={handleBackToQuizList}
                    >
                        <FiArrowLeft aria-hidden="true" />
                        <span>Quay lại</span>
                    </button>

                    <h1>Soạn thảo Quiz</h1>
                </div>

                <div className="teacher-create-quiz__header-actions">
                    <button
                        type="button"
                        className="teacher-create-quiz__cancel-btn"
                        onClick={handleCancelCreateQuiz}
                    >
                        <FiX aria-hidden="true" />
                        <span>Huỷ</span>
                    </button>

                    <button
                        type="button"
                        className="teacher-create-quiz__template-btn"
                        onClick={handleDownloadExcelTemplate}
                    >
                        <FiDownload aria-hidden="true" />
                        <span>Tải file Excel mẫu</span>
                    </button>

                    <button
                        type="button"
                        className="teacher-create-quiz__upload-btn"
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
                        scoreStep={TEACHER_SCORE_STEP}
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
                    className="teacher-create-quiz__add-question-btn"
                    onClick={handleOpenAddForm}
                >
                    <FiPlus className="teacher-create-quiz__add-question-icon" aria-hidden="true" />
                    <span>Thêm câu hỏi mới</span>
                </button>
            )}

            {showAddQuestionForm && editingQuestionId == null && (
                <AssignQuizSection
                    formData={formData}
                    editingQuestionId={editingQuestionId}
                    questionType={questionType}
                    maxScore={MAX_QUESTION_SCORE}
                    scoreStep={TEACHER_SCORE_STEP}
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
                <div className={`teacher-create-quiz__floating-actions ${isScrollQuickActionsOpen ? "open" : ""}`.trim()}>
                    {isScrollQuickActionsOpen ? (
                        <div className="teacher-create-quiz__floating-panel">
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
                            <button type="button" className="teacher-create-quiz__floating-upload" onClick={handleQuickActionUpload}>
                                <FiUpload aria-hidden="true" />
                                <span>Up file Excel</span>
                            </button>
                        </div>
                    ) : null}

                    <button
                        type="button"
                        className="teacher-create-quiz__floating-toggle"
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

            <CreateTeacherQuizDialog
                open={showSetupDialog}
                title="Tạo bài kiểm tra"
                submitLabel="Tạo bài kiểm tra"
                onClose={() => navigate("/teacher/quiz")}
                onSubmit={handleSetupQuiz}
                initialValues={routeQuizMeta}
            />

            <Modal
                open={pendingDeleteQuestionId != null}
                onClose={handleCancelDeleteQuestion}
                title="Xác nhận xoá câu hỏi"
                className="teacher-create-quiz__delete-confirm"
            >
                <p className="teacher-create-quiz__delete-confirm-text">
                    Bạn có chắc muốn xoá câu hỏi
                    {" "}
                    <strong>
                        {pendingDeleteQuestion?.question
                            ? `"${pendingDeleteQuestion.question}"`
                            : "này"}
                    </strong>
                    ?
                </p>
                <div className="teacher-create-quiz__delete-confirm-actions">
                    <button
                        type="button"
                        className="teacher-create-quiz__delete-confirm-cancel"
                        onClick={handleCancelDeleteQuestion}
                    >
                        Không xoá
                    </button>
                    <button
                        type="button"
                        className="teacher-create-quiz__delete-confirm-submit"
                        onClick={handleConfirmDeleteQuestion}
                    >
                        Xoá câu hỏi
                    </button>
                </div>
            </Modal>
        </div>
    );
}




