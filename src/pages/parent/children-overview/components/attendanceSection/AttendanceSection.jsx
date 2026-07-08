import React, { useMemo, useState } from "react";
import "./AttendanceSection.css";
import {
    FiAlertCircle,
    FiCalendar,
    FiCheckCircle,
    FiChevronDown,
    FiChevronLeft,
    FiChevronRight,
    FiXCircle,
} from "react-icons/fi";

const ChevronIcon = ({ open }) => (
    <FiChevronDown className={`chevron-icon ${open ? "open" : ""}`} size={18} />
);

const STATUS_META = {
    present: { key: "present", label: "Có mặt", color: "present", icon: <FiCheckCircle size={18} /> },
    absent: { key: "absent", label: "Vắng mặt", color: "absent", icon: <FiXCircle size={18} /> },
    late: { key: "late", label: "Đi muộn", color: "late", icon: <FiAlertCircle size={18} /> },
    excused: { key: "excused", label: "Có phép", color: "excused", icon: <FiAlertCircle size={18} /> },
};

const WEEKDAY_LABELS = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

const normalizeText = (value) =>
    String(value || "")
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .trim()
        .toLowerCase();

const normalizeStatusKey = (value) => {
    const normalized = normalizeText(value);
    if (["p", "present", "co mat", "có mặt"].includes(normalized)) return "present";
    if (["a", "absent", "vang mat", "vắng mặt"].includes(normalized)) return "absent";
    if (["l", "late", "di muon", "đi muộn"].includes(normalized)) return "late";
    if (["excused", "vang co phep", "vắng có phép", "co phep", "có phép"].includes(normalized)) return "excused";
    return normalized || "present";
};

