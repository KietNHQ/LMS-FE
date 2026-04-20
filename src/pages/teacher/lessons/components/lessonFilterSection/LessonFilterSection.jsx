import React from "react";
import "./LessonFilterSection.css";
import { Select } from "../../../../../components/ui";

export default function LessonFilterSection({
    blockOptions,
    filters,
    statusOptions,
    onChangeFilter,
}) {
    return (
        <div className="lesson-filter-section">
            <div className="lesson-filter-grid">
                <label>
                    Khối
                    <Select
                        variant="custom"
                        value={filters.gradeBlock}
                        options={blockOptions.map((b) => ({ value: b, label: b }))}
                        onChange={(e) => onChangeFilter("gradeBlock", e.target.value)}
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

