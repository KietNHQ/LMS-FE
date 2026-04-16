import React, { useMemo, useState } from "react";
import { FiEye, FiEdit2 } from "react-icons/fi";
import "./LessonListSection.css";

function statusClassName(status) {
    if (status === "Đã xuất bản") return "status-published";
    if (status === "Bản nháp") return "status-draft";
    return "status-pending";
}

export default function LessonListSection({ lessons, summary, onViewDetail, onEditLesson }) {
    const [sortBy, setSortBy] = useState("date-desc");

    const sortedLessons = useMemo(() => {
        const items = [...lessons];

        const periodNumber = (period = "") => Number(period.replace(/[^\d]/g, "")) || 0;

        if (sortBy === "date-asc") {
            return items.sort((a, b) => new Date(a.date) - new Date(b.date));
        }

        if (sortBy === "period-asc") {
            return items.sort((a, b) => periodNumber(a.period) - periodNumber(b.period));
        }

        if (sortBy === "period-desc") {
            return items.sort((a, b) => periodNumber(b.period) - periodNumber(a.period));
        }

        return items.sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [lessons, sortBy]);

    return (
        <div className="lesson-list-section">
            <div className="lesson-list-head">
                <div>
                    <h2>Danh sách bài học</h2>
                    <p>Theo dõi tiến độ soạn bài và trạng thái phát hành bài giảng.</p>
                </div>
                <label className="lesson-sort-control">
                    Sắp xếp
                    <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                        <option value="date-desc">Ngày dạy mới nhất</option>
                        <option value="date-asc">Ngày dạy sớm nhất</option>
                        <option value="period-asc">Tiết học tăng dần</option>
                        <option value="period-desc">Tiết học giảm dần</option>
                    </select>
                </label>
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
                            <th>Ngày dạy</th>
                            <th>Tiết</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedLessons.length > 0 ? (
                            sortedLessons.map((lesson) => (
                                <tr key={lesson.id}>
                                    <td>
                                        <strong>{lesson.title}</strong>
                                        <p>{lesson.objective}</p>
                                    </td>
                                    <td>{lesson.className}</td>
                                    <td>{lesson.date}</td>
                                    <td>{lesson.period}</td>
                                    <td>
                                        <span className={`lesson-status ${statusClassName(lesson.status)}`}>
                                            {lesson.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="lesson-row-actions">
                                            <button
                                                type="button"
                                                className="lesson-action-btn action-view"
                                                onClick={() => onViewDetail?.(lesson)}
                                                title="Xem chi tiết"
                                                aria-label="Xem chi tiết bài học"
                                            >
                                                <FiEye size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                className="lesson-action-btn action-edit"
                                                onClick={() => onEditLesson?.(lesson.id)}
                                                title="Chỉnh sửa"
                                                aria-label="Chỉnh sửa bài học"
                                            >
                                                <FiEdit2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="empty-row">
                                    Không có bài học nào phù hợp bộ lọc hiện tại.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="lesson-mobile-list">
                {sortedLessons.length > 0 ? (
                    sortedLessons.map((lesson) => (
                        <article key={`mobile-${lesson.id}`} className="lesson-mobile-card">
                            <div className="lesson-mobile-card-head">
                                <h3>{lesson.title}</h3>
                                <span className={`lesson-status ${statusClassName(lesson.status)}`}>
                                    {lesson.status}
                                </span>
                            </div>

                            <p className="lesson-mobile-objective">{lesson.objective}</p>

                            <div className="lesson-mobile-meta">
                                <span>Lớp: {lesson.className}</span>
                                <span>Ngày: {lesson.date}</span>
                                <span>{lesson.period}</span>
                            </div>

                            <div className="lesson-row-actions">
                                <button
                                    type="button"
                                    className="lesson-action-btn action-view"
                                    onClick={() => onViewDetail?.(lesson)}
                                    title="Xem chi tiết"
                                    aria-label="Xem chi tiết bài học"
                                >
                                    <FiEye size={16} />
                                </button>
                                <button
                                    type="button"
                                    className="lesson-action-btn action-edit"
                                    onClick={() => onEditLesson?.(lesson.id)}
                                    title="Chỉnh sửa"
                                    aria-label="Chỉnh sửa bài học"
                                >
                                    <FiEdit2 size={16} />
                                </button>
                            </div>
                        </article>
                    ))
                ) : (
                    <p className="empty-row">Không có bài học nào phù hợp bộ lọc hiện tại.</p>
                )}
            </div>
        </div>
    );
}

