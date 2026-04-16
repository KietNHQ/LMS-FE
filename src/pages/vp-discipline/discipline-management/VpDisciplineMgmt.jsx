import { useState } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { FiPlus, FiFilter, FiDownload, FiAlertOctagon } from "react-icons/fi";
import { toast } from "react-toastify";
import "./VpDisciplineMgmt.css";

export default function VpDisciplineMgmt() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [showAddForm, setShowAddForm] = useState(false);
    
    // Mock Data
    const [incidents, setIncidents] = useState([
        { id: 1, student: "Nguyễn Văn A", class: "10A1", type: "Vắng không phép", level: "med", date: "15/10/2026", reporter: "GV. Trần Y" },
        { id: 2, student: "Lê Thị B", class: "11A5", type: "Sử dụng điện thoại", level: "low", date: "15/10/2026", reporter: "Lớp trưởng" },
        { id: 3, student: "Trần Minh C", class: "12A2", type: "Đánh nhau", level: "high", date: "14/10/2026", reporter: "Giám thị 01" },
        { id: 4, student: "Hoàng D", class: "10A1", type: "Vắng không phép", level: "med", date: "14/10/2026", reporter: "GV. Trần Y" },
    ]);

    const topClasses = [
        { name: "10A1", count: 12 },
        { name: "12A2", count: 8 },
        { name: "11A5", count: 5 },
    ];

    const popularTypes = [
        { type: "Đi trễ/Vắng măt", count: 45 },
        { type: "Đồng phục/Tác phong", count: 32 },
        { type: "Thiết bị điện tử", count: 15 },
    ];

    const [form, setForm] = useState({ student: "", class: "10A1", type: "Đi trễ", level: "low", comment: "" });

    const handleAddIncident = (e) => {
        e.preventDefault();
        if(!form.student) { toast.error("Vui lòng nhập tên học sinh!"); return; }
        
        const newInc = {
            id: Date.now(),
            student: form.student,
            class: form.class,
            type: form.type,
            level: form.level,
            date: "15/10/2026", // Mock today
            reporter: "PHT Nề nếp (Tôi)"
        };
        setIncidents([newInc, ...incidents]);
        toast.success("Giám sát: Đã ghi nhận vi phạm thành công!");
        setShowAddForm(false);
        setForm({ student: "", class: "10A1", type: "Đi trễ", level: "low", comment: "" });
    };

    return (
        <div className="vp-discipline-mgmt">
            <PageHeader
                title="Quản Lý Nề Nếp & Vi Phạm"
                eyebrow="Theo dõi và ghi nhận vi phạm toàn trường"
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            <div className="dm-grid">
                {/* Main Content: Table + Add Form */}
                <div className="dm-panel">
                    <div className="dm-header">
                        <div className="dm-filter">
                            <select className="dm-select">
                                <option>Tất cả các lớp</option>
                                <option>Khối 10</option>
                                <option>Khối 11</option>
                            </select>
                            <input type="date" className="dm-input" />
                            <button className="btn-secondary"><FiFilter /> Lọc</button>
                        </div>
                        <div style={{display:'flex', gap: '0.5rem'}}>
                            <button className="btn-secondary"><FiDownload /> Xuất báo cáo</button>
                            <button className="btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
                                <FiPlus /> Ghi nhận vi phạm
                            </button>
                        </div>
                    </div>

                    {showAddForm && (
                        <form className="add-form" onSubmit={handleAddIncident}>
                            <h4 style={{margin: '0 0 0.5rem', color: '#dc2626'}}>Ghi nhận vi phạm mới</h4>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: '1rem'}}>
                                <input className="dm-input" placeholder="Tên hoặc Mã Học sinh *" value={form.student} onChange={e=>setForm({...form, student: e.target.value})}/>
                                <select className="dm-select" value={form.class} onChange={e=>setForm({...form, class: e.target.value})}>
                                    <option value="10A1">10A1</option>
                                    <option value="11A5">11A5</option>
                                    <option value="12A2">12A2</option>
                                </select>
                                <select className="dm-select" value={form.type} onChange={e=>setForm({...form, type: e.target.value})}>
                                    <option value="Đi trễ">Đi trễ</option>
                                    <option value="Vắng không phép">Vắng không phép</option>
                                    <option value="Sử dụng điện thoại">Sử dụng điện thoại</option>
                                    <option value="Đánh nhau">Đánh nhau / Gây gổ</option>
                                </select>
                                <select className="dm-select" value={form.level} onChange={e=>setForm({...form, level: e.target.value})}>
                                    <option value="low">Mức độ nhẹ (Nhắc nhở)</option>
                                    <option value="med">Mức độ vừa (Cảnh cáo, ghi sổ)</option>
                                    <option value="high">Mức độ nghiêm trọng (Mời phụ huynh)</option>
                                </select>
                            </div>
                            <input className="dm-input" placeholder="Mô tả cụ thể (Không bắt buộc)" value={form.comment} onChange={e=>setForm({...form, comment: e.target.value})}/>
                            <div style={{textAlign: 'right'}}>
                                <button type="button" className="btn-secondary" style={{marginRight: '0.5rem'}} onClick={() => setShowAddForm(false)}>Hủy</button>
                                <button type="submit" className="btn-primary">Lưu Vi Phạm</button>
                            </div>
                        </form>
                    )}

                    <div className="dm-table-wrap">
                        <table className="dm-table">
                            <thead>
                                <tr>
                                    <th>Học sinh</th>
                                    <th>Lớp</th>
                                    <th>Loại Vi Phạm</th>
                                    <th>Mức Độ</th>
                                    <th>Thời Gian</th>
                                    <th>Người ghi nhận</th>
                                </tr>
                            </thead>
                            <tbody>
                                {incidents.map(inc => (
                                    <tr key={inc.id}>
                                        <td><strong>{inc.student}</strong></td>
                                        <td>{inc.class}</td>
                                        <td>{inc.type}</td>
                                        <td>
                                            <span className={`level-badge ${inc.level}`}>
                                                {inc.level === 'high' ? 'Nghiêm trọng' : (inc.level === 'med' ? 'Vừa' : 'Nhẹ')}
                                            </span>
                                        </td>
                                        <td>{inc.date}</td>
                                        <td>{inc.reporter}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                    <div className="dm-panel">
                        <h4 style={{margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e293b'}}>
                            <FiAlertOctagon color="#dc2626"/> Top Lớp vi phạm tuần này
                        </h4>
                        <div className="top-violators-list">
                            {topClasses.map((cls, i) => (
                                <div className="violator-item" key={i}>
                                    <div className="v-info">
                                        <strong>Lớp {cls.name}</strong>
                                        <span>Gồm 4 lượt vắng, 8 đi trễ</span>
                                    </div>
                                    <div className="v-count">{cls.count} Lỗi</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="dm-panel">
                        <h4 style={{margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e293b'}}>
                            Phân bổ Lỗi vi phạm (Tháng)
                        </h4>
                        <div className="top-violators-list">
                            {popularTypes.map((pt, i) => (
                                <div className="violator-item" key={i} style={{paddingBottom: '0.5rem'}}>
                                    <div className="v-info">
                                        <strong style={{fontWeight: 500, fontSize: '0.85rem'}}>{pt.type}</strong>
                                    </div>
                                    <span style={{fontSize: '0.85rem', color: '#64748b'}}>{pt.count} vụ</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
