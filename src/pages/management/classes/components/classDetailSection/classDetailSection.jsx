import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FiSearch, FiChevronLeft, FiChevronRight, FiEdit2, FiUserX, FiUserCheck } from "react-icons/fi";
import axiosClient from "../../../../../services/shared/http/axiosClient";
import "./classDetailSection.css";

function formatDateDDMMYYYY(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date)) return "";
    const [year, month, day] = date.toISOString().split("T")[0].split("-");
    return `${day}/${month}/${year}`;
}

const ITEMS_PER_PAGE = 10;
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

export default function ClassDetailSection() {
    const { classId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [classData, setClassData] = useState(null);
    const [students, setStudents] = useState([]);
    const [attendanceData, setAttendanceData] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
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

    const isPrincipalView = location.pathname.startsWith("/principal");

    const fetchClassData = async () => {
        setIsLoading(true);
        setError("");
        try {
            const [classResponse, studentsResponse] = await Promise.all([
                axiosClient.get(`/classes/${classId}`),
                axiosClient.get(`/classes/${classId}/students`)
            ]);

            const classInfo = classResponse.data?.data || classResponse.data || {};
            const studentsList = classResponse.data?.students ||
                                studentsResponse.data?.data ||
                                studentsResponse.data?.students ||
                                [];

            setClassData({
                id: classInfo.id,
                name: classInfo.class_name || classInfo.className || "",
                grade: classInfo.grade_level_name ? `Khối ${classInfo.grade_level_number || ""}` : "",
                year: classInfo.school_year_name || classInfo.year || "",
                teacher: classInfo.homeroom_given_name || classInfo.homeroomSurname ?
                    `${classInfo.homeroom_surname || ""} ${classInfo.homeroom_given_name || ""}`.trim() :
                    (classInfo.teacher || "Chưa phân công"),
                students: classInfo.current_student_count || studentsList.length,
                diemTong: classInfo.diemTong || 8.5,
                subjects: classInfo.subjects || []
            });

            const parsedStudents = studentsList.map((s, index) => ({
                id: s.id || index + 1,
                name: `${s.surname || ""} ${s.given_name || ""}`.trim() || s.name || s.fullName || `Học sinh ${index + 1}`,
                dob: s.dob || s.birth_date || "",
                enrollmentDate: s.enrollment_date || s.created_at || "",
                parentName: s.parent_name || s.parentName || "",
                parentPhone: s.parent_phone || s.parentPhone || "",
                tuitionPaid: s.tuition_status === "paid" || s.tuitionPaid === true,
                isHidden: false
            }));

            setStudents(parsedStudents);
        } catch (err) {
            console.error("Error fetching class data:", err);
            setError(err.response?.data?.error || "Không thể tải dữ liệu lớp học");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchClassData();
    }, [classId]);

    const fetchAttendanceStatistics = async (filter) => {
        try {
            const response = await axiosClient.get(`/classes/${classId}/attendance-statistics`, {
                params: { timeFilter: filter }
            });
            const data = response.data?.data || response.data || {};
            const byStudent = {};

            const stats = Array.isArray(data.details) ? data.details : [];

            stats.forEach((stat) => {
                const total = parseInt(stat.total || 0);
                const present = parseInt(stat.present || 0);
                const absent = parseInt(stat.absent || 0);
                const late = parseInt(stat.late || 0);
                const excused = parseInt(stat.excused || 0);

                byStudent[stat.student_id] = {
                    attendancePercent: total > 0 ? Math.round((present / total) * 100) : 100,
                    absentDays: absent,
                    lateCount: late,
                    excusedAbsence: excused,
                    unexcusedAbsence: absent - excused,
                    updatedAt: new Date().toISOString()
                };
            });

            setAttendanceData((prev) => ({ ...prev, [filter]: byStudent }));
        } catch (err) {
            console.error("Error fetching attendance:", err);
        }
    };

    useEffect(() => {
        if (selectedTimeFilter && classId) {
            if (!attendanceData[selectedTimeFilter]) {
                fetchAttendanceStatistics(selectedTimeFilter);
            }
        }
    }, [selectedTimeFilter, classId]);

    const filteredStudents = useMemo(() => {
        if (!searchTerm) return students;
        return students.filter((student) =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, students]);

    const attendanceRows = useMemo(() => {
        const rows = filteredStudents.map((student) => {
            const attendanceMetrics = attendanceData[selectedTimeFilter]?.[student.id] || {
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
    }, [filteredStudents, selectedSort, selectedTimeFilter, attendanceData]);

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
        if (isPrincipalView) return;
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
        if (isPrincipalView) return;
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
            navigate(isPrincipalView ? "/principal/overview" : "/management/classes");
        }
    };

    if (isLoading) {
        return (
            <div className="class-detail-page">
                <button className="back-btn" onClick={handleBack}>
                    ← Quay lại
                </button>
                <div className="empty-state">
                    <p>Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (error || !classData) {
        return (
            <div className="class-detail-page">
                <button className="back-btn" onClick={handleBack}>
                    ← Quay lại
                </button>
                <div className="empty-state">
                    <p>{error || "Không tìm thấy lớp học này"}</p>
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
