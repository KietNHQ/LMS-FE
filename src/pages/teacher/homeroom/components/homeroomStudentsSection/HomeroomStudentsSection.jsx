import { useMemo, useState, useEffect } from "react";
import HomeroomStudentDetailDialog from "./HomeroomStudentDetailDialog";
import Select from "../../../../../components/ui/Select/Select";
import {
    FiArrowDown, FiArrowUp, FiSearch, FiUserPlus,
    FiCheckCircle, FiXCircle, FiClock, FiCalendar,
    FiInfo, FiActivity, FiAlertCircle, FiAward,
    FiChevronLeft, FiChevronRight
} from "react-icons/fi";
import "./HomeroomStudentsSection.css";

const STATUS_LABELS = {
    present: "Có mặt",
    absent: "Vắng mặt",
    late: "Đi trễ",
};

const DEFAULT_NOTES = {
    present: "",
    absent: "Ốm",
    late: "Kẹt xe",
};

function formatDate(dateString) {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function getAvatarLetter(name) {
    if (!name) return "A";
    return name.trim().charAt(0).toUpperCase();
}

function getRoleClass(roleKey) {
    switch (roleKey) {
        case "monitor": return "role-monitor";
        case "viceMonitor": return "role-vice";
        case "secretary": return "role-secretary";
        default: return "role-empty";
    }
}

export default function HomeroomStudentsSection({
    students = [],
    officers = [],
    onBanCanSuLopClick,
    initialViewMode = "info"
}) {
    const [viewMode, setViewMode] = useState(initialViewMode === "attendance" ? "activity" : initialViewMode);
    const [activeStudentId, setActiveStudentId] = useState(null);

    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [genderFilter, setGenderFilter] = useState("all");
    const [sortOrder, setSortOrder] = useState("asc");

    // Activity Tracking States
    const [periodType, setPeriodType] = useState("weekly"); // daily, weekly, semester
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [selectedWeek, setSelectedWeek] = useState(1);
    const [selectedSemester, setSelectedSemester] = useState(1);

    const [attendanceOverrides, setAttendanceOverrides] = useState({});
    const [editingStudentId, setEditingStudentId] = useState(null);
    const [editDraft, setEditDraft] = useState({ status: "present", note: "" });

    // Sync initialViewMode when it changes from parent
    useEffect(() => {
        if (initialViewMode) {
            setViewMode(initialViewMode === "attendance" ? "activity" : initialViewMode);
        }
    }, [initialViewMode]);

    const activeStudent = useMemo(
        () => students.find((student) => student.id === activeStudentId) || null,
        [students, activeStudentId]
    );

    const officerLabelByStudentId = useMemo(() => {
        return officers.reduce((acc, officer) => {
            if (officer.studentId) acc[officer.studentId] = officer.label;
            return acc;
        }, {});
    }, [officers]);

    // Activity Logic (Mocking violations and points)
    const getMergedActivityData = (baseStudents) => {
        return baseStudents.map((student) => {
            const seed = student.id + (periodType === "weekly" ? selectedWeek : selectedSemester);
            const violations = (seed % 4);
            const meritPoints = (seed % 6);
            const attendanceRate = 90 + (seed % 11);

            let conduct = "Tốt";
            if (attendanceRate < 95 || violations > 2) conduct = "Khá";
            if (attendanceRate < 90 || violations > 4) conduct = "Trung bình";

            return {
                ...student,
                violations,
                meritPoints,
                attendanceRate,
                conduct,
                attendanceStatus: "present",
            };
        });
    };

    const filteredStudents = useMemo(() => {
        let result = [...students];

        if (searchTerm) {
            const lowSearch = searchTerm.toLowerCase();
            result = result.filter(s =>
                s.name.toLowerCase().includes(lowSearch) ||
                s.email?.toLowerCase().includes(lowSearch)
            );
        }

        if (genderFilter !== "all") {
            result = result.filter(s => s.gender === genderFilter);
        }

        result.sort((a, b) => {
            const nameA = a.name.split(" ").pop().toLowerCase();
            const nameB = b.name.split(" ").pop().toLowerCase();
            if (sortOrder === "asc") return nameA.localeCompare(nameB);
            return nameB.localeCompare(nameA);
        });

        if (viewMode === "activity") {
            return getMergedActivityData(result);
        }

        return result;
    }, [students, searchTerm, genderFilter, sortOrder, viewMode, periodType, selectedWeek, selectedSemester]);

    const activityStats = useMemo(() => {
        if (viewMode !== "activity") return null;
        return {
            totalViolations: filteredStudents.reduce((acc, s) => acc + (s.violations || 0), 0),
            totalMerit: filteredStudents.reduce((acc, s) => acc + (s.meritPoints || 0), 0),
            avgAttendance: (filteredStudents.reduce((acc, s) => acc + (s.attendanceRate || 0), 0) / (filteredStudents.length || 1)).toFixed(1),
        };
    }, [filteredStudents, viewMode]);

    const openStudentDialog = (student) => {
        if (editingStudentId) return;
        setActiveStudentId(student.id);
    };

    const closeStudentDialog = () => {
        setActiveStudentId(null);
    };

    return (
        <div className="homeroom-students-section homeroom-students-list-card">
            <div className="homeroom-students-section-header">
                <div className="homeroom-view-tabs">
                    <button
                        className={`view-tab-btn ${viewMode === "info" ? "active" : ""}`}
                        onClick={() => setViewMode("info")}
                    >
                        <FiInfo />
                        <span>Thông tin học sinh</span>
                    </button>
                    <button
                        className={`view-tab-btn ${viewMode === "activity" ? "active" : ""}`}
                        onClick={() => setViewMode("activity")}
                    >
                        <FiActivity />
                        <span>Theo dõi hoạt động</span>
                    </button>
                </div>

                <button
                    type="button"
                    className="homeroom-students-list-badge"
                    onClick={() => onBanCanSuLopClick?.()}
                >
                    <FiUserPlus />
                    <span>Ban cán sự lớp</span>
                </button>
            </div>

            <div className="homeroom-students-list-header">
                <div className="homeroom-students-filters">
                    <div className="homeroom-students-search-box">
                        <FiSearch />
                        <input
                            type="text"
                            placeholder="Tìm kiếm học sinh..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="homeroom-students-filter-group">
                        <Select
                            variant="custom"
                            className="homeroom-students-gender-select"
                            value={genderFilter}
                            onChange={(e) => setGenderFilter(e.target.value)}
                            options={[
                                { value: "all", label: "Tất cả giới tính" },
                                { value: "Nam", label: "Nam" },
                                { value: "Nữ", label: "Nữ" },
                            ]}
                        />

                        <button
                            type="button"
                            className="homeroom-students-sort-toggle"
                            onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                            title={sortOrder === "asc" ? "Sắp xếp: A - Z" : "Sắp xếp: Z - A"}
                        >
                            {sortOrder === "asc" ? <FiArrowUp /> : <FiArrowDown />}
                            <span>{sortOrder === "asc" ? "A - Z" : "Z - A"}</span>
                        </button>
                    </div>
                </div>

                {viewMode === "activity" && (
                    <div className="homeroom-period-switcher">
                        <div className="period-selector-main">
                            <div className="period-nav">
                                <button
                                    type="button"
                                    onClick={() => setSelectedWeek(w => Math.max(1, w - 1))}
                                    title="Tuần trước"
                                >
                                    <FiChevronLeft />
                                </button>
                                <div className="period-week-display">
                                    <span className="week-label">Tuần {selectedWeek}</span>
                                    <span className="week-dates">
                                        {(() => {
                                            const startOfYear = new Date(2025, 8, 1); // Sept 1st, 2025
                                            const startDate = new Date(startOfYear);
                                            startDate.setDate(startOfYear.getDate() + (selectedWeek - 1) * 7);
                                            const endDate = new Date(startDate);
                                            endDate.setDate(startDate.getDate() + 6);

                                            const f = (d) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
                                            return `${f(startDate)} - ${f(endDate)}`;
                                        })()}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedWeek(w => w + 1)}
                                    title="Tuần kế tiếp"
                                >
                                    <FiChevronRight />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {viewMode === "activity" && activityStats && (
                <div className="attendance-quick-stats">
                    <div className="attendance-stat-card violations">
                        <div className="stat-icon"><FiAlertCircle /></div>
                        <div className="stat-info">
                            <span className="stat-label">Tổng vi phạm</span>
                            <span className="stat-value">{activityStats.totalViolations}</span>
                        </div>
                    </div>
                    <div className="attendance-stat-card merit">
                        <div className="stat-icon"><FiAward /></div>
                        <div className="stat-info">
                            <span className="stat-label">Khen thưởng</span>
                            <span className="stat-value">{activityStats.totalMerit}</span>
                        </div>
                    </div>
                    <div className="attendance-stat-card attendance">
                        <div className="stat-icon"><FiCheckCircle /></div>
                        <div className="stat-info">
                            <span className="stat-label">Chuyên cần TB</span>
                            <span className="stat-value">{activityStats.avgAttendance}%</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="homeroom-students-table-wrap">
                <table className="homeroom-students-table">
                    <thead>
                        <tr>
                            <th style={{ width: "60px" }}>STT</th>
                            <th>HỌC SINH</th>
                            {viewMode === "info" ? (
                                <>
                                    <th>PHỤ HUYNH</th>
                                    <th>SĐT PHỤ HUYNH</th>
                                    <th>VAI TRÒ</th>
                                    <th style={{ textAlign: "center" }}>VI PHẠM</th>
                                    <th style={{ textAlign: "center" }}>ĐIỂM CHUYÊN CẦN</th>
                                </>
                            ) : (
                                <>
                                    <th style={{ textAlign: "center" }}>VI PHẠM</th>
                                    <th style={{ textAlign: "center" }}>KHEN THƯỞNG</th>
                                    <th style={{ textAlign: "center" }}>CHUYÊN CẦN</th>
                                    <th style={{ textAlign: "center" }}>HẠNH KIỂM</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.length === 0 ? (
                            <tr>
                                <td colSpan={viewMode === "info" ? 7 : 7} className="homeroom-students-empty-row">
                                    Không tìm thấy học sinh phù hợp.
                                </td>
                            </tr>
                        ) : (
                            filteredStudents.map((student, index) => {
                                return (
                                    <tr
                                        key={student.id}
                                        className="homeroom-students-row"
                                        onClick={() => openStudentDialog(student)}
                                    >
                                        <td className="homeroom-students-muted">{index + 1}</td>
                                        <td>
                                            <div className="homeroom-students-main-info">
                                                <div className="homeroom-students-avatar">{getAvatarLetter(student.name)}</div>
                                                <div className="homeroom-students-name-wrap">
                                                    <h4>{student.name}</h4>
                                                    <p>{student.email || "—"}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {viewMode === "info" ? (
                                            <>
                                                <td>
                                                    <div className="homeroom-students-parent-wrap">
                                                        <h5>{student.parentName || "—"}</h5>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="homeroom-students-muted">{student.parentPhone || "—"}</span>
                                                </td>
                                                <td>
                                                    <span className={`homeroom-students-role-badge ${getRoleClass(student.officerRole)}`}>
                                                        {officerLabelByStudentId[student.id] || "Chưa phân công"}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: "center" }}>
                                                    <span className={`homeroom-violation-badge ${student.violationCount > 0 ? 'has-violations' : ''}`}>
                                                        {student.violationCount || 0}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: "center" }}>
                                                    <div className="homeroom-attendance-score-wrap">
                                                        <div className="attendance-score-text">
                                                            <span className={`attendance-score-val ${student.attendanceScore < 9 ? 'low' : 'high'}`}>
                                                                {student.attendanceScore}
                                                            </span>
                                                            <span className="attendance-score-max">/10</span>
                                                        </div>
                                                        <div className="attendance-score-bar-bg">
                                                            <div
                                                                className="attendance-score-bar-fill"
                                                                style={{ width: `${student.attendanceScore * 10}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td style={{ textAlign: "center" }}>
                                                    <span className={`activity-count-badge violation ${student.violations > 0 ? "active" : ""}`}>
                                                        {student.violations}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: "center" }}>
                                                    <span className={`activity-count-badge merit ${student.meritPoints > 0 ? "active" : ""}`}>
                                                        +{student.meritPoints}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: "center" }}>
                                                    <div className="activity-attendance-rate">
                                                        <span className={student.attendanceRate < 90 ? "warning" : ""}>{student.attendanceRate}%</span>
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: "center" }}>
                                                    <span className={`conduct-pill ${student.conduct.toLowerCase()}`}>
                                                        {student.conduct}
                                                    </span>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <HomeroomStudentDetailDialog
                open={Boolean(activeStudent)}
                student={activeStudent}
                officerRows={officers}
                onClose={closeStudentDialog}
                viewMode={viewMode}
                selectedWeek={selectedWeek}
                onViewAttendance={(student) => {
                    closeStudentDialog();
                    setViewMode("activity");
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
            />
        </div>
    );
}
