import { useState, useEffect } from "react";
import { PageHeader, WeekPicker, Pagination } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import Select from "../../../components/ui/Select/Select";
import { FiChevronLeft, FiChevronRight, FiPlus, FiFilter, FiDownload, FiAlertOctagon, FiUser, FiBarChart2, FiSearch, FiLayers, FiActivity, FiShield, FiCalendar, FiClock, FiCheck } from "react-icons/fi";
import { toast } from "react-toastify";
import DisciplineHeaderActions from "../components/DisciplineHeaderActions";
import ViolationRecordModal from "../components/ViolationRecordModal";
import "./VpDisciplineMgmt.css";

export default function VpDisciplineMgmt() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
    
    // Filter States
    const [selectedGrade, setSelectedGrade] = useState("all");
    const [selectedClass, setSelectedClass] = useState("all");
    const [selectedWeek, setSelectedWeek] = useState(1);
    const [selectedViolationType, setSelectedViolationType] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7; // Back to standard
    const [selectedSeverity, setSelectedSeverity] = useState("all");

    // Mock Data - Restored and balanced
    const [incidents, setIncidents] = useState([
        { id: 1, student: "Nguyễn Văn A", class: "10A1", grade: "10", type: "Vắng không phép", level: "med", date: "20/4/2026", reporter: "GV. Trần Y" },
        { id: 2, student: "Lê Thị B", class: "11A5", grade: "11", type: "Sử dụng điện thoại", level: "low", date: "20/4/2026", reporter: "Lớp trưởng" },
        { id: 3, student: "Trần Minh C", class: "12A2", grade: "12", type: "Đánh nhau", level: "high", date: "19/4/2026", reporter: "Giám thị 01" },
        { id: 4, student: "Hoàng Anh E", class: "10A2", grade: "10", type: "Nói tục", level: "med", date: "19/4/2026", reporter: "GV. Trần Y" },
        { id: 5, student: "Lê Văn C", class: "12A2", grade: "12", type: "Gian lận thi cử", level: "high", date: "20/04/2026", reporter: "PHT Nề nếp" },
        { id: 6, student: "Vũ Thu F", class: "11B1", grade: "11", type: "Vẽ bậy", level: "low", date: "20/04/2026", reporter: "PHT Nề nếp" },
        { id: 10, student: "Lê I", class: "12C3", grade: "12", type: "Bỏ tiết", level: "med", date: "18/04/2026", reporter: "Giám thị 01" },
    ]);

    // Minimalist violation analytics for clarity
    const categoryStats = [
        { 
            title: "Chuyên cần", 
            icon: <FiClock />, 
            incidents: 63,
            detail: "12 học sinh",
            trend: "+15%",
            level: "Cần chú ý",
            status: "warning"
        },
        { 
            title: "Nề nếp", 
            icon: <FiUser />, 
            incidents: 45,
            detail: "8 học sinh",
            trend: "-5%",
            level: "Ổn định",
            status: "success"
        },
        { 
            title: "Tài sản", 
            icon: <FiLayers />, 
            incidents: 15,
            detail: "4 học sinh",
            trend: "+2%",
            level: "Bình thường",
            status: "neutral"
        },
        { 
            title: "Học tập", 
            icon: <FiAlertOctagon />, 
            incidents: 28,
            detail: "9 học sinh",
            trend: "+8%",
            level: "Nghiêm trọng",
            status: "critical"
        },
    ];

    const handleAddIncidentSuccess = (newInc) => {
        setIncidents([newInc, ...incidents]);
    };

    // Derived options for Class based on Grade
    const classOptions = {
        "all": [{ value: "all", label: "Tất cả lớp" }],
        "10": [{ value: "all", label: "Tất cả lớp 10" }, { value: "10A1", label: "10A1" }, { value: "10A2", label: "10A2" }],
        "11": [{ value: "all", label: "Tất cả lớp 11" }, { value: "11A5", label: "11A5" }, { value: "11B1", label: "11B1" }],
        "12": [{ value: "all", label: "Tất cả lớp 12" }, { value: "12A2", label: "12A2" }, { value: "12C3", label: "12C3" }],
    };

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedGrade, selectedClass, selectedViolationType, selectedWeek, selectedSchoolYear, selectedTerm]);

    // Auto-filtering logic
    const filteredIncidents = incidents.filter(inc => {
        const matchGrade = selectedGrade === "all" || inc.grade === selectedGrade;
        const matchClass = selectedClass === "all" || inc.class === selectedClass;
        const matchType = selectedViolationType === "all" || inc.type.toLowerCase().includes(selectedViolationType.toLowerCase()) || (selectedViolationType === "late" && inc.type === "Đi trễ") || (selectedViolationType === "absence" && inc.type.includes("Vắng"));
        return matchGrade && matchClass && matchType;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredIncidents.length / itemsPerPage) || 1;
    const paginatedIncidents = filteredIncidents.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="vp-discipline-mgmt vp-discipline-layout discipline-layout-centered">
            <PageHeader
                title="Quản Lý Nề Nếp"
                subtitle="Theo dõi và quản lý hồ sơ vi phạm học sinh toàn trường"
                actions={
                    <DisciplineHeaderActions
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            <div className="dm-summary-grid">
                {categoryStats.map((cat, idx) => (
                    <div key={idx} className={`dm-status-card ${cat.status}`}>
                        <div className="card-inner">
                            <div className="card-top">
                                <span className="card-label">{cat.title}</span>
                                <span className={`status-pill`}>{cat.level}</span>
                            </div>
                            <div className="card-mid">
                                <div className="main-count">
                                    {cat.incidents}
                                    <span className="count-unit">lượt</span>
                                </div>
                                <div className="card-icon-bg">{cat.icon}</div>
                            </div>
                            <div className="card-bottom">
                                <span className="trend-val">{cat.trend} tháng này</span>
                                <span className="sep">•</span>
                                <span className="detail-val">{cat.detail}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dm-main-container">
                <div className="dm-panel main-ops-panel-full">
                    <div className="dm-header-v2">
                        <div className="dm-toolbar-integrated">
                            <div className="dm-filters-complex">
                                <div className="filter-group">
                                    <label><FiCalendar /> Tuần</label>
                                    <WeekPicker 
                                        className="dm-week-picker"
                                        value={selectedWeek} 
                                        onChange={setSelectedWeek} 
                                        totalWeeks={35}
                                    />
                                </div>

                                <div className="filter-group">
                                    <label><FiLayers /> Khối</label>
                                    <Select 
                                        variant="custom"
                                        value={selectedGrade}
                                        onChange={(e) => {
                                            setSelectedGrade(e.target.value);
                                            setSelectedClass("all");
                                        }}
                                        options={[
                                            { value: "all", label: "Tất cả Khối" },
                                            { value: "10", label: "Khối 10" },
                                            { value: "11", label: "Khối 11" },
                                            { value: "12", label: "Khối 12" }
                                        ]}
                                    />
                                </div>

                                {selectedGrade !== "all" && (
                                    <div className="filter-group animate-slide-in">
                                        <label><FiLayers /> Lớp</label>
                                        <Select 
                                            variant="custom"
                                            value={selectedClass}
                                            onChange={(e) => setSelectedClass(e.target.value)}
                                            options={classOptions[selectedGrade]}
                                        />
                                    </div>
                                )}

                                <div className="filter-group">
                                    <label><FiAlertOctagon /> Loại lỗi</label>
                                    <Select 
                                        variant="custom"
                                        value={selectedViolationType}
                                        onChange={(e) => setSelectedViolationType(e.target.value)}
                                        options={[
                                            { value: "all", label: "Tất cả" },
                                            { value: "late", label: "Đi trễ" },
                                            { value: "absence", label: "Vắng" },
                                            { value: "uniform", label: "Đồng phục" },
                                            { value: "behavior", label: "Thái độ" }
                                        ]}
                                    />
                                </div>
                            </div>

                            <div className="dm-primary-actions-compact">
                                <div className="btn-aligner-spacer"></div>
                                <div className="btn-group-horizontal">
                                    <button className="btn-export-reports"><FiDownload /> Báo cáo</button>
                                    <button className="btn-add-violation-premium" onClick={() => setIsRecordModalOpen(true)}>
                                        <FiPlus /> Ghi nhận mới
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="dm-table-wrap">
                        <table className="dm-table-premium">
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
                                {paginatedIncidents.map(inc => (
                                    <tr key={inc.id} className="row-hover-effect">
                                        <td className="td-student">
                                            <div className="student-profile-mini">
                                                <div className="s-avatar">{inc.student.charAt(0)}</div>
                                                <span>{inc.student}</span>
                                            </div>
                                        </td>
                                        <td><span className="class-badge-v2">{inc.class}</span></td>
                                        <td><span className="violation-type">{inc.type}</span></td>
                                        <td>
                                            <span className={`level-pill ${inc.level}`}>
                                                {inc.level === 'high' ? 'Nghiêm trọng' : (inc.level === 'med' ? 'Vừa' : 'Nhẹ')}
                                            </span>
                                        </td>
                                        <td><span className="td-time">{inc.date}</span></td>
                                        <td><span className="td-reporter">{inc.reporter}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="dm-footer-pagination">
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={(page) => setCurrentPage(page)}
                        />
                    </div>
                </div>
            </div>
            <ViolationRecordModal 
                isOpen={isRecordModalOpen}
                onClose={() => setIsRecordModalOpen(false)}
                onSuccess={handleAddIncidentSuccess}
                incidents={incidents}
            />
        </div>
    );
}
