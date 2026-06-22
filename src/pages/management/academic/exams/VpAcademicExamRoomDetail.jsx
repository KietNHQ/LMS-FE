import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FiArrowLeft, FiSearch, FiUser, FiBookOpen, FiUsers } from "react-icons/fi";
import { Select, Pagination } from "../../../../components/ui";
import LoadingSpinner from "../../../../components/common/LoadingSpinner/LoadingSpinner";
import examService from "../../../../services/pages/management/exam/examService";
import "./VpAcademicExamRoomDetail.css";

const ITEMS_PER_PAGE = 10;

const getExamContext = (locationState) => {
    const stored = sessionStorage.getItem("selected_exam_context");
    const parsedStored = stored ? JSON.parse(stored) : {};
    return {
        examId: locationState?.examId || parsedStored.examId || null,
        examName: locationState?.examName || parsedStored.examName || "",
    };
};

const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString("vi-VN");
};

const normalizeStudent = (row) => {
    const student = row.student || {};
    return {
        id: row.id,
        code: student.studentCode || student.student_code || student.id || row.id,
        name: student.fullName || [student.surname, student.middleName, student.givenName].filter(Boolean).join(" ") || "Học sinh",
        className: student.className || row.className || "—",
        seatNumber: row.seatNumber || row.seat_number || "—",
        attendanceStatus: row.attendanceStatus || row.attendance_status || "pending",
    };
};

export default function VpAcademicExamRoomDetail() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { examId, examName } = useMemo(() => getExamContext(location.state), [location.state]);
    const [searchTerm, setSearchTerm] = useState("");
    const [classFilter, setClassFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);

    const { data: room, isLoading, error } = useQuery({
        queryKey: ["exam-room", examId, roomId],
        queryFn: () => examService.getRoom(examId, roomId),
        enabled: Boolean(examId && roomId),
        staleTime: 60_000,
    });

    const students = useMemo(() => (room?.students || []).map(normalizeStudent), [room?.students]);
    const supervisors = room?.supervisors || [];
    const classOptions = useMemo(() => {
        const classes = [...new Set(students.map((student) => student.className).filter((item) => item && item !== "—"))];
        return [{ value: "all", label: "Tất cả lớp" }, ...classes.map((item) => ({ value: item, label: item }))];
    }, [students]);

    const filteredStudents = students.filter((student) => {
        const query = searchTerm.trim().toLowerCase();
        const matchesSearch = !query || student.name.toLowerCase().includes(query) || String(student.code).toLowerCase().includes(query);
        const matchesClass = classFilter === "all" || student.className === classFilter;
        return matchesSearch && matchesClass;
    });

    const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE) || 1;
    const paginatedStudents = filteredStudents.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    const roomName = room?.roomName || room?.room_name || "Phòng thi";
    const capacity = Number(room?.capacity || 0);

    return (
        <div className="vpa-room-detail">
            <div className="vpa-detail-header">
                <button className="back-btn" onClick={() => navigate("/management/exams/rooms", { state: { examId, examName } })}>
                    <FiArrowLeft /> Quay lại
                </button>
                <div className="header-info">
                    <h1>Chi tiết {roomName}</h1>
                    <span className="exam-name">{examName || room?.session?.name || ""}</span>
                </div>
            </div>

            {!examId ? (
                <div className="vpa-empty-state">
                    <FiBookOpen />
                    <h3>Thiếu thông tin kỳ thi</h3>
                    <p>Vui lòng mở phòng thi từ trang danh sách phòng để tải dữ liệu thực tế.</p>
                </div>
            ) : isLoading ? (
                <div className="vpa-empty-state">
                    <LoadingSpinner size="lg" label="Đang tải chi tiết phòng thi..." />
                </div>
            ) : error ? (
                <div className="vpa-empty-state">
                    <h3>Không thể tải phòng thi</h3>
                    <p>{error.message || "Vui lòng thử lại sau."}</p>
                </div>
            ) : (
                <>
                    <div className="vpa-rooms-stats" style={{ marginBottom: "2rem" }}>
                        <div className="stat-card">
                            <div className="stat-icon" style={{ backgroundColor: "#34d39920", color: "#10b981" }}>
                                <FiBookOpen />
                            </div>
                            <div className="stat-details">
                                <span className="label">Môn thi</span>
                                <span className="value" style={{ fontSize: "1.2rem" }}>{room?.subject?.name || "—"}</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{ backgroundColor: "#3b82f620", color: "#3b82f6" }}>
                                <FiUser />
                            </div>
                            <div className="stat-details">
                                <span className="label">Giám thị</span>
                                <span className="value" style={{ fontSize: "1.2rem" }}>{supervisors.length}</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{ backgroundColor: "#1e2f5a20", color: "#1e2f5a" }}>
                                <FiUsers />
                            </div>
                            <div className="stat-details">
                                <span className="label">Tổng thí sinh</span>
                                <span className="value" style={{ fontSize: "1.6rem" }}>
                                    {students.length} <span style={{ fontSize: "0.9rem", color: "#94a3b8", fontWeight: 600 }}>/ {capacity || "—"}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="vpa-detail-toolbar">
                        <div className="toolbar-left">
                            <div className="search-box">
                                <FiSearch />
                                <input
                                    type="text"
                                    placeholder="Tìm học sinh theo mã hoặc tên..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                            <Select
                                variant="custom"
                                options={classOptions}
                                value={classFilter}
                                onChange={(e) => {
                                    setClassFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="class-filter-select"
                                style={{ width: "180px" }}
                            />
                        </div>
                        <div className="toolbar-right">
                            <span className="exam-name">
                                {formatDate(room?.examDate || room?.exam_date)} {room?.startTime || room?.start_time || ""} - {room?.endTime || room?.end_time || ""}
                            </span>
                        </div>
                    </div>

                    <div className="student-table-wrapper">
                        <table className="vpa-student-table">
                            <thead>
                                <tr>
                                    <th>Mã học sinh</th>
                                    <th>Họ và tên</th>
                                    <th>Lớp</th>
                                    <th>Số báo danh / ghế</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedStudents.length > 0 ? (
                                    paginatedStudents.map((student) => (
                                        <tr key={student.id}>
                                            <td><span className="student-id">{student.code}</span></td>
                                            <td><span className="student-name">{student.name}</span></td>
                                            <td>{student.className}</td>
                                            <td>{student.seatNumber}</td>
                                            <td><span className="status-pill ok">{student.attendanceStatus}</span></td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
                                            Không có học sinh nào trong phòng này.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="vpa-pagination-wrapper" style={{ marginTop: "1.5rem", display: "flex", justifyContent: "center" }}>
                            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
