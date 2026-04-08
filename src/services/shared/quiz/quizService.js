// Service dung chung cho cac trang co quiz.
// TODO: Bo sung API dung chung khi backend san sang.
export const quizService = {};

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

export function calculateAutoObjectiveScore(questionResults = []) {
    return questionResults.reduce((sum, item) => {
        if (item?.type !== "multiple-choice") {
            return sum;
        }
        return sum + (item?.isCorrect ? Number(item?.score || 0) : 0);
    }, 0);
}

export function buildFinalScore({ autoScore = 0, essayScore = 0 }) {
    const total = Number(autoScore || 0) + Number(essayScore || 0);
    return Number(Math.min(10, total).toFixed(2));
}
