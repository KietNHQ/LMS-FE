import { useState } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { FiAward, FiAlertCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import "./VpDisciplineConduct.css";

export default function VpDisciplineConduct() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    
    // Mock Data
    const [students, setStudents] = useState([
        { id: "HS001", name: "Nguyễn Văn A", class: "10A1", viol: 0, grade: "Tốt", suggest: null },
        { id: "HS002", name: "Lê Thị B", class: "10A1", viol: 2, grade: "Khá", suggest: null },
        { id: "HS003", name: "Trần Minh C", class: "10A2", viol: 8, grade: "Tốt", suggest: "Nhiều vi phạm -> Đề xuất: Trung bình" },
        { id: "HS004", name: "Hoàng D", class: "10A2", viol: 15, grade: "Trung bình", suggest: "Quá nhiều vi phạm -> Đề xuất: Yếu" },
    ]);

    const handleGradeChange = (id, newGrade) => {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, grade: newGrade } : s));
        toast.success("Đã cập nhật hạnh kiểm");
    };

    const getGradeClass = (grade) => {
        if(grade === "Tốt") return "tot";
        if(grade === "Khá") return "kha";
        if(grade === "Trung bình") return "tb";
        return "yeu";
    };

    return (
        <div className="vp-conduct">
            <PageHeader
                title="Đánh Giá Hạnh Kiểm"
                eyebrow="Xét duyệt và quản lý hạnh kiểm học sinh"
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            <div className="conduct-toolbar">
                <div className="conduct-filter">
                    <select className="cd-select">
                        <option value="10A1">Lớp 10A1</option>
                        <option value="10A2">Lớp 10A2</option>
                        <option value="11A5">Lớp 11A5</option>
                    </select>
                    <input type="text" className="cd-search" placeholder="Tìm kiếm tên học sinh..." />
                </div>
                <button className="btn-primary">
                    Lưu Toàn Bộ Đánh Giá
                </button>
            </div>

            <div className="conduct-panel">
                <div className="conduct-panel-header">
                    <h3><FiAward /> Danh sách Đánh giá Hạnh Kiểm Lớp 10A1</h3>
                    <span style={{fontSize: '0.85rem', color: '#64748b', fontWeight: 'normal'}}>
                        Hệ thống tự động đưa ra gợi ý dựa vào số lần vi phạm kỷ luật.
                    </span>
                </div>
                
                <div className="cd-table-wrap">
                    <table className="cd-table">
                        <thead>
                            <tr>
                                <th>Học sinh</th>
                                <th>Lớp</th>
                                <th>Số lỗi vi phạm (Kỳ này)</th>
                                <th>Hạnh kiểm (GVCN đề xuất)</th>
                                <th>Gợi ý từ Hệ thống</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(s => (
                                <tr key={s.id}>
                                    <td><strong>{s.name}</strong></td>
                                    <td>{s.class}</td>
                                    <td>{s.viol} lỗi</td>
                                    <td>
                                        <select 
                                            className={`grade-select ${getGradeClass(s.grade)}`}
                                            value={s.grade}
                                            onChange={(e) => handleGradeChange(s.id, e.target.value)}
                                        >
                                            <option value="Tốt">Tốt</option>
                                            <option value="Khá">Khá</option>
                                            <option value="Trung bình">Trung bình</option>
                                            <option value="Yếu">Yếu</option>
                                        </select>
                                    </td>
                                    <td>
                                        {s.suggest && (
                                            <div className="suggestion">
                                                <FiAlertCircle /> {s.suggest}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
