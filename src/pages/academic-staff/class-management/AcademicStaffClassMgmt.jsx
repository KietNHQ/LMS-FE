import { useState } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { FiBookOpen, FiUserPlus, FiUserCheck, FiArrowRight, FiCheck } from "react-icons/fi";
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

    // Xếp lớp states
    const [unassignedStudents, setUnassignedStudents] = useState([
        { id: "HS101", name: "Ngô Minh Tú", targetGrade: "10" },
        { id: "HS102", name: "Lý Hải Anh", targetGrade: "10" },
        { id: "HS103", name: "Phạm Bình Minh", targetGrade: "11" },
        { id: "HS104", name: "Trịnh Thùy Linh", targetGrade: "10" },
    ]);
    const [targetClassAssigned, setTargetClassAssigned] = useState([
        { id: "HS100", name: "Vũ Khánh Thy" } // example already in
    ]);
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);
    const [selectedTargetClass, setSelectedTargetClass] = useState("10A1");

    // Phân công giảng dạy states
    const [teachingAssignments, setTeachingAssignments] = useState([
        { id: 1, className: "10A1", subject: "Toán", teacher: "GV_Toan_01" },
        { id: 2, className: "10A1", subject: "Văn", teacher: "" }, // chua phan cong
        { id: 3, className: "11A1", subject: "Vật Lý", teacher: "GV_Ly_01" },
    ]);

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
        
        // Move students
        const studentsToMove = unassignedStudents.filter(s => selectedStudentIds.includes(s.id));
        setTargetClassAssigned([...targetClassAssigned, ...studentsToMove]);
        setUnassignedStudents(unassignedStudents.filter(s => !selectedStudentIds.includes(s.id)));
        setSelectedStudentIds([]);
        
        toast.success(`Đã xếp ${studentsToMove.length} học sinh vào lớp ${selectedTargetClass}`);
    };

    const handleTeacherChange = (id, newTeacher) => {
        setTeachingAssignments(prev => prev.map(a => 
            a.id === id ? { ...a, teacher: newTeacher } : a
        ));
        toast.success("Đã cập nhật phân công giáo viên");
    };

    return (
        <div className="academic-class-mgmt">
            <PageHeader
                title="Lớp & Giảng Dạy"
                eyebrow="Tổ chức lớp học và phân công chuyên môn"
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
                <button 
                    className={`mgmt-tab-btn ${activeTab === 'class-list' ? 'active' : ''}`}
                    onClick={() => setActiveTab('class-list')}
                >
                    <FiBookOpen /> Quản lý lớp
                </button>
                <button 
                    className={`mgmt-tab-btn ${activeTab === 'assign-students' ? 'active' : ''}`}
                    onClick={() => setActiveTab('assign-students')}
                >
                    <FiUserPlus /> Xếp lớp
                </button>
                <button 
                    className={`mgmt-tab-btn ${activeTab === 'teaching-assignment' ? 'active' : ''}`}
                    onClick={() => setActiveTab('teaching-assignment')}
                >
                    <FiUserCheck /> Phân công giảng dạy
                </button>
            </div>

            <div className="mgmt-content">
                {/* 1. TAB QUẢN LÝ LỚP */}
                {activeTab === 'class-list' && (
                    <>
                        <div className="mgmt-header">
                            <h3>Danh sách các lớp hiện tại</h3>
                            <button className="btn-primary">+ Tạo lớp mới</button>
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
                                            <td>
                                                {cls.homeroomTeacher === "Chưa phân công" ? 
                                                    <span className="teacher-unassigned">Chưa phân công</span> 
                                                    : cls.homeroomTeacher}
                                            </td>
                                            <td><button className="btn-secondary" style={{padding: '0.25rem 0.5rem'}}>Chi tiết</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* 2. TAB XẾP LỚP */}
                {activeTab === 'assign-students' && (
                    <>
                        <div className="mgmt-header">
                            <h3>Công cụ phân bổ học sinh vào lớp</h3>
                        </div>
                        <div className="assignment-split">
                            {/* Nguồn: HS chưa xếp lớp */}
                            <div className="split-panel">
                                <div className="split-panel-header">
                                    <h4>Học sinh chưa xếp lớp ({unassignedStudents.length})</h4>
                                </div>
                                <ul className="split-list">
                                    {unassignedStudents.map(student => (
                                        <li key={student.id} onClick={() => handleToggleStudent(student.id)}>
                                            <input 
                                                type="checkbox" 
                                                checked={selectedStudentIds.includes(student.id)} 
                                                readOnly
                                            />
                                            <div>
                                                <strong>{student.name}</strong> 
                                                <span style={{color: '#64748b', fontSize: '0.8rem', marginLeft: '0.5rem'}}>
                                                    (Đăng ký k{student.targetGrade})
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Nút chuyển */}
                            <div className="split-controls">
                                <button className="btn-transfer" onClick={handleAssignToClass} title="Chuyển vào lớp">
                                    <FiArrowRight />
                                </button>
                            </div>

                            {/* Đích: Chọn lớp */}
                            <div className="split-panel">
                                <div className="split-panel-header">
                                    <h4 style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                                        Lớp nhận: 
                                        <select 
                                            value={selectedTargetClass} 
                                            onChange={e => setSelectedTargetClass(e.target.value)}
                                        >
                                            {mockClasses.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                                        </select>
                                    </h4>
                                </div>
                                <ul className="split-list">
                                    <li style={{background: '#f8fafc', color: '#64748b', fontSize: '0.85rem'}}>Danh sách HS đã thêm (Chưa Lưu)</li>
                                    {targetClassAssigned.map(student => (
                                        <li key={student.id}>
                                            <FiCheck color="#10b981" /> <strong>{student.name}</strong>
                                        </li>
                                    ))}
                                </ul>
                                <div style={{padding: '1rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc', textAlign: 'right'}}>
                                    <button className="btn-primary">Lưu Danh Sách</button>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* 3. TAB PHÂN CÔNG GIẢNG DẠY */}
                {activeTab === 'teaching-assignment' && (
                    <>
                        <div className="mgmt-header">
                            <h3>Phân công Giáo Viên Bộ Môn & Chủ nhiệm</h3>
                            <button className="btn-primary">Lưu Thay Đổi</button>
                        </div>
                        <div className="mgmt-table-wrap">
                            <table className="mgmt-table">
                                <thead>
                                    <tr>
                                        <th>Lớp</th>
                                        <th>Môn Học</th>
                                        <th>Giáo viên phụ trách</th>
                                        <th>Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teachingAssignments.map(assign => (
                                        <tr key={assign.id}>
                                            <td><strong>{assign.className}</strong></td>
                                            <td>{assign.subject}</td>
                                            <td>
                                                <select 
                                                    className="teacher-select"
                                                    value={assign.teacher}
                                                    onChange={e => handleTeacherChange(assign.id, e.target.value)}
                                                >
                                                    <option value="">-- Chọn giáo viên --</option>
                                                    <option value="GV_Toan_01">Nguyễn Văn A (Toán)</option>
                                                    <option value="GV_Van_02">Trần Thị B (Văn)</option>
                                                    <option value="GV_Ly_01">Lê Minh C (Vật lý)</option>
                                                </select>
                                            </td>
                                            <td>
                                                {!assign.teacher ? 
                                                    <span className="teacher-unassigned">Thiếu GV</span> : 
                                                    <span style={{color: '#10b981', fontWeight: 600}}>Đã đủ</span>
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
