import React, { useMemo, useState } from "react";
import { Modal } from "../../../../../components/ui";
import { buildFinalScore } from "../../../../../services/shared/quiz/quizService";
import "./SubmissionReviewDialog.css";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export default function SubmissionReviewDialog({
    open,
    quiz,
    currentTeacherName,
    onClose,
    onSaveEssayScore,
}) {
    const [draftScores, setDraftScores] = useState({});

    const canGrade = useMemo(() => {
        if (!quiz) return false;
        if (!quiz.gradingAssignment?.required) return true;
        return quiz.gradingAssignment.assignedTeacherName === currentTeacherName;
    }, [quiz, currentTeacherName]);

    if (!quiz) {
        return null;
    }

    const submissions = quiz.submissions || [];

    const getDraftEssayScore = (submission) => {
        const draft = draftScores[submission.id];
        if (draft === undefined) {
            return submission.essayScore ?? "";
        }
        return draft;
    };

    const handleChangeDraft = (submissionId, value) => {
        setDraftScores((prev) => ({
            ...prev,
            [submissionId]: value,
        }));
    };

    const handleSave = (submission) => {
        const rawValue = getDraftEssayScore(submission);
        const parsed = Number.parseFloat(rawValue);
        const essayScore = Number.isFinite(parsed)
            ? clamp(parsed, 0, Number(submission.essayMaxScore || 0))
            : 0;

        onSaveEssayScore?.(quiz.id, submission.id, essayScore);
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={`Bài đã nộp - ${quiz.title}`}
            className="submission-review-dialog"
        >
            <div className="submission-review-dialog__summary">
                <span>{submissions.length} bài đã nộp</span>
                <span>
                    Cần chấm tự luận: {submissions.filter((item) => item.essayMaxScore > 0 && !item.isEssayGraded).length}
                </span>
                <span className={quiz.isScoreReadyForGradebook ? "ready" : "pending"}>
                    {quiz.isScoreReadyForGradebook
                        ? "Sẵn sàng đồng bộ điểm"
                        : "Đang chờ hoàn tất chấm tự luận"}
                </span>
            </div>

            {quiz.gradingAssignment?.required && (
                <p className="submission-review-dialog__assignment">
                    Phân công chấm: <strong>{quiz.gradingAssignment.assignedTeacherName || "Chưa phân công"}</strong>
                    {quiz.gradingAssignment.source === "random" ? " (random theo bộ môn)" : ""}
                </p>
            )}

            {!canGrade && (
                <p className="submission-review-dialog__warning">
                    Bạn không phải giáo viên được phân công chấm bài này.
                </p>
            )}

            <div className="submission-review-dialog__list">
                {submissions.map((submission) => {
                    const finalScore = buildFinalScore({
                        autoScore: submission.autoScore,
                        essayScore: submission.essayScore,
                    });

                    return (
                        <article key={submission.id} className="submission-review-dialog__item">
                            <div className="submission-review-dialog__item-header">
                                <div>
                                    <h4>{submission.studentName}</h4>
                                    <small>Nộp lúc: {submission.submittedAt}</small>
                                </div>
                                <span className={submission.isEssayGraded ? "graded" : "waiting"}>
                                    {submission.isEssayGraded ? "Đã chấm" : "Chờ chấm"}
                                </span>
                            </div>

                            <p className="submission-review-dialog__essay-preview">
                                <strong>Tự luận:</strong> {submission.essayAnswer || "Không có câu tự luận"}
                            </p>

                            <div className="submission-review-dialog__scores">
                                <div>
                                    <label>Điểm trắc nghiệm (tự động)</label>
                                    <b>{Number(submission.autoScore || 0).toFixed(2)}</b>
                                </div>
                                <div>
                                    <label>Điểm tự luận (tối đa {submission.essayMaxScore || 0})</label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={submission.essayMaxScore || 0}
                                        step="0.25"
                                        value={getDraftEssayScore(submission)}
                                        disabled={!canGrade || submission.essayMaxScore <= 0}
                                        onChange={(event) => handleChangeDraft(submission.id, event.target.value)}
                                    />
                                </div>
                                <div>
                                    <label>Tổng điểm</label>
                                    <b>{finalScore.toFixed(2)}</b>
                                </div>
                            </div>

                            <div className="submission-review-dialog__actions">
                                <button
                                    type="button"
                                    disabled={!canGrade || submission.essayMaxScore <= 0}
                                    onClick={() => handleSave(submission)}
                                >
                                    Ghi nhận điểm tự luận
                                </button>
                            </div>
                        </article>
                    );
                })}
            </div>
        </Modal>
    );
}





