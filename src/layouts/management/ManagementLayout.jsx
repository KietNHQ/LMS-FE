import React, { useState, Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar";
import { LoadingAnimationBook } from "../../components/common";
import "./ManagementLayout.css";

/**
 * ManagementLayout - Layout chung duy nhất cho tất cả cán bộ nhân viên.
 */
export default function ManagementLayout() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();
    const [isPageTransitioning, setIsPageTransitioning] = useState(false);

    // Hiệu ứng "Quyển sách" mỗi khi đổi trang (đáp ứng yêu cầu trải nghiệm mượt mà)
    useEffect(() => {
        setIsPageTransitioning(true);
        const timer = setTimeout(() => {
            setIsPageTransitioning(false);
        }, 600); // Thời gian hiển thị quyển sách lật trang

        return () => clearTimeout(timer);
    }, [location.pathname]);

    // Tạm thời đọc từ localStorage
    const storedUser = (() => {
        try {
            return JSON.parse(localStorage.getItem("user") || "{}");
        } catch {
            return {};
        }
    })();

    const userName = storedUser.fullName || storedUser.name || storedUser.email?.split("@")[0] || "Người dùng";
    const userEmail = storedUser.email || "";
    const userPermissions = storedUser.permissions || null;

    return (
        <div className={`management-layout ${isCollapsed ? "collapsed" : ""}`}>
            <Sidebar
                role="management"
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
        </div>
    );
}
