import React, { useState, useEffect, useMemo } from "react";
import { FiX, FiCheck, FiUser, FiCalendar, FiPlus, FiAlertCircle, FiInfo, FiSearch, FiLayers, FiAlertOctagon } from "react-icons/fi";
import { toast } from "react-toastify";
import Select from "../../../components/ui/Select/Select";
import "./ViolationRecordModal.css";

const MOCK_STUDENTS = [
    { id: "HS001", name: "Nguyễn Văn A", class: "10A1", grade: "10", dob: "12/05/2010", parentName: "Nguyễn Văn B" },
    { id: "HS002", name: "Trần Thị B", class: "11A5", grade: "11", dob: "22/08/2009", parentName: "Trần Văn C" },
    { id: "HS003", name: "Lê Văn C", class: "12A2", grade: "12", dob: "05/02/2008", parentName: "Lê Thị D" },
    { id: "HS004", name: "Phạm Minh D", class: "10A1", grade: "10", dob: "15/11/2010", parentName: "Phạm Văn E" },
    { id: "HS005", name: "Hoàng Anh E", class: "10A2", grade: "10", dob: "30/01/2010", parentName: "Hoàng Văn F" },
    { id: "HS006", name: "Vũ Thu F", class: "11B1", grade: "11", dob: "14/07/2009", parentName: "Vũ Văn G" },
];

const VIOLATION_CATEGORIES = [
    { value: "attendance", label: "Chuyên cần", types: ["Đi trễ", "Vắng không phép", "Trốn học/Bỏ tiết", "Bỏ giờ trong tiết"] },
    { value: "discipline", label: "Nề nếp - Tác phong", types: ["Đồng phục/tác phong", "Mất trật tự", "Nói tục/chửi thề", "Dùng ĐT trái phép", "Gây gổ/Đánh nhau"] },
    { value: "property", label: "Tài sản - Môi trường", types: ["Hư hỏng tài sản", "Vẽ bậy", "Vứt rác bừa bãi", "Không tắt điện/quạt"] },
    { value: "academic", label: "Học tập", types: ["Không làm bài tập", "Không mang sách vở", "Gian lận thi cử", "Không tham gia ngoại khóa"] },
];

