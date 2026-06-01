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

function ScoreCard({ icon, label, value, sub, colorClass }) {
    return (
        <div className={`conduct-score-card ${colorClass || ""}`}>
            <div className="conduct-score-icon">{icon}</div>
            <div className="conduct-score-body">
                <span className="conduct-score-label">{label}</span>
                <strong className="conduct-score-value">{value ?? "—"}</strong>
                {sub && <span className="conduct-score-sub">{sub}</span>}
            </div>
        </div>
    );
}

function StatRow({ icon, label, value, highlight }) {
    return (
        <div className={`conduct-stat-row ${highlight ? "highlight" : ""}`}>
            <span className="conduct-stat-icon">{icon}</span>
            <span className="conduct-stat-label">{label}</span>
            <span className="conduct-stat-value">{value ?? "—"}</span>
        </div>
    );
}

function DisciplineScoreBar({ score }) {
    const scoreNum = typeof score === "number" ? score : 50;
    const clamped = Math.max(0, Math.min(100, scoreNum));
    const barColor = clamped >= 80 ? "#22c55e" : clamped >= 60 ? "#f59e0b" : "#ef4444";

    return (
        <div className="conduct-score-bar-wrap">
            <div className="conduct-score-bar-track">
                <div
                    className="conduct-score-bar-fill"
                    style={{ width: `${clamped}%`, background: barColor }}
                />
            </div>
            <span className="conduct-score-bar-label" style={{ color: barColor }}>
                {scoreNum.toFixed(1)}
            </span>
        </div>
    );
}

export default function ConductSection({ conductSummary, disciplineScores, loading }) {
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
            <div className="conduct-loading">
                <div className="conduct-loading-spinner" />
                <span>Đang tải hạnh kiểm...</span>
            </div>
        );
    }

    return (
        <div className="conduct-section">
            {/* Conduct Levels */}
            <div className="conduct-levels-grid">
                <ScoreCard
                    icon={<span>HK I</span>}
                    label="Hạnh kiểm Học kỳ 1"
                    value={hk1Level || "—"}
                    colorClass={`conduct-card-hk1 ${getLevelClass(hk1Level)}`}
                />
                <ScoreCard
                    icon={<span>HK II</span>}
                    label="Hạnh kiểm Học kỳ 2"
                    value={hk2Level || "—"}
                    colorClass={`conduct-card-hk2 ${getLevelClass(hk2Level)}`}
                />
                <ScoreCard
                    icon={<span>Cả năm</span>}
                    label="Hạnh kiểm Cả năm"
                    value={annualLevel || "—"}
                    colorClass={`conduct-card-annual ${getLevelClass(annualLevel)}`}
                />
            </div>

            {capReason && (
                <div className="conduct-cap-notice">
                    <span className="conduct-cap-icon">⚠</span>
                    <span>
                        Hạnh kiểm bị giới hạn ở mức <strong>{maxConductLevel}</strong> do:{" "}
                        {capReason}
                    </span>
                </div>
            )}

            {/* Discipline Score */}
            <div className="conduct-discipline-block">
                <h3 className="conduct-section-title">Điểm thi đua nề nếp</h3>
                <div className="conduct-discipline-inner">
                    <div className="conduct-score-main">
                        <span className="conduct-score-number">{disciplineScore.toFixed(1)}</span>
                        <span className="conduct-score-max">/ 100</span>
                    </div>
                    <DisciplineScoreBar score={disciplineScore} />
                </div>
                <div className="conduct-reward-violation-row">
                    <div className="conduct-point-chip reward">
                        <span className="point-chip-icon">+</span>
                        <span className="point-chip-count">{rewardPoints}</span>
                        <span className="point-chip-label">điểm khen thưởng</span>
                        <span className="point-chip-n">({rewardCount} lượt)</span>
                    </div>
                    <div className="conduct-point-chip violation">
                        <span className="point-chip-icon">−</span>
                        <span className="point-chip-count">{violationPoints}</span>
                        <span className="point-chip-label">điểm vi phạm</span>
                        <span className="point-chip-n">({violationCount} lượt)</span>
                    </div>
                </div>
            </div>

            {/* Attendance Info */}
            <div className="conduct-attendance-block">
                <h3 className="conduct-section-title">Thông tin chuyên cần</h3>
                <div className="conduct-attendance-stats">
                    <StatRow
                        icon={<span>📅</span>}
                        label="Số ngày vắng mặt không phép"
                        value={unexcusedAbsentDays != null ? `${unexcusedAbsentDays} ngày` : "—"}
                        highlight={unexcusedAbsentDays > 3}
                    />
                </div>
            </div>
        </div>
    );
}
