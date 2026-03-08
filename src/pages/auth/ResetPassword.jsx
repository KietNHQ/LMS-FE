import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import AuthLayout from "./AuthLayout";
import "./ResetPassword.css";

function ResetPassword() {
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
    };

    return (
        <AuthLayout
            title="Reset Password"
            subtitle="Create a new password and confirm it to continue."
        >
            <form className="auth-form" onSubmit={handleSubmit}>
                <div className="auth-field">
                    <label htmlFor="new-password">New Password</label>

                    <div className="auth-password-wrapper">
                        <input
                            id="new-password"
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Enter new password"
                        />

                        <button
                            type="button"
                            className="auth-password-toggle"
                            onClick={() => setShowNewPassword((prev) => !prev)}
                            aria-label={showNewPassword ? "Hide password" : "Show password"}
                        >
                            {showNewPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                        </button>
                    </div>
                </div>

                <div className="auth-field">
                    <label htmlFor="confirm-password">Confirm Password</label>

                    <div className="auth-password-wrapper">
                        <input
                            id="confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm new password"
                        />

                        <button
                            type="button"
                            className="auth-password-toggle"
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                            aria-label={
                                showConfirmPassword ? "Hide password" : "Show password"
                            }
                        >
                            {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                        </button>
                    </div>
                </div>

                <button type="submit" className="auth-button">
                    Reset Password
                </button>

                <div className="auth-footer">
                    Return to <Link to="/login">Login</Link>
                </div>
            </form>
        </AuthLayout>
    );
}

export default ResetPassword;