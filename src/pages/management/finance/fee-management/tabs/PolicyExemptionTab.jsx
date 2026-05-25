import React, { useState, useMemo, useEffect, useCallback } from "react";
import { FiUserPlus, FiCheckCircle, FiXCircle, FiFileText, FiSearch, FiX, FiRefreshCw, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import Select from "../../../../../components/ui/Select/Select";
import { financeService } from "../../../../../services/pages/management/finance";
import { studentsService } from "../../../../../services/pages/management/users";
import { useSchoolYearTerm } from "../../../../../hooks/useSchoolYearTerm";

const STATUS_OPTIONS = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "pending", label: "Đang chờ duyệt" },
    { value: "approved", label: "Đã phê duyệt" },
    { value: "rejected", label: "Từ chối" },
];

const POLICY_TYPE_OPTIONS = [
    { value: "full", label: "Miễn học phí (100%)" },
    { value: "partial_70", label: "Giảm học phí (70%)" },
    { value: "partial_50", label: "Giảm học phí (50%)" },
    { value: "support", label: "Hỗ trợ chính sách xã hội" },
];

const TYPE_DISPLAY = {
    full: "Miễn 100%",
    partial_70: "Giảm 70%",
    partial_50: "Giảm 50%",
    support: "Hỗ trợ",
};

