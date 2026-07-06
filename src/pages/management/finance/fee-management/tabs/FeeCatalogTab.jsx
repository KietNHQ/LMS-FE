import React, { useState, useEffect, useCallback } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiInfo, FiX, FiCheck, FiAlertTriangle, FiUpload, FiRefreshCw } from "react-icons/fi";
import { toast } from "react-toastify";
import Select from "../../../../../components/ui/Select/Select";
import { Tooltip } from "../../../../../components/ui";
import { useSchoolYearTerm } from "../../../../../hooks/useSchoolYearTerm";
import financeService from "../../../../../services/pages/management/finance/financeService";

const CATEGORY_OPTIONS = [
    { value: "Tuition", label: "Học phí" },
    { value: "Service", label: "Dịch vụ" },
    { value: "Others", label: "Thu hộ / Khác" },
];

const NATURE_OPTIONS = [
    { value: "School Revenue", label: "Doanh thu sự nghiệp" },
    { value: "Service Revenue", label: "Doanh thu dịch vụ" },
    { value: "Collect on behalf", label: "Thu hộ chi hộ" },
];

const NATURE_TOOLTIPS = {
    "School Revenue": "Doanh thu từ các hoạt động giáo dục chính quy, bắt buộc theo quy định của Nhà nước.",
    "Service Revenue": "Doanh thu từ các dịch vụ tự nguyện, hỗ trợ hoạt động học tập (Bán trú, Xe đưa đón, v.v.).",
    "Collect on behalf": "Các khoản thu hộ cho bên thứ ba (Bảo hiểm, Đồng phục...) và hoàn trả tương đương, không tính vào doanh thu của nhà trường theo TT24."
};

const BANK_OPTIONS = [
    { value: "VCB", label: "Vietcombank" },
    { value: "BIDV", label: "BIDV" },
    { value: "CTG", label: "VietinBank" },
    { value: "TCB", label: "Techcombank" },
    { value: "MB", label: "MBBank" },
    { value: "ACB", label: "ACB" },
];

const EMPTY_FORM = {
    code: "",
    name: "",
    category: "Tuition",
    amount: "",
    nature: "School Revenue",
    mandatory: true,
    qrBank: "Vietcombank",
    qrAccount: "",
    qrHolder: "",
    qrTemplate: "",
    qrImage: "",
};

