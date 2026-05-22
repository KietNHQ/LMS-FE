import React, { useState, useMemo, useEffect } from "react";
import { FiUserPlus, FiCheckCircle, FiXCircle, FiFileText, FiSearch, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import Select from "../../../../../components/ui/Select/Select";

const MOCK_POLICIES = [
    { id: 1, studentId: "HS015", name: "Nguyễn Trung Thực", class: "10A2", type: "Exemption (100%)", reason: "Con thương binh", status: "Approved", decisionNo: "QD-123/2026" },
    { id: 2, studentId: "HS088", name: "Lý Thị Nghèo", class: "11A4", type: "Reduction (50%)", reason: "Hộ cận nghèo", status: "Pending", decisionNo: "-" },
    { id: 3, studentId: "HS102", name: "Trần Văn Khó", class: "12A1", type: "Support", reason: "Vùng đặc biệt khó khăn", status: "Approved", decisionNo: "QD-456/2026" },
];

const MOCK_STUDENTS_LIST = [
    { studentId: "HS001", name: "Nguyễn Văn A", class: "10A1", grade: "10" },
    { studentId: "HS002", name: "Trần Thị B", class: "10A1", grade: "10" },
    { studentId: "HS012", name: "Lê Văn C", class: "10A2", grade: "10" },
    { studentId: "HS024", name: "Phạm Minh D", class: "11A1", grade: "11" },
    { studentId: "HS035", name: "Hoàng Thu E", class: "11A2", grade: "11" },
    { studentId: "HS048", name: "Vũ Văn F", class: "12A3", grade: "12" },
];

const STATUS_OPTIONS = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "Pending", label: "Đang chờ duyệt" },
    { value: "Approved", label: "Đã phê duyệt" }
];

const POLICY_TYPE_OPTIONS = [
    { value: "Exemption (100%)", label: "Miễn học phí (100%)" },
    { value: "Reduction (70%)", label: "Giảm học phí (70%)" },
    { value: "Reduction (50%)", label: "Giảm học phí (50%)" },
    { value: "Support", label: "Hỗ trợ chính sách xã hội" }
];

const INITIAL_STATUS_OPTIONS = [
    { value: "Pending", label: "Đang chờ duyệt" },
    { value: "Approved", label: "Đã phê duyệt" }
];

