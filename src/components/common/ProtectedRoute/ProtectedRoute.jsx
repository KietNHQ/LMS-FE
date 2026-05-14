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
    
    // 1. Lấy thông tin từ Storage (Chỉ tin tưởng localStorage nếu isPersistent = true)
    const sessionToken = sessionStorage.getItem("accessToken");
    const localToken = localStorage.getItem("accessToken");
    const isPersistent = localStorage.getItem("isPersistent") === "true";
    
    const accessToken = sessionToken || (isPersistent ? localToken : null);
    
    const userString = sessionToken ? sessionStorage.getItem("user") : (isPersistent ? localStorage.getItem("user") : null);
    const user = userString ? JSON.parse(userString) : null;

    // 2. Kiểm tra nếu chưa đăng nhập
    if (!accessToken || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. KIỂM TRA TRẠNG THÁI TÀI KHOẢN (Tính năng ngăn đăng nhập thật)
    const isDisabled = user.status === "Vô hiệu hóa";

    // 4. Kiểm tra quyền truy cập (Role)
    const userRole = (user?.role || sessionStorage.getItem('userRole') || localStorage.getItem('userRole') || "").toLowerCase();

    // SUPER ADMIN BYPASS: Admin/Quản trị viên có quyền vào MỌI NƠI
    const isSuperAdmin = userRole === 'admin' || userRole === 'quản trị viên' || userRole === 'administrator';
    
    // Chuẩn hóa role quản lý (vì có nhiều chức danh tiếng Việt)
    const managementRoles = ['manager', 'management', 'quản lý', 'hiệu trưởng', 'phó ht học vụ', 'phó ht nề nếp', 'giáo vụ', 'tài chính', 'tổ trưởng bộ môn'];
    
    let isAuthorized = false;
    
    if (isSuperAdmin) {
        isAuthorized = true;
    } else if (!allowedRoles || allowedRoles.length === 0) {
        isAuthorized = true; // Không yêu cầu role cụ thể
    } else {
        const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase());
        
        // Nếu yêu cầu role 'admin' hoặc 'management'
        if (normalizedAllowedRoles.includes('admin') && isSuperAdmin) {
            isAuthorized = true;
        } else if (normalizedAllowedRoles.includes('management') && managementRoles.includes(userRole)) {
            isAuthorized = true;
        } else {
            isAuthorized = normalizedAllowedRoles.includes(userRole);
        }
    }

    // Effect để hiển thị thông báo (tránh lỗi render phase)
    React.useEffect(() => {
        if (isDisabled) {
            if (!window.hasShownLockAlert) {
                toast.error("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên!");
                window.hasShownLockAlert = true;
                setTimeout(() => { window.hasShownLockAlert = false; }, 3000);
            }
        } else if (!isAuthorized) {
            toast.warning("Bạn không có quyền truy cập vào khu vực này!");
        }
    }, [isDisabled, isAuthorized]);

    // Xử lý chuyển hướng
    if (isDisabled) {
        localStorage.clear();
        sessionStorage.clear();
        return <Navigate to="/login" replace />;
    }

    if (!isAuthorized) {
        // Quay lại trang dashboard phù hợp với role của mình
        if (isSuperAdmin) 
            return <Navigate to="/admin/dashboard" replace />;
            
        if (managementRoles.includes(userRole)) 
            return <Navigate to="/management/dashboard" replace />;
            
        if (userRole === 'teacher' || userRole === 'giáo viên') 
            return <Navigate to="/teacher/dashboard" replace />;
            
        if (userRole === 'student' || userRole === 'học sinh') 
            return <Navigate to="/student/dashboard" replace />;
            
        if (userRole === 'guardian' || userRole === 'parent' || userRole === 'phụ huynh') 
            return <Navigate to="/parent/dashboard" replace />;
            
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;

