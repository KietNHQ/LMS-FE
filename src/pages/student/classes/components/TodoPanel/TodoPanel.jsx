import "./TodoPanel.css";

export default function TodoPanel({ tasks }) {
    return (
        <aside className="student-classes-side-panel">
            <h2>Việc cần làm</h2>

            {tasks.map((task) => (
                <div key={task.id} className="student-task-item">
                    <div className="student-task-main">
                        <p className="student-task-title">{task.title}</p>
                        <p className="student-task-meta">{task.subject}</p>
                        <span className="student-task-due">Hạn nộp: {task.due}</span>
                    </div>

                    <div className="student-task-hover-detail">
                        <span>Bài sẽ kiểm tra:</span>{" "}
                        {task.title.includes("Kiểm tra")
                            ? task.title
                            : `${task.subject} - nội dung cần ôn tập`}
                    </div>
                </div>
            ))}
        </aside>
    );
}
