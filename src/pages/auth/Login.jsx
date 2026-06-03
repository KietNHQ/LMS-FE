import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import AuthLayout from "../../layouts/auth/AuthLayout.jsx";
import { useLogin } from "../../hooks/useAuth";
import { LoadingAnimationBook, LoadingSpinner } from "../../components/common";
import { toast } from "react-toastify";
import "./Login.css";

const LOGIN_ENTRY_LOADER_KEY = "login-entry-loader-seen";

function Login() {
    const [isCardLoading, setIsCardLoading] = useState(() => {
        if (typeof window === "undefined") {
            return false;
        }

        return sessionStorage.getItem(LOGIN_ENTRY_LOADER_KEY) !== "1";
    });
    const [showSubmitSpinner, setShowSubmitSpinner] = useState(false);
    const submitSpinnerTimerRef = useRef(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    // State lưu lỗi mật khẩu từ Frontend
    const [passwordError, setPasswordError] = useState("");

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const loginMutation = useLogin();
    const isSubmitting = loginMutation.isPending;

    // Show toast when redirected due to expired token
    useEffect(() => {
        if (searchParams.get("expired") === "true") {
            toast.warning("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            // Clean up the URL param without reloading
            window.history.replaceState({}, "", "/login");
        }
    }, [searchParams]);

    useEffect(() => {
        if (!isCardLoading) {
            return;
        }

        const timer = setTimeout(() => {
            setIsCardLoading(false);
            sessionStorage.setItem(LOGIN_ENTRY_LOADER_KEY, "1");
        }, 120);

        return () => clearTimeout(timer);
    }, [isCardLoading]);

    useEffect(() => {
        // Don't redirect if this page was reached due to expired token
        if (searchParams.get("expired") === "true") return;

        // AUTO-REDIRECT NẾU ĐÃ ĐĂNG NHẬP
        const sessionToken = sessionStorage.getItem("accessToken");
        const localToken = localStorage.getItem("accessToken");
        const isPersistent = localStorage.getItem("isPersistent") === "true";
        
        // Chỉ tự động vào nếu: 
        // 1. Có token trong session (đang mở tab)
        // 2. HOẶC có token trong local VÀ đã tích "Ghi nhớ"
        const validToken = sessionToken || (isPersistent && localToken);
        const userString = sessionToken ? sessionStorage.getItem("user") : (isPersistent ? localStorage.getItem("user") : null);
        
        if (validToken && userString) {
            try {
                const user = JSON.parse(userString);
                const role = user.role?.toLowerCase();
                
                if (role === 'admin' || role === 'quản trị viên' || role === 'administrator') {
                    navigate('/admin/dashboard', { replace: true });
                } else if (role === 'manager' || role === 'management' || ['quản lý', 'hiệu trưởng', 'phó ht học vụ', 'phó ht nề nếp', 'giáo vụ', 'tài chính', 'tổ trưởng bộ môn'].includes(role)) {
                    navigate('/management/dashboard', { replace: true });
                } else if (role === 'teacher' || role === 'giáo viên') {
                    navigate('/teacher/dashboard', { replace: true });
                } else if (role === 'student' || role === 'học sinh') {
                    navigate('/student/dashboard', { replace: true });
                } else if (role === 'guardian' || role === 'parent' || role === 'phụ huynh') {
                    navigate('/parent/dashboard', { replace: true });
                }
            } catch (e) {
                console.error("Lỗi parse user:", e);
            }
        }

        return () => {
            if (submitSpinnerTimerRef.current) {
                clearTimeout(submitSpinnerTimerRef.current);
            }
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setPasswordError(""); // Reset lỗi FE

        // [CRITICAL] Xóa sạch mọi dấu vết cũ trước khi đăng nhập mới
        // Điều này đảm bảo không có token Admin/Management cũ nào bị "kẹt" lại
        localStorage.clear();
        sessionStorage.clear();

        // Validate FE: Kiểm tra độ dài mật khẩu
        if (password.length < 6) {
            setPasswordError("Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }

        // Avoid flashing spinner for very fast responses.
        setShowSubmitSpinner(false);
        if (submitSpinnerTimerRef.current) {
            clearTimeout(submitSpinnerTimerRef.current);
        }

        submitSpinnerTimerRef.current = setTimeout(() => {
            setShowSubmitSpinner(true);
        });

        // Gọi API lên BE
        try {
            await loginMutation.mutateAsync({ email, password, rememberMe });
        } catch {
            // onError trong hook đã xử lý toast.
        } finally {
            if (submitSpinnerTimerRef.current) {
                clearTimeout(submitSpinnerTimerRef.current);
                submitSpinnerTimerRef.current = null;
            }
            setShowSubmitSpinner(false);
        }
    };

    // Bắt lỗi từ Backend trả về
    const serverError = loginMutation.error?.response?.data?.error;

    // Gom chung lỗi FE và BE lại để hiển thị
    const displayError = passwordError || serverError;

    return (
        <AuthLayout
            title="Đăng nhập"
            subtitle="Đăng nhập để tiếp tục truy cập bảng điều khiển học tập."
        >
            {isCardLoading ? (
                <div className="login-entry-loader" role="status" aria-live="polite">
                    <LoadingAnimationBook label="Đang tải trang đăng nhập..." size="md" />
                </div>
            ) : (
            <form className="auth-form" onSubmit={handleSubmit}>

                <div className="auth-field">
                    <label htmlFor="login-email">Email</label>
                    <input
                        id="login-email"
                        type="email"
                        placeholder="Nhập email của bạn"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            loginMutation.reset(); // Xóa lỗi BE khi user gõ email mới
                        }}
                        disabled={isSubmitting}
                        required
                    />
                </div>

                <div className="auth-field">
                    <label htmlFor="login-password">Mật khẩu</label>

                    <div className="auth-password-wrapper">
                        <input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Nhập mật khẩu"
                            value={password}
                            className={displayError ? "input-error" : ""}
                            autoComplete="current-password"
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setPasswordError("");
                                loginMutation.reset();
                            }}
                            disabled={isSubmitting}
                            required
                        />

                        <button
                            type="button"
                            className="auth-password-toggle"
                            onClick={() => setShowPassword((prev) => !prev)}
                            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                            disabled={isSubmitting}
                        >
                            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                        </button>
                    </div>

                    {/* THÊM MỚI: Dòng chữ báo lỗi đỏ dưới textbox */}
                    {displayError && (
                        <span className="error-text">{displayError}</span>
                    )}
                </div>

                <div className="auth-row">
                    <label className="auth-remember">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            disabled={isSubmitting}
                        />
                        <span>Ghi nhớ đăng nhập</span>
                    </label>

                    <Link to="/login/forgotpass" className="auth-link">
                        Quên mật khẩu?
                    </Link>
                </div>

                <button
                    type="submit"
                    className="auth-button"
                    disabled={isSubmitting}
                >
                    {isSubmitting && showSubmitSpinner ? (
                        <LoadingSpinner size="sm" label="Đang đăng nhập..." />
                    ) : (
                        "Đăng nhập"
                    )}
                </button>

            </form>
            )}
        </AuthLayout>
    );
}

export default Login;
