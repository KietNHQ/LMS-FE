import React, { useState, Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar";
import { LoadingAnimationBook } from "../../components/common";
import "./AdminLayout.css";

export default function AdminLayout() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();
    const [isPageTransitioning, setIsPageTransitioning] = useState(false);

    // Hiệu ứng "Quyển sách" mỗi khi đổi trang trong Admin
    useEffect(() => {
        setIsPageTransitioning(true);
        const timer = setTimeout(() => {
            setIsPageTransitioning(false);
        }, 600);

        return () => clearTimeout(timer);
    }, [location.pathname]);

    // [NEW] Fetch notification count on layout mount to sync sidebar badge
    useEffect(() => {
        const syncNotificationCount = async () => {
            try {
                const { adminApiService } = await import("../../services/pages/admin/generated/adminApiService");
                
                let response;
                try {
                    response = await adminApiService.get_notifications({ mock: false });
                } catch (err) {
                    console.warn("Real Admin Notifications API failed, trying mock:", err);
                    response = await adminApiService.get_notifications({ mock: true });
                }
                
                if (response.success) {
                    const data = response.data || [];
                    const unreadCount = Array.isArray(data) ? data.filter(n => 
                        n.unread === true || n.is_read === false || n.status === "unread"
                    ).length : 0;
                    
                    const finalCount = unreadCount || (response.isMock ? 5 : 0);
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

    // Đọc từ localStorage
    const storedUser = (() => {
        try {
            const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
            return JSON.parse(userStr || "{}");
        } catch {
            return {};
        }
    })();

    const userName = storedUser.fullName || storedUser.name || "Quản trị viên";
    const userEmail = storedUser.email || "";

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
        </div>
    );
}

