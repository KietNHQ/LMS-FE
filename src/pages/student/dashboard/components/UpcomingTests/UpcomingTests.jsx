export default function UpcomingTests({ quizzes, onOpenQuiz }) {
    return (
        <div className="student-dashboard-card student-dashboard-card-quizzes student-dashboard-card-equal">
            <h3>Bài kiểm tra và bài tập sắp tới</h3>

            <div className="student-quiz-scroll-area">
                <div className="student-quiz-list">
                    {quizzes.map((quiz, index) => (
                        <button
                            key={quiz.id || `${quiz.title}-${index}`}
                            className="student-quiz-item"
                            type="button"
                            onClick={onOpenQuiz}
                        >
                            <div>
                                <div className="student-quiz-title">{quiz.title}</div>
                                <div className="student-quiz-meta">
                                    {quiz.subject} • {quiz.meta}
                                </div>
                                <div className="student-hover-hint">{quiz.description}</div>
                            </div>

                            <div className="student-quiz-right">
                                <div className="student-quiz-deadline">
                                    Hạn nộp: {quiz.deadline}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}


