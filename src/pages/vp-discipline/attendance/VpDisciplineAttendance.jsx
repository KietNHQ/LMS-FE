import { useState } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { FiClock, FiXCircle, FiAlertCircle, FiPieChart } from "react-icons/fi";
import "./VpDisciplineAttendance.css";

export default function VpDisciplineAttendance() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();

    const overview = {
        totalPercent: 98.5,
        k10Percent: 99.1,
        k11Percent: 97.5,
        k12Percent: 98.9
    };

    const absentStudents = [
        { id: 1, name: "Nguyễn Văn A", class: "10A1", date: "15/10/2026", reason: "Sốt xuất huyết", type: "excused" },
        { id: 2, name: "Trần Thị B", class: "11A5", date: "15/10/2026", reason: "Không rõ lý do", type: "unexcused" },
        { id: 3, name: "Lê C", class: "12A2", date: "15/10/2026", reason: "Việc gia đình", type: "excused" },
        { id: 4, name: "Hoàng D", class: "11A5", date: "15/10/2026", reason: "Ngủ quên", type: "unexcused" },
    ];

    const topAbsentClasses = [
        { name: "11A5", count: 4 },
        { name: "10A3", count: 2 },
    ];

    const topAbsentStudents = [
        { name: "Trần Thị B", class:"11A5", count: 3 },
        { name: "Nguyễn E", class:"10A3", count: 2 },
    ];

    return (
        <div className="vp-attendance">
            <PageHeader
                title="Quản Lý Chuyên Cần"
                eyebrow="Theo dõi sĩ số và học sinh vắng mặt"
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            <div className="att-overview">
                <div className="att-card primary">
                    <div className="att-info">
                        <span className="att-label">Toàn trường (Hôm nay)</span>
                        <span className="att-val">{overview.totalPercent}%</span>
                    </div>
                    <FiPieChart size={32} color="#93c5fd" />
                </div>
                <div className="att-card">
                    <div className="att-info">
                        <span className="att-label">Khối 10</span>
                        <span className="att-val" style={{fontSize:'1.25rem'}}>{overview.k10Percent}%</span>
                        <span className="absent-val" style={{fontSize:'0.85rem'}}>Vắng 3</span>
                    </div>
                </div>
                <div className="att-card">
                    <div className="att-info">
                        <span className="att-label">Khối 11</span>
                        <span className="att-val" style={{fontSize:'1.25rem'}}>{overview.k11Percent}%</span>
                        <span className="absent-val" style={{fontSize:'0.85rem'}}>Vắng 8</span>
                    </div>
                </div>
                <div className="att-card">
                    <div className="att-info">
                        <span className="att-label">Khối 12</span>
                        <span className="att-val" style={{fontSize:'1.25rem'}}>{overview.k12Percent}%</span>
                        <span className="absent-val" style={{fontSize:'0.85rem'}}>Vắng 2</span>
                    </div>
                </div>
            </div>

            <div className="att-main">
                <div className="att-panel">
                    <div className="att-panel-header">
                        <h3><FiClock /> Danh sách học sinh vắng mặt</h3>
                        <input type="date" className="att-filter" defaultValue="2026-10-15" />
                    </div>
                    
                    <div className="att-table-wrap">
                        <table className="att-table">
                            <thead>
                                <tr>
                                    <th>Học sinh</th>
                                    <th>Lớp</th>
                                    <th>Ngày</th>
                                    <th>Trạng Thái</th>
                                    <th>Lý Do (Sổ Đầu Bài)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {absentStudents.map(student => (
                                    <tr key={student.id}>
                                        <td><strong>{student.name}</strong></td>
                                        <td>{student.class}</td>
                                        <td>{student.date}</td>
                                        <td>
                                            <span className={`status-badge ${student.type}`}>
                                                {student.type === 'excused' ? 'Có phép' : 'Không phép'}
                                            </span>
                                        </td>
                                        <td>{student.reason}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                    <div className="att-panel">
                        <h3 style={{margin: '0 0 1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a'}}>
                            <FiAlertCircle color="#dc2626"/> Lớp vắng nhiều nhất
                        </h3>
                        <div className="stat-list">
                            {topAbsentClasses.map((c, i) => (
                                <div className="stat-item" key={i}>
                                    <div className="stat-info"><strong>Lớp {c.name}</strong></div>
                                    <div className="stat-count">{c.count} lượt vắng</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="att-panel">
                        <h3 style={{margin: '0 0 1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a'}}>
                            <FiXCircle color="#dc2626"/> Cá biệt (Vắng nhiều tuần này)
                        </h3>
                        <div className="stat-list">
                            {topAbsentStudents.map((s, i) => (
                                <div className="stat-item" key={i}>
                                    <div className="stat-info">
                                        <strong>{s.name}</strong>
                                        <span>{s.class}</span>    
                                    </div>
                                    <div className="stat-count">{s.count} ngày vắng</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
