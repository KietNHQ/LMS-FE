import axiosClient from "../http/axiosClient";

// Service dung chung cho cac trang co quiz.
const QUIZ_ENDPOINT = "/quizzes";

const QUIZ_TYPE_LABEL_ENTRIES = [
    ["practice", "Thường xuyên"],
    ["exam", "Giữa kỳ"],
    ["homework", "Bài tập"],
];

const QUIZ_TYPE_TO_LABEL = Object.fromEntries(QUIZ_TYPE_LABEL_ENTRIES);

const QUIZ_LABEL_TO_TYPE = Object.fromEntries(
    QUIZ_TYPE_LABEL_ENTRIES.map(([type, label]) => [label, type])
);

const getPayload = (response) => response?.data ?? response ?? {};

const getRows = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.quizzes)) return payload.quizzes;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
};

const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
};

const extractGradeFromClassName = (className = "") => {
    const match = String(className).match(/\d+/);
    return match ? `Khối ${match[0]}` : "";
};

const mapQuizTypeToLabel = (quizType) => QUIZ_TYPE_TO_LABEL[quizType] || "Thường xuyên";

const mapQuizTypeToApi = (quizTypeOrLabel) => {
    const normalized = String(quizTypeOrLabel || "").trim();
    if (!normalized) return undefined;
    if (QUIZ_TYPE_TO_LABEL[normalized]) return normalized;
    return QUIZ_LABEL_TO_TYPE[normalized] || undefined;
};

const normalizeQuestionTypeToApi = (questionType) => {
    const normalized = String(questionType || "").trim().toLowerCase();
    if (!normalized) return "multiple_choice";
    if (normalized === "multiple-choice" || normalized === "multiple_choice") return "multiple_choice";
    if (normalized === "true-false" || normalized === "true_false") return "true_false";
    if (normalized === "essay") return "essay";
    return "multiple_choice";
};

const normalizeQuestionTypeFromApi = (questionType) => {
    if (questionType === "multiple_choice") return "multiple-choice";
    if (questionType === "true_false") return "true-false";
    return questionType || "multiple-choice";
};

const mapQuestionFromApi = (question = {}) => {
    const answers = Array.isArray(question.quiz_answers)
        ? question.quiz_answers
        : Array.isArray(question.answers)
            ? question.answers
            : [];

    return {
        id: question.id,
        questionText: question.question_text || question.questionText || "",
        questionType: normalizeQuestionTypeFromApi(question.question_type || question.questionType),
        points: Number(question.points || 0),
        order: question.order_num ?? question.order ?? null,
        questionImage: question.question_image || question.questionImage || question.payload?.questionImage || "",
        answers: answers.map((answer) => ({
            id: answer.id,
            answerText: answer.answer_text || answer.answerText || "",
            isCorrect: Boolean(answer.is_correct ?? answer.isCorrect),
        })),
    };
};

const buildQuestionPayload = (questionData = {}) => ({
    questionText: String(questionData.questionText || questionData.question || "").trim(),
    questionType: normalizeQuestionTypeToApi(questionData.questionType || questionData.type),
    points: Number(questionData.points ?? questionData.score ?? 1),
    order: toNumber(questionData.order),
    questionImage: questionData.questionImage || "",
    options: questionData.options || [],
    correctAnswer: questionData.correctAnswer || null,
});

const toFormData = (pairs = {}) => {
    const formData = new FormData();
    Object.entries(pairs).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;
        formData.append(key, value);
    });
    return formData;
};

const QUIZ_SERVICE_EXPORTS = [];

const mapAssignmentOption = (item = {}) => {
    const subject = item.subject_display_name || item.subject_name || "";
    const className = item.class_name || "";
    const teacherName = item.teacher_name || "";

    return {
        value: item.id,
        label: `${subject} - ${className}${teacherName ? ` (${teacherName})` : ""}`,
        subject,
        className,
        grade: extractGradeFromClassName(className),
        teacherName,
        raw: item,
    };
};

