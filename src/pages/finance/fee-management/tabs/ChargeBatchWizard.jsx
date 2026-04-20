import React, { useState } from "react";
import { FiCheckCircle, FiChevronRight, FiUsers, FiLayers, FiAlertCircle, FiCheck } from "react-icons/fi";
import { toast } from "react-toastify";

export default function ChargeBatchWizard() {
    const [step, setStep] = useState(1);

    // Mock States
    const [selectedFees, setSelectedFees] = useState(["HP_CHINH"]);
    const [selectedTargets, setSelectedTargets] = useState(["K10", "K11"]);

    const feeOptions = [
        { code: "HP_CHINH", name: "Học phí chính quy", amountLabel: "4.500.000đ / HS", amountValue: 4500000 },
        { code: "AN_TRUA", name: "Phí bán trú", amountLabel: "750.000đ / HS", amountValue: 750000 },
        { code: "BHYT", name: "Bảo hiểm y tế", amountLabel: "680.000đ / HS", amountValue: 680000 },
        { code: "DONG_PHUC", name: "Đồng phục", amountLabel: "900.000đ / HS", amountValue: 900000 },
    ];

    const targetOptions = [
        { code: "K10", name: "Khối 10", students: 420, exempt: 32 },
        { code: "K11", name: "Khối 11", students: 405, exempt: 28 },
        { code: "K12", name: "Khối 12", students: 360, exempt: 18 },
    ];

    const handleNext = () => {
        if (step === 1 && selectedFees.length === 0) {
            toast.warning("Vui lòng chọn ít nhất 1 khoản thu.");
            return;
        }

        if (step === 2 && selectedTargets.length === 0) {
            toast.warning("Vui lòng chọn ít nhất 1 đối tượng áp dụng.");
            return;
        }

        setStep((prev) => prev + 1);
    };
    const handlePrev = () => setStep(prev => prev - 1);

    const toggleFee = (code) => {
        setSelectedFees((prev) => (prev.includes(code) ? prev.filter((item) => item !== code) : [...prev, code]));
    };

    const toggleTarget = (target) => {
        setSelectedTargets((prev) => (prev.includes(target) ? prev.filter((item) => item !== target) : [...prev, target]));
    };

    const selectedFeeDetails = feeOptions.filter((fee) => selectedFees.includes(fee.code));
    const selectedTargetDetails = targetOptions.filter((target) => selectedTargets.includes(target.code));

    const selectedStudentCount = selectedTargetDetails.reduce((total, target) => total + target.students, 0);
    const exemptStudentCount = selectedTargetDetails.reduce((total, target) => total + target.exempt, 0);
    const billableStudentCount = Math.max(0, selectedStudentCount - exemptStudentCount);
    const feeAmountPerStudent = selectedFeeDetails.reduce((total, fee) => total + fee.amountValue, 0);
    const estimatedRevenue = billableStudentCount * feeAmountPerStudent;

    const formatMoney = (value) => new Intl.NumberFormat("vi-VN").format(value);

    const handlePublish = () => {
        toast.success("Đợt thu đã được phát hành thành công (Mock)!");
        setStep(1);
    };

    return (
        <div className="fee-panel">
            <div className="fee-header">
                <div className="fee-header-text">
                    <h3>Tạo đợt thu hàng loạt (Mass Charge)</h3>
                    <p>Thiết lập theo 3 bước: chọn khoản thu, chọn đối tượng, kiểm tra trước khi phát hành.</p>
                </div>
            </div>

            <div className="wizard-stepper">
                <div className={`step-item ${step >= 1 ? 'active' : ''}`}>
                    <span className="step-dot">1</span>
                    <div>
                        <strong>Chọn khoản thu</strong>
                        <p>Đánh dấu các khoản cần phát hành</p>
                    </div>
                </div>
                <FiChevronRight className="step-sep" />
                <div className={`step-item ${step >= 2 ? 'active' : ''}`}>
                    <span className="step-dot">{step > 2 ? <FiCheck /> : '2'}</span>
                    <div>
                        <strong>Đối tượng áp dụng</strong>
                        <p>Chọn khối/lớp cần tạo đợt thu</p>
                    </div>
                </div>
                <FiChevronRight className="step-sep" />
                <div className={`step-item ${step >= 3 ? 'active' : ''}`}>
                    <span className="step-dot">3</span>
                    <div>
                        <strong>Xem trước & phát hành</strong>
                        <p>Kiểm tra nhanh trước khi xác nhận</p>
                    </div>
                </div>
            </div>

            <div className="wizard-content">
                {step === 1 && (
                    <div className="wizard-step-1">
                        <h4>Bước 1: Chọn khoản thu</h4>
                        <p className="wizard-step-desc">Có thể chọn nhiều khoản để phát hành cùng lúc trong một đợt thu.</p>
                        <div className="wizard-fee-grid">
                            {feeOptions.map((fee) => (
                                <label key={fee.code} className={`wizard-fee-card ${selectedFees.includes(fee.code) ? "selected" : ""}`}>
                                    <input type="checkbox" checked={selectedFees.includes(fee.code)} onChange={() => toggleFee(fee.code)} />
                                    <div className="wizard-fee-card__content">
                                        <strong>{fee.name}</strong>
                                        <span>{fee.amountLabel}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="wizard-step-2">
                        <h4>Bước 2: Chọn đối tượng áp dụng</h4>
                        <p className="wizard-step-desc">Chọn khối/lớp cần áp dụng. Hệ thống sẽ tự loại các hồ sơ miễn giảm 100%.</p>
                        <div className="wizard-target-grid">
                            {targetOptions.map((g) => (
                                <button
                                    key={g.code}
                                    type="button"
                                    className={`wizard-target-btn ${selectedTargets.includes(g.code) ? 'active' : ''}`}
                                    onClick={() => toggleTarget(g.code)}
                                >
                                    <FiUsers />
                                    <span>{g.name}</span>
                                </button>
                            ))}
                        </div>
                        <div className="wizard-alert-box">
                            <FiAlertCircle />
                            <span>Hệ thống tự động quét hồ sơ miễn giảm để đảm bảo không phát sinh sai công nợ.</span>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="wizard-step-3">
                        <div className="wizard-review-head">
                            <div className="wizard-review-icon"><FiCheckCircle /></div>
                            <div>
                                <h4>Sẵn sàng phát hành đợt thu</h4>
                                <p>Kiểm tra nhanh thông tin trước khi phát hành.</p>
                            </div>
                        </div>

                        <div className="wizard-review-grid">
                            <div className="wizard-review-card">
                                <div className="wizard-review-card__title"><FiLayers /> Khoản thu đã chọn</div>
                                <ul>
                                    {selectedFeeDetails.map((fee) => (
                                        <li key={fee.code}>{fee.name} - {fee.amountLabel}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="wizard-review-card">
                                <div className="wizard-review-card__title"><FiUsers /> Đối tượng áp dụng</div>
                                <div className="wizard-chip-wrap">
                                    {selectedTargets.map((target) => (
                                        <span key={target} className="wizard-chip">{targetOptions.find((item) => item.code === target)?.name || target}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="preview-stats">
                            <div className="p-stat">
                                <span>Tổng số học sinh</span>
                                <strong>{formatMoney(selectedStudentCount)}</strong>
                            </div>
                            <div className="p-stat">
                                <span>Học sinh được giảm phí</span>
                                <strong className="warn">{formatMoney(exemptStudentCount)}</strong>
                            </div>
                            <div className="p-stat">
                                <span>Dự kiến doanh thu</span>
                                <strong className="primary">{formatMoney(estimatedRevenue)} ₫</strong>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="wizard-footer">
                <button className="btn-secondary" onClick={handlePrev} disabled={step === 1}>Quay lại</button>
                {step < 3 ? (
                    <button className="btn-primary" onClick={handleNext}>Tiếp theo <FiChevronRight /></button>
                ) : (
                    <button className="btn-primary wizard-publish-btn" onClick={handlePublish}>Phát hành đợt thu</button>
                )
                        }
            </div>
        </div>
    );
}
