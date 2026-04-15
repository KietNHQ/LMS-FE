import { useState } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import * as XLSX from 'xlsx';
import { toast } from "react-toastify";
import { FiDownload } from "react-icons/fi";
import "./PrincipalReports.css";

export default function PrincipalReports() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [filterGrade, setFilterGrade] = useState("all");

    const academicData = [
        { name: 'Giỏi', value: 450 },
        { name: 'Khá', value: 600 },
        { name: 'Trung bình', value: 150 },
        { name: 'Yếu', value: 50 },
    ];
    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

    const attendanceData = [
        { name: 'Khối 10', 'Đi đủ': 95, 'Nghỉ có phép': 3, 'Nghỉ không phép': 2 },
        { name: 'Khối 11', 'Đi đủ': 92, 'Nghỉ có phép': 5, 'Nghỉ không phép': 3 },
        { name: 'Khối 12', 'Đi đủ': 98, 'Nghỉ có phép': 1, 'Nghỉ không phép': 1 },
    ];

    const financeData = [
        { month: 'Tháng 8', 'Doanh thu': 500000000 },
        { month: 'Tháng 9', 'Doanh thu': 800000000 },
        { month: 'Tháng 10', 'Doanh thu': 120000000 },
        { month: 'Tháng 11', 'Doanh thu': 50000000 },
    ];

    const handleExportExcel = () => {
        try {
            const wb = XLSX.utils.book_new();
            const wsAcademic = XLSX.utils.json_to_sheet(academicData);
            const wsAttendance = XLSX.utils.json_to_sheet(attendanceData);
            
            XLSX.utils.book_append_sheet(wb, wsAcademic, "Học lực");
            XLSX.utils.book_append_sheet(wb, wsAttendance, "Chuyên cần");
            
            XLSX.writeFile(wb, `BaoCao_Truong_${selectedSchoolYear}.xlsx`);
            toast.success("Xuất File Excel thành công!");
        } catch (error) {
            toast.error("Xuất File thất bại");
        }
    };

    return (
        <div className="principal-reports">
            <PageHeader
                title="Báo Cáo Thống Kê"
                eyebrow="Phân tích dữ liệu vận hành toàn trường"
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            <div className="reports-actions-bar">
                <div className="report-filters">
                    <select 
                        className="report-select" 
                        value={filterGrade} 
                        onChange={(e) => setFilterGrade(e.target.value)}
                    >
                        <option value="all">Tất cả các khối</option>
                        <option value="10">Khối 10</option>
                        <option value="11">Khối 11</option>
                        <option value="12">Khối 12</option>
                    </select>
                </div>
                <button className="btn-export" onClick={handleExportExcel}>
                    <FiDownload /> Xuất Excel
                </button>
            </div>

            <div className="reports-grid">
                {/* Academic Pie Chart */}
                <div className="report-card">
                    <h3>Phân bố học lực</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={academicData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={110}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {academicData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Attendance Bar Chart */}
                <div className="report-card">
                    <h3>Tỷ lệ chuyên cần theo khối</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={attendanceData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <RechartsTooltip />
                                <Legend />
                                <Bar dataKey="Đi đủ" stackId="a" fill="#10b981" />
                                <Bar dataKey="Nghỉ có phép" stackId="a" fill="#f59e0b" />
                                <Bar dataKey="Nghỉ không phép" stackId="a" fill="#ef4444" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Finance Line Chart */}
                <div className="report-card full-width">
                    <h3>Tiến độ thu học phí</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={financeData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" />
                                <YAxis tickFormatter={(value) => `${value / 1000000}Tr`} />
                                <RechartsTooltip formatter={(value) => `${value.toLocaleString()} VNĐ`} />
                                <Legend />
                                <Line type="monotone" dataKey="Doanh thu" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