const mapApiQuizToView = (quiz = {}) => {
    const classTeacherSubject = quiz.class_teacher_subject || quiz.classTeacherSubject || {};
    const subject =
        classTeacherSubject?.subject_assignments?.display_name ||
        classTeacherSubject?.subjectAssignments?.displayName ||
        quiz.subject ||
        "";

    const className =
        classTeacherSubject?.classes?.class_name ||
        classTeacherSubject?.classes?.className ||
        quiz.class_name ||
        quiz.className ||
        "";

    const duration =
        toNumber(quiz.duration_minutes ?? quiz.durationMinutes ?? quiz.duration) ||
        parseDurationMinutes(quiz.duration);

    return {
        id: quiz.id,
        title: quiz.title || "",
        description: quiz.description || "",
        subject,
        className,
        grade: extractGradeFromClassName(className),
        duration,
        durationLabel: formatDurationLabel(duration),
        status: (quiz.is_published ?? quiz.isPublished) ? "open" : "hidden",
        createdAt: quiz.created_at ? `${quiz.created_at}`.slice(0, 10) : "",
        examType: mapQuizTypeToLabel(quiz.quiz_type || quiz.quizType),
        quizType: quiz.quiz_type || quiz.quizType || "practice",
        classTeacherSubjectId: quiz.class_teacher_subject_id ?? quiz.classTeacherSubjectId,
        questions:
            toNumber(quiz.questions_count ?? quiz.question_count ?? quiz.questionsCount ?? quiz.totalQuestions) || 0,
        submissionCount:
            toNumber(quiz.submission_count ?? quiz.submissionCount ?? quiz.totalAttempts) || 0,
        gradingStatus: quiz.grading_status || quiz.gradingStatus || "no-submission",
        lessonId: quiz.lesson_id ?? quiz.lessonId ?? null,
        maxAttempts: toNumber(quiz.max_attempts ?? quiz.maxAttempts) || 1,
        passScore: quiz.pass_score ?? quiz.passScore ?? null,
        startDate: quiz.start_date || quiz.startDate || null,
        endDate: quiz.end_date || quiz.endDate || null,
        raw: quiz,
    };
};

const normalizeCreatePayload = (quizData = {}) => {
    const classTeacherSubjectId = toNumber(
        quizData.classTeacherSubjectId ?? quizData.class_teacher_subject_id
    );

    return {
        classTeacherSubjectId,
        lessonId: toNumber(quizData.lessonId ?? quizData.lesson_id) || null,
        title: String(quizData.title || "").trim(),
        description: quizData.description || "",
        quizType: mapQuizTypeToApi(quizData.quizType || quizData.examType) || "practice",
        durationMinutes: parseDurationMinutes(
            quizData.durationMinutes ?? quizData.durationLabel ?? quizData.duration
        ),
        maxAttempts: toNumber(quizData.maxAttempts ?? quizData.max_attempts) || 1,
        passScore:
            quizData.passScore === "" || quizData.passScore == null
                ? null
                : Number(quizData.passScore),
        isPublished:
            typeof quizData.isPublished === "boolean"
                ? quizData.isPublished
                : quizData.status
                    ? quizData.status === "open"
                    : false,
        startDate: quizData.startDate || null,
        endDate: quizData.endDate || null,
    };
};

const normalizeUpdatePayload = (quizData = {}) => {
    const payload = {
        title: quizData.title,
        description: quizData.description,
        lessonId:
            quizData.lessonId === undefined
                ? undefined
                : toNumber(quizData.lessonId ?? quizData.lesson_id) || null,
        quizType: mapQuizTypeToApi(quizData.quizType || quizData.examType),
        durationMinutes:
            quizData.durationMinutes === undefined &&
            quizData.durationLabel === undefined &&
            quizData.duration === undefined
                ? undefined
                : parseDurationMinutes(
                    quizData.durationMinutes ?? quizData.durationLabel ?? quizData.duration
                ),
        maxAttempts:
            quizData.maxAttempts === undefined && quizData.max_attempts === undefined
                ? undefined
                : toNumber(quizData.maxAttempts ?? quizData.max_attempts),
        passScore:
            quizData.passScore === undefined
                ? undefined
                : quizData.passScore === "" || quizData.passScore == null
                    ? null
                    : Number(quizData.passScore),
        isPublished:
            typeof quizData.isPublished === "boolean"
                ? quizData.isPublished
                : quizData.status
                    ? quizData.status === "open"
                    : undefined,
        startDate:
            quizData.startDate === undefined ? undefined : (quizData.startDate || null),
        endDate: quizData.endDate === undefined ? undefined : (quizData.endDate || null),
    };

    return Object.fromEntries(
        Object.entries(payload).filter(([, value]) => value !== undefined)
    );
};

async function listClassTeacherSubjects(params = {}) {
    const response = await axiosClient.get("/class-teacher-subjects", { params });
    const payload = getPayload(response);
    const rows = getRows(payload);
    return rows.map(mapAssignmentOption);
}

