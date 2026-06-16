import React from "react";
import "./GradesSection.css";

const SEMESTER_OPTIONS = [
    { key: "hk1", label: "HK I" },
    { key: "hk2", label: "HK II" },
    { key: "year", label: "Cả năm" }
]

function getRank(average) {
    const score = Number(average);
    if (!Number.isFinite(score)) return "—";

    if (score >= 8.0) return "Giỏi";
    if (score >= 6.5) return "Khá";
    if (score >= 5.0) return "Trung bình";
    return "Yếu";
}

function getRankClass(rank) {
    if (!rank || rank === "—") return "empty";
    return rank.toLowerCase().replace(/\s+/g, "-");
}

function formatAverage(value) {
    return (Math.round(value * 10) / 10).toFixed(1)
}

function formatScore(value) {
    const score = Number(value)
    return Number.isFinite(score) ? score.toFixed(1).replace(/\.0$/, "") : "—"
}

export default function GradesSection({
    grades,
    gradesBySemester,
    selectedSemester = "hk1",
    onSemesterChange,
    compact = false,
    semesterNoteText,
    highlightSemesterNote = false
}) {
    const validSemester = SEMESTER_OPTIONS.some((item) => item.key === selectedSemester)
        ? selectedSemester
        : "hk1"

    const currentGrades = gradesBySemester
        ? gradesBySemester[validSemester] || []
        : grades || []

    // Ở tab Tổng quan (compact), chỉ hiển thị tối đa 5 môn.
    const displayedGrades = compact ? currentGrades.slice(0, 5) : currentGrades

    const currentSemesterLabel = SEMESTER_OPTIONS.find((item) => item.key === validSemester)?.label || "HK I"
    const numericAverages = displayedGrades
        .map((item) => Number(item.average))
        .filter((value) => Number.isFinite(value))

    const hasOverall = numericAverages.length > 0
    const overallAverage = hasOverall
        ? numericAverages.reduce((sum, score) => sum + score, 0) / numericAverages.length
        : null
    const overallRank = hasOverall ? getRank(overallAverage) : null
    const completedCount = numericAverages.length
    const subjectCount = currentGrades.length
    const emptyMessage = gradesBySemester
        ? `Chưa có dữ liệu điểm cho ${currentSemesterLabel}.`
        : "Chưa có dữ liệu điểm trong học kỳ này."

    return (
        <div className={`grades-card ${compact ? "compact" : ""}`}>
            <div className="grades-header-row">
                <div className="section-heading">
                    <div className="section-heading-text">
                        <h3>Điểm số</h3>
                        <p>{semesterNoteText || `Đang xem: ${currentSemesterLabel}`}</p>
                    </div>
                </div>

                {gradesBySemester ? (
                    <div className="grades-semester-switch" role="tablist" aria-label="Chọn học kỳ">
                        {SEMESTER_OPTIONS.map((item) => (
                            <button
                                key={item.key}
                                type="button"
                                className={`grades-semester-btn ${validSemester === item.key ? "active" : ""}`}
                                onClick={() => onSemesterChange?.(item.key)}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                ) : null}
            </div>

            <div className={`grades-summary-strip ${highlightSemesterNote ? "highlight" : ""}`}>
                <div className="grades-summary-item">
                    <span>Trung bình</span>
                    <strong>{hasOverall ? formatAverage(overallAverage) : "—"}</strong>
                </div>
                <div className="grades-summary-item">
                    <span>Xếp loại</span>
                    <strong>{overallRank || "—"}</strong>
                </div>
                <div className="grades-summary-item">
                    <span>Số môn có điểm</span>
                    <strong>{completedCount}/{subjectCount || 0}</strong>
                </div>
            </div>

            {displayedGrades.length === 0 ? (
                <div className="grades-empty-state">
                    <strong>Chưa có dữ liệu điểm</strong>
                    <span>{emptyMessage}</span>
                </div>
            ) : (
                <div className="grades-table-wrapper">
                    <table className="grades-table">
                        <thead>
                        <tr>
                            <th>Môn học</th>
                            <th>Miệng</th>
                            <th>15 phút</th>
                            <th>Giữa kỳ</th>
                            <th>Cuối kỳ</th>
                            <th>Trung bình</th>
                            <th>Xếp loại</th>
                        </tr>
                        </thead>

                        <tbody>
                        {displayedGrades.map((item, index) => {
                            const rank = getRank(item.average);

                            return (
                                <tr key={`${item.subject}-${index}`}>
                                    <td className="subject-cell">{item.subject}</td>
                                    <td>{formatScore(item.oral)}</td>
                                    <td>{formatScore(item.test15)}</td>
                                    <td>{formatScore(item.midterm)}</td>
                                    <td>{formatScore(item.final)}</td>
                                    <td className="average-cell">{formatScore(item.average)}</td>
                                    <td>
                                        {rank === "—" ? "—" : (
                                            <span className={`grade-status ${getRankClass(rank)}`}>
                                                {rank}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}

                        <tr className="grades-total-row">
                            <td>Tổng trung bình</td>
                            <td>—</td>
                            <td>—</td>
                            <td>—</td>
                            <td>—</td>
                            <td>{hasOverall ? formatAverage(overallAverage) : "—"}</td>
                            <td>
                                {overallRank ? (
                                    <span className={`grade-status ${getRankClass(overallRank)}`}>
                                        {overallRank}
                                    </span>
                                ) : "—"}
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            )}

        </div>
    );
}
