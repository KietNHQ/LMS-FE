import React, { useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FiSearch, FiChevronLeft, FiChevronRight, FiEdit2, FiUserX, FiUserCheck } from "react-icons/fi";
import "./classDetailSection.css";

// Helper function to format date DD/MM/YYYY
function formatDateDDMMYYYY(dateString) {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
}

// Mock student data
const mockStudents = [
    { id: 1, name: "Nguyễn Minh Tuấn", dob: "2008-03-15", enrollmentDate: "2024-09-01", parentName: "Nguyễn Văn An", parentPhone: "0912345678", tuitionPaid: true },
    { id: 2, name: "Trần Thị Bảo Châu", dob: "2008-07-22", enrollmentDate: "2024-09-01", parentName: "Trần Văn Bình", parentPhone: "0987654321", tuitionPaid: false },
    { id: 3, name: "Phạm Văn Hùng", dob: "2008-05-10", enrollmentDate: "2024-09-01", parentName: "Phạm Thị Hoa", parentPhone: "0923456789", tuitionPaid: true },
    { id: 4, name: "Hoàng Thị Hoa", dob: "2008-02-28", enrollmentDate: "2024-09-01", parentName: "Hoàng Văn Hùng", parentPhone: "0934567890", tuitionPaid: false },
    { id: 5, name: "Lê Văn Dũng", dob: "2008-08-12", enrollmentDate: "2024-09-03", parentName: "Lê Thị Linh", parentPhone: "0945678901", tuitionPaid: true },
    { id: 6, name: "Vũ Thị Trang", dob: "2008-04-05", enrollmentDate: "2024-09-01", parentName: "Vũ Văn Tuấn", parentPhone: "0956789012", tuitionPaid: false },
    { id: 7, name: "Đặng Quốc Hùng", dob: "2007-09-12", enrollmentDate: "2024-09-02", parentName: "Đặng Thị Mai", parentPhone: "0967890123", tuitionPaid: true },
    { id: 8, name: "Phạm Thu Hà", dob: "2007-10-21", enrollmentDate: "2024-09-04", parentName: "Phạm Văn Cường", parentPhone: "0978901234", tuitionPaid: true },
];

const ITEMS_PER_PAGE = 6;
const ATTENDANCE_ALERT_THRESHOLD = 95;

const timeFilterOptions = [
    { value: "this-week", label: "Tuần này" },
    { value: "last-week", label: "Tuần trước" },
    { value: "semester-1", label: "Học kì 1" },
];

const sortOptions = [
    { value: "attendance-asc", label: "% chuyên cần thấp đến cao" },
    { value: "absent-desc", label: "Số ngày nghỉ nhiều đến ít" },
    { value: "late-desc", label: "Số lần đi muộn nhiều đến ít" },
];

const mockClasses = [
    {
        id: 1,
        name: "10A1",
        grade: "Khối 10",
        year: "2024-2025",
        teacher: "Trần Thị Hương",
        students: 35,
        diemTong: 8.5,
        semester1Closed: true,
        subjects: ["Toán", "Vật lý", "Hóa học", "Ngữ văn", "Tiếng Anh"],
    },
    {
        id: 2,
        name: "10A2",
        grade: "Khối 10",
        year: "2024-2025",
        teacher: "Lê Văn Minh",
        students: 33,
        diemTong: 7.8,
        semester1Closed: true,
        subjects: ["Toán", "Vật lý", "Hóa học", "Ngữ văn", "Tiếng Anh"],
    },
];

