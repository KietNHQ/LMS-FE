import React from "react";
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
    HiOutlineChartBar,
    HiOutlineBookOpen,
    HiOutlineClipboardDocumentList,
} from "react-icons/hi2";

const progressData = [
    { name: "Học kỳ 1", score: 7.29 },
    { name: "Học kỳ 2", score: 7.8 },
    { name: "Cả năm", score: 7.7 },
];

const subjectData = [
    { subject: "Toán", score: 8 },
    { subject: "Vật lý", score: 7.5 },
    { subject: "Hóa học", score: 7 },
    { subject: "Ngữ văn", score: 8.3 },
    { subject: "Tiếng Anh", score: 9 },
];

const statCards = [
    {
        title: "Điểm trung bình cả năm",
        value: "7.60",
        subtitle: "Xếp loại học lực: Khá",
        icon: HiOutlineTrophy,
        color: "blue",
    },
    {
        title: "Điểm trung bình học kỳ 1",
        value: "7.29",
        icon: HiOutlineChartBar,
        color: "green",
    },
    {
        title: "Số tiết tuần này",
        value: "4",
        icon: HiOutlineBookOpen,
        color: "purple",
    },
    {
        title: "Bài kiểm tra sắp tới",
        value: "3",
        icon: HiOutlineClipboardDocumentList,
        color: "orange",
    },
];

const yearProgressData = [
    { grade: "Lớp 10", hk1: 7.29, hk2: 7.8, fullYear: 7.7, progressPercent: 77 },
    { grade: "Lớp 11", hk1: 7.8, hk2: 8.3, fullYear: 8.13, progressPercent: 81.3 },
    { grade: "Lớp 12", hk1: 8.4, hk2: 8.9, fullYear: 8.73, progressPercent: 87.3 },
];

const upcomingQuizzes = [
    {
        title: "Kiểm tra Toán chương 1",
        meta: "45 phút - 20 câu",
        deadline: "2026-03-14",
        description: "Ôn tập đại số và phương trình trước bài kiểm tra tuần.",
    },
    {
        title: "Ôn tập giữa kỳ Vật lý",
        meta: "60 phút - 25 câu",
        deadline: "2026-03-18",
        description: "Bao gồm chuyển động, lực và động lượng cơ bản.",
    },
    {
        title: "Kiểm tra Tiếng Anh Unit 3",
        meta: "40 phút - 30 câu",
        deadline: "2026-03-21",
        description: "Tập trung vào đọc hiểu và từ vựng.",
    },
];

export default function StudentDashboard() {
    const navigate = useNavigate();

    return (
        <div className="student-dashboard-content">
            <div className="student-dashboard-header">
                <h1>Xin chào, Tuấn!</h1>
                <p>
                    Lớp: <span className="student-header-strong">10A1</span>
                    <span className="student-header-separator"> | </span>
                    Năm học: <span className="student-header-strong">2025-2026</span>
                </p>
            </div>

            <div className="student-stats-grid">
                {statCards.map((card) => (
                    <div key={card.title} className="student-stat-card">
                        <div>
                            <p className="student-stat-title">{card.title}</p>
                            <h2 className="student-stat-value">{card.value}</h2>
                            {card.subtitle ? (
                                <span className="student-stat-subtitle">{card.subtitle}</span>
                            ) : null}
                        </div>
                        <div className={`student-stat-icon ${card.color}`}>
                            <card.icon />
                        </div>
                    </div>
                ))}
            </div>

            <div className="student-dashboard-grid student-dashboard-grid-top">
                <div className="student-dashboard-card">
                    <h3>Tiến độ học tập theo học kỳ</h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={progressData}>
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 10]} />
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

                <div className="student-dashboard-card">
                    <h3>Điểm theo môn học</h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <RadarChart data={subjectData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" />
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

            <div className="student-dashboard-grid student-dashboard-grid-bottom">
                <div className="student-dashboard-card">
                    <h3>Tiến độ qua các năm học</h3>
                    <div className="student-year-list">
                        {yearProgressData.map((item) => (
                            <button
                                key={item.grade}
                                className="student-year-row"
                                type="button"
                                onClick={() => navigate("/student/grades")}
                            >
                                <span>{item.grade}</span>
                                <div className="student-progress-bar">
                                    <div style={{ width: `${item.progressPercent}%` }} />
                                </div>
                                <strong>{item.fullYear.toFixed(2)}</strong>
                                <span className="student-year-hint">
                                    HK1: {item.hk1.toFixed(2)} - HK2: {item.hk2.toFixed(2)} - Cả năm: {item.fullYear.toFixed(2)}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="student-dashboard-card">
                    <h3>Bài kiểm tra sắp tới</h3>
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
                                    <div className="student-quiz-meta">{quiz.meta}</div>
                                    <div className="student-hover-hint">{quiz.description}</div>
                                </div>
                                <div className="student-quiz-right">
                                    <div className="student-quiz-deadline">Hạn nộp: {quiz.deadline}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}