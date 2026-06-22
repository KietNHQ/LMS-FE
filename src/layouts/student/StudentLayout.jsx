import React, { useState, Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import Sidebar from "../../components/sidebar/Sidebar";
import { LoadingAnimationBook } from "../../components/common";
import { useGetMe } from "../../hooks/useAuth";
import studentService from "../../services/pages/student/studentService";
import { getCurrentSchoolYear, getCurrentTerm } from "../../utils/dateUtils";
import ChangePasswordDialog from "../../components/common/Dialog/ChangePasswordDialog/ChangePasswordDialog";
import "./StudentLayout.css";
import { formatName } from "../../utils/nameUtils";


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
            import("../../pages/student/classes/StudentClasses");
            import("../../pages/student/grades/StudentGrades");
            import("../../pages/student/schedule/StudentSchedule");
            import("../../pages/student/quiz/StudentQuiz");
            import("../../pages/student/notification/StudentNotifications");
        };
        
        if (window.requestIdleCallback) {
            window.requestIdleCallback(prefetchChunks);
        } else {
            setTimeout(prefetchChunks, 2000);
        }
    }, []);

    // [NEW] Hệ thống Load ngầm (Prefetching) cho Học sinh
    useEffect(() => {
        if (!latestUser) return;

        const schoolYear = getCurrentSchoolYear();
        const term = getCurrentTerm();

        const prefetchData = async () => {
            // Parallelize all data prefetching
            await Promise.allSettled([
                // 1. Prefetch Dashboard
                queryClient.prefetchQuery({
                    queryKey: ["student-dashboard", schoolYear, term],
                    queryFn: () => studentService.getDashboard({
                        params: { schoolYear, term }
                    }),
                    staleTime: 5 * 60 * 1000,
                }),

                // 2. Prefetch Lớp học
                queryClient.prefetchQuery({
                    queryKey: ["student-classes"],
                    queryFn: () => studentService.listClasses(),
                    staleTime: 5 * 60 * 1000,
                }),

                // 3. Prefetch Thời khóa biểu - KEY MUST MATCH StudentSchedule.jsx
                queryClient.prefetchQuery({
                    queryKey: ["student-schedule", schoolYear, term],
                    queryFn: () => studentService.getStudentScheduleMapped({
                        mock: false,
                        params: { schoolYear, term }
                    }),
                    staleTime: 5 * 60 * 1000,
                }),

                // 4. Prefetch Quizzes
                queryClient.prefetchQuery({
                    queryKey: ["student-quizzes"],
                    queryFn: () => studentService.listQuizzes(),
                    staleTime: 5 * 60 * 1000,
                })
            ]);
        };

        prefetchData();
    }, [latestUser, queryClient]);

    // [NEW] Fetch notification count on layout mount and then poll every 2 minutes
    useEffect(() => {
        const syncNotificationCount = async () => {
            const hasAuth = !!(localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken"));
            if (!hasAuth) return;
            try {
                const response = await studentService.listNotifications({ mock: false });
                
                if (response.success && response.data) {
                    const unreadCount = response.data.filter(n => 
                        n.unread === true || n.is_read === false || n.status === "unread"
                    ).length;
                    
                    localStorage.setItem("student_unread_notifications_count", String(unreadCount));
                    window.dispatchEvent(
                        new CustomEvent("student-notification-count-updated", {
                            detail: unreadCount,
                        })
                    );
                }
            } catch (err) {
                console.warn("Failed to sync student notification count:", err);
            }
        };
        syncNotificationCount();
        
        // Setup polling every 2 minutes
        const intervalId = setInterval(syncNotificationCount, 120000);
        return () => clearInterval(intervalId);
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

    const userToUse = latestUser || storedUser;
    const userName = formatName(userToUse, { fallback: "Học sinh" });
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
