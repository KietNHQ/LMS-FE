import "./tuitionPricingSection.css";
import { Check, Edit2, Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import Modal from "../../../../../components/ui/Modal/Modal";

const PRICE_STEP = 100000;
const MAX_TRANSFER_NOTE_LENGTH = 200;

const TuitionPricingSection = ({ selectedSchoolYear, selectedTerm, tuitionData, onUpdateTuition }) => {
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState(0);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({
    bankName: "NGAN HANG DEMO",
    bin: "970422",
    accountNumber: "",
    accountName: "",
    transferNoteTemplate: "{hoc_sinh} {lop} Hoc phi HK{ky}",
  });
  const [discountForm, setDiscountForm] = useState({
    code: "",
    percent: "",
    expiryDate: "",
  });
  const [todayDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [editingDiscountId, setEditingDiscountId] = useState(null);
  const [savedDiscounts, setSavedDiscounts] = useState([]);

  const gradeRows = [
    { key: "10", label: "Khối 10" },
    { key: "11", label: "Khối 11" },
    { key: "12", label: "Khối 12" },
  ];

  const handleEditStart = (key, value) => {
    setEditingKey(key);
    setEditValue(Number(value) || 0);
  };

  const handleStepValue = (delta) => {
    setEditValue((prev) => Math.max(0, prev + delta * PRICE_STEP));
  };

  const handleEditSave = (grade) => {
    if (Number.isFinite(editValue)) {
      onUpdateTuition(grade, Math.max(0, editValue));
    }

    setEditingKey(null);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const termNumber = selectedTerm === "hk1" ? "1" : "2";

  const formatDate = (value) => {
    if (!value) {
      return "--";
    }

    return new Date(`${value}T00:00:00`).toLocaleDateString("vi-VN");
  };

  const isExpired = (value) => {
    if (!value) {
      return false;
    }

    // YYYY-MM-DD can be compared lexicographically.
    return value < todayDate;
  };

  const handleSavePaymentInfo = () => {
    setIsPaymentDialogOpen(false);
  };

  const resetDiscountForm = () => {
    setDiscountForm({ code: "", percent: "", expiryDate: "" });
    setEditingDiscountId(null);
  };

  const openCreateDiscountDialog = () => {
    resetDiscountForm();
    setIsDiscountDialogOpen(true);
  };

  const handleOpenEditDiscount = (discount) => {
    setDiscountForm({
      code: discount.code,
      percent: `${discount.percent}`,
      expiryDate: discount.expiryDate,
    });
    setEditingDiscountId(discount.id);
    setIsDiscountDialogOpen(true);
  };

  const handleDeleteDiscount = (discountId) => {
    setSavedDiscounts((prev) => prev.filter((item) => item.id !== discountId));
  };

  const handleToggleDiscountStatus = (discountId) => {
    setSavedDiscounts((prev) =>
      prev.map((item) =>
        item.id === discountId ? { ...item, isDisabled: !item.isDisabled } : item
      )
    );
  };

  const handleSaveDiscount = () => {
    const code = discountForm.code.trim().toUpperCase();
    const percentNumber = Number(discountForm.percent);

    if (!code || !discountForm.expiryDate || !Number.isFinite(percentNumber)) {
      return;
    }

    const boundedPercent = Math.min(Math.max(percentNumber, 0), 100);

    const hasDuplicateCode = savedDiscounts.some(
      (item) => item.code === code && item.id !== editingDiscountId
    );

    if (hasDuplicateCode) {
      return;
    }

    if (editingDiscountId) {
      setSavedDiscounts((prev) =>
        prev.map((item) =>
          item.id === editingDiscountId
            ? {
                ...item,
                code,
                percent: boundedPercent,
                expiryDate: discountForm.expiryDate,
              }
            : item
        )
      );

      setIsDiscountDialogOpen(false);
      resetDiscountForm();
    } else {
      setSavedDiscounts((prev) => [
        {
          id: Date.now(),
          code,
          percent: boundedPercent,
          expiryDate: discountForm.expiryDate,
          isDisabled: false,
        },
        ...prev,
      ]);

      window.alert("Tạo mã giảm giá thành công.");
      resetDiscountForm();
    }
  };

  return (
    <div className="admin-dashboard__card admin-dashboard__card--pricing">
      <div className="admin-dashboard__card-header">
        <h3>
          Giá tiền học kỳ <span className="admin-dashboard__pricing-term-number">{termNumber}</span>
        </h3>
        <div className="admin-dashboard__pricing-meta">
          <span className="admin-dashboard__pricing-year">Năm học {selectedSchoolYear}</span>
        </div>
      </div>

      <div className="admin-dashboard__pricing-actions">
        <button
          type="button"
          className="admin-dashboard__pricing-action-btn"
          onClick={() => setIsPaymentDialogOpen(true)}
        >
          Sửa thanh toán online
        </button>
        <button
          type="button"
          className="admin-dashboard__pricing-action-btn admin-dashboard__pricing-action-btn--secondary"
          onClick={openCreateDiscountDialog}
        >
          Tạo mã giảm giá
        </button>
      </div>

      <div className="admin-dashboard__pricing-list">
        {gradeRows.map((grade) => (
          <div className="admin-dashboard__pricing-row" key={grade.key}>
            <div className="admin-dashboard__pricing-info">
              <p className="admin-dashboard__pricing-label">{grade.label}</p>
            </div>

            <div className="admin-dashboard__pricing-value">
              {editingKey === grade.key ? (
                <div className="admin-dashboard__pricing-edit">
                  <button
                    type="button"
                    className="admin-dashboard__pricing-step-btn"
                    onClick={() => handleStepValue(-1)}
                    aria-label={`Giảm 100 nghìn cho ${grade.label}`}
                  >
                    <Minus size={14} />
                  </button>

                  <span className="admin-dashboard__pricing-edit-value">{formatCurrency(editValue)}</span>

                  <button
                    type="button"
                    className="admin-dashboard__pricing-step-btn"
                    onClick={() => handleStepValue(1)}
                    aria-label={`Tăng 100 nghìn cho ${grade.label}`}
                  >
                    <Plus size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEditSave(grade.key)}
                    className="admin-dashboard__pricing-btn--save"
                    aria-label={`Lưu giá ${grade.label}`}
                  >
                    <Check size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <span>{formatCurrency(tuitionData[grade.key])}</span>
                  <button
                    onClick={() => handleEditStart(grade.key, tuitionData[grade.key])}
                    className="admin-dashboard__pricing-btn--edit"
                    type="button"
                    aria-label={`Cập nhật giá ${grade.label}`}
                  >
                    <Edit2 size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {savedDiscounts.length > 0 ? (
        <div className="admin-dashboard__discount-table-wrap">
          <table className="admin-dashboard__discount-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>% giảm</th>
                <th>Hạn sử dụng</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {savedDiscounts.map((item) => {
                const expired = isExpired(item.expiryDate);
                const disabled = Boolean(item.isDisabled);

                return (
                  <tr key={item.id}>
                    <td>{item.code}</td>
                    <td>{item.percent}%</td>
                    <td>{formatDate(item.expiryDate)}</td>
                    <td>
                      <span
                        className={`admin-dashboard__discount-status ${
                          disabled ? "is-disabled" : expired ? "is-expired" : "is-active"
                        }`}
                      >
                        {disabled ? "Đã tắt" : expired ? "Hết hạn" : "Còn hạn"}
                      </span>
                    </td>
                    <td>
                      <div className="admin-dashboard__discount-actions">
                        <button
                          type="button"
                          className="admin-dashboard__discount-icon-btn"
                          onClick={() => handleOpenEditDiscount(item)}
                          aria-label={`Sửa mã ${item.code}`}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          className="admin-dashboard__discount-icon-btn"
                          onClick={() => handleToggleDiscountStatus(item.id)}
                          aria-label={`${disabled ? "Kích hoạt" : "Vô hiệu hóa"} mã ${item.code}`}
                        >
                          {disabled ? "Bật" : "Tắt"}
                        </button>
                        <button
                          type="button"
                          className="admin-dashboard__discount-icon-btn is-danger"
                          onClick={() => handleDeleteDiscount(item.id)}
                          aria-label={`Xóa mã ${item.code}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      <Modal
        open={isPaymentDialogOpen}
        title="Chỉnh sửa thông tin thanh toán online"
        onClose={() => setIsPaymentDialogOpen(false)}
        className="admin-dashboard__pricing-modal"
      >
        <div className="admin-dashboard__pricing-form">
          <label className="admin-dashboard__pricing-field">
            <span>Ngân hàng</span>
            <input
              type="text"
              value={paymentInfo.bankName}
              onChange={(event) =>
                setPaymentInfo((prev) => ({ ...prev, bankName: event.target.value }))
              }
              placeholder="Ví dụ: MB Bank"
            />
          </label>

          <label className="admin-dashboard__pricing-field">
            <span>BIN ngân hàng</span>
            <input
              type="text"
              value={paymentInfo.bin}
              onChange={(event) =>
                setPaymentInfo((prev) => ({ ...prev, bin: event.target.value }))
              }
              placeholder="Ví dụ: 970422"
            />
          </label>

          <label className="admin-dashboard__pricing-field">
            <span>Tên tài khoản</span>
            <input
              type="text"
              value={paymentInfo.accountName}
              onChange={(event) =>
                setPaymentInfo((prev) => ({ ...prev, accountName: event.target.value }))
              }
              placeholder="Nhập tên tài khoản nhận tiền"
            />
          </label>

          <label className="admin-dashboard__pricing-field">
            <span>Số tài khoản</span>
            <input
              type="text"
              value={paymentInfo.accountNumber}
              onChange={(event) =>
                setPaymentInfo((prev) => ({ ...prev, accountNumber: event.target.value }))
              }
              placeholder="Nhập số tài khoản nhận tiền"
            />
          </label>

          <label className="admin-dashboard__pricing-field admin-dashboard__pricing-field--transfer-template">
            <span>Nội dung chuyển khoản mẫu</span>
            <textarea
              className="admin-dashboard__pricing-transfer-note"
              rows={3}
              maxLength={MAX_TRANSFER_NOTE_LENGTH}
              value={paymentInfo.transferNoteTemplate}
              onChange={(event) =>
                setPaymentInfo((prev) => ({
                  ...prev,
                  transferNoteTemplate: event.target.value.slice(0, MAX_TRANSFER_NOTE_LENGTH),
                }))
              }
              placeholder="Ví dụ: {hoc_sinh} {lop} Hoc phi HK{ky}"
            />
            <small className="admin-dashboard__pricing-note-counter">
              {paymentInfo.transferNoteTemplate.length}/{MAX_TRANSFER_NOTE_LENGTH}
            </small>
          </label>
        </div>

        <div className="admin-dashboard__pricing-modal-actions">
          <button type="button" className="admin-dashboard__modal-btn" onClick={() => setIsPaymentDialogOpen(false)}>
            Hủy
          </button>
          <button
            type="button"
            className="admin-dashboard__modal-btn admin-dashboard__modal-btn--primary"
            onClick={handleSavePaymentInfo}
          >
            Lưu thông tin
          </button>
        </div>
      </Modal>

      <Modal
        open={isDiscountDialogOpen}
        title={editingDiscountId ? "Cập nhật mã giảm giá" : "Tạo mã giảm giá"}
        onClose={() => {
          setIsDiscountDialogOpen(false);
          resetDiscountForm();
        }}
        className="admin-dashboard__pricing-modal"
      >
        <div className="admin-dashboard__discount-dialog-content">
          <div className="admin-dashboard__pricing-form admin-dashboard__discount-dialog-form">
            <label className="admin-dashboard__pricing-field">
              <span>Mã giảm giá</span>
              <input
                type="text"
                value={discountForm.code}
                onChange={(event) =>
                  setDiscountForm((prev) => ({ ...prev, code: event.target.value.toUpperCase() }))
                }
                placeholder="VD: HK1-10OFF"
              />
            </label>

            <label className="admin-dashboard__pricing-field">
              <span>Phần trăm giảm (%)</span>
              <input
                type="number"
                min="0"
                max="100"
                value={discountForm.percent}
                onChange={(event) =>
                  setDiscountForm((prev) => ({ ...prev, percent: event.target.value }))
                }
                placeholder="Ví dụ: 10"
              />
            </label>

            <label className="admin-dashboard__pricing-field">
              <span>Hạn sử dụng</span>
              <input
                type="date"
                value={discountForm.expiryDate}
                onChange={(event) =>
                  setDiscountForm((prev) => ({ ...prev, expiryDate: event.target.value }))
                }
              />
            </label>
          </div>

          <div className="admin-dashboard__discount-dialog-section">
            <div className="admin-dashboard__discount-dialog-header">
              <span>Danh sách mã đã tạo</span>
              <small>{savedDiscounts.length} mã</small>
            </div>

            <div className="admin-dashboard__discount-dialog-list">
              {savedDiscounts.length > 0 ? (
                savedDiscounts.map((item) => {
                  const expired = isExpired(item.expiryDate);
                  const disabled = Boolean(item.isDisabled);

                  return (
                    <div key={item.id} className="admin-dashboard__discount-dialog-item">
                      <div className="admin-dashboard__discount-dialog-item-main">
                        <strong>{item.code}</strong>
                        <span>
                          {item.percent}% • HSD {formatDate(item.expiryDate)}
                        </span>
                      </div>

                      <div className="admin-dashboard__discount-dialog-item-actions">
                        <span
                          className={`admin-dashboard__discount-status ${
                            disabled ? "is-disabled" : expired ? "is-expired" : "is-active"
                          }`}
                        >
                          {disabled ? "Đã tắt" : expired ? "Hết hạn" : "Còn hạn"}
                        </span>
                        <button
                          type="button"
                          className="admin-dashboard__discount-inline-btn"
                          onClick={() => handleOpenEditDiscount(item)}
                        >
                          Xem lại
                        </button>
                        <button
                          type="button"
                          className="admin-dashboard__discount-inline-btn"
                          onClick={() => handleToggleDiscountStatus(item.id)}
                        >
                          {disabled ? "Kích hoạt" : "Vô hiệu hóa"}
                        </button>
                        <button
                          type="button"
                          className="admin-dashboard__discount-inline-btn is-danger"
                          onClick={() => handleDeleteDiscount(item.id)}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="admin-dashboard__discount-empty">Chưa có mã giảm giá nào.</p>
              )}
            </div>
          </div>
        </div>

        <div className="admin-dashboard__pricing-modal-actions">
          <button
            type="button"
            className="admin-dashboard__modal-btn"
            onClick={() => {
              setIsDiscountDialogOpen(false);
              resetDiscountForm();
            }}
          >
            Hủy
          </button>
          <button
            type="button"
            className="admin-dashboard__modal-btn admin-dashboard__modal-btn--primary"
            onClick={handleSaveDiscount}
            disabled={!discountForm.code.trim() || !discountForm.percent || !discountForm.expiryDate}
          >
            {editingDiscountId ? "Cập nhật" : "Tạo mã"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default TuitionPricingSection;

