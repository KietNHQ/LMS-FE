import SectionCard from "../../../../../components/common/SectionCard/SectionCard";
import "./GradeSummarySection.css";

export default function GradeSummarySection({ classLabel, semesterLabel, subjectLabel, stats, onOpenStudent }) {
    const topStudentText = stats?.topStudent
        ? `${stats.topStudent.name} · ${stats.topStudent.average.toFixed(1)}`
        : "-";

    const weakestStudentText = stats?.weakestStudent
        ? `${stats.weakestStudent.name} · ${stats.weakestStudent.average.toFixed(1)}`
        : "-";

    const summaryCards = [
        {
            key: "average",
            label: "Điểm trung bình",
            value: stats?.average?.toFixed?.(1) || "0.0",
            tone: "teacher",
            records: [],
        },
        {
            key: "top",
            label: "Học sinh cao nhất",
            value: topStudentText,
            tone: "success",
            isDetail: true,
            records: stats?.topStudent ? [stats.topStudent] : [],
        },
        {
            key: "weakest",
            label: "Học sinh thấp nhất",
            value: weakestStudentText,
            tone: "accent",
            isDetail: true,
            records: stats?.weakestStudent ? [stats.weakestStudent] : [],
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
        <SectionCard
            title="Tổng quan điểm số"
            subtitle={`${classLabel} · ${subjectLabel} · ${semesterLabel}`}
        >
            <div className="grade-summary-section">
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
        </SectionCard>
    );
}
