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
