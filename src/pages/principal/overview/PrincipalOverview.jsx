import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { 
    FiUsers, FiUserCheck, FiAward, FiDollarSign, FiAlertTriangle, 
    FiPieChart, FiTrendingUp, FiCheckCircle, FiActivity, FiArrowRight,
    FiChevronDown, FiChevronUp, FiLogOut, FiArrowLeft
} from "react-icons/fi";
import TeacherStructure from "./components/TeacherStructure";
import "./PrincipalOverview.css";

export default function PrincipalOverview() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const tabParam = searchParams.get("tab");
    const [activeTab, setActiveTab] = useState(tabParam || "students");
    const [showArrearsModal, setShowArrearsModal] = useState(false);
    const [selectedMonthIndex, setSelectedMonthIndex] = useState(5); // Latest month by default
    const ITEMS_PER_PAGE = 8;

    // State for dropdowns
    const [expandedGrade, setExpandedGrade] = useState(null);
    const [academicView, setAcademicView] = useState("overview"); // overview, teachers, students
    const [academicFilter, setAcademicFilter] = useState({ subject: "Tất cả", grade: "Tất cả" });
    const [studentPage, setStudentPage] = useState(1);

    useEffect(() => {
        if (tabParam && tabParam !== activeTab) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSearchParams({ tab });
    };

    const toggleGrade = (grade) => {
        setExpandedGrade(expandedGrade === grade ? null : grade);
    };
    
    // MOCK DATA for Demonstration
    const mockStudentData = {
        distribution: [
            { 
                grade: "Khối 10", count: 450, trend: "+2%", 
                paymentRate: "92%", attendanceRate: "97.5%", gpa: 7.6,
                classes: [
                    { id: "10A1", students: 42, attendance: "98%", gpa: 7.8 },
                    { id: "10A2", students: 40, attendance: "95%", gpa: 7.5 },
                    { id: "10A3", students: 45, attendance: "97%", gpa: 8.0 }
                ]
            }, 
            { 
                grade: "Khối 11", count: 420, trend: "-1%",
                paymentRate: "88%", attendanceRate: "95.2%", gpa: 7.4,
                classes: [
                    { id: "11A1", students: 38, attendance: "96%", gpa: 7.9 },
                    { id: "11A2", students: 40, attendance: "92%", gpa: 7.2 },
                ]
            }, 
            { 
                grade: "Khối 12", count: 400, trend: "0%",
                paymentRate: "95%", attendanceRate: "98.8%", gpa: 8.1,
                classes: [
                    { id: "12A1", students: 44, attendance: "99%", gpa: 8.5 },
                    { id: "12A2", students: 41, attendance: "97%", gpa: 7.6 },
                ]
            }
        ],
        atRisk: [
            { id: "HS001", name: "Nguyễn Văn A", class: "10A1", reason: "Nghỉ học > 10 buổi (Cảnh báo Chuyên cần)", action: "Thúc giục GVCN" },
            { id: "HS002", name: "Trần Thị B", class: "11A5", reason: "Điểm TB môn Toán < 3.5 (Cảnh báo Học lực)", action: "Xem học bạ" },
            { id: "HS003", name: "Lê Văn C", class: "12A2", reason: "Vi phạm nề nếp nghiêm trọng lần 3", action: "Yêu cầu kỷ luật" }
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
        summary: {
            expected: 15450000000,
            collected: 12820000000,
            completionRate: 83,
            trend: "+3.2%",
            status: "stable", // stable, warning, critical
            remaining: 2630000000
        },
        debtors: [
            { class: "10A5", amount: 125000000, count: 8, severity: "danger", lastNotice: "2 ngày trước" },
            { class: "11A3", amount: 90000000, count: 5, severity: "warning", lastNotice: "1 tuần trước" },
            { class: "12A2", amount: 215000000, count: 12, severity: "danger", lastNotice: "Hôm qua" }
        ],
        monthlyData: [
            { month: "Tháng 11", expected: 2100, collected: 1950 },
            { month: "Tháng 12", expected: 2400, collected: 2100 },
            { month: "Tháng 1", expected: 1800, collected: 1650 },
            { month: "Tháng 2", expected: 2500, collected: 2300 },
            { month: "Tháng 3", expected: 2800, collected: 2450 },
            { month: "Tháng 4", expected: 3000, collected: 2400 }
        ]
    };

    const mockAcademicData = {
        // ... (keep academic data as is)
    };

    // DYNAMIC FINANCE DATA LOGIC
    const getFinanceData = () => {
        const isHK2 = selectedTerm === 'hk2';
        const isCurrentYear = selectedSchoolYear === '2025-2026';
        
        // Base values that shift slightly based on year/term for realism
        const multiplier = isCurrentYear ? 1.0 : 0.92;
        const termOffset = isHK2 ? 1.1 : 1.0;

        const expected = 15450000000 * multiplier * termOffset;
        const collected = isHK2 ? (expected * 0.78) : (expected * 0.92);
        const completionRate = Math.round((collected / expected) * 100);
        
        const monthlyData = isHK2 
            ? [
                { month: "Tháng 2", income: 2500, expense: 1800, trend: "+5.2%", expenseTrend: "+4.1%" },
                { month: "Tháng 3", income: 2800, expense: 2100, trend: "+12.0%", expenseTrend: "+16.6%" },
                { month: "Tháng 4", income: 3000, expense: 2200, trend: "+7.1%", expenseTrend: "+4.7%" },
                { month: "Tháng 5", income: 2700, expense: 1900, trend: "-10.0%", expenseTrend: "-13.6%" },
                { month: "Tháng 6", income: 2200, expense: 2400, trend: "-18.5%", expenseTrend: "+26.3%" },
                { month: "Tháng 7", income: 1500, expense: 1200, trend: "-31.8%", expenseTrend: "-50.0%" }
            ]
            : [
                { month: "Tháng 9", income: 3500, expense: 2100, trend: "+2.1%", expenseTrend: "+1.2%" },
                { month: "Tháng 10", income: 2200, expense: 1900, trend: "-37.1%", expenseTrend: "-9.5%" },
                { month: "Tháng 11", income: 2100, expense: 2300, trend: "-4.5%", expenseTrend: "+21.0%" },
                { month: "Tháng 12", income: 2400, expense: 2800, trend: "+14.2%", expenseTrend: "+21.7%" },
                { month: "Tháng 1", income: 1800, expense: 1500, trend: "-25.0%", expenseTrend: "-46.4%" },
                { month: "Tháng 2", income: 1000, expense: 1100, trend: "-44.4%", expenseTrend: "-26.6%" }
            ];

        const currentMonthData = monthlyData[selectedMonthIndex] || monthlyData[5];

        return {
            summary: {
                currentMonthIncome: currentMonthData.income,
                currentMonthExpense: currentMonthData.expense,
                totalTermIncome: collected,
                totalTermExpense: isHK2 ? (collected * 0.65) : (collected * 0.55),
                expected,
                collected,
                completionRate,
                trend: currentMonthData.trend,
                expenseTrend: currentMonthData.expenseTrend,
                monthName: currentMonthData.month,
                status: completionRate > 90 ? "stable" : completionRate > 80 ? "warning" : "critical",
                remaining: expected - collected,
                comparisonLabel: "vs tháng trước"
            },
            // Generate more mock debtors if needed for pagination demo
            debtors: [
                { class: "10A5", amount: 125000000, count: 8, severity: "danger", lastNotice: "2 ngày trước", teacher: "Nguyễn Văn A" },
                { class: "11A3", amount: 90000000, count: 5, severity: "warning", lastNotice: "1 tuần trước", teacher: "Lê Thị B" },
                { class: "12A2", amount: 215000000, count: 12, severity: "danger", lastNotice: "Hôm qua", teacher: "Trần Văn C" },
                { class: "10A1", amount: 45000000, count: 3, severity: "warning", lastNotice: "3 ngày trước", teacher: "Phạm Thị D" },
                { class: "11B2", amount: 310000000, count: 15, severity: "danger", lastNotice: "5 ngày trước", teacher: "Vũ Văn E" },
                { class: "10C1", amount: 12000000, count: 2, severity: "warning", lastNotice: "2 ngày trước", teacher: "Hoàng Văn F" },
                { class: "12A5", amount: 85000000, count: 6, severity: "danger", lastNotice: "Hôm nay", teacher: "Ngô Thị G" },
                { class: "11A1", amount: 25000000, count: 2, severity: "warning", lastNotice: "6 ngày trước", teacher: "Bùi Văn H" },
                { class: "10B3", amount: 150000000, count: 9, severity: "danger", lastNotice: "Hôm qua", teacher: "Lý Văn I" },
                { class: "12C2", amount: 30000000, count: 4, severity: "warning", lastNotice: "4 ngày trước", teacher: "Phan Thị J" },
            ],
            monthlyData
        };
    };

    const financeData = getFinanceData();

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="principal-overview">
            <PageHeader
                title="Giám Sát Tổng Hợp"
                eyebrow=""
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
                    onClick={() => handleTabChange('students')}
                >
                    <FiUsers /> Mạng lưới Học sinh
                </button>
                <button 
                    className={`overview-tab-btn ${activeTab === 'teachers' ? 'active' : ''}`}
                    onClick={() => handleTabChange('teachers')}
                >
                    <FiUserCheck /> Đội ngũ Giáo viên
                </button>
                <button 
                    className={`overview-tab-btn ${activeTab === 'grades' ? 'active' : ''}`}
                    onClick={() => handleTabChange('grades')}
                >
                    <FiAward /> Chất lượng Học thuật
                </button>
                <button 
                    className={`overview-tab-btn ${activeTab === 'finance' ? 'active' : ''}`}
                    onClick={() => handleTabChange('finance')}
                >
                    <FiDollarSign /> Sức khỏe Tài chính
                </button>
            </div>

            <div className="overview-tab-content">
                {activeTab === 'students' && (
                    <div className="ot-grid ot-grid--vertical">
                        <div className="ot-section distribution-card">
                            <h3 className="ot-section__title"><FiPieChart /> Phân bố Sĩ số & Biến động</h3>
                            <div className="ot-distribution-row">
                                {mockStudentData.distribution.map(item => (
                                    <div className={`ot-distribution-item ${expandedGrade === item.grade ? 'is-expanded' : ''}`} key={item.grade}>
                                        <div className="ot-dist-main" onClick={() => toggleGrade(item.grade)}>
                                            <div className="ot-dist-header">
                                                <div className="ot-dist-title-box">
                                                    <span className="ot-dist-label">{item.grade}</span>
                                                    <div className="ot-dist-primary">
                                                        <span className="ot-dist-value">{item.count} HS</span>
                                                        <small className={`ot-trend ${item.trend.startsWith('+') ? 'up' : 'down'}`}>
                                                            {item.trend}
                                                        </small>
                                                    </div>
                                                </div>

                                                <div className="ot-dist-metrics-row">
                                                    <div className="ot-metric-pill">
                                                        <span className="omp-label">Đóng tiền</span>
                                                        <span className="omp-value">{item.paymentRate}</span>
                                                    </div>
                                                    <div className="ot-metric-pill">
                                                        <span className="omp-label">Chuyên cần</span>
                                                        <span className="omp-value">{item.attendanceRate}</span>
                                                    </div>
                                                    <div className="ot-metric-pill">
                                                        <span className="omp-label">GPA Khối</span>
                                                        <span className="omp-value">{item.gpa}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <button className="ot-dist-toggle">
                                                {expandedGrade === item.grade ? <FiChevronUp /> : <FiChevronDown />}
                                            </button>
                                        </div>
                                        
                                        {expandedGrade === item.grade && (
                                            <div className="ot-dist-dropdown">
                                                <div className="ot-class-list">
                                                    {item.classes.map(cls => (
                                                        <div 
                                                            className="ot-class-item" 
                                                            key={cls.id}
                                                            onClick={() => navigate(`/principal/classes/${cls.id}`)}
                                                        >
                                                            <div className="ot-class-name">Lớp {cls.id}</div>
                                                            <div className="ot-class-stats">
                                                                <span>{cls.students} HS</span>
                                                                <span>{cls.attendance} Chuyên cần</span>
                                                                <span>{cls.gpa} GPA</span>
                                                            </div>
                                                            <FiArrowRight className="ot-class-arrow" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="ot-section at-risk">
                            <h3 className="ot-section__title danger"><FiAlertTriangle /> Cần Quan Tâm</h3>
                            <div className="ot-warn-grid">
                                {mockStudentData.atRisk.map(item => (
                                    <div className="ot-attention-card" key={item.id}>
                                        <div className="ot-attention-content">
                                            <div className="ot-attention-header">
                                                <span className="ot-attention-target">{item.name} - Lớp {item.class}</span>
                                                <span className="ot-attention-pill">Học sinh</span>
                                            </div>
                                            <p className="ot-attention-message">{item.reason}</p>
                                        </div>
                                        <button className="ot-attention-btn" onClick={() => navigate(`/principal/classes/${item.class}`)}>
                                            {item.action} <FiArrowRight />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'teachers' && (
                    <div className="ot-grid ot-grid--vertical">
                        <TeacherStructure teacherData={mockTeacherData} />
                        <div className="ot-section at-risk">
                            <h3 className="ot-section__title danger"><FiAlertTriangle /> Hiệu suất Giảng dạy & Kỷ luật</h3>
                            <div className="ot-warn-list">
                                {mockTeacherData.warnings.map(item => (
                                    <div className="ot-attention-card" key={item.id}>
                                        <div className="ot-attention-content">
                                            <span className="ot-attention-target">{item.name}</span>
                                            <p className="ot-attention-message">{item.reason}</p>
                                        </div>
                                        <button className="ot-attention-btn">
                                            Chi tiết <FiArrowRight />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'grades' && (
                    <div className="academic-container">
                        <div className="academic-content">
                            {academicView === 'overview' && (
                                <div className="ac-overview-grid">
                                    <div className="ac-summary-cards">
                                        <div className="ac-main-stat gpa-card">
                                            <div className="stat-icon-wrap"><FiActivity /></div>
                                            <div className="stat-details">
                                                <span className="stat-label">GPA Toàn kỳ</span>
                                                <div className="stat-row">
                                                    <span className="stat-value">7.4<small>/10</small></span>
                                                    <span className="stat-trend neutral">0.0% vs năm trước</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ac-main-stat grad-card">
                                            <div className="stat-icon-wrap"><FiCheckCircle /></div>
                                            <div className="stat-details">
                                                <span className="stat-label">Dự kiến Tốt nghiệp</span>
                                                <div className="stat-row">
                                                    <span className="stat-value">98.5%</span>
                                                    <span className="stat-trend up">+0.5% vs năm trước</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="ac-subject-list">
                                        {mockAcademicData.subjects.map(sub => (
                                            <div key={sub.name} className="ac-subject-strip">
                                                <div className="acs-left">
                                                    <span className="as-name">{sub.name}</span>
                                                    <div className="as-score-badge">
                                                        <span className="as-val">{sub.avg}</span>
                                                        <span className={`as-trend-badge ${sub.status}`}>{sub.trend}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="acs-center">
                                                    <div className="ac-achievement-tag">
                                                        <FiAward /> 
                                                        <span>{sub.name === 'Toán học' ? '3 HS Giỏi, 2 Huy chương' : sub.name === 'Ngữ văn' ? '5 HS Giỏi' : 'Xếp loại A'}</span>
                                                    </div>
                                                </div>

                                                <div className="acs-right">
                                                    <div className="ac-strip-meta">
                                                        <span className="ami-count"><b>{mockAcademicData.teachers.filter(t => t.subject === sub.name).length || 2}</b> GV</span>
                                                    </div>
                                                    <div className="ac-strip-actions">
                                                        <button 
                                                            className="ac-mini-btn teachers"
                                                            onClick={() => { setAcademicView('teachers'); setAcademicFilter({ ...academicFilter, subject: sub.name }); }}
                                                            title="Xem Giáo viên"
                                                        >
                                                            <FiUserCheck /> GV
                                                        </button>
                                                        <button 
                                                            className="ac-mini-btn students"
                                                            onClick={() => { setAcademicView('students'); setAcademicFilter({ ...academicFilter, subject: sub.name }); setStudentPage(1); }}
                                                            title="Xem Học sinh"
                                                        >
                                                            <FiUsers /> HS
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {academicView === 'teachers' && (
                                <div className="ac-teacher-matrix">
                                    <div className="ac-table-header">
                                        <div className="ac-header-left">
                                            <button className="ac-back-btn" onClick={() => setAcademicView('overview')}>
                                                <FiArrowLeft /> Quay lại
                                            </button>
                                            <h3>Hiệu suất Giáo viên {academicFilter.subject !== "Tất cả" && `- ${academicFilter.subject}`}</h3>
                                        </div>
                                        <div className="ac-header-right">
                                            <div className="ac-filter-group">
                                                <select 
                                                    value={academicFilter.subject}
                                                    onChange={(e) => setAcademicFilter({...academicFilter, subject: e.target.value})}
                                                >
                                                    <option>Tất cả</option>
                                                    {mockAcademicData.subjects.map(s => <option key={s.name}>{s.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="ac-term-indicator">{selectedTerm === 'hk1' ? 'Học kỳ 1' : 'Học kỳ 2'}</div>
                                        </div>
                                    </div>
                                    <div className="ot-table-wrapper">
                                        <table className="ac-table">
                                            <thead>
                                                <tr>
                                                    <th>Giáo viên</th>
                                                    <th>Môn học</th>
                                                    <th>Điểm Giảng dạy</th>
                                                    <th>Điểm HK1</th>
                                                    <th>Điểm HK2</th>
                                                    <th>TB Năm</th>
                                                    <th>So sánh</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {mockAcademicData.teachers
                                                    .filter(t => (academicFilter.subject === "Tất cả" || t.subject === academicFilter.subject))
                                                    .map(t => (
                                                    <tr key={t.id}>
                                                        <td>
                                                            <div className="ac-prof-box">
                                                                <span className="ac-avatar gv-v">{t.avatar}</span>
                                                                <span>{t.name}</span>
                                                            </div>
                                                        </td>
                                                        <td>{t.subject}</td>
                                                        <td>
                                                            <div className="ac-score-bar-wrap">
                                                                <div className="ac-score-bar" style={{width: `${t.score * 10}%`}}></div>
                                                                <span>{t.score}</span>
                                                            </div>
                                                        </td>
                                                        <td>{t.hk1}</td>
                                                        <td>{t.hk2}</td>
                                                        <td className="bold">{t.avg}</td>
                                                        <td>
                                                            <span className={`ac-comp-pill ${t.hk2 >= t.hk1 ? 'up' : 'down'}`}>
                                                                {t.hk2 >= t.hk1 ? <FiTrendingUp /> : <FiActivity />} 
                                                                {Math.abs(t.hk2 - t.hk1).toFixed(1)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {academicView === 'students' && (
                                <div className="ac-student-leaderboard">
                                    <div className="ac-table-header">
                                        <div className="ac-header-left">
                                            <button className="ac-back-btn" onClick={() => setAcademicView('overview')}>
                                                <FiArrowLeft /> Quay lại
                                            </button>
                                            <h3>Học sinh Tiêu biểu {academicFilter.subject !== "Tất cả" && `- ${academicFilter.subject}`}</h3>
                                        </div>
                                        <div className="ac-filter-bar">
                                            <div className="ac-filter-group">
                                                <label>Môn học:</label>
                                                <select 
                                                    value={academicFilter.subject}
                                                    onChange={(e) => {
                                                        setAcademicFilter({...academicFilter, subject: e.target.value});
                                                        setStudentPage(1);
                                                    }}
                                                >
                                                    <option>Tất cả</option>
                                                    {mockAcademicData.subjects.map(s => <option key={s.name}>{s.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="ac-filter-group">
                                                <label>Khối:</label>
                                                <select 
                                                    value={academicFilter.grade}
                                                    onChange={(e) => {
                                                        setAcademicFilter({...academicFilter, grade: e.target.value});
                                                        setStudentPage(1);
                                                    }}
                                                >
                                                    <option>Tất cả</option>
                                                    <option>Khối 10</option>
                                                    <option>Khối 11</option>
                                                    <option>Khối 12</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="ot-table-wrapper">
                                        <table className="ac-table">
                                            <thead>
                                                <tr>
                                                    <th>Hạng</th>
                                                    <th>Học sinh</th>
                                                    <th>Lớp</th>
                                                    <th>Môn học</th>
                                                    <th>Điểm số</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(() => {
                                                    const filtered = mockAcademicData.students
                                                        .filter(s => (academicFilter.subject === "Tất cả" || s.subject === academicFilter.subject))
                                                        .filter(s => (academicFilter.grade === "Tất cả" || s.grade === academicFilter.grade));
                                                    
                                                    return filtered.slice((studentPage - 1) * 10, studentPage * 10).map((s, idx) => (
                                                        <tr key={s.id} className={s.rank <= 10 ? 'top-highlight' : ''}>
                                                            <td className="rank-cell">
                                                                {s.rank <= 3 ? (
                                                                    <span className={`medal medal--${s.rank}`}>{s.rank}</span>
                                                                ) : s.rank}
                                                            </td>
                                                            <td>
                                                                <div className="ac-prof-box">
                                                                    <span className="ac-avatar hs-v">{s.name.charAt(0)}</span>
                                                                    <span>{s.name}</span>
                                                                </div>
                                                            </td>
                                                            <td>{s.class}</td>
                                                            <td>{s.subject}</td>
                                                            <td className="bold">{s.score}</td>
                                                        </tr>
                                                    ));
                                                })()}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="ac-pagination">
                                        {(() => {
                                            const filteredCount = mockAcademicData.students
                                                .filter(s => (academicFilter.subject === "Tất cả" || s.subject === academicFilter.subject))
                                                .filter(s => (academicFilter.grade === "Tất cả" || s.grade === academicFilter.grade)).length;
                                            const totalPages = Math.ceil(filteredCount / 10) || 1;
                                            
                                            return (
                                                <>
                                                    <button 
                                                        disabled={studentPage === 1}
                                                        onClick={() => setStudentPage(p => p - 1)}
                                                    >
                                                        Trước
                                                    </button>
                                                    <span>Trang {studentPage} / {totalPages}</span>
                                                    <button 
                                                        disabled={studentPage >= totalPages}
                                                        onClick={() => setStudentPage(p => p + 1)}
                                                    >
                                                        Sau
                                                    </button>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'finance' && (
                    <div className="pfin-tab-container">
                        <div className="pfin-header-row">
                            <div className="pfin-health-badge">
                                <span className={`phb-dot phb-dot--${mockFinanceData.summary.status}`}></span>
                                <span className="phb-text">Sức khỏe tài chính: <b>{mockFinanceData.summary.status === 'stable' ? 'Ổn định' : 'Cần lưu ý'}</b></span>
                            </div>
                            <div className="pfin-last-update">Cập nhật: 10:25 AM, Hôm nay</div>
                        </div>

                        <div className="pfin-kpi-grid">
                            <div className="pfin-kpi-card glass-morph">
                                <div className="pkpi-icon pkpi-icon--income"><FiDollarSign /></div>
                                <div className="pkpi-info">
                                    <span className="pkpi-label">Thu nhập {financeData.summary.monthName}</span>
                                    <span className="pkpi-value">{(financeData.summary.currentMonthIncome / 1000).toFixed(1)} Tỷ đ</span>
                                    <div className="pkpi-subtext-row">
                                        <span className={`pkpi-trend ${financeData.summary.trend.startsWith('+') ? 'up' : 'down'}`}>
                                            {financeData.summary.trend} <small>{financeData.summary.comparisonLabel}</small>
                                        </span>
                                        <span className="pkpi-term-total">Tổng kỳ: <b>{(financeData.summary.totalTermIncome / 1000000000).toFixed(1)}B</b></span>
                                    </div>
                                </div>
                            </div>
                            <div className="pfin-kpi-card glass-morph">
                                <div className="pkpi-icon pkpi-icon--expense"><FiLogOut /></div>
                                <div className="pkpi-info">
                                    <span className="pkpi-label">Chi tiêu {financeData.summary.monthName}</span>
                                    <span className="pkpi-value">{(financeData.summary.currentMonthExpense / 1000).toFixed(1)} Tỷ đ</span>
                                    <div className="pkpi-subtext-row">
                                        <span className={`pkpi-trend ${financeData.summary.expenseTrend.startsWith('+') ? 'up' : 'down'}`}>
                                            {financeData.summary.expenseTrend} <small>{financeData.summary.comparisonLabel}</small>
                                        </span>
                                        <span className="pkpi-term-total">Tổng kỳ: <b>{(financeData.summary.totalTermExpense / 1000000000).toFixed(1)}B</b></span>
                                    </div>
                                </div>
                            </div>
                            <div className="pfin-kpi-card glass-morph highlight">
                                <div className="pkpi-icon pkpi-icon--rate"><FiActivity /></div>
                                <div className="pkpi-info">
                                    <span className="pkpi-label">Tiến độ thu học kỳ</span>
                                    <div className="pkpi-value-row">
                                        <span className="pkpi-value">{financeData.summary.completionRate}%</span>
                                        <div className="pkpi-mini-progress">
                                            <div className="pmp-fill" style={{width: `${financeData.summary.completionRate}%`}}></div>
                                        </div>
                                    </div>
                                    <span className="pkpi-remaining">Còn phải thu: <b>{(financeData.summary.remaining / 1000000000).toFixed(1)} Tỷ đ</b></span>
                                </div>
                            </div>
                        </div>

                        <div className="pfin-overview-grid">
                            <div className="pfin-section">
                                <div className="pfin-section-header">
                                    <h3 className="pfin-section__title"><FiAlertTriangle style={{color: '#dc2626'}} /> Điểm nóng Nợ đọng</h3>
                                    <button className="pfin-view-all" onClick={() => setShowArrearsModal(true)}>Xem tất cả</button>
                                </div>
                                <div className="pfin-hotspots-list">
                                    {financeData.debtors.slice(0, 3).map((item, index) => (
                                        <div key={index} className="pfin-hotspot-item">
                                            <div className="phot-left">
                                                <div className="phot-info">
                                                    <span className="phot-class">Lớp {item.class}</span>
                                                    <span className={`pfin-pill pfin-pill--${item.severity}`}>
                                                        {item.severity === 'danger' ? 'Khẩn cấp' : 'Nhắc nhở'}
                                                    </span>
                                                </div>
                                                <div className="phot-sub">Gửi báo cáo: {item.lastNotice}</div>
                                            </div>
                                            <div className="phot-right">
                                                <div className="phot-stats">
                                                    <span className="phot-debt">{formatCurrency(item.amount)}</span>
                                                    <span className="phot-count">{item.count} HS</span>
                                                </div>
                                                <button className="phot-action-btn" title="Gửi nhắc nhở cho GVCN">
                                                    <FiActivity />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pfin-section">
                                <div className="pfin-section-header">
                                    <h3 className="pfin-section__title"><FiTrendingUp style={{color: 'var(--admin-primary)'}} /> Phân tích Xu hướng Thu - Chi</h3>
                                    <div className="pfin-chart-legend">
                                        <span className="legend-item"><i className="dot income"></i> Thu nhập</span>
                                        <span className="legend-item"><i className="dot expense"></i> Chi tiêu</span>
                                    </div>
                                </div>
                                <div className="pfin-overview-chart">
                                    <div className="chart-y-axis">
                                        <span>4B</span>
                                        <span>3B</span>
                                        <span>2B</span>
                                        <span>1B</span>
                                        <span>0</span>
                                    </div>
                                    <div className="chart-bars-container">
                                        {financeData.monthlyData.map((data, i) => (
                                            <div 
                                                key={i} 
                                                className={`chart-col-group ${selectedMonthIndex === i ? 'is-active' : ''}`}
                                                onClick={() => setSelectedMonthIndex(i)}
                                            >
                                                <div className="chart-bars-pair">
                                                    <div className="bar bar--income" style={{height: `${(data.income / 4000) * 100}%`}}>
                                                        <div className="bar-tooltip">{data.income}M</div>
                                                    </div>
                                                    <div className="bar bar--expense" style={{height: `${(data.expense / 4000) * 100}%`}}>
                                                        <div className="bar-tooltip">{data.expense}M</div>
                                                    </div>
                                                </div>
                                                <span className="chart-x-label">{data.month.split(' ')[1]}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ARREARS MODAL */}
            {showArrearsModal && (
                <div className="pmodal-overlay" onClick={() => setShowArrearsModal(false)}>
                    <div className="pmodal-container arrears-modal" onClick={e => e.stopPropagation()}>
                        <div className="pmodal-header">
                            <div className="pmh-left">
                                <h3>Chi tiết Nợ đọng học phí</h3>
                                <span>{selectedTerm === 'hk1' ? 'Học kỳ 1' : 'Học kỳ 2'} - Năm học {selectedSchoolYear}</span>
                            </div>
                            <button className="pmodal-close" onClick={() => setShowArrearsModal(false)}>&times;</button>
                        </div>
                        <div className="pmodal-body">
                            <div className="pmodal-stats-row">
                                <div className="pms-card">
                                    <span className="pms-label">Tổng nợ đọng</span>
                                    <span className="pms-value danger">{formatCurrency(financeData.summary.remaining)}</span>
                                </div>
                                <div className="pms-card">
                                    <span className="pms-label">Số lớp nợ</span>
                                    <span className="pms-value">{financeData.debtors.length} lớp</span>
                                </div>
                                <div className="pms-card">
                                    <span className="pms-label">Số học sinh nợ</span>
                                    <span className="pms-value">{financeData.debtors.reduce((acc, curr) => acc + curr.count, 0)} HS</span>
                                </div>
                            </div>
                            <div className="pm-table-wrapper">
                                <table className="pm-table">
                                    <thead>
                                        <tr>
                                            <th>Lớp</th>
                                            <th>Khối</th>
                                            <th>Giáo viên Chủ nhiệm</th>
                                            <th>Số học sinh nợ</th>
                                            <th>Tổng tiền nợ</th>
                                            <th>Mức độ</th>
                                            <th>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {financeData.debtors.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="bold">{item.class}</td>
                                                <td>{item.class.startsWith('10') ? 'Khối 10' : item.class.startsWith('11') ? 'Khối 11' : 'Khối 12'}</td>
                                                <td>{item.teacher}</td>
                                                <td>{item.count} HS</td>
                                                <td className="danger bold">{formatCurrency(item.amount)}</td>
                                                <td>
                                                    <span className={`pfin-pill pfin-pill--${item.severity}`}>
                                                        {item.severity === 'danger' ? 'Khẩn cấp' : 'Nhắc nhở'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button className="pm-action-btn secondary">Gửi nhắc nhở</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="pmodal-footer">
                            <button className="pmodal-btn primary" onClick={() => setShowArrearsModal(false)}>Hoàn tất</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
