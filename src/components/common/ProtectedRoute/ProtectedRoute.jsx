import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

/**
 * ProtectedRoute - Bảo vệ đường dẫn dựa trên Auth, Role và Status
 * @param {Element} children - Component con được bảo vệ
 * @param {Array} allowedRoles - Danh sách các vai trò được phép truy cập
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
    const location = useLocation();
    
    // 1. Lấy thông tin từ Storage
    const accessToken = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    const userString = localStorage.getItem("user") || sessionStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;

    // 2. Kiểm tra nếu chưa đăng nhập
    if (!accessToken || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. KIỂM TRA TRẠNG THÁI TÀI KHOẢN (Tính năng ngăn đăng nhập thật)
    if (user.status === "Vô hiệu hóa") {
        // Xóa session để người dùng không thể thử lại bằng URL
        localStorage.clear();
        sessionStorage.clear();
        
        // Hiển thị thông báo (chỉ hiện 1 lần)
        if (!window.hasShownLockAlert) {
            toast.error("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên!");
            window.hasShownLockAlert = true;
            setTimeout(() => { window.hasShownLockAlert = false; }, 3000);
        }
        
        return <Navigate to="/login" replace />;
    }

    // 4. Kiểm tra quyền truy cập (Role)
    const userRole = user.role?.toLowerCase();
    
    // Chuẩn hóa role quản lý (vì có nhiều chức danh tiếng Việt)
    const managementRoles = ['quản trị viên', 'quản lý', 'hiệu trưởng', 'phó ht học vụ', 'phó ht nề nếp', 'giáo vụ', 'tài chính', 'tổ trưởng bộ môn'];
    
    let isAuthorized = false;
    
    if (!allowedRoles || allowedRoles.length === 0) {
        isAuthorized = true; // Không yêu cầu role cụ thể
    } else {
        const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase());
        
        // Nếu yêu cầu role 'admin' hoặc 'management'
        if (normalizedAllowedRoles.includes('admin') && userRole === 'admin') {
            isAuthorized = true;
        } else if (normalizedAllowedRoles.includes('management') && managementRoles.includes(userRole)) {
            isAuthorized = true;
        } else {
            isAuthorized = normalizedAllowedRoles.includes(userRole);
        }
    }

    if (!isAuthorized) {
        toast.warning("Bạn không có quyền truy cập vào khu vực này!");
        // Quay lại trang dashboard phù hợp với role của mình
        if (userRole === 'admin') return <Navigate to="/admin/dashboard" replace />;
        if (managementRoles.includes(userRole)) return <Navigate to="/management/dashboard" replace />;
        if (userRole === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
        if (userRole === 'student') return <Navigate to="/student/dashboard" replace />;
        if (userRole === 'guardian') return <Navigate to="/parent/dashboard" replace />;
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
