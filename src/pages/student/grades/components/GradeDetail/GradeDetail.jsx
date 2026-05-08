export default function GradeDetail({ subject }) {
    return (
        <div className="table-detail-row">
            <div className="detail-panels">
                <div className="detail-card">
                    <h3>Semester 1</h3>

                    <div className="detail-item">
                        <span>Oral Test 1</span>
                        <strong>{subject.hk1.oral1}</strong>
                    </div>
                    <div className="detail-item">
                        <span>Oral Test 2</span>
                        <strong>{subject.hk1.oral2}</strong>
                    </div>
                    <div className="detail-item">
                        <span>15-min Test 1</span>
                        <strong>{subject.hk1.test15_1}</strong>
                    </div>
                    <div className="detail-item">
                        <span>15-min Test 2</span>
                        <strong>{subject.hk1.test15_2}</strong>
                    </div>
                    <div className="detail-item">
                        <span>45-min Test</span>
                        <strong>{subject.hk1.test45 ?? subject.hk1.midterm}</strong>
                    </div>
                    <div className="detail-item">
                        <span>Midterm</span>
                        <strong>{subject.hk1.midterm}</strong>
                    </div>
                    <div className="detail-item">
                        <span>Final Exam</span>
                        <strong>{subject.hk1.final}</strong>
                    </div>
                    <div className="detail-divider" />
                    <div className="detail-item detail-average">
                        <span>Semester 1 Average</span>
                        <strong>{subject.hk1Avg.toFixed(2)}</strong>
                    </div>
                </div>

                <div className="detail-card">
                    <h3>Semester 2</h3>

                    <div className="detail-item">
                        <span>Oral Test 1</span>
                        <strong>{subject.hk2.oral1}</strong>
                    </div>
                    <div className="detail-item">
                        <span>Oral Test 2</span>
                        <strong>{subject.hk2.oral2}</strong>
                    </div>
                    <div className="detail-item">
                        <span>15-min Test 1</span>
                        <strong>{subject.hk2.test15_1}</strong>
                    </div>
                    <div className="detail-item">
                        <span>15-min Test 2</span>
                        <strong>{subject.hk2.test15_2}</strong>
                    </div>
                    <div className="detail-item">
                        <span>45-min Test</span>
                        <strong>{subject.hk2.test45 ?? subject.hk2.midterm}</strong>
                    </div>
                    <div className="detail-item">
                        <span>Midterm</span>
                        <strong>{subject.hk2.midterm}</strong>
                    </div>
                    <div className="detail-item">
                        <span>Final Exam</span>
                        <strong>{subject.hk2.final}</strong>
                    </div>
                    <div className="detail-divider" />
                    <div className="detail-item detail-average">
                        <span>Semester 2 Average</span>
                        <strong>{subject.hk2Avg.toFixed(2)}</strong>
                    </div>
                </div>
            </div>

            <div className="year-summary-card">
                <div className="year-summary-item">
                    <span>Full-Year Average</span>
                    <strong>{subject.yearAvg.toFixed(2)}</strong>
                </div>

                <div className="year-summary-item">
                    <span>Academic Rank</span>
                    <strong>{subject.rank}</strong>
                </div>
            </div>
        </div>
    );
}


