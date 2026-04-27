import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader, Pagination, EmptyState } from "../../../../components/common";
import DisciplineHeaderActions from "../components/DisciplineHeaderActions";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import Select from "../../../../components/ui/Select/Select";
import { 
    FiAlertCircle, FiCheckCircle, FiSave, FiSearch,
    FiLayers, FiActivity, FiUserCheck, FiUserX,
    FiTrendingUp, FiTrendingDown, FiMinus
} from "react-icons/fi";
import { toast } from "react-toastify";
import "./VpDisciplineConduct.css";

const MOCK_CONDUCT_STUDENTS = [
    { id: "HS001", name: "Nguyễn Văn A", class: "10A1", viol: 0, grade: "Tốt", suggest: null, trend: "stable" },
    { id: "HS002", name: "Lê Thị B", class: "10A1", viol: 2, grade: "Khá", suggest: null, trend: "up" },
    { id: "HS003", name: "Trần Minh C", class: "10A2", viol: 8, grade: "Tốt", suggest: "Nhiều vi phạm -> Dự kiến: Trung bình", trend: "down" },
    { id: "HS004", name: "Hoàng D", class: "10A2", viol: 15, grade: "Trung bình", suggest: "Quá nhiều vi phạm -> Dự kiến: Yếu", trend: "down" },
    { id: "HS005", name: "Phạm E", class: "10A1", viol: 1, grade: "Tốt", suggest: null, trend: "stable" },
    { id: "HS006", name: "Nguyễn Văn F", class: "11A5", viol: 3, grade: "Tốt", suggest: null, trend: "down" },
    { id: "HS007", name: "Đặng Thị G", class: "10A1", viol: 0, grade: "", suggest: null, trend: "stable" },
    { id: "HS008", name: "Bùi Văn H", class: "10A1", viol: 12, grade: "", suggest: "Vi phạm nghiêm trọng -> Cần can thiệp", trend: "down" },
    { id: "HS009", name: "Vũ Minh I", class: "10A1", viol: 4, grade: "Khá", suggest: null, trend: "up" },
    { id: "HS010", name: "Phan Thị J", class: "11A1", viol: 0, grade: "Tốt", suggest: null, trend: "stable" },
    { id: "HS011", name: "Lý Văn K", class: "11A1", viol: 5, grade: "", suggest: null, trend: "down" },
    { id: "HS012", name: "Trịnh Thị L", class: "11A1", viol: 1, grade: "Tốt", suggest: null, trend: "up" },
];

const MOCK_CLASSES = [
    { value: "10A1", label: "10A1", grade: "10" },
    { value: "10A2", label: "10A2", grade: "10" },
    { value: "10A3", label: "10A3", grade: "10" },
    { value: "11A1", label: "11A1", grade: "11" },
    { value: "11A5", label: "11A5", grade: "11" },
    { value: "12A1", label: "12A1", grade: "12" },
    { value: "12A2", label: "12A2", grade: "12" },
];

