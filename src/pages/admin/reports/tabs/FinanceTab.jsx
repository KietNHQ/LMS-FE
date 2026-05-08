import React from "react";
import { 
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    LineChart, Line, Cell, PieChart, Pie
} from "recharts";
import { FiDollarSign, FiTrendingUp, FiPieChart, FiArrowDown, FiCreditCard, FiActivity } from "react-icons/fi";
import { Card } from "../../../../components/ui";

const PIE_COLORS = ["#1e2f5a", "#3b82f6", "#60a5fa", "#93c5fd"];
const EXPENSE_COLORS = ["#ef4444", "#f97316", "#f59e0b", "#84cc16"];

const FinanceTab = ({ reportData, formatCurrency }) => {
    if (!reportData) return null;

    const { finance, summary, financeByGrade, financeDetails } = reportData;

    return (
        <div className="finance-report-tab">
            {/* Top KPI row with large numbers */}
            <div className="tab-intro-row">
                <Card className="intro-stats-card success finance-main-card">
                    <div className="kpi-icon-header"><FiTrendingUp /></div>
                    <div className="kpi-content">
                        <span className="kpi-label">Tổng doanh thu thực tế</span>
                        <h2 className="kpi-value-large">{formatCurrency(summary.totalRevenue)}</h2>
                        <div className="kpi-trend up">+15.2% so với kỳ trước</div>
                    </div>
                </Card>
                <Card className="intro-stats-card danger finance-main-card">
                    <div className="kpi-icon-header"><FiArrowDown /></div>
                    <div className="kpi-content">
                        <span className="kpi-label">Tổng chi phí vận hành</span>
                        <h2 className="kpi-value-large">{formatCurrency(summary.totalExpense)}</h2>
                        <div className="kpi-trend down">+5.4% so với dự toán</div>
                    </div>
                </Card>
                <Card className="intro-stats-card info finance-main-card">
                    <div className="kpi-icon-header"><FiDollarSign /></div>
                    <div className="kpi-content">
                        <span className="kpi-label">Thặng dư ngân sách</span>
                        <h2 className="kpi-value-large">{formatCurrency(summary.totalAfterExpense)}</h2>
                        <div className="kpi-trend up">Đạt 112% kế hoạch</div>
                    </div>
                </Card>
            </div>

            <div className="report-charts-grid finance-detail-grid">
                {/* Revenue Breakdown Table & Chart */}
                <Card title="Chi tiết các nguồn thu" className="finance-breakdown-card">
                    <div className="finance-split-layout">
                        <div className="finance-table-wrapper">
                            <table className="finance-detail-table">
                                <thead>
                                    <tr>
                                        <th>Hạng mục thu</th>
                                        <th className="text-right">Số tiền</th>
                                        <th className="text-right">Tỉ trọng</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {financeDetails.revenue.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>{item.category}</td>
                                            <td className="text-right bold">{formatCurrency(item.amount)}</td>
                                            <td className="text-right">
                                                {((item.amount / summary.totalRevenue) * 100).toFixed(1)}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td>Tổng cộng</td>
                                        <td className="text-right total">{formatCurrency(summary.totalRevenue)}</td>
                                        <td className="text-right">100%</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        <div className="finance-pie-wrapper">
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={financeDetails.revenue}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="amount"
                                        nameKey="category"
                                    >
                                        {financeDetails.revenue.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </Card>

                {/* Expense Breakdown Table & Chart */}
                <Card title="Phân bổ chi phí hoạt động" className="finance-breakdown-card">
                    <div className="finance-split-layout">
                        <div className="finance-table-wrapper">
                            <table className="finance-detail-table expense">
                                <thead>
                                    <tr>
                                        <th>Hạng mục chi</th>
                                        <th className="text-right">Số tiền</th>
                                        <th className="text-right">Tỉ trọng</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {financeDetails.expense.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>{item.category}</td>
                                            <td className="text-right bold danger-text">{formatCurrency(item.amount)}</td>
                                            <td className="text-right">
                                                {((item.amount / summary.totalExpense) * 100).toFixed(1)}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td>Tổng cộng</td>
                                        <td className="text-right total-expense">{formatCurrency(summary.totalExpense)}</td>
                                        <td className="text-right">100%</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        <div className="finance-pie-wrapper">
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={financeDetails.expense}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="amount"
                                        nameKey="category"
                                    >
                                        {financeDetails.expense.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </Card>

                {/* Grade-wise Revenue */}
                <Card title="Doanh thu theo khối lớp" className="finance-grade-dist">
                    <p className="chart-subtitle">Phân bổ nguồn thu dựa trên quy mô học sinh từng khối</p>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={financeByGrade} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="grade" type="category" axisLine={false} tickLine={false} tick={{fill: '#1e2f5a', fontWeight: 600}} width={100} />
                            <Tooltip 
                                formatter={(value) => formatCurrency(value)}
                                labelStyle={{ fontWeight: 800, color: '#1e2f5a' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey="amount" name="Doanh thu" fill="#1e2f5a" radius={[0, 4, 4, 0]} barSize={25} />
                            <Bar dataKey="expense" name="Chi phí" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={25} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                {/* Yearly Trend with Area chart for better visualization of fill */}
                <Card title="Xu hướng dòng tiền" className="finance-trend-card">
                    <div className="chart-header-actions">
                        <div className="legend-custom">
                            <span className="dot navy"></span> Doanh thu
                            <span className="dot red"></span> Chi phí
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={finance}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                            <Tooltip 
                                formatter={(value) => formatCurrency(value)}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Line type="monotone" dataKey="amount" stroke="#1e2f5a" strokeWidth={4} dot={{ r: 6, fill: '#1e2f5a' }} activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4, fill: '#ef4444' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    );
};

export default FinanceTab;

