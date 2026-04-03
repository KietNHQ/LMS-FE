import React from "react";
import { FiAlertTriangle, FiClock, FiLayers } from "react-icons/fi";
import Select from "../../../../../components/ui/Select/Select";
import "./timetableFiltersSection.css";

export default function TimetableFiltersSection({
    totalSessions,
    conflictCount,
    classOptions,
    teacherOptions,
    dayOptions,
    blockOptions,
    selectedClass,
    selectedTeacher,
    selectedDay,
    selectedBlock,
    searchTerm,
    onClassChange,
    onTeacherChange,
    onDayChange,
    onBlockChange,
    onSearchChange,
    onCreateSession,
    onOpenConflicts,
    children,
}) {
    return (
        <section className="tt-filters-section">
            <div className="tt-filters-header">
                <div className="tt-title-area">
                    <h1 className="tt-main-title">Quản lý thời khóa biểu</h1>
                </div>
                <div className="tt-header-actions">
                    <div className="tt-year-selector-wrap">
                        {children}
                    </div>
                </div>
            </div>

            <div className="tt-stats-grid">
                <div className="tt-stat-mini-card">
                    <div className="stat-icon-box navy"><FiClock /></div>
                    <div className="stat-content">
                        <span className="stat-value">{totalSessions}</span>
                        <span className="stat-label">Tiết học / kỳ</span>
                    </div>
                </div>

                <div className="tt-stat-mini-card clickable" onClick={onOpenConflicts}>
                    <div className="stat-icon-box warning"><FiAlertTriangle /></div>
                    <div className="stat-content">
                        <span className="stat-value">{conflictCount}</span>
                        <span className="stat-label">Tiết bị trùng</span>
                    </div>
                </div>

                <div className="tt-stat-mini-card">
                    <div className="stat-icon-box info"><FiLayers /></div>
                    <div className="stat-content">
                        <span className="stat-value">{selectedClass}</span>
                        <span className="stat-label">Lớp đang xem</span>
                    </div>
                </div>
            </div>

            <div className="tt-filter-panel">
                <div className="tt-filter-group">
                    <div className="tt-input-field">
                        <label>Khối</label>
                        <Select
                            variant="custom"
                            className="tt-custom-select"
                            options={blockOptions}
                            value={selectedBlock}
                            onChange={(e) => onBlockChange(e.target.value)}
                        />
                    </div>

                    <div className="tt-input-field">
                        <label>Lớp</label>
                        <Select
                            variant="custom"
                            className="tt-custom-select"
                            options={classOptions}
                            value={selectedClass}
                            onChange={(e) => onClassChange(e.target.value)}
                        />
                    </div>

                    <div className="tt-input-field">
                        <label>Giáo viên</label>
                        <Select
                            variant="custom"
                            className="tt-custom-select"
                            options={teacherOptions}
                            value={selectedTeacher}
                            onChange={(e) => onTeacherChange(e.target.value)}
                        />
                    </div>

                    <div className="tt-input-field">
                        <label>Thứ</label>
                        <Select
                            variant="custom"
                            className="tt-custom-select"
                            options={dayOptions}
                            value={selectedDay}
                            onChange={(e) => onDayChange(e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