export default function PolicyExemptionTab() {
    const { selectedSchoolYear, selectedTerm } = useSchoolYearTerm();
    const [policies, setPolicies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [showAddModal, setShowAddModal] = useState(false);
    const [viewingPolicy, setViewingPolicy] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [studentOptions, setStudentOptions] = useState([]);
    const [feeOptions, setFeeOptions] = useState([]);

    const [form, setForm] = useState({
        studentId: "",
        feeId: "",
        exemptionType: "",
        exemptionPercent: "",
        exemptionAmount: "",
        reason: "",
        notes: "",
        status: "pending",
    });

    const fetchPolicies = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await financeService.getFeeExemptions({
                params: {
                    limit: 200,
                    status: filterStatus !== "all" ? filterStatus : undefined,
                    schoolYearId: selectedSchoolYear?.id,
                    semesterId: selectedTerm?.id,
                },
            });

            if (res?.success) {
                const rows = Array.isArray(res.data) ? res.data : (res.data?.items || []);
                setPolicies(rows.map((p) => ({
                    id: p.id,
                    studentId: p.student_id,
                    studentCode: p.student_code || `HS${p.student_id}`,
                    studentName: p.student_name || "-",
                    class: p.class_name || "-",
                    feeId: p.fee_id,
                    feeName: p.fee_name || "Tất cả khoản thu",
                    type: p.exemption_type,
                    exemptionPercent: p.exemption_percent,
                    exemptionAmount: p.exemption_amount,
                    reason: p.reason || "",
                    decisionNo: p.decision_no || "-",
                    status: p.status,
                    createdAt: p.created_at,
                    approvedAt: p.approved_at,
                    notes: p.notes,
                    schoolYear: p.school_year_name,
                })));
            }
        } catch (error) {
            console.error("Error fetching policies:", error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedSchoolYear?.id, selectedTerm?.id, filterStatus]);

    // Fetch from API
    useEffect(() => {
        fetchPolicies();
    }, [fetchPolicies, filterStatus]);

    // Load student options for form
    useEffect(() => {
        const loadFormData = async () => {
            try {
                const [stuRes, feeRes] = await Promise.all([
                    studentsService.listStudents(),
                    financeService.getFees({ params: { limit: 100 } }),
                ]);

                const stuRows = Array.isArray(stuRes) ? stuRes : (stuRes?.data || stuRes?.items || []);
                setStudentOptions(stuRows.map((s) => ({
                    value: s.id,
                    label: `${s.student_code || s.id} - ${s.name || s.full_name || ""}`,
                })));

                if (feeRes?.success) {
                    const rows = Array.isArray(feeRes.data) ? feeRes.data : (feeRes.data?.items || []);
                    setFeeOptions(rows.map((f) => ({
                        value: f.id,
                        label: `${f.name} (${parseFloat(f.amount || 0).toLocaleString("vi-VN")} ₫)`,
                    })));
                }
            } catch (e) {
                console.error("[PolicyExemptionTab] loadFormData error:", e);
            }
        };
        if (showAddModal) loadFormData();
    }, [showAddModal]);

    const filteredPolicies = useMemo(() => {
        return policies.filter((p) => {
            const matchesStatus = filterStatus === "all" || p.status === filterStatus;
            const matchesSearch =
                !searchQuery ||
                (p.studentName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.studentCode || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.decisionNo || "").toLowerCase().includes(searchQuery.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [policies, filterStatus, searchQuery]);

    const handleApprove = async (id) => {
        try {
            await financeService.approveFeeExemption(id);
            setPolicies((prev) => prev.map((p) => (p.id === id ? { ...p, status: "approved" } : p)));
            toast.success("Đã phê duyệt hồ sơ miễn giảm thành công.");
        } catch (error) {
            toast.error("Có lỗi xảy ra khi phê duyệt.");
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm("Bạn có chắc muốn từ chối hồ sơ này?")) return;
        try {
            await financeService.rejectFeeExemption(id);
            setPolicies((prev) => prev.map((p) => (p.id === id ? { ...p, status: "rejected" } : p)));
            toast.success("Đã từ chối hồ sơ miễn giảm.");
        } catch (error) {
            toast.error("Có lỗi xảy ra khi từ chối.");
        }
    };

    const handleDelete = async (id) => {
        try {
            await financeService.deleteFeeExemption(id);
            setPolicies((prev) => prev.filter((p) => p.id !== id));
            setDeleteConfirm(null);
            toast.success("Đã xóa hồ sơ miễn giảm.");
        } catch (error) {
            toast.error("Có lỗi xảy ra khi xóa hồ sơ.");
        }
    };

    const openAddModal = () => {
        setForm({
            studentId: "",
            feeId: "",
            exemptionType: "",
            exemptionPercent: "",
            exemptionAmount: "",
            reason: "",
            notes: "",
            status: "pending",
        });
        setShowAddModal(true);
    };

    const handleFieldChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.studentId) {
            toast.error("Vui lòng chọn học sinh áp dụng.");
            return;
        }
        if (!form.exemptionType) {
            toast.error("Vui lòng chọn loại chính sách.");
            return;
        }
        if (!form.reason) {
            toast.error("Vui lòng nhập lý do / căn cứ.");
            return;
        }

        try {
            const body = {
                studentId: parseInt(form.studentId, 10),
                feeId: form.feeId ? parseInt(form.feeId, 10) : null,
                exemptionType: form.exemptionType,
                exemptionPercent: form.exemptionPercent ? parseFloat(form.exemptionPercent) : null,
                exemptionAmount: form.exemptionAmount ? parseFloat(form.exemptionAmount) : null,
                reason: form.reason,
                notes: form.notes || null,
                status: form.status,
            };

            const res = await financeService.createFeeExemption({ body });
            if (res?.success) {
                toast.success("Thêm hồ sơ miễn giảm mới thành công.");
                setShowAddModal(false);
                setForm({
                    studentId: "",
                    feeId: "",
                    exemptionType: "",
                    exemptionPercent: "",
                    exemptionAmount: "",
                    reason: "",
                    notes: "",
                    status: "pending",
                });
                fetchPolicies();
            } else {
                toast.error(res?.error?.message || "Có lỗi xảy ra.");
            }
        } catch (error) {
            toast.error("Có lỗi xảy ra khi lưu hồ sơ.");
        }
    };

    return (
        <div className="fee-panel">
            <div className="fee-header">
                <div className="fee-header-text">
                    <h3>Quản lý Miễn giảm & Chính sách Xã hội</h3>
                    <p style={{fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem'}}>
                        Theo dõi hồ sơ và phê duyệt các diện miễn học phí theo Nghị định 238/2025.
                    </p>
                </div>
                <button className="btn-primary" onClick={openAddModal}>
                    <FiUserPlus /> Thêm hồ sơ mới
                </button>
            </div>

            <div className="fee-toolbar" style={{border: '1px solid #e2e8f0', background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem'}}>
                <div style={{display: 'flex', gap: '1rem', width: '100%', alignItems: 'center'}}>
                    <div style={{position: 'relative', flex: 1}}>
                        <FiSearch style={{position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '0.85rem', color: '#94a3b8', fontSize: '0.95rem'}} />
                        <input 
                            type="text" 
                            className="fee-input" 
                            placeholder="Tìm tên HS hoặc số quyết định..." 
                            style={{paddingLeft: '2.5rem', width: '100%', height: '44px'}}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select
                        variant="custom"
                        options={STATUS_OPTIONS}
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="fee-select-custom"
                    />
                </div>
            </div>

            <div className="fee-table-wrap">
                <table className="fee-table">
                    <thead>
                        <tr>
                            <th>Học sinh</th>
                            <th>Loại chính sách</th>
                            <th>Lý do / Căn cứ</th>
                            <th>Số quyết định</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                                    Đang tải...
                                </td>
                            </tr>
                        ) : filteredPolicies.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: "center", padding: "3rem 1rem", color: "#64748b" }}>
                                    Không tìm thấy hồ sơ nào khớp với bộ lọc. <button className="btn-link" onClick={fetchPolicies}><FiRefreshCw /> Tải lại</button>
                                </td>
                            </tr>
                        ) : (
                            filteredPolicies.map((p) => (
                                <tr key={p.id}>
                                    <td>
                                        <div style={{ display: "flex", flexDirection: "column" }}>
                                            <strong>{p.studentName}</strong>
                                            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{p.studentId}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 600, color: "#0369a1" }}>
                                            {TYPE_DISPLAY[p.type] || p.type || "-"}
                                        </span>
                                        {p.feeName && p.feeName !== "Tất cả khoản thu" && (
                                            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{p.feeName}</div>
                                        )}
                                    </td>
                                    <td>
                                        <span style={{ fontSize: "0.85rem", color: "#475569" }}>{p.reason || "-"}</span>
                                    </td>
                                    <td>
                                        <code style={{ background: "#f1f5f9", padding: "0.2rem 0.4rem", borderRadius: "0.25rem", fontSize: "0.8rem" }}>{p.decisionNo}</code>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${p.status}`}>
                                            {p.status === "approved" ? "Đã phê duyệt" : p.status === "rejected" ? "Từ chối" : "Đang chờ"}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="catalog-actions">
                                            {p.status === "pending" ? (
                                                <>
                                                    <button
                                                        className="btn-icon success"
                                                        title="Duyệt"
                                                        onClick={() => handleApprove(p.id)}
                                                    >
                                                        <FiCheckCircle />
                                                    </button>
                                                    <button
                                                        className="btn-icon danger"
                                                        title="Từ chối"
                                                        onClick={() => handleReject(p.id)}
                                                    >
                                                        <FiXCircle />
                                                    </button>
                                                    <button
                                                        className="btn-icon"
                                                        title="Xóa"
                                                        onClick={() => {
                                                            if (window.confirm(`Xóa hồ sơ miễn giảm của "${p.studentName}"?`)) {
                                                                handleDelete(p.id);
                                                            }
                                                        }}
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    className="btn-icon"
                                                    title="Xem hồ sơ gốc"
                                                    onClick={() => setViewingPolicy(p)}
                                                >
                                                    <FiFileText />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Modal Thêm hồ sơ mới ── */}
            {showAddModal && (
                <div className="fee-modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="fee-modal fee-modal-quick-pay" onClick={(e) => e.stopPropagation()}>
                        <div className="fee-modal-header">
                            <div>
                                <h3>Thêm hồ sơ mới</h3>
                                <p className="fm-modal-subtitle">
                                    Thêm chính sách miễn giảm học phí cho học sinh theo chính sách hiện hành
                                </p>
                            </div>
                            <button className="btn-close-modal" onClick={() => setShowAddModal(false)}>
                                <FiX />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="fee-modal-body">
                                {/* Chọn học sinh */}
                                <Select
                                    label={
                                        <span>
                                            Học sinh áp dụng <span className="required">*</span>
                                        </span>
                                    }
                                    variant="custom"
                                    options={studentOptions}
                                    value={form.studentId}
                                    onChange={(e) => handleFieldChange("studentId", e.target.value)}
                                    placeholder="Chọn học sinh áp dụng"
                                />

                                {/* Khoản thu (tùy chọn) */}
                                <Select
                                    label={<span>Khoản thu (bỏ trống = tất cả)</span>}
                                    variant="custom"
                                    options={[{ value: "", label: "Tất cả khoản thu" }, ...feeOptions]}
                                    value={form.feeId}
                                    onChange={(e) => handleFieldChange("feeId", e.target.value)}
                                    placeholder="Chọn khoản thu (tùy chọn)"
                                />

                                {/* Loại chính sách */}
                                <Select
                                    label={
                                        <span>
                                            Loại chính sách <span className="required">*</span>
                                        </span>
                                    }
                                    variant="custom"
                                    options={POLICY_TYPE_OPTIONS}
                                    value={form.exemptionType}
                                    onChange={(e) => handleFieldChange("exemptionType", e.target.value)}
                                    placeholder="Chọn loại chính sách miễn giảm"
                                />

                                {/* Số % hoặc số tiền miễn giảm */}
                                <div className="fm-form-row-2col">
                                    <div className="fm-form-group">
                                        <label>% Miễn giảm</label>
                                        <input
                                            type="number"
                                            className="fee-input full-width"
                                            placeholder="VD: 50"
                                            min="0"
                                            max="100"
                                            value={form.exemptionPercent}
                                            onChange={(e) => handleFieldChange("exemptionPercent", e.target.value)}
                                        />
                                    </div>
                                    <div className="fm-form-group">
                                        <label>Số tiền miễn giảm</label>
                                        <input
                                            type="number"
                                            className="fee-input full-width"
                                            placeholder="VD: 500000"
                                            value={form.exemptionAmount}
                                            onChange={(e) => handleFieldChange("exemptionAmount", e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Lý do / Căn cứ */}
                                <div className="fm-form-group">
                                    <label>
                                        Lý do / Căn cứ <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="fee-input full-width"
                                        placeholder="VD: Con thương binh, hộ nghèo, vùng khó khăn..."
                                        value={form.reason}
                                        onChange={(e) => handleFieldChange("reason", e.target.value)}
                                    />
                                </div>

                                {/* Ghi chú */}
                                <div className="fm-form-group">
                                    <label>Ghi chú</label>
                                    <input
                                        type="text"
                                        className="fee-input full-width"
                                        placeholder="Số quyết định, ghi chú bổ sung..."
                                        value={form.notes}
                                        onChange={(e) => handleFieldChange("notes", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="fee-modal-footer">
                                <button 
                                    type="button" 
                                    className="btn-secondary" 
                                    onClick={() => setShowAddModal(false)}
                                >
                                    Hủy bỏ
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn-primary"
                                >
                                    Lưu hồ sơ
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Modal Xem chi tiết hồ sơ gốc ── */}
            {viewingPolicy && (
                <div className="fee-modal-overlay" onClick={() => setViewingPolicy(null)}>
                    <div className="fee-modal fee-modal-quick-pay" onClick={(e) => e.stopPropagation()}>
                        <div className="fee-modal-header">
                            <div>
                                <h3>Chi tiết hồ sơ gốc</h3>
                                <p className="fm-modal-subtitle">
                                    Hồ sơ miễn giảm học phí của học sinh {viewingPolicy.studentName}
                                </p>
                            </div>
                            <button className="btn-close-modal" onClick={() => setViewingPolicy(null)}>
                                <FiX />
                            </button>
                        </div>

                        <div className="fee-modal-body">
                            {/* Thông tin học sinh */}
                            <div className="fm-quick-head">
                                <div className="fm-quick-student">
                                    <span>HỌC SINH</span>
                                    <strong>{viewingPolicy.studentName}</strong>
                                    <span>Mã số: {viewingPolicy.studentCode}</span>
                                </div>
                                <div className="fm-quick-due">
                                    <span>TRẠNG THÁI</span>
                                    <span className={`status-badge ${viewingPolicy.status}`}>
                                        {viewingPolicy.status === "approved" ? "Đã phê duyệt" : viewingPolicy.status === "rejected" ? "Từ chối" : "Đang chờ"}
                                    </span>
                                </div>
                            </div>

                            {/* Chi tiết chính sách */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", background: "#f8fafc", padding: "1.25rem", borderRadius: "0.85rem", border: "1px solid #e2e8f0" }}>
                                <div className="fm-row" style={{ borderBottom: "1px dashed #e2e8f0", paddingBottom: "0.5rem", marginBottom: "0.5rem" }}>
                                    <span style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: 600 }}>Diện chính sách</span>
                                    <strong style={{ color: "#0369a1", fontSize: "0.95rem" }}>{TYPE_DISPLAY[viewingPolicy.type] || viewingPolicy.type || "-"}</strong>
                                </div>
                                {viewingPolicy.feeName && (
                                    <div className="fm-row" style={{ borderBottom: "1px dashed #e2e8f0", paddingBottom: "0.5rem", marginBottom: "0.5rem" }}>
                                        <span style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: 600 }}>Khoản thu</span>
                                        <strong style={{ color: "#1e293b", fontSize: "0.9rem" }}>{viewingPolicy.feeName}</strong>
                                    </div>
                                )}
                                <div className="fm-row" style={{ borderBottom: "1px dashed #e2e8f0", paddingBottom: "0.5rem", marginBottom: "0.5rem" }}>
                                    <span style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: 600 }}>Lý do / Căn cứ</span>
                                    <strong style={{ color: "#1e293b", fontSize: "0.9rem" }}>{viewingPolicy.reason || "-"}</strong>
                                </div>
                                <div className="fm-row" style={{ borderBottom: "1px dashed #e2e8f0", paddingBottom: "0.5rem", marginBottom: "0.5rem" }}>
                                    <span style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: 600 }}>Số quyết định</span>
                                    <code style={{ background: "#e2e8f0", padding: "0.2rem 0.5rem", borderRadius: "0.25rem", fontSize: "0.85rem", color: "#0f172a", fontWeight: 700 }}>{viewingPolicy.decisionNo}</code>
                                </div>
                                <div className="fm-row" style={{ borderBottom: "1px dashed #e2e8f0", paddingBottom: "0.5rem", marginBottom: "0.5rem" }}>
                                    <span style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: 600 }}>% Miễn giảm</span>
                                    <strong style={{ color: "#1e293b", fontSize: "0.9rem" }}>{viewingPolicy.exemptionPercent ? `${viewingPolicy.exemptionPercent}%` : "-"}</strong>
                                </div>
                                <div className="fm-row" style={{ paddingBottom: "0.25rem" }}>
                                    <span style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: 600 }}>Ngày cập nhật</span>
                                    <strong style={{ color: "#475569", fontSize: "0.9rem" }}>{viewingPolicy.approvedAt ? new Date(viewingPolicy.approvedAt).toLocaleDateString("vi-VN") : "-"}</strong>
                                </div>
                            </div>

                            {/* Minh chứng đính kèm */}
                            <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                                <label style={{fontSize: '0.82rem', fontWeight: 700, color: 'var(--fee-text-primary)'}}>Tài liệu đính kèm (Bản quét minh chứng)</label>
                                <div style={{
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '0.75rem', 
                                    padding: '0.75rem 1rem', 
                                    background: '#eef2ff', 
                                    border: '1.5px dashed #4f46e5', 
                                    borderRadius: '0.75rem',
                                    color: '#4338ca',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}>
                                    <FiFileText size={18} />
                                    <span>Minh_chung_mien_giam_{viewingPolicy.studentCode}.pdf</span>
                                </div>
                            </div>
                        </div>

                        <div className="fee-modal-footer">
                            <button 
                                type="button" 
                                className="btn-primary" 
                                onClick={() => setViewingPolicy(null)}
                            >
                                Đóng lại
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
