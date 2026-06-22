import React, { useState } from "react";
import { FiChevronDown, FiChevronUp, FiEdit2, FiSave, FiX, FiMinus, FiPlus, FiCheckCircle } from "react-icons/fi";
import { adminApiService } from "../../../../services/pages/admin";
import {
    PAYMENT_STORAGE_KEYS,
    buildDueDateHistoryEntry,
    formatDateVi,
    formatVnd,
    loadJson,
    saveJson,
    roundMoney,
} from "../../../../services/shared/payment/paymentShared";

import "./tuitionFeeSection.css";

const STEP_VALUE = 50000;

const DEFAULT_DUE_DATE_BY_TERM = {
    hk1: "2025-09-30",
    hk2: "2026-02-28",
};

const getDefaultDueDateForTerm = (term = "") => {
    const normalized = String(term).toLowerCase();
    if (normalized.includes("1")) return DEFAULT_DUE_DATE_BY_TERM.hk1;
    if (normalized.includes("2")) return DEFAULT_DUE_DATE_BY_TERM.hk2;
    return "";
};

export default function TuitionFeeSection({ tuitionData, selectedGrade, selectedTerm, selectedTermKey, selectedSchoolYear }) {
    const [expandedRow, setExpandedRow] = useState(() => {
        if (selectedGrade && selectedGrade !== "Tất cả khối") {
            return selectedGrade.replace("Khối ", "");
        }
        return null;
    });
    const [localData, setLocalData] = useState(() => JSON.parse(JSON.stringify(tuitionData || {})));
    const [editingGrade, setEditingGrade] = useState(null);
    const [editForm, setEditForm] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingConfirm, setPendingConfirm] = useState(null);
    const [notiContent, setNotiContent] = useState("");
    const [isDueDateModalOpen, setIsDueDateModalOpen] = useState(false);
    const [dueDateDraft, setDueDateDraft] = useState({ key: "", grade: "", term: "", dueDate: "", reason: "" });
    const [isSendingNotification, setIsSendingNotification] = useState(false);

    const resolveTermKey = (termLabelOrKey) => {
        if (termLabelOrKey === "Học kỳ 1" || termLabelOrKey === "hk1") return "hk1";
        if (termLabelOrKey === "Học kỳ 2" || termLabelOrKey === "hk2") return "hk2";
        return termLabelOrKey;
    };

    const getDueDateKey = (grade, term) => `${selectedSchoolYear}__${grade}__${resolveTermKey(term)}`;

    const [dueDateMap, setDueDateMap] = useState(() => {
        const storedDueDates = loadJson(PAYMENT_STORAGE_KEYS.ADMIN_DUE_DATES, {});
        const nextDueDates = { ...storedDueDates };

        Object.entries(tuitionData || {}).forEach(([grade, semesters]) => {
            Object.keys(semesters || {}).forEach((term) => {
                    const key = `${selectedSchoolYear}__${grade}__${resolveTermKey(term)}`;
                if (!nextDueDates[key]) {
                    nextDueDates[key] = getDefaultDueDateForTerm(term);
                }
            });
        });

        saveJson(PAYMENT_STORAGE_KEYS.ADMIN_DUE_DATES, nextDueDates);
        return nextDueDates;
    });
    const [dueDateHistoryMap, setDueDateHistoryMap] = useState(() => loadJson(PAYMENT_STORAGE_KEYS.ADMIN_DUE_DATE_HISTORY, {}));

    const getDueDateByKey = (grade, term) => {
        const key = getDueDateKey(grade, term);
        return dueDateMap[key] || DEFAULT_DUE_DATE_BY_TERM[resolveTermKey(term)] || "";
    };

    const formatCurrency = (amount) => formatVnd(roundMoney(amount));

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
        const data = localData[grade]?.[resolveTermKey(term)] || [];
        setEditForm(JSON.parse(JSON.stringify(data)));
    };

    const cancelEditing = () => {
        setEditingGrade(null);
    };

    const openDueDateModal = (grade, term) => {
        const key = getDueDateKey(grade, term);
        setDueDateDraft({
            key,
            grade,
            term,
            dueDate: dueDateMap[key] || getDefaultDueDateForTerm(term),
            reason: "",
        });
        setIsDueDateModalOpen(true);
    };

    const saveDueDateChange = () => {
        if (!dueDateDraft.dueDate) {
            window.alert("Vui long chon han nop.");
            return;
        }

        const previousDate = dueDateMap[dueDateDraft.key] || "";
        const nextDate = dueDateDraft.dueDate;

        const nextDueDateMap = {
            ...dueDateMap,
            [dueDateDraft.key]: nextDate,
        };

        const historyEntry = buildDueDateHistoryEntry({
            oldDate: previousDate,
            newDate: nextDate,
            reason: dueDateDraft.reason || "Cap nhat han nop",
            updatedBy: "Admin Payment",
        });

        const currentHistory = dueDateHistoryMap[dueDateDraft.key] || [];
        const nextHistory = {
            ...dueDateHistoryMap,
            [dueDateDraft.key]: [historyEntry, ...currentHistory],
        };

        setDueDateMap(nextDueDateMap);
        setDueDateHistoryMap(nextHistory);
        saveJson(PAYMENT_STORAGE_KEYS.ADMIN_DUE_DATES, nextDueDateMap);
        saveJson(PAYMENT_STORAGE_KEYS.ADMIN_DUE_DATE_HISTORY, nextHistory);

        setIsDueDateModalOpen(false);
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
        const currentItems = localData[grade]?.[resolveTermKey(term)] || [];
        const total = currentItems.reduce((sum, item) => sum + item.amount, 0);
        const dueDate = getDueDateByKey(grade, term);

        const defaultMsg = `Nha truong thong bao hoc phi Khoi ${grade} (${selectedSchoolYear} - ${term}). Tong: ${formatCurrency(total)}. Han nop: ${formatDateVi(dueDate)}.`;

        setPendingConfirm({ grade, term, year: selectedSchoolYear, total, dueDate });
        setNotiContent(defaultMsg);
        setShowConfirmModal(true);
    };

    const processNotification = async () => {
        if (!pendingConfirm) return;

        const { grade, term, year } = pendingConfirm;
        setIsSendingNotification(true);
        try {
            const createRes = await adminApiService.post_notifications({
                body: {
                    title: `Thong bao hoc phi Khoi ${grade}`,
                    content: notiContent,
                    type: "fee",
                    targetType: "student",
                    status: "draft",
                    priority: "normal",
                },
            });
            const notificationId = createRes?.data?.id || createRes?.id;
            if (notificationId) {
                await adminApiService.post_notifications_by_id_send({
                    pathParams: { id: notificationId },
                });
            }

            window.alert(`Da gui thong bao hoc phi Khoi ${grade} - ${year} - ${term}`);
            setShowConfirmModal(false);
            setPendingConfirm(null);
        } catch (error) {
            console.error("Failed to send tuition notification:", error);
            window.alert("Khong the gui thong bao hoc phi tu he thong. Vui long thu lai.");
        } finally {
            setIsSendingNotification(false);
        }
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
                            const currentList = semesters[resolveTermKey(selectedTermKey || selectedTerm)] || [];
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

                                                    <div className="tuition-due-date-panel">
                                                        <div className="tuition-due-date-main">
                                                            <span>Han nop hien tai</span>
                                                            <strong>{formatDateVi(getDueDateByKey(grade, selectedTerm))}</strong>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className="tuition-action-btn edit-standard"
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                openDueDateModal(grade, selectedTerm);
                                                            }}
                                                        >
                                                            <FiEdit2 /> Chinh han nop
                                                        </button>
                                                    </div>

                                                    <div className="tuition-due-history-list">
                                                        <p>Lich su thay doi han nop</p>
                                                        {(dueDateHistoryMap[getDueDateKey(grade, selectedTerm)] || []).slice(0, 3).map((entry) => (
                                                            <div key={entry.id} className="tuition-due-history-item">
                                                                    <span>{formatDateVi(entry.oldDate)} {"->"} {formatDateVi(entry.newDate)}</span>
                                                                <small>{entry.reason}</small>
                                                            </div>
                                                        ))}
                                                        {!(dueDateHistoryMap[getDueDateKey(grade, selectedTerm)] || []).length ? (
                                                            <div className="tuition-due-history-empty">Chua co lich su thay doi.</div>
                                                        ) : null}
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
                            
                             <div className="summary-box mb-4 mt-2">
                                <span>Khối: <strong>{pendingConfirm?.grade}</strong> <span className="mx-2">|</span> {pendingConfirm?.year} - {pendingConfirm?.term}</span>
                                <span className="total-amount">{formatCurrency(pendingConfirm?.total)}</span>
                            </div>
                             <div className="summary-due-date">
                                 Han nop: <strong>{formatDateVi(pendingConfirm?.dueDate)}</strong>
                             </div>
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
                            <button className="modal-btn cancel" onClick={() => setShowConfirmModal(false)} disabled={isSendingNotification}>Hủy</button>
                            <button className="modal-btn confirm" onClick={processNotification} disabled={isSendingNotification}>
                                {isSendingNotification ? "Đang gửi..." : "Xác nhận & Gửi"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isDueDateModalOpen && (
                <div className="payment-modal-overlay">
                    <div className="payment-modal-card">
                        <div className="modal-header">
                            <FiEdit2 className="modal-icon" />
                            <h3>Cap nhat han nop</h3>
                        </div>
                        <div className="modal-body">
                            <p>
                                Khoi {dueDateDraft.grade} - {dueDateDraft.term} ({selectedSchoolYear})
                            </p>
                            <div className="due-date-edit-grid">
                                <label className="input-label" htmlFor="due-date-value">Han nop moi</label>
                                <input
                                    id="due-date-value"
                                    type="date"
                                    className="due-date-input"
                                    value={dueDateDraft.dueDate}
                                    onChange={(event) => setDueDateDraft((prev) => ({ ...prev, dueDate: event.target.value }))}
                                />
                                <label className="input-label" htmlFor="due-date-reason">Ly do thay doi</label>
                                <textarea
                                    id="due-date-reason"
                                    className="noti-textarea"
                                    value={dueDateDraft.reason}
                                    onChange={(event) => setDueDateDraft((prev) => ({ ...prev, reason: event.target.value }))}
                                    placeholder="Vi du: Dieu chinh lich thu do thay doi ke hoach hoc ky"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="modal-btn cancel" onClick={() => setIsDueDateModalOpen(false)}>Huy</button>
                            <button className="modal-btn confirm" onClick={saveDueDateChange}>Luu han nop</button>
                        </div>
                    </div>
                </div>
            )}
        </section>

    );
}
