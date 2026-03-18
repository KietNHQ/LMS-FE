import React from "react";
import { BiSearch, BiFilterAlt, BiCategoryAlt } from "react-icons/bi";
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
            <div className="quiz-toolbar-search">
                <BiSearch />
                <input
                    type="text"
                    placeholder="Tìm theo tên bài, môn học hoặc giáo viên..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            <div className="quiz-toolbar-filters">
                <div className="quiz-select-box">
                    <BiFilterAlt />
                    <select
                        value={statusFilter}
                        onChange={(e) => onStatusChange(e.target.value)}
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="open">Đang mở</option>
                        <option value="done">Đã hoàn thành</option>
                        <option value="upcoming">Sắp mở</option>
                        <option value="closed">Đã đóng</option>
                    </select>
                </div>

                <div className="quiz-select-box">
                    <BiCategoryAlt />
                    <select
                        value={subjectFilter}
                        onChange={(e) => onSubjectChange(e.target.value)}
                    >
                        <option value="all">Tất cả môn học</option>
                        {subjects.map((subject) => (
                            <option key={subject} value={subject}>
                                {subject}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}