export default function PolicyExemptionTab() {
    const [policies, setPolicies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [showAddModal, setShowAddModal] = useState(false);
    const [viewingPolicy, setViewingPolicy] = useState(null);

    const [form, setForm] = useState({
        studentId: "",
        name: "",
        class: "",
        grade: "",
        type: "",
        reason: "",
        decisionNo: "",
        status: "pending"
    });

    // Fetch from API
    useEffect(() => {
        fetchPolicies();
    }, [filterStatus]);

    const fetchPolicies = async () => {
        setIsLoading(true);
        try {
            const res = await financeService.listDebts({
                params: {
                    limit: 200,
                    status: filterStatus !== "all" ? filterStatus : undefined,
                },
            });

            if (res?.success && res.data) {
                const policyData = res.data.map(debt => ({
                    id: debt.id,
                    studentId: debt.studentCode || `HS${debt.studentId?.slice(0, 6)}`,
                    name: debt.studentName,
                    class: debt.className,
                    type: debt.type || "Support",
                    reason: debt.description || "Chính sách miễn giảm",
                    status: debt.status === "paid" ? "approved" : debt.status,
                    decisionNo: debt.decisionNo || "-",
                    createdAt: debt.createdAt,
                }));
                setPolicies(policyData);
            }
        } catch (error) {
            console.error("Error fetching policies:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const STUDENT_OPTIONS = useMemo(() => {
        return MOCK_STUDENTS_LIST.map(s => ({
            value: s.studentId,
            label: `${s.studentId} - ${s.name} (Lớp ${s.class})`
        }));
    }, []);

    const filteredPolicies = useMemo(() => {
        return policies.filter(p => {
            const matchesStatus = filterStatus === "all" || p.status === filterStatus;
            const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  p.studentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  p.decisionNo?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [policies, filterStatus, searchQuery]);

    const handleApprove = async (id) => {
        try {
            await financeService.updateDebt(id, { status: "approved" });
            setPolicies(prev => prev.map(p => p.id === id ? { ...p, status: "approved" } : p));
            toast.success("Đã phê duyệt hồ sơ miễn giảm thành công.");
        } catch (error) {
            toast.error("Có lỗi xảy ra khi phê duyệt.");
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm("Bạn có chắc muốn từ chối hồ sơ này?")) return;
        try {
            await financeService.deleteDebt(id);
            setPolicies(prev => prev.filter(p => p.id !== id));
            toast.success("Đã từ chối hồ sơ miễn giảm.");
        } catch (error) {
            toast.error("Có lỗi xảy ra khi từ chối.");
        }
    };

    const openAddModal = () => {
        setForm({
            studentId: "",
            name: "",
            class: "",
            grade: "",
            type: "",
            reason: "",
            decisionNo: "",
            status: "Pending"
        });
        setShowAddModal(true);
    };

    const handleStudentChange = (e) => {
        const studentId = e.target.value;
        const student = MOCK_STUDENTS_LIST.find(s => s.studentId === studentId);
        if (student) {
            setForm(prev => ({
                ...prev,
                studentId,
                name: student.name,
                class: student.class,
                grade: student.grade
            }));
        } else {
            setForm(prev => ({
                ...prev,
                studentId: "",
                name: "",
                class: "",
                grade: ""
            }));
        }
    };

    const handleFieldChange = (field, value) => {
        setForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.studentId) {
            toast.error("Vui lòng chọn học sinh áp dụng.");
            return;
        }
        if (!form.type) {
            toast.error("Vui lòng chọn loại chính sách.");
            return;
        }
        if (!form.reason) {
            toast.error("Vui lòng nhập lý do / căn cứ.");
            return;
        }

        const newPolicy = {
            id: Date.now(),
            ...form,
            decisionNo: form.decisionNo || "-"
        };

        setPolicies(prev => [newPolicy, ...prev]);
        toast.success("Thêm hồ sơ miễn giảm mới thành công.");
        setShowAddModal(false);
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
                        {filteredPolicies.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="empty-state-cell" style={{textAlign: 'center', padding: '3rem 1rem', color: '#64748b'}}>
                                    Không tìm thấy hồ sơ nào khớp với bộ lọc.
                                </td>
                            </tr>
                        ) : (
                            filteredPolicies.map(p => (
                                <tr key={p.id}>
                                    <td>
                                        <div style={{display: 'flex', flexDirection: 'column'}}>
                                            <strong>{p.name}</strong>
                                            <span style={{fontSize: '0.75rem', color: '#64748b'}}>{p.studentId} - {p.class}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{fontWeight: 600, color: '#0369a1'}}>{p.type}</span>
                                    </td>
                                    <td>
                                        <span style={{fontSize: '0.85rem', color: '#475569'}}>{p.reason}</span>
                                    </td>
                                    <td>
                                        <code style={{background: '#f1f5f9', padding: '0.2rem 0.4rem', borderRadius: '0.25rem', fontSize: '0.8rem'}}>{p.decisionNo}</code>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${p.status.toLowerCase()}`}>
                                            {p.status === 'Approved' ? 'Đã phê duyệt' : 'Đang chờ'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="catalog-actions">
                                            {p.status === 'Pending' ? (
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
                                    options={STUDENT_OPTIONS}
                                    value={form.studentId}
                                    onChange={handleStudentChange}
                                    placeholder="Chọn học sinh áp dụng"
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
                                    value={form.type}
                                    onChange={(e) => handleFieldChange("type", e.target.value)}
                                    placeholder="Chọn loại chính sách miễn giảm"
                                />

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

                                {/* Số quyết định + Trạng thái (2 cột) */}
                                <div className="fm-form-row-2col">
                                    <div className="fm-form-group">
                                        <label>Số quyết định (Nếu có)</label>
                                        <input
                                            type="text"
                                            className="fee-input full-width"
                                            placeholder="VD: QD-789/2026"
                                            value={form.decisionNo}
                                            onChange={(e) => handleFieldChange("decisionNo", e.target.value)}
                                        />
                                    </div>
                                    <Select
                                        label="Trạng thái phê duyệt"
                                        variant="custom"
                                        options={INITIAL_STATUS_OPTIONS}
                                        value={form.status}
                                        onChange={(e) => handleFieldChange("status", e.target.value)}
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
                                    Hồ sơ miễn giảm học phí của học sinh {viewingPolicy.name}
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
                                    <strong>{viewingPolicy.name}</strong>
                                    <span>Mã số: {viewingPolicy.studentId} • Lớp {viewingPolicy.class}</span>
                                </div>
                                <div className="fm-quick-due">
                                    <span>TRẠNG THÁI</span>
                                    <span className={`status-badge ${viewingPolicy.status.toLowerCase()}`}>
                                        {viewingPolicy.status === 'Approved' ? 'Đã phê duyệt' : 'Đang chờ'}
                                    </span>
                                </div>
                            </div>

                            {/* Chi tiết chính sách */}
                            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '0.85rem', border: '1px solid #e2e8f0'}}>
                                <div className="fm-row" style={{borderBottom: '1px dashed #e2e8f0', paddingBottom: '0.5rem', marginBottom: '0.5rem'}}>
                                    <span style={{color: '#64748b', fontSize: '0.85rem', fontWeight: 600}}>Diện chính sách</span>
                                    <strong style={{color: '#0369a1', fontSize: '0.95rem'}}>{viewingPolicy.type}</strong>
                                </div>

                                <div className="fm-row" style={{borderBottom: '1px dashed #e2e8f0', paddingBottom: '0.5rem', marginBottom: '0.5rem'}}>
                                    <span style={{color: '#64748b', fontSize: '0.85rem', fontWeight: 600}}>Lý do / Căn cứ</span>
                                    <strong style={{color: '#1e293b', fontSize: '0.9rem'}}>{viewingPolicy.reason}</strong>
                                </div>

                                <div className="fm-row" style={{borderBottom: '1px dashed #e2e8f0', paddingBottom: '0.5rem', marginBottom: '0.5rem'}}>
                                    <span style={{color: '#64748b', fontSize: '0.85rem', fontWeight: 600}}>Số quyết định</span>
                                    <code style={{background: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.85rem', color: '#0f172a', fontWeight: 700}}>{viewingPolicy.decisionNo}</code>
                                </div>

                                <div className="fm-row" style={{paddingBottom: '0.25rem'}}>
                                    <span style={{color: '#64748b', fontSize: '0.85rem', fontWeight: 600}}>Ngày cập nhật</span>
                                    <strong style={{color: '#475569', fontSize: '0.9rem'}}>15/05/2026</strong>
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
                                    <span>Minh_chung_mien_giam_{viewingPolicy.studentId}.pdf</span>
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
