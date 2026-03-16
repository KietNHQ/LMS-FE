import React from "react";
import "./ProfileActionsSection.css";

export default function ProfileActionsSection({ role = "student", onChangePassword, onClose }) {
    return (
        <div className={`profile-actions-section role-${role}`}>
            <button type="button" className="profile-change-password-btn" onClick={onChangePassword}>
                Đổi mật khẩu
            </button>
            <button type="button" className="profile-close-btn" onClick={onClose}>
                Đóng
            </button>
        </div>
    );
}

