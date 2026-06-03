export default function GradeDetail({ subject }) {
    const renderRegularGrades = (regularGrades = []) => {
        if (!regularGrades || regularGrades.length === 0) return <strong>-</strong>;
        return (
            <div className="regular-grades-list">
                {regularGrades.map((g, idx) => (
                    <span key={idx} className="grade-chip">{`KT TX lần ${idx + 1}: ${g}`}</span>
                ))}
            </div>
        );
    };

    const yearIsComplete = subject.yearIsComplete !== undefined ? subject.yearIsComplete : true;

    return (
        <div className="table-detail-row">
            <div className="detail-panels">
                <div className="detail-card">
                    <h3>Học kỳ 1</h3>

                    <div className="detail-item">
                        <span>Thường xuyên</span>
                        {renderRegularGrades(subject.hk1?.regularGrades)}
                    </div>
                    <div className="detail-item">
                        <span>Giữa kỳ</span>
                        <strong>{subject.hk1?.midtermScore ?? "-"}</strong>
                    </div>
                    <div className="detail-item">
                        <span>Cuối kỳ</span>
                        <strong>{subject.hk1?.finalScore ?? "-"}</strong>
                    </div>

                    <div className="detail-divider" />
                    <div className="detail-item detail-average">
                        <span>Điểm trung bình HK1</span>
                        <strong>{(subject.hk1Avg || 0).toFixed(2)}</strong>
                    </div>
                </div>

                <div className="detail-card">
                    <h3>Học kỳ 2</h3>

                    <div className="detail-item">
                        <span>Thường xuyên</span>
                        {renderRegularGrades(subject.hk2?.regularGrades)}
                    </div>
                    <div className="detail-item">
                        <span>Giữa kỳ</span>
                        <strong>{subject.hk2?.midtermScore ?? "-"}</strong>
                    </div>
                    <div className="detail-item">
                        <span>Cuối kỳ</span>
                        <strong>{subject.hk2?.finalScore ?? "-"}</strong>
                    </div>

                    <div className="detail-divider" />
                    <div className="detail-item detail-average">
                        <span>Điểm trung bình HK2</span>
                        <strong>{(subject.hk2Avg || 0).toFixed(2)}</strong>
                    </div>
                </div>
            </div>

            <div className="year-summary-card">
                <div className="year-summary-item">
                    <span>Điểm cả năm</span>
                    <strong>{(subject.yearAvg || 0).toFixed(2)} {!yearIsComplete && <small style={{ marginLeft: 8, color: '#888' }}>(Tạm tính)</small>}</strong>
                </div>

                <div className="year-summary-item">
                    <span>Xếp loại</span>
                    <strong>{subject.rank}</strong>
                </div>
            </div>
        </div>
    );
}


