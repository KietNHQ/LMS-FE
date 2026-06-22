import React, { useState, Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import Sidebar from "../../components/sidebar/Sidebar";
import { LoadingAnimationBook } from "../../components/common";
import { useGetMe } from "../../hooks/useAuth";
import { adminDashboardService } from "../../services/pages/admin/dashboard/dashboardService";
import "./AdminLayout.css";
import { formatName } from "../../utils/nameUtils";
import ChangePasswordDialog from "../../components/common/Dialog/ChangePasswordDialog/ChangePasswordDialog";


export default function AdminLayout() {
    const queryClient = useQueryClient();
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

    useEffect(() => {
        setIsPageTransitioning(true);
        const timer = setTimeout(() => {
            setIsPageTransitioning(false);
        }, 600);

        return () => clearTimeout(timer);
    }, [location.pathname]);

    // [NEW] Background JS Chunk Prefetching
    useEffect(() => {
        const prefetchChunks = () => {
            import("../../pages/admin/dashboard/AdminDashboard");
            import("../../pages/management/users/ManagementUsers");
            import("../../pages/management/notifications/ManagementNotifications");
            import("../../pages/admin/audit-log/AdminAuditLog");
            import("../../pages/admin/system-log/AdminSystemLog");
        };

        if (window.requestIdleCallback) {
            window.requestIdleCallback(prefetchChunks);
        } else {
            setTimeout(prefetchChunks, 2000);
        }
    }, []);

    // [NEW] Hệ thống Load ngầm (Prefetching) cho Admin
    useEffect(() => {
        const prefetchData = async () => {
            await Promise.allSettled([
                // 1. Prefetch Dashboard
                queryClient.prefetchQuery({
                    queryKey: ["admin-dashboard"],
                    queryFn: () => adminDashboardService.getDashboardOverview(),
                    staleTime: 5 * 60 * 1000,
                })
            ]);
        };

        prefetchData();
    }, [queryClient]);

    // [NEW] Fetch notification count on layout mount to sync sidebar badge
    useEffect(() => {
        const syncNotificationCount = async () => {
            try {
                const { adminApiService } = await import("../../services/pages/admin/generated/adminApiService");

                const response = await adminApiService.get_notifications({ mock: false });

                if (response.success) {
                    const data = response.data || [];
                    const unreadCount = Array.isArray(data) ? data.filter(n =>
                        n.unread === true || n.is_read === false || n.status === "unread"
                    ).length : 0;

                    const finalCount = unreadCount || 0;
                    localStorage.setItem("admin_unread_notifications_count", String(finalCount));
                    window.dispatchEvent(
                        new CustomEvent("admin-notification-count-updated", {
                            detail: finalCount,
                        })
                    );
                }
            } catch (err) {
                console.warn("Failed to sync admin notification count:", err);
            }
        };
        syncNotificationCount();
    }, []);

    // Tự động đồng bộ thông tin người dùng và quyền hạn từ Server
    const { data: latestUser } = useGetMe();

    // Đọc thông tin người dùng: Chỉ tin tưởng localStorage nếu isPersistent = true
    const storedUser = (() => {
        try {
            const isPersistent = localStorage.getItem("isPersistent") === "true";
            const userStr = sessionStorage.getItem("user") || (isPersistent ? localStorage.getItem("user") : null);
            return JSON.parse(userStr || "{}");
        } catch {
            return {};
        }
    })();

    const userToUse = latestUser || storedUser;
    const userName = formatName(userToUse, { fallback: "Quản trị viên" });
    const userEmail = userToUse.email || "";
    const userPermissions = userToUse.permissions || null;

    return (
        <div className={`admin-layout ${isCollapsed ? "collapsed" : ""}`}>
            <Sidebar
                role="admin"
                user={storedUser}
                userName={userName}
                userEmail={userEmail}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
                userPermissions={storedUser.permissions} // Truyền permissions từ BE xuống
            />

            <main className="admin-layout__main">
                <div className="admin-layout__content">
                    {isPageTransitioning ? (
                        <div className="layout-loading-wrapper">
                            <LoadingAnimationBook size="lg" label="Đang chuyển hướng..." />
                        </div>
                    ) : (
                        <Suspense fallback={
                            <div className="layout-loading-wrapper">
                                <LoadingAnimationBook size="lg" label="Đang tải..." />
                            </div>
                        }>
                            <Outlet />
                        </Suspense>
                    )}
                </div>
            </main>

            {/* MANDATORY PASSWORD CHANGE DIALOG */}
            {(userToUse.requirePasswordChange || userToUse.require_password_change || forcePasswordChange) && (
                <ChangePasswordDialog
                    open={true}
                    role="admin"
                    isMandatory={true}
                    onClose={() => {
                        window.location.reload();
                    }}
                />
            )}
        </div>
    );
}

