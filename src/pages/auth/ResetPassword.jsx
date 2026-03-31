import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import AuthLayout from "../../layouts/auth/AuthLayout.jsx";
import "./ResetPassword.css";

function ResetPassword() {
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
    };

    return (
        <AuthLayout
            title="Đặt lại mật khẩu"
            subtitle="Tạo mật khẩu mới và xác nhận để tiếp tục."
        >
            <form className="auth-form" onSubmit={handleSubmit}>
                <div className="auth-field">
                    <label htmlFor="new-password">Mật khẩu mới</label>

                    <div className="auth-password-wrapper">
                        <input
                            id="new-password"
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Nhập mật khẩu mới"
                        />

                        <button
                            type="button"
                            className="auth-password-toggle"
                            onClick={() => setShowNewPassword((prev) => !prev)}
                            aria-label={showNewPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                        >
                            {showNewPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                        </button>
                    </div>
                </div>

                <div className="auth-field">
                    <label htmlFor="confirm-password">Xác nhận mật khẩu</label>

                    <div className="auth-password-wrapper">
                        <input
                            id="confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Nhập lại mật khẩu mới"
                        />

                        <button
                            type="button"
                            className="auth-password-toggle"
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                            aria-label={
                                showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                            }
                        >
                            {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                        </button>
                    </div>
                </div>

                <button type="submit" className="auth-button">
                    Đặt lại mật khẩu
                </button>

                <div className="auth-footer">
                    Quay lại <Link to="/login">Đăng nhập</Link>
                </div>
            </form>
        </AuthLayout>
    );
}

export default ResetPassword;