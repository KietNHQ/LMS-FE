import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { FiUsers, FiUserCheck, FiHome, FiCheckCircle, FiAlertTriangle, FiArrowRight, FiDatabase, FiAward } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./AcademicStaffDashboard.css";

export default function AcademicStaffDashboard() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const navigate = useNavigate();

    // Mock Business Data
    const quickStats = {
        totalStudents: 1250,
        totalTeachers: 85,
        totalClasses: 35,
        classesAssigned: 32 // 32/35 classes have home room teachers
    };

    const toDos = [
        { id: 1, title: "20 học sinh chưa được xếp lớp", desc: "Học sinh mới chuyển đến hoặc chưa phân ban", path: "/academic/class-management?tab=assign-students" },
        { id: 2, title: "3 lớp trống giáo viên chủ nhiệm", desc: "10A5, 11A2, 12A3 cần phân bổ GVCN", path: "/academic/class-management?tab=teaching-assignment" },
        { id: 3, title: "10 học sinh thiếu hồ sơ đầu vào", desc: "Chưa cập nhật ngày sinh hoặc CCCD", path: "/academic/personnel?filter=missing-info" },
    ];

    const dataHealthStats = {
        unassignedStudents: 20,
        missingDataStudents: 10,
        classesNoTeacher: 3,
        classesNoSubjectTeachers: 5 // thiếu gv bộ môn
    };

    const recordProgress = {
        entered: 25,
        total: 35,
        missingRecordClasses: "10A1, 10A5, 11A2..."
    };

    const assignmentProgress = Math.round((quickStats.classesAssigned / quickStats.totalClasses) * 100);
    const gradeProgressPercent = Math.round((recordProgress.entered / recordProgress.total) * 100);

    return (
        <div className="academic-dashboard">
            <PageHeader
                title="Bảng Điều Khiển Giáo Vụ"
                eyebrow="Tổ chức & Điều phối Dữ liệu học tập"
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            {/* Thống kê nhanh */}
            <div className="ac-stats-grid">
                <div className="ac-stat-card primary">
                    <div className="ac-stat-icon"><FiUsers /></div>
                    <div className="ac-stat-body">
                        <p className="ac-stat-label">Tổng học sinh</p>
                        <h3 className="ac-stat-value">{quickStats.totalStudents}</h3>
                    </div>
                </div>
                <div className="ac-stat-card primary">
                    <div className="ac-stat-icon"><FiUserCheck /></div>
                    <div className="ac-stat-body">
                        <p className="ac-stat-label">Tổng giáo viên</p>
                        <h3 className="ac-stat-value">{quickStats.totalTeachers}</h3>
                    </div>
                </div>
                <div className="ac-stat-card primary">
                    <div className="ac-stat-icon"><FiHome /></div>
                    <div className="ac-stat-body">
                        <p className="ac-stat-label">Tổng số lớp</p>
                        <h3 className="ac-stat-value">{quickStats.totalClasses}</h3>
                    </div>
                </div>
                <div className="ac-stat-card success">
                    <div className="ac-stat-icon"><FiCheckCircle /></div>
                    <div className="ac-stat-body">
                        <p className="ac-stat-label">Tiến độ xếp lớp (GVCN)</p>
                        <h3 className="ac-stat-value">{assignmentProgress}%</h3>
                        <div className="mini-progress-bar">
                            <div className="mini-progress-fill" style={{width: `${assignmentProgress}%`, background: '#059669'}}></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="ac-panels-grid">
                {/* Việc cần xử lý */}
                <div className="ac-panel urgent-tasks">
                    <div className="ac-panel-header">
                        <h3><FiAlertTriangle /> Việc Cần Xử Lý Ngay</h3>
                    </div>
                    <div className="urgent-list">
                        {toDos.map(task => (
                            <div key={task.id} className="urgent-item">
                                <div className="urgent-item-info">
                                    <strong>{task.title}</strong>
                                    <span>{task.desc}</span>
                                </div>
                                <button className="btn-resolve" onClick={() => navigate(task.path)}>
                                    Xử lý ngay <FiArrowRight />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tình trạng dữ liệu & Điểm số */}
                <div className="ac-panel">
                    <div className="ac-panel-header">
                        <h3><FiDatabase /> Trạng thái Dữ liệu Học vụ</h3>
                    </div>
                    
                    <div className="data-health-grid">
                        <div className="dh-box">
                            <h4><FiUsers /> Lớp học & Giáo viên</h4>
                            <div className="dh-item">
                                <span className="dh-label">Học sinh chưa xếp lớp</span>
                                <span className={`dh-val ${dataHealthStats.unassignedStudents > 0 ? 'danger' : 'success'}`}>
                                    {dataHealthStats.unassignedStudents} HS
                                </span>
                            </div>
                            <div className="dh-item">
                                <span className="dh-label">Lớp thiếu GV Chủ nhiệm</span>
                                <span className={`dh-val ${dataHealthStats.classesNoTeacher > 0 ? 'danger' : 'success'}`}>
                                    {dataHealthStats.classesNoTeacher} Lớp
                                </span>
                            </div>
                            <div className="dh-item">
                                <span className="dh-label">Lớp thiếu GV Bộ môn</span>
                                <span className={`dh-val ${dataHealthStats.classesNoSubjectTeachers > 0 ? 'warning' : 'success'}`}>
                                    {dataHealthStats.classesNoSubjectTeachers} Lớp
                                </span>
                            </div>
                        </div>

                        <div className="dh-box">
                            <h4><FiAward /> Tiến độ Cập nhật Học bạ</h4>
                            <div className="dh-item">
                                <span className="dh-label">Lớp đã chốt điểm</span>
                                <span className="dh-val success">{recordProgress.entered} / {recordProgress.total}</span>
                            </div>
                            <div className="mini-progress-bar" style={{marginBottom: '0.75rem'}}>
                                <div className="mini-progress-fill" style={{width: `${gradeProgressPercent}%`, background: '#2563eb'}}></div>
                            </div>
                            <div className="dh-item" style={{border: 'none', flexDirection: 'column', alignItems: 'flex-start', gap: '0.25rem'}}>
                                <span className="dh-label">Các lớp đang chậm tiến độ:</span>
                                <span className="dh-val danger" style={{fontSize: '0.8rem'}}>{recordProgress.missingRecordClasses}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
