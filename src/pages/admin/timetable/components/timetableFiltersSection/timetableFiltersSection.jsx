import React from "react";
import { FiAlertTriangle, FiCalendar, FiClock, FiPlus, FiSearch } from "react-icons/fi";
import "./timetableFiltersSection.css";

export default function TimetableFiltersSection({
    totalSessions,
    conflictCount,
    weekValue,
    classOptions,
    teacherOptions,
    dayOptions,
    selectedClass,
    selectedTeacher,
    selectedDay,
    searchTerm,
    onWeekChange,
    onClassChange,
    onTeacherChange,
    onDayChange,
    onSearchChange,
    onCreateSession,
}) {
    return (
        <section className="tt-filters-section">
            <div className="tt-filters-header">
                <div>
                    <h1>Quản lý thời khóa biểu</h1>
                    <p>Thiết lập lịch dạy cho các lớp khối 10, 11 và 12 theo từng tuần.</p>
                </div>
                <button type="button" className="tt-create-btn" onClick={onCreateSession}>
                    <FiPlus />
                    Thêm tiết học
                </button>
            </div>

            <div className="tt-stats-grid">
                <article className="tt-stat-card">
                    <span className="icon"><FiClock /></span>
                    <div>
                        <strong>{totalSessions}</strong>
                        <p>Tiết học trong tuần</p>
                    </div>
                </article>

                <article className="tt-stat-card">
                    <span className="icon"><FiAlertTriangle /></span>
                    <div>
                        <strong>{conflictCount}</strong>
                        <p>Xung đột cần xử lý</p>
                    </div>
                </article>

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

                <label className="tt-input-wrap tt-search-wrap">
                    <span>Tìm kiếm</span>
                    <div className="tt-search-box">
                        <FiSearch />
                        <input
                            type="text"
                            placeholder="Môn học, giáo viên, phòng..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                </label>

                <label className="tt-input-wrap">
                    <span>Lớp</span>
                    <select value={selectedClass} onChange={(e) => onClassChange(e.target.value)}>
                        {classOptions.map((item) => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </select>
                </label>

                <label className="tt-input-wrap">
                    <span>Giáo viên</span>
                    <select value={selectedTeacher} onChange={(e) => onTeacherChange(e.target.value)}>
                        {teacherOptions.map((item) => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </select>
                </label>

                <label className="tt-input-wrap">
                    <span>Thứ</span>
                    <select value={selectedDay} onChange={(e) => onDayChange(e.target.value)}>
                        {dayOptions.map((item) => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </select>
                </label>
            </div>
        </section>
    );
}

