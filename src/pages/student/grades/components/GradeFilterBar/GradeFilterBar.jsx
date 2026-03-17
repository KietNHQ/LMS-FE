export default function GradeFilterBar({
    classOptions,
    selectedClass,
    onChangeClass,
    activeTab,
    onChangeTab,
}) {
    return (
        <div className="grades-toolbar">
            <div className="grades-filter">
                <label htmlFor="classSelect">Select Class:</label>
                <select id="classSelect" value={selectedClass} onChange={onChangeClass}>
                    {classOptions.map((item) => (
                        <option key={item} value={item}>
                            {item}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grades-tabs">
                <button
                    className={activeTab === "hk1" ? "active" : ""}
                    onClick={() => onChangeTab("hk1")}
                    type="button"
                >
                    Semester 1
                </button>

                <button
                    className={activeTab === "hk2" ? "active" : ""}
                    onClick={() => onChangeTab("hk2")}
                    type="button"
                >
                    Semester 2
                </button>

                <button
                    className={activeTab === "year" ? "active" : ""}
                    onClick={() => onChangeTab("year")}
                    type="button"
                >
                    Full Year
                </button>
            </div>
        </div>
    );
}

