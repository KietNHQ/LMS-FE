import { useState } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { 
    FiBookOpen, FiUserPlus, FiUserCheck, FiArrowRight, 
    FiCheck, FiRepeat, FiFileText, FiFilter, FiDownload 
} from "react-icons/fi";
import { toast } from "react-toastify";
import "./AcademicStaffClassMgmt.css";

export default function AcademicStaffClassMgmt() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [activeTab, setActiveTab] = useState("class-list");

    // === MOCK DATA ===
    const mockClasses = [
        { id: "10A1", grade: "10", studentsCount: 42, homeroomTeacher: "Nguyễn Văn A" },
        { id: "10A2", grade: "10", studentsCount: 40, homeroomTeacher: "Trần Thị B" },
        { id: "11A1", grade: "11", studentsCount: 38, homeroomTeacher: "Chưa phân công" },
        { id: "12A5", grade: "12", studentsCount: 35, homeroomTeacher: "Lê Văn C" },
    ];

    const [admissions, setAdmissions] = useState([
        { id: "TS001", name: "Đặng Tiến Dũng", score: 42.5, status: "Trúng tuyển", phone: "0912xxx888" },
        { id: "TS002", name: "Lê Mai Chi", score: 41.0, status: "Đã nhập học", phone: "0988xxx777" },
        { id: "TS003", name: "Hoàng Gia Bảo", score: 39.5, status: "Đang chờ", phone: "0904xxx666" },
        { id: "TS004", name: "Trần Ngọc Diệp", score: 43.0, status: "Trúng tuyển", phone: "0977xxx555" },
    ]);

    const [transfers, setTransfers] = useState([
        { id: "CT001", name: "Phạm Anh Khoa", type: "Đến", fromSchool: "THPT Chu Văn An", status: "Hoàn tất" },
        { id: "CT002", name: "Bùi Tuyết Mai", type: "Đi", toSchool: "THPT Phan Đình Phùng", status: "Đang xử lý" },
    ]);

    // Xếp lớp states
    const [unassignedStudents, setUnassignedStudents] = useState([
        { id: "HS101", name: "Ngô Minh Tú", targetGrade: "10" },
        { id: "HS102", name: "Lý Hải Anh", targetGrade: "10" },
        { id: "HS103", name: "Phạm Bình Minh", targetGrade: "11" },
    ]);
    const [targetClassAssigned, setTargetClassAssigned] = useState([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);
    const [selectedTargetClass, setSelectedTargetClass] = useState("10A1");

    // === HANDLERS ===
    const handleToggleStudent = (id) => {
        setSelectedStudentIds(prev => 
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleAssignToClass = () => {
        if (selectedStudentIds.length === 0) {
            toast.warning("Vui lòng chọn ít nhất 1 học sinh.");
            return;
        }
        const studentsToMove = unassignedStudents.filter(s => selectedStudentIds.includes(s.id));
        setTargetClassAssigned([...targetClassAssigned, ...studentsToMove]);
        setUnassignedStudents(unassignedStudents.filter(s => !selectedStudentIds.includes(s.id)));
        setSelectedStudentIds([]);
        toast.success(`Đã xếp ${studentsToMove.length} học sinh vào lớp ${selectedTargetClass}`);
    };

    return (
        <div className="academic-class-mgmt">
            <PageHeader
                title="Quản lý Lớp & Tuyển sinh"
                eyebrow="Tổ chức nhân sự và điều phối đầu vào học sinh"
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            <div className="mgmt-tabs">
                <button className={`mgmt-tab-btn ${activeTab === 'class-list' ? 'active' : ''}`} onClick={() => setActiveTab('class-list')}>
                    <FiBookOpen /> Quản lý lớp
                </button>
                <button className={`mgmt-tab-btn ${activeTab === 'admissions' ? 'active' : ''}`} onClick={() => setActiveTab('admissions')}>
                    <FiUserPlus /> Tuyển sinh lớp 10
                </button>
                <button className={`mgmt-tab-btn ${activeTab === 'transfers' ? 'active' : ''}`} onClick={() => setActiveTab('transfers')}>
                    <FiRepeat /> Chuyển trường
                </button>
                <button className={`mgmt-tab-btn ${activeTab === 'assign-students' ? 'active' : ''}`} onClick={() => setActiveTab('assign-students')}>
                    <FiUserCheck /> Xếp lớp
                </button>
            </div>

            <div className="mgmt-content">
                {/* 1. TRANG CHỦ LỚP HỌC */}
                {activeTab === 'class-list' && (
                    <div className="mgmt-section-animate">
                        <div className="mgmt-header">
                            <h3>Danh sách các lớp hiện tại</h3>
                            <div className="header-actions">
                                <button className="btn-secondary"><FiDownload /> Xuất báo cáo</button>
                                <button className="btn-primary">+ Tạo lớp mới</button>
                            </div>
                        </div>
                        <div className="mgmt-table-wrap">
                            <table className="mgmt-table">
                                <thead>
                                    <tr>
                                        <th>Tên Lớp</th>
                                        <th>Khối</th>
                                        <th>Sĩ số</th>
                                        <th>Giáo viên Chủ Nhiệm</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockClasses.map(cls => (
                                        <tr key={cls.id}>
                                            <td><strong>{cls.id}</strong></td>
                                            <td>Khối {cls.grade}</td>
                                            <td>{cls.studentsCount} HS</td>
                                            <td>{cls.homeroomTeacher}</td>
                                            <td><button className="btn-mini">Chi tiết</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 2. TUYỂN SINH LỚP 10 */}
                {activeTab === 'admissions' && (
                    <div className="mgmt-section-animate">
                        <div className="mgmt-header">
                            <h3>Hồ sơ Tuyển sinh Lớp 10 (2026 - 2027)</h3>
                            <div className="header-actions">
                                <button className="btn-secondary"><FiFilter /> Lọc điểm</button>
                                <button className="btn-primary"><FiFileText /> Import từ Sở</button>
                            </div>
                        </div>
                        <div className="mgmt-table-wrap">
                            <table className="mgmt-table">
                                <thead>
                                    <tr>
                                        <th>Mã hồ sơ</th>
                                        <th>Họ và tên</th>
                                        <th>Điểm xét tuyển</th>
                                        <th>Số điện thoại</th>
                                        <th>Trạng thái</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {admissions.map(ts => (
                                        <tr key={ts.id}>
                                            <td>{ts.id}</td>
                                            <td><strong>{ts.name}</strong></td>
                                            <td>{ts.score}</td>
                                            <td>{ts.phone}</td>
                                            <td>
                                                <span className={`status-badge ${ts.status}`}>
                                                    {ts.status}
                                                </span>
                                            </td>
                                            <td><button className="btn-mini">Nhập học</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 3. CHUYỂN TRƯỜNG */}
                {activeTab === 'transfers' && (
                    <div className="mgmt-section-animate">
                        <div className="mgmt-header">
                            <h3>Quản lý Hồ sơ Chuyển đi / Chuyển đến</h3>
                            <button className="btn-primary">+ Tạo mới hồ sơ</button>
                        </div>
                        <div className="mgmt-table-wrap">
                            <table className="mgmt-table">
                                <thead>
                                    <tr>
                                        <th>Học sinh</th>
                                        <th>Loại</th>
                                        <th>Trường liên quan</th>
                                        <th>Trạng thái</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transfers.map((ct, i) => (
                                        <tr key={i}>
                                            <td><strong>{ct.name}</strong></td>
                                            <td>
                                                <span className={`type-tag ${ct.type === 'Đến' ? 'in' : 'out'}`}>
                                                    {ct.type === 'Đến' ? 'Chuyển đến' : 'Chuyển đi'}
                                                </span>
                                            </td>
                                            <td>{ct.fromSchool || ct.toSchool}</td>
                                            <td>{ct.status}</td>
                                            <td><button className="btn-mini">Hồ sơ</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 4. XẾP LỚP */}
                {activeTab === 'assign-students' && (
                    <div className="mgmt-section-animate">
                        <div className="mgmt-header">
                            <h3>Xếp lớp Công cụ phân bổ học sinh</h3>
                        </div>
                        <div className="assignment-split">
                            <div className="split-panel">
                                <h4>Học sinh chưa xếp lớp ({unassignedStudents.length})</h4>
                                <ul className="split-list">
                                    {unassignedStudents.map(student => (
                                        <li key={student.id} onClick={() => handleToggleStudent(student.id)} 
                                            className={selectedStudentIds.includes(student.id) ? 'selected' : ''}>
                                            <strong>{student.name}</strong> 
                                            <span>Khối {student.targetGrade}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="split-controls">
                                <button className="btn-transfer" onClick={handleAssignToClass}><FiArrowRight /></button>
                            </div>
                            <div className="split-panel">
                                <h4>Nhận vào lớp: 
                                    <select value={selectedTargetClass} onChange={e => setSelectedTargetClass(e.target.value)}>
                                        {mockClasses.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                                    </select>
                                </h4>
                                <ul className="split-list">
                                    {targetClassAssigned.map(student => (
                                        <li key={student.id}><FiCheck /> {student.name}</li>
                                    ))}
                                </ul>
                                <div className="panel-footer"><button className="btn-primary">Lưu thay đổi</button></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
