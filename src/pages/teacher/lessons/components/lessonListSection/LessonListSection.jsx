import React from "react";
import "./LessonListSection.css";

function statusClassName(status) {
    if (status === "Đã xuất bản") return "status-published";
    if (status === "Bản nháp") return "status-draft";
    return "status-pending";
}

export default function LessonListSection({ lessons, summary }) {
    return (
        <div className="lesson-list-section">
            <div className="lesson-list-head">
                <h2>Danh sách bài học</h2>
                <p>Theo dõi tiến độ soạn bài và trạng thái phát hành bài giảng.</p>
            </div>

            <div className="lesson-summary-grid">
                <div className="summary-card">
                    <p>Tổng bài học</p>
                    <h3>{summary.total}</h3>
                </div>
                <div className="summary-card">
                    <p>Đã xuất bản</p>
                    <h3>{summary.published}</h3>
                </div>
                <div className="summary-card">
                    <p>Bản nháp</p>
                    <h3>{summary.draft}</h3>
                </div>
                <div className="summary-card">
                    <p>Chờ duyệt</p>
                    <h3>{summary.pending}</h3>
                </div>
            </div>

            <div className="lesson-table-wrap">
                <table className="lesson-table">
                    <thead>
                        <tr>
                            <th>Tên bài học</th>
                            <th>Lớp</th>
                            <th>Chương</th>
                            <th>Ngày dạy</th>
                            <th>Tiết</th>
                            <th>Phòng</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lessons.length > 0 ? (
                            lessons.map((lesson) => (
                                <tr key={lesson.id}>
                                    <td>
                                        <strong>{lesson.title}</strong>
                                        <p>{lesson.objective}</p>
                                    </td>
                                    <td>{lesson.className}</td>
                                    <td>{lesson.chapter}</td>
                                    <td>{lesson.date}</td>
                                    <td>{lesson.period}</td>
                                    <td>{lesson.room}</td>
                                    <td>
                                        <span className={`lesson-status ${statusClassName(lesson.status)}`}>
                                            {lesson.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="empty-row">
                                    Không có bài học nào phù hợp bộ lọc hiện tại.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

