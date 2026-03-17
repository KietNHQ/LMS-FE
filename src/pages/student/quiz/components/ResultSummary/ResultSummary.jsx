import "./ResultSummary.css";

export default function ResultSummary({ submittedResult, onBackToList }) {
    return (
        <div className="quiz-result-summary">
            <div
                className={`result-percent-circle ${
                    submittedResult.percent >= 50 ? "pass" : "fail"
                }`}
            >
                {submittedResult.percent}%
            </div>

            <h2>{submittedResult.quiz.title}</h2>
            <p>Bạn đã hoàn thành bài kiểm tra!</p>

            <div className="result-stats">
                <div className="result-stat-box">
                    <h3>{submittedResult.achievedScore.toFixed(1)}</h3>
                    <span>Điểm đạt</span>
                </div>

                <div className="result-stat-box">
                    <h3>{submittedResult.totalScore.toFixed(1)}</h3>
                    <span>Tổng điểm</span>
                </div>

                <div className="result-stat-box">
                    <h3>
                        {submittedResult.correctCount}/{submittedResult.totalQuestions}
                    </h3>
                    <span>Câu đúng</span>
                </div>
            </div>

            <button className="back-list-btn" onClick={onBackToList} type="button">
                Quay lại danh sách
            </button>
        </div>
    );
}
