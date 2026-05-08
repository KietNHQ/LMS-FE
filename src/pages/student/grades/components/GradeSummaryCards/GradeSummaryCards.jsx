export default function GradeSummaryCards({
    summaryAverage,
    summaryAverageLabel,
    conduct,
    subjectCount,
    getSummaryColorClass,
}) {
    return (
        <div className="grades-stats">
            <div className="grades-card">
                <h2 className="blue">{summaryAverage.toFixed(2)}</h2>
                <p>{summaryAverageLabel}</p>
            </div>

            <div className="grades-card">
                <h2 className={getSummaryColorClass(conduct)}>{conduct}</h2>
                <p>Academic Rank</p>
            </div>

            <div className="grades-card">
                <h2 className="green">{subjectCount}</h2>
                <p>Subjects</p>
            </div>
        </div>
    );
}


