import "./GradeSummarySection.css";

export function GradeSummaryHeader({ subjectLabel }) {
    return (
        <div className="grade-summary-section__header">
            <h3>Tổng quan điểm số</h3>
            <span className="grade-summary-subject-badge">Môn: {subjectLabel}</span>
        </div>
    );
}

export default function GradeSummarySection({ stats, onOpenStudent }) {
    const summaryCards = [
        {
            key: "average",
            label: "Điểm trung bình",
            value: stats?.average?.toFixed?.(1) || "0.0",
            tone: "teacher",
            records: [],
        },
        {
            key: "atRisk",
            label: "Cảnh báo có thể rớt",
            value: stats?.atRiskCount || 0,
            tone: "danger",
            records: stats?.atRiskStudents || [],
            helperText: (stats?.atRiskCount || 0) > 0
                ? `Bấm để xem ${stats.atRiskCount} học sinh cảnh báo`
                : "Không có học sinh cảnh báo",
        },
    ];

    return (
        <div className="grade-summary-wrapper">
            <div className="grade-summary-cards">
                {summaryCards.map((item) => {
                    const isClickable = item.records.length > 0 && typeof onOpenStudent === "function";

                    return (
                        <button
                            key={item.key}
                            type="button"
                            disabled={!isClickable}
                            className={`grade-summary-card tone-${item.tone} ${item.isDetail ? "is-detail" : ""} ${isClickable ? "is-clickable" : ""}`.trim()}
                            onClick={() => {
                                if (isClickable) {
                                    onOpenStudent(item);
                                }
                            }}
                        >
                            <span>{item.label}</span>
                            <strong>{item.value}</strong>
                            {item.helperText ? <small>{item.helperText}</small> : null}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
