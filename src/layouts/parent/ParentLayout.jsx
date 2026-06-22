import React, { useState, Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import Sidebar from "../../components/sidebar/Sidebar";
import { LoadingAnimationBook } from "../../components/common";
import { parentService } from "../../services/pages/parent/parentService";
import { useGetMe } from "../../hooks/useAuth";
import ChangePasswordDialog from "../../components/common/Dialog/ChangePasswordDialog/ChangePasswordDialog";
import "./ParentLayout.css";
import { formatName } from "../../utils/nameUtils";


export default function ParentLayout() {
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

    const queryClient = useQueryClient();

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
            import("../../pages/parent/dashboard/ParentDashboard");
            import("../../pages/parent/children-overview/ParentChildrenOverview");
            import("../../pages/parent/notifications/ParentNotifications");
            import("../../pages/parent/messages/ParentMessages");
            import("../../pages/parent/payments/ParentPayments");
        };
        
        if (window.requestIdleCallback) {
            window.requestIdleCallback(prefetchChunks);
        } else {
            setTimeout(prefetchChunks, 2000);
        }
    }, []);

    // [NEW] Hệ thống Load ngầm (Prefetching) cho Phụ huynh
    useEffect(() => {
        const prefetchData = async () => {
            await Promise.allSettled([
                // 1. Prefetch danh sách con cái
                queryClient.prefetchQuery({
                    queryKey: ["parent-children"],
                    queryFn: () => parentService.listChildren({ mock: false }),
                    staleTime: 10 * 60 * 1000,
                }),
                
                // 2. Prefetch thông báo
                queryClient.prefetchQuery({
                    queryKey: ["parent-notifications"],
                    queryFn: () => parentService.listNotifications({ mock: false }),
                    staleTime: 2 * 60 * 1000,
                })
            ]);
        };

        prefetchData();
    }, [queryClient]);

    // [NEW] Fetch notification count on layout mount and then poll every 2 minutes
    useEffect(() => {
        const syncNotificationCount = async () => {
            try {
                const { parentService } = await import("../../services/pages/parent/parentService");
                
                const response = await parentService.listNotifications({ mock: false });
                
                if (response.success && response.data) {
                    const unreadCount = response.data.filter(n => 
                        n.unread === true || n.is_read === false || n.status === "unread"
                    ).length;
                    
                    const finalCount = unreadCount || 0;
                    localStorage.setItem("parent_unread_notifications_count", String(finalCount));
                    window.dispatchEvent(
                        new CustomEvent("parent-notification-count-updated", {
                            detail: finalCount,
                        })
                    );
                }
            } catch (err) {
                console.warn("Failed to sync parent notification count:", err);
            }
        };
        syncNotificationCount();
        
        // Setup polling every 2 minutes
        const intervalId = setInterval(syncNotificationCount, 120000);
        return () => clearInterval(intervalId);
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
    const userName = formatName(userToUse, { fallback: "Phụ huynh" });
    const userEmail = userToUse.email || "";

    return (
        <div className={`parent-layout theme-parent ${isCollapsed ? "collapsed" : ""}`}>
            <Sidebar
                role="parent"
                user={userToUse}
                userName={userName}
                userEmail={userEmail}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
            />

            <main className="parent-layout__main">
                <div className="parent-layout__content">
                    {isPageTransitioning ? (
                        <div className="layout-loading-wrapper">
                            <LoadingAnimationBook size="lg" label="Đang tải dữ liệu..." />
                        </div>
                    ) : (
                        <Suspense fallback={
                            <div className="layout-loading-wrapper">
                                <LoadingAnimationBook size="lg" label="Đang tải dữ liệu phụ huynh..." />
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
                    role="parent"
                    isMandatory={true}
                    onClose={() => {
                        window.location.reload();
                    }}
                />
            )}
        </div>
    );
}
