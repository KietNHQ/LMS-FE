import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import examService from "../../../../services/pages/management/exam/examService";
import { resolveSchoolYearId, resolveSemesterId } from "../../../../services/shared/schoolYearLookup";
import LoadingSpinner from "../../../../components/common/LoadingSpinner/LoadingSpinner";
import "./VpAcademicExams.css";

export default function VpAcademicExams() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();

    const { data: lookupIds = { schoolYearId: null, semesterId: null } } = useQuery({
        queryKey: ["school-year-lookup", selectedSchoolYear, selectedTerm],
        queryFn: async () => {
            const [schoolYearId, semesterId] = await Promise.all([
                resolveSchoolYearId(selectedSchoolYear),
                resolveSemesterId(selectedSchoolYear, selectedTerm),
            ]);
            return { schoolYearId, semesterId };
        },
    });

    // Fetch exams from API
    const {
        data: exams = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ["exams", lookupIds.semesterId, lookupIds.schoolYearId],
        queryFn: () => examService.listExams({
            semesterId: lookupIds.semesterId,
            schoolYearId: lookupIds.schoolYearId,
        }),
        enabled: !!lookupIds.semesterId || !!lookupIds.schoolYearId,
        staleTime: 5 * 60 * 1000,
    });

    // Normalize API exam data to match UI expectations
    const normalizeExam = (exam) => {
        // Handle API response fields
        const statusMap = {
            draft: "info",
            published: "success",
            completed: "secondary",
            cancelled: "danger",
        };

        const statusLabelMap = {
            draft: "BẢN NHÁP",
            published: "ĐÃ CÔNG BỐ",
            completed: "HOÀN TẤT",
            cancelled: "ĐÃ HỦY",
        };

        const typeMap = {
            midterm: "Giữa kỳ",
            final: "Cuối kỳ",
            quiz: "Kiểm tra",
            other: "Khác",
        };

        const rawStatus = String(exam.status || exam.state || "draft").toLowerCase();
        const rawType = String(exam.exam_type || exam.examType || "other").toLowerCase();

        return {
            id: exam.id,
            title: exam.title || exam.name || "Kỳ thi",
            date: exam.start_date ? new Date(exam.start_date).toLocaleDateString('vi-VN') : (exam.date || ""),
            status: statusLabelMap[rawStatus] || exam.status || "BẢN NHÁP",
            statusRaw: rawStatus,
            statusType: statusMap[rawStatus] || exam.statusType || "info",
            candidates: exam.candidates || exam.student_count ? `${exam.candidates || exam.student_count} học sinh` : "—",
            type: typeMap[rawType] || exam.examType || exam.type || "Khác",
            duration: exam.duration ? `${exam.duration} phút` : (exam.duration_text || "90 phút"),
            staffArrival: exam.staff_arrival || exam.staffArrival || "07:00",
            startTime: exam.start_time || exam.startTime || "07:30",
            description: exam.description || exam.desc || "",
            subjects: exam.subjects || exam.subject_list || exam.exam_subjects || [],
            rooms: exam.rooms || exam.room_count || exam.room || 0,
            staff: exam.staff || exam.invigilators || 0,
        };
    };

    const normalizedExams = exams.map(normalizeExam);
    const ITEMS_PER_PAGE = 6;
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(normalizedExams.length / ITEMS_PER_PAGE);

    const paginatedExams = normalizedExams.slice(
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
        { value: "midterm", label: "Thi giữa kỳ" },
        { value: "final", label: "Thi cuối kỳ" },
        { value: "quiz", label: "Kiểm tra / khảo sát" },
        { value: "other", label: "Khác" },
    ];

    const studentCountMap = {
        k10: 520,
        k11: 480,
        k12: 450,
        all: 1450
    };

    const [selectedExam, setSelectedExam] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [createFormData, setCreateFormData] = useState({
        title: "",
        type: "midterm",
        target: "k12",
        candidates: 450,
        startDate: "",
        endDate: "",
        startTime: "07:30",
        duration: "90",
        staffArrival: "07:00",
        description: "",
    });

    const resetCreateForm = () => {
        setSelectedSubjects([]);
        setCreateFormData({
            title: "",
            type: "midterm",
            target: "k12",
            candidates: 450,
            startDate: "",
            endDate: "",
            startTime: "07:30",
            duration: "90",
            staffArrival: "07:00",
            description: "",
        });
    };

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
        resetCreateForm();
        setIsCreateModalOpen(true);
    }
    const closeCreate = () => setIsCreateModalOpen(false);

    const getTargetLabel = (value) => targetOptions.find((item) => item.value === value)?.label || value;

    const createMutation = useMutation({
        mutationFn: async () => {
            if (!lookupIds.schoolYearId || !lookupIds.semesterId) {
                throw new Error("Không tìm thấy năm học hoặc học kỳ.");
            }
            if (!createFormData.title.trim()) {
                throw new Error("Vui lòng nhập tên kỳ thi.");
            }
            if (!createFormData.startDate) {
                throw new Error("Vui lòng chọn ngày bắt đầu.");
            }

            const details = [
                createFormData.description.trim(),
                selectedSubjects.length ? `Môn thi: ${selectedSubjects.join(", ")}` : "",
                `Đối tượng: ${getTargetLabel(createFormData.target)}`,
                `Giờ bắt đầu dự kiến: ${createFormData.startTime}`,
                `Thời lượng dự kiến: ${createFormData.duration} phút`,
                `Giáo viên có mặt: ${createFormData.staffArrival}`,
            ].filter(Boolean).join("\n");

            return examService.createExam({
                title: createFormData.title.trim(),
                examType: createFormData.type,
                schoolYearId: lookupIds.schoolYearId,
                semesterId: lookupIds.semesterId,
                startDate: createFormData.startDate,
                endDate: createFormData.endDate || createFormData.startDate,
                description: details,
                status: "draft",
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["exams"] });
            toast.success("Đã tạo kỳ thi ở trạng thái bản nháp.");
            setIsCreateModalOpen(false);
            resetCreateForm();
        },
        onError: (createError) => {
            toast.error(createError?.response?.data?.message || createError?.message || "Không thể tạo kỳ thi.");
        },
    });

    const publishMutation = useMutation({
        mutationFn: (examId) => examService.publishExam(examId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["exams"] });
            queryClient.invalidateQueries({ queryKey: ["school-events"] });
            toast.success("Đã công bố kỳ thi, thêm vào lịch sự kiện và gửi thông báo.");
            setIsDetailModalOpen(false);
        },
        onError: (publishError) => {
            toast.error(publishError?.response?.data?.message || publishError?.message || "Không thể công bố kỳ thi.");
        },
    });

    const handlePublishExam = () => {
        if (!selectedExam?.id) return;
        if (!window.confirm("Công bố kỳ thi sẽ hiển thị trên lịch sự kiện và gửi thông báo cho người dùng. Tiếp tục?")) {
            return;
        }
        publishMutation.mutate(selectedExam.id);
    };

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
                        <span>Danh sách các kỳ thi ({normalizedExams.length})</span>
                    </div>
                    <Button variant="primary" onClick={openCreate} className="vpa-btn-main">
                        <FiPlus /> Tạo kỳ thi mới
                    </Button>
                </div>

                {isLoading ? (
                    <div style={{ textAlign: "center", padding: "3rem" }}>
                        <LoadingSpinner size="lg" label="Đang tải danh sách kỳ thi..." />
                    </div>
                ) : error ? (
                    <div style={{ textAlign: "center", padding: "3rem", color: "#c0392b" }}>
                        <p>Đã xảy ra lỗi khi tải danh sách kỳ thi.</p>
                        <p style={{ fontSize: "0.9rem" }}>{error.message || "Vui lòng thử lại sau."}</p>
                    </div>
                ) : paginatedExams.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
                        <p>Chưa có kỳ thi nào cho học kỳ này.</p>
                        <Button variant="primary" onClick={openCreate} style={{ marginTop: "1rem" }}>
                            <FiPlus /> Tạo kỳ thi đầu tiên
                        </Button>
                    </div>
                ) : (
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
                                        <FiUsers className="m-icon" style={{ color: 'var(--admin-primary)' }} />
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
                    <div className="vpa-pagination-wrapper">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                    </div>
                )}

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
                                    <div className="dash-icon" style={{ color: 'var(--admin-primary)' }}><FiUsers /></div>
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
                            {selectedExam.statusRaw !== "published" && (
                                <Button
                                    variant="secondary"
                                    onClick={handlePublishExam}
                                    disabled={publishMutation.isPending}
                                >
                                    {publishMutation.isPending ? "Đang công bố..." : "Công bố & gửi thông báo"}
                                </Button>
                            )}
                            <Button
                                variant="primary"
                                className="vpa-btn-main"
                                onClick={() => navigate('/management/exams/rooms', {
                                    state: { examId: selectedExam.id, examName: selectedExam.title }
                                })}
                            >
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
                            <textarea
                                className="ui-textarea"
                                placeholder="Nhập mục tiêu hoặc lưu ý..."
                                rows="2"
                                value={createFormData.description}
                                onChange={e => setCreateFormData({...createFormData, description: e.target.value})}
                            />
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
                            <Input 
                                label="Sĩ số dự kiến" 
                                type="number" 
                                placeholder="450" 
                                value={createFormData.candidates}
                                readOnly
                            />
                            <Select 
                                variant="custom"
                                label="Đối tượng"
                                options={targetOptions}
                                value={createFormData.target}
                                onChange={e => {
                                    const val = e.target.value;
                                    setCreateFormData({
                                        ...createFormData, 
                                        target: val,
                                        candidates: studentCountMap[val] || 0
                                    });
                                }}
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
                        <Button
                            variant="primary"
                            onClick={() => createMutation.mutate()}
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending ? "Đang khởi tạo..." : "Khởi tạo kỳ thi"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
