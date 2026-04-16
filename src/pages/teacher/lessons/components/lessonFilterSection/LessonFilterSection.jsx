import React from "react";
import "./LessonFilterSection.css";
import { Select } from "../../../../../components/ui";

export default function LessonFilterSection({
    subject,
    filters,
    classes,
    statusOptions,
    onChangeFilter,
    selectedSchoolYear,
    selectedTerm,
}) {
    const termLabel = selectedTerm === "hk2" ? "Học kỳ 2" : "Học kỳ 1";

    return (
        <div className="lesson-filter-section">
            <div className="lesson-subject-card" aria-label="Môn học được phân công">
                <div>
                    <p className="subject-label">Môn được phân công</p>
                    <h3>{subject.name}</h3>
                    <p className="subject-meta">
                        Mã môn: {subject.code} | Giáo viên: {subject.teacherName}
                    </p>
                </div>
                <div className="subject-tag-group">
                    <span className="lesson-filter-tag">Năm học {selectedSchoolYear}</span>
                    <span className="subject-lock">{termLabel}</span>
                </div>
            </div>

            <div className="lesson-filter-grid">
                <label>
                    Lớp học
                    <Select
                        variant="custom"
                        value={filters.className}
                        options={classes.map((c) => ({ value: c, label: c }))}
                        onChange={(e) => onChangeFilter("className", e.target.value)}
                    />
                </label>

                <label>
                    Trạng thái
                    <Select
                        variant="custom"
                        value={filters.status}
                        options={statusOptions.map((s) => ({ value: s, label: s }))}
                        onChange={(e) => onChangeFilter("status", e.target.value)}
                    />
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

