import React, { useState, useEffect, useMemo } from "react";
import { 
    FiX, FiCheck, FiUser, FiLayers, FiAward, 
    FiStar, FiTrendingUp, FiHeart, FiSettings 
} from "react-icons/fi";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import Select from "../../../../components/ui/Select/Select";
import { vpDisciplineService } from "../../../../services/pages/management/vp-discipline";
import "./BonusPointModal.css";

// REMOVED: MOCK_STUDENTS - now fetched from API
// REMOVED: REWARD_CATEGORIES - now fetched from API

export default function BonusPointModal({ isOpen, onClose, onSuccess, initialClass = "all", selectedSchoolYear, selectedTerm }) {
    const [targetType, setTargetType] = useState("collective"); // 'collective' or 'individual'
    const [selectedGrade, setSelectedGrade] = useState("10");
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedStudentId, setSelectedStudentId] = useState("");
    
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedReasonKey, setSelectedReasonKey] = useState("");
    const [customPoints, setCustomPoints] = useState("");
    const [comment, setComment] = useState("");

    // Resolve semesterId for API calls
    const { data: semesterId } = useQuery({
        queryKey: ["semester-id", selectedSchoolYear, selectedTerm],
        queryFn: async () => {
            const { resolveSemesterId } = await import("../../../../services/shared/schoolYearLookup");
            return resolveSemesterId(selectedSchoolYear, selectedTerm || "hk1");
        },
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

    // Fetch reward types from API
    const { data: apiRewardTypes = [] } = useQuery({
        queryKey: ["reward-types"],
        queryFn: async () => {
            const res = await vpDisciplineService.callByKey("get_reward_types");
            return res?.data || res || [];
        },
    });

    // Fetch grade levels from API
    const { data: gradeLevelsData = [] } = useQuery({
        queryKey: ["grade-levels-bonus"],
        queryFn: async () => {
            const res = await vpDisciplineService.getGradeLevels();
            return res?.data || [];
        },
        staleTime: 10 * 60_000,
    });

    // Build grade options from API
    const gradeOptions = useMemo(() => {
        if (!gradeLevelsData.length) {
            return [
                { value: "10", label: "Khối 10" },
                { value: "11", label: "Khối 11" },
                { value: "12", label: "Khối 12" },
            ];
        }
        return gradeLevelsData
            .map(gl => ({
                value: String(gl.level_number || gl.levelNumber || gl.id),
                label: gl.name || `Khối ${gl.level_number || gl.levelNumber}`,
            }))
            .sort((a, b) => parseInt(a.value) - parseInt(b.value));
    }, [gradeLevelsData]);

    // Transform API students to component format
    const students = useMemo(() => {
        return apiStudents.map(s => ({
            id: s.id || s.student_id || s.enrollmentId || s.studentEnrollmentId,
            name: s.name || s.full_name || s.studentName || "",
            class: s.class_name || s.className || s.class || "",
            grade: s.grade || s.grade_level || s.gradeLevel || selectedGrade,
            enrollmentId: s.enrollmentId || s.studentEnrollmentId || s.id,
        }));
    }, [apiStudents, selectedGrade]);

    // Build reward categories from API data
    const rewardCategories = useMemo(() => {
        if (!apiRewardTypes.length) return [];
        const categoryMap = {};
        apiRewardTypes.forEach(rt => {
            const cat = rt.category || rt.reward_category || "other";
            if (!categoryMap[cat]) {
                categoryMap[cat] = { 
                    id: cat, 
                    label: formatCategoryLabel(cat), 
                    icon: getCategoryIcon(cat),
                    items: [] 
                };
            }
            categoryMap[cat].items.push({
                key: rt.id,
                label: rt.name || rt.reward_name || rt.description || "",
                points: rt.default_points || rt.points || 0,
            });
        });
        return Object.values(categoryMap);
    }, [apiRewardTypes]);

    // Moved outside of component in a refactor, or we can just use function keyword to hoist them.
    function formatCategoryLabel(cat) {
        const labels = {
            attendance: "Chuyên cần",
            academic: "Học tập",
            activity: "Phong trào",
            positive: "Tích cực",
            other: "Khác",
        };
        return labels[cat] || cat;
    }

    function getCategoryIcon(cat) {
        switch(cat) {
            case "attendance": return <FiStar />;
            case "academic": return <FiAward />;
            case "activity": return <FiTrendingUp />;
            case "positive": return <FiHeart />;
            default: return <FiStar />;
        }
    }

    // Initialize/Sync
    useEffect(() => {
        if (isOpen) {
            if (initialClass !== "all") {
                setSelectedClass(initialClass);
                setSelectedGrade(initialClass.slice(0, 2));
            } else {
                setSelectedGrade(gradeOptions[0]?.value || "10");
                setSelectedClass("");
            }
            setTargetType("collective");
            setSelectedCategory(rewardCategories[0]?.id || "");
            setSelectedReasonKey("");
            setCustomPoints("");
            setComment("");
        }
    }, [isOpen, initialClass, rewardCategories, gradeOptions]);

    // Update category when rewardTypes load
    useEffect(() => {
        if (rewardCategories.length && !selectedCategory) {
            setSelectedCategory(rewardCategories[0].id);
        }
    }, [rewardCategories]);

    // Handle auto-point fill
    useEffect(() => {
        const cat = rewardCategories.find(c => c.id === selectedCategory);
        const item = cat?.items.find(i => i.key === selectedReasonKey);
        if (item) {
            setCustomPoints(item.points.toString());
        }
    }, [selectedCategory, selectedReasonKey, rewardCategories]);

    const classOptions = useMemo(() => {
        const classes = [...new Set(students.filter(s => s.grade === selectedGrade).map(s => s.class))];
        return classes.map(c => ({ value: c, label: c }));
    }, [selectedGrade, students]);

    const studentOptions = useMemo(() => {
        return students
            .filter(s => s.class === selectedClass)
            .map(s => ({ value: s.id, label: `${s.name} (${s.id})` }));
    }, [selectedClass, students]);

    const reasonOptions = useMemo(() => {
        const cat = rewardCategories.find(c => c.id === selectedCategory);
        return cat ? cat.items.map(i => ({ value: i.key, label: i.label })) : [];
    }, [selectedCategory, rewardCategories]);

    const handleSubmit = async () => {
        if (!selectedClass) {
            toast.error("Vui lòng chọn lớp!");
            return;
        }
        if (targetType === "individual" && !selectedStudentId) {
            toast.error("Vui lòng chọn học sinh!");
            return;
        }
        if (!selectedReasonKey) {
            toast.error("Vui lòng chọn nội dung khen thưởng!");
            return;
        }

        const cat = rewardCategories.find(c => c.id === selectedCategory);
        const item = cat?.items.find(i => i.key === selectedReasonKey);
        const student = students.find(s => s.id === selectedStudentId);
        const points = parseInt(customPoints) || 0;

        try {
            if (targetType === "individual") {
                // Post individual bonus
                await vpDisciplineService.callByKey("post_discipline_rewards", {
                    body: {
                        studentEnrollmentId: student?.enrollmentId || selectedStudentId,
                        rewardTypeId: selectedReasonKey,
                        semesterId: semesterId,
                        points: points,
                        notes: comment,
                    },
                });
                toast.success(`Đã cộng ${points} điểm thưởng cá nhân cho ${student?.name}!`);
            } else {
                // Post collective/class bonus
                await vpDisciplineService.callByKey("post_discipline_rewards", {
                    body: {
                        classId: selectedClass,
                        rewardTypeId: selectedReasonKey,
                        semesterId: semesterId,
                        points: points,
                        notes: comment,
                    },
                });
                toast.success(`Đã cộng ${points} điểm thưởng tập thể cho lớp ${selectedClass}!`);
            }

            onClose();
            if (onSuccess) onSuccess();
        } catch (err) {
            toast.error(err?.message || "Không thể lưu khen thưởng. Vui lòng thử lại.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="bonus-modal-overlay" onClick={onClose}>
            <div className="bonus-modal-content animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="bonus-modal-header">
                    <div className="header-icon-ring">
                        <FiStar />
                    </div>
                    <div className="header-text">
                        <h3>Ghi Nhận Điểm Thưởng</h3>
                        <p>Khen thưởng thành tích cá nhân và tập thể lớp</p>
                    </div>
                    <button className="close-btn" onClick={onClose}><FiX /></button>
                </div>
                <div className="bonus-modal-body">
                    {/* Toggle Switch */}
                    <div className="type-toggle-container">
                        <button 
                            className={`type-toggle-btn btn-collective ${targetType === 'collective' ? 'active' : ''}`}
                            onClick={() => setTargetType('collective')}
                        >
                            <FiLayers /> Tập thể (Lớp)
                        </button>
                        <button 
                            className={`type-toggle-btn btn-individual ${targetType === 'individual' ? 'active' : ''}`}
                            onClick={() => setTargetType('individual')}
                        >
                            <FiUser /> Cá nhân (HS)
                        </button>
                    </div>

                    {/* Tier 1: Target Info (Compact Flex) */}
                    <div className="bonus-target-section">
                        <div className="input-group-row">
                            <div className="input-field">
                                <label>Khối</label>
                                <Select 
                                    variant="custom" 
                                    value={selectedGrade} 
                                    onChange={e => setSelectedGrade(e.target.value)}
                                    options={gradeOptions}
                                />
                            </div>
                            <div className="input-field">
                                <label>Lớp</label>
                                <Select 
                                    variant="custom" 
                                    value={selectedClass} 
                                    onChange={e => setSelectedClass(e.target.value)}
                                    options={[{value: '', label: 'Chọn lớp'}, ...classOptions]}
                                />
                            </div>
                            {targetType === 'individual' && (
                                <div className="input-field animate-fade-in">
                                    <label>Học sinh</label>
                                    <Select 
                                        variant="custom" 
                                        value={selectedStudentId} 
                                        onChange={e => setSelectedStudentId(e.target.value)}
                                        options={[{value: '', label: 'Chọn học sinh'}, ...studentOptions]}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tier 2: Reward Chips */}
                    <div className="bonus-reward-section">
                        <label className="section-label">Danh mục khen thưởng</label>
                        <div className="category-selection-grid">
                            {rewardCategories.map(cat => (
                                <div 
                                    key={cat.id}
                                    className={`cat-premium-card cat-${cat.id} ${selectedCategory === cat.id ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedCategory(cat.id);
                                        setSelectedReasonKey("");
                                    }}
                                >
                                    <div className="cat-icon-box">{cat.icon}</div>
                                    <span>{cat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tier 3: Reason & Points (Compact Grid) */}
                    <div className="reward-detail-controls animate-fade-in">
                        <div className="input-field">
                            <label>Lý do khen thưởng cụ thể</label>
                            <Select 
                                variant="custom" 
                                value={selectedReasonKey} 
                                onChange={e => setSelectedReasonKey(e.target.value)}
                                options={[{value: '', label: 'Chọn lý do...'}, ...reasonOptions]}
                            />
                        </div>
                        <div className="input-field">
                            <label>Điểm thưởng</label>
                            <div className="points-input-wrapper">
                                <input 
                                    type="number" 
                                    value={customPoints}
                                    onChange={e => setCustomPoints(e.target.value)}
                                    placeholder="0"
                                />
                                <span className="unit">điểm</span>
                            </div>
                        </div>
                    </div>

                    <div className="notes-section animate-fade-in">
                        <div className="input-field">
                            <label>Ghi chú bổ sung</label>
                            <textarea 
                                placeholder="Nhập chi tiết thành tích hoặc bối cảnh khen thưởng..."
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="bonus-modal-footer">
                    <button className="btn-cancel" onClick={onClose}>Hủy bỏ</button>
                    <button className="btn-submit-premium" onClick={handleSubmit}>
                        <FiCheck /> Xác nhận cộng điểm
                    </button>
                </div>
            </div>
        </div>
    );
}

