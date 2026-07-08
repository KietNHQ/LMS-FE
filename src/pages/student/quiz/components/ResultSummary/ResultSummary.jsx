import React from "react";
import { BiArrowBack, BiTrophy } from "react-icons/bi";
import "./ResultSummary.css";
import QuestionItem from "../QuestionItem/QuestionItem";

export default function ResultSummary({ result, onBack }) {
    const isPendingReview = Boolean(result.pendingReview);
    const scoreLabel = isPendingReview ? "Chờ chấm" : `${result.score}/10`;
    const subtitle = isPendingReview
        ? "Bài tự luận đã được nộp. Giáo viên sẽ chấm và cập nhật điểm sau."
        : `${result.correctCount}/${result.total} câu đúng · ${result.quizTitle}`;

    return (
        <div className="result-summary-page">
            <div className="result-summary-content">
                <div className="result-summary-main">
                    <div className="result-summary-header">
                        <div className="result-summary-score">
                            <div className="result-summary-icon">
                                <BiTrophy />
                            </div>
                            <div>
                                <span>{isPendingReview || result.hideDetails ? "Kết quả bài nộp" : "Kết quả bài làm"}</span>
                                {(!result.hideDetails || result.score !== null) && <h1>{scoreLabel}</h1>}
                                {result.hideDetails && <h2>{result.quizTitle}</h2>}
                                <p>{result.hideDetails ? "Nộp bài thành công! Chi tiết bài làm và đáp án hiện đang tạm ẩn đối với bài kiểm tra này." : subtitle}</p>
                            </div>
                        </div>
                    </div>

                    {!result.hideDetails && (
                        <div className="result-summary-list">
                            {result.questions.map((question, index) => (
                                <QuestionItem
                                    key={question.id}
                                    question={question}
                                    index={index}
                                    selectedAnswer={result.answers[question.id] || result.answers[String(question.id)]}
                                    onChoose={() => {}}
                                    disabled
                                    showResult
                                />
                            ))}
                        </div>
                    )}
                </div>

                <aside className="result-summary-sticky-actions">
                    <button className="result-summary-back" onClick={onBack}>
                        <BiArrowBack />
                        <span>Quay lại danh sách</span>
                    </button>
                </aside>
            </div>
        </div>
    );
}

