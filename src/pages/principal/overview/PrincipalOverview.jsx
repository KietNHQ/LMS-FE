import { useState } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { FiUsers, FiUserCheck, FiAward, FiDollarSign, FiAlertTriangle, FiBookOpen, FiPieChart, FiTrendingUp } from "react-icons/fi";
import "./PrincipalOverview.css";

export default function PrincipalOverview() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [activeTab, setActiveTab] = useState("students");
    
    // MOCK DATA for Demonstration
    const mockStudentData = {
        distribution: [{ grade: "Khối 10", count: 450, trend: "+2%" }, { grade: "Khối 11", count: 420, trend: "-1%" }, { grade: "Khối 12", count: 400, trend: "0%" }],
        atRisk: [
            { id: "HS001", name: "Nguyễn Văn A", class: "10A1", reason: "Nghỉ học > 10 buổi (Cảnh báo Chuyên cần)" },
            { id: "HS002", name: "Trần Thị B", class: "11A5", reason: "Điểm TB môn Toán < 3.5 (Cảnh báo Học lực)" },
            { id: "HS003", name: "Lê Văn C", class: "12A2", reason: "Vi phạm nề nếp nghiêm trọng lần 3" }
        ],
        topStudents: [
            { name: "Phạm A", class: "12A1", gpa: 9.8, rank: 1 },
            { name: "Hoàng B", class: "11A1", gpa: 9.6, rank: 2 }
        ]
    };

    const mockTeacherData = {
        total: 85,
        distribution: [{ subject: "Toán - Tin", count: 18 }, { subject: "Ngôn Ngữ", count: 20 }, { subject: "Tự Nhiên", count: 15 }],
        warnings: [
            { id: 1, name: "Tổ Toán - Khối 10", class: "Khối 10", reason: "70% lớp có kết quả thi GK thấp hơn kỳ vọng" },
            { id: 2, name: "Thầy Lê D", class: "11A2", reason: "Đã trễ 3 ngày so với deadline chốt điểm học bạ" }
        ]
    };

    const mockFinanceData = {
        expected: 15000000000,
        collected: 12500000000,
        debtors: [
            { class: "10A5", amount: 125000000, count: 8 },
            { class: "11A3", amount: 90000000, count: 5 }
        ]
    };

    return (
        <div className="principal-overview">
            <PageHeader
                title="Giám Sát Tổng Hợp"
                eyebrow="Góc nhìn đa chiều về toàn bộ hoạt động của Nhà trường"
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            <div className="overview-tabs">
                <button 
                    className={`overview-tab-btn ${activeTab === 'students' ? 'active' : ''}`}
                    onClick={() => setActiveTab('students')}
                >
                    <FiUsers /> Mạng lưới Học sinh
                </button>
                <button 
                    className={`overview-tab-btn ${activeTab === 'teachers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('teachers')}
                >
                    <FiUserCheck /> Đội ngũ Giáo viên
                </button>
                <button 
                    className={`overview-tab-btn ${activeTab === 'grades' ? 'active' : ''}`}
                    onClick={() => setActiveTab('grades')}
                >
                    <FiAward /> Chất lượng Học thuật
                </button>
                <button 
                    className={`overview-tab-btn ${activeTab === 'finance' ? 'active' : ''}`}
                    onClick={() => setActiveTab('finance')}
                >
                    <FiDollarSign /> Sức khỏe Tài chính
                </button>
            </div>

            <div className="overview-tab-content">
                {activeTab === 'students' && (
                    <div className="ot-grid">
                        <div className="ot-section">
                            <h3 className="ot-section__title"><FiPieChart /> Phân bố Sĩ số & Biến động</h3>
                            <div className="ot-stat-list">
                                {mockStudentData.distribution.map(item => (
                                    <div className="ot-stat-item" key={item.grade}>
                                        <span className="ot-stat-label">{item.grade}</span>
                                        <div style={{textAlign: 'right'}}>
                                            <div className="ot-stat-value">{item.count} HS</div>
                                            <small style={{color: item.trend.startsWith('+') ? '#10b981' : '#ef4444', fontSize: '0.75rem', fontWeight: 600}}>
                                                {item.trend} so với năm trước
                                            </small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="ot-section at-risk">
                            <h3 className="ot-section__title danger"><FiAlertTriangle /> Case Study Cần Quan Tâm</h3>
                            <div className="ot-warn-list">
                                {mockStudentData.atRisk.map(item => (
                                    <div className="ot-warn-item" key={item.id}>
                                        <span className="ot-warn-title">{item.name} - Lớp {item.class}</span>
                                        <span className="ot-warn-desc">{item.reason}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'teachers' && (
                    <div className="ot-grid">
                        <div className="ot-section">
                            <h3 className="ot-section__title"><FiUsers /> Cơ cấu Nhân sự (Tổng {mockTeacherData.total} GV)</h3>
                            <div className="ot-stat-list">
                                {mockTeacherData.distribution.map(item => (
                                    <div className="ot-stat-item" key={item.subject}>
                                        <span className="ot-stat-label">Khối {item.subject}</span>
                                        <span className="ot-stat-value">{item.count} Nhân sự</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="ot-section at-risk">
                            <h3 className="ot-section__title danger"><FiAlertTriangle /> Hiệu suất Giảng dạy & Kỷ luật</h3>
                            <div className="ot-warn-list">
                                {mockTeacherData.warnings.map(item => (
                                    <div className="ot-warn-item" key={item.id}>
                                        <span className="ot-warn-title">{item.name}</span>
                                        <span className="ot-warn-desc">{item.reason}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'grades' && (
                    <div className="ot-grid">
                        <div className="ot-section">
                            <h3 className="ot-section__title"><FiAward /> Radar Chất lượng Học thuật</h3>
                            <div className="ot-stat-list">
                                <div className="ot-stat-item">
                                    <span className="ot-stat-label">GPA Trung bình Toàn trường</span>
                                    <span className="ot-stat-value" style={{color: '#2563eb'}}>7.4 / 10.0</span>
                                </div>
                                <div className="ot-stat-item">
                                    <span className="ot-stat-label">Tỷ lệ Tốt nghiệp Dự kiến</span>
                                    <span className="ot-stat-value">98.5 %</span>
                                </div>
                            </div>
                        </div>
                        <div className="ot-section" style={{background: '#f0fdfa', borderColor: '#ccfbf1'}}>
                            <h3 className="ot-section__title" style={{color: '#0d9488'}}><FiTrendingUp /> Đỉnh cao Thành tích</h3>
                            <div className="ot-stat-list">
                                {mockStudentData.topStudents.map(item => (
                                    <div className="ot-stat-item" key={item.name} style={{background: '#ffffff'}}>
                                        <span className="ot-stat-label">Hạng {item.rank}: {item.name}</span>
                                        <span className="ot-stat-value" style={{color: '#0d9488'}}>{item.gpa} GPA</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'finance' && (
                    <div className="ot-grid">
                        <div className="ot-section finance">
                            <h3 className="ot-section__title" style={{color: '#166534'}}><FiDollarSign /> Tổng quan Dòng tiền</h3>
                            <div className="ot-stat-list">
                                <div className="ot-stat-item">
                                    <span className="ot-stat-label">Dự kiến thu Học kỳ</span>
                                    <span className="ot-stat-value">{(mockFinanceData.expected / 1000000000).toFixed(1)} Tỷ đ</span>
                                </div>
                                <div className="ot-stat-item">
                                    <span className="ot-stat-label">Đã quyết toán (Thực thu)</span>
                                    <span className="ot-stat-value" style={{color: '#10b981'}}>{(mockFinanceData.collected / 1000000000).toFixed(1)} Tỷ đ</span>
                                </div>
                            </div>
                        </div>
                        <div className="ot-section at-risk">
                            <h3 className="ot-section__title danger"><FiAlertTriangle /> Điểm nóng Nợ đọng</h3>
                            <div className="ot-warn-list">
                                {mockFinanceData.debtors.map(item => (
                                    <div className="ot-warn-item" key={item.class}>
                                        <span className="ot-warn-title">Lớp {item.class} ({item.count} HS trễ nộp)</span>
                                        <span className="ot-warn-desc">Số tiền nợ: {item.amount.toLocaleString()} đ</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
