import React, { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../layouts/auth/AuthLayout.jsx";
import { useForgotPassword } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import { LoadingSpinner } from "../../components/common";
import "./ForgotPassword.css";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    
    const forgotPasswordMutation = useForgotPassword();
    const isLoading = forgotPasswordMutation.isPending;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;

        try {
            await forgotPasswordMutation.mutateAsync(email);
            setIsSubmitted(true);
            toast.success("Yêu cầu đã được gửi! Vui lòng kiểm tra email của bạn.");
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại sau.";
            toast.error(errorMsg);
        }
    };

    if (isSubmitted) {
        return (
            <AuthLayout
                title="Kiểm tra email"
                subtitle="Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn."
            >
                <div className="auth-success-message">
                    <p>Vui lòng kiểm tra hộp thư đến (và cả thư rác) để tìm link đặt lại mật khẩu.</p>
                </div>
                <div className="auth-footer">
                    Quay lại <Link to="/login">Đăng nhập</Link>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Quên mật khẩu?"
            subtitle="Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu."
        >
            <form className="auth-form" onSubmit={handleSubmit}>
                <div className="auth-field">
                    <label htmlFor="forgot-email">Email</label>
                    <input
                        id="forgot-email"
                        type="email"
                        placeholder="Nhập email của bạn"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>

                <button type="submit" className="auth-button" disabled={isLoading}>
                    {isLoading ? <LoadingSpinner size="sm" label="Đang gửi..." /> : "Gửi yêu cầu"}
                </button>

                <div className="auth-footer">
                    Quay lại <Link to="/login">Đăng nhập</Link>
                </div>
            </form>
        </AuthLayout>
    );
}

export default ForgotPassword;