import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import AuthLayout from "./AuthLayout";
import "./Login.css";

function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
    };

    return (
        <AuthLayout
            title="Login"
            subtitle="Sign in to continue accessing your learning dashboard."
        >
            <form className="auth-form" onSubmit={handleSubmit}>
                <div className="auth-field">
                    <label htmlFor="login-email">Email</label>
                    <input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email"
                    />
                </div>

                <div className="auth-field">
                    <label htmlFor="login-password">Password</label>

                    <div className="auth-password-wrapper">
                        <input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                        />

                        <button
                            type="button"
                            className="auth-password-toggle"
                            onClick={() => setShowPassword((prev) => !prev)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                        </button>
                    </div>
                </div>

                <div className="auth-row">
                    <label className="auth-remember">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <span>Remember me</span>
                    </label>

                    <Link to="/login/forgotpass" className="auth-link">
                        Forgot password?
                    </Link>
                </div>

                <button type="submit" className="auth-button">
                    Sign In
                </button>

            </form>
        </AuthLayout>
    );
}

export default Login;