export default function FeeCatalogTab() {
    const { selectedSchoolYear, selectedTerm } = useSchoolYearTerm();
    const [catalog, setCatalog] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const loadCatalog = useCallback(async () => {
        setLoading(true);
        try {
            const res = await financeService.getFees({ params: {} });
            const rows = Array.isArray(res?.data) ? res.data
                : Array.isArray(res?.items) ? res.items
                : Array.isArray(res) ? res : [];
            setCatalog(rows);
        } catch (err) {
            console.error("[FeeCatalogTab] loadCatalog error:", err);
            toast.error("Không thể tải danh sách khoản thu");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadCatalog(); }, [loadCatalog]);

    const openAddModal = () => {
        setEditingItem(null);
        setForm(EMPTY_FORM);
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setForm({
            code: item.code || "",
            name: item.name || "",
            category: item.category || "Tuition",
            amount: (item.amount || "").toString(),
            nature: item.nature || "School Revenue",
            mandatory: item.is_mandatory ?? item.mandatory ?? true,
            qrBank: item.qr_bank || item.qrBank || "Vietcombank",
            qrAccount: item.qr_account || item.qrAccount || "",
            qrHolder: item.qr_holder || item.qrHolder || "",
            qrTemplate: item.qr_template || item.qrTemplate || "",
            qrImage: item.qr_image || item.qrImage || "",
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingItem(null);
        setForm(EMPTY_FORM);
    };

    const handleFormChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!form.code.trim()) {
            toast.error("Vui lòng nhập mã khoản thu.");
            return;
        }
        if (!form.name.trim()) {
            toast.error("Vui lòng nhập tên khoản thu.");
            return;
        }
        const amount = parseInt(form.amount.toString().replace(/\D/g, ""));
        if (!amount || amount <= 0) {
            toast.error("Vui lòng nhập định mức hợp lệ.");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                code: form.code.trim().toUpperCase(),
                name: form.name.trim(),
                category: form.category,
                amount,
                nature: form.nature,
                isMandatory: form.mandatory,
                qrBank: form.qrBank || null,
                qrAccount: form.qrAccount.trim() || null,
                qrHolder: form.qrHolder.trim().toUpperCase() || null,
                qrTemplate: form.qrTemplate.trim() || null,
                qrImage: form.qrImage || null,
                dueDate: new Date().toISOString().split("T")[0],
            };

            if (editingItem) {
                await financeService.updateFee(editingItem.id, { body: payload });
                toast.success(`Đã cập nhật khoản thu "${form.name.trim()}".`);
            } else {
                await financeService.createFee({ body: payload });
                toast.success(`Đã thêm khoản thu "${form.name.trim()}" thành công.`);
            }
            closeModal();
            await loadCatalog();
        } catch (err) {
            console.error("[FeeCatalogTab] handleSubmit error:", err);
            const msg = err?.response?.data?.error?.message || err?.message || "Đã xảy ra lỗi";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        const item = catalog.find(c => c.id === id);
        try {
            await financeService.deleteFee(id);
            setCatalog(prev => prev.filter(c => c.id !== id));
            setDeleteConfirm(null);
            toast.success(`Đã xóa khoản thu "${item?.name}".`);
        } catch (err) {
            console.error("[FeeCatalogTab] handleDelete error:", err);
            const msg = err?.response?.data?.error?.message || err?.message || "Đã xảy ra lỗi";
            toast.error(msg);
        }
    };

    const formatMoney = (val) => new Intl.NumberFormat("vi-VN").format(val);

    const handleAmountInput = (e) => {
        const raw = e.target.value.replace(/\D/g, "");
        handleFormChange("amount", raw);
    };

    const handleQrImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Vui lòng tải lên tệp hình ảnh!");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            handleFormChange("qrImage", reader.result);
            toast.success("Tải ảnh QR thành công!");
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="fee-panel">
            <div className="fee-header">
                <div className="fee-header-text">
                    <h3>Danh mục & Biểu phí</h3>
                    <p className="fm-modal-subtitle">
                        Định nghĩa các khoản thu và mức giá áp dụng cho năm học hiện tại.
                    </p>
                </div>
                <button className="btn-primary" onClick={openAddModal}>
                    <FiPlus /> Thêm khoản thu mới
                </button>
                <button className="btn-secondary" onClick={loadCatalog} disabled={loading} title="Làm mới">
                    <FiRefreshCw className={loading ? "spin" : ""} />
                </button>
            </div>

            <div className="fee-table-wrap">
                <table className="fee-table">
                    <thead>
                        <tr>
                            <th>Mã/Tên khoản thu</th>
                            <th>Phân loại</th>
                            <th>
                                <span>Tính chất (TT24)</span>
                            </th>
                            <th>Định mức (VNĐ)</th>
                            <th>Bắt buộc</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && catalog.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="empty-state-cell">Đang tải...</td>
                            </tr>
                        ) : catalog.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="empty-state-cell">
                                    Chưa có khoản thu nào. Nhấn "Thêm khoản thu mới" để bắt đầu.
                                </td>
                            </tr>
                        ) : (
                            catalog.map(item => {
                                const amt = typeof item.amount === "string" ? parseFloat(item.amount) : (item.amount || 0);
                                return (
                            <tr key={item.id}>
                                <td>
                                    <div className="catalog-cell-code">
                                        <span className="catalog-code-label">{item.code || "—"}</span>
                                        <strong>{item.name}</strong>
                                    </div>
                                </td>
                                <td>
                                    <span className="fee-tag">{CATEGORY_OPTIONS.find(c => c.value === item.category)?.label || item.category || "—"}</span>
                                </td>
                                <td>
                                    <Tooltip text={NATURE_TOOLTIPS[item.nature] || ""}>
                                        <span className="catalog-nature-text" style={{ cursor: "help" }}>
                                            {NATURE_OPTIONS.find(n => n.value === item.nature)?.label || item.nature || "—"}
                                        </span>
                                    </Tooltip>
                                </td>
                                <td className="td-money">
                                    {amt.toLocaleString("vi-VN")} ₫
                                    {item.category === "Service" && <span className="catalog-unit-label">/ngày</span>}
                                </td>
                                <td>
                                    <span className={`status-badge ${item.is_mandatory ?? item.mandatory ? "paid" : "unpaid"}`}>
                                        {item.is_mandatory ?? item.mandatory ? "Bắt buộc" : "Tự nguyện"}
                                    </span>
                                </td>
                                <td>
                                    <div className="catalog-actions">
                                        <button className="btn-icon" title="Chỉnh sửa" onClick={() => openEditModal(item)}>
                                            <FiEdit2 />
                                        </button>
                                        <button className="btn-icon danger" title="Xóa" onClick={() => setDeleteConfirm(item.id)}>
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Modal Thêm/Sửa khoản thu ── */}
            {showModal && (
                <div className="fee-modal-overlay" onClick={closeModal}>
                    <div className="fee-modal fee-modal-quick-pay" onClick={(e) => e.stopPropagation()}>
                        <div className="fee-modal-header">
                            <div>
                                <h3>{editingItem ? "Chỉnh sửa khoản thu" : "Thêm khoản thu mới"}</h3>
                                <p className="fm-modal-subtitle">
                                    {editingItem ? `Đang sửa: ${editingItem.name}` : "Tạo một khoản thu áp dụng cho năm học"}
                                </p>
                            </div>
                            <button className="btn-close-modal" onClick={closeModal}>
                                <FiX />
                            </button>
                        </div>

                        <div className="fee-modal-body">
                            {/* Mã + Tên khoản thu (2 cột) */}
                            <div className="fm-form-row-2col">
                                <div className="fm-form-group">
                                    <label>Mã khoản thu <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        className="fee-input full-width"
                                        placeholder="VD: HP_CHINH"
                                        value={form.code}
                                        onChange={(e) => handleFormChange("code", e.target.value.toUpperCase())}
                                        maxLength={20}
                                    />
                                </div>
                                <div className="fm-form-group">
                                    <label>Tên khoản thu <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        className="fee-input full-width"
                                        placeholder="VD: Học phí chính quy"
                                        value={form.name}
                                        onChange={(e) => handleFormChange("name", e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Phân loại + Tính chất (2 cột) */}
                            <div className="fm-form-row-2col">
                                <Select
                                    label="Phân loại"
                                    variant="custom"
                                    options={CATEGORY_OPTIONS}
                                    value={form.category}
                                    onChange={(e) => handleFormChange("category", e.target.value)}
                                    placeholder="Chọn phân loại"
                                />
                                <Select
                                    label={
                                        <Tooltip text="Theo Thông tư 24/2024/TT-BTC, các khoản 'Thu hộ chi hộ' cần được hạch toán vào các tài khoản riêng biệt để phục vụ báo cáo đối soát với bên thứ ba (Bảo hiểm, Nhà cung cấp đồng phục). Tránh gộp chung vào Doanh thu sự nghiệp của nhà trường.">
                                            <span style={{ cursor: "help", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                                Tính chất (TT24) <FiInfo size={14} />
                                            </span>
                                        </Tooltip>
                                    }
                                    variant="custom"
                                    options={NATURE_OPTIONS}
                                    value={form.nature}
                                    onChange={(e) => handleFormChange("nature", e.target.value)}
                                    placeholder="Chọn tính chất"
                                />
                            </div>

                            {/* Định mức */}
                            <div className="fm-form-group">
                                <label>Định mức (VNĐ) <span className="required">*</span></label>
                                <div className="fm-input-with-label">
                                    <input
                                        type="text"
                                        className="fee-input full-width large-text"
                                        placeholder="0"
                                        value={form.amount ? formatMoney(parseInt(form.amount) || 0) : ""}
                                        onChange={handleAmountInput}
                                    />
                                    <span className="input-suffix">VNĐ</span>
                                </div>
                                {form.category === "Service" && (
                                    <small className="fm-form-hint">Mức phí tính theo ngày</small>
                                )}
                            </div>

                            {/* Bắt buộc */}
                            <label className="fm-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={form.mandatory}
                                    onChange={(e) => handleFormChange("mandatory", e.target.checked)}
                                />
                                Bắt buộc (học sinh phải đóng)
                            </label>

                            {/* ── Cấu hình QR Thanh Toán ── */}
                            <div className="fm-section-divider">
                                <span>Cấu hình VietQR (Tùy chọn)</span>
                            </div>

                            <div className="fm-form-grid-2">
                                <div className="fm-form-group">
                                    <label>Ngân hàng</label>
                                    <input
                                        type="text"
                                        className="fee-input full-width"
                                        placeholder="VD: Vietcombank, MB, Techcombank..."
                                        value={form.qrBank}
                                        onChange={(e) => handleFormChange("qrBank", e.target.value)}
                                    />
                                </div>

                                <div className="fm-form-group">
                                    <label>Số tài khoản</label>
                                    <input
                                        type="text"
                                        className="fee-input full-width"
                                        placeholder="VD: 1234567890"
                                        value={form.qrAccount}
                                        onChange={(e) => handleFormChange("qrAccount", e.target.value.replace(/\D/g, ""))}
                                        maxLength={20}
                                    />
                                </div>
                            </div>

                            <div className="fm-form-grid-2">
                                <div className="fm-form-group">
                                    <label>Chủ tài khoản</label>
                                    <input
                                        type="text"
                                        className="fee-input full-width"
                                        placeholder="VD: TRUONG THPT ABC"
                                        value={form.qrHolder}
                                        onChange={(e) => handleFormChange("qrHolder", e.target.value.toUpperCase())}
                                    />
                                </div>

                                <div className="fm-form-group fm-form-group-tooltip">
                                    <label>Nội dung chuyển khoản (mẫu)</label>
                                    <input
                                        type="text"
                                        className="fee-input full-width"
                                        placeholder="VD: [MaHS] [TenKhoan]"
                                        value={form.qrTemplate}
                                        onChange={(e) => handleFormChange("qrTemplate", e.target.value)}
                                    />
                                    <small className="fm-form-hint">Dùng [MaHS] để tự động thay thế bằng mã học sinh khi quét</small>
                                </div>
                            </div>

                            {/* Tải ảnh QR lên */}
                            <div className="fm-form-group fm-qr-upload-group">
                                <label>Hoặc tải lên ảnh mã QR tĩnh (Tùy chọn)</label>
                                <div className="fm-qr-upload-zone">
                                    {form.qrImage ? (
                                        <div className="fm-qr-uploaded-preview">
                                            <img src={form.qrImage} alt="Uploaded QR" />
                                            <div className="fm-qr-uploaded-info">
                                                <strong>Đã tải ảnh QR lên</strong>
                                                <span>Ảnh QR tĩnh của trường</span>
                                                <button type="button" className="btn-remove-qr" onClick={() => handleFormChange("qrImage", "")}>Xóa ảnh</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label className="fm-qr-upload-label">
                                            <FiUpload className="fm-upload-icon" />
                                            <div className="fm-upload-text-wrap">
                                                <strong>Chọn tệp ảnh QR</strong>
                                                <span>Hỗ trợ PNG, JPG, JPEG</span>
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleQrImageUpload}
                                                style={{ display: "none" }}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {(form.qrAccount || form.qrImage) && (
                                <div className="fm-qr-preview-banner">
                                    <img
                                        className="fm-qr-banner-img"
                                        src={form.qrImage || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                                            `${form.qrBank || ""} | STK: ${form.qrAccount} | ${form.qrHolder} | ${form.qrTemplate || form.name}`
                                        )}`}
                                        alt="QR Preview"
                                    />
                                    <div className="fm-qr-banner-info">
                                        <strong>Mã VietQR đã sẵn sàng</strong>
                                        <span>{form.qrImage ? "Sử dụng ảnh QR tĩnh đã tải lên" : `${form.qrBank} - ${form.qrAccount}`}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="fee-modal-footer">
                            <button className="btn-secondary" onClick={closeModal}>Hủy bỏ</button>
                            <button className="btn-primary" onClick={handleSubmit}>
                                <FiCheck /> {editingItem ? "Lưu thay đổi" : "Thêm khoản thu"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Confirm Xóa ── */}
            {deleteConfirm && (
                <div className="fee-modal-overlay" onClick={() => setDeleteConfirm(null)}>
                    <div className="fee-modal catalog-delete-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="fee-modal-header catalog-delete-header">
                            <div className="catalog-delete-title">
                                <div className="catalog-delete-icon">
                                    <FiAlertTriangle />
                                </div>
                                <div>
                                    <h3>Xác nhận xóa</h3>
                                    <p className="fm-modal-subtitle">
                                        Bạn có chắc muốn xóa khoản thu "<strong>{catalog.find(c => c.id === deleteConfirm)?.name}</strong>"?
                                        Hành động này không thể hoàn tác.
                                    </p>
                                </div>
                            </div>
                            <button className="btn-close-modal" onClick={() => setDeleteConfirm(null)}>
                                <FiX />
                            </button>
                        </div>
                        <div className="fee-modal-footer">
                            <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Giữ lại</button>
                            <button className="btn-primary catalog-btn-danger" onClick={() => handleDelete(deleteConfirm)}>
                                <FiTrash2 /> Xóa khoản thu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
