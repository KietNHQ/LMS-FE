import React, { useEffect, useMemo, useState } from "react";
import { FiEye, FiEdit2, FiCopy, FiBookmark, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "./LessonListSection.css";

function statusClassName(status) {
    if (status === "Đã xuất bản") return "status-published";
    if (status === "Bản nháp") return "status-draft";
    return "status-pending";
}

export default function LessonListSection({
    lessons,
    summary,
    filters,
    blockOptions,
    statusOptions,
    onChangeFilter,
    onViewDetail,
    onEditLesson,
    isLessonPinned,
    onDuplicateLesson,
    onTogglePin,
}) {
    const [sortBy, setSortBy] = useState("date-desc");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 8;

    const formatDate = (value) => {
        if (!value) return "-";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const sortedLessons = useMemo(() => {
        const items = [...lessons];

        const periodNumber = (period = "") => Number(period.replace(/[^\d]/g, "")) || 0;
        const pinRank = (lesson) => (isLessonPinned?.(lesson.id) ? 0 : 1);

        items.sort((a, b) => {
            const pinDiff = pinRank(a) - pinRank(b);
            if (pinDiff !== 0) return pinDiff;

            if (sortBy === "date-asc") {
                return new Date(a.date) - new Date(b.date);
            }

            if (sortBy === "period-asc") {
                return periodNumber(a.period) - periodNumber(b.period);
            }

            if (sortBy === "period-desc") {
                return periodNumber(b.period) - periodNumber(a.period);
            }

            return new Date(b.date) - new Date(a.date);
        });

        return items;
    }, [isLessonPinned, lessons, sortBy]);

    useEffect(() => {
        setCurrentPage(1);
    }, [sortBy, lessons.length]);

    const totalPages = Math.max(1, Math.ceil(sortedLessons.length / pageSize));
    const pagedLessons = sortedLessons.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const goToPage = (nextPage) => {
        setCurrentPage(Math.min(Math.max(nextPage, 1), totalPages));
    };

    return (
        <div className="lesson-list-section">
            <div className="lesson-list-head">
                <div>
                    <h2>Danh sách bài học</h2>
                    <p>Theo dõi tiến độ soạn bài, ghim bài quan trọng và mở nhanh bản sao khi cần.</p>
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

            <div className="lesson-filter-grid">
                <label>
                    Khối
                    <select
                        value={filters.gradeBlock}
                        onChange={(event) => onChangeFilter("gradeBlock", event.target.value)}
                    >
                        {blockOptions.map((block) => (
                            <option key={block} value={block}>
                                {block}
                            </option>
                        ))}
                    </select>
                </label>

                <label>
                    Trạng thái
                    <select
                        value={filters.status}
                        onChange={(event) => onChangeFilter("status", event.target.value)}
                    >
                        {statusOptions.map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="filter-keyword">
                    Tìm kiếm nhanh
                    <input
                        type="text"
                        placeholder="Nhập tên bài học hoặc chương"
                        value={filters.keyword}
                        onChange={(event) => onChangeFilter("keyword", event.target.value)}
                    />
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
                            <th>Lịch dạy</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pagedLessons.length > 0 ? (
                            pagedLessons.map((lesson) => (
                                <tr key={lesson.id}>
                                    <td>
                                        <div className="lesson-title-wrap">
                                            {isLessonPinned?.(lesson.id) ? (
                                                <span className="lesson-pin-badge">Đã ghim</span>
                                            ) : null}
                                            <strong>{lesson.title}</strong>
                                            <p>{lesson.objective}</p>
                                        </div>
                                        <div className="lesson-row-chips">
                                            <span>{lesson.chapter}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="lesson-schedule-cell">
                                            <button
                                                type="button"
                                                className="lesson-action-btn action-view lesson-schedule-view-btn"
                                                onClick={() => onViewDetail?.(lesson)}
                                                title="Xem chi tiết"
                                                aria-label="Xem chi tiết bài học"
                                            >
                                                <FiEye size={16} />
                                            </button>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`lesson-status ${statusClassName(lesson.status)}`}>
                                            {lesson.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="lesson-row-actions">
                                            <button
                                                type="button"
                                                className={`lesson-action-btn action-pin ${isLessonPinned?.(lesson.id) ? "is-active" : ""}`}
                                                onClick={() => onTogglePin?.(lesson.id)}
                                                title={isLessonPinned?.(lesson.id) ? "Bỏ ghim" : "Ghim bài học"}
                                                aria-label={isLessonPinned?.(lesson.id) ? "Bỏ ghim bài học" : "Ghim bài học"}
                                                aria-pressed={!!isLessonPinned?.(lesson.id)}
                                            >
                                                <FiBookmark size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                className="lesson-action-btn action-copy"
                                                onClick={() => onDuplicateLesson?.(lesson.id)}
                                                title="Sao chép bài học"
                                                aria-label="Sao chép bài học"
                                            >
                                                <FiCopy size={16} />
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
                                <td colSpan="4" className="empty-row">
                                    Không có bài học nào phù hợp bộ lọc hiện tại.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="lesson-mobile-list">
                {pagedLessons.length > 0 ? (
                    pagedLessons.map((lesson) => (
                        <article key={`mobile-${lesson.id}`} className="lesson-mobile-card">
                            <div className="lesson-mobile-card-head">
                                <div className="lesson-mobile-title-block">
                                    <h3>{lesson.title}</h3>
                                    <div className="lesson-mobile-badges">
                                        <span>{lesson.chapter}</span>
                                        {isLessonPinned?.(lesson.id) ? <span className="lesson-pin-badge">Đã ghim</span> : null}
                                    </div>
                                </div>
                                <span className={`lesson-status ${statusClassName(lesson.status)}`}>
                                    {lesson.status}
                                </span>
                            </div>

                            <p className="lesson-mobile-objective">{lesson.objective}</p>

                            <div className="lesson-mobile-meta">
                                <span>{lesson.gradeBlock}</span>
                                <span>{formatDate(lesson.date)}</span>
                                <span>{lesson.room}</span>
                                <span>{lesson.period}</span>
                            </div>
                            <div className="lesson-row-actions">
                                <button
                                    type="button"
                                    className={`lesson-action-btn action-pin ${isLessonPinned?.(lesson.id) ? "is-active" : ""}`}
                                    onClick={() => onTogglePin?.(lesson.id)}
                                    title={isLessonPinned?.(lesson.id) ? "Bỏ ghim" : "Ghim bài học"}
                                    aria-label={isLessonPinned?.(lesson.id) ? "Bỏ ghim bài học" : "Ghim bài học"}
                                    aria-pressed={!!isLessonPinned?.(lesson.id)}
                                >
                                    <FiBookmark size={16} />
                                </button>
                                <button
                                    type="button"
                                    className="lesson-action-btn action-copy"
                                    onClick={() => onDuplicateLesson?.(lesson.id)}
                                    title="Sao chép bài học"
                                    aria-label="Sao chép bài học"
                                >
                                    <FiCopy size={16} />
                                </button>
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

            {sortedLessons.length > 0 ? (
                <div className="lesson-pagination-row">
                    <div className="lesson-pagination" aria-label="Phân trang bài học">
                        <button
                            type="button"
                            className="lesson-page-btn"
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            aria-label="Trang trước"
                        >
                            <FiChevronLeft />
                        </button>

                        <p className="lesson-page-indicator" aria-live="polite">
                            <span>{currentPage}</span>
                            <small>/ {totalPages}</small>
                        </p>

                        <button
                            type="button"
                            className="lesson-page-btn"
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            aria-label="Trang sau"
                        >
                            <FiChevronRight />
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

