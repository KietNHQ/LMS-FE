import React from "react";
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

const progressData = [
    { name: "HK1", score: 7.29 },
    { name: "HK2", score: 7.8 },
    { name: "Cả năm", score: 7.7 },
];

const subjectData = [
    { subject: "Toán", score: 8 },
    { subject: "Vật Lý", score: 7.5 },
    { subject: "Hóa học", score: 7 },
    { subject: "Ngữ văn", score: 8.3 },
    { subject: "Tiếng Anh", score: 9 },
];

export default function StudentDashboard() {
    return (
        <div className="student-dashboard-content">
            <div className="student-dashboard-header">
                <h1>Xin chào, Tuấn! 📚</h1>
                <p>Lớp 10A1 • Năm học 2024-2025</p>
            </div>

            <div className="student-stats-grid">
                <div className="student-stat-card">
                    <div>
                        <p className="student-stat-title">Điểm TB cả năm</p>
                        <h2 className="student-stat-value">7.60</h2>
                        <span className="student-stat-subtitle">Học lực: Khá</span>
                    </div>
                </div>

                <div className="student-stat-card">
                    <div>
                        <p className="student-stat-title">ĐTB HK1</p>
                        <h2 className="student-stat-value">7.29</h2>
                    </div>
                    <div className="student-stat-icon green">📈</div>
                </div>

                <div className="student-stat-card">
                    <div>
                        <p className="student-stat-title">Bài học</p>
                        <h2 className="student-stat-value">4</h2>
                    </div>
                    <div className="student-stat-icon purple">📘</div>
                </div>

                <div className="student-stat-card">
                    <div>
                        <p className="student-stat-title">Quiz chờ làm</p>
                        <h2 className="student-stat-value">3</h2>
                    </div>
                    <div className="student-stat-icon orange">📝</div>
                </div>
            </div>

            <div className="student-dashboard-grid student-dashboard-grid-top">
                <div className="student-dashboard-card">
                    <h3>Tiến độ học tập theo kỳ</h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={progressData}>
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 10]} />
                            <Tooltip />
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
                    <h3>Điểm theo môn</h3>
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

                    <div className="student-year-row">
                        <span>Lớp 10</span>
                        <div className="student-progress-bar">
                            <div style={{ width: "78%" }} />
                        </div>
                        <strong>7.8</strong>
                    </div>

                    <div className="student-year-row">
                        <span>Lớp 11</span>
                        <div className="student-progress-bar">
                            <div style={{ width: "82%" }} />
                        </div>
                        <strong>8.2</strong>
                    </div>

                    <div className="student-year-row">
                        <span>Lớp 12</span>
                        <div className="student-progress-bar">
                            <div style={{ width: "86.7%" }} />
                        </div>
                        <strong>8.67</strong>
                    </div>
                </div>

                <div className="student-dashboard-card">
                    <h3>Quiz sắp đến hạn</h3>

                    <div className="student-quiz-item">
                        <div>
                            <div className="student-quiz-title">Kiểm tra Toán chương 1</div>
                            <div className="student-quiz-meta">45 phút • 20 câu</div>
                        </div>
                        <div className="student-quiz-deadline">Hạn: 2025-01-20</div>
                    </div>

                    <div className="student-quiz-item">
                        <div>
                            <div className="student-quiz-title">Bài kiểm tra Vật lý HK1</div>
                            <div className="student-quiz-meta">60 phút • 25 câu</div>
                        </div>
                        <div className="student-quiz-deadline">Hạn: 2025-01-25</div>
                    </div>

                    <div className="student-quiz-item">
                        <div>
                            <div className="student-quiz-title">Tiếng Anh Unit 3</div>
                            <div className="student-quiz-meta">40 phút • 30 câu</div>
                        </div>
                        <div className="student-quiz-deadline">Hạn: 2025-02-05</div>
                    </div>
                </div>
            </div>
        </div>
    );
}