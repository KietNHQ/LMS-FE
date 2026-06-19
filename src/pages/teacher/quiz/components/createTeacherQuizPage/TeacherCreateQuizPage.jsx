import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiArrowLeft, FiDownload, FiMenu, FiPlus, FiSave, FiUpload, FiX } from "react-icons/fi";
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

const buildQuestionOptions = (question = {}) => {
    if (question.type === "essay") return [];

    const answers = question.answers || {};
    return ["A", "B", "C", "D"]
        .filter((key) => String(answers[key] || "").trim())
        .map((key) => ({
            text: String(answers[key]).trim(),
            isCorrect: question.correctAnswer === key,
        }));
};

const buildQuestionUpdatePayload = (question = {}) => ({
    question: String(question.question || "").trim(),
    type: question.type || "multiple-choice",
    score: Number(question.score) || 0.25,
    questionImage: question.questionImage || "",
    options: buildQuestionOptions(question),
    correctAnswer: question.correctAnswer,
    order: question.order,
});

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

    if ((type === "multiple-choice" || type === "true-false") && apiAnswers.length > 0) {
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
        type: type === "essay" ? "essay" : "multiple-choice", // Map true-false to multiple-choice for UI
        question: apiQuestion.questionText || apiQuestion.question_text || "",
        questionImage: apiQuestion.questionImage || apiQuestion.payload?.questionImage || "",
        answers,
        correctAnswer,
        score: apiQuestion.points || 0.25,
        order: apiQuestion.order_num ?? apiQuestion.order ?? null,
    };
};

const creationCache = {};

const normalizeId = (value) => {
    if (value === undefined || value === null || value === "") return "";
    return String(value);
};

const getTeacherSubjectName = (assignment = {}) =>
    assignment.subjects?.[0]?.name || assignment.subject_name || assignment.subject_display_name || "";

const getTeacherSubjectSemesterId = (assignment = {}) =>
    normalizeId(
        assignment.class_teacher_subject_semester_id ??
        assignment.classTeacherSubjectSemesterId ??
        assignment.semester_id ??
        assignment.semesterId
    );

const getTeacherSubjectSchoolYearId = (assignment = {}) =>
    normalizeId(
        assignment.class_teacher_subject_school_year_id ??
        assignment.classTeacherSubjectSchoolYearId ??
        assignment.school_year_id ??
        assignment.schoolYearId
    );

