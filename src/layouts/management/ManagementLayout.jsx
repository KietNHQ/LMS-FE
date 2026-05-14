import React, { useState, Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import Sidebar from "../../components/sidebar/Sidebar";
import { LoadingAnimationBook } from "../../components/common";
import { useGetMe } from "../../hooks/useAuth";
import { principalService } from "../../services/pages/management/principal";
import { vpAcademicService } from "../../services/pages/management/vp-academic";
import { getCurrentSchoolYear, getCurrentTerm } from "../../utils/dateUtils";
import ChangePasswordDialog from "../../components/common/Dialog/ChangePasswordDialog/ChangePasswordDialog";
import "./ManagementLayout.css";
import { formatName } from "../../utils/nameUtils";


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
    const queryClient = useQueryClient();

    // [NEW] Background JS Chunk Prefetching
    useEffect(() => {
        const prefetchChunks = () => {
            import("../../pages/management/dashboard/index.js");
            import("../../pages/management/users/index.js");
            import("../../pages/management/classes/index.js");
            import("../../pages/management/grades/index.js");
            import("../../pages/management/timetable/index.js");
            import("../../pages/management/notifications/index.js");
        };
        
        if (window.requestIdleCallback) {
            window.requestIdleCallback(prefetchChunks);
        } else {
            setTimeout(prefetchChunks, 2000);
        }
    }, []);

    // [NEW] Hệ thống Load ngầm (Prefetching) cho Quản lý
    useEffect(() => {
        if (!latestUser) return;

        const schoolYear = getCurrentSchoolYear();
        const term = getCurrentTerm();

        const prefetchData = async () => {
            await Promise.allSettled([
                // 1. Prefetch Dashboard
                queryClient.prefetchQuery({
                    queryKey: ["management-dashboard", schoolYear, term],
                    queryFn: () => principalService.getDashboardOverview({
                        params: { schoolYear, term }
                    }),
                    staleTime: 5 * 60 * 1000,
                }),

                // 2. Prefetch Academic Stats (cho PHT Chuyên môn)
                queryClient.prefetchQuery({
                    queryKey: ["academic-stats", schoolYear, term],
                    queryFn: () => vpAcademicService.getAssessmentWorkflowStats(term, {
                        params: { schoolYearId: schoolYear },
                    }),
                    staleTime: 5 * 60 * 1000,
                })
            ]);
        };

        prefetchData();
    }, [latestUser, queryClient]);

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
                    // Ưu tiên dùng endpoint "my" để lấy thông báo cá nhân, tránh lỗi 403 nếu không phải Admin
                    response = await adminApiService.get_notifications_my({ mock: false });
                } catch (err) {
                    console.warn("Real Management Notifications API failed, trying mock:", err);
                    response = await adminApiService.get_notifications({ mock: true });
                }
                
                if (response.success) {
                    const data = response.data || [];
                    // Lấy unreadCount từ data (BE trả về data: [], unreadCount: x) hoặc tự tính
                    const unreadCount = response.unreadCount ?? (Array.isArray(data) ? data.filter(n => 
                        n.unread === true || n.is_read === false || n.status === "unread"
                    ).length : 0);
                    
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

    const baseUser = latestUser || storedUser;
    const userToUse = baseUser;
    const userName = formatName(userToUse, { fallback: "Người dùng" });
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