const parseAttendanceDate = (value) => {
    if (!value) return null;
    if (value instanceof Date && !Number.isNaN(value.getTime())) return value;

    const text = String(value).trim();
    const viDateMatch = text.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?$/);
    if (viDateMatch) {
        const [, day, month, year] = viDateMatch;
        const parsed = new Date(Number(year || new Date().getFullYear()), Number(month) - 1, Number(day));
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    const parsed = new Date(text);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDateKey = (date, fallback) => {
    if (!date) return String(fallback || "unknown");
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const formatDateLabel = (date, fallback) => {
    if (!date) return fallback || "Chưa cập nhật ngày";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${WEEKDAY_LABELS[date.getDay()]}, ${day}/${month}/${year}`;
};

const formatShortDate = (date, fallback) => {
    if (!date) return fallback || "—";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}`;
};

const getAttendanceInstanceKey = (record, dayKey, statusKey) => {
    const sessionKey =
        record.periodNumber ??
        record.period_number ??
        record.period ??
        record.lessonPeriod ??
        record.lesson_period ??
        record.sessionId ??
        record.session_id ??
        record.timetableId ??
        record.timetable_id ??
        record.scheduleId ??
        record.schedule_id ??
        record.lessonId ??
        record.lesson_id ??
        record.classSessionId ??
        record.class_session_id;

    if (sessionKey !== undefined && sessionKey !== null && sessionKey !== "") {
        return `${dayKey}-${statusKey}-${sessionKey}`;
    }

    return `${dayKey}-${statusKey}`;
};

const normalizeAttendanceRecord = (record = {}, index = 0) => {
    const rawDay = record.day || record.date || record.attendance_date || record.attendanceDate;
    const parsedDate = parseAttendanceDate(rawDay);
    const statusKey = normalizeStatusKey(record.status || record.attendance_status || record.attendanceStatus);
    const meta = STATUS_META[statusKey] || {
        key: statusKey,
        label: String(record.status || "Không xác định"),
        color: "unknown",
        icon: <FiAlertCircle size={18} />,
    };
    const dayKey = formatDateKey(parsedDate, rawDay);

    return {
        id: record.id || `${dayKey}-${statusKey}-${index}`,
        dayKey,
        instanceKey: getAttendanceInstanceKey(record, dayKey, meta.key),
        date: parsedDate,
        dateLabel: formatDateLabel(parsedDate, rawDay),
        shortDate: formatShortDate(parsedDate, rawDay),
        statusKey: meta.key,
        statusLabel: meta.label,
        color: meta.color,
        icon: meta.icon,
        note: record.note || record.reason || "",
        count: 1,
    };
};

const groupAttendanceRecords = (records = []) => {
    const grouped = new Map();
    const seenInstances = new Set();

    records.forEach((record, index) => {
        const normalized = normalizeAttendanceRecord(record, index);

        if (seenInstances.has(normalized.instanceKey)) return;
        seenInstances.add(normalized.instanceKey);

        const key = `${normalized.dayKey}-${normalized.statusKey}`;
        const current = grouped.get(key);
        if (current) {
            current.count += 1;
            return;
        }
        grouped.set(key, normalized);
    });

    return Array.from(grouped.values()).sort((a, b) => {
        if (!a.date || !b.date) return 0;
        return b.date - a.date;
    });
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
                                <span key={`${r.dayKey}-${i}`} className={`monthly-date-chip ${color}`}>
                                    {r.shortDate}{r.count > 1 ? ` · ${r.count} buổi` : ""}
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

    const weeklySummary = useMemo(
        () => data.weeklySummary || {},
        [data.weeklySummary]
    );
    const weeklyRecords = useMemo(
        () => data.weeklyRecords || data.records || [],
        [data.weeklyRecords, data.records]
    );
    const allMonthlyRecords = useMemo(
        () => data.allMonthlyRecords || data.records || data.weeklyRecords || [],
        [data.allMonthlyRecords, data.records, data.weeklyRecords]
    );
    const weeklyDisplayRecords = useMemo(
        () => groupAttendanceRecords(weeklyRecords),
        [weeklyRecords]
    );
    const monthlyDisplayRecords = useMemo(
        () => groupAttendanceRecords(allMonthlyRecords),
        [allMonthlyRecords]
    );
    const weeklyDisplaySummary = useMemo(() => {
        const summary = weeklyDisplayRecords.reduce((acc, item) => {
            acc[item.statusKey] = (acc[item.statusKey] || 0) + item.count;
            return acc;
        }, { present: 0, absent: 0, late: 0, excused: 0 });

        if (weeklyDisplayRecords.length > 0) return summary;
        return {
            present: weeklySummary.present ?? 0,
            absent: weeklySummary.absent ?? 0,
            late: weeklySummary.late ?? 0,
            excused: weeklySummary.excused ?? 0,
        };
    }, [weeklyDisplayRecords, weeklySummary]);
    const attendanceTotal = weeklyDisplayRecords.reduce((sum, item) => sum + item.count, 0)
        || monthlyDisplayRecords.reduce((sum, item) => sum + item.count, 0);

    /* Lọc bản ghi theo tháng / năm đang chọn */
    const filteredMonthlyRecords = useMemo(() => {
        return monthlyDisplayRecords.filter(r => {
            if (!r.date) return false;
            return r.date.getMonth() + 1 === selectedMonth && r.date.getFullYear() === selectedYear;
        });
    }, [monthlyDisplayRecords, selectedMonth, selectedYear]);

    /* Nhóm theo trạng thái */
    const monthlyGroups = useMemo(() => {
        const groups = Object.fromEntries(
            Object.values(STATUS_META).map((meta) => [meta.key, { ...meta, records: [], count: 0 }])
        );
        filteredMonthlyRecords.forEach(r => {
            if (!groups[r.statusKey]) return;
            groups[r.statusKey].records.push(r);
            groups[r.statusKey].count += r.count;
        });
        return groups;
    }, [filteredMonthlyRecords]);
    const filteredMonthlyTotal = useMemo(
        () => filteredMonthlyRecords.reduce((sum, item) => sum + item.count, 0),
        [filteredMonthlyRecords]
    );

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
                    <p>{attendanceTotal > 0 ? `${attendanceTotal} lượt điểm danh` : "Chưa có dữ liệu"}</p>
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
                            <strong>{weeklyDisplaySummary.present ?? 0}</strong>
                        </div>
                        <div className="attendance-stat absent">
                            <span>Vắng mặt</span>
                            <strong>{weeklyDisplaySummary.absent ?? 0}</strong>
                        </div>
                        <div className="attendance-stat late">
                            <span>Đi muộn</span>
                            <strong>{weeklyDisplaySummary.late ?? 0}</strong>
                        </div>
                    </div>

                    <div className="attendance-record-list">
                        {weeklyDisplayRecords.length === 0 ? (
                            <p className="attendance-empty">Không có dữ liệu điểm danh.</p>
                        ) : weeklyDisplayRecords.map((item) => (
                            <div key={item.id} className={`attendance-record-item ${item.color}`}>
                                <div className="attendance-record-main">
                                    <span className="attendance-record-date">
                                        <FiCalendar size={15} /> {item.dateLabel}
                                    </span>
                                    {item.count > 1 && <small>{item.count} buổi</small>}
                                    {item.note && <small>{item.note}</small>}
                                </div>
                                <strong className={`attendance-status-pill ${item.color}`}>
                                    {item.icon}
                                    {item.statusLabel}
                                </strong>
                            </div>
                        ))}
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
                            <FiChevronLeft />
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
                            <FiChevronRight />
                        </button>
                    </div>

                    {/* Tổng buổi */}
                    <div className="monthly-summary-bar">
                        <span className="monthly-summary-label">Tổng số buổi học:</span>
                        <strong className="monthly-summary-total">{filteredMonthlyTotal}</strong>
                    </div>

                    {filteredMonthlyTotal === 0 ? (
                        <p className="monthly-no-data">Không có dữ liệu điểm danh cho tháng này.</p>
                    ) : (
                        <div className="monthly-groups">
                            {Object.values(monthlyGroups).map((meta) => (
                                <MonthlyGroupCard
                                    key={meta.key}
                                    label={meta.label}
                                    count={meta.count}
                                    records={meta.records}
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
