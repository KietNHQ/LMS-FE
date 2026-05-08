import React, { useState, Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar";
import { LoadingAnimationBook } from "../../components/common";
import { useGetMe } from "../../hooks/useAuth";
import ChangePasswordDialog from "../../components/common/Dialog/ChangePasswordDialog/ChangePasswordDialog";
import "./ManagementLayout.css";

/**
 * ManagementLayout - Layout chung duy nhất cho tất cả cán bộ nhân viên.
 */
export default function ManagementLayout() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();
    const [isPageTransitioning, setIsPageTransitioning] = useState(false);
    const [forcePasswordChange, setForcePasswordChange] = useState(false);
    
    // Lắng nghe sự kiện bắt buộc đổi mật khẩu từ axiosClient
    useEffect(() => {
        const handleForceChange = () => setForcePasswordChange(true);
        window.addEventListener("require-password-change", handleForceChange);
        return () => window.removeEventListener("require-password-change", handleForceChange);
    }, []);
    // Tự động đồng bộ thông tin người dùng và quyền hạn từ Server
    const { data: latestUser } = useGetMe();

    // Hiệu ứng "Quyển sách" mỗi khi đổi trang (đáp ứng yêu cầu trải nghiệm mượt mà)
    useEffect(() => {
        setIsPageTransitioning(true);
        const timer = setTimeout(() => {
            setIsPageTransitioning(false);
        }, 600); // Thời gian hiển thị quyển sách lật trang

        return () => clearTimeout(timer);
    }, [location.pathname]);

    // [NEW] Fetch notification count on layout mount to sync sidebar badge
    useEffect(() => {
        const syncNotificationCount = async () => {
            try {
                // Management roles (Principal, etc.) use admin notification system
                const { adminApiService } = await import("../../services/pages/admin/generated/adminApiService");
                
                let response;
                try {
                    response = await adminApiService.get_notifications({ mock: false });
                } catch (err) {
                    console.warn("Real Management Notifications API failed, trying mock:", err);
                    response = await adminApiService.get_notifications({ mock: true });
                }
                
                if (response.success) {
                    const data = response.data || [];
                    const unreadCount = Array.isArray(data) ? data.filter(n => 
                        n.unread === true || n.is_read === false || n.status === "unread"
                    ).length : 0;
                    
                    const finalCount = unreadCount || (response.isMock ? 8 : 0);
                    localStorage.setItem("admin_unread_notifications_count", String(finalCount));
                    window.dispatchEvent(
                        new CustomEvent("admin-notification-count-updated", {
                            detail: finalCount,
                        })
                    );
                }
            } catch (err) {
                console.warn("Failed to sync management notification count:", err);
            }
        };
        syncNotificationCount();
    }, []);

    // Tạm thời đọc từ localStorage
    const storedUser = (() => {
        try {
            const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
            return JSON.parse(userStr || "{}");
        } catch {
            return {};
        }
    })();

    const userToUse = latestUser || storedUser;
    const userName = userToUse.fullName || userToUse.name || userToUse.email?.split("@")[0] || "Người dùng";
    const userEmail = userToUse.email || "";
    const userPermissions = userToUse.permissions || null;

    return (
        <div className={`management-layout ${isCollapsed ? "collapsed" : ""}`}>
            <Sidebar
                role="management"
                user={userToUse}
                userName={userName}
                userEmail={userEmail}
                userPermissions={userPermissions}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
            />

            <main className="management-layout__main">
                <div className="management-layout__content">
                    {isPageTransitioning ? (
                        <div className="layout-loading-wrapper">
                            <LoadingAnimationBook size="lg" label="Đang chuyển trang..." />
                        </div>
                    ) : (
                        <Suspense fallback={
                            <div className="layout-loading-wrapper">
                                <LoadingAnimationBook size="lg" label="Đang tải dữ liệu..." />
                            </div>
                        }>
                            <Outlet />
                        </Suspense>
                    )}
                </div>
            </main>

            {/* MANDATORY PASSWORD CHANGE DIALOG */}
            {(userToUse.requirePasswordChange || forcePasswordChange) && (
                <ChangePasswordDialog
                    open={true}
                    role="management"
                    isMandatory={true}
                    onClose={() => {
                        // Sau khi đổi thành công, reload để cập nhật trạng thái mới
                        window.location.reload();
                    }}
                />
            )}
        </div>
    );
}

