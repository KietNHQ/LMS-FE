import { useState } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { FiDownload, FiCheckCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import "./AcademicStaffAcademicRecords.css";

export default function AcademicStaffAcademicRecords() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [selectedStudent, setSelectedStudent] = useState(null);

    const students = [
        { id: "HS10A1_01", name: "Nguyễn Trung Hiếu" },
        { id: "HS10A1_02", name: "Trần Mai Anh" },
    ];

    const grades = [
        { subject: "Toán Học", hw: 8.5, test15: 9.0, mid: 8.0, final: 8.5, gpa: 8.4 },
        { subject: "Ngữ Văn", hw: 7.0, test15: 7.5, mid: 7.0, final: 7.5, gpa: 7.3 },
        { subject: "Vật Lý", hw: null, test15: null, mid: null, final: null, gpa: null }, // chua nhap
        { subject: "Hóa Học", hw: 4.0, test15: 5.0, mid: 4.5, final: 4.0, gpa: 4.3 },
    ];

    return (
        <div className="academic-records">
            <PageHeader
                title="Quản Lý Học Bạ"
                eyebrow="Theo dõi điểm số và xuất hồ sơ học tập"
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            <div className="records-grid">
                <div className="records-sidebar">
                    <div className="rs-header">
                        <h3>Chọn Lớp / Tìm Kiếm</h3>
                        <select className="rs-select">
                            <option value="10A1">Lớp 10A1</option>
                            <option value="10A2">Lớp 10A2</option>
                        </select>
                    </div>
                    <div className="student-list">
                        {students.map(s => (
                            <div 
                                key={s.id} 
                                className={`student-item ${selectedStudent?.id === s.id ? 'active' : ''}`}
                                onClick={() => setSelectedStudent(s)}
                            >
                                <div className="si-name">{s.name}</div>
                                <div className="si-id">{s.id}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="records-content">
                    {!selectedStudent ? (
                        <div className="rc-placeholder">
                            Bấm chọn một học sinh để hiển thị điểm và học bạ chi tiết
                        </div>
                    ) : (
                        <>
                            <div className="rc-header">
                                <div className="rc-student-info">
                                    <h2>{selectedStudent.name}</h2>
                                    <p>Mã HS: {selectedStudent.id} | Lớp: 10A1 | Trạng thái: Đang học</p>
                                </div>
                                <div style={{display:'flex', gap: '0.5rem'}}>
                                    <button className="btn-secondary" onClick={() => toast.success("Đã khóa sổ học bạ")}>
                                        <FiCheckCircle /> Khóa Học Bạ
                                    </button>
                                    <button className="btn-primary" onClick={() => toast.info("Đang in PDF...")}>
                                        <FiDownload /> In Bảng Điểm
                                    </button>
                                </div>
                            </div>
                            
                            <div className="table-wrap">
                                <table className="grades-table">
                                    <thead>
                                        <tr>
                                            <th>Môn Học</th>
                                            <th>Miệng/15p</th>
                                            <th>1 Tiết</th>
                                            <th>Giữa Kỳ</th>
                                            <th>Cuối Kỳ</th>
                                            <th>Trung Bình Môn</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {grades.map(g => (
                                            <tr key={g.subject}>
                                                <td><strong>{g.subject}</strong></td>
                                                <td>{g.hw || '-'}</td>
                                                <td>{g.test15 || '-'}</td>
                                                <td>{g.mid || '-'}</td>
                                                <td>{g.final || '-'}</td>
                                                <td>
                                                    <span className={`grade-val ${g.gpa < 5 && g.gpa !== null ? 'danger' : ''}`}>
                                                        {g.gpa || <span style={{color: '#dc2626'}}>Chưa có điểm</span>}
                                                    </span>
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
        </div>
    );
}
