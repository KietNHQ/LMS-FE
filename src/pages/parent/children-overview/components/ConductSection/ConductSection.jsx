import React from "react";
import "./ConductSection.css";

const LEVEL_COLORS = {
    "Tốt": "good",
    "Khá": "fair",
    "Trung bình": "avg",
    "Yếu": "weak",
};

function getLevelClass(level) {
    if (!level) return "";
    return LEVEL_COLORS[level] || "";
}

function ScoreCard({ icon, label, value, colorClass }) {
    return (
        <div className={`parent-conduct-card ${colorClass || ""}`}>
            <div className="parent-conduct-card-icon">{icon}</div>
            <div className="parent-conduct-card-body">
                <span className="parent-conduct-card-label">{label}</span>
                <strong className="parent-conduct-card-value">{value ?? "—"}</strong>
            </div>
        </div>
    );
}

function DisciplineScoreBar({ score }) {
    const scoreNum = typeof score === "number" ? score : 50;
    const clamped = Math.max(0, Math.min(100, scoreNum));
    const barColor = clamped >= 80 ? "#22c55e" : clamped >= 60 ? "#f59e0b" : "#ef4444";

    return (
        <div className="parent-conduct-bar-wrap">
            <div className="parent-conduct-bar-track">
                <div
                    className="parent-conduct-bar-fill"
                    style={{ width: `${clamped}%`, background: barColor }}
                />
            </div>
            <span className="parent-conduct-bar-label" style={{ color: barColor }}>
                {scoreNum.toFixed(1)}
            </span>
        </div>
    );
}

export default function ParentConductSection({ conductSummary, disciplineScores, loading }) {
    const hk1Level = conductSummary?.hk1Level;
    const hk2Level = conductSummary?.hk2Level;
    const annualLevel = conductSummary?.annualLevel;
    const unexcusedAbsentDays = conductSummary?.unexcusedAbsentDays;
    const capReason = conductSummary?.capReason;
    const maxConductLevel = conductSummary?.maxConductLevel;

    const rewardPoints = disciplineScores?.rewardPoints ?? 0;
    const violationPoints = disciplineScores?.violationPoints ?? 0;
    const rewardCount = disciplineScores?.rewardCount ?? 0;
    const violationCount = disciplineScores?.violationCount ?? 0;
    const disciplineScore = disciplineScores?.disciplineScore ?? 50;

    if (loading) {
        return (
            <div className="parent-conduct-loading">
                <div className="parent-conduct-spinner" />
                <span>Đang tải hạnh kiểm...</span>
            </div>
        );
    }

    return (
        <div className="parent-conduct-section">
            {/* Conduct Levels */}
            <div className="parent-conduct-levels-grid">
                <ScoreCard
                    icon={<span>HK I</span>}
                    label="Hạnh kiểm Học kỳ 1"
                    value={hk1Level || "—"}
                    colorClass={`hk1 ${getLevelClass(hk1Level)}`}
                />
                <ScoreCard
                    icon={<span>HK II</span>}
                    label="Hạnh kiểm Học kỳ 2"
                    value={hk2Level || "—"}
                    colorClass={`hk2 ${getLevelClass(hk2Level)}`}
                />
                <ScoreCard
                    icon={<span>Cả năm</span>}
                    label="Hạnh kiểm Cả năm"
                    value={annualLevel || "—"}
                    colorClass={`annual ${getLevelClass(annualLevel)}`}
                />
            </div>

            {capReason && (
                <div className="parent-conduct-cap-notice">
                    <span className="parent-conduct-cap-icon">⚠</span>
                    <span>
                        Hạnh kiểm bị giới hạn ở mức <strong>{maxConductLevel}</strong> do:{" "}
                        {capReason}
                    </span>
                </div>
            )}

            {/* Discipline Score */}
            <div className="parent-conduct-discipline-block">
                <h3 className="parent-conduct-section-title">Điểm thi đua nề nếp</h3>
                <div className="parent-conduct-discipline-inner">
                    <div className="parent-conduct-score-main">
                        <span className="parent-conduct-score-number">{disciplineScore.toFixed(1)}</span>
                        <span className="parent-conduct-score-max">/ 100</span>
                    </div>
                    <DisciplineScoreBar score={disciplineScore} />
                </div>
                <div className="parent-conduct-points-row">
                    <div className="parent-conduct-chip reward">
                        <span className="parent-conduct-chip-icon">+</span>
                        <span className="parent-conduct-chip-count">{rewardPoints}</span>
                        <span className="parent-conduct-chip-label">điểm khen thưởng</span>
                        <span className="parent-conduct-chip-n">({rewardCount} lượt)</span>
                    </div>
                    <div className="parent-conduct-chip violation">
                        <span className="parent-conduct-chip-icon">−</span>
                        <span className="parent-conduct-chip-count">{violationPoints}</span>
                        <span className="parent-conduct-chip-label">điểm vi phạm</span>
                        <span className="parent-conduct-chip-n">({violationCount} lượt)</span>
                    </div>
                </div>
            </div>

            {/* Attendance */}
            <div className="parent-conduct-attendance-block">
                <h3 className="parent-conduct-section-title">Thông tin chuyên cần</h3>
                <div className="parent-conduct-stat-row">
                    <span className="parent-conduct-stat-icon">📅</span>
                    <span className="parent-conduct-stat-label">Số ngày vắng mặt không phép</span>
                    <span className={`parent-conduct-stat-value ${unexcusedAbsentDays > 3 ? "danger" : ""}`}>
                        {unexcusedAbsentDays != null ? `${unexcusedAbsentDays} ngày` : "—"}
                    </span>
                </div>
            </div>
        </div>
    );
}
