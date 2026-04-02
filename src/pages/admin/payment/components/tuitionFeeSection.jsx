import React, { useState, useEffect } from "react";
import { FiChevronDown, FiChevronUp, FiEdit2, FiSave, FiX, FiMinus, FiPlus } from "react-icons/fi";
import "./tuitionFeeSection.css";

const STEP_VALUE = 50000;

export default function TuitionFeeSection({ tuitionData, selectedGrade }) {
    const [expandedRow, setExpandedRow] = useState(null);
    const [localData, setLocalData] = useState({});
    const [editingGrade, setEditingGrade] = useState(null);
    const [editForm, setEditForm] = useState([]);

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

    const startEditing = (grade, data) => {
        setEditingGrade(grade);
        setEditForm(JSON.parse(JSON.stringify(data.details)));
    };

    const cancelEditing = () => {
        setEditingGrade(null);
    };

    const handleAmountChange = (index, value) => {
        const newForm = [...editForm];
        newForm[index].amount = parseInputNumber(value);
        setEditForm(newForm);
    };

    const stepAmount = (index, direction) => {
        const newForm = [...editForm];
        const currentVal = newForm[index].amount;
        const delta = direction === "up" ? STEP_VALUE : -STEP_VALUE;
        newForm[index].amount = Math.max(0, currentVal + delta);
        setEditForm(newForm);
    };

    const handleSave = (grade) => {
        const newTotal = editForm.reduce((sum, item) => sum + item.amount, 0);
        setLocalData(prev => ({
            ...prev,
            [grade]: {
                total: newTotal,
                details: editForm
            }
        }));
        setEditingGrade(null);
        window.alert(`Đã cập nhật học phí Khối ${grade}`);
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
                        {Object.entries(localData).map(([grade, data]) => {
                            const isExpanded = expandedRow === grade;
                            const isEditing = editingGrade === grade;
                            
                            return (
                                <React.Fragment key={grade}>
                                    <tr className={`tuition-main-row ${isExpanded ? 'expanded' : ''}`} onClick={() => toggleRow(grade)}>
                                        <td className="fw-600">Khối {grade}</td>
                                        <td className="text-primary fw-700">{formatCurrency(data.total)}</td>
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
                                                        <h4>Chi tiết khoản đóng Khối {grade}:</h4>
                                                        {!isEditing ? (
                                                            <button className="tuition-action-btn edit" onClick={() => startEditing(grade, data)}>
                                                                <FiEdit2 /> Chỉnh sửa
                                                            </button>
                                                        ) : (
                                                            <div className="tuition-details-actions">
                                                                <button className="tuition-action-btn cancel" onClick={cancelEditing}>
                                                                    <FiX /> Hủy
                                                                </button>
                                                                <button className="tuition-action-btn save" onClick={() => handleSave(grade)}>
                                                                    <FiSave /> Lưu
                                                                </button>
                                                            </div>
                                                        )}
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
                                                            {(isEditing ? editForm : data.details).map((item, index) => (
                                                                <tr key={index}>
                                                                    <td>{item.name}</td>
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
                                                                    <td className="text-gray">{item.note}</td>
                                                                </tr>
                                                            ))}
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
        </section>
    );
}
