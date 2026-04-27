import React, { useState } from "react";
import { FiLock, FiCheckCircle, FiAlertCircle, FiShield, FiChevronRight, FiX } from "react-icons/fi";
import { toast } from "react-toastify";

export default function PeriodClosingWizard({ onClose, onLockComplete }) {
    const [step, setStep] = useState(1);
    const [validations, setValidations] = useState({
        paymentsAllocated: true,
        invoicesSigned: false,
        ledgerBalanced: true
    });

    const handleNext = () => setStep(prev => prev + 1);

    const handleFinalLock = () => {
        toast.info("Đang thực hiện chốt sổ và khóa kỳ kế toán...");
        setTimeout(() => {
            toast.success("Kỳ kế toán Tháng 10/2026 đã được KHÓA!");
            onLockComplete();
            onClose();
        }, 2000);
    };

    return (
        <div className="fee-modal-overlay">
            <div className="fee-modal" style={{width: '500px'}}>
                <div className="fee-modal-header">
                    <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}><FiShield style={{color: '#2563eb'}}/> Quyết toán & Khóa kỳ</h3>
                    <button className="btn-icon" style={{border: 'none', background: 'none'}} onClick={onClose}><FiX /></button>
                </div>
                
                <div className="fee-modal-body">
                    <div className="wizard-stepper" style={{display: 'flex', gap: '1rem', marginBottom: '1.5rem'}}>
                        {[1, 2, 3].map(s => (
                            <div key={s} style={{flex: 1, height: '4px', background: step >= s ? '#2563eb' : '#e2e8f0', borderRadius: '2px'}}></div>
                        ))}
                    </div>

                    {step === 1 && (
                        <div className="step-content">
                            <h4 style={{marginBottom: '1rem'}}>Bước 1: Kiểm tra tính toàn vẹn dữ liệu</h4>
                            <div className="validation-list" style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem'}}>
                                    <span style={{fontSize: '0.9rem'}}>Phân bổ thanh toán (Allocation)</span>
                                    {validations.paymentsAllocated ? <FiCheckCircle style={{color: '#10b981'}}/> : <FiAlertCircle style={{color: '#dc2626'}}/>}
                                </div>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem'}}>
                                    <span style={{fontSize: '0.9rem'}}>Hóa đơn điện tử (Signed)</span>
                                    {validations.invoicesSigned ? <FiCheckCircle style={{color: '#10b981'}}/> : <div style={{display:'flex', alignItems:'center', gap:'0.5rem', color: '#f59e0b'}}><FiAlertCircle /> <span>Cần ký 2 HĐ</span></div>}
                                </div>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem'}}>
                                    <span style={{fontSize: '0.9rem'}}>Đối soát Sổ cái (Ledger)</span>
                                    {validations.ledgerBalanced ? <FiCheckCircle style={{color: '#10b981'}}/> : <FiAlertCircle style={{color: '#dc2626'}}/>}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="step-content">
                            <h4 style={{marginBottom: '1rem'}}>Bước 2: Kết chuyển số dư</h4>
                            <p style={{fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5}}>
                                Hệ thống sẽ tự động chốt số dư cuối kỳ này và chuyển thành số dư đầu kỳ của kỳ kế toán tiếp theo. Thao tác này không thể hoàn tác.
                            </p>
                            <div style={{marginTop: '1.5rem', padding: '1rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '0.5rem', color: '#92400e', fontSize: '0.85rem'}}>
                                <strong>Lưu ý:</strong> Sau khi xác nhận, toàn bộ các chức năng Thêm/Sửa/Xóa tại module Tài chính trong kỳ này sẽ bị vô hiệu hóa.
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="step-content" style={{textAlign: 'center', padding: '1rem 0'}}>
                            <FiLock style={{fontSize: '3rem', color: '#dc2626', marginBottom: '1rem'}}/>
                            <h4>Xác nhận Khóa kỳ kế toán</h4>
                            <p style={{fontSize: '0.9rem', color: '#64748b'}}>Bạn đang thực hiện khóa kỳ: **Tháng 10/2026**</p>
                        </div>
                    )}
                </div>

                <div className="fee-modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Hủy bỏ</button>
                    {step < 3 ? (
                        <button className="btn-primary" onClick={handleNext}>Tiếp theo <FiChevronRight /></button>
                    ) : (
                        <button className="btn-primary" style={{background: '#dc2626'}} onClick={handleFinalLock}><FiLock /> Chính thức Khóa sổ</button>
                    )}
                </div>
            </div>
        </div>
    );
}
