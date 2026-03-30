import React from "react";
import { FiAlertTriangle, FiCalendar, FiClock, FiPlus } from "react-icons/fi";
import Select from "../../../../../components/ui/Select/Select";
import "./timetableFiltersSection.css";

export default function TimetableFiltersSection({
    totalSessions,
    conflictCount,
    weekValue,
    classOptions,
    teacherOptions,
    dayOptions,
    blockOptions,
    selectedClass,
    selectedTeacher,
    selectedDay,
    selectedBlock,
    searchTerm,
    onWeekChange,
    onClassChange,
    onTeacherChange,
    onDayChange,
    onBlockChange,
    onSearchChange,
    onCreateSession,
    onOpenConflicts,
}) {
    return (
        <section className="tt-filters-section">
            <div className="tt-filters-header">
                <div>
                    <h1>Quản lý thời khóa biểu</h1>
                </div>
                <div className="tt-header-actions">
                    <button type="button" className="tt-conflict-btn" onClick={onOpenConflicts}>
                        <FiAlertTriangle />
                        Kiểm tra xung đột
                        <span>{conflictCount}</span>
                    </button>
                    <button type="button" className="tt-create-btn" onClick={onCreateSession}>
                        <FiPlus />
                        Thêm tiết học
                    </button>
                </div>
            </div>

            <div className="tt-stats-grid">
                <article className="tt-stat-card">
                    <span className="icon"><FiClock /></span>
                    <div>
                        <strong>{totalSessions}</strong>
                        <p>Tiết học trong tuần</p>
                    </div>
                </article>

                <button
                    type="button"
                    className="tt-stat-card tt-stat-card--clickable"
                    onClick={onOpenConflicts}
                    aria-label="Mo hop thoai kiem tra xung dot"
                >
                    <span className="icon"><FiAlertTriangle /></span>
                    <div>
                        <strong>{conflictCount}</strong>
                        <p>Xung đột cần xử lý</p>
                    </div>
                </button>

                <article className="tt-stat-card">
                    <span className="icon"><FiCalendar /></span>
                    <div>
                        <strong>{selectedClass}</strong>
                        <p>Lớp đang xem</p>
                    </div>
                </article>
            </div>

            <div className="tt-filter-panel">
                <label className="tt-input-wrap tt-week-wrap">
                    <span>Tuần học</span>
                    <input type="week" value={weekValue} onChange={(e) => onWeekChange(e.target.value)} />
                </label>

                {/* Thay thế tìm kiếm bằng filter khối */}
                <label className="tt-input-wrap">
                    <span>Khối</span>
                    <Select
                        variant="custom"
                        className="tt-custom-select"
                        options={blockOptions}
                        value={selectedBlock}
                        onChange={(e) => onBlockChange(e.target.value)}
                    />
                </label>

                <label className="tt-input-wrap">
                    <span>Lớp</span>
                    <Select
                        variant="custom"
                        className="tt-custom-select"
                        options={classOptions}
                        value={selectedClass}
                        onChange={(e) => onClassChange(e.target.value)}
                    />
                </label>

                <label className="tt-input-wrap">
                    <span>Giáo viên</span>
                    <Select
                        variant="custom"
                        className="tt-custom-select"
                        options={teacherOptions}
                        value={selectedTeacher}
                        onChange={(e) => onTeacherChange(e.target.value)}
                    />
                </label>

                <label className="tt-input-wrap">
                    <span>Thứ</span>
                    <Select
                        variant="custom"
                        className="tt-custom-select"
                        options={dayOptions}
                        value={selectedDay}
                        onChange={(e) => onDayChange(e.target.value)}
                    />
                </label>
            </div>
        </section>
    );
}
