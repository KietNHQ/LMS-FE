import { useState } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { FiCalendar, FiEdit, FiSearch, FiAlertCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import "./AcademicStaffTimetable.css";

export default function AcademicStaffTimetable() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [viewMode, setViewMode] = useState("class");
    const [selectedObject, setSelectedObject] = useState("10A1");

    return (
        <div className="academic-timetable">
            <PageHeader
                title="Quản Lý Thời Khóa Biểu"
                eyebrow="Tổ chức lịch học toàn trường"
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            <div className="timetable-toolbar">
                <div className="tt-filters">
                    <select 
                        className="tt-select"
                        value={viewMode}
                        onChange={e => setViewMode(e.target.value)}
                    >
                        <option value="class">Phân theo Lớp học</option>
                        <option value="teacher">Phân theo Giáo viên</option>
                    </select>
                    <select 
                        className="tt-select"
                        value={selectedObject}
                        onChange={e => setSelectedObject(e.target.value)}
                    >
                        {viewMode === "class" ? (
                            <>
                                <option value="10A1">Lớp 10A1</option>
                                <option value="10A2">Lớp 10A2</option>
                            </>
                        ) : (
                            <>
                                <option value="GV01">GV Nguyễn Văn A</option>
                                <option value="GV02">GV Trần Thị B</option>
                            </>
                        )}
                    </select>
                </div>
                <div style={{display: 'flex', gap: '0.5rem'}}>
                    <button className="btn-secondary" onClick={() => toast.info("Tính năng tự động sắp xếp đang phát triển")}>
                        Sắp xếp Tự Động
                    </button>
                    <button className="btn-primary">
                        <FiEdit /> Sắp xếp Thủ Công
                    </button>
                </div>
            </div>

            <div className="timetable-grid-wrap">
                <div style={{marginBottom: '1rem', display: 'flex', gap: '1rem'}}>
                    <span style={{fontSize: '0.85rem', color: '#64748b'}}>* Click vào từng ô để đổi môn / giáo viên</span>
                    <span style={{fontSize: '0.85rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.2rem'}}>
                        <FiAlertCircle /> Ô màu đỏ thể hiện giáo viên bị kẹt lịch
                    </span>
                </div>
                <table className="tt-table">
                    <thead>
                        <tr>
                            <th>Tiết</th>
                            <th>Thứ 2</th>
                            <th>Thứ 3</th>
                            <th>Thứ 4</th>
                            <th>Thứ 5</th>
                            <th>Thứ 6</th>
                            <th>Thứ 7</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="period-col">Tiết 1<br/><span style={{fontSize:'0.75rem', fontWeight:'normal'}}>07:00</span></td>
                            <td>
                                <div className="tt-cell">
                                    <span className="tt-subject">Toán Học</span>
                                    <span className="tt-teacher">Nguyễn Văn A</span>
                                </div>
                            </td>
                            <td>
                                <div className="tt-cell">
                                    <span className="tt-subject">Vật Lý</span>
                                    <span className="tt-teacher">Lê Minh C</span>
                                </div>
                            </td>
                            <td>
                                <div className="tt-cell conflict">
                                    <span className="tt-subject">Sinh Học</span>
                                    <span className="tt-teacher">Trùng lịch: GV_Sinh_01</span>
                                </div>
                            </td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td className="period-col">Tiết 2<br/><span style={{fontSize:'0.75rem', fontWeight:'normal'}}>07:50</span></td>
                            <td>
                                <div className="tt-cell">
                                    <span className="tt-subject">Toán Học</span>
                                    <span className="tt-teacher">Nguyễn Văn A</span>
                                </div>
                            </td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
