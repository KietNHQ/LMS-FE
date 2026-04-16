import React from "react";
import "./LessonFilterSection.css";

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
        </div>
    );
}