async function listQuizzes(params = {}) {
    const response = await axiosClient.get(QUIZ_ENDPOINT, { params });
    const payload = getPayload(response);
    const rows = getRows(payload);

    return {
        items: rows.map(mapApiQuizToView),
        pagination: payload?.pagination || null,
        raw: payload,
    };
}

async function getQuizById(id) {
    const response = await axiosClient.get(`${QUIZ_ENDPOINT}/${id}`);
    const payload = getPayload(response);
    const row = payload?.data || payload;
    return mapApiQuizToView(row);
}

async function createQuiz(quizData = {}) {
    const payload = normalizeCreatePayload(quizData);

    if (!payload.classTeacherSubjectId || !payload.title) {
        throw new Error("Thiếu classTeacherSubjectId hoặc title để tạo bài kiểm tra.");
    }

    return axiosClient.post(QUIZ_ENDPOINT, payload);
}

async function updateQuiz(id, quizData = {}) {
    const payload = normalizeUpdatePayload(quizData);
    if (!Object.keys(payload).length) {
        throw new Error("Không có dữ liệu để cập nhật bài kiểm tra.");
    }
    return axiosClient.put(`${QUIZ_ENDPOINT}/${id}`, payload);
}

async function deleteQuiz(id) {
    return axiosClient.delete(`${QUIZ_ENDPOINT}/${id}`);
}

async function publishQuiz(id, payload = {}) {
    return axiosClient.post(`${QUIZ_ENDPOINT}/${id}/publish`, payload);
}

async function unpublishQuiz(id) {
    return axiosClient.post(`${QUIZ_ENDPOINT}/${id}/unpublish`);
}

async function listQuestions(quizId) {
    const response = await axiosClient.get(`${QUIZ_ENDPOINT}/${quizId}/questions`);
    const payload = getPayload(response);
    const rows = getRows(payload);
    return rows.map(mapQuestionFromApi);
}

async function addQuestion(quizId, questionData = {}) {
    return axiosClient.post(
        `${QUIZ_ENDPOINT}/${quizId}/questions`,
        buildQuestionPayload(questionData)
    );
}

async function updateQuestion(quizId, questionId, questionData = {}) {
    const payload = buildQuestionPayload(questionData);
    return axiosClient.put(`${QUIZ_ENDPOINT}/${quizId}/questions/${questionId}`, payload);
}

async function deleteQuestion(quizId, questionId) {
    return axiosClient.delete(`${QUIZ_ENDPOINT}/${quizId}/questions/${questionId}`);
}

async function addAnswer(quizId, questionId, answerData = {}) {
    const payload = {
        answerText: String(answerData.answerText || answerData.text || "").trim(),
        isCorrect: Boolean(answerData.isCorrect),
    };
    return axiosClient.post(`${QUIZ_ENDPOINT}/${quizId}/questions/${questionId}/answers`, payload);
}

async function updateAnswer(quizId, questionId, answerId, answerData = {}) {
    const payload = {
        answerText: String(answerData.answerText || answerData.text || "").trim(),
        isCorrect: Boolean(answerData.isCorrect),
    };
    return axiosClient.put(
        `${QUIZ_ENDPOINT}/${quizId}/questions/${questionId}/answers/${answerId}`,
        payload
    );
}

async function deleteAnswer(quizId, questionId, answerId) {
    return axiosClient.delete(`${QUIZ_ENDPOINT}/${quizId}/questions/${questionId}/answers/${answerId}`);
}

async function listAttempts(quizId, params = {}) {
    const response = await axiosClient.get(`${QUIZ_ENDPOINT}/${quizId}/attempts`, { params });
    return getPayload(response);
}

async function getAttemptDetail(attemptId) {
    const response = await axiosClient.get(`${QUIZ_ENDPOINT}/attempts/${attemptId}`);
    return getPayload(response);
}

async function startQuiz(quizId, payload = {}) {
    return axiosClient.post(`${QUIZ_ENDPOINT}/${quizId}/start`, payload);
}

async function getQuizStatus(quizId) {
    return axiosClient.get(`${QUIZ_ENDPOINT}/${quizId}/status`);
}

async function saveQuizAttempt(attemptId, attemptData = {}) {
    return axiosClient.put(`${QUIZ_ENDPOINT}/attempts/${attemptId}`, attemptData);
}

async function submitQuiz(attemptId, attemptData = {}) {
    return axiosClient.put(`${QUIZ_ENDPOINT}/attempts/${attemptId}/submit`, attemptData);
}

async function syncQuizAttempt(attemptId, attemptData = {}) {
    return axiosClient.put(`${QUIZ_ENDPOINT}/attempts/${attemptId}/sync`, attemptData);
}

