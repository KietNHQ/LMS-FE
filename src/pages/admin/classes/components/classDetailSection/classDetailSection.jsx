import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiSearch, FiChevronLeft, FiChevronRight, FiEdit2, FiUserX } from "react-icons/fi";
import "./classDetailSection.css";

// Mock student data
const mockStudents = [
    { id: 1, name: "Nguyễn Minh Tuấn", dob: "2008-03-15" },
    { id: 2, name: "Trần Thị Bảo Châu", dob: "2008-07-22" },
    { id: 3, name: "Phạm Văn Hùng", dob: "2008-05-10" },
    { id: 4, name: "Hoàng Thị Hoa", dob: "2008-02-28" },
    { id: 5, name: "Lê Văn Dũng", dob: "2008-08-12" },
    { id: 6, name: "Vũ Thị Trang", dob: "2008-04-05" },
    { id: 7, name: "Đặng Quốc Hùng", dob: "2007-09-12" },
    { id: 8, name: "Phạm Thu Hà", dob: "2007-10-21" },
];

const ITEMS_PER_PAGE = 6;

const mockClasses = [
    {
        id: 1,
        name: "10A1",
        grade: "Khối 10",
        year: "2024-2025",
        teacher: "Trần Thị Hương",
        students: 35,
        diemTong: 8.5,
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
        subjects: ["Toán", "Vật lý", "Hóa học", "Ngữ văn", "Tiếng Anh"],
    },
];

export default function ClassDetailSection() {
    const { classId } = useParams();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const classData = mockClasses.find((c) => String(c.id) === String(classId)) || null;

    const filteredStudents = useMemo(() => {
        if (!searchTerm) return mockStudents;
        return mockStudents.filter((student) =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredStudents.length / ITEMS_PER_PAGE)), [filteredStudents]);

    const paginatedStudents = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredStudents.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredStudents, currentPage]);

    const goPrevPage = () => {
        setCurrentPage((prev) => Math.max(1, prev - 1));
    };

    const goNextPage = () => {
        setCurrentPage((prev) => Math.min(totalPages, prev + 1));
    };

    const handleEditStudent = (studentId) => {
        console.log("Edit student:", studentId);
    };

    const handleSoftDelete = (studentId) => {
        console.log("Soft delete student:", studentId);
    };

    if (!classData) {
        return (
            <div className="class-detail-page">
                <button className="back-btn" onClick={() => navigate("/admin/classes")}>
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
            {/* Header Section */}
            <div className="class-detail-header">
                <div className="class-detail-top">
                    <button className="back-btn" onClick={() => navigate("/admin/classes")}>
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
                    <div className="info-item">
                        <span className="info-label">Điểm rèn luyện</span>
                        <span className="info-value score">{classData.diemTong}</span>
                    </div>
                </div>
            </div>

            {/* Students Section */}
            <div className="students-section">
                <div className="section-header">
                    <h2>Danh sách học sinh</h2>
                    <div className="search-box">
                        <FiSearch />
                        <input
                            type="text"
                            placeholder="Tìm kiếm học sinh..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-wrapper">
                    <table className="students-table">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>HỌC SINH</th>
                                <th>NGÀY SINH</th>
                                <th>THAO TÁC</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedStudents.map((student, index) => (
                                <tr key={student.id}>
                                    <td className="student-index-cell">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                    <td>
                                        <div className="student-main-info">
                                            <span className="student-avatar">
                                                {student.name.charAt(0).toUpperCase()}
                                            </span>
                                            <div className="student-name-wrap">
                                                <strong>{student.name}</strong>
                                                <small>Ngày sinh: {student.dob}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="student-date-cell">{student.dob}</td>
                                    <td className="student-actions-cell">
                                        <div className="student-row-actions">
                                            <button
                                                className="student-action-btn edit"
                                                onClick={() => handleEditStudent(student.id)}
                                                title="Sửa học sinh"
                                                aria-label="Sửa học sinh"
                                            >
                                                <FiEdit2 />
                                            </button>
                                            <button
                                                className="student-action-btn delete"
                                                onClick={() => handleSoftDelete(student.id)}
                                                title="Ẩn học sinh"
                                                aria-label="Ẩn học sinh"
                                            >
                                                <FiUserX />
                                            </button>
                                        </div>
                                    </td>
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
                        <button
                            className="page-btn"
                            onClick={goPrevPage}
                            disabled={currentPage === 1}
                            aria-label="Trang trước"
                        >
                            <FiChevronLeft />
                        </button>

                        <div className="page-indicator">
                            <span>{currentPage}</span>
                            <small>/ {totalPages}</small>
                        </div>

                        <button
                            className="page-btn"
                            onClick={goNextPage}
                            disabled={currentPage === totalPages}
                            aria-label="Trang sau"
                        >
                            <FiChevronRight />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}