import React, { useState, useMemo } from "react";
import { FiX, FiPlus, FiTrash2, FiSave, FiAlertCircle, FiInfo } from "react-icons/fi";
import "./pointAdjustmentModal.css";

const PointAdjustmentModal = ({ isOpen, onClose, classData, rules }) => {
    // CATEGORIES mapping for labels
    const CATEGORIES = {
        STANDARD: "Điểm chuẩn",
        ATTENDANCE: "Chuyên cần",
        CONDUCT: "Tác phong",
        ACADEMIC: "Học tập",
        ACHIEVEMENT: "Thành tích/Việc tốt",
        OTHER: "Khác"
    };

    const [records, setRecords] = useState([
        { id: 1, type: "STANDARD", desc: "Điểm chuẩn mặc định", points: rules?.standardPoint || 100, date: "Hệ thống" },
    ]);

    const [newRecord, setNewRecord] = useState({ 
        type: "ATTENDANCE", 
        subType: "late",
        desc: "", 
        points: 0,
        lessonGrade: "A"
    });

    // Sub-types for quick selection based on rules
    const subTypes = {
        ATTENDANCE: [
            { id: "excused", label: "Vắng có phép", points: rules?.attendance?.excused },
            { id: "unexcused", label: "Vắng không phép", points: rules?.attendance?.unexcused },
            { id: "late", label: "Đi học muộn", points: rules?.attendance?.late },
            { id: "skipping", label: "Trốn học/Bỏ tiết", points: rules?.attendance?.skipping },
            { id: "perfect", label: "Thưởng sĩ số", points: rules?.attendance?.perfectAttendanceBonus },
        ],
        CONDUCT: [
            { id: "uniform", label: "Lỗi đồng phục", points: rules?.conduct?.uniform },
            { id: "appearance", label: "Lỗi diện mạo", points: rules?.conduct?.appearance },
            { id: "behavior", label: "Hành vi vô lễ", points: rules?.conduct?.behavior },
        ],
        ACADEMIC: [
            { id: "excellentWeek", label: "Tuần học tốt", points: rules?.academic?.excellentWeekBonus },
            { id: "goodNote", label: "Nhận xét tốt", points: rules?.academic?.goodNotesBonus },
        ],
        ACHIEVEMENTS: [
            { id: "goodDeeds", label: "Việc tốt/Của rơi", points: rules?.achievements?.goodDeeds },
            { id: "movement", label: "Giải phong trào", points: rules?.achievements?.movementAwards },
        ]
    };

    const handleAddRecord = () => {
        let finalDesc = newRecord.desc;
        let finalPoints = newRecord.points;

        if (newRecord.type === "ACADEMIC" && newRecord.subType === "lesson") {
            finalPoints = rules?.academic?.grades?.[newRecord.lessonGrade] || 0;
            finalDesc = `Tiết học loại ${newRecord.lessonGrade}`;
        } else if (newRecord.type !== "OTHER") {
            const sub = subTypes[newRecord.type === "ACHIEVEMENT" ? "ACHIEVEMENTS" : newRecord.type]?.find(s => s.id === newRecord.subType);
            finalDesc = sub?.label || newRecord.desc;
            finalPoints = sub?.points || 0;
        }

        if (!finalDesc && newRecord.type === "OTHER") return;

        const record = {
            id: Date.now(),
            type: newRecord.type,
            desc: finalDesc,
            points: finalPoints,
            date: new Date().toLocaleDateString("vi-VN"),
        };
        setRecords([...records, record]);
        setNewRecord({ ...newRecord, desc: "", points: 0 });
    };

    const handleDeleteRecord = (id) => {
        if (records.find(r => r.id === id)?.type === "STANDARD") return;
        setRecords(records.filter(r => r.id !== id));
    };

    const totalPoints = useMemo(() => {
        const sum = records.reduce((sum, r) => sum + r.points, 0);
        return Math.max(0, sum); // Cannot go below 0
    }, [records]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Điều Chỉnh Thi Đua: {classData?.className}</h3>
                    <button className="close-btn" onClick={onClose}><FiX /></button>
                </div>

                <div className="modal-body custom-scroll">
                    <div className="summary-stats">
                        <div className="stat-item">
                            <span className="stat-label">Điểm chuẩn</span>
                            <span className="stat-value">{rules?.standardPoint || 100}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Biến động</span>
                            <span className={`stat-value ${totalPoints - (rules?.standardPoint || 100) < 0 ? "negative" : "positive"}`}>
                                {totalPoints - (rules?.standardPoint || 100) >= 0 ? "+" : ""}{totalPoints - (rules?.standardPoint || 100)}
                            </span>
                        </div>
                        <div className="stat-item highlight">
                            <span className="stat-label">Tổng kết tuần</span>
                            <span className="stat-value">{totalPoints}</span>
                        </div>
                    </div>

                    <div className="records-list">
                        {records.map(record => (
                            <div key={record.id} className={`record-item ${record.points < 0 ? "viphạm" : "thànhtích"}`}>
                                <div className="record-info">
                                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                        <small className={`cat-label ${record.type.toLowerCase()}`}>
                                            {CATEGORIES[record.type]}
                                        </small>
                                        <span className="record-desc">{record.desc}</span>
                                    </div>
                                    <span className="record-date">{record.date}</span>
                                </div>
                                <div className="record-actions">
                                    <span className="record-points">
                                        {record.points > 0 ? `+${record.points}` : record.points}
                                    </span>
                                    {record.type !== "STANDARD" && (
                                        <button className="delete-btn" onClick={() => handleDeleteRecord(record.id)}>
                                            <FiTrash2 />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="add-record-form">
                        <div className="form-row" style={{ gridTemplateColumns: "180px 1fr" }}>
                            <select 
                                value={newRecord.type}
                                onChange={(e) => setNewRecord({...newRecord, type: e.target.value, subType: e.target.value === "ACADEMIC" ? "lesson" : subTypes[e.target.value === "ACHIEVEMENT" ? "ACHIEVEMENTS" : e.target.value]?.[0]?.id || ""})}
                            >
                                {Object.entries(CATEGORIES).map(([val, label]) => (
                                    val !== "STANDARD" && <option key={val} value={val}>{label}</option>
                                ))}
                            </select>
                            
                            {newRecord.type === "ACADEMIC" && (
                                <select 
                                    style={{ width: "auto" }}
                                    value={newRecord.subType}
                                    onChange={(e) => setNewRecord({...newRecord, subType: e.target.value})}
                                >
                                    <option value="lesson">Xếp loại tiết học</option>
                                    <option value="excellentWeek">Thưởng Tuần học tốt</option>
                                    <option value="goodNote">Thưởng Nhận xét tốt</option>
                                </select>
                            )}

                            {newRecord.type === "ATTENDANCE" && (
                                <select 
                                    value={newRecord.subType}
                                    onChange={(e) => setNewRecord({...newRecord, subType: e.target.value})}
                                >
                                    {subTypes.ATTENDANCE.map(s => <option key={s.id} value={s.id}>{s.label} ({s.points}đ)</option>)}
                                </select>
                            )}

                            {newRecord.type === "CONDUCT" && (
                                <select 
                                    value={newRecord.subType}
                                    onChange={(e) => setNewRecord({...newRecord, subType: e.target.value})}
                                >
                                    {subTypes.CONDUCT.map(s => <option key={s.id} value={s.id}>{s.label} ({s.points}đ)</option>)}
                                </select>
                            )}

                            {newRecord.type === "ACHIEVEMENT" && (
                                <select 
                                    value={newRecord.subType}
                                    onChange={(e) => setNewRecord({...newRecord, subType: e.target.value})}
                                >
                                    {subTypes.ACHIEVEMENTS.map(s => <option key={s.id} value={s.id}>{s.label} (+{s.points}đ)</option>)}
                                </select>
                            )}

                            {newRecord.type === "OTHER" && (
                                <input 
                                    type="text" 
                                    placeholder="Mô tả nội dung..." 
                                    value={newRecord.desc}
                                    onChange={(e) => setNewRecord({...newRecord, desc: e.target.value})}
                                />
                            )}
                        </div>
                        
                        <div className="form-row" style={{ gridTemplateColumns: "1fr 120px" }}>
                            {newRecord.subType === "lesson" && newRecord.type === "ACADEMIC" ? (
                                <select 
                                    value={newRecord.lessonGrade}
                                    onChange={(e) => setNewRecord({...newRecord, lessonGrade: e.target.value})}
                                >
                                    <option value="A">Tiết A (+{rules?.academic?.grades?.A})</option>
                                    <option value="B">Tiết B ({rules?.academic?.grades?.B})</option>
                                    <option value="C">Tiết C ({rules?.academic?.grades?.C})</option>
                                    <option value="D">Tiết D ({rules?.academic?.grades?.D})</option>
                                </select>
                            ) : (
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#64748b", fontSize: "0.85rem" }}>
                                    <FiInfo /> <span>Điểm số sẽ tự động lấy từ cấu hình</span>
                                </div>
                            )}
                            
                            {newRecord.type === "OTHER" && (
                                <input 
                                    type="number" 
                                    min="-100"
                                    max="100"
                                    placeholder="Điểm" 
                                    value={newRecord.points}
                                    onChange={(e) => setNewRecord({...newRecord, points: parseInt(e.target.value) || 0})}
                                />
                            )}
                        </div>
                        
                        <button className="add-btn" onClick={handleAddRecord}>
                            <FiPlus /> Thêm ghi nhận
                        </button>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="cancel-btn" onClick={onClose}>Đóng</button>
                    <button className="save-btn" onClick={onClose}>
                        <FiSave /> Lưu & Cập nhật
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PointAdjustmentModal;

