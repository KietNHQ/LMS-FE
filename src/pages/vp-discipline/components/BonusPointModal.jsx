import React, { useState, useEffect, useMemo } from "react";
import { 
    FiX, FiCheck, FiUser, FiLayers, FiAward, 
    FiStar, FiTrendingUp, FiHeart, FiSettings 
} from "react-icons/fi";
import { toast } from "react-toastify";
import Select from "../../../components/ui/Select/Select";
import "./BonusPointModal.css";

const MOCK_STUDENTS = [
    { id: "HS001", name: "Nguyễn Văn A", class: "10A1", grade: "10" },
    { id: "HS002", name: "Trần Thị B", class: "11A5", grade: "11" },
    { id: "HS003", name: "Lê Văn C", class: "12A2", grade: "12" },
    { id: "HS004", name: "Phạm Minh D", class: "10A1", grade: "10" },
    { id: "HS005", name: "Hoàng Anh E", class: "10A2", grade: "10" },
    { id: "HS006", name: "Vũ Thu F", class: "11B1", grade: "11" },
    { id: "HS092", name: "Phạm F", class: "12A1", grade: "12" },
    { id: "HS093", name: "Đỗ G", class: "12A1", grade: "12" },
];

const REWARD_CATEGORIES = [
    { 
        id: "attendance", 
        label: "Chuyên cần", 
        icon: <FiStar />,
        items: [
            { key: "month", label: "Đi học đủ 1 tháng", points: 20 },
            { key: "semester", label: "100% chuyên cần HK", points: 50 },
            { key: "no_late_semester", label: "K đi muộn trong HK", points: 10 },
        ]
    },
    { 
        id: "academic", 
        label: "Học tập", 
        icon: <FiAward />,
        items: [
            { key: "school", label: "HSG cấp trường", points: 30 },
            { key: "province", label: "HSG Tỉnh/TP", points: 50 },
            { key: "national", label: "HSG QG/QT", points: 100 },
            { key: "improvement", label: "Tiến bộ rõ rệt", points: 20 },
        ]
    },
    { 
        id: "activity", 
        label: "Phong trào", 
        icon: <FiTrendingUp />,
        items: [
            { key: "first_school", label: "Giải Nhất trường", points: 20 },
            { key: "second_school", label: "Giải Nhì/Ba trường", points: 15 },
            { key: "volunteer", label: "Tình nguyện viên", points: 15 },
            { key: "club", label: "Tham gia CLB tích cực", points: 10 },
        ]
    },
    { 
        id: "positive", 
        label: "Tích cực", 
        icon: <FiHeart />,
        items: [
            { key: "found_lost", label: "Nhặt của rơi trả lại", points: 20 },
            { key: "report_risk", label: "Phát hiện nguy cơ", points: 5 },
            { key: "role_model", label: "Gương mẫu điển hình", points: 20 },
            { key: "help_peers", label: "Giúp đỡ bạn bè", points: 10 },
        ]
    }
];

export default function BonusPointModal({ isOpen, onClose, onSuccess, initialClass = "all" }) {
    const [targetType, setTargetType] = useState("collective"); // 'collective' or 'individual'
    const [selectedGrade, setSelectedGrade] = useState("10");
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedStudentId, setSelectedStudentId] = useState("");
    
    const [selectedCategory, setSelectedCategory] = useState("attendance");
    const [selectedReasonKey, setSelectedReasonKey] = useState("");
    const [customPoints, setCustomPoints] = useState("");
    const [comment, setComment] = useState("");

    // Initialize/Sync
    useEffect(() => {
        if (isOpen) {
            if (initialClass !== "all") {
                setSelectedClass(initialClass);
                setSelectedGrade(initialClass.slice(0, 2));
            } else {
                setSelectedGrade("10");
                setSelectedClass("");
            }
            setTargetType("collective");
            setSelectedCategory("attendance");
            setSelectedReasonKey("");
            setCustomPoints("");
            setComment("");
        }
    }, [isOpen, initialClass]);

    // Handle auto-point fill
    useEffect(() => {
        const cat = REWARD_CATEGORIES.find(c => c.id === selectedCategory);
        const item = cat?.items.find(i => i.key === selectedReasonKey);
        if (item) {
            setCustomPoints(item.points.toString());
        }
    }, [selectedCategory, selectedReasonKey]);

    const gradeOptions = [
        { value: "10", label: "Khối 10" },
        { value: "11", label: "Khối 11" },
        { value: "12", label: "Khối 12" }
    ];

    const classOptions = useMemo(() => {
        const classes = [...new Set(MOCK_STUDENTS.filter(s => s.grade === selectedGrade).map(s => s.class))];
        return classes.map(c => ({ value: c, label: c }));
    }, [selectedGrade]);

    const studentOptions = useMemo(() => {
        return MOCK_STUDENTS
            .filter(s => s.class === selectedClass)
            .map(s => ({ value: s.id, label: `${s.name} (${s.id})` }));
    }, [selectedClass]);

    const reasonOptions = useMemo(() => {
        const cat = REWARD_CATEGORIES.find(c => c.id === selectedCategory);
        return cat ? cat.items.map(i => ({ value: i.key, label: i.label })) : [];
    }, [selectedCategory]);

    const handleSubmit = () => {
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

        const cat = REWARD_CATEGORIES.find(c => c.id === selectedCategory);
        const item = cat?.items.find(i => i.key === selectedReasonKey);
        const student = MOCK_STUDENTS.find(s => s.id === selectedStudentId);

        const rewardData = {
            id: Date.now(),
            targetType,
            className: selectedClass,
            studentName: targetType === "individual" ? student?.name : `Lớp ${selectedClass}`,
            reason: item?.label || comment,
            points: parseInt(customPoints) || 0,
            type: "bonus",
            dayOfWeek: 0, // Weekly/Special bonus
            week: 12, // Default to current week for mock
            history: []
        };

        onSuccess(rewardData);
        onClose();
        toast.success(`Đã cộng ${rewardData.points} điểm thưởng ${targetType === 'individual' ? 'cá nhân' : 'tập thể'}!`);
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
                            {REWARD_CATEGORIES.map(cat => (
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
