import React, { useState } from "react";
import { FiCheckCircle, FiChevronRight, FiUsers, FiLayers, FiAlertCircle, FiCheck } from "react-icons/fi";
import { toast } from "react-toastify";

export default function ChargeBatchWizard() {
    const [step, setStep] = useState(1);
    
    // Mock States
    const [selectedFees, setSelectedFees] = useState(["HP_CHINH"]);
    const [selectedTargets, setSelectedTargets] = useState(["K10", "K11"]);

    const handleNext = () => setStep(prev => prev + 1);
    const handlePrev = () => setStep(prev => prev - 1);

    const handlePublish = () => {
        toast.success("Đợt thu đã được phát hành thành công (Mock)!");
        setStep(1);
    };

    return (
        <div className="fee-panel">
            <div className="fee-header">
                <div className="fee-header-text">
                    <h3>Tạo đợt thu hàng loạt (Mass Charge)</h3>
                    <p style={{fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem'}}>
                        Hệ thống sẽ tự động quét danh sách học sinh và áp dụng biểu phí tương ứng.
                    </p>
                </div>
            </div>

            <div className="wizard-stepper" style={{display: 'flex', gap: '2rem', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem'}}>
                <div className={`step-item ${step >= 1 ? 'active' : ''}`} style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: step === 1 ? '#2563eb' : '#94a3b8'}}>
                    <span style={{width: '24px', height: '24px', borderRadius: '50%', background: step === 1 ? '#2563eb' : '#e2e8f0', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem'}}>1</span>
                    Chọn khoản thu
                </div>
                <FiChevronRight style={{color: '#cbd5e1'}} />
                <div className={`step-item ${step >= 2 ? 'active' : ''}`} style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: step === 2 ? '#2563eb' : '#94a3b8'}}>
                    <span style={{width: '24px', height: '24px', borderRadius: '50%', background: step === 2 ? '#2563eb' : (step > 2 ? '#10b981' : '#e2e8f0'), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem'}}>{step > 2 ? <FiCheck /> : '2'}</span>
                    Đối tượng áp dụng
                </div>
                <FiChevronRight style={{color: '#cbd5e1'}} />
                <div className={`step-item ${step >= 3 ? 'active' : ''}`} style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: step === 3 ? '#2563eb' : '#94a3b8'}}>
                    <span style={{width: '24px', height: '24px', borderRadius: '50%', background: step === 3 ? '#2563eb' : '#e2e8f0', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem'}}>3</span>
                    Xem trước & Phát hành
                </div>
            </div>

            <div className="wizard-content" style={{minHeight: '300px'}}>
                {step === 1 && (
                    <div className="wizard-step-1">
                        <h4>Bước 1: Chọn các khoản phí cần thu</h4>
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem'}}>
                            {['HP_CHINH', 'AN_TRUA', 'BHYT', 'DONG_PHUC'].map(code => (
                                <label key={code} style={{display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', cursor: 'pointer'}}>
                                    <input type="checkbox" checked={selectedFees.includes(code)} onChange={() => {}} />
                                    <div>
                                        <strong>{code === 'HP_CHINH' ? 'Học phí chính quy' : (code === 'AN_TRUA' ? 'Tiền ăn bán trú' : code)}</strong>
                                        <p style={{fontSize: '0.75rem', color: '#64748b'}}>Áp dụng biểu phí 2026</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="wizard-step-2">
                        <h4>Bước 2: Chọn khối lớp / Học sinh áp dụng</h4>
                        <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                            {['K10', 'K11', 'K12'].map(g => (
                                <button key={g} className={`btn-secondary ${selectedTargets.includes(g) ? 'active' : ''}`} style={{padding: '1rem 2rem', borderColor: selectedTargets.includes(g) ? '#2563eb' : '#e2e8f0', background: selectedTargets.includes(g) ? '#eff6ff' : '#fff'}}>
                                    Khối {g.slice(1)}
                                </button>
                            ))}
                        </div>
                        <div style={{marginTop: '1.5rem', padding: '1rem', background: '#fffbeb', borderRadius: '0.5rem', color: '#92400e', display: 'flex', gap: '0.75rem', alignItems: 'center'}}>
                            <FiAlertCircle />
                            <span style={{fontSize: '0.85rem'}}>Hệ thống sẽ tự động quét trạng thái "Miễn giảm" để không tạo phát sinh tiền mặt cho những em thuộc diện miễn 100%.</span>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="wizard-step-3">
                        <div style={{textAlign: 'center', padding: '2rem 0'}}>
                            <div style={{fontSize: '3rem', color: '#10b981', marginBottom: '1rem'}}><FiCheckCircle /></div>
                            <h4>Sẵn sàng phát hành đợt thu</h4>
                            <div className="preview-stats" style={{display: 'flex', justifyContent: 'center', gap: '3rem', marginTop: '2rem'}}>
                                <div className="p-stat">
                                    <span style={{display: 'block', fontSize: '0.8rem', color: '#64748b'}}>Tổng số học sinh</span>
                                    <strong style={{fontSize: '1.5rem'}}>1,250</strong>
                                </div>
                                <div className="p-stat">
                                    <span style={{display: 'block', fontSize: '0.8rem', color: '#64748b'}}>Học sinh được giảm phí</span>
                                    <strong style={{fontSize: '1.5rem', color: '#f59e0b'}}>42</strong>
                                </div>
                                <div className="p-stat">
                                    <span style={{display: 'block', fontSize: '0.8rem', color: '#64748b'}}>Dự kiến doanh thu</span>
                                    <strong style={{fontSize: '1.5rem', color: '#2563eb'}}>1.5 tỷ ₫</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="wizard-footer" style={{marginTop: '2rem', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem'}}>
                <button className="btn-secondary" onClick={handlePrev} disabled={step === 1}>Quay lại</button>
                {step < 3 ? (
                    <button className="btn-primary" onClick={handleNext}>Tiếp theo <FiChevronRight /></button>
                ) : (
                    <button className="btn-primary" style={{background: '#10b981', borderColor: '#10b981'}} onClick={handlePublish}>Phát hành đợt thu</button>
                )
                        }
            </div>
        </div>
    );
}
