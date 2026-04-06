import React, { useState, useRef, useEffect, useMemo } from "react";
import { FiSearch, FiCalendar, FiChevronDown } from "react-icons/fi";
import "./competitionFilterSection.css";

const CompetitionFilterSection = ({ 
    selectedGrade, 
    onGradeChange, 
    selectedTerm,
    selectedWeek, 
    onWeekChange, 
    searchQuery, 
    onSearchChange 
}) => {
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const pickerRef = useRef(null);
    const grades = ["Tất cả khối", "Khối 10", "Khối 11", "Khối 12"];

    // Close picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setIsPickerOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Helper to generate week labels grouped by month
    const groupedWeeks = useMemo(() => {
        const startDateS1 = new Date("2025-08-25"); // HK1
        const startDateS2 = new Date("2026-01-05"); // HK2
        
        const groups = {};
        const startIdx = selectedTerm === "hk1" ? 0 : 18;
        const endIdx = selectedTerm === "hk1" ? 18 : 35;
        const baseDate = selectedTerm === "hk1" ? startDateS1 : startDateS2;

        for (let i = startIdx; i < endIdx; i++) {
            const weekStart = new Date(baseDate);
            const weekOffset = selectedTerm === "hk1" ? i : (i - 18);
            weekStart.setDate(baseDate.getDate() + weekOffset * 7);
            
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);

            const monthName = `Tháng ${weekStart.getMonth() + 1}`;
            if (!groups[monthName]) groups[monthName] = [];

            const formatDate = (date) => {
                const d = date.getDate().toString().padStart(2, '0');
                const m = (date.getMonth() + 1).toString().padStart(2, '0');
                return `${d}/${m}`;
            };

            groups[monthName].push({
                value: i + 1,
                label: `Tuần ${i + 1}`,
                range: `${formatDate(weekStart)} - ${formatDate(weekEnd)}`
            });
        }
        return Object.entries(groups).map(([month, weeks]) => ({ month, weeks }));
    }, [selectedTerm]);

    const currentWeekData = useMemo(() => {
        for (const group of groupedWeeks) {
            const match = group.weeks.find(w => w.value === selectedWeek);
            if (match) return match;
        }
        return groupedWeeks[0]?.weeks[0];
    }, [groupedWeeks, selectedWeek]);

    return (
        <div className="competition-filter-container">
            <div className="filter-left">
                <div className="grade-filters">
                    {grades.map(grade => (
                        <button 
                            key={grade}
                            className={`filter-btn ${selectedGrade === grade ? "active" : ""}`}
                            onClick={() => onGradeChange(grade)}
                        >
                            {grade}
                        </button>
                    ))}
                </div>
            </div>

            <div className="filter-right">
                <div className="week-picker-custom" ref={pickerRef}>
                    <span className="filter-label">Học tuần:</span>
                    <button 
                        className={`week-picker-trigger ${isPickerOpen ? 'active' : ''}`}
                        onClick={() => setIsPickerOpen(!isPickerOpen)}
                    >
                        <FiCalendar className="filter-icon" />
                        <div className="trigger-text">
                            <span className="w-label">{currentWeekData?.label}</span>
                            <span className="w-range">{currentWeekData?.range}</span>
                        </div>
                        <FiChevronDown className={`chevron ${isPickerOpen ? 'open' : ''}`} />
                    </button>

                    {isPickerOpen && (
                        <div className="week-picker-popover-calendar">
                            <div className="popover-header">
                                <span>Lịch học tuần ({selectedTerm === "hk1" ? "Học kỳ 1" : "Học kỳ 2"})</span>
                            </div>
                            <div className="calendar-scroll-area custom-scroll">
                                {groupedWeeks.map((group, gIdx) => (
                                    <div key={gIdx} className="month-section">
                                        <div className="month-header">{group.month}</div>
                                        <div className="week-grid">
                                            {group.weeks.map(opt => (
                                                <div 
                                                    key={opt.value} 
                                                    className={`week-tile ${selectedWeek === opt.value ? 'selected' : ''}`}
                                                    onClick={() => {
                                                        onWeekChange(opt.value);
                                                        setIsPickerOpen(false);
                                                    }}
                                                >
                                                    <span className="tile-name">{opt.label}</span>
                                                    <span className="tile-range">{opt.range}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="search-input-wrapper">
                    <FiSearch className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Tìm lớp hoặc giáo viên..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};

export default CompetitionFilterSection;
