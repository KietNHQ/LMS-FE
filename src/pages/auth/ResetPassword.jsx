import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import AuthLayout from "../../layouts/auth/AuthLayout.jsx";
import { useResetPassword } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import { LoadingSpinner } from "../../components/common";
import "./ResetPassword.css";

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const resetPasswordMutation = useResetPassword();
    const isLoading = resetPasswordMutation.isPending;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            toast.error("Mã xác thực không hợp lệ hoặc đã hết hạn.");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp.");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("Mật khẩu phải có ít nhất 6 ký tự.");
            return;
        }

        try {
            await resetPasswordMutation.mutateAsync({ token, newPassword });
            toast.success("Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.");
            navigate("/login");
        } catch (error) {
            const errorMsg = error.response?.data?.error || "Có lỗi xảy ra. Vui lòng thử lại sau.";
            toast.error(errorMsg);
        }
    };

    if (!token) {
        return (
            <AuthLayout title="Lỗi xác thực" subtitle="Không tìm thấy mã xác thực hợp lệ.">
                <div className="auth-error-message">
                    <p>Vui lòng yêu cầu lại link đặt lại mật khẩu từ trang Quên mật khẩu.</p>
                </div>
                <div className="auth-footer">
                    Quay lại <Link to="/login/forgotpass">Quên mật khẩu</Link>
                </div>
            </AuthLayout>
        );
    }

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
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                        <button
                            type="button"
                            className="auth-password-toggle"
                            onClick={() => setShowNewPassword((prev) => !prev)}
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
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                        <button
                            type="button"
                            className="auth-password-toggle"
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                        >
                            {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                        </button>
                    </div>
                </div>

                <button type="submit" className="auth-button" disabled={isLoading}>
                    {isLoading ? <LoadingSpinner size="sm" label="Đang cập nhật..." /> : "Đặt lại mật khẩu"}
                </button>

                <div className="auth-footer">
                    Quay lại <Link to="/login">Đăng nhập</Link>
                </div>
            </form>
        </AuthLayout>
    );
}

export default ResetPassword;