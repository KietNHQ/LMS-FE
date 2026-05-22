import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import "./StudentDashboard.css";
import {
    HiOutlineTrophy,
    HiOutlineCalendarDays,
    HiOutlineClock,
    HiOutlineClipboardDocumentList,
} from "react-icons/hi2";
import WelcomeHeader from "./components/WelcomeHeader/WelcomeHeader";
import StatsCards from "./components/StatsCards/StatsCards";
import EventCalendar from "../../../components/common/EventCalendar/EventCalendar";
import { CALENDAR_EVENT_TYPES } from "../../../components/common/EventCalendar/eventData";
import SubjectRadar from "./components/SubjectRadar/SubjectRadar";
import YearProgress from "./components/YearProgress/YearProgress";
import UpcomingTests from "./components/UpcomingTests/UpcomingTests";
import { SchoolYearTermSelector, LoadingSpinner } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { studentService } from "../../../services/pages/student/studentService";

export default function StudentDashboard() {
    const navigate = useNavigate();
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [localProfile, setLocalProfile] = useState(null);

    // 1. Lấy thông tin từ localStorage/sessionStorage ngay khi mount
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "{}");
        if (storedUser?.profile) {
            setLocalProfile(storedUser.profile);
        }
    }, []);

    // 2. Sử dụng TanStack Query để quản lý dữ liệu dashboard
    const { data: response, isLoading } = useQuery({
        queryKey: ["student-dashboard", selectedSchoolYear, selectedTerm],
        queryFn: () => studentService.getDashboard({ 
            mock: false,
            params: { schoolYear: selectedSchoolYear, term: selectedTerm }
        }),
        staleTime: 5 * 60 * 1000,
    });

    const dashboardData = response?.success ? response.data : null;

    // 2. Xử lý các con số thống kê (Stats)
    const statsCards = useMemo(() => {
        const avg = dashboardData?.summary?.averageScore || 0;
        const totalWeeks = dashboardData?.summary?.totalWeeks || 35;
        const completedWeeks = dashboardData?.summary?.completedWeeks || 0;
        const weekProgress = totalWeeks > 0 ? Math.round((completedWeeks / totalWeeks) * 100) : 0;
        
        return [
            {
                id: "summary",
                title: "Điểm trung bình học kỳ",
                value: avg.toFixed(2),
                subtitle: (
                    <>
                        Học lực: <strong className="student-rank-strong">{avg >= 8 ? "Giỏi" : avg >= 6.5 ? "Khá" : "Trung bình"}</strong>
                    </>
                ),
                icon: HiOutlineTrophy,
                color: "blue",
                path: "/student/grades"
            },
            {
                id: "weekly-progress",
                title: "Tiến độ học theo tuần",
                value: `${completedWeeks}/${totalWeeks}`,
                subtitle: `Xong ${completedWeeks} tuần`,
                progressPercent: weekProgress,
                icon: HiOutlineCalendarDays,
                color: "green",
                path: "/student/timetable"
            },
            {
                id: "today-subject",
                title: "Hôm nay là Thứ Năm",
                value: dashboardData?.today?.currentSubject || "—",
                subtitle: (
                    <span className="student-next-subject-text">
                        Tiếp theo: <strong>{dashboardData?.today?.nextSubject || "—"}</strong>
                    </span>
                ),
                icon: HiOutlineClock,
                color: "purple",
                path: "/student/timetable"
            },
            {
                id: "upcoming-quiz",
                title: "Bài kiểm tra sắp tới",
                value: `${dashboardData?.upcomingTests?.length || 0}`,
                subtitle: (
                    <span className="student-upcoming-subjects-preview">
                        {dashboardData?.upcomingTests?.length > 0 
                            ? dashboardData.upcomingTests.slice(0, 3).map(t => t.subject).join(", ")
                            : "Không có bài kiểm tra mới"
                        }
                    </span>
                ),
                icon: HiOutlineClipboardDocumentList,
                color: "orange",
                path: "/student/quiz"
            },
        ];
    }, [dashboardData]);

    return (
        <div className="student-dashboard-content">
            <div className="student-dashboard-top-panel">
                <WelcomeHeader
                    studentName={localProfile?.fullName?.split(" ").pop() || "User"}
                    classNameLabel={localProfile?.className || "—"}
                    studentCode={localProfile?.studentCode || "—"}
                    homeroomTeacher={localProfile?.homeroomTeacher || "—"}
                />

                <div className="student-dashboard-toolbar">
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="layout-loading-wrapper">
                    <LoadingSpinner size="lg" label="Đang tải dữ liệu học tập..." role="student" />
                </div>
            ) : (
                <>
                    <StatsCards cards={statsCards} />

                    <div className="student-dashboard-grid student-dashboard-grid-top">
                        <div className="student-dashboard-calendar-card">
                        <EventCalendar 
                            title="Lịch Sự Kiện"
                            themeClass="theme-student"
                            userRole="student"
                            isCompact={true}
                            eventTypes={CALENDAR_EVENT_TYPES}
                            initialEvents={dashboardData?.calendarEvents || []}
                            selectedSchoolYear={selectedSchoolYear}
                            selectedTerm={selectedTerm}
                            rolePolicy={{
                            canCreate: false,
                            canViewDetails: true,
                            canEdit: false,
                            canDelete: false
                            }}
                        />
                        </div>
                        <UpcomingTests
                            quizzes={dashboardData?.upcomingTests || []}
                            onOpenQuiz={() => navigate("/student/quiz")}
                        />
                    </div>

                    <div className="student-dashboard-grid student-dashboard-grid-bottom">
                        <YearProgress
                            items={dashboardData?.yearProgress || []}
                            onOpenGrades={() => navigate("/student/grades")}
                        />

                        <SubjectRadar data={dashboardData?.subjectScores || []} />
                    </div>
                </>
            )}
        </div>
    );
}
