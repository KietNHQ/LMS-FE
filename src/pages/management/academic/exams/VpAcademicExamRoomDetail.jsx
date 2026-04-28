import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiSearch, FiFilePlus, FiDownload, FiTrash2, FiEdit3, FiUser, FiHome, FiBookOpen, FiUsers, FiPlus, FiFilter, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { Button, Input, Select, Modal, Pagination } from "../../../../components/ui";
import { toast } from "react-toastify";
import "./VpAcademicExamRoomDetail.css";

export default function VpAcademicExamRoomDetail() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [classFilter, setClassFilter] = useState("all");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [pickerSearchTerm, setPickerSearchTerm] = useState("");
    const [pickerSortOrder, setPickerSortOrder] = useState("asc");
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Mock data for the room (normally fetched by roomId)
    const roomInfo = {
        name: roomId?.toUpperCase() || "PHÒNG 101",
        subject: "Ngữ văn",
        supervisors: ["Nguyễn Văn A", "Trần Thị B"],
        totalStudents: 30
    };

    const CLASSES_LIST = [
        { value: "all", label: "Tất cả lớp" },
        { value: "12A1", label: "Lớp 12A1" },
        { value: "12A2", label: "Lớp 12A2" },
        { value: "12A3", label: "Lớp 12A3" },
    ];

    // Master database of all students in the school (for auto-filling)
    const MASTER_STUDENTS = [
        { id: "HS001", name: "Nguyễn Hoàng Nam", class: "12A1", parentPhone: "0901234567", teacher: "Cô Mai" },
        { id: "HS002", name: "Trần Thị Thu Thủy", class: "12A1", parentPhone: "0907654321", teacher: "Cô Mai" },
        { id: "HS003", name: "Lê Văn Tùng", class: "12A2", parentPhone: "0912345678", teacher: "Thầy Hùng" },
        { id: "HS004", name: "Phạm Minh Hoàng", class: "12A2", parentPhone: "0918765432", teacher: "Thầy Hùng" },
        { id: "HS005", name: "Vũ Phương Anh", class: "12A3", parentPhone: "0934567890", teacher: "Cô Lan" },
        { id: "HS006", name: "Hoàng Đức Anh", class: "12A1", parentPhone: "0909998887", teacher: "Cô Mai" },
        { id: "HS007", name: "Phan Thanh Trà", class: "12A2", parentPhone: "0917776665", teacher: "Thầy Hùng" },
        { id: "HS008", name: "Bùi Tuyết Mai", class: "12A3", parentPhone: "0988123456", teacher: "Cô Lan", assignedRoom: "Phòng 102" },
        { id: "HS009", name: "Đặng Quang Huy", class: "12A1", parentPhone: "0977112233", teacher: "Cô Mai", assignedRoom: "Phòng 105" },
        { id: "HS010", name: "Hoàng Minh Quân", class: "12A2", parentPhone: "0966445566", teacher: "Thầy Hùng" },
        { id: "HS011", name: "Trần Bảo Ngọc", class: "12A3", parentPhone: "0955334455", teacher: "Cô Lan" },
        { id: "HS012", name: "Vũ Gia Bảo", class: "12A1", parentPhone: "0944223344", teacher: "Cô Mai" },
    ];

    // Mock data for students currently in THIS room
    const [students, setStudents] = useState(MASTER_STUDENTS.slice(0, 5));

    const handleDownloadTemplate = () => {
        toast.info("Đang tải xuống file Excel mẫu...");
    };

    const handleImportExcel = () => {
        toast.success("Đang xử lý file Excel... Nhập danh sách học sinh thành công!");
    };

    const handleConfirmAdd = () => {
        if (selectedStudentIds.length === 0) {
            toast.warning("Vui lòng chọn ít nhất một học sinh!");
            return;
        }

        const currentCount = students.length;
        const addCount = selectedStudentIds.length;
        const maxCapacity = roomInfo.totalStudents;

        if (currentCount + addCount > maxCapacity) {
            toast.error(`Vượt quá sĩ số! Phòng chỉ còn ${maxCapacity - currentCount} chỗ trống (Tối đa ${maxCapacity} học sinh).`);
            return;
        }

        const newOnes = MASTER_STUDENTS.filter(s => selectedStudentIds.includes(s.id));
        setStudents(prev => [...prev, ...newOnes]);
        setIsAddModalOpen(false);
        setSelectedStudentIds([]);
        setPickerSearchTerm("");
        toast.success(`Đã thêm ${newOnes.length} học sinh vào phòng thi.`);
    };

    const toggleSelectStudent = (id) => {
        const student = MASTER_STUDENTS.find(s => s.id === id);
        if (student?.assignedRoom) {
            toast.warning(`Học sinh này đã được xếp vào ${student.assignedRoom}`);
            return;
        }
        setSelectedStudentIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleSelectAllVisible = () => {
        const selectableIds = availableStudents
            .filter(s => !s.assignedRoom)
            .map(s => s.id);
        
        if (selectableIds.length === 0) return;

        const currentCount = students.length;
        const maxCapacity = roomInfo.totalStudents;
        const remainingSpots = maxCapacity - currentCount;

        const allAlreadySelected = selectableIds.every(id => selectedStudentIds.includes(id));
        
        if (allAlreadySelected) {
            setSelectedStudentIds(prev => prev.filter(id => !selectableIds.includes(id)));
        } else {
            // Check if adding all would exceed capacity
            if (selectableIds.length > remainingSpots) {
                const limitedIds = selectableIds.slice(0, remainingSpots);
                setSelectedStudentIds(prev => [...new Set([...prev, ...limitedIds])]);
                toast.warning(`Chỉ chọn ${remainingSpots} học sinh đầu tiên để không vượt quá sĩ số ${maxCapacity}.`);
            } else {
                setSelectedStudentIds(prev => [...new Set([...prev, ...selectableIds])]);
            }
        }
    };

    const handleDeleteStudent = (id) => {
        setStudents(prev => prev.filter(s => s.id !== id));
        toast.success("Đã xóa học sinh khỏi phòng thi.");
    };

    const filteredStudents = students
        .filter(s => {
            const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 s.id.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesClass = classFilter === "all" || s.class === classFilter;
            return matchesSearch && matchesClass;
        })
        .sort((a, b) => {
            const nameA = a.name.split(' ').pop();
            const nameB = b.name.split(' ').pop();
            return nameA.localeCompare(nameB, 'vi', { sensitivity: 'base' });
        });

    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const paginatedStudents = filteredStudents.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset to page 1 when filtering
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleClassChange = (e) => {
        setClassFilter(e.target.value);
        setCurrentPage(1);
    };

    // Students available to be added (not already in room)
    const availableStudents = MASTER_STUDENTS
        .filter(s => !students.find(curr => curr.id === s.id))
        .filter(s => {
            const nameParts = s.name.split(' ');
            const firstName = nameParts[nameParts.length - 1]; 
            
            const matchesSearch = firstName.toLowerCase().startsWith(pickerSearchTerm.toLowerCase()) || 
                                 s.id.toLowerCase().includes(pickerSearchTerm.toLowerCase());
            return matchesSearch;
        })
        .sort((a, b) => {
            const nameA = a.name.split(' ').pop();
            const nameB = b.name.split(' ').pop();
            const comparison = nameA.localeCompare(nameB, 'vi', { sensitivity: 'base' });
            return pickerSortOrder === "asc" ? comparison : -comparison;
        });

    return (
        <div className="vpa-room-detail">
            {/* Header */}
            <div className="vpa-detail-header">
                <button className="back-btn" onClick={() => navigate("/vp-academic/exams/rooms")}>
                    <FiArrowLeft /> Quay lại
                </button>
                <div className="header-info">
                    <h1>Chi tiết {roomInfo.name}</h1>
                    <span className="exam-name">Thi Giữa Học Kỳ II - Khối 12</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="vpa-rooms-stats" style={{ marginBottom: '2rem' }}>
                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#34d39920', color: '#34d399' }}>
                        <FiBookOpen />
                    </div>
                    <div className="stat-details">
                        <span className="label">Môn thi</span>
                        <span className="value" style={{ fontSize: '1.2rem' }}>{roomInfo.subject}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#3b82f620', color: '#3b82f6' }}>
                        <FiUser />
                    </div>
                    <div className="stat-details">
                        <span className="label">Giám thị</span>
                        <span className="value" style={{ fontSize: '1.2rem' }}>{roomInfo.supervisors.length}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#8b5cf620', color: '#8b5cf6' }}>
                        <FiUsers />
                    </div>
                    <div className="stat-details">
                        <span className="label">Tổng thí sinh</span>
                        <span className="value" style={{ fontSize: '1.2rem' }}>{students.length}</span>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="vpa-detail-toolbar">
                <div className="toolbar-left">
                    <div className="search-box">
                        <FiSearch />
                        <input 
                            type="text" 
                            placeholder="Tìm học sinh theo mã hoặc tên..." 
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                    <Select 
                        variant="custom"
                        options={CLASSES_LIST}
                        value={classFilter}
                        onChange={handleClassChange}
                        className="class-filter-select"
                        style={{ width: '180px' }}
                    />
                </div>
                <div className="toolbar-right">
                    <Button className="vpa-btn-secondary" onClick={() => setIsAddModalOpen(true)}>
                        <FiPlus /> Thêm học sinh
                    </Button>
                    <Button className="vpa-btn-ghost" onClick={handleDownloadTemplate}>
                        <FiDownload /> Tải mẫu
                    </Button>
                    <Button className="vpa-btn-primary" onClick={handleImportExcel}>
                        <FiFilePlus /> Nhập Excel
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="student-table-wrapper">
                <table className="vpa-student-table">
                    <thead>
                        <tr>
                            <th>Mã học sinh</th>
                            <th>Họ và tên</th>
                            <th>Lớp</th>
                            <th>SĐT Phụ huynh</th>
                            <th>Giáo viên chủ nhiệm</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedStudents.length > 0 ? (
                            paginatedStudents.map((student) => (
                                <tr key={student.id}>
                                    <td><span className="student-id">{student.id}</span></td>
                                    <td><span className="student-name">{student.name}</span></td>
                                    <td>{student.class}</td>
                                    <td><span className="phone-cell">{student.parentPhone}</span></td>
                                    <td><span className="teacher-cell">{student.teacher}</span></td>
                                    <td>
                                        <div className="actions-cell">
                                            <button 
                                                className="btn-icon-table delete" 
                                                title="Xóa"
                                                onClick={() => handleDeleteStudent(student.id)}
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                    Không tìm thấy học sinh nào trong phòng này.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="vpa-pagination-wrapper" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}

            {/* Modal Picker Student */}
            <Modal 
                open={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)}
                title="Chọn học sinh thêm vào phòng"
                className="vpa-exam-room-modal"
                width="800px"
            >
                <div className="vpa-picker-container">
                    <div className="picker-toolbar">
                        <div className="picker-search">
                            <FiSearch />
                            <input 
                                type="text" 
                                placeholder="Tìm theo tên hoặc mã học sinh..." 
                                value={pickerSearchTerm}
                                onChange={(e) => setPickerSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button 
                            variant="outline" 
                            onClick={() => setPickerSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                            style={{ gap: '0.5rem', whiteSpace: 'nowrap' }}
                        >
                            {pickerSortOrder === "asc" ? <FiChevronUp /> : <FiChevronDown />}
                            Tên: {pickerSortOrder === "asc" ? "A → Z" : "Z → A"}
                        </Button>
                    </div>

                    <div className="picker-table-wrapper">
                        <table className="vpa-student-table picker-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}>
                                        <input 
                                            type="checkbox" 
                                            onChange={handleSelectAllVisible}
                                            checked={
                                                availableStudents.filter(s => !s.assignedRoom).length > 0 && 
                                                availableStudents.filter(s => !s.assignedRoom).every(s => selectedStudentIds.includes(s.id))
                                            }
                                        />
                                    </th>
                                    <th>Mã HS</th>
                                    <th>Họ và tên</th>
                                    <th>Lớp</th>
                                    <th>GV Chủ nhiệm</th>
                                </tr>
                            </thead>
                            <tbody>
                                {availableStudents.length > 0 ? (
                                    availableStudents.map(student => (
                                        <tr 
                                            key={student.id} 
                                            onClick={() => toggleSelectStudent(student.id)} 
                                            style={{ 
                                                cursor: student.assignedRoom ? 'not-allowed' : 'pointer',
                                                opacity: student.assignedRoom ? 0.5 : 1,
                                                background: student.assignedRoom ? '#f8fafc' : ''
                                            }}
                                        >
                                            <td>
                                                {!student.assignedRoom && (
                                                    <input 
                                                        type="checkbox" 
                                                        checked={selectedStudentIds.includes(student.id)}
                                                        onChange={() => {}} 
                                                    />
                                                )}
                                            </td>
                                            <td className="student-id">{student.id}</td>
                                            <td className="student-name">
                                                {student.name}
                                                {student.assignedRoom && (
                                                    <span className="assigned-badge">
                                                        {student.assignedRoom}
                                                    </span>
                                                )}
                                            </td>
                                            <td>{student.class}</td>
                                            <td>{student.teacher}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                                            Không có học sinh phù hợp hoặc tất cả đã được thêm.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="picker-footer">
                        <span className="selected-count">Đã chọn: <strong>{selectedStudentIds.length}</strong> học sinh</span>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Hủy</Button>
                            <Button className="vpa-btn-primary" onClick={handleConfirmAdd}>Xác nhận thêm</Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
