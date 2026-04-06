import React, { useState, useEffect } from "react";
import { FiX, FiCheck, FiInfo, FiChevronRight } from "react-icons/fi";
import "./competitionRulesModal.css";

const CompetitionRulesModal = ({ isOpen, onClose, rules, onSave }) => {
    const [localRules, setLocalRules] = useState(rules);

    // Sync local state with props when modal opens
    useEffect(() => {
        if (isOpen) setLocalRules(rules);
    }, [isOpen, rules]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(localRules);
        onClose();
    };

    const updateNested = (category, field, value) => {
        setLocalRules({
            ...localRules,
            [category]: {
                ...localRules[category],
                [field]: parseInt(value) || 0
            }
        });
    };

    const updateGrade = (grade, value) => {
        setLocalRules({
            ...localRules,
            academic: {
                ...localRules.academic,
                grades: {
                    ...localRules.academic.grades,
                    [grade]: parseInt(value) || 0
                }
            }
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content rules-modal-large">
                <div className="modal-header">
                    <div className="header-text">
                        <h3>Cấu Hình Điểm Thi Đua</h3>
                        <p>Điều chỉnh các thông số để BE tính toán xếp hạng tự động</p>
                    </div>
                    <button className="close-btn" onClick={onClose}><FiX /></button>
                </div>

                <div className="modal-body custom-scroll">
                    {/* 0. ĐIỂM CHUẨN */}
                    <div className="rules-section">
                        <div className="section-title">
                            <FiChevronRight /> <h4>0. Thiết lập cơ bản</h4>
                        </div>
                        <div className="rules-grid">
                            <div className="rule-item">
                                <label>Điểm chuẩn mặc định</label>
                                <input 
                                    type="number" 
                                    min="0" 
                                    max="1000" 
                                    value={localRules.standardPoint} 
                                    onChange={(e) => setLocalRules({...localRules, standardPoint: parseInt(e.target.value) || 0})} 
                                />
                            </div>
                        </div>
                    </div>

                    {/* 1. CHUYÊN CẦN */}
                    <div className="rules-section">
                        <div className="section-title">
                            <FiChevronRight /> <h4>1. Chuyên cần & Hiện diện</h4>
                        </div>
                        <div className="rules-grid">
                            <div className="rule-item">
                                <label>Vắng có phép (lượt)</label>
                                <input type="number" min="-200" max="200" value={localRules.attendance.excused} onChange={(e) => updateNested('attendance', 'excused', e.target.value)} />
                            </div>
                            <div className="rule-item">
                                <label>Vắng không phép (lượt)</label>
                                <input type="number" min="-200" max="200" value={localRules.attendance.unexcused} onChange={(e) => updateNested('attendance', 'unexcused', e.target.value)} />
                            </div>
                            <div className="rule-item">
                                <label>Đi học muộn (lượt)</label>
                                <input type="number" min="-200" max="200" value={localRules.attendance.late} onChange={(e) => updateNested('attendance', 'late', e.target.value)} />
                            </div>
                            <div className="rule-item">
                                <label>Trốn học/Bỏ tiết (lượt)</label>
                                <input type="number" min="-200" max="200" value={localRules.attendance.skipping} onChange={(e) => updateNested('attendance', 'skipping', e.target.value)} />
                            </div>
                            <div className="rule-item highlight">
                                <label>Thưởng trì sĩ số tuần (%)</label>
                                <input type="number" min="0" max="200" value={localRules.attendance.perfectAttendanceBonus} onChange={(e) => updateNested('attendance', 'perfectAttendanceBonus', e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* 2. TÁC PHONG */}
                    <div className="rules-section">
                        <div className="section-title">
                            <FiChevronRight /> <h4>2. Tác phong & Văn hóa</h4>
                        </div>
                        <div className="rules-grid">
                            <div className="rule-item">
                                <label>Lỗi đồng phục/Thẻ</label>
                                <input type="number" min="-200" max="0" value={localRules.conduct.uniform} onChange={(e) => updateNested('conduct', 'uniform', e.target.value)} />
                            </div>
                            <div className="rule-item">
                                <label>Lỗi diện mạo (tóc/móng)</label>
                                <input type="number" min="-200" max="0" value={localRules.conduct.appearance} onChange={(e) => updateNested('conduct', 'appearance', e.target.value)} />
                            </div>
                            <div className="rule-item serious">
                                <label>Hành vi vô lễ (Trừ nặng)</label>
                                <input type="number" min="-500" max="0" value={localRules.conduct.behavior} onChange={(e) => updateNested('conduct', 'behavior', e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* 3. HỌC TẬP */}
                    <div className="rules-section">
                        <div className="section-title">
                            <FiChevronRight /> <h4>3. Học tập & Tiết học</h4>
                        </div>
                        <div className="rules-grid-grades">
                            {Object.entries(localRules.academic.grades).map(([grade, pts]) => (
                                <div key={grade} className="rule-item mini">
                                    <label>Tiết {grade}</label>
                                    <input type="number" min="-100" max="100" value={pts} onChange={(e) => updateGrade(grade, e.target.value)} />
                                </div>
                            ))}
                        </div>
                        <div className="rules-grid mt-sm">
                            <div className="rule-item highlight">
                                <label>Thưởng "Tuần học tốt"</label>
                                <input type="number" min="0" max="200" value={localRules.academic.excellentWeekBonus} onChange={(e) => updateNested('academic', 'excellentWeekBonus', e.target.value)} />
                            </div>
                            <div className="rule-item highlight">
                                <label>Tiết có nhận xét tốt</label>
                                <input type="number" min="0" max="200" value={localRules.academic.goodNotesBonus} onChange={(e) => updateNested('academic', 'goodNotesBonus', e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* 4. KHÁC */}
                    <div className="rules-section">
                        <div className="section-title">
                            <FiChevronRight /> <h4>4. Khen thưởng & Việc tốt</h4>
                        </div>
                        <div className="rules-grid">
                            <div className="rule-item highlight">
                                <label>Nhặt được của rơi</label>
                                <input type="number" min="0" max="100" value={localRules.achievements.goodDeeds} onChange={(e) => updateNested('achievements', 'goodDeeds', e.target.value)} />
                            </div>
                            <div className="rule-item highlight">
                                <label>Giải phong trào/MC</label>
                                <input type="number" min="0" max="100" value={localRules.achievements.movementAwards} onChange={(e) => updateNested('achievements', 'movementAwards', e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <div className="rules-info-banner">
                        <FiInfo />
                        <p>Các chỉ số trên được xây dựng dựa trên Thông tư 22/2021/TT-BGDĐT và quy định chấm điểm Sao Đỏ.</p>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-cancel-link" onClick={onClose}>Hủy bỏ</button>
                    <button className="btn-save-primary" onClick={handleSave}>
                        <FiCheck /> Cập nhật cấu hình
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CompetitionRulesModal;
