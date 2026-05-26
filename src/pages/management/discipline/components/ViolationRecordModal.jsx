import React, { useState, useEffect, useMemo } from "react";
import { FiX, FiCheck, FiUser, FiCalendar, FiPlus, FiAlertCircle, FiInfo, FiSearch, FiLayers, FiAlertOctagon, FiActivity, FiEdit2 } from "react-icons/fi";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import Select from "../../../../components/ui/Select/Select";
import { vpDisciplineService } from "../../../../services/pages/management/vp-discipline";
import { resolveSemesterId } from "../../../../services/shared/schoolYearLookup";
import "./ViolationRecordModal.css";

// REMOVED: MOCK_STUDENTS - now fetched from API
// REMOVED: VIOLATION_CATEGORIES - now fetched from API

export default function ViolationRecordModal({ isOpen, onClose, onSuccess, incidents = [], editData = null, selectedSchoolYear, selectedTerm }) {
    const [selectedGrade, setSelectedGrade] = useState("10");
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedStudentId, setSelectedStudentId] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [selectedLevel, setSelectedLevel] = useState("low");
    const [comment, setComment] = useState("");

    const isEdit = !!editData;

    // Resolve semesterId for API calls
    const { data: semesterId } = useQuery({
        queryKey: ["semester-id", selectedSchoolYear, selectedTerm],
        queryFn: () => resolveSemesterId(selectedSchoolYear, selectedTerm || "hk1"),
        enabled: Boolean(selectedSchoolYear),
    });

    // Fetch students from API
    const { data: apiStudents = [] } = useQuery({
        queryKey: ["class-students", selectedClass],
        queryFn: async () => {
            const res = await vpDisciplineService.callByKey("get_classes_by_id_students", {
                pathParams: { id: selectedClass },
            });
            return res?.data || res || [];
        },
        enabled: Boolean(selectedClass),
    });

    // Fetch violation types from API
    const { data: apiViolationTypes = [] } = useQuery({
        queryKey: ["violation-types"],
        queryFn: async () => {
            const res = await vpDisciplineService.callByKey("get_violation_types");
            return res?.data || res || [];
        },
    });

    // Transform API students to component format
    const students = useMemo(() => {
        return apiStudents.map(s => ({
            id: s.id || s.student_id || s.enrollmentId || s.studentEnrollmentId,
            name: s.name || s.full_name || s.studentName || "",
            class: s.class_name || s.className || s.class || "",
            grade: s.grade || s.grade_level || s.gradeLevel || selectedGrade,
            dob: s.dob || s.date_of_birth || s.dateOfBirth || "",
            parentName: s.parent_name || s.parentName || s.guardianName || "",
            enrollmentId: s.enrollmentId || s.studentEnrollmentId || s.id,
        }));
    }, [apiStudents, selectedGrade]);

    // Build violation categories from API data
    const violationCategories = useMemo(() => {
        if (!apiViolationTypes.length) return [];
        // Group by category if available, otherwise create single category
        const categoryMap = {};
        apiViolationTypes.forEach(vt => {
            const cat = vt.category || vt.violation_category || "other";
            if (!categoryMap[cat]) {
                categoryMap[cat] = { value: cat, label: formatCategoryLabel(cat), types: [] };
            }
            categoryMap[cat].types.push({
                value: vt.id,
                label: vt.name || vt.violation_name || vt.description || "",
                points: vt.default_points || vt.points || 0,
                severity: vt.severity || "low",
            });
        });
        return Object.values(categoryMap);
    }, [apiViolationTypes]);

    const formatCategoryLabel = (cat) => {
        const labels = {
            attendance: "Chuyên cần",
            discipline: "Nề nếp - Tác phong",
            property: "Tài sản - Môi trường",
            academic: "Học tập",
            uniform: "Đồng phục",
            other: "Khác",
        };
        return labels[cat] || cat;
    };

    // Reset or Populate form
    const resetForm = () => {
        if (editData) {
            setSelectedGrade(editData.grade || "10");
            setSelectedClass(editData.class || "");
            // In a real app we'd find the student ID by name/class
            // For mock, we'll try to find student by name
            const student = students.find(s => s.name === editData.student && s.class === editData.class);
            setSelectedStudentId(student?.id || editData.studentEnrollmentId || "");

            // Map category back from type if possible, else default
            const category = violationCategories.find(c => c.types.some(t => t.label === editData.type))?.value || editData.category || "";
            setSelectedCategory(category);
            setSelectedType(editData.typeId || editData.type || "");
            setSelectedLevel(editData.level || "low");
            setComment(editData.comment || "");
        } else {
            setSelectedGrade("10");
            setSelectedClass("");
            setSelectedStudentId("");
            setSelectedCategory(violationCategories[0]?.value || "");
            setSelectedType("");
            setSelectedLevel("low");
            setComment("");
        }
    };

    useEffect(() => {
        if (isOpen) resetForm();
    }, [isOpen, editData]);

    // Reset Class when Grade changes
    useEffect(() => {
        setSelectedClass("");
        setSelectedStudentId("");
    }, [selectedGrade]);

    // Reset Student when Class changes
    useEffect(() => {
        setSelectedStudentId("");
    }, [selectedClass]);

    // Update category when violationTypes load
    useEffect(() => {
        if (violationCategories.length && !selectedCategory) {
            setSelectedCategory(violationCategories[0].value);
        }
    }, [violationCategories]);

    // Options mapping
    const classOptions = useMemo(() => {
        const classes = [...new Set(students.filter(s => s.grade === selectedGrade).map(s => s.class))];
        return classes.map(c => ({ value: c, label: c }));
    }, [selectedGrade, students]);

    const studentOptions = useMemo(() => {
        return students
            .filter(s => s.class === selectedClass)
            .map(s => ({ value: s.id, label: `${s.name} (${s.id})` }));
    }, [selectedClass, students]);

    const violationTypeOptions = useMemo(() => {
        const cat = violationCategories.find(c => c.value === selectedCategory);
        return cat ? cat.types.map(t => ({ value: t.value, label: t.label })) : [];
    }, [selectedCategory, violationCategories]);

    const selectedStudent = useMemo(() =>
        students.find(s => s.id === selectedStudentId),
    [selectedStudentId, students]);

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

    // Auto-update level when severity info changes
    useEffect(() => {
        if (severityInfo.level) {
            setSelectedLevel(severityInfo.level);
        }
    }, [severityInfo.level]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedStudentId || !selectedType) {
            toast.error("Vui lòng chọn đầy đủ học sinh và loại vi phạm!");
            return;
        }

        const selectedCat = violationCategories.find(c => c.value === selectedCategory);
        const selectedViolationType = selectedCat?.types.find(t => t.value === selectedType);

        try {
            if (isEdit) {
                // Update existing violation
                await vpDisciplineService.callByKey("put_discipline_violations_by_id", {
                    pathParams: { id: editData.id },
                    body: {
                        violationTypeId: selectedType,
                        notes: comment,
                        status: selectedLevel,
                    },
                });
                toast.success("Đã cập nhật thông tin vi phạm!");
            } else {
                // Create new violation
                const selectedStudentData = students.find(s => s.id === selectedStudentId);
                await vpDisciplineService.callByKey("post_discipline_violations", {
                    body: {
                        studentEnrollmentId: selectedStudentData?.enrollmentId || selectedStudentId,
                        violationTypeId: selectedType,
                        semesterId: semesterId,
                        date: new Date().toISOString().split('T')[0],
                        pointsDeducted: selectedViolationType?.points || 0,
                        notes: comment,
                        severity: selectedLevel,
                    },
                });
                toast.success("Đã ghi nhận vi phạm cho " + selectedStudentData?.name + "!");
            }

            resetForm();
            onClose();
            if (onSuccess) onSuccess();
        } catch (error) {
            toast.error(error?.message || "Không thể lưu vi phạm. Vui lòng thử lại.");
        }
    };

    const handleCancel = () => {
        resetForm();
        onClose();
    };

    return (
        <div className="vrm-overlay vp-discipline-layout" onClick={onClose}>
            <div className="vrm-container" onClick={e => e.stopPropagation()}>
                <div className="vrm-header">
                    <div className="header-icon">{isEdit ? <FiEdit2 /> : <FiPlus />}</div>
                    <div className="header-text">
                        <h2>{isEdit ? "Cập Nhật Hồ Sơ Vi Phạm" : "Ghi Nhận Vi Phạm Mới"}</h2>
                        <p>{isEdit ? `Đang chỉnh sửa mã hồ sơ: #${editData.id}` : "Hệ thống tự động tra cứu lịch sử và định mức vi phạm"}</p>
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
                                options={violationCategories.map(c => ({ value: c.value, label: c.label }))}
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

                    {/* SEVERITY SELECTION */}
                    <div className="vrm-divider"></div>
                    <div className="vrm-section-title"><FiActivity /> 3. Mức độ & Xử lý</div>
                    
                    <div className="vrm-grid">
                        <div className="vrm-field">
                            <label>Mức độ vi phạm</label>
                            <Select 
                                variant="custom"
                                value={selectedLevel} 
                                onChange={e => setSelectedLevel(e.target.value)}
                                options={[
                                    { value: "low", label: "Nhẹ (Nhắc nhở)" },
                                    { value: "med", label: "Vừa (Cảnh cáo)" },
                                    { value: "high", label: "Nghiêm trọng (Kỷ luật)" }
                                ]}
                            />
                        </div>
                        <div className="vrm-field">
                            {selectedStudent && (
                                <div className={`vrm-severity-indicator-compact ${severityInfo.level}`}>
                                    <FiInfo />
                                    <div className="severity-text">
                                        <p>Gợi ý hệ thống: <strong>{severityInfo.level === 'high' ? 'Nghiêm trọng' : (severityInfo.level === 'med' ? 'Vừa' : 'Nhẹ')}</strong></p>
                                        <span>(Vi phạm lần {severityInfo.count + 1})</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

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
                            {isEdit ? <FiCheck /> : <FiCheck />} {isEdit ? "Cập nhật Hồ sơ" : "Lưu Hồ Sơ"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

