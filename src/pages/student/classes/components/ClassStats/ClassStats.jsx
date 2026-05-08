import "./ClassStats.css";

export default function ClassStats({ totalAssignmentsPending, totalCompletedLessons, totalLessons, currentWeek, totalWeeks }) {
    return (
        <div className="student-classes-stats">
            <article className="student-classes-stat-card">
                <p>Bài tập chưa hoàn thành</p>
                <strong>{totalAssignmentsPending}</strong>
            </article>

            <article className="student-classes-stat-card">
                <p>Tiến độ buổi học</p>
                <strong>
                    {totalCompletedLessons}/{totalLessons}
                </strong>
            </article>

            <article className="student-classes-stat-card">
                <p>Tuần hiện tại</p>
                <strong>
                    {currentWeek}/{totalWeeks}
                </strong>
            </article>
        </div>
    );
}