const mockAttendanceByStudent = {
    1: {
        "this-week": { attendancePercent: 96, absentDays: 0, lateCount: 1, excusedAbsence: 0, unexcusedAbsence: 0, updatedAt: "2026-03-25" },
        "last-week": { attendancePercent: 92, absentDays: 1, lateCount: 2, excusedAbsence: 1, unexcusedAbsence: 0, updatedAt: "2026-03-18" },
        "semester-1": { attendancePercent: 94, absentDays: 4, lateCount: 6, excusedAbsence: 2, unexcusedAbsence: 2, updatedAt: "2025-12-20" },
    },
    2: {
        "this-week": { attendancePercent: 98, absentDays: 0, lateCount: 0, excusedAbsence: 0, unexcusedAbsence: 0, updatedAt: "2026-03-25" },
        "last-week": { attendancePercent: 96, absentDays: 0, lateCount: 1, excusedAbsence: 0, unexcusedAbsence: 0, updatedAt: "2026-03-18" },
        "semester-1": { attendancePercent: 97, absentDays: 2, lateCount: 3, excusedAbsence: 1, unexcusedAbsence: 1, updatedAt: "2025-12-20" },
    },
    3: {
        "this-week": { attendancePercent: 89, absentDays: 2, lateCount: 2, excusedAbsence: 1, unexcusedAbsence: 1, updatedAt: "2026-03-25" },
        "last-week": { attendancePercent: 91, absentDays: 1, lateCount: 3, excusedAbsence: 1, unexcusedAbsence: 0, updatedAt: "2026-03-18" },
        "semester-1": { attendancePercent: 90, absentDays: 6, lateCount: 8, excusedAbsence: 2, unexcusedAbsence: 4, updatedAt: "2025-12-20" },
    },
    4: {
        "this-week": { attendancePercent: 94, absentDays: 1, lateCount: 1, excusedAbsence: 1, unexcusedAbsence: 0, updatedAt: "2026-03-25" },
        "last-week": { attendancePercent: 95, absentDays: 0, lateCount: 2, excusedAbsence: 0, unexcusedAbsence: 0, updatedAt: "2026-03-18" },
        "semester-1": { attendancePercent: 93, absentDays: 5, lateCount: 5, excusedAbsence: 3, unexcusedAbsence: 2, updatedAt: "2025-12-20" },
    },
    5: {
        "this-week": { attendancePercent: 97, absentDays: 0, lateCount: 1, excusedAbsence: 0, unexcusedAbsence: 0, updatedAt: "2026-03-25" },
        "last-week": { attendancePercent: 94, absentDays: 1, lateCount: 1, excusedAbsence: 1, unexcusedAbsence: 0, updatedAt: "2026-03-18" },
        "semester-1": { attendancePercent: 95, absentDays: 3, lateCount: 4, excusedAbsence: 2, unexcusedAbsence: 1, updatedAt: "2025-12-20" },
    },
    6: {
        "this-week": { attendancePercent: 90, absentDays: 1, lateCount: 3, excusedAbsence: 0, unexcusedAbsence: 1, updatedAt: "2026-03-25" },
        "last-week": { attendancePercent: 88, absentDays: 2, lateCount: 2, excusedAbsence: 1, unexcusedAbsence: 1, updatedAt: "2026-03-18" },
        "semester-1": { attendancePercent: 89, absentDays: 7, lateCount: 9, excusedAbsence: 3, unexcusedAbsence: 4, updatedAt: "2025-12-20" },
    },
    7: {
        "this-week": { attendancePercent: 95, absentDays: 0, lateCount: 2, excusedAbsence: 0, unexcusedAbsence: 0, updatedAt: "2026-03-25" },
        "last-week": { attendancePercent: 93, absentDays: 1, lateCount: 2, excusedAbsence: 1, unexcusedAbsence: 0, updatedAt: "2026-03-18" },
        "semester-1": { attendancePercent: 92, absentDays: 5, lateCount: 6, excusedAbsence: 2, unexcusedAbsence: 3, updatedAt: "2025-12-20" },
    },
    8: {
        "this-week": { attendancePercent: 99, absentDays: 0, lateCount: 0, excusedAbsence: 0, unexcusedAbsence: 0, updatedAt: "2026-03-25" },
        "last-week": { attendancePercent: 97, absentDays: 0, lateCount: 1, excusedAbsence: 0, unexcusedAbsence: 0, updatedAt: "2026-03-18" },
        "semester-1": { attendancePercent: 98, absentDays: 1, lateCount: 2, excusedAbsence: 1, unexcusedAbsence: 0, updatedAt: "2025-12-20" },
    },
};

