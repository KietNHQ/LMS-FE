import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
import { INITIAL_CALENDAR_EVENTS, CALENDAR_EVENT_TYPES } from "../../../components/common/EventCalendar/eventData";
import SubjectRadar from "./components/SubjectRadar/SubjectRadar";
import YearProgress from "./components/YearProgress/YearProgress";
import UpcomingTests from "./components/UpcomingTests/UpcomingTests";
import { SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";

const subjectData = [
    { subject: "Toán", score: 8.0 },
    { subject: "Ngữ văn", score: 8.3 },
    { subject: "Tiếng Anh", score: 9.0 },
    { subject: "Vật lý", score: 7.5 },
    { subject: "Hóa học", score: 7.0 },
    { subject: "Sinh học", score: 7.4 },
    { subject: "Lịch sử", score: 7.8 },
    { subject: "Địa lý", score: 8.1 },
    { subject: "GDCD", score: 8.4 },
    { subject: "Tin học", score: 8.6 },
    { subject: "Công nghệ", score: 7.7 },
    { subject: "Thể dục", score: 9.2 },
];

const currentStudentYearProgress = [
    { grade: "Lớp 10", hk1: 7.29, hk2: 7.8, fullYear: 7.7, progressPercent: 77 },
    { grade: "Lớp 11", hk1: 7.85, hk2: 8.1, fullYear: 8.02, progressPercent: 80.2 },
    { grade: "Lớp 12", hk1: 8.2, hk2: 8.45, fullYear: 8.37, progressPercent: 83.7 },
];

const upcomingQuizzes = [
    {
        title: "Kiểm tra Toán chương 1",
        subject: "Toán",
        meta: "45 phút - 20 câu",
        deadline: "2026-03-14",
        description: "Ôn tập đại số và phương trình trước bài kiểm tra tuần.",
    },
    {
        title: "Ôn tập giữa kỳ Vật lý",
        subject: "Vật lý",
        meta: "60 phút - 25 câu",
        deadline: "2026-03-18",
        description: "Bao gồm chuyển động, lực và động lượng cơ bản.",
    },
    {
        title: "Kiểm tra Tiếng Anh Unit 3",
        subject: "Tiếng Anh",
        meta: "40 phút - 30 câu",
        deadline: "2026-03-21",
        description: "Tập trung vào đọc hiểu và từ vựng.",
    },
    {
        title: "Kiểm tra Hóa học chương 2",
        subject: "Hóa học",
        meta: "30 phút - 15 câu",
        deadline: "2026-03-25",
        description: "Ôn phần phản ứng hóa học và cân bằng phương trình.",
    },
    {
        title: "Kiểm tra Ngữ văn đọc hiểu",
        subject: "Ngữ văn",
        meta: "45 phút - Tự luận",
        deadline: "2026-03-28",
        description: "Luyện kỹ năng đọc hiểu và phân tích nội dung văn bản.",
    },
    {
        title: "Kiểm tra Sinh học chương 3",
        subject: "Sinh học",
        meta: "45 phút - 30 câu",
        deadline: "2026-04-02",
        description: "Ôn tập về di truyền học và biến dị cơ bản.",
    },
];

const academicOverview = {
    totalWeeks: 35,
    completedWeeks: 18,
    semester1Average: 7.29,
    fullYearAverage: 7.7,
    todayLabel: "Thứ Hai",
    currentSubject: "Ngữ văn",
    nextSubject: "Toán",
};

function getAcademicRank(score) {
    if (score >= 8.0) return "Giỏi";
    if (score >= 6.5) return "Khá";
    if (score >= 5.0) return "Trung bình";
    return "Yếu";
}

function formatScore(score) {
    return Number(score).toFixed(2);
}

function getOverviewCardData(overview) {
    const isFullYear = overview.completedWeeks >= overview.totalWeeks;
    const activeAverage = isFullYear
        ? overview.fullYearAverage
        : overview.semester1Average;

    return {
        title: isFullYear ? "Điểm trung bình cả năm" : "Điểm trung bình học kỳ 1",
        value: formatScore(activeAverage),
        rank: getAcademicRank(activeAverage),
        subtitlePrefix: isFullYear
            ? "Học lực:"
            : "Học lực HK1:",
    };
}

export default function StudentDashboard() {
    const navigate = useNavigate();
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();

    const summaryCard = useMemo(
        () => getOverviewCardData(academicOverview),
        []
    );

    const weekProgressPercent = useMemo(() => {
        if (!academicOverview.totalWeeks) return 0;
        return Math.min(
            100,
            Math.round(
                (academicOverview.completedWeeks / academicOverview.totalWeeks) * 100
            )
        );
    }, []);

    const topUpcomingSubjects = useMemo(() => {
        const subjects = upcomingQuizzes.map((quiz) => quiz.subject);
        const firstThree = subjects.slice(0, 3);
        return subjects.length > 3
            ? `${firstThree.join(", ")}, ...`
            : firstThree.join(", ");
    }, []);

    const statsCards = useMemo(() => {
        return [
            {
                id: "summary",
                title: summaryCard.title,
                value: summaryCard.value,
                subtitle: (
                    <>
                        {summaryCard.subtitlePrefix}{" "}
                        <strong className="student-rank-strong">{summaryCard.rank}</strong>
                    </>
                ),
                icon: HiOutlineTrophy,
                color: "blue",
            },
            {
                id: "weekly-progress",
                title: "Tiến độ học theo tuần",
                value: `${academicOverview.completedWeeks}/${academicOverview.totalWeeks}`,
                subtitle: `Xong ${academicOverview.completedWeeks} tuần`,
                progressPercent: weekProgressPercent,
                icon: HiOutlineCalendarDays,
                color: "green",
            },
            {
                id: "today-subject",
                title: (
                    <>
                        Hôm nay là <strong>{academicOverview.todayLabel}</strong>
                    </>
                ),
                value: academicOverview.currentSubject,
                subtitle: (
                    <span className="student-next-subject-text">
            Tiếp theo: <strong>{academicOverview.nextSubject}</strong>
          </span>
                ),
                icon: HiOutlineClock,
                color: "purple",
            },
            {
                id: "upcoming-quiz",
                title: "Bài kiểm tra sắp tới",
                value: `${upcomingQuizzes.length}`,
                subtitle: (
                    <span className="student-upcoming-subjects-preview">
            {topUpcomingSubjects}
          </span>
                ),
                icon: HiOutlineClipboardDocumentList,
                color: "orange",
            },
        ];
    }, [summaryCard, weekProgressPercent, topUpcomingSubjects]);

    return (
        <div className="student-dashboard-content">
            <div className="student-dashboard-top-panel">
                <WelcomeHeader
                    studentName="Tuấn"
                    classNameLabel="10A1"
                    studentCode="HS10A1-023"
                    homeroomTeacher="Cô Nguyễn Thị Lan"
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

            <StatsCards cards={statsCards} />

            <div className="student-dashboard-grid student-dashboard-grid-top">
                <div className="student-dashboard-calendar-card">
                  <EventCalendar 
                    title="Lịch Sự Kiện"
                    themeClass="theme-student"
                    userRole="student"
                    isCompact={true}
                    eventTypes={CALENDAR_EVENT_TYPES}
                    initialEvents={INITIAL_CALENDAR_EVENTS}
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
                    quizzes={upcomingQuizzes}
                    onOpenQuiz={() => navigate("/student/quiz")}
                />
            </div>


            <div className="student-dashboard-grid student-dashboard-grid-bottom">
                <YearProgress
                    items={currentStudentYearProgress}
                    onOpenGrades={() => navigate("/student/grades")}
                />

                <SubjectRadar data={subjectData} />
            </div>
        </div>
    );
}