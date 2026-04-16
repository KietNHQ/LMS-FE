import { useState } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { FiUsers, FiUserCheck, FiSearch, FiFilter, FiEdit2 } from "react-icons/fi";
import "./AcademicStaffPersonnel.css";

export default function AcademicStaffPersonnel() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [activeTab, setActiveTab] = useState("students");
    const [filterStatus, setFilterStatus] = useState("all");

    // Mock Data
    const students = [
        { id: "HS1001", name: "Nguyễn Văn A", class: "10A1", dob: "12/05/2010", status: "ok", notes: "Thường" },
        { id: "HS1002", name: "Trần Thị B", class: "Chưa xếp lớp", dob: "", status: "missing", notes: "Thiếu CCCD" },
        { id: "HS1003", name: "Lê C", class: "11A5", dob: "01/01/2009", status: "ok", notes: "Thường" },
    ];

    const teachers = [
        { id: "GV001", name: "Phạm Bình Minh", subject: "Toán", homeroom: "10A1", status: "ok" },
        { id: "GV002", name: "Lý Hải Anh", subject: "Văn", homeroom: "Chưa phân công", status: "warning" },
        { id: "GV003", name: "Trịnh Thị D", subject: "Sinh học", homeroom: "11A5", status: "ok" },
    ];

    const displayStudents = filterStatus === "all" ? students : students.filter(s => s.status === filterStatus);
    const displayTeachers = filterStatus === "all" ? teachers : teachers.filter(t => t.status === filterStatus);

    return (
        <div className="academic-personnel">
            <PageHeader
                title="Quản Lý Nhân Sự"
                eyebrow="Tổ chức dữ liệu Học Sinh và Giáo Viên"
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            <div className="personnel-tabs">
                <button 
                    className={`personnel-tab-btn ${activeTab === 'students' ? 'active' : ''}`}
                    onClick={() => {setActiveTab('students'); setFilterStatus('all');}}
                >
                    <FiUsers /> Học sinh
                </button>
                <button 
                    className={`personnel-tab-btn ${activeTab === 'teachers' ? 'active' : ''}`}
                    onClick={() => {setActiveTab('teachers'); setFilterStatus('all');}}
                >
                    <FiUserCheck /> Giáo viên
                </button>
            </div>

            <div className="personnel-content">
                <div className="personnel-toolbar">
                    <input 
                        type="text" 
                        className="personnel-search-input" 
                        placeholder={`Tìm kiếm ${activeTab === 'students' ? 'học sinh' : 'giáo viên'}...`}
                    />
                    <select 
                        className="personnel-filter-select"
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                    >
                        <option value="all">Tất cả trạng thái</option>
                        {activeTab === 'students' ? (
                            <>
                                <option value="missing">Thiếu hồ sơ / Chưa có lớp</option>
                                <option value="ok">Đầy đủ thông tin</option>
                            </>
                        ) : (
                            <>
                                <option value="warning">Chưa phân công lớp</option>
                                <option value="ok">Đã phân công</option>
                            </>
                        )}
                    </select>
                    <button className="btn-primary">
                        + Thêm Mới
                    </button>
                </div>

                <div className="personnel-table-wrap">
                    {activeTab === 'students' ? (
                        <table className="personnel-table">
                            <thead>
                                <tr>
                                    <th>Mã Học Sinh</th>
                                    <th>Họ & Tên</th>
                                    <th>Ngày Sinh</th>
                                    <th>Lớp Học</th>
                                    <th>Trạng Thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayStudents.map(s => (
                                    <tr key={s.id}>
                                        <td><strong>{s.id}</strong></td>
                                        <td>{s.name}</td>
                                        <td style={!s.dob ? {color: '#dc2626'} : {}}>{s.dob || "Chưa cập nhật"}</td>
                                        <td>{s.class}</td>
                                        <td>
                                            <span className={`status-badge ${s.status}`}>
                                                {s.status === 'ok' ? 'Bình thường' : s.notes}
                                            </span>
                                        </td>
                                        <td><button className="btn-secondary"><FiEdit2 /></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <table className="personnel-table">
                            <thead>
                                <tr>
                                    <th>Mã Giáo Viên</th>
                                    <th>Họ & Tên</th>
                                    <th>Môn Chuyên Môn</th>
                                    <th>Lớp Chủ Nhiệm</th>
                                    <th>Trạng Thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayTeachers.map(t => (
                                    <tr key={t.id}>
                                        <td><strong>{t.id}</strong></td>
                                        <td>{t.name}</td>
                                        <td>{t.subject}</td>
                                        <td>{t.homeroom}</td>
                                        <td>
                                            <span className={`status-badge ${t.status}`}>
                                                {t.status === 'ok' ? 'Đã phân công' : 'Chưa phân công'}
                                            </span>
                                        </td>
                                        <td><button className="btn-secondary"><FiEdit2 /></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