export default function ClassDetailSection() {
    const { classId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [students, setStudents] = useState(() =>
        mockStudents.map((student) => ({ ...student, isHidden: false }))
    );
    const [activeModalMode, setActiveModalMode] = useState(null);
    const [activeStudentId, setActiveStudentId] = useState(null);
    const [editForm, setEditForm] = useState({
        name: "",
        dob: "",
        parentName: "",
        parentPhone: "",
    });
    const [activeSection, setActiveSection] = useState("students");
    const [selectedTimeFilter, setSelectedTimeFilter] = useState("this-week");
    const [selectedSort, setSelectedSort] = useState("attendance-asc");

    // Logic to check if Principal View
    const isPrincipalView = location.pathname.startsWith("/principal");

    const classData = mockClasses.find((c) => String(c.id) === String(classId)) || null;

    const filteredStudents = useMemo(() => {
        if (!searchTerm) return students;
        return students.filter((student) =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, students]);

    const attendanceRows = useMemo(() => {
        const rows = filteredStudents.map((student) => {
            const attendanceMetrics =
                mockAttendanceByStudent[student.id]?.[selectedTimeFilter] || {
                    attendancePercent: 100,
                    absentDays: 0,
                    lateCount: 0,
                    excusedAbsence: 0,
                    unexcusedAbsence: 0,
                    updatedAt: student.enrollmentDate,
                };

            const isAtRisk =
                attendanceMetrics.attendancePercent < ATTENDANCE_ALERT_THRESHOLD ||
                attendanceMetrics.absentDays >= 2 ||
                attendanceMetrics.lateCount >= 3;

            return {
                ...student,
                ...attendanceMetrics,
                isAtRisk,
            };
        });

        const sortedRows = [...rows];
        if (selectedSort === "attendance-asc") {
            sortedRows.sort((a, b) => a.attendancePercent - b.attendancePercent);
        } else if (selectedSort === "absent-desc") {
            sortedRows.sort((a, b) => b.absentDays - a.absentDays);
        } else if (selectedSort === "late-desc") {
            sortedRows.sort((a, b) => b.lateCount - a.lateCount);
        }

        return sortedRows;
    }, [filteredStudents, selectedSort, selectedTimeFilter]);

    const attendanceSummary = useMemo(() => {
        if (!attendanceRows.length) {
            return {
                averageAttendance: 0,
                totalAbsent: 0,
                totalLate: 0,
                atRiskCount: 0,
            };
        }

        const totalAttendance = attendanceRows.reduce((sum, row) => sum + row.attendancePercent, 0);
        const totalAbsent = attendanceRows.reduce((sum, row) => sum + row.absentDays, 0);
        const totalLate = attendanceRows.reduce((sum, row) => sum + row.lateCount, 0);
        const atRiskCount = attendanceRows.filter((row) => row.isAtRisk).length;

        return {
            averageAttendance: Number((totalAttendance / attendanceRows.length).toFixed(1)),
            totalAbsent,
            totalLate,
            atRiskCount,
        };
    }, [attendanceRows]);

    const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredStudents.length / ITEMS_PER_PAGE)), [filteredStudents]);
    const effectivePage = Math.min(currentPage, totalPages);

    const paginatedStudents = useMemo(() => {
        const start = (effectivePage - 1) * ITEMS_PER_PAGE;
        return filteredStudents.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredStudents, effectivePage]);

    const paginatedAttendanceRows = useMemo(() => {
        const start = (effectivePage - 1) * ITEMS_PER_PAGE;
        return attendanceRows.slice(start, start + ITEMS_PER_PAGE);
    }, [attendanceRows, effectivePage]);

    const goPrevPage = () => {
        setCurrentPage((prev) => Math.max(1, Math.min(prev, totalPages) - 1));
    };

    const goNextPage = () => {
        setCurrentPage((prev) => Math.min(totalPages, prev + 1));
    };

    const activeStudent = useMemo(
        () => students.find((student) => student.id === activeStudentId) || null,
        [students, activeStudentId]
    );

    const handleCloseModal = () => {
        setActiveModalMode(null);
        setActiveStudentId(null);
        setEditForm({ name: "", dob: "", parentName: "", parentPhone: "" });
    };

    const handleEditStudent = (student) => {
        if (isPrincipalView) return; // View only
        setActiveModalMode("edit");
        setActiveStudentId(student.id);
        setEditForm({
            name: student.name,
            dob: student.dob,
            parentName: student.parentName,
            parentPhone: student.parentPhone,
        });
    };

    const handleSaveEdit = () => {
        if (!activeStudentId || isPrincipalView) return;

        setStudents((prevStudents) =>
            prevStudents.map((student) =>
                student.id === activeStudentId
                    ? {
                        ...student,
                        name: editForm.name.trim() || student.name,
                        dob: editForm.dob || student.dob,
                        parentName: editForm.parentName.trim() || student.parentName,
                        parentPhone: editForm.parentPhone.trim() || student.parentPhone,
                    }
                    : student
            )
        );
        handleCloseModal();
    };

    const handleOpenToggleHiddenDialog = (studentId) => {
        if (isPrincipalView) return; // View only
        setActiveModalMode("toggle-hidden");
        setActiveStudentId(studentId);
    };

    const handleOpenAttendanceSection = () => {
        setActiveSection("attendance");
    };

    const handleOpenStudentSection = () => {
        setActiveSection("students");
    };

    const handleSearchStudent = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };

    const handleTimeFilterChange = (event) => {
        setSelectedTimeFilter(event.target.value);
        setCurrentPage(1);
    };

    const handleSortChange = (event) => {
        setSelectedSort(event.target.value);
        setCurrentPage(1);
    };

    const handleConfirmToggleHidden = () => {
        if (!activeStudentId || isPrincipalView) return;

        setStudents((prevStudents) =>
            prevStudents.map((student) =>
                student.id === activeStudentId
                    ? { ...student, isHidden: !student.isHidden }
                    : student
            )
        );
        handleCloseModal();
    };

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate(isPrincipalView ? "/principal/overview" : "/admin/classes");
        }
    };

    if (!classData) {
        return (
            <div className="class-detail-page">
                <button className="back-btn" onClick={handleBack}>
                    ← Quay lại
                </button>
                <div className="empty-state">
                    <p>Không tìm thấy lớp học này</p>
                </div>
            </div>
        );
    }

    return (
        <div className="class-detail-page">
            <div className="class-detail-header">
                <div className="class-detail-top">
                    <button className="back-btn" onClick={handleBack}>
                        ← Quay lại
                    </button>
                    <div className="class-detail-title">
                        <h1>{classData.name}</h1>
                        <p>{classData.grade} • {classData.year}</p>
                    </div>
                </div>

                <div className="class-detail-info">
                    <div className="info-item">
                        <span className="info-label">GVCN</span>
                        <span className="info-value">{classData.teacher}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Số học sinh</span>
                        <span className="info-value">{classData.students}</span>
                    </div>
                    <button
                        type="button"
                        className={`info-item info-item--score-trigger ${activeSection === "attendance" ? "active" : ""}`.trim()}
                        onClick={handleOpenAttendanceSection}
                    >
                        <span className="info-label">Điểm rèn luyện</span>
                        <span className="info-value score">{classData.diemTong}</span>
                    </button>
                </div>
            </div>

            <div className="class-detail-section-switch">
                <button
                    type="button"
                    className={`section-switch-btn ${activeSection === "students" ? "active" : ""}`.trim()}
                    onClick={handleOpenStudentSection}
                >
                    Danh sách học sinh
                </button>
                <button
                    type="button"
                    className={`section-switch-btn ${activeSection === "attendance" ? "active" : ""}`.trim()}
                    onClick={handleOpenAttendanceSection}
                >
                    Chuyên cần và điểm rèn luyện
                </button>
            </div>

            {activeSection === "students" ? (
                <div className="students-card">
                    <div className="students-card-header">
                        <h2 className="students-card-title">Danh sách học sinh</h2>
                        <div className="class-detail-search-box">
                            <FiSearch className="class-detail-search-icon" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm học sinh..."
                                value={searchTerm}
                                onChange={handleSearchStudent}
                            />
                        </div>
                    </div>

                    <div className="table-wrapper">
                        <table className="students-table">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>HỌC SINH</th>
                                    <th>NGÀY NHẬP HỌC</th>
                                    <th>PHỤ HUYNH</th>
                                    <th>HỌC PHÍ</th>
                                    {!isPrincipalView && <th>THAO TÁC</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedStudents.map((student, index) => (
                                    <tr key={student.id} className={student.isHidden ? "student-row-hidden" : ""}>
                                        <td className="student-index-cell">{(effectivePage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                        <td>
                                            <div className="student-main-info">
                                                <span className="student-avatar">
                                                    {student.name.charAt(0).toUpperCase()}
                                                </span>
                                                <div className="student-name-wrap">
                                                    <strong>{student.name}</strong>
                                                    <small>Ngày sinh: {formatDateDDMMYYYY(student.dob)}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="student-date-cell">{formatDateDDMMYYYY(student.enrollmentDate)}</td>
                                        <td>
                                            <div className="student-parent-wrap">
                                                <strong>{student.parentName}</strong>
                                                <span>{student.parentPhone}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`tuition-status-badge ${student.tuitionPaid ? "paid" : "unpaid"}`}>
                                                {student.tuitionPaid ? "Đã đóng" : "Chưa đóng"}
                                            </span>
                                        </td>
                                        {!isPrincipalView && (
                                            <td className="student-actions-cell">
                                                <div className="student-row-actions">
                                                    <button
                                                        className="student-action-btn edit"
                                                        onClick={() => handleEditStudent(student)}
                                                        title="Sửa học sinh"
                                                    >
                                                        <FiEdit2 />
                                                    </button>
                                                    <button
                                                        className={`student-action-btn delete ${student.isHidden ? "active" : ""}`}
                                                        onClick={() => handleOpenToggleHiddenDialog(student.id)}
                                                        title={student.isHidden ? "Hiện học sinh" : "Ẩn học sinh"}
                                                    >
                                                        {student.isHidden ? <FiUserCheck /> : <FiUserX />}
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {paginatedStudents.length === 0 && (
                            <div className="table-empty">Không tìm thấy học sinh</div>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="table-pagination">
                            <button className="page-btn" onClick={goPrevPage} disabled={effectivePage === 1}>
                                <FiChevronLeft />
                            </button>
                            <div className="page-indicator">
                                <span>{effectivePage}</span>
                                <small>/ {totalPages}</small>
                            </div>
                            <button className="page-btn" onClick={goNextPage} disabled={effectivePage === totalPages}>
                                <FiChevronRight />
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="students-card attendance-card">
                    <div className="students-card-header">
                        <h2 className="students-card-title">Theo dõi chuyên cần và điểm rèn luyện</h2>
                        <div className="attendance-toolbar">
                            <div className="class-detail-search-box">
                                <FiSearch className="class-detail-search-icon" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm học sinh..."
                                    value={searchTerm}
                                    onChange={handleSearchStudent}
                                />
                            </div>
                            <select className="attendance-filter-select" value={selectedTimeFilter} onChange={handleTimeFilterChange}>
                                {timeFilterOptions.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                            <select className="attendance-filter-select" value={selectedSort} onChange={handleSortChange}>
                                {sortOptions.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="attendance-summary-grid">
                        <article className="attendance-summary-card">
                            <span>Chuyên cần trung bình ({timeFilterOptions.find((f) => f.value === selectedTimeFilter)?.label})</span>
                            <strong>{attendanceSummary.averageAttendance}%</strong>
                        </article>
                        <article className="attendance-summary-card">
                            <span>Tổng số ngày nghỉ</span>
                            <strong>{attendanceSummary.totalAbsent}</strong>
                        </article>
                        <article className="attendance-summary-card">
                            <span>Tổng số lần đi muộn</span>
                            <strong>{attendanceSummary.totalLate}</strong>
                        </article>
                        <article className="attendance-summary-card attendance-summary-card--risk">
                            <span>Số học sinh cần chú ý</span>
                            <strong>{attendanceSummary.atRiskCount}</strong>
                        </article>
                    </div>

                    <div className="table-wrapper">
                        <table className="students-table attendance-table">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>HỌC SINH</th>
                                    <th>% CHUYÊN CẦN</th>
                                    <th>NGHỈ</th>
                                    <th>ĐI MUỘN</th>
                                    <th>CẬP NHẬT GẦN NHẤT</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedAttendanceRows.map((student, index) => (
                                    <tr key={student.id} className={student.isAtRisk ? "attendance-row-risk" : ""}>
                                        <td className="student-index-cell">{(effectivePage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                        <td>
                                            <div className="student-main-info">
                                                <span className="student-avatar">{student.name.charAt(0).toUpperCase()}</span>
                                                <div className="student-name-wrap">
                                                    <strong>{student.name}</strong>
                                                    <small>{student.parentName}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`attendance-chip ${student.isAtRisk ? "attendance-chip--risk" : ""}`.trim()}>
                                                {student.attendancePercent}%
                                            </span>
                                        </td>
                                        <td>
                                            <div className="attendance-absent-cell">
                                                <strong>{student.absentDays}</strong>
                                                <small>{student.excusedAbsence} có phép / {student.unexcusedAbsence} không phép</small>
                                            </div>
                                        </td>
                                        <td><span className="attendance-late-cell">{student.lateCount} lần</span></td>
                                        <td className="student-date-cell">{formatDateDDMMYYYY(student.updatedAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="table-pagination">
                            <button className="page-btn" onClick={goPrevPage} disabled={effectivePage === 1}>
                                <FiChevronLeft />
                            </button>
                            <div className="page-indicator">
                                <span>{effectivePage}</span>
                                <small>/ {totalPages}</small>
                            </div>
                            <button className="page-btn" onClick={goNextPage} disabled={effectivePage === totalPages}>
                                <FiChevronRight />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Modals for Edit and Toggle Hidden */}
            {activeModalMode === "edit" && activeStudent && (
                <div className="class-student-modal-overlay" onClick={handleCloseModal}>
                    <div className="class-student-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Chỉnh sửa học sinh</h3>
                        <div className="class-student-modal-grid">
                            <label>
                                <span>Họ và tên</span>
                                <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                            </label>
                            <label>
                                <span>Ngày sinh</span>
                                <input type="date" value={editForm.dob} onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })} />
                            </label>
                            <label>
                                <span>Tên phụ huynh</span>
                                <input type="text" value={editForm.parentName} onChange={(e) => setEditForm({ ...editForm, parentName: e.target.value })} />
                            </label>
                            <label>
                                <span>Số điện thoại</span>
                                <input type="text" value={editForm.parentPhone} onChange={(e) => setEditForm({ ...editForm, parentPhone: e.target.value })} />
                            </label>
                        </div>
                        <div className="class-student-modal-actions">
                            <button className="class-student-modal-btn cancel" onClick={handleCloseModal}>Hủy</button>
                            <button className="class-student-modal-btn primary" onClick={handleSaveEdit}>Lưu</button>
                        </div>
                    </div>
                </div>
            )}

            {activeModalMode === "toggle-hidden" && activeStudent && (
                <div className="class-student-modal-overlay" onClick={handleCloseModal}>
                    <div className="class-student-modal class-student-confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>{activeStudent.isHidden ? "Hiện học sinh" : "Ẩn học sinh"}</h3>
                        <p>Bạn có chắc muốn {activeStudent.isHidden ? "hiện lại" : "ẩn"} <strong>{activeStudent.name}</strong> không?</p>
                        <div className="class-student-modal-actions">
                            <button className="class-student-modal-btn cancel" onClick={handleCloseModal}>Hủy</button>
                            <button className="class-student-modal-btn primary" onClick={handleConfirmToggleHidden}>Xác nhận</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
