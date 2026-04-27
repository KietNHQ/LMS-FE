import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
    SchoolYearTermSelector, 
    Pagination, 
    PageHeader, 
    StatusBadge, 
    SectionCard 
} from "../../../../components/common";
import { Button, Input, Select, Modal } from "../../../../components/ui";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import { FiCalendar, FiPlus, FiClock, FiUsers, FiBookOpen } from "react-icons/fi";
import { toast } from "react-toastify";
import "./VpAcademicExams.css";

export default function VpAcademicExams() {
    const navigate = useNavigate();
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();

    const exams = [
        { id: 1, title: "Thi Giữa Học Kỳ II - Môn Toán - Khối 12", date: "25/11/2026", status: "SẮP TỚI", statusType: "success", candidates: "450 học sinh", type: "Tập trung", duration: "90 phút", staffArrival: "07:15", startTime: "07:30", description: "Kỳ thi đánh giá năng lực môn Toán học kỳ II cho toàn bộ học sinh khối 12.", subjects: ["Toán học"], rooms: 15, staff: 30 },
        { id: 2, title: "Thi Giữa Học Kỳ II - Môn Ngữ Văn - Khối 12", date: "25/11/2026", status: "SẮP TỚI", statusType: "success", candidates: "450 học sinh", type: "Tập trung", duration: "120 phút", staffArrival: "13:45", startTime: "14:00", description: "Kỳ thi đánh giá năng lực môn Ngữ văn học kỳ II cho toàn bộ học sinh khối 12.", subjects: ["Ngữ văn"], rooms: 15, staff: 30 },
        { id: 3, title: "Thi thử Đại học Lần 1 - Môn Tiếng Anh - Khối 12", date: "15/12/2026", status: "ĐANG LẬP KẾ HOẠCH", statusType: "info", candidates: "450 học sinh", type: "Thử nghiệm", duration: "60 phút", staffArrival: "07:30", startTime: "08:00", description: "Mô phỏng kỳ thi tốt nghiệp THPT môn Tiếng Anh.", subjects: ["Tiếng Anh"], rooms: 18, staff: 36 },
        { id: 4, title: "Kiểm tra tập trung - Môn Vật lý - Khối 11", date: "20/11/2026", status: "SẮP TỚI", statusType: "success", candidates: "480 học sinh", type: "Định kỳ", duration: "45 phút", staffArrival: "07:30", startTime: "07:45", description: "Kiểm tra kiến thức chương I & II môn Vật lý.", subjects: ["Vật lý"], rooms: 16, staff: 32 },
        { id: 5, title: "Thi HSG Cấp Trường - Môn Hóa Học - Khối 10,11,12", date: "10/01/2027", status: "ĐANG LẬP KẾ HOẠCH", statusType: "info", candidates: "120 học sinh", type: "Bồi dưỡng", duration: "150 phút", staffArrival: "07:00", startTime: "07:30", description: "Tuyển chọn đội tuyển học sinh giỏi môn Hóa học.", subjects: ["Hóa học"], rooms: 5, staff: 10 },
        { id: 6, title: "Khảo sát năng lực - Môn Tiếng Anh - Khối 10", date: "15/11/2026", status: "SẮP TỚI", statusType: "success", candidates: "520 học sinh", type: "Khảo sát", duration: "60 phút", staffArrival: "13:30", startTime: "14:00", description: "Đánh giá trình độ tiếng Anh đầu vào học kỳ I.", subjects: ["Tiếng Anh"], rooms: 18, staff: 36 },
        { id: 7, title: "Thi Giữa Học Kỳ II - Môn Sinh Học - Khối 12", date: "26/11/2026", status: "SẮP TỚI", statusType: "success", candidates: "450 học sinh", type: "Tập trung", duration: "60 phút", staffArrival: "07:30", startTime: "08:00", description: "Đánh giá năng lực môn Sinh học.", subjects: ["Sinh học"], rooms: 15, staff: 30 },
        { id: 8, title: "Thi Giữa Học Kỳ II - Môn Lịch Sử - Khối 12", date: "26/11/2026", status: "SẮP TỚI", statusType: "success", candidates: "450 học sinh", type: "Tập trung", duration: "45 phút", staffArrival: "13:30", startTime: "14:00", description: "Đánh giá năng lực môn Lịch sử.", subjects: ["Lịch sử"], rooms: 15, staff: 30 },
        { id: 9, title: "Thi Giữa Học Kỳ II - Môn Địa Lý - Khối 12", date: "27/11/2026", status: "SẮP TỚI", statusType: "success", candidates: "450 học sinh", type: "Tập trung", duration: "45 phút", staffArrival: "07:30", startTime: "08:00", description: "Đánh giá năng lực môn Địa lý.", subjects: ["Địa lý"], rooms: 15, staff: 30 },
        { id: 10, title: "Thi Giữa Học Kỳ II - Môn GDCD - Khối 12", date: "27/11/2026", status: "SẮP TỚI", statusType: "success", candidates: "450 học sinh", type: "Tập trung", duration: "45 phút", staffArrival: "13:30", startTime: "14:00", description: "Đánh giá năng lực môn GDCD.", subjects: ["GDCD"], rooms: 15, staff: 30 },
        { id: 11, title: "Thi thử Đại học Lần 2 - Môn Toán - Khối 12", date: "15/02/2027", status: "ĐANG LẬP KẾ HOẠCH", statusType: "info", candidates: "450 học sinh", type: "Thử nghiệm", duration: "90 phút", staffArrival: "07:15", startTime: "07:30", description: "Lần thi thử thứ 2 để rà soát kiến thức.", subjects: ["Toán học"], rooms: 15, staff: 30 },
        { id: 12, title: "Kiểm tra năng lực số - Khối 10,11", date: "05/12/2026", status: "ĐANG LẬP KẾ HOẠCH", statusType: "info", candidates: "1000 học sinh", type: "Khảo sát", duration: "45 phút", staffArrival: "08:00", startTime: "08:30", description: "Khảo sát kỹ năng sử dụng công nghệ số.", subjects: ["Tin học"], rooms: 35, staff: 70 },
    ];

    const ITEMS_PER_PAGE = 6;
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(exams.length / ITEMS_PER_PAGE);
    
    const paginatedExams = exams.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

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
        endDate: "",
        startTime: "07:30",
        duration: "90",
        staffArrival: "07:00"
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
                    {paginatedExams.map((exam, i) => (
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
                                        <span>Thời lượng: <strong>{exam.duration}</strong></span>
                                    </div>
                                    <div className="meta-item">
                                        <FiUsers className="m-icon" style={{ color: '#3b82f6' }} />
                                        <span>G/v có mặt: <strong>{exam.staffArrival}</strong></span>
                                    </div>
                                </div>
                            </div>

                            <div className="exam-card-footer">
                                <Button variant="secondary" block onClick={() => openDetail(exam)}>
                                    Xếp phòng
                                </Button>
                            </div>
                        </SectionCard>
                    ))}
                </div>

                <div className="vpa-pagination-wrapper">
                    <Pagination 
                        currentPage={currentPage} 
                        totalPages={totalPages} 
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
                        <div className="info-section-premium">
                            <div className="top-badge-row">
                                <StatusBadge status={selectedExam.statusType}>{selectedExam.status}</StatusBadge>
                                <span className="exam-type-tag"><FiClock /> {selectedExam.type}</span>
                            </div>
                            <p className="exam-desc-premium">{selectedExam.description}</p>
                            
                            <div className="stats-dashboard-grid">
                                <div className="dash-item">
                                    <div className="dash-icon"><FiCalendar /></div>
                                    <div className="dash-info">
                                        <label>Thời gian tổ chức</label>
                                        <strong>{selectedExam.date}</strong>
                                    </div>
                                </div>
                                <div className="dash-item">
                                    <div className="dash-icon"><FiClock /></div>
                                    <div className="dash-info">
                                        <label>Thời lượng & Giờ thi</label>
                                        <strong>{selectedExam.duration} • {selectedExam.startTime || '07:30'}</strong>
                                    </div>
                                </div>
                                <div className="dash-item">
                                    <div className="dash-icon"><FiUsers /></div>
                                    <div className="dash-info">
                                        <label>Quy mô thí sinh</label>
                                        <strong>{selectedExam.candidates}</strong>
                                    </div>
                                </div>
                                <div className="dash-item">
                                    <div className="dash-icon" style={{ color: '#3b82f6' }}><FiUsers /></div>
                                    <div className="dash-info">
                                        <label>Giám thị tập trung</label>
                                        <strong>{selectedExam.staffArrival}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="preparation-progress-section">
                            <div className="section-header">
                                <h3>Tiến độ chuẩn bị</h3>
                                <span className="percent-complete">85% Hoàn tất</span>
                            </div>
                            
                            <div className="vpa-stepper">
                                <div className="step-item done">
                                    <div className="step-circle">1</div>
                                    <span className="step-label">Lên kế hoạch</span>
                                </div>
                                <div className="step-item done">
                                    <div className="step-circle">2</div>
                                    <span className="step-label">Chọn môn thi</span>
                                </div>
                                <div className="step-item active">
                                    <div className="step-circle">3</div>
                                    <span className="step-label">Phân phòng thi</span>
                                </div>
                                <div className="step-item">
                                    <div className="step-circle">4</div>
                                    <span className="step-label">Gửi thông báo</span>
                                </div>
                            </div>
                        </div>

                        <div className="subjects-section-premium">
                            <h3>Môn thi dự kiến ({selectedExam.subjects.length})</h3>
                            <div className="subject-tags-grid">
                                {selectedExam.subjects.map((sub, idx) => (
                                    <span key={idx} className="sub-tag-premium">{sub}</span>
                                ))}
                            </div>
                        </div>

                        <div className="metrics-summary-row">
                            <div className="summary-box">
                                <span className="label">Số phòng thi</span>
                                <span className="value">{selectedExam.rooms}</span>
                            </div>
                            <div className="summary-box">
                                <span className="label">Cán bộ coi thi</span>
                                <span className="value">{selectedExam.staff}</span>
                            </div>
                            <div className="summary-box">
                                <span className="label">Địa điểm</span>
                                <span className="value">Khu A & B</span>
                            </div>
                        </div>

                        <div className="modal-footer-premium">
                            <Button variant="secondary" onClick={closeDetail}>Đóng</Button>
                            <Button variant="primary" className="vpa-btn-main" onClick={() => navigate('/vp-academic/exams/rooms')}>
                                Xếp phòng
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
                        <div className="form-row" style={{ marginTop: '0.5rem' }}>
                            <Input 
                                label="Giờ bắt đầu thi" 
                                type="time" 
                                value={createFormData.startTime}
                                onChange={e => setCreateFormData({...createFormData, startTime: e.target.value})}
                            />
                            <Input 
                                label="Thời lượng (phút)" 
                                type="number" 
                                placeholder="VD: 90"
                                value={createFormData.duration}
                                onChange={e => setCreateFormData({...createFormData, duration: e.target.value})}
                            />
                            <Input 
                                label="Giờ G/v có mặt" 
                                type="time" 
                                value={createFormData.staffArrival}
                                onChange={e => setCreateFormData({...createFormData, staffArrival: e.target.value})}
                            />
                        </div>
                        <Select 
                            variant="custom"
                            label="Hình thức tổ chức"
                            options={typeOptions}
                            value={createFormData.type}
                            onChange={e => setCreateFormData({...createFormData, type: e.target.value})}
                            style={{ marginTop: '0.5rem' }}
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
