import React, { useState } from "react";
import { FiX, FiCheck, FiChevronRight, FiClock } from "react-icons/fi";
import { toast } from "react-toastify";
import "./PointConfigModal.css";

export default function PointConfigModal({ isOpen, onClose }) {
    const [isPendingApproval, setIsPendingApproval] = useState(false);
    
    // Exact schema from Admin's competitionRulesModal.jsx
    const [config, setConfig] = useState({
        standardPoint: 100,
        attendance_violation: { unexcused: -15, late: -5, skip_class: -50, skip_period: -10 },
        discipline_violation: { uniform: -10, disorder: -20, swearing: -15, phone: -5, eating: -3, fighting: -25, bullying: -30 },
        property_violation: { damage: -20, vandalism: -10, littering: -3, no_electricity: -2 },
        academic_violation: { no_homework: -2, no_materials: -2, cheating: -50, no_extracurricular: -5 },
        attendance_reward: { month: 20, semester: 50, no_late_semester: 10 },
        academic_reward: { school: 30, province: 50, national: 100, improvement: 20 },
        activity_reward: { first_school: 20, second_school: 15, first_province: 50, national: 100, volunteer: 15, club: 10 },
        positive_reward: { found_lost: 20, report_risk: 5, role_model: 20, help_peers: 10, report_violation: 15 }
    });

    if (!isOpen) return null;

    const updateNested = (category, field, value) => {
        if (isPendingApproval) return;
        setConfig(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [field]: parseInt(value) || 0
            }
        }));
    };

    const handleSubmitForApproval = () => {
        setIsPendingApproval(true);
        toast.success("Yêu cầu thay đổi đã được gửi tới Hiệu trưởng & PHT Nề nếp!");
    };

    const handleCancelRequest = () => {
        setIsPendingApproval(false);
        toast.info("Đã hủy yêu cầu phê duyệt.");
    };

    return (
        <div className="point-config-overlay" onClick={onClose}>
            <div className="point-config-modal admin-fidelity" onClick={e => e.stopPropagation()}>
                <div className="point-config-header">
                    <div className="header-title">
                        <h2>Cấu Hình Điểm Thi Đua</h2>
                        <p>Điều chỉnh các thông số dựa trên quy chuẩn nề nếp toàn trường</p>
                    </div>
                    <button className="close-btn" onClick={onClose}><FiX /></button>
                </div>

                <div className="point-config-body custom-scrollbar">
                    <div className="point-config-scroll-content">
                        {isPendingApproval && (
                            <div className="pending-banner">
                                <div className="pending-content">
                                    <FiClock className="spin-slow" />
                                    <div>
                                        <strong>Đang chờ phê duyệt</strong>
                                        <p>Cấu hình mới đang được cấp trên xem xét. Các thay đổi sẽ có hiệu lực sau khi được duyệt.</p>
                                    </div>
                                </div>
                                <button className="btn-cancel-request" onClick={handleCancelRequest}>Hủy yêu cầu</button>
                            </div>
                        )}

                        {/* 0. THIẾT LẬP CƠ BẢN */}
                        <div className="rules-section">
                            <div className="section-title">
                                <FiChevronRight /> <h4>0. Thiết lập cơ bản</h4>
                            </div>
                            <div className="rules-grid">
                                <div className="rule-item">
                                    <label>Điểm chuẩn mặc định</label>
                                    <input 
                                        type="number" 
                                        value={config.standardPoint}
                                        onChange={(e) => setConfig({...config, standardPoint: parseInt(e.target.value) || 0})}
                                        disabled={isPendingApproval}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 1. NHÓM VI PHẠM */}
                        <div className="rules-section">
                            <div className="section-title">
                                <FiChevronRight /> <h4>1. Nhóm Vi Phạm</h4>
                            </div>
                            
                            <h5 className="sub-section-title">Chuyên cần</h5>
                            <div className="rules-grid">
                                <div className="rule-item"><label>Nghỉ học k phép</label><input type="number" disabled={isPendingApproval} value={config.attendance_violation.unexcused} onChange={(e) => updateNested('attendance_violation', 'unexcused', e.target.value)} /></div>
                                <div className="rule-item"><label>Đi học muộn</label><input type="number" disabled={isPendingApproval} value={config.attendance_violation.late} onChange={(e) => updateNested('attendance_violation', 'late', e.target.value)} /></div>
                                <div className="rule-item serious"><label>Trốn học, bỏ tiết</label><input type="number" disabled={isPendingApproval} value={config.attendance_violation.skip_class} onChange={(e) => updateNested('attendance_violation', 'skip_class', e.target.value)} /></div>
                                <div className="rule-item"><label>Bỏ giờ trong tiết</label><input type="number" disabled={isPendingApproval} value={config.attendance_violation.skip_period} onChange={(e) => updateNested('attendance_violation', 'skip_period', e.target.value)} /></div>
                            </div>

                            <h5 className="sub-section-title mt-sm">Nề nếp - Tác phong</h5>
                            <div className="rules-grid">
                                <div className="rule-item"><label>Đồng phục/tác phong</label><input type="number" disabled={isPendingApproval} value={config.discipline_violation.uniform} onChange={(e) => updateNested('discipline_violation', 'uniform', e.target.value)} /></div>
                                <div className="rule-item"><label>Mất trật tự trong giờ</label><input type="number" disabled={isPendingApproval} value={config.discipline_violation.disorder} onChange={(e) => updateNested('discipline_violation', 'disorder', e.target.value)} /></div>
                                <div className="rule-item"><label>Nói tục, chửi thề</label><input type="number" disabled={isPendingApproval} value={config.discipline_violation.swearing} onChange={(e) => updateNested('discipline_violation', 'swearing', e.target.value)} /></div>
                                <div className="rule-item"><label>Dùng đt trái phép</label><input type="number" disabled={isPendingApproval} value={config.discipline_violation.phone} onChange={(e) => updateNested('discipline_violation', 'phone', e.target.value)} /></div>
                                <div className="rule-item"><label>Ăn uống trong giờ</label><input type="number" disabled={isPendingApproval} value={config.discipline_violation.eating} onChange={(e) => updateNested('discipline_violation', 'eating', e.target.value)} /></div>
                                <div className="rule-item"><label>Gây gổ, xô đẩy</label><input type="number" disabled={isPendingApproval} value={config.discipline_violation.fighting} onChange={(e) => updateNested('discipline_violation', 'fighting', e.target.value)} /></div>
                                <div className="rule-item serious"><label>Bắt nạt, xúc phạm</label><input type="number" disabled={isPendingApproval} value={config.discipline_violation.bullying} onChange={(e) => updateNested('discipline_violation', 'bullying', e.target.value)} /></div>
                            </div>

                            <h5 className="sub-section-title mt-sm">Tài sản - Môi trường</h5>
                            <div className="rules-grid">
                                <div className="rule-item"><label>Hư hỏng tài sản</label><input type="number" disabled={isPendingApproval} value={config.property_violation.damage} onChange={(e) => updateNested('property_violation', 'damage', e.target.value)} /></div>
                                <div className="rule-item"><label>Vẽ bậy, bôi bẩn</label><input type="number" disabled={isPendingApproval} value={config.property_violation.vandalism} onChange={(e) => updateNested('property_violation', 'vandalism', e.target.value)} /></div>
                                <div className="rule-item"><label>Vứt rác bừa bãi</label><input type="number" disabled={isPendingApproval} value={config.property_violation.littering} onChange={(e) => updateNested('property_violation', 'littering', e.target.value)} /></div>
                                <div className="rule-item"><label>Không tắt điện/quạt</label><input type="number" disabled={isPendingApproval} value={config.property_violation.no_electricity} onChange={(e) => updateNested('property_violation', 'no_electricity', e.target.value)} /></div>
                            </div>

                            <h5 className="sub-section-title mt-sm">Học tập</h5>
                            <div className="rules-grid">
                                <div className="rule-item"><label>Không làm bài tập</label><input type="number" disabled={isPendingApproval} value={config.academic_violation.no_homework} onChange={(e) => updateNested('academic_violation', 'no_homework', e.target.value)} /></div>
                                <div className="rule-item"><label>Không mang sách vở</label><input type="number" disabled={isPendingApproval} value={config.academic_violation.no_materials} onChange={(e) => updateNested('academic_violation', 'no_materials', e.target.value)} /></div>
                                <div className="rule-item serious"><label>Gian lận thi cử</label><input type="number" disabled={isPendingApproval} value={config.academic_violation.cheating} onChange={(e) => updateNested('academic_violation', 'cheating', e.target.value)} /></div>
                                <div className="rule-item"><label>K tham gia ngoại khóa</label><input type="number" disabled={isPendingApproval} value={config.academic_violation.no_extracurricular} onChange={(e) => updateNested('academic_violation', 'no_extracurricular', e.target.value)} /></div>
                            </div>
                        </div>

                        {/* 2. NHÓM KHEN THƯỞNG */}
                        <div className="rules-section">
                            <div className="section-title">
                                <FiChevronRight /> <h4>2. Nhóm Khen Thưởng</h4>
                            </div>

                            <h5 className="sub-section-title">Chuyên cần</h5>
                            <div className="rules-grid">
                                <div className="rule-item reward"><label>Đi học đủ 1 tháng</label><input type="number" disabled={isPendingApproval} value={config.attendance_reward.month} onChange={(e) => updateNested('attendance_reward', 'month', e.target.value)} /></div>
                                <div className="rule-item reward"><label>100% chuyên cần HK</label><input type="number" disabled={isPendingApproval} value={config.attendance_reward.semester} onChange={(e) => updateNested('attendance_reward', 'semester', e.target.value)} /></div>
                                <div className="rule-item reward"><label>K đi muộn trong HK</label><input type="number" disabled={isPendingApproval} value={config.attendance_reward.no_late_semester} onChange={(e) => updateNested('attendance_reward', 'no_late_semester', e.target.value)} /></div>
                            </div>

                            <h5 className="sub-section-title mt-sm">Học tập</h5>
                            <div className="rules-grid">
                                <div className="rule-item reward"><label>HSG cấp trường</label><input type="number" disabled={isPendingApproval} value={config.academic_reward.school} onChange={(e) => updateNested('academic_reward', 'school', e.target.value)} /></div>
                                <div className="rule-item reward"><label>HSG Tỉnh/TP</label><input type="number" disabled={isPendingApproval} value={config.academic_reward.province} onChange={(e) => updateNested('academic_reward', 'province', e.target.value)} /></div>
                                <div className="rule-item reward"><label>HSG QG/QT</label><input type="number" disabled={isPendingApproval} value={config.academic_reward.national} onChange={(e) => updateNested('academic_reward', 'national', e.target.value)} /></div>
                                <div className="rule-item reward"><label>Tiến bộ rõ rệt</label><input type="number" disabled={isPendingApproval} value={config.academic_reward.improvement} onChange={(e) => updateNested('academic_reward', 'improvement', e.target.value)} /></div>
                            </div>

                            <h5 className="sub-section-title mt-sm">Phong trào</h5>
                            <div className="rules-grid">
                                <div className="rule-item reward"><label>Giải Nhất trường</label><input type="number" disabled={isPendingApproval} value={config.activity_reward.first_school} onChange={(e) => updateNested('activity_reward', 'first_school', e.target.value)} /></div>
                                <div className="rule-item reward"><label>Giải Nhì/Ba trường</label><input type="number" disabled={isPendingApproval} value={config.activity_reward.second_school} onChange={(e) => updateNested('activity_reward', 'second_school', e.target.value)} /></div>
                                <div className="rule-item reward"><label>Giải Nhất Tỉnh</label><input type="number" disabled={isPendingApproval} value={config.activity_reward.first_province} onChange={(e) => updateNested('activity_reward', 'first_province', e.target.value)} /></div>
                                <div className="rule-item reward"><label>Giải QG/QT</label><input type="number" disabled={isPendingApproval} value={config.activity_reward.national} onChange={(e) => updateNested('activity_reward', 'national', e.target.value)} /></div>
                                <div className="rule-item reward"><label>Tình nguyện viên</label><input type="number" disabled={isPendingApproval} value={config.activity_reward.volunteer} onChange={(e) => updateNested('activity_reward', 'volunteer', e.target.value)} /></div>
                                <div className="rule-item reward"><label>Tham gia CLB</label><input type="number" disabled={isPendingApproval} value={config.activity_reward.club} onChange={(e) => updateNested('activity_reward', 'club', e.target.value)} /></div>
                            </div>

                            <h5 className="sub-section-title mt-sm">Tích cực</h5>
                            <div className="rules-grid">
                                <div className="rule-item reward"><label>Nhặt của rơi trả lại</label><input type="number" disabled={isPendingApproval} value={config.positive_reward.found_lost} onChange={(e) => updateNested('positive_reward', 'found_lost', e.target.value)} /></div>
                                <div className="rule-item reward"><label>Báo nguy cơ mất đồ</label><input type="number" disabled={isPendingApproval} value={config.positive_reward.report_risk} onChange={(e) => updateNested('positive_reward', 'report_risk', e.target.value)} /></div>
                                <div className="rule-item reward"><label>Gương mẫu</label><input type="number" disabled={isPendingApproval} value={config.positive_reward.role_model} onChange={(e) => updateNested('positive_reward', 'role_model', e.target.value)} /></div>
                                <div className="rule-item reward"><label>Giúp đỡ bạn bè</label><input type="number" disabled={isPendingApproval} value={config.positive_reward.help_peers} onChange={(e) => updateNested('positive_reward', 'help_peers', e.target.value)} /></div>
                                <div className="rule-item reward"><label>Phát hiện sai phạm</label><input type="number" disabled={isPendingApproval} value={config.positive_reward.report_violation} onChange={(e) => updateNested('positive_reward', 'report_violation', e.target.value)} /></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="point-config-footer">
                    <button className="btn-cancel" onClick={onClose}>Hủy bỏ</button>
                    <button 
                        className={`btn-submit ${isPendingApproval ? 'disabled' : ''}`} 
                        onClick={handleSubmitForApproval}
                        disabled={isPendingApproval}
                    >
                        <FiCheck /> {isPendingApproval ? 'Đang gửi phê duyệt' : 'Gửi yêu cầu phê duyệt'}
                    </button>
                </div>
            </div>
        </div>
    );
}

