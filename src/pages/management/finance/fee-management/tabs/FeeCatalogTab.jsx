import React, { useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiInfo, FiX, FiCheck, FiAlertTriangle, FiCreditCard } from "react-icons/fi";
import { toast } from "react-toastify";
import Select from "../../../../../components/ui/Select/Select";

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

const BANK_OPTIONS = [
    { value: "VCB", label: "Vietcombank" },
    { value: "BIDV", label: "BIDV" },
    { value: "CTG", label: "VietinBank" },
    { value: "TCB", label: "Techcombank" },
    { value: "MB", label: "MBBank" },
    { value: "ACB", label: "ACB" },
];

const INITIAL_CATALOG = [
    { id: 1, code: "HP_CHINH", name: "Học phí chính quy", category: "Tuition", amount: 1200000, nature: "School Revenue", mandatory: true, qrBank: "VCB", qrAccount: "", qrHolder: "", qrTemplate: "" },
    { id: 2, code: "AN_TRUA", name: "Tiền ăn bán trú", category: "Service", amount: 35000, nature: "Service Revenue", mandatory: false, qrBank: "VCB", qrAccount: "", qrHolder: "", qrTemplate: "" },
    { id: 3, code: "BHYT", name: "Bảo hiểm y tế", category: "Others", amount: 804600, nature: "Collect on behalf", mandatory: true, qrBank: "VCB", qrAccount: "", qrHolder: "", qrTemplate: "" },
    { id: 4, code: "DONG_PHUC", name: "Đồng phục học sinh", category: "Others", amount: 650000, nature: "Collect on behalf", mandatory: false, qrBank: "VCB", qrAccount: "", qrHolder: "", qrTemplate: "" },
];

const EMPTY_FORM = {
    code: "",
    name: "",
    category: "Tuition",
    amount: "",
    nature: "School Revenue",
    mandatory: true,
    qrBank: "VCB",
    qrAccount: "",
    qrHolder: "",
    qrTemplate: "",
};

