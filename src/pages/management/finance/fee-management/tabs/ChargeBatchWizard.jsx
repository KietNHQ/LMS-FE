import React, { useState, useCallback, useEffect } from "react";
import { FiCheckCircle, FiChevronRight, FiUsers, FiLayers, FiAlertCircle, FiCheck, FiRefreshCw, FiCalendar } from "react-icons/fi";
import { toast } from "react-toastify";
import { financeService } from "../../../../../services/pages/management/finance";
import { studentsService } from "../../../../../services/pages/management/users";
import { resolveSemester } from "../../../../../services/shared/schoolYearLookup";

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

    const [semesterOptions, setSemesterOptions] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [dueDate, setDueDate] = useState("");
    const [loadingSemesters, setLoadingSemesters] = useState(false);

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

    const loadSemesters = useCallback(async () => {
        if (!schoolYear) return;
        const syName = typeof schoolYear === "string" ? schoolYear : schoolYear?.name;
        if (!syName) return;
        setLoadingSemesters(true);
        try {
            const [hk1, hk2] = await Promise.all([
                resolveSemester(syName, "hk1"),
                resolveSemester(syName, "hk2"),
            ]);
            const options = [];
            if (hk1) options.push({ ...hk1, label: `Học kỳ 1 (${hk1.name || "HK1"})` });
            if (hk2) options.push({ ...hk2, label: `Học kỳ 2 (${hk2.name || "HK2"})` });
            setSemesterOptions(options);
        } catch (err) {
            console.error("[ChargeBatchWizard] loadSemesters error:", err);
        } finally {
            setLoadingSemesters(false);
        }
    }, [schoolYear]);

    useEffect(() => {
        loadSemesters();
    }, [loadSemesters]);

    useEffect(() => {
        if (semesterOptions.length > 0 && !selectedSemester) {
            const current = semesterOptions.find(o => o.is_current || o.isCurrent) || semesterOptions[0];
            setSelectedSemester(current);
        }
    }, [semesterOptions]);

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
                if (!s.className) return false;
                const classGrade = String(s.className).match(/^(\d+)/)?.[1];
                return grades.includes(classGrade);
            });
            setSelectedStudents(filtered);
        } catch (err) {
            console.error("[ChargeBatchWizard] loadStudents error:", err);
        } finally {
            setLoadingStudents(false);
        }
    }, [selectedTargets]);

    useEffect(() => {
        loadStudents();
    }, [loadStudents]);

    const handleOpen = () => {
        loadFees();
        if (selectedTargets.length > 0) {
            loadStudents();
        }
    };

    const handleNext = () => {
        if (step === 1 && selectedFees.length === 0) {
            toast.warning("Vui lòng chọn ít nhất 1 khoản thu.");
            return;
        }
        if (step === 2) {
            if (selectedTargets.length === 0) {
                toast.warning("Vui lòng chọn ít nhất 1 đối tượng áp dụng.");
                return;
            }
            if (!selectedSemester) {
                toast.warning("Vui lòng chọn học kỳ phát hành.");
                return;
            }
            if (!dueDate) {
                toast.warning("Vui lòng chọn hạn chót đóng tiền.");
                return;
            }
            const semStart = selectedSemester.start_date || selectedSemester.startDate;
            const semEnd = selectedSemester.end_date || selectedSemester.endDate || selectedSemester.end_date;
            if (semStart) {
                const start = new Date(semStart);
                const end = semEnd ? new Date(semEnd) : new Date(start.getFullYear(), start.getMonth() + 6, 0);
                const chosen = new Date(dueDate);
                if (chosen < start) {
                    toast.error(`Hạn chót phải từ ngày ${start.toLocaleDateString("vi-VN")} (ngày bắt đầu HK).`);
                    return;
                }
                if (chosen > end) {
                    toast.error(`Hạn chót phải trước ngày ${end.toLocaleDateString("vi-VN")} (ngày kết thúc HK).`);
                    return;
                }
            }
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
                    const studentId = Number(student.studentTableId || student.id);
                    if (!studentId || isNaN(studentId)) return null;
                    const amount = fee?.amountValue;
                    if (!amount || amount <= 0) return null;
                    return {
                        studentId,
                        feeId,
                        amount,
                        dueDate: new Date(dueDate).toISOString(),
                        description: `Phát hành hàng loạt - ${fee?.name || ""}`,
                        schoolYearId: schoolYear?.id,
                        semesterId: selectedSemester?.id,
                    };
                })
            ).filter(Boolean);

            if (debtItems.length === 0) {
                toast.error("Không có công nợ nào hợp lệ để phát hành. Vui lòng kiểm tra lại danh sách học sinh và khoản thu.");
                setIsPublishing(false);
                return;
            }

            const res = await financeService.createBatchDebts({
                debts: debtItems,
            });
            if (res?.success) {
                toast.success(`Đã phát hành ${debtItems.length} công nợ thành công!`);
                if (onSuccess) onSuccess();
                setStep(1);
                setSelectedFees([]);
                setSelectedTargets([]);
                setSelectedStudents([]);
                setDueDate("");
                setSelectedSemester(null);
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

    const semStart = selectedSemester ? (selectedSemester.start_date || selectedSemester.startDate) : null;
    const semEnd = selectedSemester ? (selectedSemester.end_date || selectedSemester.endDate) : null;

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

                        {/* Học kỳ phát hành */}
                        <div className="wizard-due-date-row">
                            <div className="wizard-field-group">
                                <label className="wizard-field-label">
                                    <FiCalendar /> Học kỳ phát hành <span className="required">*</span>
                                </label>
                                {loadingSemesters ? (
                                    <span style={{ color: "#64748b", fontSize: "0.85rem" }}>Đang tải học kỳ...</span>
                                ) : (
                                    <select
                                        className="fee-input wizard-semester-select"
                                        value={selectedSemester?.id || ""}
                                        onChange={(e) => {
                                            const found = semesterOptions.find(o => String(o.id) === e.target.value);
                                            setSelectedSemester(found || null);
                                            setDueDate("");
                                        }}
                                    >
                                        <option value="">-- Chọn học kỳ --</option>
                                        {semesterOptions.map((s) => (
                                            <option key={s.id} value={s.id}>{s.label}</option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Hạn chót */}
                            <div className="wizard-field-group">
                                <label className="wizard-field-label">
                                    <FiCalendar /> Hạn chót đóng tiền <span className="required">*</span>
                                </label>
                                <input
                                    type="date"
                                    className="fee-input"
                                    value={dueDate}
                                    min={semStart || ""}
                                    max={semEnd || ""}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    disabled={!selectedSemester}
                                />
                                {selectedSemester && (semStart || semEnd) && (
                                    <span className="wizard-date-hint">
                                        Chỉ chọn ngày trong: {semStart ? new Date(semStart).toLocaleDateString("vi-VN") : "?"}
                                        {" → "}
                                        {semEnd ? new Date(semEnd).toLocaleDateString("vi-VN") : "?"}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Khối */}
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

                        {/* Thông tin hạn chót */}
                        {selectedSemester && dueDate && (
                            <div className="wizard-due-info">
                                <FiCalendar />
                                <span>
                                    Phát hành cho <strong>{selectedSemester.label}</strong> — Hạn chót: <strong>{new Date(dueDate).toLocaleDateString("vi-VN")}</strong>
                                </span>
                            </div>
                        )}
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
