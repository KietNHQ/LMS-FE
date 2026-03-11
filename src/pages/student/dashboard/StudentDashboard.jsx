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
    { name: "Semester 1", score: 7.29 },
    { name: "Semester 2", score: 7.8 },
    { name: "Full Year", score: 7.7 },
];

const subjectData = [
    { subject: "Math", score: 8 },
    { subject: "Physics", score: 7.5 },
    { subject: "Chemistry", score: 7 },
    { subject: "Literature", score: 8.3 },
    { subject: "English", score: 9 },
];

const statCards = [
    {
        title: "Full-Year GPA",
        value: "7.60",
        subtitle: "Academic Rank: Good",
        icon: HiOutlineTrophy,
        color: "blue",
    },
    {
        title: "Semester 1 GPA",
        value: "7.29",
        icon: HiOutlineChartBar,
        color: "green",
    },
    {
        title: "Lessons This Week",
        value: "4",
        icon: HiOutlineBookOpen,
        color: "purple",
    },
    {
        title: "Pending Quizzes",
        value: "3",
        icon: HiOutlineClipboardDocumentList,
        color: "orange",
    },
];

const yearProgressData = [
    { grade: "Grade 10", hk1: 7.29, hk2: 7.8, fullYear: 7.7, progressPercent: 77 },
    { grade: "Grade 11", hk1: 7.8, hk2: 8.3, fullYear: 8.13, progressPercent: 81.3 },
    { grade: "Grade 12", hk1: 8.4, hk2: 8.9, fullYear: 8.73, progressPercent: 87.3 },
];

const upcomingQuizzes = [
    {
        title: "Math Chapter 1 Quiz",
        meta: "45 minutes - 20 questions",
        deadline: "2026-03-14",
        description: "Practice algebra and equations before the weekly assessment.",
    },
    {
        title: "Physics Midterm Practice",
        meta: "60 minutes - 25 questions",
        deadline: "2026-03-18",
        description: "Covers motion, force, and momentum basics.",
    },
    {
        title: "English Unit 3 Checkpoint",
        meta: "40 minutes - 30 questions",
        deadline: "2026-03-21",
        description: "Focus on reading comprehension and vocabulary.",
    },
];

export default function StudentDashboard() {
    const navigate = useNavigate();

    return (
        <div className="student-dashboard-content">
            <div className="student-dashboard-header">
                <h1>Hello, Tuan!</h1>
                <p>Class 10A1 - School Year 2025-2026</p>
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
                    <h3>Learning Progress by Term</h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={progressData}>
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 10]} />
                            <Tooltip formatter={(value) => [`${value}`, "Score"]} />
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
                    <h3>Score by Subject</h3>
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
                    <h3>Progress Across School Years</h3>
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
                                    S1: {item.hk1.toFixed(2)} - S2: {item.hk2.toFixed(2)} - Full Year: {item.fullYear.toFixed(2)}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="student-dashboard-card">
                    <h3>Upcoming Quizzes</h3>
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
                                    <div className="student-quiz-deadline">Due: {quiz.deadline}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}