import React, { useState, useCallback } from "react";
import { FiCheckCircle, FiChevronRight, FiUsers, FiLayers, FiAlertCircle, FiCheck, FiRefreshCw } from "react-icons/fi";
import { toast } from "react-toastify";
import { financeService } from "../../../../../services/pages/management/finance";
import { studentsService } from "../../../../../services/pages/management/users";

export default function ChargeBatchWizard({ onSuccess, schoolYear, term }) {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    const [feeOptions, setFeeOptions] = useState([]);
    const [selectedFees, setSelectedFees] = useState([]);
    const [selectedTargets, setSelectedTargets] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [loadingFees, setLoadingFees] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);

    const targetOptions = [
        { code: "K10", name: "Khối 10", grade: "10" },
        { code: "K11", name: "Khối 11", grade: "11" },
        { code: "K12", name: "Khối 12", grade: "12" },
    ];

    const loadFees = useCallback(async () => {
        setLoadingFees(true);
        try {
            const res = await financeService.getFees({ params: { limit: 100 } });
            if (res?.success) {
                const rows = Array.isArray(res.data) ? res.data : (res.data?.items || []);
                setFeeOptions(rows.map((f) => ({
                    id: f.id,
                    code: f.code || f.name,
                    name: f.name,
                    amountValue: parseFloat(f.amount || f.nominal_amount || 0),
                    amountLabel: `${parseFloat(f.amount || 0).toLocaleString("vi-VN")} ₫`,
                    isMandatory: f.is_mandatory || f.mandatory,
                })));
            }
        } catch (err) {
            console.error("[ChargeBatchWizard] loadFees error:", err);
        } finally {
            setLoadingFees(false);
        }
    }, []);

    const loadStudents = useCallback(async () => {
        if (selectedTargets.length === 0) {
            setSelectedStudents([]);
            return;
        }
        setLoadingStudents(true);
        try {
            const grades = selectedTargets.map((t) => {
                const opt = targetOptions.find((o) => o.code === t);
                return opt?.grade;
            }).filter(Boolean);

            const res = await studentsService.listStudents();

            const rows = Array.isArray(res) ? res : [];

            const filtered = rows.filter((s) => {
                const grade = String(s.grade || "").replace("Khối ", "");
                return grades.includes(grade);
            });
            setSelectedStudents(filtered);
        } catch (err) {
            console.error("[ChargeBatchWizard] loadStudents error:", err);
        } finally {
            setLoadingStudents(false);
        }
    }, [selectedTargets]);

    const handleOpen = () => {
        loadFees();
        if (selectedTargets.length > 0) {
            loadStudents();
        }
    };

    React.useEffect(() => {
        loadStudents();
    }, [loadStudents]); // eslint-disable-line

    const handleNext = () => {
        if (step === 1 && selectedFees.length === 0) {
            toast.warning("Vui lòng chọn ít nhất 1 khoản thu.");
            return;
        }
        if (step === 2 && selectedTargets.length === 0) {
            toast.warning("Vui lòng chọn ít nhất 1 đối tượng áp dụng.");
            return;
        }
        if (step === 2) {
            handleOpen();
        }
        setStep((prev) => prev + 1);
    };

    const handlePrev = () => setStep((prev) => prev - 1);

    const toggleFee = (id) => {
        setSelectedFees((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
    };

    const toggleTarget = (code) => {
        setSelectedTargets((prev) => (prev.includes(code) ? prev.filter((item) => item !== code) : [...prev, code]));
    };

    const selectedFeeDetails = feeOptions.filter((fee) => selectedFees.includes(fee.id));
    const selectedTargetDetails = targetOptions.filter((target) => selectedTargets.includes(target.code));

    const studentCount = selectedStudents.length;
    const feeAmountPerStudent = selectedFeeDetails.reduce((total, fee) => total + fee.amountValue, 0);
    const estimatedRevenue = studentCount * feeAmountPerStudent;

    const formatMoney = (value) => new Intl.NumberFormat("vi-VN").format(value);

    const handlePublish = async () => {
        setIsPublishing(true);
        try {
            const debtItems = selectedStudents.flatMap((student) =>
                selectedFees.map((feeId) => {
                    const fee = feeOptions.find((f) => f.id === feeId);
                    return {
                        studentId: student.id,
                        feeId,
                        amount: fee?.amountValue || 0,
                        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                        description: `Phát hành hàng loạt - ${fee?.name || ""}`,
                    };
                })
            );

            const res = await financeService.createBatchDebts({
                body: {
                    schoolYearId: schoolYear?.id,
                    semesterId: term?.id,
                    debts: debtItems,
                },
            });
            if (res?.success) {
                toast.success(`Đã phát hành ${debtItems.length} công nợ thành công!`);
                if (onSuccess) onSuccess();
                setStep(1);
                setSelectedFees([]);
                setSelectedTargets([]);
                setSelectedStudents([]);
            } else {
                toast.error(res?.error?.message || "Có lỗi xảy ra khi phát hành.");
            }
        } catch (err) {
            console.error("[ChargeBatchWizard] publish error:", err);
            toast.error("Có lỗi xảy ra khi phát hành đợt thu.");
        } finally {
            setIsPublishing(false);
        }
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
                <div className={`step-item ${step >= 1 ? "active" : ""}`}>
                    <span className="step-dot">1</span>
                    <div>
                        <strong>Chọn khoản thu</strong>
                        <p>Đánh dấu các khoản cần phát hành</p>
                    </div>
                </div>
                <FiChevronRight className="step-sep" />
                <div className={`step-item ${step >= 2 ? "active" : ""}`}>
                    <span className="step-dot">{step > 2 ? <FiCheck /> : "2"}</span>
                    <div>
                        <strong>Đối tượng áp dụng</strong>
                        <p>Chọn khối/lớp cần tạo đợt thu</p>
                    </div>
                </div>
                <FiChevronRight className="step-sep" />
                <div className={`step-item ${step >= 3 ? "active" : ""}`}>
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
                        {loadingFees ? (
                            <p style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>Đang tải khoản thu...</p>
                        ) : feeOptions.length === 0 ? (
                            <p style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>Không có khoản thu nào. <button className="btn-link" onClick={loadFees}><FiRefreshCw /> Tải lại</button></p>
                        ) : (
                            <div className="wizard-fee-grid">
                                {feeOptions.map((fee) => (
                                    <label key={fee.id} className={`wizard-fee-card ${selectedFees.includes(fee.id) ? "selected" : ""}`}>
                                        <input type="checkbox" checked={selectedFees.includes(fee.id)} onChange={() => toggleFee(fee.id)} />
                                        <div className="wizard-fee-card__content">
                                            <strong>{fee.name}</strong>
                                            <span>{fee.amountLabel}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
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
                                    className={`wizard-target-btn ${selectedTargets.includes(g.code) ? "active" : ""}`}
                                    onClick={() => toggleTarget(g.code)}
                                >
                                    <FiUsers />
                                    <span>{g.name}</span>
                                </button>
                            ))}
                        </div>
                        <div className="wizard-alert-box">
                            <FiAlertCircle />
                            <span>
                                {selectedTargets.length > 0
                                    ? loadingStudents
                                        ? "Đang tải danh sách học sinh..."
                                        : `Đã chọn ${selectedStudents.length} học sinh từ ${selectedTargets.length} khối.`
                                    : "Chọn ít nhất 1 khối để xem số học sinh."}
                            </span>
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
                                        <li key={fee.id}>{fee.name} - {fee.amountLabel}</li>
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
                                <strong>{formatMoney(studentCount)}</strong>
                            </div>
                            <div className="p-stat">
                                <span>Tổng số công nợ tạo</span>
                                <strong className="primary">{formatMoney(studentCount * selectedFees.length)}</strong>
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
                    <button className="btn-primary wizard-publish-btn" onClick={handlePublish} disabled={isPublishing}>
                        {isPublishing ? "Đang phát hành..." : "Phát hành đợt thu"}
                    </button>
                )}
            </div>
        </div>
    );
}
