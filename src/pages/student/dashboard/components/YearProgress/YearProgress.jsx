export default function YearProgress({ items, onOpenGrades }) {
    return (
        <div className="student-dashboard-card student-dashboard-card-equal student-dashboard-card-years">
            <h3>Tiến độ qua các năm học</h3>

            <div className="student-year-list">
                {items.map((item, index) => {
                    const isLastRow = index === items.length - 1;

                    return (
                        <button
                            key={item.grade}
                            className={`student-year-row ${isLastRow ? "open-up" : "open-down"}`}
                            type="button"
                            onClick={onOpenGrades}
                        >
                            <div className="student-year-row-main">
                                <span className="student-year-grade">{item.grade}</span>

                                <div className="student-progress-bar">
                                    <div style={{ width: `${item.progressPercent || 0}%` }} />
                                </div>

                                <strong>{item.fullYear != null ? Number(item.fullYear).toFixed(2) : "--"}</strong>
                            </div>

                            <div className="student-year-hover-buffer" />

                            <div className="student-year-detail-pop">
                                <div className="student-year-detail-grid">
                                    <div className="student-year-detail-item">
                                        <span>HK1</span>
                                        <strong>{item.hk1 != null ? Number(item.hk1).toFixed(2) : "--"}</strong>
                                    </div>
                                    <div className="student-year-detail-item">
                                        <span>HK2</span>
                                        <strong>{item.hk2 != null ? Number(item.hk2).toFixed(2) : "--"}</strong>
                                    </div>
                                    <div className="student-year-detail-item">
                                        <span>Cả năm</span>
                                        <strong>{item.fullYear != null ? Number(item.fullYear).toFixed(2) : "--"}</strong>
                                    </div>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}


