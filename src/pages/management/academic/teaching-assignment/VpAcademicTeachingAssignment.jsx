import { useState } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../../components/common";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import { FiPlusCircle, FiTrash2, FiAlertTriangle, FiBook, FiUserPlus } from "react-icons/fi";
import { toast } from "react-toastify";
import "./VpAcademicTeachingAssignment.css";

export default function VpAcademicTeachingAssignment() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    
    const [assignments, setAssignments] = useState([
        { id: 1, teacher: "Nguyễn Y", subject: "Toán Học", class: "10A1" },
        { id: 2, teacher: "Lê C", subject: "Ngữ Văn", class: "10A1" },
        { id: 3, teacher: "Trần D", subject: "Vật Lý", class: "11A5" },
        { id: 4, teacher: "Nguyễn Y", subject: "Toán Học", class: "10A2" },
    ]);

    const [form, setForm] = useState({ teacher: "", subject: "Toán Học", class: "10A3" });

    const warnings = [
        { desc: "Lớp 10A3 trống môn Hóa học" },
        { desc: "GV Trần D vượt định mức số tiết" },
        { desc: "GV Phạm E chưa có lớp phân công" }
    ];

    const handleAssign = (e) => {
        e.preventDefault();
        if(!form.teacher) {
            toast.error("Vui lòng chọn Giáo viên");
            return;
        }
        const newAssign = { id: Date.now(), ...form };
        setAssignments([newAssign, ...assignments]);
        toast.success("Đã phân công thành công!");
    };

    const handleRemove = (id) => {
        setAssignments(assignments.filter(a => a.id !== id));
        toast.info("Đã xóa phân công");
    };

    return (
        <div className="vp-teaching-assignment">
            <PageHeader
                title="Phân Công Giảng Dạy"
                eyebrow="Tổ chức giáo viên bộ môn cho các lớp học"
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            <div className="ta-layout">
                {/* ── Main List ── */}
                <div className="ta-panel">
                    <div className="ta-header">
                        <h3>Danh sách Phân Công Lớp Hiện Tại</h3>
                        <div className="ta-filter">
                            <select className="ta-select">
                                <option>Tất cả Tổ bộ môn</option>
                                <option>Tổ Toán - Tin</option>
                                <option>Tổ Khoa học Tự nhiên</option>
                            </select>
                            <input type="text" className="ta-select" placeholder="Tìm tên giáo viên..." style={{width: '200px'}} />
                        </div>
                    </div>

                    <div className="ta-table-wrap">
                        <table className="ta-table">
                            <thead>
                                <tr>
                                    <th>Giáo Viên</th>
                                    <th>Môn Giảng Dạy</th>
                                    <th>Lớp Học Phụ Trách</th>
                                    <th style={{textAlign: 'center'}}>Gỡ bỏ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assignments.map(a => (
                                    <tr key={a.id}>
                                        <td><strong>{a.teacher}</strong></td>
                                        <td><span style={{background: 'rgba(5, 150, 105, 0.1)', color: '#059669', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-pill)', fontSize: '0.75rem', fontWeight: 800}}>{a.subject}</span></td>
                                        <td><strong>{a.class}</strong></td>
                                        <td style={{textAlign: 'center'}}>
                                            <button className="btn-remove" onClick={() => handleRemove(a.id)}>
                                                <FiTrash2 />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Sidebar Actions ── */}
                <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                    
                    <form className="assign-form" onSubmit={handleAssign}>
                        <h4><FiUserPlus /> Gán Giáo Viên Mới</h4>
                        <div className="form-grp">
                            <label>Chọn Giáo Viên</label>
                            <select className="ta-select" value={form.teacher} onChange={e => setForm({...form, teacher: e.target.value})}>
                                <option value="">-- Chọn --</option>
                                <option value="Nguyễn Y">Cô Nguyễn Y</option>
                                <option value="Lê C">Thầy Lê C</option>
                                <option value="Phạm E">Thầy Phạm E</option>
                            </select>
                        </div>
                        <div className="form-grp">
                            <label>Chọn Môn học</label>
                            <select className="ta-select" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}>
                                <option value="Toán Học">Toán Học</option>
                                <option value="Ngữ Văn">Ngữ Văn</option>
                                <option value="Hóa Học">Hóa Học</option>
                            </select>
                        </div>
                        <div className="form-grp">
                            <label>Tính vào Lớp</label>
                            <select className="ta-select" value={form.class} onChange={e => setForm({...form, class: e.target.value})}>
                                <option value="10A1">10A1</option>
                                <option value="10A2">10A2</option>
                                <option value="10A3">10A3</option>
                                <option value="11A5">11A5</option>
                            </select>
                        </div>
                        <button type="submit" className="btn-assign">
                            <FiPlusCircle /> Xác nhận Phân Công
                        </button>
                    </form>

                    <div className="ta-alert-box">
                        <h4><FiAlertTriangle /> Cảnh báo Khối lượng Giảng dạy</h4>
                        {warnings.map((w,i) => (
                            <div className="ta-alert-item" key={i}>
                                <span>{w.desc}</span>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
}
