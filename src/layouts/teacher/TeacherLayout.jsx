import React, { useState, Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar";
import { LoadingAnimationBook } from "../../components/common";
import ChangePasswordDialog from "../../components/common/Dialog/ChangePasswordDialog/ChangePasswordDialog";
import "./TeacherLayout.css";

export default function TeacherLayout() {
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

    // [NEW] Fetch notification count on layout mount to sync sidebar badge
    useEffect(() => {
        const syncNotificationCount = async () => {
            try {
                const { default: teacherService } = await import("../../services/pages/teacher/teacherService");
                
                const response = await teacherService.getNotifications({ mock: false });
                
                if (response.success && response.data) {
                    const unreadCount = response.data.filter(n => 
                        n.unread === true || n.is_read === false || n.status === "unread"
                    ).length;
                    
                    localStorage.setItem("teacher_unread_notifications_count", String(unreadCount));
                    window.dispatchEvent(
                        new CustomEvent("teacher-notification-count-updated", {
                            detail: unreadCount,
                        })
                    );
                } else {
                    localStorage.setItem("teacher_unread_notifications_count", "0");
                    window.dispatchEvent(new CustomEvent("teacher-notification-count-updated", { detail: 0 }));
                }
            } catch (err) {
                console.error("Failed to sync real teacher notification count:", err);
                localStorage.setItem("teacher_unread_notifications_count", "0");
                window.dispatchEvent(new CustomEvent("teacher-notification-count-updated", { detail: 0 }));
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

    const userName = storedUser.fullName || storedUser.name || "Giáo viên";
    const userEmail = storedUser.email || "";

    return (
        <div className={`teacher-layout theme-teacher ${isCollapsed ? "collapsed" : ""}`}>
            <Sidebar
                role="teacher"
                user={storedUser}
                userName={userName}
                userEmail={userEmail}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
            />

            <main className="teacher-layout__main">
                <div className="teacher-layout__content">
                    {isPageTransitioning ? (
                        <div className="layout-loading-wrapper">
                            <LoadingAnimationBook size="lg" label="Đang chuyển trang..." />
                        </div>
                    ) : (
                        <Suspense fallback={
                            <div className="layout-loading-wrapper">
                                <LoadingAnimationBook size="lg" label="Đang tải dữ liệu giảng dạy..." />
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
                    role="teacher"
                    isMandatory={true}
                    onClose={() => {
                        window.location.reload();
                    }}
                />
            )}
        </div>
    );
}


