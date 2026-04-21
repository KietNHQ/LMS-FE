import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader, StatusBadge } from "../../../components/common";
import DisciplineHeaderActions from "../components/DisciplineHeaderActions";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import Select from "../../../components/ui/Select/Select";
import { 
    FiAward, FiAlertCircle, FiCheckCircle, FiSave, FiSearch, 
    FiFilter, FiLayers, FiActivity, FiUserCheck, FiUserX 
} from "react-icons/fi";
import { toast } from "react-toastify";
import "./VpDisciplineConduct.css";

const MOCK_CONDUCT_STUDENTS = [
    { id: "HS001", name: "Nguyễn Văn A", class: "10A1", viol: 0, grade: "Tốt", suggest: null },
    { id: "HS002", name: "Lê Thị B", class: "10A1", viol: 2, grade: "Khá", suggest: null },
    { id: "HS003", name: "Trần Minh C", class: "10A2", viol: 8, grade: "Tốt", suggest: "Nhiều vi phạm -> Đề xuất: Trung bình" },
    { id: "HS004", name: "Hoàng D", class: "10A2", viol: 15, grade: "Trung bình", suggest: "Quá nhiều vi phạm -> Đề xuất: Yếu" },
    { id: "HS005", name: "Phạm E", class: "10A1", viol: 1, grade: "Tốt", suggest: null },
];

export default function VpDisciplineConduct({ isEmbedded = false }) {
    const [searchParams] = useSearchParams();
    const urlClass = searchParams.get("class");

    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    
    const [students, setStudents] = useState(MOCK_CONDUCT_STUDENTS);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedGrade, setSelectedGrade] = useState("10");
    const [selectedClass, setSelectedClass] = useState(urlClass || "10A1");


    useEffect(() => {
        if (urlClass) {
            setSelectedClass(urlClass);
            const grade = urlClass.slice(0, 2);
            if (["10", "11", "12"].includes(grade)) setSelectedGrade(grade);
        }
    }, [urlClass]);

    const handleGradeChange = (id, newGrade) => {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, grade: newGrade } : s));
        toast.success(`Đã cập nhật hạnh kiểm cho ${students.find(s => s.id === id)?.name}`);
    };

    const handleSaveAll = () => {
        toast.success("Đã phê duyệt toàn bộ đánh giá hạnh kiểm cho lớp này.");
    };

    const studentList = useMemo(() => {
        return students.filter(s => {
            const matchesGrade = selectedGrade === "all" || s.class.startsWith(selectedGrade);
            const matchesClass = selectedClass === "all" || s.class === selectedClass;
            const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesGrade && matchesClass && matchesSearch;
        });
    }, [students, selectedGrade, selectedClass, searchTerm]);

    const conductStats = [
        { title: "Hạnh kiểm Tốt", val: "85%", sub: "1,062 học sinh", icon: <FiUserCheck />, color: "success" },
        { title: "Hạnh kiểm Yếu", val: "1.2%", sub: "15 học sinh", icon: <FiUserX />, color: "danger" },
        { title: "Chưa Đánh giá", val: "12", sub: "Lớp 11A5 chưa chốt", icon: <FiActivity />, color: "info" },
        { title: "Gợi ý Hệ thống", val: "28", sub: "Trường hợp cần lưu ý", icon: <FiAlertCircle />, color: "warning" },
    ];

    return (
        <div className="vp-conduct vp-discipline-layout">
            {!isEmbedded && (
                <PageHeader
                    title="Đánh Giá Hạnh Kiểm"
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
            <div className="dm-toolbar-integrated mb-lg">
                <div className="dm-filters-complex">
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
                            options={[
                                { value: "10A1", label: "10A1" },
                                { value: "10A2", label: "10A2" },
                                { value: "11A5", label: "11A5" }
                            ]}

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
                    <button className="btn-add-violation-premium" style={{width: 'auto'}} onClick={handleSaveAll}>
                        <FiSave /> Lưu & Phê Duyệt Toàn Lớp
                    </button>
                </div>
            </div>

            <div className="cd-main-panel animate-fade-in">
                <div className="panel-header">
                    <h3>Danh sách Đánh giá Hạnh Kiểm: {selectedClass}</h3>
                    <p>Hệ thống tự động tra cứu lịch sử vi phạm để đưa ra gợi ý xếp loại</p>
                </div>


                
                <div className="cd-table-premium-wrap">
                    <table className="dm-table-premium">
                        <thead>
                            <tr>
                                <th>Học sinh</th>
                                <th className="th-center">Lớp</th>
                                <th className="th-center">Vi phạm</th>
                                <th>Hạnh kiểm GVCN đề xuất</th>
                                <th>Gợi ý & Cảnh báo từ Hệ thống</th>
                            </tr>
                        </thead>
                        <tbody>
                            {studentList.map(s => (
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
                                    <td>
                                        <div style={{width: '140px'}}>
                                            <Select 
                                                variant="custom"
                                                value={s.grade}
                                                onChange={(e) => handleGradeChange(s.id, e.target.value)}
                                                options={[
                                                    { value: "Tốt", label: "Tốt" },
                                                    { value: "Khá", label: "Khá" },
                                                    { value: "Trung bình", label: "Trung bình" },
                                                    { value: "Yếu", label: "Yếu" }
                                                ]}
                                            />
                                        </div>
                                    </td>
                                    <td>
                                        {s.suggest ? (
                                            <div className="suggestion-pill">
                                                <FiAlertCircle /> {s.suggest}
                                            </div>
                                        ) : (
                                            <div className="suggestion-pill success">
                                                <FiCheckCircle /> Đủ điều kiện xếp loại Tốt
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
