import React from "react";
import { 
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ComposedChart, Line, Cell, PieChart, Pie
} from "recharts";
import { FiCalendar, FiClock, FiActivity, FiUsers, FiUserCheck, FiUserMinus, FiAlertCircle } from "react-icons/fi";
import { Card } from "../../../../components/ui";

const PIE_COLORS = ["#1e2f5a", "#f59e0b", "#ef4444", "#94a3b8"];

const AttendanceTab = ({ reportData, formatPercent }) => {
    if (!reportData) return null;

    const { attendance, attendanceByDay, attendanceAlerts, classDeepDive } = reportData;

    // Derived summary data from months
    const totalLateRate = (attendance.reduce((acc, curr) => acc + curr.late, 0) / attendance.length).toFixed(1);
    const totalAbsentRate = (attendance.reduce((acc, curr) => acc + curr.absent, 0) / attendance.length).toFixed(1);
    const totalOnTimeRate = (attendance.reduce((acc, curr) => acc + curr.onTime, 0) / attendance.length).toFixed(1);

    return (
        <div className="attendance-report-tab">
            <div className="tab-intro-row">
                <Card className="intro-stats-card success">
                    <FiUserCheck />
                    <div>
                        <h4>{totalOnTimeRate}%</h4>
                        <p>Đúng giờ bình quân</p>
                    </div>
                </Card>
                <Card className="intro-stats-card warning">
                    <FiClock />
                    <div>
                        <h4>{totalLateRate}%</h4>
                        <p>Đi muộn bình quân</p>
                    </div>
                </Card>
                <Card className="intro-stats-card danger">
                    <FiUserMinus />
                    <div>
                        <h4>{totalAbsentRate}%</h4>
                        <p>Vắng mặt bình quân</p>
                    </div>
                </Card>
            </div>

            <div className="report-charts-grid attendance-analysis-grid">
                {/* Granular Chart: Stacking On-Time, Late, Absent */}
                <Card title="Phân tích nề nếp chuyên cần (Hàng tháng)" className="full-width">
                    <p className="chart-subtitle">Biểu đồ thể hiện mối tương quan giữa sự chuyên cần, đi muộn và vắng mặt</p>
                    <ResponsiveContainer width="100%" height={320}>
                        <ComposedChart data={attendance}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Legend verticalAlign="top" height={36} />
                            <Bar dataKey="onTime" name="Đúng giờ (%)" stackId="a" fill="#1e2f5a" barSize={35} />
                            <Bar dataKey="late" name="Đi muộn (%)" stackId="a" fill="#f59e0b" />
                            <Bar dataKey="absent" name="Vắng mặt (%)" stackId="a" fill="#ef4444" radius={[6, 6, 0, 0]} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </Card>

                {/* Day of week analysis */}
                <Card title="Tần suất chuyên cần theo thứ (Weekdays)" className="weekday-analysis-card">
                    <p className="chart-subtitle">So sánh tỉ lệ đi học đúng giờ giữa các ngày trong tuần</p>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={attendanceByDay}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} />
                            <YAxis domain={[90, 100]} hide />
                            <Tooltip 
                                labelStyle={{ fontWeight: 800, color: '#1e2f5a' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                cursor={{fill: '#f1f5f9'}}
                            />
                            <Bar dataKey="rate" name="Tỉ lệ đúng giờ (%)" radius={[4, 4, 0, 0]} barSize={40}>
                                {attendanceByDay.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.rate < 95 ? '#ef4444' : '#1e2f5a'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="insight-note info">
                        <FiAlertCircle /> Thứ 6 thường có tỉ lệ đi muộn cao hơn các ngày khác.
                    </div>
                </Card>

                {/* Reasons Breakdown */}
                <Card title="Cơ cấu lý do vắng mặt & đi muộn" className="attendance-reasons-card">
                    <div className="chart-content pie-chart-area">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={classDeepDive.violations}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={45}
                                    outerRadius={70}
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
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Individual Attendance Alerts */}
                <Card title="Cảnh báo chuyên cần cá nhân" className="full-width attendance-alerts-card">
                    <p className="chart-subtitle">Danh sách học sinh có số lần vắng mặt/đi muộn vượt ngưỡng quy định</p>
                    <table className="mini-ranking-table alerts-table">
                        <thead>
                            <tr>
                                <th>Học sinh</th>
                                <th>Lớp</th>
                                <th>Vắng mặt</th>
                                <th>Đi muộn</th>
                                <th>Mức độ</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendanceAlerts.map((student, idx) => (
                                <tr key={idx}>
                                    <td className="bold">{student.name}</td>
                                    <td>{student.class}</td>
                                    <td className={student.absences > 5 ? 'danger-text' : ''}>{student.absences} buổi</td>
                                    <td>{student.lates} lần</td>
                                    <td>
                                        <span className={`tag ${student.absences >= 7 ? 'danger' : 'warning'}`}>
                                            {student.absences >= 7 ? 'Nghiêm trọng' : 'Cảnh cáo'}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="tag info-outline">Lập biên bản</button>
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

export default AttendanceTab;
