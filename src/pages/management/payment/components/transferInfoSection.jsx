import React, { useState } from "react";
import { FiEdit2, FiSave, FiX, FiImage } from "react-icons/fi";
import "./transferInfoSection.css";

export default function TransferInfoSection({ accounts = [] }) {
    const firstAccount = accounts[0] || {};
    const [isEditing, setIsEditing] = useState(false);
    const [info, setInfo] = useState({
        bankName: firstAccount.bank_name || firstAccount.bankName || "Ngân hàng TMCP Phương Đông (OCB)",
        accountName: firstAccount.account_holder || firstAccount.accountHolder || "TRUONG THPT EDUVN",
        accountNumber: firstAccount.account_number || firstAccount.accountNumber || "0123456789",
        qrUrl: firstAccount.qr_url || firstAccount.qrUrl || "https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"
    });

    React.useEffect(() => {
        if (accounts.length > 0) {
            const acc = accounts[0];
            setInfo({
                bankName: acc.bank_name || acc.bankName,
                accountName: acc.account_holder || acc.accountHolder,
                accountNumber: acc.account_number || acc.accountNumber,
                qrUrl: acc.qr_url || acc.qrUrl || "https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"
            });
        }
    }, [accounts]);
    
    const [editForm, setEditForm] = useState(info);

    const handleSave = () => {
        setInfo(editForm);
        setIsEditing(false);
        // In a real app, API call goes here
        window.alert("Đã cập nhật thông tin chuyển khoản.");
    };

    const handleCancel = () => {
        setEditForm(info);
        setIsEditing(false);
    };

    return (
        <section className="transfer-section">
            <div className="transfer-header">
                <h3>Cấu hình Thông tin Chuyển khoản</h3>
                {!isEditing ? (
                    <button className="transfer-action-btn edit" onClick={() => setIsEditing(true)}>
                        <FiEdit2 /> Chỉnh sửa
                    </button>
                ) : (
                    <div className="transfer-actions">
                        <button className="transfer-action-btn cancel" onClick={handleCancel}>
                            <FiX /> Hủy
                        </button>
                        <button className="transfer-action-btn save" onClick={handleSave}>
                            <FiSave /> Lưu
                        </button>
                    </div>
                )}
            </div>

            <div className="transfer-body">
                <div className="transfer-info-col">
                    <div className="transfer-field">
                        <label>Tên Ngân hàng</label>
                        {isEditing ? (
                            <input 
                                type="text" 
                                value={editForm.bankName} 
                                onChange={e => setEditForm({...editForm, bankName: e.target.value})}
                            />
                        ) : (
                            <div className="transfer-value">{info.bankName}</div>
                        )}
                    </div>
                    <div className="transfer-field">
                        <label>Tên Chủ Tài Khoản</label>
                        {isEditing ? (
                            <input 
                                type="text" 
                                value={editForm.accountName} 
                                onChange={e => setEditForm({...editForm, accountName: e.target.value.toUpperCase()})}
                            />
                        ) : (
                            <div className="transfer-value fw-700">{info.accountName}</div>
                        )}
                    </div>
                    <div className="transfer-field">
                        <label>Số Tài Khoản</label>
                        {isEditing ? (
                            <input 
                                type="text" 
                                value={editForm.accountNumber} 
                                onChange={e => setEditForm({...editForm, accountNumber: e.target.value})}
                            />
                        ) : (
                            <div className="transfer-value fw-700 text-primary">{info.accountNumber}</div>
                        )}
                    </div>
                    
                    {isEditing && (
                        <div className="transfer-field">
                            <label>Đường dẫn ảnh QR (URL)</label>
                            <input 
                                type="text" 
                                value={editForm.qrUrl} 
                                onChange={e => setEditForm({...editForm, qrUrl: e.target.value})}
                            />
                        </div>
                    )}
                </div>
                
                <div className="transfer-qr-col">
                    <h4>Mã QR Thanh toán</h4>
                    <div className="transfer-qr-preview">
                        {isEditing ? (
                            editForm.qrUrl ? <img src={editForm.qrUrl} alt="QR Preview" /> : <div className="no-qr"><FiImage size={40}/></div>
                        ) : (
                            info.qrUrl ? <img src={info.qrUrl} alt="QR Code" /> : <div className="no-qr">Chưa có mã QR.</div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

