import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/auth/AuthLayout.jsx";
import "./ForgotPassword.css";

function ForgotPassword() {
    const navigate = useNavigate();
    const inputRefs = useRef([]);

    const [email, setEmail] = useState("");
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [message, setMessage] = useState({ text: "", type: "" });

    const demoCode = "123456";

    const handleSendCode = (e) => {
        e.preventDefault();

        if (!email.trim()) {
            setMessage({ text: "Vui lòng nhập email trước.", type: "error" });
            return;
        }

        setIsCodeSent(true);
        setMessage({ text: "Mã xác minh đã được gửi đến email của bạn.", type: "success" });
    };

    const handleOtpChange = (value, index) => {
        const cleanValue = value.replace(/\D/g, "").slice(0, 1);
        const nextOtp = [...otp];
        nextOtp[index] = cleanValue;
        setOtp(nextOtp);

        if (cleanValue && index < otp.length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyCode = (e) => {
        e.preventDefault();
        const code = otp.join("");

        if (code.length < 6) {
            setMessage({ text: "Vui lòng nhập đầy đủ mã 6 chữ số.", type: "error" });
            return;
        }

        if (code === demoCode) {
            setMessage({ text: "Xác minh mã thành công.", type: "success" });
            setTimeout(() => {
                navigate("/login/resetpass");
            }, 500);
        } else {
            setMessage({ text: "Mã xác minh không hợp lệ.", type: "error" });
        }
    };

    return (
        <AuthLayout
            title="Quên mật khẩu"
            subtitle="Nhập email để nhận mã xác minh."
        >
            <form className="auth-form">
                <div className="auth-note">
                    Nhập email đã đăng ký, sau đó nhấn gửi mã. Các ô nhập mã xác minh
                    sẽ hiển thị bên dưới.
                </div>

                <div className="auth-field">
                    <label htmlFor="forgot-email">Email</label>
                    <input
                        id="forgot-email"
                        type="email"
                        placeholder="Nhập email đã đăng ký"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                {!isCodeSent ? (
                    <button
                        type="button"
                        className="auth-button"
                        onClick={handleSendCode}
                    >
                        Gửi mã
                    </button>
                ) : (
                    <div className="auth-code-section">
                        <div className="auth-code-title">Nhập mã xác minh</div>

                        <div className="auth-code-inputs">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength="1"
                                    value={digit}
                                    className={digit ? "filled" : ""}
                                    onChange={(e) => handleOtpChange(e.target.value, index)}
                                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                                    aria-label={`Số thứ ${index + 1} của mã xác minh`}
                                />
                            ))}
                        </div>

                        <button
                            type="button"
                            className="auth-button"
                            onClick={handleVerifyCode}
                        >
                            Xác minh mã
                        </button>

                        <button
                            type="button"
                            className="auth-button-secondary"
                            onClick={handleSendCode}
                        >
                            Gửi lại mã
                        </button>
                    </div>
                )}

                {message.text && (
                    <div
                        className={message.type === "success" ? "auth-success" : "auth-error"}
                    >
                        {message.text}
                    </div>
                )}

                <div className="auth-footer">
                    Đã nhớ mật khẩu? <Link to="/login">Quay lại đăng nhập</Link>
                </div>
            </form>
        </AuthLayout>
    );
}

export default ForgotPassword;