import React, { useState, useEffect } from "react";
import { FiChevronDown, FiChevronUp, FiEdit2, FiSave, FiX, FiMinus, FiPlus, FiCheckCircle } from "react-icons/fi";

import "./tuitionFeeSection.css";

const STEP_VALUE = 50000;

export default function TuitionFeeSection({ tuitionData, selectedGrade, selectedTerm, selectedSchoolYear }) {
    const [expandedRow, setExpandedRow] = useState(null);
    const [localData, setLocalData] = useState({});
    const [editingGrade, setEditingGrade] = useState(null);
    const [editForm, setEditForm] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingConfirm, setPendingConfirm] = useState(null);
    const [notiContent, setNotiContent] = useState("");




    useEffect(() => {
        if (tuitionData) {
            setLocalData(JSON.parse(JSON.stringify(tuitionData)));
        }
    }, [tuitionData]);

    // Auto-expand logic based on selectedGrade button
    useEffect(() => {
        if (selectedGrade && selectedGrade !== "Tất cả khối") {
            const numericGrade = selectedGrade.replace("Khối ", "");
            setExpandedRow(numericGrade);
        } else if (selectedGrade === "Tất cả khối") {
            setExpandedRow(null);
        }
    }, [selectedGrade]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // Helper for formatting input with dots
    const formatInputNumber = (val) => {
        if (!val && val !== 0) return "";
        return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    // Helper to extract number from formatted string
    const parseInputNumber = (val) => {
        const cleanVal = val.toString().replace(/\./g, "");
        return Number(cleanVal) || 0;
    };

    const toggleRow = (grade) => {
        if (expandedRow === grade) {
            setExpandedRow(null);
            setEditingGrade(null);
        } else {
            setExpandedRow(grade);
            setEditingGrade(null);
        }
    };

    const startEditing = (grade, term) => {
        setEditingGrade(grade);
        const data = localData[grade]?.[term] || [];
        setEditForm(JSON.parse(JSON.stringify(data)));
    };

    const cancelEditing = () => {
        setEditingGrade(null);
    };

    const handleAmountChange = (index, value) => {
        const newForm = [...editForm];
        newForm[index].amount = parseInputNumber(value);
        setEditForm(newForm);
    };

    const handleNameChange = (index, value) => {
        const newForm = [...editForm];
        newForm[index].name = value;
        setEditForm(newForm);
    };

    const handleNoteChange = (index, value) => {
        const newForm = [...editForm];
        newForm[index].note = value;
        setEditForm(newForm);
    };

    const stepAmount = (index, direction) => {
        const newForm = [...editForm];
        const currentVal = newForm[index].amount;
        const delta = direction === "up" ? STEP_VALUE : -STEP_VALUE;
        newForm[index].amount = Math.max(0, currentVal + delta);
        setEditForm(newForm);
    };

    const addNewItem = () => {
        setEditForm([...editForm, { name: "", amount: 0, note: "Bắt buộc" }]);
    };

    const removeItem = (index) => {
        const newForm = editForm.filter((_, i) => i !== index);
        setEditForm(newForm);
    };

    const handleSave = (grade, term) => {
        setLocalData(prev => ({
            ...prev,
            [grade]: {
                ...prev[grade],
                [term]: editForm
            }
        }));
        setEditingGrade(null);
        window.alert(`Đã cập nhật học phí Khối ${grade} - ${term}`);
    };

    const handleConfirmAndNotify = (grade, term) => {
        const currentItems = localData[grade]?.[term] || [];
        const total = currentItems.reduce((sum, item) => sum + item.amount, 0);

        // Check if previously confirmed
        const lastConfirmedRaw = localStorage.getItem("admin_last_confirmed_tuition");
        const lastConfirmed = lastConfirmedRaw ? JSON.parse(lastConfirmedRaw) : {};
        const key = `${grade}_${selectedSchoolYear}_${term}`;
        const prevData = lastConfirmed[key];

        let defaultMsg = "";
        if (!prevData) {
            defaultMsg = `Nhà trường thông báo học phí Khối ${grade} (Năm học ${selectedSchoolYear} - ${term}). Tổng cộng: ${formatCurrency(total)}. Phụ huynh vui lòng xem chi tiết và đóng phí đúng hạn.`;
        } else {
            const diff = total - prevData.total;
            const diffText = diff > 0 ? `tăng thêm ${formatCurrency(diff)}` : `giảm ${formatCurrency(Math.abs(diff))}`;
            defaultMsg = `Nhà trường thông báo ĐIỀU CHỈNH học phí Khối ${grade} (Năm học ${selectedSchoolYear} - ${term}). Tổng mới: ${formatCurrency(total)} (${diffText}).`;
        }

        setPendingConfirm({ grade, term, year: selectedSchoolYear, total });
        setNotiContent(defaultMsg);
        setShowConfirmModal(true);
    };

    const processNotification = () => {
        if (!pendingConfirm) return;

        const { grade, term, year, total } = pendingConfirm;
        const notification = {
            id: Date.now(),
            title: `Thông báo học phí Khối ${grade}`,
            content: notiContent,
            type: `Phụ huynh Lớp ${grade}`,
            date: new Date().toISOString().slice(0, 10),
            read: false,
        };

        // Save to notification list
        const saved = localStorage.getItem("admin_notifications_list");
        const list = saved ? JSON.parse(saved) : [];
        localStorage.setItem("admin_notifications_list", JSON.stringify([notification, ...list]));

        // Save to last confirmed state
        const lastConfirmedRaw = localStorage.getItem("admin_last_confirmed_tuition");
        const lastConfirmed = lastConfirmedRaw ? JSON.parse(lastConfirmedRaw) : {};
        const key = `${grade}_${year}_${term}`;
        lastConfirmed[key] = { total: total, date: new Date().toISOString() };
        localStorage.setItem("admin_last_confirmed_tuition", JSON.stringify(lastConfirmed));

        // Dispatch event
        window.dispatchEvent(new Event("admin-notifications-updated"));

        window.alert(`Đã gửi thông báo học phí Khối ${grade} - Năm học ${year} - ${term}`);

        setShowConfirmModal(false);
        setPendingConfirm(null);
    };

    if (!localData || Object.keys(localData).length === 0) {
        return <div className="tuition-empty">Chưa có dữ liệu học phí cho năm học này.</div>;
    }

    return (
        <section className="tuition-section">
            <div className="tuition-table-wrap">
                <table className="tuition-table">
                    <thead>
                        <tr>
                            <th>Khối Chiếu</th>
                            <th>Tổng Tiền</th>
                            <th className="col-actions">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(localData).map(([grade, semesters]) => {
                            const isExpanded = expandedRow === grade;
                            const isEditing = editingGrade === grade;
                            const currentList = semesters[selectedTerm] || [];
                            const totalAmount = currentList.reduce((sum, item) => sum + item.amount, 0);
                            
                            return (
                                <React.Fragment key={grade}>
                                    <tr className={`tuition-main-row ${isExpanded ? 'expanded' : ''}`} onClick={() => toggleRow(grade)}>
                                        <td className="fw-600">Khối {grade}</td>
                                        <td className="text-primary fw-700">{formatCurrency(totalAmount)}</td>
                                        <td className="col-actions">
                                            <button className="expand-btn">
                                                {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                                            </button>
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr className="tuition-details-row">
                                            <td colSpan="3">
                                                <div className="tuition-details-content">
                                                    <div className="tuition-details-header">
                                                        <div className="header-left">
                                                            <h4>Danh mục thu {selectedTerm} - Khối {grade}:</h4>
                                                        </div>
                                                        <div className="header-right">
                                                            {!isEditing ? (
                                                                <>
                                                                    <button 
                                                                        className="tuition-action-btn edit-standard" 
                                                                        onClick={() => startEditing(grade, selectedTerm)}
                                                                    >
                                                                        <FiEdit2 /> Chỉnh sửa
                                                                    </button>
                                                                    <button 
                                                                        className="tuition-action-btn confirm-standard" 
                                                                        onClick={(e) => { e.stopPropagation(); handleConfirmAndNotify(grade, selectedTerm); }}
                                                                    >
                                                                        <FiCheckCircle /> Xác nhận & Gửi thông báo
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <div className="tuition-details-actions">
                                                                    <button className="tuition-action-btn cancel" onClick={cancelEditing}>
                                                                        <FiX /> Hủy
                                                                    </button>
                                                                    <button className="tuition-action-btn save" onClick={() => handleSave(grade, selectedTerm)}>
                                                                        <FiSave /> Lưu thay đổi
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    <table className="tuition-subtable">
                                                        <thead>
                                                            <tr>
                                                                <th>Hạng mục</th>
                                                                <th>Số tiền</th>
                                                                <th>Ghi chú</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {(isEditing ? editForm : currentList).map((item, index) => (
                                                                <tr key={index}>
                                                                    <td>
                                                                        {isEditing ? (
                                                                            <input 
                                                                                type="text" 
                                                                                className="tuition-name-input"
                                                                                value={item.name}
                                                                                onChange={(e) => handleNameChange(index, e.target.value)}
                                                                                placeholder="Tên khoản thu..."
                                                                            />
                                                                        ) : (
                                                                            item.name
                                                                        )}
                                                                    </td>
                                                                    <td className="fw-600">
                                                                         {isEditing ? (
                                                                             <div className="currency-controller">
                                                                                 <button 
                                                                                     className="step-btn down" 
                                                                                     onClick={() => stepAmount(index, "down")}
                                                                                 >
                                                                                     <FiMinus />
                                                                                 </button>
                                                                                 <input 
                                                                                     type="text" 
                                                                                     className="tuition-edit-input"
                                                                                     value={formatInputNumber(item.amount)}
                                                                                     onChange={(e) => handleAmountChange(index, e.target.value)}
                                                                                 />
                                                                                 <button 
                                                                                     className="step-btn up" 
                                                                                     onClick={() => stepAmount(index, "up")}
                                                                                 >
                                                                                     <FiPlus />
                                                                                 </button>
                                                                             </div>
                                                                         ) : (
                                                                             formatCurrency(item.amount)
                                                                         )}
                                                                    </td>
                                                                    <td>
                                                                        {isEditing ? (
                                                                            <div className="note-with-delete">
                                                                                <input 
                                                                                    type="text" 
                                                                                    className="tuition-note-input"
                                                                                    value={item.note}
                                                                                    onChange={(e) => handleNoteChange(index, e.target.value)}
                                                                                    placeholder="Ghi chú..."
                                                                                />
                                                                                <button className="remove-item-btn" onClick={() => removeItem(index)}>
                                                                                    <FiX />
                                                                                </button>
                                                                            </div>
                                                                        ) : (
                                                                            <span className="text-gray">{item.note}</span>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                            {isEditing && (
                                                                <tr>
                                                                    <td colSpan="3" className="add-row-container">
                                                                        <button className="add-item-btn" onClick={addNewItem}>
                                                                            <FiPlus /> Thêm khoản thu mới
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="payment-modal-overlay">
                    <div className="payment-modal-card">
                        <div className="modal-header">
                            <FiCheckCircle className="modal-icon" />
                            <h3>Xác nhận thông tin</h3>
                        </div>
                        <div className="modal-body scrollable-body">
                            <p>Xác nhận và gửi thông báo học phí:</p>
                            
                            {/* SUMMARY BOX */}
                             <div className="summary-box mb-4 mt-2">
                                <span>Khối: <strong>{pendingConfirm?.grade}</strong> <span className="mx-2">|</span> {pendingConfirm?.year} - {pendingConfirm?.term}</span>
                                <span className="total-amount">{formatCurrency(pendingConfirm?.total)}</span>
                            </div>

                            {/* NOTIFICATION CONTENT AT THE END */}
                            <div className="noti-content-editor">
                                <label className="input-label">Nội dung chỉnh sửa:</label>
                                <textarea 
                                    className="noti-textarea"
                                    value={notiContent}
                                    onChange={(e) => setNotiContent(e.target.value)}
                                    placeholder="Nhập nội dung thông báo..."
                                />
                            </div>
                        </div>



                        <div className="modal-footer">
                            <button className="modal-btn cancel" onClick={() => setShowConfirmModal(false)}>Hủy</button>
                            <button className="modal-btn confirm" onClick={processNotification}>Xác nhận & Gửi</button>
                        </div>
                    </div>
                </div>
            )}
        </section>

    );
}
