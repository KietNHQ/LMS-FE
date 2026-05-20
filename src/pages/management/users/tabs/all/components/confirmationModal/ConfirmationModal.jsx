import React from "react";
import "./confirmationModal.css";

export default function ConfirmationModal({ 
    isOpen, 
    title, 
    message, 
    confirmLabel, 
    cancelLabel = "Hủy", 
    onConfirm, 
    onCancel, 
    variant = "primary" 
}) {
    if (!isOpen) return null;

    return (
        <div className="admin-confirm-modal-overlay" onClick={onCancel}>
            <div 
                className="admin-confirm-modal-content" 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="admin-confirm-modal-header">
                    <h2>{title}</h2>
                </div>
                <div className="admin-confirm-modal-body">
                    <p>{message}</p>
                </div>
                <div className="admin-confirm-modal-footer">
                    <button className="admin-confirm-btn cancel" onClick={onCancel}>
                        {cancelLabel}
                    </button>
                    <button className={`admin-confirm-btn confirm ${variant}`} onClick={onConfirm}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

