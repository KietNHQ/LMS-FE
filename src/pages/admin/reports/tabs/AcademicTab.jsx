import React from "react";
import { 
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell 
} from "recharts";
import { FiBook, FiAward, FiStar, FiZap, FiUser, FiInfo } from "react-icons/fi";
import { Card } from "../../../../components/ui";

const AcademicTab = ({ reportData, formatScore }) => {
    if (!reportData) return null;

    const { subjects, gradeOverview, summary, honorRoll, subjectDist } = reportData;

    return (
        <div className="academic-report-tab">
            <div className="tab-intro-row">
                <Card className="intro-stats-card info">
                    <FiStar />
                    <div>
                        <h4>{formatScore(summary.schoolAverageScore)}</h4>
                        <p>Điểm trung bình toàn trường</p>
                    </div>
                </Card>
                <Card className="intro-stats-card success">
                    <FiAward />
                    <div>
                        <h4>78.6%</h4>
                        <p>Tỷ lệ đạt Giỏi & Khá</p>
                    </div>
                </Card>
                <Card className="intro-stats-card purple">
                    <FiZap />
                    <div>
                        <h4>98.2%</h4>
                        <p>Tỷ lệ lên lớp (dự kiến)</p>
                    </div>
                </Card>
            </div>

            <div className="report-charts-grid academic-grid-layout">
                {/* Honor Roll - Top Students */}
                <Card title="Bảng vàng vinh danh (Top 10)" className="honor-roll-card">
                    <div className="honor-roll-list">
                        {honorRoll.map((student, idx) => (
                            <div key={idx} className="honor-student-item">
                                <div className="student-rank">#{idx + 1}</div>
                                <div className="student-avatar-box">
                                    <div className="avatar-circle">{student.avatar}</div>
                                </div>
                                <div className="student-meta">
                                    <h6>{student.name}</h6>
                                    <span>Lớp {student.class}</span>
                                </div>
                                <div className="student-gpa">
                                    <span className="gpa-val">{student.gpa}</span>
                                    <span className="gpa-label">GPA</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="view-all-link">Xem tất cả vinh danh →</div>
                </Card>

                {/* Subject Distribution - Stacked Bar */}
                <Card title="Phân tích chất lượng theo môn học" className="subject-analysis-card">
                    <p className="chart-subtitle">Tỉ lệ phần trăm các mức học lực trong từng bộ môn</p>
                    <ResponsiveContainer width="100%" height={380}>
                        <BarChart data={subjectDist} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="subject" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip 
                                cursor={{fill: '#f8fafc'}}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Legend verticalAlign="top" height={36} />
                            <Bar dataKey="tot" name="Tốt (%)" stackId="a" fill="#1e2f5a" barSize={35} />
                            <Bar dataKey="kha" name="Khá (%)" stackId="a" fill="#3b82f6" />
                            <Bar dataKey="tb" name="Trung bình (%)" stackId="a" fill="#93c5fd" />
                            <Bar dataKey="yeu" name="Yếu (%)" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                {/* Radar Comparison */}
                <Card title="Chỉ số học lực theo khối" className="academic-polar-card">
                    <div className="polar-chart-wrapper">
                        <ResponsiveContainer width="100%" height={300}>
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={gradeOverview}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="grade" tick={{fill: '#1e2f5a', fontSize: 12, fontWeight: 600}} />
                                <PolarRadiusAxis angle={30} domain={[0, 10]} axisLine={false} tick={false} />
                                <Radar 
                                    name="Điểm TB khối" 
                                    dataKey="averageScore" 
                                    stroke="#1e2f5a" 
                                    fill="#1e2f5a" 
                                    fillOpacity={0.15} 
                                    strokeWidth={3}
                                />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Top Classes Table */}
                <Card title="Xếp hạng học lực các lớp" className="academic-classes-table-card">
                    <table className="mini-ranking-table">
                        <thead>
                            <tr>
                                <th>Hạng</th>
                                <th>Lớp</th>
                                <th>Điểm TB</th>
                                <th>Tỉ lệ Giỏi</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gradeOverview.flatMap(g => g.classes).sort((a,b) => b.averageScore - a.averageScore).slice(0, 5).map((cls, idx) => (
                                <tr key={idx}>
                                    <td><span className={`rank-dot r-${idx+1}`}>{idx + 1}</span></td>
                                    <td className="bold">{cls.classId}</td>
                                    <td>{cls.averageScore}</td>
                                    <td>{Math.round(cls.averageScore * 10)}%</td>
                                    <td>
                                        <span className={`tag ${cls.averageScore >= 7.5 ? 'success' : 'warning'}`}>
                                            {cls.averageScore >= 7.5 ? 'Xuất sắc' : 'Đạt'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            </div>
        </div>
    );
};

export default AcademicTab;

