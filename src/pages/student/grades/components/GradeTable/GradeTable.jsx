import GradeRow from "../GradeRow/GradeRow";

export default function GradeTable({
    currentData,
    selectedClass,
    activeTab,
    openRowId,
    onToggleRow,
    getSubjectIcon,
    getDisplayedValue,
    getRankColorClass,
}) {
    return (
        <div className="grades-table">
            <div className="table-header">
                <span>Subject</span>
                <span>S1 Avg</span>
                <span>S2 Avg</span>
                <span>{activeTab === "year" ? "Year Avg" : "Displayed"}</span>
                <span className="progress-header">Progress</span>
                <span>Rank</span>
                <span>Details</span>
            </div>

            {currentData.subjects.map((subject) => (
                <GradeRow
                    key={`${selectedClass}-${subject.id}`}
                    selectedClass={selectedClass}
                    subject={subject}
                    openRowId={openRowId}
                    onToggleRow={onToggleRow}
                    getSubjectIcon={getSubjectIcon}
                    getDisplayedValue={getDisplayedValue}
                    getRankColorClass={getRankColorClass}
                />
            ))}
        </div>
    );
}



