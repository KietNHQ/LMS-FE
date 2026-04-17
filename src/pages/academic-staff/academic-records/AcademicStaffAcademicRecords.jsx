import { useState } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { 
    FiDownload, FiCheckCircle, FiAward, 
    FiFileText, FiShield, FiSearch, FiPrinter 
} from "react-icons/fi";
import { toast } from "react-toastify";
import "./AcademicStaffAcademicRecords.css";

export default function AcademicStaffAcademicRecords() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [activeTab, setActiveTab] = useState("transcripts");
    const [selectedStudent, setSelectedStudent] = useState(null);

    // === MOCK DATA ===
    const students = [
        { id: "HS10A1_01", name: "Nguyễn Trung Hiếu", class: "10A1", status: "Đang học" },
        { id: "HS10A1_02", name: "Trần Mai Anh", class: "10A1", status: "Đang học" },
        { id: "HS12A5_01", name: "Lê Quốc Thịnh", class: "12A5", status: "Đã tốt nghiệp" },
    ];

    const diplomas = [
        { id: "VB2026_01", studentName: "Lê Quốc Thịnh", type: "Tốt nghiệp THPT", date: "15/05/2026", num: "001234/TN" },
        { id: "VB2026_02", studentName: "Phạm Bình Minh", type: "Tốt nghiệp THPT", date: "15/05/2026", num: "001235/TN" },
    ];

    const rewards = [
        { id: 1, name: "Nguyễn Trung Hiếu", content: "Giải Nhì HSG Thành phố môn Toán", type: "Khen thưởng", level: "Thành phố" },
        { id: 2, name: "Vũ Khánh Thy", content: "Vi phạm nội quy đồng phục", type: "Kỷ luật", level: "Nhắc nhở" },
    ];

    const grades = [
        { subject: "Toán Học", hw: 8.5, test15: 9.0, mid: 8.0, final: 8.5, gpa: 8.4 },
        { subject: "Ngữ Văn", hw: 7.0, test15: 7.5, mid: 7.0, final: 7.5, gpa: 7.3 },
        { subject: "Vật Lý", hw: 8.0, test15: 8.5, mid: 8.0, final: 9.0, gpa: 8.4 },
        { subject: "Hóa Học", hw: 6.5, test15: 7.0, mid: 6.0, final: 7.5, gpa: 6.8 },
    ];

    return (
        <div className="academic-records-premium">
            <PageHeader
                title="Học Bạ & Văn Bằng"
                eyebrow="Quản lý hồ sơ kết quả học tập và chứng nhận pháp lý"
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
                <button className={`mgmt-tab-btn ${activeTab === 'transcripts' ? 'active' : ''}`} onClick={() => setActiveTab('transcripts')}>
                    <FiFileText /> Học bạ điện tử
                </button>
                <button className={`mgmt-tab-btn ${activeTab === 'graduation' ? 'active' : ''}`} onClick={() => setActiveTab('graduation')}>
                    <FiAward /> Văn bằng & Chứng chỉ
                </button>
                <button className={`mgmt-tab-btn ${activeTab === 'discipline' ? 'active' : ''}`} onClick={() => setActiveTab('discipline')}>
                    <FiShield /> Khen thưởng & Kỷ luật
                </button>
            </div>

            <div className="records-main-content">
                {/* 1. HỌC BẠ ĐIỆN TỬ */}
                {activeTab === 'transcripts' && (
                    <div className="records-split-view">
                        <div className="records-sidebar">
                            <div className="rs-filter">
                                <div className="search-box-mini">
                                    <FiSearch />
                                    <input type="text" placeholder="Tìm tên hoặc mã HS..." />
                                </div>
                                <select className="rs-select-mini">
                                    <option>Tất cả các lớp</option>
                                    <option>10A1</option>
                                    <option>10A2</option>
                                </select>
                            </div>
                            <div className="student-list">
                                {students.map(s => (
                                    <div 
                                        key={s.id} 
                                        className={`student-item-card ${selectedStudent?.id === s.id ? 'active' : ''}`}
                                        onClick={() => setSelectedStudent(s)}
                                    >
                                        <div className="si-avatar">{s.name.charAt(0)}</div>
                                        <div className="si-info">
                                            <span className="si-name">{s.name}</span>
                                            <span className="si-meta">{s.id} • {s.class}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="records-details">
                            {!selectedStudent ? (
                                <div className="empty-selection">
                                    <FiFileText className="empty-icon" />
                                    <p>Vui lòng chọn học sinh từ danh sách để xem học bạ chi tiết</p>
                                </div>
                            ) : (
                                <div className="transcript-preview">
                                    <div className="tp-header">
                                        <div className="tp-student">
                                            <h3>{selectedStudent.name}</h3>
                                            <span>Mã định danh: {selectedStudent.id} | Hệ đào tạo: Phổ thông</span>
                                        </div>
                                        <div className="tp-actions">
                                            <button className="btn-secondary" onClick={() => toast.success("Đã khóa sổ học bạ")}>
                                                <FiCheckCircle /> Khóa Học Bạ
                                            </button>
                                            <button className="btn-primary">
                                                <FiPrinter /> In Học Bạ
                                            </button>
                                        </div>
                                    </div>

                                    <div className="table-wrap">
                                        <table className="premium-table">
                                            <thead>
                                                <tr>
                                                    <th>Môn Học</th>
                                                    <th>Giữa Kỳ</th>
                                                    <th>Cuối Kỳ</th>
                                                    <th>Trung Bình</th>
                                                    <th>Nhận xét của GVBM</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {grades.map(g => (
                                                    <tr key={g.subject}>
                                                        <td><strong>{g.subject}</strong></td>
                                                        <td>{g.mid || '-'}</td>
                                                        <td>{g.final || '-'}</td>
                                                        <td className="gpa-cell">{g.gpa || '-'}</td>
                                                        <td>Học tập tích cực, tiếp thu bài nhanh.</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 2. VĂN BẰNG & CHỨNG CHỈ */}
                {activeTab === 'graduation' && (
                    <div className="graduation-module">
                        <div className="mgmt-header">
                            <h3>Sổ Quản Lý Cấp Phát Văn Bằng (Thông tư 10/2026)</h3>
                            <button className="btn-primary">+ Đăng ký cấp bằng mới</button>
                        </div>
                        <div className="table-wrap">
                            <table className="premium-table">
                                <thead>
                                    <tr>
                                        <th>Mã ID Bằng</th>
                                        <th>Học sinh</th>
                                        <th>Loại văn bằng</th>
                                        <th>Ngày cấp</th>
                                        <th>Số hiệu / Sổ gốc</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {diplomas.map(d => (
                                        <tr key={d.id}>
                                            <td><code>{d.id}</code></td>
                                            <td><strong>{d.studentName}</strong></td>
                                            <td>{d.type}</td>
                                            <td>{d.date}</td>
                                            <td>{d.num}</td>
                                            <td><button className="btn-mini"><FiDownload /> In bản sao</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 3. KHEN THƯỞNG & KỶ LUẬT */}
                {activeTab === 'discipline' && (
                    <div className="discipline-module">
                        <div className="mgmt-header">
                            <h3>Theo dõi Khen thưởng & Kỷ luật (Thông tư 19/2025)</h3>
                            <button className="btn-primary">+ Tạo quyết định mới</button>
                        </div>
                        <div className="table-wrap">
                            <table className="premium-table">
                                <thead>
                                    <tr>
                                        <th>Học sinh</th>
                                        <th>Loại hình</th>
                                        <th>Cấp độ</th>
                                        <th>Nội dung chi tiết</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rewards.map(r => (
                                        <tr key={r.id}>
                                            <td><strong>{r.name}</strong></td>
                                            <td>
                                                <span className={`type-tag ${r.type === 'Khen thưởng' ? 'success' : 'danger'}`}>
                                                    {r.type}
                                                </span>
                                            </td>
                                            <td>{r.level}</td>
                                            <td>{r.content}</td>
                                            <td><button className="btn-mini">Hồ sơ vụ việc</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
