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
    const [message, setMessage] = useState("");

    const demoCode = "123456";

    const handleSendCode = (e) => {
        e.preventDefault();

        if (!email.trim()) {
            setMessage("Please enter your email first.");
            return;
        }

        setIsCodeSent(true);
        setMessage("Verification code has been sent to your email.");
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
            setMessage("Please enter the full 6-digit code.");
            return;
        }

        if (code === demoCode) {
            setMessage("Code verified successfully.");
            setTimeout(() => {
                navigate("/login/resetpass");
            }, 500);
        } else {
            setMessage("Invalid verification code.");
        }
    };

    return (
        <AuthLayout
            title="Forgot Password"
            subtitle="Enter your email and we will send you a verification code."
        >
            <form className="auth-form">
                <div className="auth-note">
                    Enter your registered email, then press send code. After that, the
                    verification fields will appear below.
                </div>

                <div className="auth-field">
                    <label htmlFor="forgot-email">Email</label>
                    <input
                        id="forgot-email"
                        type="email"
                        placeholder="Enter your registered email"
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
                        Send Code
                    </button>
                ) : (
                    <div className="auth-code-section">
                        <div className="auth-code-title">Enter verification code</div>

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
                                />
                            ))}
                        </div>

                        <button
                            type="button"
                            className="auth-button"
                            onClick={handleVerifyCode}
                        >
                            Verify Code
                        </button>

                        <button
                            type="button"
                            className="auth-button-secondary"
                            onClick={handleSendCode}
                        >
                            Resend Code
                        </button>
                    </div>
                )}

                {message && (
                    <div
                        className={
                            message.toLowerCase().includes("success") ||
                            message.toLowerCase().includes("sent")
                                ? "auth-success"
                                : "auth-error"
                        }
                    >
                        {message}
                    </div>
                )}

                <div className="auth-footer">
                    Remember your password? <Link to="/login">Back to login</Link>
                </div>
            </form>
        </AuthLayout>
    );
}

export default ForgotPassword;