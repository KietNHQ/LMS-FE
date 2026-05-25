import React, { useState, useEffect } from "react";
import { FiLock, FiCheckCircle, FiAlertCircle, FiShield, FiChevronRight, FiX, FiUnlock, FiRefreshCw } from "react-icons/fi";
import { toast } from "react-toastify";
import { financeService } from "../../../../../services/pages/management/finance/financeService";

export default function PeriodClosingWizard({ onClose, onLockComplete, schoolYearId, semesterId }) {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [isReopening, setIsReopening] = useState(false);
    const [isClosed, setIsClosed] = useState(false);
    const [notes, setNotes] = useState("");
    const [validationResult, setValidationResult] = useState(null);

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        setIsLoading(true);
        try {
            const res = await financeService.getPeriodClosingStatus({
                params: { schoolYearId: schoolYearId || undefined },
            });
            if (res?.success) {
                setIsClosed(res.data?.isClosed === true);
                setValidationResult(res.data?.validation ?? null);
            }
        } catch (err) {
            console.error("[PeriodClosingWizard] checkStatus error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReopen = async () => {
        setIsReopening(true);
        try {
            const res = await financeService.reopenPeriod({
                body: {
                    schoolYearId: schoolYearId || undefined,
                    semesterId: semesterId || undefined,
                },
            });
            if (res?.success) {
                toast.success("Đã mở lại kỳ thanh toán thành công!");
                setIsClosed(false);
                if (onLockComplete) onLockComplete();
                if (onClose) onClose();
            } else {
                toast.error(res?.error?.message || "Có lỗi khi mở lại kỳ.");
            }
        } catch (err) {
            toast.error("Có lỗi khi mở lại kỳ.");
        } finally {
            setIsReopening(false);
        }
    };

    const handleNext = () => {
        if (isClosed) {
            toast.info("Kỳ thanh toán đã bị khóa.");
            return;
        }
        setStep((prev) => prev + 1);
    };

    const handleFinalLock = async () => {
        setIsClosing(true);
        try {
            const res = await financeService.closePeriod({
                body: {
                    schoolYearId: schoolYearId || undefined,
                    semesterId: semesterId || undefined,
                    notes: notes || null,
                },
            });
            if (res?.success) {
                toast.success("Kỳ thanh toán đã được KHÓA thành công!");
                setIsClosed(true);
                if (onLockComplete) onLockComplete();
                if (onClose) onClose();
            } else {
                toast.error(res?.error?.message || "Có lỗi khi khóa kỳ.");
            }
        } catch (err) {
            toast.error("Có lỗi khi khóa kỳ thanh toán.");
        } finally {
            setIsClosing(false);
        }
    };

    return (
        <div className="fee-modal-overlay">
            <div className="fee-modal" style={{ width: "500px" }}>
                <div className="fee-modal-header">
                    <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <FiShield style={{ color: isClosed ? "#dc2626" : "#2563eb" }} />
                        {isClosed ? "Kỳ thanh toán đã bị khóa" : "Quyết toán & Khóa kỳ"}
                    </h3>
                    <button className="btn-icon" style={{ border: "none", background: "none" }} onClick={onClose}><FiX /></button>
                </div>

                <div className="fee-modal-body">
                    {isClosed ? (
                        <div style={{ textAlign: "center", padding: "1rem 0" }}>
                            <FiLock style={{ fontSize: "3rem", color: "#dc2626", marginBottom: "1rem" }} />
                            <h4>Kỳ thanh toán hiện tại đang bị khóa</h4>
                            <p style={{ fontSize: "0.9rem", color: "#64748b", marginTop: "0.5rem" }}>
                                Toàn bộ thao tác tạo/sửa/xóa công nợ trong kỳ này đã bị vô hiệu hóa.
                            </p>
                            <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "0.5rem", color: "#92400e", fontSize: "0.85rem" }}>
                                <strong>Lưu ý:</strong> Mở lại kỳ chỉ nên thực hiện khi thật sự cần thiết và cần có sự đồng ý của kế toán trưởng.
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="wizard-stepper" style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
                                {[1, 2, 3].map((s) => (
                                    <div
                                        key={s}
                                        style={{
                                            flex: 1,
                                            height: "4px",
                                            background: step >= s ? "#2563eb" : "#e2e8f0",
                                            borderRadius: "2px",
                                        }}
                                    />
                                ))}
                            </div>

                            {step === 1 && (
                                <div className="step-content">
                                    <h4 style={{ marginBottom: "1rem" }}>Bước 1: Kiểm tra tính toàn vẹn dữ liệu</h4>
                                    {isLoading ? (
                                        <p style={{ textAlign: "center", color: "#64748b" }}>Đang kiểm tra...</p>
                                    ) : validationResult ? (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", background: "#f8fafc", borderRadius: "0.5rem" }}>
                                                <span style={{ fontSize: "0.9rem" }}>Trạng thái kỳ thanh toán</span>
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: isClosed ? "#dc2626" : "#10b981" }}>
                                                    {isClosed ? <FiLock /> : <FiCheckCircle />}
                                                    <span style={{ color: isClosed ? "#dc2626" : "#10b981" }}>{isClosed ? "Đã khóa" : "Mở"}</span>
                                                </div>
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", background: "#f8fafc", borderRadius: "0.5rem" }}>
                                                <span style={{ fontSize: "0.9rem" }}>Công nợ chưa thanh toán</span>
                                                <span style={{ fontWeight: 600, color: validationResult.unpaidDebtCount > 0 ? "#dc2626" : "#10b981" }}>
                                                    {validationResult.unpaidDebtCount} / {validationResult.totalDebtCount}
                                                </span>
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", background: "#f8fafc", borderRadius: "0.5rem" }}>
                                                <span style={{ fontSize: "0.9rem" }}>Yêu cầu chờ phê duyệt</span>
                                                <span style={{ fontWeight: 600, color: validationResult.pendingApprovalCount > 0 ? "#f59e0b" : "#10b981" }}>
                                                    {validationResult.pendingApprovalCount}
                                                </span>
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", background: "#f8fafc", borderRadius: "0.5rem" }}>
                                                <span style={{ fontSize: "0.9rem" }}>Miễn giảm chờ duyệt</span>
                                                <span style={{ fontWeight: 600, color: validationResult.pendingExemptionCount > 0 ? "#f59e0b" : "#10b981" }}>
                                                    {validationResult.pendingExemptionCount}
                                                </span>
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", background: "#f8fafc", borderRadius: "0.5rem" }}>
                                                <span style={{ fontSize: "0.9rem" }}>Hóa đơn chưa ký</span>
                                                <span style={{ fontWeight: 600, color: validationResult.unsignedInvoiceCount > 0 ? "#f59e0b" : "#10b981" }}>
                                                    {validationResult.unsignedInvoiceCount}
                                                </span>
                                            </div>
                                            {validationResult.readyToClose ? (
                                                <div style={{ padding: "0.75rem", background: "#dcfce7", borderRadius: "0.5rem", color: "#166534", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                    <FiCheckCircle /> Sẵn sàng khóa kỳ — tất cả dữ liệu đã được xử lý
                                                </div>
                                            ) : (
                                                <div style={{ padding: "0.75rem", background: "#fef9c3", borderRadius: "0.5rem", color: "#854d0e", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                    <FiAlertCircle /> Chưa sẵn sàng — vui lòng xử lý các mục trên trước khi khóa kỳ
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", background: "#f8fafc", borderRadius: "0.5rem" }}>
                                                <span style={{ fontSize: "0.9rem" }}>Trạng thái kỳ thanh toán</span>
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#10b981" }}>
                                                    <FiCheckCircle /> <span style={{ color: "#10b981" }}>Mở</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {step === 2 && (
                                <div className="step-content">
                                    <h4 style={{ marginBottom: "1rem" }}>Bước 2: Kết chuyển số dư</h4>
                                    <p style={{ fontSize: "0.9rem", color: "#64748b", lineHeight: 1.5 }}>
                                        Hệ thống sẽ tự động chốt số dư cuối kỳ này và chuyển thành số dư đầu kỳ của kỳ kế toán tiếp theo. Thao tác này không thể hoàn tác.
                                    </p>
                                    <div style={{ marginTop: "1rem" }}>
                                        <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>Ghi chú (tùy chọn)</label>
                                        <textarea
                                            className="fee-input full-width"
                                            rows={2}
                                            placeholder="VD: Chốt sổ HK1 2025-2026"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            style={{ resize: "vertical" }}
                                        />
                                    </div>
                                    <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "0.5rem", color: "#92400e", fontSize: "0.85rem" }}>
                                        <strong>Lưu ý:</strong> Sau khi xác nhận, toàn bộ các chức năng Thêm/Sửa/Xóa tại module Tài chính trong kỳ này sẽ bị vô hiệu hóa.
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="step-content" style={{ textAlign: "center", padding: "1rem 0" }}>
                                    <FiLock style={{ fontSize: "3rem", color: "#dc2626", marginBottom: "1rem" }} />
                                    <h4>Xác nhận Khóa kỳ kế toán</h4>
                                    <p style={{ fontSize: "0.9rem", color: "#64748b" }}>
                                        Bạn đang thực hiện khóa kỳ thanh toán. Hành động này <strong>không thể hoàn tác</strong>.
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="fee-modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Đóng</button>
                    {isClosed ? (
                        <button className="btn-primary" style={{ background: "#16a34a" }} onClick={handleReopen} disabled={isReopening}>
                            <FiUnlock /> {isReopening ? "Đang mở..." : "Mở lại kỳ"}
                        </button>
                    ) : (
                        <>
                            {step < 3 && (
                                <button className="btn-primary" onClick={handleNext}>
                                    Tiếp theo <FiChevronRight />
                                </button>
                            )}
                            {step === 3 && (
                                <button className="btn-primary" style={{ background: "#dc2626" }} onClick={handleFinalLock} disabled={isClosing}>
                                    <FiLock /> {isClosing ? "Đang khóa..." : "Chính thức Khóa sổ"}
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
