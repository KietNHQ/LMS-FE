import React, { useState } from "react";
import { 
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ScatterChart, Scatter, ZAxis, Cell, ComposedChart, Line
} from "recharts";
import { FiUsers, FiCheckCircle, FiClock, FiStar, FiChevronRight, FiAward, FiBook, FiTrendingUp } from "react-icons/fi";
import { Card } from "../../../../components/ui";

const COLORS = ["#1e2f5a", "#3b82f6", "#60a5fa", "#93c5fd"];

const TeacherTab = ({ reportData, formatScore }) => {
    if (!reportData) return null;

    const { teacherPerformance, teacherSubjectAnalysis } = reportData;
    const [selectedTeacherId, setSelectedTeacherId] = useState(teacherSubjectAnalysis[0]?.teacherId);

    const selectedTeacher = teacherSubjectAnalysis.find(t => t.teacherId === selectedTeacherId);

    return (
        <div className="teacher-report-tab">
            <div className="tab-intro-row">
                <Card className="intro-stats-card navy">
                    <FiUsers />
                    <div>
                        <h4>{teacherPerformance.length}</h4>
                        <p>Tổng số giáo viên</p>
                    </div>
                </Card>
                <Card className="intro-stats-card success">
                    <FiCheckCircle />
                    <div>
                        <h4>94%</h4>
                        <p>Giáo án đúng hạn</p>
                    </div>
                </Card>
                <Card className="intro-stats-card warning">
                    <FiStar />
                    <div>
                        <h4>4.6/5</h4>
                        <p>Đánh giá chuyên môn</p>
                    </div>
                </Card>
            </div>

            <div className="teacher-main-layout">
                {/* Left Side: Teacher List & Performance Overview */}
                <div className="teacher-list-section">
                    <Card title="Danh sách hiệu suất">
                        <div className="teacher-compact-list">
                            {teacherSubjectAnalysis.map((teacher) => (
                                <div 
                                    key={teacher.teacherId} 
                                    className={`teacher-item-card ${selectedTeacherId === teacher.teacherId ? 'active' : ''}`}
                                    onClick={() => setSelectedTeacherId(teacher.teacherId)}
                                >
                                    <div className="teacher-avatar">
                                        {teacher.teacherName.charAt(0)}
                                    </div>
                                    <div className="teacher-info">
                                        <h6>{teacher.teacherName}</h6>
                                        <span>{teacher.subject}</span>
                                    </div>
                                    <div className="teacher-score-badge">
                                        {formatScore(teacherPerformance.find(p => p.teacher === teacher.teacherName)?.score || 0)}
                                    </div>
                                    <FiChevronRight className="arrow" />
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card title="Kinh nghiệm & Đánh giá" className="teacher-scatter-card">
                        <ResponsiveContainer width="100%" height={220}>
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis type="number" dataKey="x" name="Kinh nghiệm" unit=" năm" />
                                <YAxis type="number" dataKey="y" name="Điểm đánh giá" domain={[70, 100]} />
                                <ZAxis type="number" dataKey="z" range={[100, 400]} />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                <Scatter name="Giáo viên" data={[
                                    { x: 12, y: 88, z: 200, name: "An" },
                                    { x: 5, y: 82, z: 150, name: "Bình" },
                                    { x: 18, y: 86, z: 180, name: "Cường" },
                                ]} fill="#1e2f5a" />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </Card>
                </div>

                {/* Right Side: Detailed Teacher Analysis (Selected Teacher) */}
                <div className="teacher-detail-section">
                    {selectedTeacher ? (
                        <>
                            <Card className="teacher-profile-header">
                                <div className="profile-main">
                                    <div className="profile-text">
                                        <h3>GV. {selectedTeacher.teacherName}</h3>
                                        <p>Bộ môn: {selectedTeacher.subject} | Phân bổ: {(selectedTeacher.assignedClasses || []).length} lớp</p>
                                    </div>
                                    <div className="profile-stats">
                                        <div className="stat-box">
                                            <span className="label">Điểm TB Lớp</span>
                                            <span className="value">{(selectedTeacher.assignedClasses || []).length > 0 ? ((selectedTeacher.assignedClasses.reduce((a, b) => a + b.classAverageScore, 0) / selectedTeacher.assignedClasses.length).toFixed(1)) : "0"}</span>
                                        </div>
                                        <div className="stat-box">
                                            <span className="label">Chuyên cần</span>
                                            <span className="value">96.5%</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <div className="teacher-kpi-grid">
                                <Card className="kpi-mini-dashboard success">
                                    <span className="kpi-label">Hợp lệ giáo án</span>
                                    <div className="progress-stack">
                                        <div className="p-bar"><div className="p-fill" style={{width: selectedTeacher.proficiency.lessonPlans+'%'}}></div></div>
                                        <span className="val">{selectedTeacher.proficiency.lessonPlans}%</span>
                                    </div>
                                </Card>
                                <Card className="kpi-mini-dashboard info">
                                    <span className="kpi-label">Trả bài đúng hạn</span>
                                    <div className="progress-stack">
                                        <div className="p-bar"><div className="p-fill" style={{width: selectedTeacher.proficiency.grading+'%'}}></div></div>
                                        <span className="val">{selectedTeacher.proficiency.grading}%</span>
                                    </div>
                                </Card>
                                <Card className="kpi-mini-dashboard warning">
                                    <span className="kpi-label">Phản hồi HS</span>
                                    <div className="progress-stack">
                                        <div className="p-bar"><div className="p-fill" style={{width: selectedTeacher.proficiency.feedback+'%'}}></div></div>
                                        <span className="val">{selectedTeacher.proficiency.feedback}%</span>
                                    </div>
                                </Card>
                            </div>

                            <Card title="So sánh hiệu quả so với mặt bằng chung bộ môn">
                                <p className="chart-subtitle">Đối soát điểm số trung bình của các lớp và điểm chuẩn (Benchmark) bộ môn {selectedTeacher.subject}</p>
                                <ResponsiveContainer width="100%" height={280}>
                                    <ComposedChart data={selectedTeacher.assignedClasses || []}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="classId" axisLine={false} tickLine={false} />
                                        <YAxis domain={[0, 10]} axisLine={false} tickLine={false} />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            cursor={{fill: '#f8fafc'}}
                                        />
                                        <Legend />
                                        <Bar dataKey="classAverageScore" name="Điểm TB lớp" radius={[6, 6, 0, 0]} barSize={40} fill="#1e2f5a" />
                                        <Line type="monotone" dataKey="benchmark" name="TB Bộ môn" stroke="#ef4444" strokeWidth={3} strokeDasharray="5 5" />
                                    </ComposedChart>
                                </ResponsiveContainer>
                                <div className="teacher-comparison-note">
                                    <FiTrendingUp /> Giảng viên đang có kết quả <strong>Vượt trung bình</strong> {selectedTeacher.subject} khoảng 12%.
                                </div>
                            </Card>

                            <Card title="Chi tiết báo cáo theo lớp">
                                <table className="teacher-classes-table">
                                    <thead>
                                        <tr>
                                            <th>Lớp</th>
                                            <th>Điểm TB</th>
                                            <th>Chuyên cần</th>
                                            <th>Xếp hạng khối</th>
                                            <th>Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(selectedTeacher.assignedClasses || []).map((cls, idx) => (
                                            <tr key={idx}>
                                                <td className="bold"><FiBook className="m-r-8" /> {cls.classId}</td>
                                                <td><span className={`score-badge ${cls.classAverageScore >= 8 ? 'high' : 'mid'}`}>{cls.classAverageScore}</span></td>
                                                <td>{cls.attendance}%</td>
                                                <td>Hạng {cls.rank}</td>
                                                <td>
                                                    {cls.classAverageScore >= cls.benchmark ? (
                                                        <span className="tag success">Trên chuẩn</span>
                                                    ) : (
                                                        <span className="tag warning">Cần bồi dưỡng</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Card>
                        </>
                    ) : (
                        <div className="empty-selection">Vui lòng chọn giáo viên để xem chi tiết</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherTab;