export default function FeeCatalogTab() {
    const [catalog, setCatalog] = useState(INITIAL_CATALOG);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const openAddModal = () => {
        setEditingItem(null);
        setForm(EMPTY_FORM);
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setForm({
            code: item.code,
            name: item.name,
            category: item.category,
            amount: item.amount.toString(),
            nature: item.nature,
            mandatory: item.mandatory,
            qrBank: item.qrBank || "VCB",
            qrAccount: item.qrAccount || "",
            qrHolder: item.qrHolder || "",
            qrTemplate: item.qrTemplate || "",
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

    const handleSubmit = () => {
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

        const isDuplicate = catalog.some(
            item => item.code === form.code.trim().toUpperCase() && item.id !== editingItem?.id
        );
        if (isDuplicate) {
            toast.error(`Mã khoản thu "${form.code}" đã tồn tại.`);
            return;
        }

        if (editingItem) {
            setCatalog(prev =>
                prev.map(item =>
                    item.id === editingItem.id
                        ? {
                            ...item,
                            code: form.code.trim().toUpperCase(),
                            name: form.name.trim(),
                            category: form.category,
                            amount,
                            nature: form.nature,
                            mandatory: form.mandatory,
                            qrBank: form.qrBank,
                            qrAccount: form.qrAccount.trim(),
                            qrHolder: form.qrHolder.trim().toUpperCase(),
                            qrTemplate: form.qrTemplate.trim(),
                        }
                        : item
                )
            );
            toast.success(`Đã cập nhật khoản thu "${form.name.trim()}".`);
        } else {
            const newId = Math.max(0, ...catalog.map(c => c.id)) + 1;
            setCatalog(prev => [
                ...prev,
                {
                    id: newId,
                    code: form.code.trim().toUpperCase(),
                    name: form.name.trim(),
                    category: form.category,
                    amount,
                    nature: form.nature,
                    mandatory: form.mandatory,
                    qrBank: form.qrBank,
                    qrAccount: form.qrAccount.trim(),
                    qrHolder: form.qrHolder.trim().toUpperCase(),
                    qrTemplate: form.qrTemplate.trim(),
                },
            ]);
            toast.success(`Đã thêm khoản thu "${form.name.trim()}" thành công.`);
        }

        closeModal();
    };

    const handleDelete = (id) => {
        const item = catalog.find(c => c.id === id);
        setCatalog(prev => prev.filter(c => c.id !== id));
        setDeleteConfirm(null);
        toast.success(`Đã xóa khoản thu "${item?.name}".`);
    };

    const formatMoney = (val) => new Intl.NumberFormat("vi-VN").format(val);

    const handleAmountInput = (e) => {
        const raw = e.target.value.replace(/\D/g, "");
        handleFormChange("amount", raw);
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
            </div>

            <div className="fee-table-wrap">
                <table className="fee-table">
                    <thead>
                        <tr>
                            <th>Mã/Tên khoản thu</th>
                            <th>Phân loại</th>
                            <th>Tính chất (TT24)</th>
                            <th>Định mức (VNĐ)</th>
                            <th>Bắt buộc</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {catalog.map(item => (
                            <tr key={item.id}>
                                <td>
                                    <div className="catalog-cell-code">
                                        <span className="catalog-code-label">{item.code}</span>
                                        <strong>{item.name}</strong>
                                    </div>
                                </td>
                                <td>
                                    <span className="fee-tag">{CATEGORY_OPTIONS.find(c => c.value === item.category)?.label || item.category}</span>
                                </td>
                                <td>
                                    <span className="catalog-nature-text">{NATURE_OPTIONS.find(n => n.value === item.nature)?.label || item.nature}</span>
                                </td>
                                <td className="td-money">
                                    {item.amount.toLocaleString()} ₫
                                    {item.category === "Service" && <span className="catalog-unit-label">/ngày</span>}
                                </td>
                                <td>
                                    <span className={`status-badge ${item.mandatory ? "paid" : "unpaid"}`}>
                                        {item.mandatory ? "Bắt buộc" : "Tự nguyện"}
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
                        ))}
                        {catalog.length === 0 && (
                            <tr>
                                <td colSpan="6" className="empty-state-cell">
                                    Chưa có khoản thu nào. Nhấn "Thêm khoản thu mới" để bắt đầu.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="fee-info-box">
                <FiInfo className="fee-info-icon" />
                <div>
                    <strong>Hướng dẫn nghiệp vụ</strong>
                    Theo Thông tư 24/2024/TT-BTC, các khoản "Thu hộ chi hộ" cần được hạch toán vào các tài khoản riêng biệt để phục vụ báo cáo đối soát với bên thứ ba (Bảo hiểm, Nhà cung cấp đồng phục). Tránh gộp chung vào Doanh thu sự nghiệp của nhà trường.
                </div>
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
                                    label="Tính chất (TT24)"
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

                            {/* ── QR Code Config ── */}
                            <div className="qr-config-section">
                                <div className="qr-config-header">
                                    <FiCreditCard />
                                    <div>
                                        <strong>Cấu hình mã QR thanh toán</strong>
                                        <p className="fm-modal-subtitle">Thông tin ngân hàng để tạo mã VietQR cho phụ huynh quét</p>
                                    </div>
                                </div>

                                <div className="qr-config-body">
                                    <div className="qr-config-fields">
                                        <Select
                                            label="Ngân hàng"
                                            variant="custom"
                                            options={BANK_OPTIONS}
                                            value={form.qrBank}
                                            onChange={(e) => handleFormChange("qrBank", e.target.value)}
                                            placeholder="Chọn ngân hàng"
                                        />

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

                                        <div className="fm-form-group">
                                            <label>Nội dung chuyển khoản (mẫu)</label>
                                            <input
                                                type="text"
                                                className="fee-input full-width"
                                                placeholder="VD: [MaHS] [TenKhoan] HK1 2025-2026"
                                                value={form.qrTemplate}
                                                onChange={(e) => handleFormChange("qrTemplate", e.target.value)}
                                            />
                                            <small className="fm-form-hint">Dùng [MaHS] để tự động thay mã học sinh khi tạo QR</small>
                                        </div>
                                    </div>

                                    {form.qrAccount && (
                                        <div className="qr-preview-panel">
                                            <span className="qr-preview-label">Xem trước QR</span>
                                            <img
                                                className="qr-preview-img"
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                                                    `${BANK_OPTIONS.find(b => b.value === form.qrBank)?.label || ""} | STK: ${form.qrAccount} | ${form.qrHolder} | ${form.qrTemplate || form.name}`
                                                )}`}
                                                alt="QR Preview"
                                            />
                                            <div className="qr-preview-info">
                                                <span className="qr-preview-bank">{BANK_OPTIONS.find(b => b.value === form.qrBank)?.label}</span>
                                                <span className="qr-preview-account">{form.qrAccount}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
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
