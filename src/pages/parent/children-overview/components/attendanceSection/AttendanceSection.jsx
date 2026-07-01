import React, { useMemo, useState } from "react";
import "./AttendanceSection.css";
import { FiCheckCircle, FiAlertCircle, FiXCircle } from "react-icons/fi";

const ChevronIcon = ({ open }) => (
    <svg
        className={`chevron-icon ${open ? "open" : ""}`}
        width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"
    >
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

const STATUS_META = {
    "Có mặt":   { key: "present", color: "present", icon: <FiCheckCircle size={18} style={{ color: "#16a34a" }} /> },
    "Vắng mặt": { key: "absent",  color: "absent",  icon: <FiXCircle size={18} style={{ color: "#ef4444" }} /> },
    "Đi muộn":  { key: "late",    color: "late",    icon: <FiAlertCircle size={18} style={{ color: "#d97706" }} /> },
};

function MonthlyGroupCard({ label, count, records, color, icon }) {
    const [open, setOpen] = useState(false);

    return (
        <div className={`monthly-group-card ${color} ${open ? "expanded" : ""}`}>
            <button
                type="button"
                className="monthly-group-header"
                onClick={() => setOpen(v => !v)}
                aria-expanded={open}
            >
                <div className="monthly-group-left">
                    <span className={`monthly-group-icon ${color}`} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{icon}</span>
                    <span className="monthly-group-label">{label}</span>
                </div>
                <div className="monthly-group-right">
                    <span className={`monthly-group-count ${color}`}>{count} buổi</span>
                    <ChevronIcon open={open} />
                </div>
            </button>

            {open && (
                <div className="monthly-group-body">
                    {records.length === 0 ? (
                        <p className="monthly-group-empty">Không có buổi nào.</p>
                    ) : (
                        <div className="monthly-group-dates">
                            {records.map((r, i) => (
                                <span key={i} className={`monthly-date-chip ${color}`}>
                                    {/* Hiện DD/MM từ DD/MM/YYYY */}
                                    {r.day.substring(0, 5)}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Sinh danh sách năm: 2 năm trước đến năm hiện tại + 1
function buildYearList() {
    const now = new Date();
    const cur = now.getFullYear();
    const years = [];
    for (let y = cur - 2; y <= cur + 1; y++) years.push(y);
    return years;
}

export default function AttendanceSection({ data, compact = false }) {
    const [activePeriod, setActivePeriod] = useState("week");

    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1); // 1‑12
    const [selectedYear,  setSelectedYear]  = useState(now.getFullYear());

    const yearList = useMemo(() => buildYearList(), []);

    const weeklySummary = data.weeklySummary || {};
    const weeklyRecords = useMemo(
        () => data.weeklyRecords || data.records || [],
        [data.weeklyRecords, data.records]
    );
    const allMonthlyRecords = useMemo(
        () => data.allMonthlyRecords || [],
        [data.allMonthlyRecords]
    );

    /* Lọc bản ghi theo tháng / năm đang chọn */
    const filteredMonthlyRecords = useMemo(() => {
        return allMonthlyRecords.filter(r => {
            const parts = r.day.split("/");
            if (parts.length >= 3) {
                return parseInt(parts[1], 10) === selectedMonth
                    && parseInt(parts[2], 10) === selectedYear;
            }
            // fallback DD/MM (không có năm) — so theo tháng
            if (parts.length === 2) return parseInt(parts[1], 10) === selectedMonth;
            return false;
        });
    }, [allMonthlyRecords, selectedMonth, selectedYear]);

    /* Nhóm theo trạng thái */
    const monthlyGroups = useMemo(() => {
        const groups = { "Có mặt": [], "Vắng mặt": [], "Đi muộn": [] };
        filteredMonthlyRecords.forEach(r => {
            if (groups[r.status] !== undefined) groups[r.status].push(r);
        });
        return groups;
    }, [filteredMonthlyRecords]);

    /* Điều hướng tháng trước / sau */
    const goPrev = () => {
        if (selectedMonth === 1) { setSelectedMonth(12); setSelectedYear(y => y - 1); }
        else setSelectedMonth(m => m - 1);
    };
    const goNext = () => {
        if (selectedMonth === 12) { setSelectedMonth(1); setSelectedYear(y => y + 1); }
        else setSelectedMonth(m => m + 1);
    };

    return (
        <div className={`attendance-card ${compact ? "compact" : ""}`}>
            {/* Header */}
            <div className="attendance-heading">
                <div className="attendance-heading-text">
                    <h3>Điểm danh</h3>
                </div>
            </div>

            {/* Tab switch */}
            <div className="attendance-period-switch" role="tablist">
                <button
                    type="button"
                    className={`attendance-switch-btn ${activePeriod === "week" ? "active" : ""}`}
                    onClick={() => setActivePeriod("week")}
                >
                    Tuần này
                </button>
                <button
                    type="button"
                    className={`attendance-switch-btn ${activePeriod === "month" ? "active" : ""}`}
                    onClick={() => setActivePeriod("month")}
                >
                    Theo tháng
                </button>
            </div>

            {/* ── WEEKLY VIEW ── */}
            {activePeriod === "week" && (
                <>
                    <div className="attendance-stats">
                        <div className="attendance-stat present">
                            <span>Có mặt</span>
                            <strong>{weeklySummary.present ?? 0}</strong>
                        </div>
                        <div className="attendance-stat absent">
                            <span>Vắng mặt</span>
                            <strong>{weeklySummary.absent ?? 0}</strong>
                        </div>
                        <div className="attendance-stat late">
                            <span>Đi muộn</span>
                            <strong>{weeklySummary.late ?? 0}</strong>
                        </div>
                    </div>

                    <div className="attendance-record-list">
                        {weeklyRecords.map((item, index) => {
                            const meta = STATUS_META[item.status] || {};
                            return (
                                <div key={index} className="attendance-record-item">
                                    <span>{item.day}</span>
                                    <strong className={meta.color || ""} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                                        {meta.icon}
                                        {item.status}
                                    </strong>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* ── MONTHLY VIEW ── */}
            {activePeriod === "month" && (
                <>
                    {/* Month / Year picker */}
                    <div className="month-year-picker">
                        <button
                            type="button"
                            className="month-nav-btn"
                            onClick={goPrev}
                            title="Tháng trước"
                        >
                            ‹
                        </button>

                        <div className="month-year-selects">
                            <select
                                className="month-select"
                                value={selectedMonth}
                                onChange={e => setSelectedMonth(Number(e.target.value))}
                            >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                    <option key={m} value={m}>Tháng {m}</option>
                                ))}
                            </select>

                            <span className="month-year-sep">/</span>

                            <select
                                className="year-select"
                                value={selectedYear}
                                onChange={e => setSelectedYear(Number(e.target.value))}
                            >
                                {yearList.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="button"
                            className="month-nav-btn"
                            onClick={goNext}
                            title="Tháng sau"
                        >
                            ›
                        </button>
                    </div>

                    {/* Tổng buổi */}
                    <div className="monthly-summary-bar">
                        <span className="monthly-summary-label">Tổng số buổi học:</span>
                        <strong className="monthly-summary-total">{filteredMonthlyRecords.length}</strong>
                    </div>

                    {filteredMonthlyRecords.length === 0 ? (
                        <p className="monthly-no-data">Không có dữ liệu điểm danh cho tháng này.</p>
                    ) : (
                        <div className="monthly-groups">
                            {Object.entries(STATUS_META).map(([label, meta]) => (
                                <MonthlyGroupCard
                                    key={label}
                                    label={label}
                                    count={monthlyGroups[label].length}
                                    records={monthlyGroups[label]}
                                    color={meta.color}
                                    icon={meta.icon}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
