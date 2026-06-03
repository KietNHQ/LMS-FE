import React, { useState, useEffect } from "react";
import { FiX, FiCheck, FiChevronRight, FiClock } from "react-icons/fi";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vpDisciplineService } from "../../../../services/pages/management/vp-discipline";
import "./PointConfigModal.css";

export default function PointConfigModal({ isOpen, onClose }) {
    const [isPendingApproval, setIsPendingApproval] = useState(false);
    const [config, setConfig] = useState(null); // null = loading

    const queryClient = useQueryClient();

    // Fetch current violation types config
    const { isLoading } = useQuery({
        queryKey: ["violation-types-config"],
        queryFn: async () => {
            const res = await vpDisciplineService.callByKey("get_violation_types");
            const types = res?.data || res || [];

            // Build config structure from API data
            const grouped = {
                standardPoint: 100,
                attendance_violation: {},
                discipline_violation: {},
                property_violation: {},
                academic_violation: {},
                attendance_reward: {},
                academic_reward: {},
                activity_reward: {},
                positive_reward: {}
            };

            types.forEach(vt => {
                const cat = vt.category;
                const entry = {
                    id: vt.id,
                    points: vt.default_points || vt.points || 0,
                    minPoints: vt.min_points || vt.minPoints || -50,
                    maxPoints: vt.max_points || vt.maxPoints || 0,
                    severity: vt.severity || "low"
                };

                if (cat === "attendance" || cat === "attendance_violation") {
                    const key = vt.code || vt.name?.toLowerCase().replace(/\s+/g, "_");
                    grouped.attendance_violation[key] = entry;
                } else if (cat === "discipline" || cat === "discipline_violation") {
                    const key = vt.code || vt.name?.toLowerCase().replace(/\s+/g, "_");
                    grouped.discipline_violation[key] = entry;
                } else if (cat === "property" || cat === "property_violation") {
                    const key = vt.code || vt.name?.toLowerCase().replace(/\s+/g, "_");
                    grouped.property_violation[key] = entry;
                } else if (cat === "academic" || cat === "academic_violation") {
                    const key = vt.code || vt.name?.toLowerCase().replace(/\s+/g, "_");
                    grouped.academic_violation[key] = entry;
                } else if (cat === "attendance_reward") {
                    const key = vt.code || vt.name?.toLowerCase().replace(/\s+/g, "_");
                    grouped.attendance_reward[key] = entry;
                } else if (cat === "academic_reward") {
                    const key = vt.code || vt.name?.toLowerCase().replace(/\s+/g, "_");
                    grouped.academic_reward[key] = entry;
                } else if (cat === "activity_reward") {
                    const key = vt.code || vt.name?.toLowerCase().replace(/\s+/g, "_");
                    grouped.activity_reward[key] = entry;
                } else if (cat === "positive_reward") {
                    const key = vt.code || vt.name?.toLowerCase().replace(/\s+/g, "_");
                    grouped.positive_reward[key] = entry;
                }
            });

            return grouped;
        },
        onSuccess: (data) => {
            setConfig(data);
        },
        onError: () => {
            // Fallback to defaults if API fails
            setConfig(getDefaultConfig());
            toast.error("Không thể tải cấu hình điểm thi đua. Đang sử dụng giá trị mặc định.");
        },
        enabled: isOpen,
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

    // Mutation to save violation type points
    const saveMutation = useMutation({
        mutationFn: async ({ violationTypeId, pointsData }) => {
            await vpDisciplineService.callByKey("put_violation_types_by_id_points", {
                pathParams: { id: violationTypeId },
                body: pointsData,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["violation-types-config"] });
        }
    });

    // Initialize config on mount if not loaded
    useEffect(() => {
        if (isOpen && config === null) {
            // Trigger query by invalidating
            queryClient.invalidateQueries({ queryKey: ["violation-types-config"] });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // Show loading state
    if (isLoading && config === null) {
        return (
            <div className="point-config-overlay" onClick={onClose}>
                <div className="point-config-modal admin-fidelity" onClick={e => e.stopPropagation()}>
                    <div className="point-config-header">
                        <div className="header-title">
                            <h2>Cấu Hình Điểm Thi Đua</h2>
                        </div>
                        <button className="close-btn" onClick={onClose}><FiX /></button>
                    </div>
                    <div className="point-config-body">
                        <div style={{ textAlign: "center", padding: "40px" }}>
                            Đang tải cấu hình...
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const getDefaultConfig = () => ({
        standardPoint: 100,
        attendance_violation: { unexcused: { points: -15 }, late: { points: -5 }, skip_class: { points: -50 }, skip_period: { points: -10 } },
        discipline_violation: { uniform: { points: -10 }, disorder: { points: -20 }, swearing: { points: -15 }, phone: { points: -5 }, eating: { points: -3 }, fighting: { points: -25 }, bullying: { points: -30 } },
        property_violation: { damage: { points: -20 }, vandalism: { points: -10 }, littering: { points: -3 }, no_electricity: { points: -2 } },
        academic_violation: { no_homework: { points: -2 }, no_materials: { points: -2 }, cheating: { points: -50 }, no_extracurricular: { points: -5 } },
        attendance_reward: { month: { points: 20 }, semester: { points: 50 }, no_late_semester: { points: 10 } },
        academic_reward: { school: { points: 30 }, province: { points: 50 }, national: { points: 100 }, improvement: { points: 20 } },
        activity_reward: { first_school: { points: 20 }, second_school: { points: 15 }, first_province: { points: 50 }, national: { points: 100 }, volunteer: { points: 15 }, club: { points: 10 } },
        positive_reward: { found_lost: { points: 20 }, report_risk: { points: 5 }, role_model: { points: 20 }, help_peers: { points: 10 }, report_violation: { points: 15 } }
    });

    // Use default if not loaded
    const currentConfig = config || getDefaultConfig();

    const getPoints = (entry) => {
        if (!entry) return 0;
        if (typeof entry === 'number') return entry;
        if (typeof entry === 'object' && entry !== null) return entry.points ?? 0;
        return 0;
    };

    const updateNested = (category, field, value) => {
        if (isPendingApproval) return;
        setConfig(prev => {
            if (!prev) return prev;
            const currentEntry = prev[category]?.[field];
            return {
                ...prev,
                [category]: {
                    ...prev[category],
                    [field]: {
                        ...currentEntry,
                        points: parseInt(value) || 0
                    }
                }
            };
        });
    };

    const handleSubmitForApproval = async () => {
        setIsPendingApproval(true);
        try {
            // Save all violation type points to API
            const categories = ['attendance_violation', 'discipline_violation', 'property_violation', 'academic_violation'];

            for (const category of categories) {
                const categoryData = currentConfig[category] || {};
                for (const [key, entry] of Object.entries(categoryData)) {
                    if (entry.id) {
                        // Has API ID - save via mutation
                        await saveMutation.mutateAsync({
                            violationTypeId: entry.id,
                            pointsData: {
                                points: entry.points,
                                minPoints: entry.minPoints,
                                maxPoints: entry.maxPoints,
                                severity: entry.severity
                            }
                        });
                    }
                }
            }

            toast.success("Đã lưu cấu hình điểm thi đua!");
            onClose();
        } catch (error) {
            toast.error("Không thể lưu cấu hình. Vui lòng thử lại.");
        } finally {
            setIsPendingApproval(false);
        }
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
                                        value={currentConfig.standardPoint}
                                        onChange={(e) => setConfig({...currentConfig, standardPoint: parseInt(e.target.value) || 0})}
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
                                <div className="rule-item"><label>Nghỉ học k phép</label><input type="number" disabled={isPendingApproval} value={getPoints(currentConfig.attendance_violation?.unexcused)} onChange={(e) => updateNested('attendance_violation', 'unexcused', e.target.value)} /></div>
                                <div className="rule-item"><label>Đi học muộn</label><input type="number" disabled={isPendingApproval} value={getPoints(currentConfig.attendance_violation?.late)} onChange={(e) => updateNested('attendance_violation', 'late', e.target.value)} /></div>
                                <div className="rule-item serious"><label>Trốn học, bỏ tiết</label><input type="number" disabled={isPendingApproval} value={getPoints(currentConfig.attendance_violation?.skip_class)} onChange={(e) => updateNested('attendance_violation', 'skip_class', e.target.value)} /></div>
                                <div className="rule-item"><label>Bỏ giờ trong tiết</label><input type="number" disabled={isPendingApproval} value={getPoints(currentConfig.attendance_violation?.skip_period)} onChange={(e) => updateNested('attendance_violation', 'skip_period', e.target.value)} /></div>
                            </div>

                            <h5 className="sub-section-title mt-sm">Nề nếp - Tác phong</h5>
                            <div className="rules-grid">
                                <div className="rule-item"><label>Đồng phục/tác phong</label><input type="number" disabled={isPendingApproval} value={getPoints(currentConfig.discipline_violation?.uniform)} onChange={(e) => updateNested('discipline_violation', 'uniform', e.target.value)} /></div>
                                <div className="rule-item"><label>Mất trật tự trong giờ</label><input type="number" disabled={isPendingApproval} value={getPoints(currentConfig.discipline_violation?.disorder)} onChange={(e) => updateNested('discipline_violation', 'disorder', e.target.value)} /></div>
                                <div className="rule-item"><label>Nói tục, chửi thề</label><input type="number" disabled={isPendingApproval} value={getPoints(currentConfig.discipline_violation?.swearing)} onChange={(e) => updateNested('discipline_violation', 'swearing', e.target.value)} /></div>
                                <div className="rule-item"><label>Dùng đt trái phép</label><input type="number" disabled={isPendingApproval} value={getPoints(currentConfig.discipline_violation?.phone)} onChange={(e) => updateNested('discipline_violation', 'phone', e.target.value)} /></div>
                                <div className="rule-item"><label>Ăn uống trong giờ</label><input type="number" disabled={isPendingApproval} value={getPoints(currentConfig.discipline_violation?.eating)} onChange={(e) => updateNested('discipline_violation', 'eating', e.target.value)} /></div>
                                <div className="rule-item"><label>Gây gổ, xô đẩy</label><input type="number" disabled={isPendingApproval} value={getPoints(currentConfig.discipline_violation?.fighting)} onChange={(e) => updateNested('discipline_violation', 'fighting', e.target.value)} /></div>
                                <div className="rule-item serious"><label>Bắt nạt, xúc phạm</label><input type="number" disabled={isPendingApproval} value={getPoints(currentConfig.discipline_violation?.bullying)} onChange={(e) => updateNested('discipline_violation', 'bullying', e.target.value)} /></div>
                            </div>

                            <h5 className="sub-section-title mt-sm">Tài sản - Môi trường</h5>
                            <div className="rules-grid">
                                <div className="rule-item"><label>Hư hỏng tài sản</label><input type="number" disabled={isPendingApproval} value={getPoints(currentConfig.property_violation?.damage)} onChange={(e) => updateNested('property_violation', 'damage', e.target.value)} /></div>
                                <div className="rule-item"><label>Vẽ bậy, bôi bẩn</label><input type="number" disabled={isPendingApproval} value={getPoints(currentConfig.property_violation?.vandalism)} onChange={(e) => updateNested('property_violation', 'vandalism', e.target.value)} /></div>
                                <div className="rule-item"><label>Vứt rác bừa bãi</label><input type="number" disabled={isPendingApproval} value={getPoints(currentConfig.property_violation?.littering)} onChange={(e) => updateNested('property_violation', 'littering', e.target.value)} /></div>
                                <div className="rule-item"><label>Không tắt điện/quạt</label><input type="number" disabled={isPendingApproval} value={getPoints(currentConfig.property_violation?.no_electricity)} onChange={(e) => updateNested('property_violation', 'no_electricity', e.target.value)} /></div>
                            </div>

                            <h5 className="sub-section-title mt-sm">Học tập</h5>
                            <div className="rules-grid">
                                <div className="rule-item"><label>Không làm bài tập</label><input type="number" disabled={isPendingApproval} value={getPoints(currentConfig.academic_violation?.no_homework)} onChange={(e) => updateNested('academic_violation', 'no_homework', e.target.value)} /></div>
                                <div className="rule-item"><label>Không mang sách vở</label><input type="number" disabled={isPendingApproval} value={getPoints(currentConfig.academic_violation?.no_materials)} onChange={(e) => updateNested('academic_violation', 'no_materials', e.target.value)} /></div>
                                <div className="rule-item serious"><label>Gian lận thi cử</label><input type="number" disabled={isPendingApproval} value={getPoints(currentConfig.academic_violation?.cheating)} onChange={(e) => updateNested('academic_violation', 'cheating', e.target.value)} /></div>
                                <div className="rule-item"><label>K tham gia ngoại khóa</label><input type="number" disabled={isPendingApproval} value={getPoints(currentConfig.academic_violation?.no_extracurricular)} onChange={(e) => updateNested('academic_violation', 'no_extracurricular', e.target.value)} /></div>
                            </div>
                        </div>

                        {/* 2. NHÓM KHEN THƯỞNG */}
                        <div className="rules-section">
                            <div className="section-title">
                                <FiChevronRight /> <h4>2. Nhóm Khen Thưởng</h4>
                            </div>

                            <h5 className="sub-section-title">Chuyên cần</h5>
                            <div className="rules-grid">
                                <div className="rule-item reward"><label>Đi học đủ 1 tháng</label><input type="number" disabled={isPendingApproval} value={getPoints(currentConfig.attendance_reward?.month)} onChange={(e) => updateNested('attendance_reward', 'month', e.target.value)} /></div>
                                <div className="rule-item reward"><label>100% chuyên cần HK</label><input type="number" disabled={isPendingApproval} value={getPoints(currentConfig.attendance_reward?.semester)} onChange={(e) => updateNested('attendance_reward', 'semester', e.target.value)} /></div>
                                <div className="rule-item reward"><label>K đi muộn trong HK</label><input type="number" disabled={isPendingApproval} value={getPoints(currentConfig.attendance_reward?.no_late_semester)} onChange={(e) => updateNested('attendance_reward', 'no_late_semester', e.target.value)} /></div>
                            </div>

                            <h5 className="sub-section-title mt-sm">Học tập</h5>
                            <div className="rules-grid">
                                <div className="rule-item reward"><label>HSG cấp trường</label><input type="number" disabled={isPendingApproval} value={getPoints(currentConfig.academic_reward?.school)} onChange={(e) => updateNested('academic_reward', 'school', e.target.value)} /></div>
                                <div className="rule-item reward"><label>HSG Tỉnh/TP</label><input type="number" disabled={isPendingApproval} value={getPoints(currentConfig.academic_reward?.province)} onChange={(e) => updateNested('academic_reward', 'province', e.target.value)} /></div>
                                <div className="rule-item reward"><label>HSG QG/QT</label><input type="number" disabled={isPendingApproval} value={getPoints(currentConfig.academic_reward?.national)} onChange={(e) => updateNested('academic_reward', 'national', e.target.value)} /></div>
                                <div className="rule-item reward"><label>Tiến bộ rõ rệt</label><input type="number" disabled={isPendingApproval} value={getPoints(currentConfig.academic_reward?.improvement)} onChange={(e) => updateNested('academic_reward', 'improvement', e.target.value)} /></div>
                            </div>

                            <h5 className="sub-section-title mt-sm">Phong trào</h5>
                            <div className="rules-grid">
                                <div className="rule-item reward"><label>Giải Nhất trường</label><input type="number" disabled={isPendingApproval} value={getPoints(currentConfig.activity_reward?.first_school)} onChange={(e) => updateNested('activity_reward', 'first_school', e.target.value)} /></div>
                                <div className="rule-item reward"><label>Giải Nhì/Ba trường</label><input type="number" disabled={isPendingApproval} value={getPoints(currentConfig.activity_reward?.second_school)} onChange={(e) => updateNested('activity_reward', 'second_school', e.target.value)} /></div>
                                <div className="rule-item reward"><label>Giải Nhất Tỉnh</label><input type="number" disabled={isPendingApproval} value={getPoints(currentConfig.activity_reward?.first_province)} onChange={(e) => updateNested('activity_reward', 'first_province', e.target.value)} /></div>
                                <div className="rule-item reward"><label>Giải QG/QT</label><input type="number" disabled={isPendingApproval} value={getPoints(currentConfig.activity_reward?.national)} onChange={(e) => updateNested('activity_reward', 'national', e.target.value)} /></div>
                                <div className="rule-item reward"><label>Tình nguyện viên</label><input type="number" disabled={isPendingApproval} value={getPoints(currentConfig.activity_reward?.volunteer)} onChange={(e) => updateNested('activity_reward', 'volunteer', e.target.value)} /></div>
                                <div className="rule-item reward"><label>Tham gia CLB</label><input type="number" disabled={isPendingApproval} value={getPoints(currentConfig.activity_reward?.club)} onChange={(e) => updateNested('activity_reward', 'club', e.target.value)} /></div>
                            </div>

                            <h5 className="sub-section-title mt-sm">Tích cực</h5>
                            <div className="rules-grid">
                                <div className="rule-item reward"><label>Nhặt của rơi trả lại</label><input type="number" disabled={isPendingApproval} value={getPoints(currentConfig.positive_reward?.found_lost)} onChange={(e) => updateNested('positive_reward', 'found_lost', e.target.value)} /></div>
                                <div className="rule-item reward"><label>Báo nguy cơ mất đồ</label><input type="number" disabled={isPendingApproval} value={getPoints(currentConfig.positive_reward?.report_risk)} onChange={(e) => updateNested('positive_reward', 'report_risk', e.target.value)} /></div>
                                <div className="rule-item reward"><label>Gương mẫu</label><input type="number" disabled={isPendingApproval} value={getPoints(currentConfig.positive_reward?.role_model)} onChange={(e) => updateNested('positive_reward', 'role_model', e.target.value)} /></div>
                                <div className="rule-item reward"><label>Giúp đỡ bạn bè</label><input type="number" disabled={isPendingApproval} value={getPoints(currentConfig.positive_reward?.help_peers)} onChange={(e) => updateNested('positive_reward', 'help_peers', e.target.value)} /></div>
                                <div className="rule-item reward"><label>Phát hiện sai phạm</label><input type="number" disabled={isPendingApproval} value={getPoints(currentConfig.positive_reward?.report_violation)} onChange={(e) => updateNested('positive_reward', 'report_violation', e.target.value)} /></div>
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