async function heartbeatQuizAttempt(attemptId, attemptData = {}) {
    return axiosClient.put(`${QUIZ_ENDPOINT}/attempts/${attemptId}/heartbeat`, attemptData);
}

async function validateQuizAttempt(attemptId, payload = {}) {
    return axiosClient.post(`${QUIZ_ENDPOINT}/attempts/${attemptId}/validate`, payload);
}

async function gradeAttempt(attemptId, gradeData = {}) {
    const payload = {
        scoreManual: Number(gradeData.scoreManual ?? gradeData.essayScore ?? 0),
        teacherComment: gradeData.teacherComment || gradeData.comment || "",
    };
    return axiosClient.put(`${QUIZ_ENDPOINT}/attempts/${attemptId}/grade`, payload);
}

async function downloadImportTemplate(type = "questions") {
    return axiosClient.get(`${QUIZ_ENDPOINT}/import/template`, {
        params: { type },
        responseType: "blob",
    });
}

async function previewImportFile(file) {
    const formData = toFormData({ file });
    return axiosClient.post(`${QUIZ_ENDPOINT}/import/preview`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
}

async function importQuizFromExcel(file, options = {}) {
    const formData = toFormData({ file, ...options });
    return axiosClient.post(`${QUIZ_ENDPOINT}/import`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
}

async function importQuestionsFromExcel(quizId, file, mode = "append") {
    const formData = toFormData({ file });
    return axiosClient.post(`${QUIZ_ENDPOINT}/${quizId}/import`, formData, {
        params: { mode },
        headers: { "Content-Type": "multipart/form-data" },
    });
}

async function uploadQuestionImage(file) {
    const formData = new FormData();
    formData.append("file", file);
    return axiosClient.post(`${QUIZ_ENDPOINT}/questions/upload-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
}

const quizService = {
    listClassTeacherSubjects,
    listQuizzes,
    getQuizById,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    publishQuiz,
    unpublishQuiz,
    startQuiz,
    getQuizStatus,
    listQuestions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    addAnswer,
    updateAnswer,
    deleteAnswer,
    listAttempts,
    getAttemptDetail,
    saveQuizAttempt,
    submitQuiz,
    syncQuizAttempt,
    heartbeatQuizAttempt,
    validateQuizAttempt,
    gradeAttempt,
    downloadImportTemplate,
    previewImportFile,
    importQuizFromExcel,
    importQuestionsFromExcel,
    uploadQuestionImage,
};

QUIZ_SERVICE_EXPORTS.push(
    listClassTeacherSubjects,
    listQuizzes,
    getQuizById,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    publishQuiz,
    unpublishQuiz,
    startQuiz,
    getQuizStatus,
    listQuestions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    addAnswer,
    updateAnswer,
    deleteAnswer,
    listAttempts,
    getAttemptDetail,
    saveQuizAttempt,
    submitQuiz,
    syncQuizAttempt,
    heartbeatQuizAttempt,
    validateQuizAttempt,
    gradeAttempt,
    downloadImportTemplate,
    previewImportFile,
    importQuizFromExcel,
    importQuestionsFromExcel,
    uploadQuestionImage
);

export { quizService };
export default quizService;

// Shared helper utilities for quiz pages while backend APIs are not integrated yet.

export const QUIZ_DURATION_OPTIONS = [
    { value: 15, label: "15 phút" },
    { value: 45, label: "1 tiết (45 phút)" },
];

export const DEFAULT_QUIZ_DURATION_LABEL = QUIZ_DURATION_OPTIONS[1].label;

export const DEFAULT_GRADE_FILTER_OPTIONS = ["Tất cả khối", "Khối 10", "Khối 11", "Khối 12"];

export function parseDurationMinutes(durationValue) {
    const matches = String(durationValue || "").match(/\d+/g);
    if (!matches || !matches.length) {
        return 45;
    }

    // "1 tiết (45 phút)" => ["1", "45"], choose largest to keep real minutes.
    return Math.max(...matches.map((value) => Number(value)));
}

export function formatDurationLabel(durationValue) {
    const minutes = parseDurationMinutes(durationValue);
    const matchedOption = QUIZ_DURATION_OPTIONS.find((option) => option.value === minutes);
    return matchedOption ? matchedOption.label : `${minutes} phút`;
}

export function normalizeGrade(gradeValue) {
    return String(gradeValue || "")
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();
}


export function buildFinalScore({ autoScore = 0, essayScore = 0 }) {
    const total = Number(autoScore || 0) + Number(essayScore || 0);
    return Number(Math.min(10, total).toFixed(2));
}

