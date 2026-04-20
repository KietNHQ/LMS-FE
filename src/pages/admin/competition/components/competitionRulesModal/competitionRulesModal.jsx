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
                                    onFocus={(e) => { const target = e.target; setTimeout(() => target.select(), 0); }}
                                    value={localRules.standardPoint || 100} 
                                    onChange={(e) => setLocalRules({...localRules, standardPoint: parseInt(e.target.value) || 0})} 
                                />
                            </div>
                        </div>
                    </div>

                    {/* 1. VI PHẠM */}
                    <div className="rules-section">
                        <div className="section-title">
                            <FiChevronRight /> <h4>1. Nhóm Vi Phạm</h4>
                        </div>
                        
                        <h5 className="sub-section-title">Chuyên cần</h5>
                        <div className="rules-grid">
                            <div className="rule-item"><label>Nghỉ học k phép</label><input type="number" onFocus={(e) => { const target = e.target; setTimeout(() => target.select(), 0); }} value={localRules.attendance_violation?.unexcused || 0} onChange={(e) => updateNested('attendance_violation', 'unexcused', e.target.value)} /></div>
                            <div className="rule-item"><label>Đi học muộn</label><input type="number" onFocus={(e) => { const target = e.target; setTimeout(() => target.select(), 0); }} value={localRules.attendance_violation?.late || 0} onChange={(e) => updateNested('attendance_violation', 'late', e.target.value)} /></div>
                            <div className="rule-item serious"><label>Trốn học, bỏ tiết</label><input type="number" onFocus={(e) => { const target = e.target; setTimeout(() => target.select(), 0); }} value={localRules.attendance_violation?.skip_class || 0} onChange={(e) => updateNested('attendance_violation', 'skip_class', e.target.value)} /></div>
                            <div className="rule-item"><label>Bỏ giờ trong tiết</label><input type="number" onFocus={(e) => { const target = e.target; setTimeout(() => target.select(), 0); }} value={localRules.attendance_violation?.skip_period || 0} onChange={(e) => updateNested('attendance_violation', 'skip_period', e.target.value)} /></div>
                        </div>

                        <h5 className="sub-section-title mt-sm">Nề nếp - Tác phong</h5>
                        <div className="rules-grid">
                            <div className="rule-item"><label>Đồng phục/tác phong</label><input type="number" onFocus={(e) => { const target = e.target; setTimeout(() => target.select(), 0); }} value={localRules.discipline_violation?.uniform || 0} onChange={(e) => updateNested('discipline_violation', 'uniform', e.target.value)} /></div>
                            <div className="rule-item"><label>Mất trật tự trong giờ</label><input type="number" onFocus={(e) => { const target = e.target; setTimeout(() => target.select(), 0); }} value={localRules.discipline_violation?.disorder || 0} onChange={(e) => updateNested('discipline_violation', 'disorder', e.target.value)} /></div>
                            <div className="rule-item"><label>Nói tục, chửi thề</label><input type="number" onFocus={(e) => { const target = e.target; setTimeout(() => target.select(), 0); }} value={localRules.discipline_violation?.swearing || 0} onChange={(e) => updateNested('discipline_violation', 'swearing', e.target.value)} /></div>
                            <div className="rule-item"><label>Dùng đt trái phép</label><input type="number" onFocus={(e) => { const target = e.target; setTimeout(() => target.select(), 0); }} value={localRules.discipline_violation?.phone || 0} onChange={(e) => updateNested('discipline_violation', 'phone', e.target.value)} /></div>
                            <div className="rule-item"><label>Ăn uống trong giờ</label><input type="number" onFocus={(e) => { const target = e.target; setTimeout(() => target.select(), 0); }} value={localRules.discipline_violation?.eating || 0} onChange={(e) => updateNested('discipline_violation', 'eating', e.target.value)} /></div>
                            <div className="rule-item"><label>Gây gổ, xô đẩy</label><input type="number" onFocus={(e) => { const target = e.target; setTimeout(() => target.select(), 0); }} value={localRules.discipline_violation?.fighting || 0} onChange={(e) => updateNested('discipline_violation', 'fighting', e.target.value)} /></div>
                            <div className="rule-item serious"><label>Bắt nạt, xúc phạm</label><input type="number" onFocus={(e) => { const target = e.target; setTimeout(() => target.select(), 0); }} value={localRules.discipline_violation?.bullying || 0} onChange={(e) => updateNested('discipline_violation', 'bullying', e.target.value)} /></div>
                        </div>

                        <h5 className="sub-section-title mt-sm">Tài sản - Môi trường</h5>
                        <div className="rules-grid">
                            <div className="rule-item"><label>Hư hỏng tài sản</label><input type="number" onFocus={(e) => { const target = e.target; setTimeout(() => target.select(), 0); }} value={localRules.property_violation?.damage || 0} onChange={(e) => updateNested('property_violation', 'damage', e.target.value)} /></div>
                            <div className="rule-item"><label>Vẽ bậy, bôi bẩn</label><input type="number" onFocus={(e) => { const target = e.target; setTimeout(() => target.select(), 0); }} value={localRules.property_violation?.vandalism || 0} onChange={(e) => updateNested('property_violation', 'vandalism', e.target.value)} /></div>
                            <div className="rule-item"><label>Vứt rác bừa bãi</label><input type="number" onFocus={(e) => { const target = e.target; setTimeout(() => target.select(), 0); }} value={localRules.property_violation?.littering || 0} onChange={(e) => updateNested('property_violation', 'littering', e.target.value)} /></div>
                            <div className="rule-item"><label>Không tắt điện/quạt</label><input type="number" onFocus={(e) => { const target = e.target; setTimeout(() => target.select(), 0); }} value={localRules.property_violation?.no_electricity || 0} onChange={(e) => updateNested('property_violation', 'no_electricity', e.target.value)} /></div>
                        </div>

                        <h5 className="sub-section-title mt-sm">Học tập</h5>
                        <div className="rules-grid">
                            <div className="rule-item"><label>Không làm bài tập</label><input type="number" onFocus={(e) => { const target = e.target; setTimeout(() => target.select(), 0); }} value={localRules.academic_violation?.no_homework || 0} onChange={(e) => updateNested('academic_violation', 'no_homework', e.target.value)} /></div>
                            <div className="rule-item"><label>Không mang sách vở</label><input type="number" onFocus={(e) => { const target = e.target; setTimeout(() => target.select(), 0); }} value={localRules.academic_violation?.no_materials || 0} onChange={(e) => updateNested('academic_violation', 'no_materials', e.target.value)} /></div>
                            <div className="rule-item serious"><label>Gian lận thi cử</label><input type="number" onFocus={(e) => { const target = e.target; setTimeout(() => target.select(), 0); }} value={localRules.academic_violation?.cheating || 0} onChange={(e) => updateNested('academic_violation', 'cheating', e.target.value)} /></div>
                            <div className="rule-item"><label>K tham gia ngoại khóa</label><input type="number" onFocus={(e) => { const target = e.target; setTimeout(() => target.select(), 0); }} value={localRules.academic_violation?.no_extracurricular || 0} onChange={(e) => updateNested('academic_violation', 'no_extracurricular', e.target.value)} /></div>
                        </div>
                    </div>

                    {/* 2. KHEN THƯỞNG */}
                    <div className="rules-section">
                        <div className="section-title">
                            <FiChevronRight /> <h4>2. Nhóm Khen Thưởng</h4>
                        </div>

                        <h5 className="sub-section-title">Chuyên cần</h5>
                        <div className="rules-grid">
                            <div className="rule-item highlight"><label>Đi học đủ 1 tháng</label><input type="number" onFocus={(e) => { const target = e.target; setTimeout(() => target.select(), 0); }} value={localRules.attendance_reward?.month || 0} onChange={(e) => updateNested('attendance_reward', 'month', e.target.value)} /></div>
                            <div className="rule-item highlight"><label>100% chuyên cần HK</label><input type="number" onFocus={(e) => { const target = e.target; setTimeout(() => target.select(), 0); }} value={localRules.attendance_reward?.semester || 0} onChange={(e) => updateNested('attendance_reward', 'semester', e.target.value)} /></div>
                            <div className="rule-item highlight"><label>K đi muộn trong HK</label><input type="number" onFocus={(e) => { const target = e.target; setTimeout(() => target.select(), 0); }} value={localRules.attendance_reward?.no_late_semester || 0} onChange={(e) => updateNested('attendance_reward', 'no_late_semester', e.target.value)} /></div>
                        </div>

                        <h5 className="sub-section-title mt-sm">Học tập</h5>
                        <div className="rules-grid">
                            <div className="rule-item highlight"><label>HSG cấp trường</label><input type="number" onFocus={(e) => { const target = e.target; setTimeout(() => target.select(), 0); }} value={localRules.academic_reward?.school || 0} onChange={(e) => updateNested('academic_reward', 'school', e.target.value)} /></div>
                            <div className="rule-item highlight"><label>HSG Tỉnh/TP</label><input type="number" onFocus={(e) => { const target = e.target; setTimeout(() => target.select(), 0); }} value={localRules.academic_reward?.province || 0} onChange={(e) => updateNested('academic_reward', 'province', e.target.value)} /></div>
                            <div className="rule-item highlight"><label>HSG QG/QT</label><input type="number" onFocus={(e) => { const target = e.target; setTimeout(() => target.select(), 0); }} value={localRules.academic_reward?.national || 0} onChange={(e) => updateNested('academic_reward', 'national', e.target.value)} /></div>
                            <div className="rule-item highlight"><label>Tiến bộ rõ rệt</label><input type="number" onFocus={(e) => { const target = e.target; setTimeout(() => target.select(), 0); }} value={localRules.academic_reward?.improvement || 0} onChange={(e) => updateNested('academic_reward', 'improvement', e.target.value)} /></div>
                        </div>

                        <h5 className="sub-section-title mt-sm">Phong trào</h5>
                        <div className="rules-grid">
                            <div className="rule-item highlight"><label>Giải Nhất trường</label><input type="number" onFocus={(e) => { const target = e.target; setTimeout(() => target.select(), 0); }} value={localRules.activity_reward?.first_school || 0} onChange={(e) => updateNested('activity_reward', 'first_school', e.target.value)} /></div>
                            <div className="rule-item highlight"><label>Giải Nhì/Ba trường</label><input type="number" onFocus={(e) => { const target = e.target; setTimeout(() => target.select(), 0); }} value={localRules.activity_reward?.second_school || 0} onChange={(e) => updateNested('activity_reward', 'second_school', e.target.value)} /></div>
                            <div className="rule-item highlight"><label>Giải Nhất Tỉnh</label><input type="number" onFocus={(e) => { const target = e.target; setTimeout(() => target.select(), 0); }} value={localRules.activity_reward?.first_province || 0} onChange={(e) => updateNested('activity_reward', 'first_province', e.target.value)} /></div>
                            <div className="rule-item highlight"><label>Giải QG/QT</label><input type="number" onFocus={(e) => { const target = e.target; setTimeout(() => target.select(), 0); }} value={localRules.activity_reward?.national || 0} onChange={(e) => updateNested('activity_reward', 'national', e.target.value)} /></div>
                            <div className="rule-item highlight"><label>Tình nguyện viên</label><input type="number" onFocus={(e) => { const target = e.target; setTimeout(() => target.select(), 0); }} value={localRules.activity_reward?.volunteer || 0} onChange={(e) => updateNested('activity_reward', 'volunteer', e.target.value)} /></div>
                            <div className="rule-item highlight"><label>Tham gia CLB</label><input type="number" onFocus={(e) => { const target = e.target; setTimeout(() => target.select(), 0); }} value={localRules.activity_reward?.club || 0} onChange={(e) => updateNested('activity_reward', 'club', e.target.value)} /></div>
                        </div>

                        <h5 className="sub-section-title mt-sm">Tích cực</h5>
                        <div className="rules-grid">
                            <div className="rule-item highlight"><label>Nhặt của rơi trả lại</label><input type="number" onFocus={(e) => { const target = e.target; setTimeout(() => target.select(), 0); }} value={localRules.positive_reward?.found_lost || 0} onChange={(e) => updateNested('positive_reward', 'found_lost', e.target.value)} /></div>
                            <div className="rule-item highlight"><label>Báo nguy cơ mất đồ</label><input type="number" onFocus={(e) => { const target = e.target; setTimeout(() => target.select(), 0); }} value={localRules.positive_reward?.report_risk || 0} onChange={(e) => updateNested('positive_reward', 'report_risk', e.target.value)} /></div>
                            <div className="rule-item highlight"><label>Gương mẫu</label><input type="number" onFocus={(e) => { const target = e.target; setTimeout(() => target.select(), 0); }} value={localRules.positive_reward?.role_model || 0} onChange={(e) => updateNested('positive_reward', 'role_model', e.target.value)} /></div>
                            <div className="rule-item highlight"><label>Giúp đỡ bạn bè</label><input type="number" onFocus={(e) => { const target = e.target; setTimeout(() => target.select(), 0); }} value={localRules.positive_reward?.help_peers || 0} onChange={(e) => updateNested('positive_reward', 'help_peers', e.target.value)} /></div>
                            <div className="rule-item highlight"><label>Phát hiện sai phạm</label><input type="number" onFocus={(e) => { const target = e.target; setTimeout(() => target.select(), 0); }} value={localRules.positive_reward?.report_violation || 0} onChange={(e) => updateNested('positive_reward', 'report_violation', e.target.value)} /></div>
                        </div>
                    </div>

                    <div className="rules-info-banner">
                        <FiInfo />
                        <p>Các chỉ số trên được đồng bộ trực tiếp với Báo cáo Hệ thống Quản lý Thi Đua Rèn Luyện HS THPT.</p>
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
