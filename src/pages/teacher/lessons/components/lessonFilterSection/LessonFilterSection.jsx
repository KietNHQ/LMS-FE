import React from "react";
import "./LessonFilterSection.css";

export default function LessonFilterSection({
    subject,
    filters,
    classes,
    statusOptions,
    onChangeFilter,
}) {
    return (
        <div className="lesson-filter-section">
            <div className="lesson-filter-head">
                <h2>Bộ lọc bài học</h2>
                <span className="lesson-filter-tag">1 giáo viên - 1 môn học</span>
            </div>

            <div className="lesson-subject-card" aria-label="Môn học được phân công">
                <div>
                    <p className="subject-label">Môn được phân công</p>
                    <h3>{subject.name}</h3>
                    <p className="subject-meta">
                        Mã môn: {subject.code} | Giáo viên: {subject.teacherName}
                    </p>
                </div>
                <span className="subject-lock">Đã khóa</span>
            </div>

            <div className="lesson-filter-grid">
                <label>
                    Lớp học
                    <select
                        value={filters.className}
                        onChange={(event) => onChangeFilter("className", event.target.value)}
                    >
                        {classes.map((classItem) => (
                            <option key={classItem} value={classItem}>
                                {classItem}
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
        </div>
    );
}

