import "./GradeSummarySection.css";

export function GradeSummaryHeader({ subjectLabel, isCommentGraded = false }) {
    return (
        <div className="grade-summary-section__header">
            <h3>{isCommentGraded ? "Tổng quan đánh giá" : "Tổng quan điểm số"}</h3>
            <span className="grade-summary-subject-badge">Môn: {subjectLabel || "---"}</span>
        </div>
    );
}

export default function GradeSummarySection({ stats, onOpenAtRisk, isCommentGraded = false }) {
    const summaryCards = isCommentGraded ? [
        {
            key: "evaluated",
            label: "Đã đánh giá",
            value: stats?.evaluatedCount || 0,
            tone: "teacher",
            helperText: "Học sinh đã có kết quả"
        },
        {
            key: "passRate",
            label: "Tỷ lệ đạt",
            value: `${stats?.passRate || 0}%`,
            tone: "success",
            helperText: `${stats?.passCount || 0} học sinh Đạt`
        },
        {
            key: "fail",
            label: "Chưa đạt",
            value: stats?.failCount || 0,
            tone: "danger",
            isClickable: (stats?.failCount || 0) > 0,
            onClick: onOpenAtRisk,
            helperText: (stats?.failCount || 0) > 0 ? "Bấm để xem danh sách" : "Không có học sinh"
        },
        {
            key: "pending",
            label: "Chưa đánh giá",
            value: stats?.pendingCount || 0,
            tone: "teacher",
            helperText: "Cần hoàn tất trước khi nộp"
        },
    ] : [
        {
            key: "average",
            label: "Điểm trung bình lớp",
            value: stats?.average?.toFixed?.(1) || "0.0",
            tone: "teacher",
            helperText: "Dựa trên tất cả học sinh"
        },
        {
            key: "passRate",
            label: "Tỷ lệ đạt",
            value: `${stats?.passRate || 0}%`,
            tone: "success",
            helperText: "Học sinh có điểm TB >= 5.0"
        },
        {
            key: "excellentRate",
            label: "Tỷ lệ giỏi/xuất sắc",
            value: `${stats?.excellentRate || 0}%`,
            tone: "teacher",
            helperText: "Học sinh có điểm TB >= 8.5"
        },
        {
            key: "atRisk",
            label: "Cảnh báo học tập",
            value: stats?.atRiskCount || 0,
            tone: "danger",
            isClickable: (stats?.atRiskCount || 0) > 0,
            onClick: onOpenAtRisk,
            helperText: (stats?.atRiskCount || 0) > 0
                ? "Bấm để xem danh sách"
                : "Không có cảnh báo"
        },
    ];

    return (
        <div className="grade-summary-wrapper">
            <div className="grade-summary-cards">
                {summaryCards.map((item) => {
                    const CardTag = item.isClickable ? "button" : "div";
                    return (
                        <CardTag
                            key={item.key}
                            type={item.isClickable ? "button" : undefined}
                            className={`grade-summary-card tone-${item.tone} ${item.isClickable ? "is-clickable" : ""}`}
                            onClick={item.onClick}
                        >
                            <span>{item.label}</span>
                            <strong>{item.value}</strong>
                            {item.helperText && <small>{item.helperText}</small>}
                        </CardTag>
                    );
                })}
            </div>
        </div>
    );
}
