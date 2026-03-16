import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
} from "recharts";
import {
    HiOutlineTrophy,
    HiOutlineCalendarDays,
    HiOutlineClock,
    HiOutlineClipboardDocumentList,
} from "react-icons/hi2";

const progressData = [
    { name: "Học kỳ 1", score: 7.29 },
    { name: "Học kỳ 2", score: 7.8 },
    { name: "Cả năm", score: 7.7 },
];

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
];

const academicOverview = {
    schoolYear: "2025-2026",
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
            ? "Xếp loại học lực cả năm:"
            : "Xếp loại học lực HK1:",
    };
}

export default function StudentDashboard() {
    const navigate = useNavigate();

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
                subtitle: `Đã hoàn thành ${academicOverview.completedWeeks} tuần trong năm học`,
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
            Môn tiếp theo: <strong>{academicOverview.nextSubject}</strong>
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
            <div className="student-dashboard-header">
                <h1>Xin chào, Tuấn!</h1>
                <p>
                    Lớp: <span className="student-header-strong">10A1</span>
                    <span className="student-header-separator"> | </span>
                    Năm học:{" "}
                    <span className="student-header-strong">
            {academicOverview.schoolYear}
          </span>
                </p>
            </div>

            <div className="student-stats-grid">
                {statsCards.map((card) => (
                    <div key={card.id} className="student-stat-card">
                        <div className="student-stat-body">
                            <p className="student-stat-title">{card.title}</p>
                            <h2 className="student-stat-value">{card.value}</h2>

                            {card.subtitle ? (
                                <div className="student-stat-subtitle">{card.subtitle}</div>
                            ) : null}

                            {typeof card.progressPercent === "number" ? (
                                <div className="student-stat-progress-wrap">
                                    <div className="student-stat-progress">
                                        <div
                                            className="student-stat-progress-fill"
                                            style={{ width: `${card.progressPercent}%` }}
                                        />
                                    </div>
                                    <span className="student-stat-progress-text">
                    {card.progressPercent}% tiến độ
                  </span>
                                </div>
                            ) : (
                                <div className="student-stat-progress-placeholder" />
                            )}
                        </div>

                        <div className={`student-stat-icon ${card.color}`}>
                            <card.icon />
                        </div>
                    </div>
                ))}
            </div>

            <div className="student-dashboard-grid student-dashboard-grid-top">
                <div className="student-dashboard-card student-dashboard-card-equal">
                    <h3>Tiến độ học tập theo học kỳ</h3>

                    <div className="student-semester-chart-wrap">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart
                                data={progressData}
                                margin={{ top: 24, right: 28, left: 20, bottom: 18 }}
                            >
                                <XAxis dataKey="name" />
                                <YAxis
                                    domain={[0, 10]}
                                    ticks={[5, 8, 10]}
                                    allowDecimals={false}
                                />
                                <Tooltip formatter={(value) => [`${value}`, "Điểm"]} />
                                <Line
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#7ea1ff"
                                    strokeWidth={3}
                                    dot={{ r: 5 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="student-dashboard-card student-dashboard-card-equal student-dashboard-card-radar">
                    <h3>Điểm theo môn học</h3>

                    <div className="student-radar-wrap">
                        <ResponsiveContainer width="100%" height={340}>
                            <RadarChart cx="50%" cy="50%" outerRadius="82%" data={subjectData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                                <Radar
                                    dataKey="score"
                                    stroke="#7ea1ff"
                                    fill="#7ea1ff"
                                    fillOpacity={0.35}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="student-dashboard-grid student-dashboard-grid-bottom">
                <div className="student-dashboard-card student-dashboard-card-equal student-dashboard-card-years">
                    <h3>Tiến độ qua các năm học</h3>

                    <div className="student-year-list">
                        {currentStudentYearProgress.map((item, index) => {
                            const isLastRow = index === currentStudentYearProgress.length - 1;

                            return (
                                <button
                                    key={item.grade}
                                    className={`student-year-row ${isLastRow ? "open-up" : "open-down"}`}
                                    type="button"
                                    onClick={() => navigate("/student/grades")}
                                >
                                    <div className="student-year-row-main">
                                        <span className="student-year-grade">{item.grade}</span>

                                        <div className="student-progress-bar">
                                            <div style={{ width: `${item.progressPercent}%` }} />
                                        </div>

                                        <strong>{item.fullYear.toFixed(2)}</strong>
                                    </div>

                                    <div className="student-year-hover-buffer" />

                                    <div className="student-year-detail-pop">
                                        <div className="student-year-detail-grid">
                                            <div className="student-year-detail-item">
                                                <span>HK1</span>
                                                <strong>{item.hk1.toFixed(2)}</strong>
                                            </div>
                                            <div className="student-year-detail-item">
                                                <span>HK2</span>
                                                <strong>{item.hk2.toFixed(2)}</strong>
                                            </div>
                                            <div className="student-year-detail-item">
                                                <span>Cả năm</span>
                                                <strong>{item.fullYear.toFixed(2)}</strong>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="student-dashboard-card student-dashboard-card-quizzes student-dashboard-card-equal">
                    <h3>Bài kiểm tra sắp tới</h3>

                    <div className="student-quiz-scroll-area">
                        <div className="student-quiz-list">
                            {upcomingQuizzes.map((quiz) => (
                                <button
                                    key={quiz.title}
                                    className="student-quiz-item"
                                    type="button"
                                    onClick={() => navigate("/student/quiz")}
                                >
                                    <div>
                                        <div className="student-quiz-title">{quiz.title}</div>
                                        <div className="student-quiz-meta">
                                            {quiz.subject} • {quiz.meta}
                                        </div>
                                        <div className="student-hover-hint">{quiz.description}</div>
                                    </div>

                                    <div className="student-quiz-right">
                                        <div className="student-quiz-deadline">
                                            Hạn nộp: {quiz.deadline}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}