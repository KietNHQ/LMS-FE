import React, { useState, Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import Sidebar from "../../components/sidebar/Sidebar";
import { LoadingAnimationBook } from "../../components/common";
import { useGetMe } from "../../hooks/useAuth";
import teacherService from "../../services/pages/teacher/teacherService";
import { useSchoolYearContext } from "../../context/SchoolYearContext";
import ChangePasswordDialog from "../../components/common/Dialog/ChangePasswordDialog/ChangePasswordDialog";
import "./TeacherLayout.css";
import { formatName } from "../../utils/nameUtils";


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

    // Tự động đồng bộ thông tin người dùng và quyền hạn từ Server
    const { data: latestUser } = useGetMe();
    const queryClient = useQueryClient();
    const { selectedSchoolYear, selectedTerm } = useSchoolYearContext();

    // [NEW] Background JS Chunk Prefetching
    useEffect(() => {
        // Prefetch critical component chunks
        const prefetchChunks = () => {
            import("../../pages/teacher/lessons/TeacherLessons");
            import("../../pages/teacher/teachingClasses/TeacherTeachingClasses");
            import("../../pages/teacher/homeroom/TeacherHomeroom");
            import("../../pages/teacher/schedule/TeacherSchedule");
            import("../../pages/teacher/grades/TeacherGrades");
            import("../../pages/teacher/quiz/TeacherQuiz");
        };
        
        // Use requestIdleCallback if available, otherwise timeout
        if (window.requestIdleCallback) {
            window.requestIdleCallback(prefetchChunks);
        } else {
            setTimeout(prefetchChunks, 2000);
        }
    }, []);

    // [NEW] Hệ thống Load ngầm (Prefetching) để tăng tốc độ phản hồi khi chuyển trang
    useEffect(() => {
        if (!latestUser) return;

        const teacherId = latestUser.profile?.id || latestUser.id;

        const prefetchData = async () => {
            // Parallelize all data prefetching with Promise.allSettled
            await Promise.allSettled([
                // 1. Teaching Classes - MUST MATCH TeacherTeachingClasses.jsx KEY
                queryClient.prefetchQuery({
                    queryKey: ["teacher-teaching-classes", teacherId, selectedSchoolYear],
                    queryFn: async () => {
                        try {
                            const res = await teacherService.getConsolidatedTeachingClasses({
                                params: { schoolYear: selectedSchoolYear }
                            });
                            if (res.success) return res;
                        } catch (e) {}
                        return teacherService.getTeacherSubjects({ 
                            pathParams: { id: teacherId },
                            params: { schoolYear: selectedSchoolYear }
                        });
                    },
                    staleTime: 5 * 60 * 1000,
                }),

                // 2. Homeroom - MUST MATCH TeacherHomeroom.jsx KEY
                queryClient.prefetchQuery({
                    queryKey: ["teacher-homeroom", teacherId, selectedSchoolYear],
                    queryFn: async () => {
                        try {
                            const res = await teacherService.getConsolidatedHomeroom({
                                pathParams: { id: teacherId },
                                params: { schoolYear: selectedSchoolYear }
                            });
                            if (res.success) return res;
                        } catch (e) {}
                        return teacherService.getHomeroomClasses({ pathParams: { id: teacherId } });
                    },
                    staleTime: 5 * 60 * 1000,
                }),

                // 3. Lessons
                queryClient.prefetchQuery({
                    queryKey: ["teacher-lessons", selectedSchoolYear, selectedTerm],
                    queryFn: () => teacherService.listLessons({
                        params: { schoolYear: selectedSchoolYear, term: selectedTerm }
                    }),
                    staleTime: 5 * 60 * 1000,
                }),

                // 4. Quizzes
                queryClient.prefetchQuery({
                    queryKey: ["teacher-quizzes", 1, 10], 
                    queryFn: () => teacherService.listQuizzes({
                        params: { page: 1, limit: 10 }
                    }),
                    staleTime: 5 * 60 * 1000,
                }),

                // 5. Schedule - Prepare for useQuery migration
                queryClient.prefetchQuery({
                    queryKey: ["teacher-schedule", teacherId, selectedSchoolYear, selectedTerm],
                    queryFn: () => teacherService.getTimetable({
                        params: { schoolYear: selectedSchoolYear, term: selectedTerm }
                    }),
                    staleTime: 5 * 60 * 1000,
                })
            ]);
        };

        prefetchData();
    }, [latestUser, selectedSchoolYear, selectedTerm, queryClient]);

    // [NEW] Fetch notification count on layout mount and then poll every 2 minutes
    useEffect(() => {
        const syncNotificationCount = async () => {
            try {
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
                }
            } catch (err) {
                console.error("Failed to sync teacher notification count:", err);
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
    const userName = formatName(userToUse, { fallback: "Giáo viên" });
    const userEmail = userToUse.email || "";

    return (
        <div className={`teacher-layout theme-teacher ${isCollapsed ? "collapsed" : ""}`}>
            <Sidebar
                role="teacher"
                user={userToUse}
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


