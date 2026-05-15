import React from "react";
import "./blockUnblockUserSection.css";

export default function BlockUnblockUsersSection({ user, onClose, onConfirm }) {
    const isActive = user.status === "Hoạt động";

    return (
        <div className="block-unblock-users-overlay" onClick={onClose}>
            <div
                className="block-unblock-users-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <h2>{isActive ? "Vô hiệu hóa người dùng" : "Kích hoạt người dùng"}</h2>

                <p>
                    Bạn có chắc muốn {isActive ? "vô hiệu hóa" : "kích hoạt lại"} người dùng{" "}
                    <strong>{user.name}</strong> không?
                </p>

                <div className="block-unblock-users-actions">
                    <button className="block-unblock-users-btn cancel" onClick={onClose}>
                        Hủy
                    </button>
                    <button className="block-unblock-users-btn primary" onClick={onConfirm}>
                        {isActive ? "Xác nhận vô hiệu hóa" : "Xác nhận kích hoạt"}
                    </button>
                </div>
            </div>
        </div>
    );
}
