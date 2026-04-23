import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
    SchoolYearTermSelector, 
    Pagination, 
    PageHeader, 
    StatusBadge, 
    SectionCard 
} from "../../../components/common";
import { Button, Input, Select, Modal } from "../../../components/ui";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { FiCalendar, FiPlus, FiClock, FiUsers, FiBookOpen } from "react-icons/fi";
import "./VpAcademicExams.css";

export default function VpAcademicExams() {
    const navigate = useNavigate();
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [currentPage, setCurrentPage] = useState(1);

    const exams = [
        { 
            id: 1, 
            title: "Thi Giữa Học Kỳ II - Khối 12", 
            date: "25/11 - 28/11/2026", 
            status: "SẮP TỚI", 
            statusType: "success", 
            candidates: "450 học sinh", 
            type: "Tập trung",
            description: "Kỳ thi quan trọng đánh giá năng lực học sinh khối 12 trước kỳ thi THPT Quốc gia.",
            subjects: ["Toán", "Ngữ Văn", "Tiếng Anh", "Vật Lý", "Hóa Học", "Sinh Học"],
            rooms: 15,
            staff: 30
        },
        { 
            id: 2, 
            title: "Kỳ thi thử Đại Học lần 1", 
            date: "15/12 - 22/12/2026", 
            status: "ĐANG LẬP KẾ HOẠCH", 
            statusType: "info", 
            candidates: "450 học sinh", 
            type: "Thử nghiệm",
            description: "Mô phỏng kỳ thi tốt nghiệp THPT để học sinh làm quen với áp lực phòng thi.",
            subjects: ["Toán", "Ngữ Văn", "Tiếng Anh", "KHTN", "KHXH"],
            rooms: 18,
            staff: 36
        },
        { 
            id: 3, 
            title: "Tuyển tập HSG cấp Trường", 
            date: "10/01/2027", 
            status: "ĐANG LẬP KẾ HOẠCH", 
            statusType: "info", 
            candidates: "120 học sinh", 
            type: "Bồi dưỡng",
            description: "Lọc ra những học sinh ưu tú nhất để tham gia các đội tuyển cấp Tỉnh.",
            subjects: ["Toán", "Lý", "Hóa", "Sinh", "Tin", "Anh"],
            rooms: 5,
            staff: 10
        },
        { 
            id: 4, 
            title: "Kiểm tra tập trung Khối 10", 
            date: "05/11/2026", 
            status: "SẮP TỚI", 
            statusType: "success", 
            candidates: "500 học sinh", 
            type: "Định kỳ",
            description: "Đánh giá chất lượng giảng dạy giữa học kỳ I cho học sinh mới vào trường.",
            subjects: ["Toán", "Ngữ Văn", "Tiếng Anh"],
            rooms: 16,
            staff: 32
        },
        { 
            id: 5, 
            title: "Kỳ thi nghề Phổ thông 2026", 
            date: "20/12/2026", 
            status: "ĐANG LẬP KẾ HOẠCH", 
            statusType: "info", 
            candidates: "380 học sinh", 
            type: "Chứng chỉ",
            description: "Cấp chứng chỉ nghề cho học sinh phục vụ xét tuyển tốt nghiệp.",
            subjects: ["Tin học", "Điện dân dụng", "May mặc"],
            rooms: 12,
            staff: 24
        },
        { 
            id: 6, 
            title: "Thi khảo sát năng lực Ngoại ngữ", 
            date: "15/01/2027", 
            status: "ĐANG LẬP KẾ HOẠCH", 
            statusType: "info", 
            candidates: "900 học sinh", 
            type: "Khảo sát",
            description: "Đánh giá trình độ tiếng Anh theo khung tham chiếu châu Âu.",
            subjects: ["Tiếng Anh"],
            rooms: 30,
            staff: 60
        },
    ];

    const allSubjects = ["Toán học", "Ngữ văn", "Tiếng Anh", "Vật lý", "Hóa học", "Sinh học", "Lịch sử", "Địa lý", "GDCD", "Tin học", "Công nghệ"];

    const targetOptions = [
        { value: "k10", label: "Khối 10" },
        { value: "k11", label: "Khối 11" },
        { value: "k12", label: "Khối 12" },
        { value: "all", label: "Toàn trường" },
    ];

    const typeOptions = [
        { value: "tt", label: "Tập trung toàn trường" },
        { value: "ks", label: "Khảo sát năng lực" },
        { value: "tn", label: "Thử nghiệm / Rèn luyện" },
        { value: "hsg", label: "Bồi dưỡng HSG" },
    ];

    const [selectedExam, setSelectedExam] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [createFormData, setCreateFormData] = useState({
        title: "",
        type: "tt",
        target: "k12",
        startDate: "",
        endDate: ""
    });

    const toggleSubject = (sub) => {
        setSelectedSubjects(prev => 
            prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
        );
    };

    const openDetail = (exam) => {
        setSelectedExam(exam);
        setIsDetailModalOpen(true);
    };

    const closeDetail = () => {
        setIsDetailModalOpen(false);
    };

    const openCreate = () => {
        setSelectedSubjects([]);
        setIsCreateModalOpen(true);
    }
    const closeCreate = () => setIsCreateModalOpen(false);

    return (
        <div className="vp-academic-exams">
            <PageHeader
                title="Quản Lý Kỳ Thi & Khối Thi"
                eyebrow="Kiểm soát lịch trình, phân phòng và tình trạng chuẩn bị"
                actions={
                    <div className="vpa-header-actions">
                        <SchoolYearTermSelector
                            selectedSchoolYear={selectedSchoolYear}
                            selectedTerm={selectedTerm}
                            onYearChange={handleYearArrow}
                            onTermChange={handleTermChange}
                            className="vpa-selector-override"
                        />
                    </div>
                }
            />

            <div className="exams-management-content">
                <div className="section-header-vpa-simple">
                    <div className="sh-left">
                        <FiBookOpen className="sh-icon" />
                        <span>Danh sách các kỳ thi ({exams.length})</span>
                    </div>
                    <Button variant="primary" onClick={openCreate} className="vpa-btn-main">
                        <FiPlus /> Tạo kỳ thi mới
                    </Button>
                </div>

                <div className="exams-grid-vpa">
                    {exams.map((exam, i) => (
                        <SectionCard key={i} className={`exam-card-vpa status-border-${exam.statusType}`}>
                            <div className="exam-card-header">
                                <StatusBadge status={exam.statusType}>{exam.status}</StatusBadge>
                            </div>
                            
                            <div className="exam-card-body">
                                <h4>{exam.title}</h4>
                                <div className="exam-meta-grid">
                                    <div className="meta-item">
                                        <FiCalendar className="m-icon" />
                                        <span>Thời gian: <strong>{exam.date}</strong></span>
                                    </div>
                                    <div className="meta-item">
                                        <FiUsers className="m-icon" />
                                        <span>Quy mô: <strong>{exam.candidates}</strong></span>
                                    </div>
                                    <div className="meta-item">
                                        <FiClock className="m-icon" />
                                        <span>Hình thức: <strong>{exam.type}</strong></span>
                                    </div>
                                </div>
                            </div>

                            <div className="exam-card-footer">
                                <Button variant="secondary" block onClick={() => openDetail(exam)}>
                                    Chi tiết & Xếp phòng
                                </Button>
                            </div>
                        </SectionCard>
                    ))}
                </div>

                <div className="vpa-pagination-wrapper">
                    <Pagination 
                        currentPage={currentPage} 
                        totalPages={10} 
                        onPageChange={setCurrentPage} 
                    />
                </div>
            </div>

            {/* DETAIL MODAL */}
            <Modal
                open={isDetailModalOpen}
                onClose={closeDetail}
                title={selectedExam?.title}
                className="vpa-detail-modal-fixed"
            >
                {selectedExam && (
                    <div className="vpa-modal-body-content">
                        <div className="info-section">
                            <div className="badge-row">
                                <StatusBadge status={selectedExam.statusType}>{selectedExam.status}</StatusBadge>
                            </div>
                            <p className="exam-desc">{selectedExam.description}</p>
                            
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <FiCalendar />
                                    <div>
                                        <span>Thời gian tổ chức</span>
                                        <strong>{selectedExam.date}</strong>
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <FiUsers />
                                    <div>
                                        <span>Quy mô thí sinh</span>
                                        <strong>{selectedExam.candidates}</strong>
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <FiClock />
                                    <div>
                                        <span>Hình thức thi</span>
                                        <strong>{selectedExam.type}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="subjects-section">
                            <h3>Môn thi dự kiến ({selectedExam.subjects.length})</h3>
                            <div className="subject-tags">
                                {selectedExam.subjects.map((sub, idx) => (
                                    <span key={idx} className="sub-tag">{sub}</span>
                                ))}
                            </div>
                        </div>

                        <div className="metrics-row">
                            <div className="metric-box">
                                <span className="label">Số phòng thi</span>
                                <span className="value">{selectedExam.rooms}</span>
                            </div>
                            <div className="metric-box">
                                <span className="label">Cán bộ coi thi</span>
                                <span className="value">{selectedExam.staff}</span>
                            </div>
                            <div className="metric-box">
                                <span className="label">Địa điểm</span>
                                <span className="value">Khu A & B</span>
                            </div>
                        </div>

                        <div className="modal-footer-custom">
                            <Button variant="secondary" onClick={closeDetail}>Đóng lại</Button>
                            <Button variant="primary" onClick={() => navigate('/vp-academic/exams/rooms')}>
                                Đi tới Xếp phòng & Lịch thi
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* CREATE MODAL */}
            <Modal
                open={isCreateModalOpen}
                onClose={closeCreate}
                title="Thiết lập kỳ thi mới"
                className="vpa-create-modal-fixed"
            >
                <form className="vpa-create-form" onSubmit={e => e.preventDefault()}>
                    <div className="form-section">
                        <h3>1. Thông tin chung</h3>
                        <Input 
                            label="Tên kỳ thi" 
                            placeholder="VD: Thi Giữa Học Kỳ II - Khối 12" 
                            value={createFormData.title}
                            onChange={e => setCreateFormData({...createFormData, title: e.target.value})}
                        />
                        <div className="form-group-custom">
                            <label className="ui-label">Mô tả kỳ thi</label>
                            <textarea className="ui-textarea" placeholder="Nhập mục tiêu hoặc lưu ý..." rows="2"></textarea>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>2. Thời gian & Hình thức</h3>
                        <div className="form-row">
                            <Input 
                                label="Ngày bắt đầu" 
                                type="date" 
                                value={createFormData.startDate}
                                onChange={e => setCreateFormData({...createFormData, startDate: e.target.value})}
                            />
                            <Input 
                                label="Ngày kết thúc" 
                                type="date" 
                                value={createFormData.endDate}
                                onChange={e => setCreateFormData({...createFormData, endDate: e.target.value})}
                            />
                        </div>
                        <Select 
                            variant="custom"
                            label="Hình thức tổ chức"
                            options={typeOptions}
                            value={createFormData.type}
                            onChange={e => setCreateFormData({...createFormData, type: e.target.value})}
                        />
                    </div>

                    <div className="form-section">
                        <h3>3. Quy mô & Môn thi</h3>
                        <div className="form-row">
                            <Input label="Sĩ số dự kiến" type="number" placeholder="450" />
                            <Select 
                                variant="custom"
                                label="Đối tượng"
                                options={targetOptions}
                                value={createFormData.target}
                                onChange={e => setCreateFormData({...createFormData, target: e.target.value})}
                            />
                        </div>
                        <div className="form-group-custom">
                            <label className="ui-label">Chọn môn thi ({selectedSubjects.length})</label>
                            <div className="subject-selection-grid">
                                {allSubjects.map((sub, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`selectable-sub ${selectedSubjects.includes(sub) ? 'selected' : ''}`}
                                        onClick={() => toggleSubject(sub)}
                                    >
                                        {sub}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer-custom">
                        <Button variant="secondary" onClick={closeCreate}>Hủy bỏ</Button>
                        <Button variant="primary" onClick={closeCreate}>Khởi tạo kỳ thi</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
