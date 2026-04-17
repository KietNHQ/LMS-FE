import { useState } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { 
    FiCheckCircle, FiClock, FiAlertCircle, FiLock, 
    FiDownload, FiEye, FiAlertTriangle, FiSearch, 
    FiFilter, FiMail, FiBarChart2 
} from "react-icons/fi";
import { toast } from "react-toastify";
import "./VpAcademicGrades.css";

export default function VpAcademicGrades() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [selectedClass, setSelectedClass] = useState(null);
    const [filterGrade, setFilterGrade] = useState("all");

    // Mock Status Data for Classes
    const classList = [
        { id: "10A1", grade: "10", studentCount: 42, status: "locked", statusLabel: "Đã chốt sổ", warning: false },
        { id: "10A2", grade: "10", studentCount: 40, status: "pending", statusLabel: "Chờ phê duyệt", warning: false },
        { id: "11A5", grade: "11", studentCount: 38, status: "progress", statusLabel: "Đang nhập (7/12 môn)", warning: true, warnMsg: "Điểm liệt môn Toán" },
        { id: "12A2", grade: "12", studentCount: 35, status: "missing", statusLabel: "Chưa nhập điểm", warning: true, warnMsg: "Trễ deadline 2 ngày" },
        { id: "12A3", grade: "12", studentCount: 36, status: "locked", statusLabel: "Đã chốt sổ", warning: false },
    ];

    const filteredClasses = filterGrade === "all" 
        ? classList 
        : classList.filter(c => c.grade === filterGrade);

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
        { id: "HS-2026-001", name: "Nguyễn Trung Hiếu", math: 8.5, lit: 7.0, eng: 9.0, phy: 8.0, avg: 8.1 },
        { id: "HS-2026-002", name: "Trần Mai Anh", math: 4.5, lit: 6.5, eng: 5.0, phy: 4.0, avg: 5.0 }, 
        { id: "HS-2026-003", name: "Lý Hải Anh", math: null, lit: 8.0, eng: 7.5, phy: null, avg: null },
        { id: "HS-2026-004", name: "Phạm Bình Minh", math: 9.0, lit: 8.5, eng: 8.0, phy: 9.5, avg: 8.8 },
    ];

    const handleRemindTeacher = (classId) => {
        toast.info(`Đã gửi thông báo nhắc nhở đến GVCN và GV bộ môn lớp ${classId}`);
    };

    return (
        <div className="vp-grades-premium">
            <PageHeader
                title="Giám sát Điểm số & Chất lượng"
                eyebrow="Thanh tra học vụ và kiểm soát tiến độ đánh giá toàn trường"
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            <div className="grades-grid-vpa">
                {/* ── LEFT: CLASS INSPECTOR ── */}
                <div className="class-inspector-sidebar">
                    <div className="inspector-search">
                        <div className="search-wrap-vpa">
                            <FiSearch />
                            <input type="text" placeholder="Tìm lớp..." />
                        </div>
                        <div className="filter-wrap-vpa">
                            <FiFilter />
                            <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)}>
                                <option value="all">Tất cả khối</option>
                                <option value="10">Khối 10</option>
                                <option value="11">Khối 11</option>
                                <option value="12">Khối 12</option>
                            </select>
                        </div>
                    </div>

                    <div className="inspector-list">
                        {filteredClasses.map(cls => (
                            <div 
                                key={cls.id} 
                                className={`inspector-item ${selectedClass?.id === cls.id ? 'active' : ''} ${cls.status}`}
                                onClick={() => setSelectedClass(cls)}
                            >
                                <div className="ii-main">
                                    <div className="ii-title">
                                        <strong>{cls.id}</strong>
                                        <span className="ii-badge">{cls.studentCount} HS</span>
                                    </div>
                                    <div className="ii-status">
                                        {getStatusIcon(cls.status)} {cls.statusLabel}
                                    </div>
                                </div>
                                {cls.warning && (
                                    <div className="ii-warning-tag">
                                        <FiAlertTriangle /> {cls.warnMsg}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── RIGHT: DETAILED ANALYTICS ── */}
                <div className="grades-analytics-content">
                    {!selectedClass ? (
                        <div className="empty-selection-vpa">
                            <FiBarChart2 className="large-icon" />
                            <p>Chọn một lớp học để thực hiện drill-down và phân tích chất lượng</p>
                        </div>
                    ) : (
                        <div className="vpa-content-animate">
                            <div className="content-header-vpa">
                                <div className="ch-title">
                                    <h3>Bảng điểm chi tiết Lớp {selectedClass.id}</h3>
                                    <span className={`status-pill ${selectedClass.status}`}>
                                        {selectedClass.statusLabel}
                                    </span>
                                </div>
                                <div className="ch-actions">
                                    <button className="btn-vpa-secondary" onClick={() => handleRemindTeacher(selectedClass.id)}>
                                        <FiMail /> Nhắc giáo viên
                                    </button>
                                    <button className="btn-vpa-secondary">
                                        <FiDownload /> Xuất XLSX
                                    </button>
                                    {selectedClass.status === 'pending' && (
                                        <button className="btn-vpa-primary" onClick={() => toast.success("Đã phê duyệt sổ điểm!")}>
                                            <FiCheckCircle /> Duyệt chốt sổ
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="quality-alert-box">
                                <FiAlertCircle />
                                <span>Phát hiện 12 đầu điểm chưa nhập và sụt giảm GPA môn Vật Lý (-0.5).</span>
                            </div>

                            <div className="vpa-table-wrap">
                                <table className="vpa-table">
                                    <thead>
                                        <tr>
                                            <th>Học sinh</th>
                                            <th>Toán</th>
                                            <th>Ngữ Văn</th>
                                            <th>Ngoại Ngữ</th>
                                            <th>Vật Lý</th>
                                            <th>TB Học Kỳ</th>
                                            <th>Audit</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {studentGrades.map((s, i) => (
                                            <tr key={i}>
                                                <td className="st-info">
                                                    <strong>{s.name}</strong>
                                                    <span>{s.id}</span>
                                                </td>
                                                <td className={`sc-cell ${s.math < 5 ? 'danger' : ''}`}>{s.math ?? '-'}</td>
                                                <td className={`sc-cell ${s.lit < 5 ? 'danger' : ''}`}>{s.lit ?? '-'}</td>
                                                <td className={`sc-cell ${s.eng < 5 ? 'danger' : ''}`}>{s.eng ?? '-'}</td>
                                                <td className={`sc-cell ${s.phy < 5 ? 'danger' : ''}`}>{s.phy ?? '-'}</td>
                                                <td className="sc-cell-gpa">{s.avg ?? '---'}</td>
                                                <td>
                                                    <button className="btn-vpa-mini" title="Xem lịch sử chỉnh sửa">
                                                        <FiClock />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