export default function ViolationRecordModal({ isOpen, onClose, onSuccess, incidents = [] }) {
    const [selectedGrade, setSelectedGrade] = useState("10");
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedStudentId, setSelectedStudentId] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("attendance");
    const [selectedType, setSelectedType] = useState("");
    const [comment, setComment] = useState("");

    const resetForm = () => {
        setSelectedGrade("10");
        setSelectedClass("");
        setSelectedStudentId("");
        setSelectedCategory("attendance");
        setSelectedType("");
        setComment("");
    };

    // Reset Class when Grade changes
    useEffect(() => {
        setSelectedClass("");
        setSelectedStudentId("");
    }, [selectedGrade]);

    // Reset Student when Class changes
    useEffect(() => {
        setSelectedStudentId("");
    }, [selectedClass]);

    // Options mapping
    const classOptions = useMemo(() => {
        const classes = [...new Set(MOCK_STUDENTS.filter(s => s.grade === selectedGrade).map(s => s.class))];
        return classes.map(c => ({ value: c, label: c }));
    }, [selectedGrade]);

    const studentOptions = useMemo(() => {
        return MOCK_STUDENTS
            .filter(s => s.class === selectedClass)
            .map(s => ({ value: s.id, label: `${s.name} (${s.id})` }));
    }, [selectedClass]);

    const violationTypeOptions = useMemo(() => {
        const cat = VIOLATION_CATEGORIES.find(c => c.value === selectedCategory);
        return cat ? cat.types.map(t => ({ value: t, label: t })) : [];
    }, [selectedCategory]);

    const selectedStudent = useMemo(() => 
        MOCK_STUDENTS.find(s => s.id === selectedStudentId), 
    [selectedStudentId]);

    // Auto Severity Logic
    const severityInfo = useMemo(() => {
        if (!selectedStudent || !selectedCategory) return { level: "low", count: 0 };
        
        // Count history - simplified logic: count by category
        const historyCount = incidents.filter(inc => 
            inc.student === selectedStudent.name && 
            inc.class === selectedStudent.class
        ).length;

        let level = "low";
        if (historyCount >= 5) level = "high";
        else if (historyCount >= 3) level = "med";

        return { level, count: historyCount };
    }, [selectedStudent, selectedCategory, incidents]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedStudentId || !selectedType) {
            toast.error("Vui lòng chọn đầy đủ học sinh và loại vi phạm!");
            return;
        }

        const newInc = {
            id: Date.now(),
            student: selectedStudent.name,
            class: selectedStudent.class,
            grade: selectedStudent.grade,
            type: selectedType,
            level: severityInfo.level,
            date: new Date().toLocaleDateString('vi-VN'),
            reporter: "PHT Nề nếp (Tôi)",
            comment: comment
        };

        onSuccess(newInc);
        toast.success(`Đã ghi nhận vi phạm cho ${selectedStudent.name}!`);
        
        resetForm();
        onClose();
    };

    const handleCancel = () => {
        resetForm();
        onClose();
    };

    return (
        <div className="vrm-overlay vp-discipline-layout" onClick={onClose}>
            <div className="vrm-container" onClick={e => e.stopPropagation()}>
                <div className="vrm-header">
                    <div className="header-icon"><FiPlus /></div>
                    <div className="header-text">
                        <h2>Ghi Nhận Vi Phụ Mới</h2>
                        <p>Hệ thống tự động tra cứu lịch sử và định mức vi phạm</p>
                    </div>
                    <button className="vrm-close" onClick={onClose}><FiX /></button>
                </div>

                <form className="vrm-body custom-scrollbar" onSubmit={handleSubmit}>
                    {/* HIERARCHICAL FILTERS */}
                    <div className="vrm-section-title"><FiLayers /> 1. Đối tượng vi phạm</div>
                    <div className="vrm-grid">
                        <div className="vrm-field">
                            <label>Khối</label>
                            <Select 
                                variant="custom"
                                value={selectedGrade} 
                                onChange={e => setSelectedGrade(e.target.value)}
                                options={[
                                    { value: "10", label: "Khối 10" },
                                    { value: "11", label: "Khối 11" },
                                    { value: "12", label: "Khối 12" }
                                ]}
                            />
                        </div>
                        <div className="vrm-field">
                            <label>Lớp</label>
                            <Select 
                                variant="custom"
                                value={selectedClass} 
                                onChange={e => setSelectedClass(e.target.value)}
                                placeholder="Chọn lớp..."
                                options={classOptions}
                                disabled={!selectedGrade}
                            />
                        </div>
                    </div>

                    <div className="vrm-field full-width mt-md">
                        <label>Học sinh</label>
                        <Select 
                            variant="custom"
                            searchable={true}
                            value={selectedStudentId} 
                            onChange={e => setSelectedStudentId(e.target.value)}
                            placeholder="Tìm kiếm theo tên hoặc mã số học sinh..."
                            options={studentOptions}
                            disabled={!selectedClass}
                        />
                    </div>

                    {/* STUDENT INFO CARD */}
                    {selectedStudent && (
                        <div className="vrm-student-card">
                            <div className="s-card-avatar">{selectedStudent.name.charAt(0)}</div>
                            <div className="s-card-info">
                                <div className="s-card-row">
                                    <span className="s-label">Mã số:</span>
                                    <span className="s-value">{selectedStudent.id}</span>
                                </div>
                                <div className="s-card-row">
                                    <span className="s-label">Ngày sinh:</span>
                                    <span className="s-value">{selectedStudent.dob}</span>
                                </div>
                                <div className="s-card-row">
                                    <span className="s-label">Phụ huynh:</span>
                                    <span className="s-value">{selectedStudent.parentName}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="vrm-divider"></div>

                    {/* VIOLATION DETAILS */}
                    <div className="vrm-section-title"><FiAlertOctagon /> 2. Chi tiết vi phạm</div>
                    <div className="vrm-grid">
                        <div className="vrm-field">
                            <label>Nhóm vi phạm</label>
                            <Select 
                                variant="custom"
                                value={selectedCategory} 
                                onChange={e => setSelectedCategory(e.target.value)}
                                options={VIOLATION_CATEGORIES.map(c => ({ value: c.value, label: c.label }))}
                            />
                        </div>
                        <div className="vrm-field">
                            <label>Loại lỗi cụ thể</label>
                            <Select 
                                variant="custom"
                                value={selectedType} 
                                onChange={e => setSelectedType(e.target.value)}
                                placeholder="Chọn lỗi..."
                                options={violationTypeOptions}
                            />
                        </div>
                    </div>

                    {/* AUTO SEVERITY INDICATOR */}
                    {selectedStudent && (
                        <div className={`vrm-severity-indicator ${severityInfo.level}`}>
                            <FiInfo />
                            <div className="severity-text">
                                <p>Mức độ tự động: <strong>{severityInfo.level === 'high' ? 'Nghiêm trọng' : (severityInfo.level === 'med' ? 'Vừa (Cảnh cáo)' : 'Nhẹ (Nhắc nhở)')}</strong></p>
                                <span>(Dựa trên {severityInfo.count} lượt vi phạm trước đó của học sinh này)</span>
                            </div>
                        </div>
                    )}

                    <div className="vrm-field full-width mt-md">
                        <label>Mô tả chi tiết sự vụ (nếu có)</label>
                        <textarea 
                            className="vrm-textarea" 
                            placeholder="Ghi chú thêm về hoàn cảnh, tang vật hoặc thái độ học sinh..." 
                            value={comment} 
                            onChange={e => setComment(e.target.value)}
                        ></textarea>
                    </div>

                    <div className="vrm-footer">
                        <button type="button" className="btn-vrm-secondary" onClick={handleCancel}>Hủy bỏ</button>
                        <button type="submit" className="btn-vrm-primary">
                            <FiCheck /> Lưu Hồ Sơ
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
