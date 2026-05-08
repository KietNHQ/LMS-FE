import React from "react";
import { 
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell 
} from "recharts";
import { FiAward, FiStar, FiAlertCircle, FiTrendingUp, FiCreditCard, FiActivity, FiArrowUp, FiArrowDown } from "react-icons/fi";
import { Card } from "../../../../components/ui";

const PIE_COLORS = ["#1e2f5a", "#3b82f6", "#60a5fa", "#93c5fd", "#e2e8f0"];

const ClassReportTab = ({ reportData, formatCurrency }) => {
    if (!reportData) return null;

    const { gradeOverview, classDeepDive } = reportData;
    
    // Sort classes for ranking
    const allClassData = gradeOverview.flatMap(g => 
        g.classes.map(c => ({ ...c, grade: g.grade }))
    ).sort((a,b) => b.averageScore - a.averageScore);

    return (
        <div className="class-report-tab">
            <div className="tab-intro-row">
                <Card className="intro-stats-card navy">
                    <FiAward />
                    <div>
                        <h4>Top 3</h4>
                        <p>Xếp hạng thi đua tháng</p>
                    </div>
                </Card>
                <Card className="intro-stats-card success">
                    <FiTrendingUp />
                    <div>
                        <h4>+5.2%</h4>
                        <p>Tăng trưởng học lực</p>
                    </div>
                </Card>
                <Card className="intro-stats-card warning">
                    <FiActivity />
                    <div>
                        <h4>92.5</h4>
                        <p>Điểm thi đua TB</p>
                    </div>
                </Card>
            </div>

            <div className="report-charts-grid class-deep-grid">
                {/* Class Ranking Table */}
                <Card title="Bảng xếp hạng thi đua & học tập" className="full-width">
                    <table className="mini-ranking-table">
                        <thead>
                            <tr>
                                <th>Xếp hạng</th>
                                <th>Lớp</th>
                                <th>Khối</th>
                                <th>Điểm TB HL</th>
                                <th>Điểm Thi đua</th>
                                <th>Vi phạm</th>
                                <th>Quỹ lớp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allClassData.slice(0, 10).map((cls, idx) => (
                                <tr key={idx}>
                                    <td><span className={`rank-badge ${idx < 3 ? (idx === 0 ? 'gold' : (idx === 1 ? 'silver' : 'bronze')) : 'gray'}`}>{idx + 1}</span></td>
                                    <td className="bold">{cls.classId}</td>
                                    <td>{cls.grade}</td>
                                    <td>{cls.averageScore}</td>
                                    <td><span className="total-point">{cls.star * 20}</span></td>
                                    <td><span className={`tag ${cls.violations > 20 ? 'danger' : 'success'}`}>{cls.violations} lỗi</span></td>
                                    <td className="text-right">{formatCurrency(cls.fund || 0)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>

                {/* Violation Deep Dive */}
                <Card title="Phân tích lỗi vi phạm nề nếp" className="violation-dist-card">
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={classDeepDive.violations}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={85}
                                paddingAngle={5}
                                dataKey="value"
                                nameKey="type"
                            >
                                {classDeepDive.violations.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="violation-insight">
                        <FiAlertCircle /> 
                        <span><strong>Mất trật tự</strong> chiếm 45% tổng số lỗi kỷ luật trong kỳ.</span>
                    </div>
                </Card>

                {/* Class Fund Transparency Ledger */}
                <Card title="Minh bạch tài chính & Hoạt động (Quỹ lớp)" className="fund-ledger-card">
                    <p className="chart-subtitle">Lịch sử thu chi quỹ lớp và quản lý tài chính tập thể</p>
                    <div className="ledger-preview">
                        <div className="ledger-header">
                            <div className="total-current">
                                <span className="label">Số dư hiện tại</span>
                                <h3 className="value">{formatCurrency(allClassData[0]?.fund || 5000000)}</h3>
                            </div>
                            <FiCreditCard className="ledger-icon" />
                        </div>
                        <div className="ledger-list-mini">
                            {classDeepDive.fundLedger.map((item, idx) => (
                                <div key={idx} className="ledger-row">
                                    <div className="date">{item.date}</div>
                                    <div className="content">{item.content}</div>
                                    <div className={`amount ${item.type}`}>
                                        {item.type === 'revenue' ? '+' : '-'} {formatCurrency(item.amount)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="view-more-center">Xem sổ quỹ chi tiết →</div>
                </Card>

                {/* Radar Chart for Quality of life */}
                <Card title="Phát triển kỹ năng & Thể chất" className="full-width radar-skills-card">
                    <ResponsiveContainer width="100%" height={320}>
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={gradeOverview}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis dataKey="grade" />
                            <PolarRadiusAxis domain={[0, 5]} hide />
                            <Radar name="Thể chất" dataKey="star" stroke="#1e2f5a" fill="#1e2f5a" fillOpacity={0.15} />
                            <Radar name="Kỹ năng mềm" dataKey="averageScore" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                            <Tooltip />
                            <Legend />
                        </RadarChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    );
};

export default ClassReportTab;

