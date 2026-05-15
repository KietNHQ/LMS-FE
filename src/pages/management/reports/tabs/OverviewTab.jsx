import React, { useState, useEffect } from "react";
import { 
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
    PieChart, Pie, Cell, AreaChart, Area, ComposedChart, Line
} from "recharts";
import { 
    FiUsers, FiBookOpen, FiDollarSign, FiCalendar, FiAward, FiActivity, 
    FiArrowUpRight, FiArrowDownRight, FiTrendingUp, FiCheckCircle
} from "react-icons/fi";
import { Card } from "../../../../components/ui";
import { fetchTermComparison } from "../../../../services/pages/management/reports/reportService";

const PIE_COLORS = ["#1e2f5a", "#3b82f6", "#60a5fa", "#93c5fd", "#e2e8f0"];

const OverviewTab = ({ reportData, filters, formatCurrency, formatPercent, formatScore }) => {
    const [comparisonData, setComparisonData] = useState(null);

    useEffect(() => {
        if (filters.term === "ALL") {
            fetchTermComparison(filters.schoolYear, filters).then(setComparisonData);
        } else {
            setComparisonData(null);
        }
    }, [filters]);

    if (!reportData) return null;

    const { summary, academic, attendance, finance } = reportData;

    // Academic Pie Data
    const academicPieData = academic.map((item, idx) => ({
        ...item,
        color: PIE_COLORS[idx % PIE_COLORS.length]
    }));

    // KPI Cards Data
    const kpiData = [
        { title: "Tổng học sinh", value: summary.totalStudents, icon: <FiUsers />, color: "navy", trend: "+2%" },
        { title: "Điểm TB trường", value: formatScore(summary.schoolAverageScore), icon: <FiBookOpen />, color: "info", trend: "+0.2" },
        { title: "Tỷ lệ khá giỏi", value: "78.4%", icon: <FiAward />, color: "success", trend: "+5%" },
        { title: "Tổng thu nhập", value: formatCurrency(summary.totalRevenue), icon: <FiDollarSign />, color: "navy", trend: "+12%" },
        { title: "Chuyên cần", value: formatPercent(summary.attendanceRate) + "%", icon: <FiActivity />, color: "warning", trend: "-0.5%" },
        { title: "Điểm thi đua TB", value: "92.5", icon: <FiAward />, color: "purple", trend: "+1.2" },
    ];

    return (
        <div className="overview-report-tab">
            {/* KPI Section */}
            <div className="report-kpi-grid">
                {kpiData.map((kpi, idx) => (
                    <div className={`report-kpi-card ${kpi.color}`} key={idx}>
                        <div className="kpi-icon-box">{kpi.icon}</div>
                        <div className="kpi-info">
                            <span className="kpi-label">{kpi.title}</span>
                            <h3 className="kpi-value">{kpi.value}</h3>
                            <span className={`kpi-trend ${kpi.trend.startsWith('+') ? 'up' : 'down'}`}>
                                {kpi.trend.startsWith('+') ? <FiArrowUpRight /> : <FiArrowDownRight />} {kpi.trend}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Term-over-Term Comparison Section (Only for 'ALL' filter) */}
            {comparisonData && (
                <Card title="So sánh hiệu quả học tập & vận hành giữa 2 học kỳ" className="comparison-section">
                    <div className="comparison-metrics-grid">
                        {comparisonData.metrics.map((m, idx) => (
                            <div className="comparison-metric-item" key={idx}>
                                <span className="m-label">{m.metric}</span>
                                <div className="m-values">
                                    <div className="m-val-box">
                                        <span className="term">HK1</span>
                                        <span className="val">{m.hk1}</span>
                                    </div>
                                    <div className="m-divider">→</div>
                                    <div className="m-val-box">
                                        <span className="term">HK2</span>
                                        <span className={`val ${m.hk2 >= m.hk1 ? 'up' : 'down'}`}>{m.hk2}</span>
                                    </div>
                                </div>
                                <div className="m-delta">
                                    {m.hk2 >= m.hk1 ? <FiArrowUpRight className="up" /> : <FiArrowDownRight className="down" />}
                                    <span className={m.hk2 >= m.hk1 ? 'up' : 'down'}>
                                        {Math.abs(m.hk2 - m.hk1).toFixed(1)} {m.metricType === 'score' ? 'đ' : (m.metricType === 'percent' ? '%' : 'tỷ')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            <div className="report-charts-grid">
                {/* Academic Performance */}
                <div className="report-chart-card">
                    <div className="chart-header">
                        <h4>Phân loại học lực</h4>
                        <p>Dựa trên điểm trung bình cuối kỳ</p>
                    </div>
                    <div className="chart-content pie-chart-area">
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={academicPieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    animationDuration={1000}
                                >
                                    {academicPieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Economic Health Overview */}
                <div className="report-chart-card">
                    <div className="chart-header">
                        <h4>Sức khỏe tài chính</h4>
                        <p>So sánh doanh thu và chi tiêu thực tế (VNĐ)</p>
                    </div>
                    <div className="chart-content">
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={finance}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <Tooltip 
                                    cursor={{fill: '#f8fafc'}}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => formatCurrency(value)}
                                />
                                <Legend iconType="circle" />
                                <Bar dataKey="amount" name="Doanh thu" fill="#1e2f5a" radius={[6, 6, 0, 0]} barSize={20} />
                                <Bar dataKey="expense" name="Chi tiêu" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Attendance Trend */}
                <div className="report-chart-card full-width">
                    <div className="chart-header">
                        <h4>Xu hướng nề nếp tổng quát</h4>
                        <p>Tỷ lệ đi học đúng giờ và ổn định theo dòng thời gian</p>
                    </div>
                    <div className="chart-content">
                        <ResponsiveContainer width="100%" height={300}>
                            <ComposedChart data={attendance}>
                                <defs>
                                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1e2f5a" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#1e2f5a" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Area type="monotone" dataKey="onTime" name="Đúng giờ (%)" stroke="#1e2f5a" strokeWidth={3} fillOpacity={1} fill="url(#colorRate)" />
                                <Line type="monotone" dataKey="late" name="Đi muộn" stroke="#f59e0b" strokeWidth={2} dot={false} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Ranking Table Preview */}
            <div className="report-preview-grid">
                <Card title="Gương mặt xuất sắc (Star Teachers)" className="preview-card">
                    <div className="star-teachers-list">
                        <div className="star-item">
                            <FiCheckCircle className="gold" />
                            <div className="info"><h6>Nguyễn Văn An</h6><span>Điểm đánh giá: 8.9 | Vượt chỉ tiêu lớp 12C1</span></div>
                        </div>
                        <div className="star-item">
                            <FiCheckCircle className="silver" />
                            <div className="info"><h6>Lê Quốc Cường</h6><span>Điểm đánh giá: 8.7 | Vượt chỉ tiêu lớp 11B1</span></div>
                        </div>
                        <div className="star-item">
                            <FiCheckCircle className="bronze" />
                            <div className="info"><h6>Trần Thị Bình</h6><span>Điểm đánh giá: 8.6 | Hiệu suất Ngữ văn cao</span></div>
                        </div>
                    </div>
                </Card>

                <Card title="Phát hiện quan trọng" className="preview-card insight-card">
                    <div className="insight-item">
                        <FiTrendingUp className="blue" />
                        <p>Kết quả học tập môn Toán tăng 0.4đ so với trung bình HK1.</p>
                    </div>
                    <div className="insight-item">
                        <FiActivity className="orange" />
                        <p>Tỷ lệ đi học đúng giờ có xu hướng giảm nhẹ vào tháng 11 & 12.</p>
                    </div>
                    <div className="insight-item">
                        <FiDollarSign className="green" />
                        <p>Doanh thu từ phí cơ sở vật chất đạt mục tiêu năm sớm 2 tháng.</p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default OverviewTab;

