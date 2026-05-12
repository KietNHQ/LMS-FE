import React, { useState, Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar";
import { LoadingAnimationBook } from "../../components/common";
import { useGetMe } from "../../hooks/useAuth";
import ChangePasswordDialog from "../../components/common/Dialog/ChangePasswordDialog/ChangePasswordDialog";
import "./StudentLayout.css";

export default function StudentLayout() {
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
                const { studentService } = await import("../../services/pages/student/studentService");
                
                let response;
                try {
                    response = await studentService.listNotifications({ mock: false });
                } catch (err) {
                    console.warn("Real Student Notifications API failed, trying mock:", err);
                    response = await studentService.listNotifications({ mock: true });
                }
                
                if (response.success && response.data) {
                    const unreadCount = response.data.filter(n => 
                        n.unread === true || n.is_read === false || n.status === "unread"
                    ).length;
                    
                    const finalCount = unreadCount || (response.isMock ? 3 : 0);
                    localStorage.setItem("student_unread_notifications_count", String(finalCount));
                    window.dispatchEvent(
                        new CustomEvent("student-notification-count-updated", {
                            detail: finalCount,
                        })
                    );
                }
            } catch (err) {
                console.warn("Failed to sync student notification count:", err);
            }
        };
        syncNotificationCount();
    }, []);

    // Đọc từ cả localStorage và sessionStorage
    const storedUser = (() => {
        try {
            const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
            return JSON.parse(userStr || "{}");
        } catch {
            return {};
        }
    })();

    const userToUse = latestUser || storedUser;
    const userName = userToUse.fullName || userToUse.name || "Học sinh";
    const userEmail = userToUse.email || "";

    return (
        <div className={`student-layout ${isCollapsed ? "collapsed" : ""}`}>
            <Sidebar
                role="student"
                user={userToUse}
                userName={userName}
                userEmail={userEmail}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
            />

            <main className="student-layout__main">
                <div className="student-layout__content">
                    {isPageTransitioning ? (
                        <div className="layout-loading-wrapper">
                            <LoadingAnimationBook size="lg" label="Đang lật trang..." />
                        </div>
                    ) : (
                        <Suspense fallback={
                            <div className="layout-loading-wrapper">
                                <LoadingAnimationBook size="lg" label="Đang tải dữ liệu học tập..." />
                            </div>
                        }>
                            <Outlet />
                        </Suspense>
                    )}
                </div>
            </main>

            {/* MANDATORY PASSWORD CHANGE DIALOG */}
            {(storedUser.requirePasswordChange || storedUser.require_password_change || forcePasswordChange) && (
                <ChangePasswordDialog
                    open={true}
                    role="student"
                    isMandatory={true}
                    onClose={() => {
                        window.location.reload();
                    }}
                />
            )}
        </div>
    );
}