export default function VpDisciplineConduct({ isEmbedded = false }) {
    const [searchParams] = useSearchParams();
    const urlClass = searchParams.get("class");

    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    
    const [students, setStudents] = useState(MOCK_CONDUCT_STUDENTS);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedGrade, setSelectedGrade] = useState("10");
    const [selectedClass, setSelectedClass] = useState(urlClass || "10A1");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;


    useEffect(() => {
        if (urlClass) {
            setSelectedClass(urlClass);
            const grade = urlClass.slice(0, 2);
            if (["10", "11", "12"].includes(grade)) setSelectedGrade(grade);
        }
    }, [urlClass]);

    const handleSave = () => {
        toast.success(`Đã lưu dự kiến hạnh kiểm cho lớp ${selectedClass}`);
    };

    const handleApprove = () => {
        const ungradedStudents = students.filter(s => s.class === selectedClass && !s.grade);
        
        if (ungradedStudents.length > 0) {
            toast.error(`Không thể phê duyệt! Lớp ${selectedClass} còn ${ungradedStudents.length} học sinh chưa được đánh giá hạnh kiểm.`);
            return;
        }

        toast.success(`Đã phê duyệt dự kiến hạnh kiểm lớp ${selectedClass}. Thông báo đã được gửi đến GVCN, Phụ huynh và Học sinh.`);
    };

    const handleGradeChange = (id, newGrade) => {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, grade: newGrade } : s));
        toast.success(`Đã cập nhật dự kiến hạnh kiểm cho ${students.find(s => s.id === id)?.name}`);
    };

    const filteredClassOptions = useMemo(() => {
        return MOCK_CLASSES.filter(c => selectedGrade === "all" || c.grade === selectedGrade);
    }, [selectedGrade]);

    const studentList = useMemo(() => {
        return students.filter(s => {
            const matchesGrade = selectedGrade === "all" || s.class.startsWith(selectedGrade);
            const matchesClass = s.class === selectedClass;
            const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesGrade && matchesClass && matchesSearch;
        });
    }, [students, selectedGrade, selectedClass, searchTerm]);

    const totalPages = Math.max(1, Math.ceil(studentList.length / itemsPerPage));

    useEffect(() => {
        setCurrentPage((prev) => Math.min(prev, totalPages));
    }, [totalPages]);

    useEffect(() => {
        setCurrentPage(1);
    }, [students, selectedGrade, selectedClass, searchTerm]);

    const paginatedStudents = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return studentList.slice(startIndex, startIndex + itemsPerPage);
    }, [studentList, currentPage]);

    const conductStats = [
        { title: "Hạnh kiểm Tốt", val: "85%", sub: "1,062 học sinh", icon: <FiUserCheck />, color: "success" },
        { title: "Biến động tích cực", val: "15 ↑", sub: "Học sinh tiến bộ", icon: <FiTrendingUp />, color: "primary" },
        { title: "Cần Can Thiệp", val: "8 ↓", sub: "Học sinh sa sút", icon: <FiAlertCircle />, color: "danger" },
        { title: "Chưa Phê Duyệt", val: "15/45", sub: "Lớp chưa hoàn tất", icon: <FiCheckCircle />, color: "warning" },
    ];

    return (
        <div className="vp-conduct vp-discipline-layout">
            {!isEmbedded && (
                <PageHeader
                    title="Dự Kiến Hạnh Kiểm"
                    actions={
                        <DisciplineHeaderActions
                            selectedSchoolYear={selectedSchoolYear}
                            selectedTerm={selectedTerm}
                            onYearChange={handleYearArrow}
                            onTermChange={handleTermChange}
                        />
                    }
                />
            )}

            {/* Top Metrics */}
            <div className="cd-stats-grid">
                {conductStats.map((card, idx) => (
                    <div key={idx} className={`cd-stat-card ${card.color}`}>
                        <div className="stat-card-icon">{card.icon}</div>
                        <div className="stat-card-content">
                            <span className="stat-label">{card.title}</span>
                            <span className="stat-value">{card.val}</span>
                            <span className="stat-sub">{card.sub}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Integrated Toolbar */}
            <div className="dm-toolbar-integrated">
                <div className="dm-filters-complex">
                    <div className="filter-group">
                        <label><FiLayers /> Khối</label>
                        <Select 
                            variant="custom"
                            value={selectedGrade}
                            onChange={(e) => {
                                const newGrade = e.target.value;
                                setSelectedGrade(newGrade);
                                // Auto-select first class of the new grade
                                const firstClass = MOCK_CLASSES.find(c => c.grade === newGrade)?.value;
                                if (firstClass) setSelectedClass(firstClass);
                            }}
                            options={[
                                { value: "10", label: "Khối 10" },
                                { value: "11", label: "Khối 11" },
                                { value: "12", label: "Khối 12" }
                            ]}

                        />
                    </div>
                    <div className="filter-group">
                        <label><FiLayers /> Lớp</label>
                        <Select 
                            variant="custom"
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            options={filteredClassOptions}
                        />
                    </div>
                    <div className="filter-group" style={{minWidth: '240px'}}>
                        <label><FiSearch /> Tìm học sinh</label>
                        <div className="ihm-search-box" style={{margin: 0}}>
                            <input 
                                placeholder="Tên học sinh..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="dm-primary-actions-compact">
                    <button className="btn-save-draft" onClick={handleSave}>
                        <FiSave /> Lưu Bản Nháp
                    </button>
                    <button className="btn-add-violation-premium" style={{width: 'auto'}} onClick={handleApprove}>
                        <FiCheckCircle /> Phê Duyệt & Gửi Thông Báo
                    </button>
                </div>
            </div>

            <div className="cd-main-panel animate-fade-in">
                <div className="panel-header">
                    <h3>Dự Kiến Hạnh Kiểm: {selectedClass}</h3>
                    <p>Theo dõi và dự báo xếp loại hành kiểm dựa trên nề nếp hiện tại</p>
                </div>


                
                <div className="cd-table-premium-wrap">
                    {studentList.length > 0 ? (
                        <table className="dm-table-premium">
                            <thead>
                                <tr>
                                    <th>Học sinh</th>
                                    <th className="th-center">Lớp</th>
                                    <th className="th-center">Vi phạm</th>
                                    <th>Hạnh kiểm Dự kiến</th>
                                    <th>Xu hướng</th>
                                    <th>Gợi ý từ Hệ thống</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedStudents.map(s => (
                                    <tr key={s.id}>
                                        <td className="td-student">
                                            <div className="student-profile-mini">
                                                <div className="s-avatar">{s.name.charAt(0)}</div>
                                                <span>{s.name}</span>
                                            </div>
                                        </td>
                                        <td className="th-center"><span className="class-badge-v2">{s.class}</span></td>
                                        <td className="th-center">
                                            <span className={`viol-count ${s.viol > 5 ? 'danger' : ''}`}>{s.viol} lỗi</span>
                                        </td>
                                        <td className="th-center">
                                            <div style={{width: '140px', margin: '0 auto'}}>
                                                <Select 
                                                    variant="custom"
                                                    value={s.grade}
                                                    onChange={(e) => handleGradeChange(s.id, e.target.value)}
                                                    options={[
                                                        { value: "", label: "Chưa cập nhật" },
                                                        { value: "Tốt", label: "Tốt" },
                                                        { value: "Khá", label: "Khá" },
                                                        { value: "Trung bình", label: "Trung bình" },
                                                        { value: "Yếu", label: "Yếu" }
                                                    ]}
                                                />
                                            </div>
                                        </td>
                                        <td>
                                            {s.trend === 'up' && <span className="trend-text up"><FiTrendingUp /> Tiến bộ</span>}
                                            {s.trend === 'down' && <span className="trend-text down"><FiTrendingDown /> Sa sút</span>}
                                            {s.trend === 'stable' && <span className="trend-text stable"><FiMinus /> Ổn định</span>}
                                        </td>
                                        <td>
                                            {s.suggest ? (
                                                <div className="suggestion-pill warning">
                                                    <FiAlertCircle /> {s.suggest}
                                                </div>
                                            ) : (
                                                <div className="suggestion-pill success">
                                                    <FiCheckCircle /> Đề xuất: Tốt
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{ padding: "40px 0" }}>
                            <EmptyState 
                                title="Không tìm thấy học sinh" 
                                description="Không có dữ liệu học sinh phù hợp với lớp hoặc từ khóa tìm kiếm hiện tại."
                                compact 
                            />
                        </div>
                    )}
                </div>

                <div className="dm-footer-pagination">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
            </div>
        </div>
    );
}
