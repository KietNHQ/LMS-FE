import { useState } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { FiCheckCircle, FiClock, FiAlertCircle, FiLock, FiDownload, FiEye, FiAlertTriangle } from "react-icons/fi";
import { toast } from "react-toastify";
import "./VpAcademicGrades.css";

export default function VpAcademicGrades() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [selectedClass, setSelectedClass] = useState(null);

    // Mock Status Data for Classes
    const classList = [
        { id: "10A1", grade: "10", studentCount: 42, status: "locked", statusLabel: "Đã chốt sổ", warning: false },
        { id: "10A2", grade: "10", studentCount: 40, status: "pending", statusLabel: "Chờ phê duyệt", warning: false },
        { id: "11A5", grade: "11", studentCount: 38, status: "progress", statusLabel: "Đang nhập (7/12 môn)", warning: true, warnMsg: "Điểm liệt môn Toán" },
        { id: "12A2", grade: "12", studentCount: 35, status: "missing", statusLabel: "Chưa nhập điểm", warning: true, warnMsg: "Trễ deadline 2 ngày" },
    ];

    const getStatusIcon = (status) => {
        switch(status) {
            case 'locked': return <FiLock />;
            case 'pending': return <FiCheckCircle />;
            case 'progress': return <FiClock />;
            case 'missing': return <FiAlertCircle />;
            default: return null;
        }
    };

    // Mock detail data for 10A2
    const studentGrades = [
        { id: "HS001", name: "Nguyễn Văn A", math: 8.5, lit: 7.0, eng: 9.0, phy: 8.0, avg: 8.1 },
        { id: "HS002", name: "Trần Thị B", math: 4.5, lit: 6.5, eng: 5.0, phy: 4.0, avg: 5.0 }, // warning
        { id: "HS003", name: "Lê C", math: null, lit: 8.0, eng: 7.5, phy: null, avg: null }, // missing
    ];

    return (
        <div className="vp-grades">
            <PageHeader
                title="Quản Lý Điểm Số"
                eyebrow="Theo dõi tiến trình nhập điểm và điểm số trung bình các lớp"
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            <div className="grades-layout">
                {/* Lớp Sidebar */}
                <div className="grades-sidebar">
                    <div className="gs-header">
                        <h3>Danh sách Lớp học</h3>
                    </div>
                    <select className="gs-filter">
                        <option>Tất cả khối học</option>
                        <option>Khối 10</option>
                        <option>Khối 11</option>
                        <option>Khối 12</option>
                    </select>

                    <div className="gs-list">
                        {classList.map(cls => (
                            <div 
                                key={cls.id} 
                                className={`class-item ${selectedClass?.id === cls.id ? 'active' : ''}`}
                                onClick={() => setSelectedClass(cls)}
                            >
                                <div className="ci-top">
                                    <strong>{cls.id}</strong>
                                    <span>{cls.studentCount} HS</span>
                                </div>
                                <div className={`ci-status status-${cls.status}`}>
                                    {getStatusIcon(cls.status)} {cls.statusLabel}
                                </div>
                                {cls.warning && (
                                    <div style={{color: '#dc2626', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.2rem', fontWeight: 600}}>
                                        <FiAlertTriangle /> {cls.warnMsg}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chi tiết Lớp */}
                <div className="grades-content">
                    {!selectedClass ? (
                        <div className="gc-placeholder">
                            Bấm chọn một lớp bên trái để xem bảng điểm và tiến độ chi tiết.
                        </div>
                    ) : (
                        <>
                            <div className="gc-header">
                                <div className="gc-title">
                                    <h2>Bảng Điểm Lớp {selectedClass.id}</h2>
                                    <p>Sĩ số: {selectedClass.studentCount} học sinh | Trạng thái: <strong>{selectedClass.statusLabel}</strong></p>
                                </div>
                                <div className="gc-actions">
                                    <button className="btn-secondary" onClick={() => toast.info("Đang tải dữ liệu báo cáo...")}>
                                        <FiDownload /> Tải Bảng Điểm
                                    </button>
                                    {selectedClass.status === 'pending' && (
                                        <button className="btn-primary" onClick={() => toast.success("Đã phê duyệt!")}>
                                            <FiCheckCircle /> Phê duyệt sổ điểm
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div style={{marginBottom: '1rem', padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', color: '#991b1b', fontSize: '0.875rem', display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                                <FiAlertTriangle size={18} /> Lớp đang có nhiều Học sinh bị điểm Khống (Dưới 5). Yêu cầu GVCN nhắc nhở.
                            </div>

                            <div className="gc-table-wrap">
                                <table className="gc-table">
                                    <thead>
                                        <tr>
                                            <th>Mã HS / Họ Tên</th>
                                            <th>Toán</th>
                                            <th>Ngữ Văn</th>
                                            <th>Ngoại Ngữ</th>
                                            <th>Vật Lý</th>
                                            <th>TB Môn</th>
                                            <th>Chi tiết</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {studentGrades.map((s, i) => (
                                            <tr key={i}>
                                                <td>
                                                    <div style={{fontWeight: 500}}>{s.name}</div>
                                                    <div style={{fontSize: '0.75rem', color: '#64748b'}}>{s.id}</div>
                                                </td>
                                                <td className={`score-cell ${s.math === null ? 'missing' : (s.math < 5 ? 'danger' : '')}`}>
                                                    {s.math ?? 'Chưa nhập'}
                                                </td>
                                                <td className={`score-cell ${s.lit === null ? 'missing' : (s.lit < 5 ? 'danger' : '')}`}>
                                                    {s.lit ?? 'Chưa nhập'}
                                                </td>
                                                <td className={`score-cell ${s.eng === null ? 'missing' : (s.eng < 5 ? 'danger' : '')}`}>
                                                    {s.eng ?? 'Chưa nhập'}
                                                </td>
                                                <td className={`score-cell ${s.phy === null ? 'missing' : (s.phy < 5 ? 'danger' : '')}`}>
                                                    {s.phy ?? 'Chưa nhập'}
                                                </td>
                                                <td className={`score-cell ${s.avg === null ? 'missing' : ''}`} style={{background: '#f8fafc'}}>
                                                    {s.avg ?? '---'}
                                                </td>
                                                <td>
                                                    <button className="btn-secondary" style={{padding: '0.35rem 0.6rem'}}>
                                                        <FiEye /> Xem
                                                    </button>
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
