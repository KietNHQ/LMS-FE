import React, { useState, Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar";
import { LoadingAnimationBook } from "../../components/common";
import "./ParentLayout.css";

export default function ParentLayout() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();
    const [isPageTransitioning, setIsPageTransitioning] = useState(false);

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
                const { parentService } = await import("../../services/pages/parent/parentService");
                
                let response;
                try {
                    response = await parentService.listNotifications({ mock: false });
                } catch (err) {
                    console.warn("Real Parent Notifications API failed, trying mock:", err);
                    response = await parentService.listNotifications({ mock: true });
                }
                
                if (response.success && response.data) {
                    const unreadCount = response.data.filter(n => 
                        n.unread === true || n.is_read === false || n.status === "unread"
                    ).length;
                    
                    const finalCount = unreadCount || (response.isMock ? 2 : 0);
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
    }, []);

    // Đọc từ localStorage
    const storedUser = (() => {
        try {
            return JSON.parse(localStorage.getItem("user") || "{}");
        } catch {
            return {};
        }
    })();

    const userName = storedUser.fullName || storedUser.name || "Phụ huynh";
    const userEmail = storedUser.email || "";

    return (
        <div className={`parent-layout ${isCollapsed ? "collapsed" : ""}`}>
            <Sidebar
                role="parent"
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
        </div>
    );
}