const assignmentMatchesQuizMeta = (assignment = {}, quizMeta = {}) => {
    const semesterId = normalizeId(quizMeta.semesterId);
    const schoolYearId = normalizeId(quizMeta.schoolYearId);

    if ((assignment.class_name || assignment.className) !== quizMeta.className) return false;
    if (getTeacherSubjectName(assignment) !== quizMeta.subject) return false;
    if (semesterId && getTeacherSubjectSemesterId(assignment) !== semesterId) return false;
    if (schoolYearId && getTeacherSubjectSchoolYearId(assignment) !== schoolYearId) return false;

    return true;
};

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
    const [showScrollQuickActions, setShowScrollQuickActions] = useState(false);
    const [isScrollQuickActionsOpen, setIsScrollQuickActionsOpen] = useState(false);
    const [pendingDeleteQuestionId, setPendingDeleteQuestionId] = useState(null);
    const [dirtyQuestionIds, setDirtyQuestionIds] = useState(() => new Set());
    const [isSavingQuestionDrafts, setIsSavingQuestionDrafts] = useState(false);

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
                    const mappedQuestions = apiQuestions.map((question, index) =>
                        mapQuestionFromApiToView({
                            ...question,
                            order_num: question.order_num ?? question.order ?? index + 1,
                        })
                    );
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
                                    (assignment) => assignmentMatchesQuizMeta(assignment, routeQuizMeta)
                                );
                                if (matched) {
                                    targetCtsId = matched.class_teacher_subject_id || matched.id;
                                }
                            }
                        }
                    }
                    
                    if (!targetCtsId) {
                        // Ultimate fallback: check listClassTeacherSubjects
                        const assignments = await quizService.listClassTeacherSubjects({
                            ...(routeQuizMeta.schoolYearId ? { schoolYearId: routeQuizMeta.schoolYearId } : {}),
                            ...(routeQuizMeta.semesterId ? { semesterId: routeQuizMeta.semesterId } : {}),
                        });
                        const matched = assignments.find((item) =>
                            item.className === routeQuizMeta.className &&
                            item.subject === routeQuizMeta.subject &&
                            (!routeQuizMeta.schoolYearId || normalizeId(item.schoolYearId) === normalizeId(routeQuizMeta.schoolYearId)) &&
                            (!routeQuizMeta.semesterId || normalizeId(item.semesterId) === normalizeId(routeQuizMeta.semesterId))
                        );
                        if (matched) {
                            targetCtsId = matched.value;
                        }
                    }
 
                    if (!targetCtsId) {
                        throw new Error(`Không tìm thấy phân công giảng dạy cho lớp ${routeQuizMeta.className} môn ${routeQuizMeta.subject}.`);
                    }
 
                    const durationMin = parseDurationMinutes(routeQuizMeta.duration);
                    
                    // Create quiz on backend with caching to prevent StrictMode duplicates
                    const cacheKey = [
                        routeQuizMeta.title,
                        routeQuizMeta.className,
                        routeQuizMeta.subject,
                        routeQuizMeta.schoolYearId || "",
                        routeQuizMeta.semesterId || "",
                    ].join("_");
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
                            assessmentType: routeQuizMeta.assessmentType || "none",
                            gradingMode: routeQuizMeta.gradingMode,
                            semesterId: routeQuizMeta.semesterId,
                            isSynchronous: routeQuizMeta.isSynchronous || false,
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
    }, [location.state, navigate, routeQuizMeta]);

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
    const hasUnsavedQuestionDrafts = dirtyQuestionIds.size > 0;

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
            const validAnswers = trimmedAnswers.filter((item) => item);
            if (validAnswers.length < 2) {
                alert("Vui lòng nhập ít nhất 2 đáp án.");
                return false;
            }

            if (!formData.answers[formData.correctAnswer]?.trim()) {
                alert(`Đáp án đúng (hiện tại là ${formData.correctAnswer}) không được để trống.`);
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

        try {
            const nextOrder = quiz.questions.length + 1;
            const mappedQuestion = {
                type: questionType,
                question: formData.question.trim(),
                questionImage: formData.questionImage || "",
                answers: { ...formData.answers },
                correctAnswer: formData.correctAnswer,
                score: Number(formData.score) || 0.25,
            };

            if (editingQuestionId) {
                setQuiz((prev) => ({
                    ...prev,
                    questions: prev.questions.map((item) =>
                        item.id === editingQuestionId
                            ? {
                                ...item,
                                ...mappedQuestion,
                                isDirty: true,
                            }
                            : item
                    ),
                }));
                setDirtyQuestionIds((prev) => {
                    const next = new Set(prev);
                    next.add(editingQuestionId);
                    return next;
                });
                toast.info("Đã cập nhật bản nháp. Bấm Lưu thay đổi để lưu lên hệ thống.");
            } else {
                const apiOptions = buildQuestionOptions({
                    ...mappedQuestion,
                    type: questionType,
                });
                const response = await quizService.addQuestion(quiz.id, {
                    question: formData.question.trim(),
                    type: questionType,
                    score: Number(formData.score) || 0.25,
                    questionImage: formData.questionImage || "",
                    options: apiOptions,
                    correctAnswer: formData.correctAnswer,
                    order: nextOrder,
                });
                const savedQuestion = response.data?.data || response.data || response;

                const mappedSaved = {
                    id: savedQuestion.id,
                    ...mappedQuestion,
                    order: savedQuestion.order_num ?? savedQuestion.order ?? nextOrder,
                };

                setQuiz((prev) => ({
                    ...prev,
                    questions: [...prev.questions, { ...mappedSaved, order: nextOrder }],
                }));
                toast.success("Thêm câu hỏi thành công.");
            }

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

    const handleSaveQuestionDrafts = async () => {
        if (!hasUnsavedQuestionDrafts || isSavingQuestionDrafts) return;

        const dirtyIds = [...dirtyQuestionIds];
        const dirtyQuestions = quiz.questions.filter((item) => dirtyIds.includes(item.id));

        if (!dirtyQuestions.length) {
            setDirtyQuestionIds(new Set());
            return;
        }

        setIsSavingQuestionDrafts(true);
        try {
            await Promise.all(
                dirtyQuestions.map((item) =>
                    quizService.updateQuestion(quiz.id, item.id, buildQuestionUpdatePayload(item))
                )
            );

            setQuiz((prev) => ({
                ...prev,
                questions: prev.questions.map((item) =>
                    dirtyIds.includes(item.id) ? { ...item, isDirty: false } : item
                ),
            }));
            setDirtyQuestionIds(new Set());
            toast.success(`Đã lưu ${dirtyQuestions.length} câu hỏi.`);
        } catch (err) {
            console.error("Save question drafts error:", err);
            const errorMsg = err.response?.data?.error || err.message || "Không thể lưu thay đổi câu hỏi.";
            toast.error(errorMsg);
        } finally {
            setIsSavingQuestionDrafts(false);
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
            setQuiz((prev) => {
                const nextQuestions = prev.questions
                    .filter((item) => item.id !== pendingDeleteQuestionId)
                    .map((item, index) => ({ ...item, order: index + 1 }));

                Promise.all(
                    nextQuestions.map((item, index) =>
                        quizService.updateQuestion(quiz.id, item.id, {
                            order: index + 1,
                        })
                    )
                ).catch((err) => {
                    console.error("Failed to renumber questions after delete:", err);
                });

                return {
                    ...prev,
                    questions: nextQuestions,
                };
            });

            if (editingQuestionId === pendingDeleteQuestionId) {
                resetForm();
            }
            setDirtyQuestionIds((prev) => {
                const next = new Set(prev);
                next.delete(pendingDeleteQuestionId);
                return next;
            });
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

            const renumberedQuestions = nextQuestions.map((item, index) => ({
                ...item,
                order: index + 1,
            }));

            Promise.all(
                renumberedQuestions.map((item, index) =>
                    quizService.updateQuestion(quiz.id, item.id, {
                        order: index + 1,
                    })
                )
            ).catch((err) => {
                console.error("Failed to persist question order:", err);
                toast.error("Không thể lưu lại thứ tự câu hỏi.");
            });

            setAnimatedQuestionId(questionId);
            setMoveDirection(direction);
            if (reorderAnimationTimeoutRef.current) {
                clearTimeout(reorderAnimationTimeoutRef.current);
            }
            reorderAnimationTimeoutRef.current = setTimeout(() => {
                setAnimatedQuestionId(null);
                setMoveDirection(null);
            }, 420);

            return { ...prev, questions: renumberedQuestions };
        });
    };

    const handleDownloadExcelTemplate = async () => {
        try {
            const response = await quizService.downloadImportTemplate("questions");
            const url = window.URL.createObjectURL(new Blob([response]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "quiz_template.xlsx");
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("Tải file Excel mẫu thành công.");
        } catch (error) {
            console.error("Lỗi khi tải file template:", error);
            toast.error("Không thể tải file mẫu. Vui lòng thử lại sau.");
        }
    };

    const handleOpenExcelUpload = () => {
        excelInputRef.current?.click();
    };

    const handleUploadExcelFile = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const allowedExtensions = [".xlsx", ".xls"];
        const loweredName = file.name.toLowerCase();
        const isAllowed = allowedExtensions.some((ext) => loweredName.endsWith(ext));

        if (!isAllowed) {
            toast.error("Vui lòng chọn file Excel (.xlsx, .xls).");
            event.target.value = "";
            return;
        }

        if (!quiz?.id) {
            toast.error("Vui lòng khởi tạo bài kiểm tra trước khi import câu hỏi.");
            event.target.value = "";
            return;
        }

        try {
            toast.info("Đang xử lý file Excel...");
            const response = await quizService.importQuestionsFromExcel(quiz.id, file, "replace");
            
            // Reload questions
            const apiQuestions = await quizService.listQuestions(quiz.id);
            const mappedQuestions = (apiQuestions || []).map((q, idx) => mapQuestionFromApiToView({
                ...q,
                order_num: q.order_num ?? q.order ?? idx + 1
            }));
            
            setQuiz(prev => ({
                ...prev,
                questions: mappedQuestions
            }));
            setDirtyQuestionIds(new Set());
            resetForm();
            
            const responseData = response?.data || response;
            const importedCount = responseData?.data?.imported ?? responseData?.imported ?? 0;
            const parseErrors = responseData?.data?.parseErrors ?? responseData?.parseErrors ?? [];
            
            toast.success(`Import thành công ${importedCount} câu hỏi!`);
            
            if (parseErrors && parseErrors.length > 0) {
                toast.warning(`Có ${parseErrors.length} dòng bị lỗi định dạng, các dòng hợp lệ đã được import.`);
            }
        } catch (error) {
            console.error("Lỗi khi import file Excel:", error);
            const errorMsg = error.response?.data?.error || error.response?.data?.message || "Đã xảy ra lỗi khi import file Excel.";
            toast.error(errorMsg);
        } finally {
            event.target.value = "";
        }
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
                assessmentType: quizMeta.assessmentType || "none",
                gradingMode: quizMeta.gradingMode,
                semesterId: quizMeta.semesterId,
                isSynchronous: quizMeta.isSynchronous || false,
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
        if (hasUnsavedQuestionDrafts) {
            toast.warning("Bạn còn câu hỏi chưa lưu. Bấm Lưu thay đổi trước khi quay lại.");
            return;
        }

        if (!validateQuizBeforeSave()) {
            return;
        }
        navigate("/teacher/quiz");
    };

    const handleCancelCreateQuiz = () => {
        if (
            hasUnsavedQuestionDrafts &&
            !window.confirm("Bạn còn câu hỏi chưa lưu. Huỷ bây giờ sẽ mất các thay đổi này. Tiếp tục huỷ?")
        ) {
            return;
        }

        navigate("/teacher/quiz");
    };

    const handleToggleScrollQuickActions = () => {
        setIsScrollQuickActionsOpen((prev) => !prev);
    };

    const handleQuickActionBack = () => {
        setIsScrollQuickActionsOpen(false);
        handleBackToQuizList();
    };

    const handleQuickActionSave = () => {
        setIsScrollQuickActionsOpen(false);
        handleSaveQuestionDrafts();
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
                        className="teacher-create-quiz__save-btn"
                        onClick={handleSaveQuestionDrafts}
                        disabled={!hasUnsavedQuestionDrafts || isSavingQuestionDrafts}
                    >
                        <FiSave aria-hidden="true" />
                        <span>
                            {isSavingQuestionDrafts
                                ? "Đang lưu..."
                                : hasUnsavedQuestionDrafts
                                    ? `Lưu thay đổi (${dirtyQuestionIds.size})`
                                    : "Đã lưu"}
                        </span>
                    </button>

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
                        submitLabel="Cập nhật bản nháp"
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
                            <button
                                type="button"
                                className="teacher-create-quiz__floating-save"
                                onClick={handleQuickActionSave}
                                disabled={!hasUnsavedQuestionDrafts || isSavingQuestionDrafts}
                            >
                                <FiSave aria-hidden="true" />
                                <span>{hasUnsavedQuestionDrafts ? `Lưu thay đổi (${dirtyQuestionIds.size})` : "Đã lưu"}</span>
                            </button>
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
