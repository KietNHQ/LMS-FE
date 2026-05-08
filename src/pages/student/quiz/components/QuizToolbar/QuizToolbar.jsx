import React from "react";
import { SearchBar } from "../../../../../components/common";
import { Select } from "../../../../../components/ui";
import "./QuizToolbar.css";

export default function QuizToolbar({
                                        search,
                                        onSearchChange,
                                        statusFilter,
                                        onStatusChange,
                                        subjectFilter,
                                        onSubjectChange,
                                        subjects,
                                    }) {
    return (
        <div className="quiz-toolbar">
            <div className="quiz-toolbar-search-wrap">
                <SearchBar
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Tìm theo tên bài, môn học hoặc giáo viên..."
                />
            </div>

            <div className="quiz-toolbar-filters">
                <Select
                    variant="custom"
                    className="quiz-filter-select"
                    value={statusFilter}
                    onChange={(e) => onStatusChange(e.target.value)}
                    options={[
                        { value: "all", label: "Tất cả trạng thái" },
                        { value: "open", label: "Đang mở" },
                        { value: "done", label: "Đã hoàn thành" },
                        { value: "upcoming", label: "Sắp mở" },
                        { value: "closed", label: "Đã đóng" },
                    ]}
                />
                <Select
                    variant="custom"
                    className="quiz-filter-select"
                    value={subjectFilter}
                    onChange={(e) => onSubjectChange(e.target.value)}
                    options={[
                        { value: "all", label: "Tất cả môn học" },
                        ...subjects.map((subject) => ({
                            value: subject,
                            label: subject,
                        })),
                    ]}
                />
            </div>
        </div>
    );
}



