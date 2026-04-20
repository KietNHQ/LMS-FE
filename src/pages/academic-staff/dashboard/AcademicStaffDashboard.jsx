import React from "react";
import { PageHeader, SchoolYearTermSelector, EventCalendar } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { 
    FiUsers, FiUserPlus, FiRepeat, FiBookOpen, 
    FiActivity, FiBookmark, FiAward, FiShield,
    FiAlertTriangle, FiArrowRight, FiDatabase, FiTrendingUp
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import AcademicTimeline from "./components/AcademicTimeline";
import SOPWidget from "./components/SOPWidget";
import { INITIAL_CALENDAR_EVENTS, CALENDAR_EVENT_TYPES } from "../../../components/common/EventCalendar/eventData";
import "./AcademicStaffDashboard.css";

export default function AcademicStaffDashboard() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const navigate = useNavigate();

    // 8 Core Tasks (Tám đường việc)
    const coreTasks = [
        { id: 1, title: "Hồ sơ & Dữ liệu", icon: <FiDatabase />, color: "#4f46e5", desc: "Quản lý hồ sơ gốc, Sổ đăng bộ", path: "/academic/personnel" },
        { id: 2, title: "Tuyển sinh lớp 10", icon: <FiUserPlus />, color: "#0891b2", desc: "Tiếp nhận hồ sơ, nhập học", path: "/academic/class-management?tab=admissions" },
        { id: 3, title: "Chuyển trường", icon: <FiRepeat />, color: "#7c3aed", desc: "Tiếp nhận & chuyển đi", path: "/academic/class-management?tab=transfers" },
        { id: 4, title: "Xếp lớp & TKB", icon: <FiBookOpen />, color: "#2563eb", desc: "Phân lớp, Thời khóa biểu", path: "/academic/timetable" },
        { id: 5, title: "Sĩ số & Chuyên cần", icon: <FiActivity />, color: "#db2777", desc: "Theo dõi vắng học, nghỉ phép", path: "/academic/class-management" },
        { id: 6, title: "Học bạ & Điểm", icon: <FiBookmark />, color: "#d97706", desc: "Khóa sổ, In học bạ điện tử", path: "/academic/academic-records" },
        { id: 7, title: "Thi & Tốt nghiệp", icon: <FiAward />, color: "#059669", desc: "Xét tốt nghiệp, Trả bằng", path: "/academic/academic-records?tab=graduation" },
        { id: 8, title: "Khen thưởng & Kỷ luật", icon: <FiShield />, color: "#dc2626", desc: "Hồ sơ sự vụ, hỗ trợ giáo dục", path: "/academic/academic-records?tab=discipline" },
    ];

    const quickStats = [
        { label: "Tổng học sinh", value: "1,250", change: "+12", icon: <FiUsers />, trend: "up" },
        { label: "Lớp học", value: "35", change: "0", icon: <FiHomeIcon />, trend: "stable" },
        { label: "HS chưa xếp lớp", value: "20", change: "-5", icon: <FiAlertTriangle />, trend: "down", urgent: true },
        { label: "Tiến độ học bạ", value: "75%", change: "+15%", icon: <FiTrendingUp />, trend: "up" },
    ];

    return (
        <div className="academic-dashboard-premium registrar-layout">
            <PageHeader
                title="Cổng Điều Hành Giáo Vụ"
                eyebrow="Quản trị Học vụ & Hồ sơ Pháp lý"
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            <div className="dashboard-layout-grid">
                {/* LEFT COLUMN: MAIN OPS */}
                <div className="dashboard-main-col">
                    {/* 1. Quick Stats */}
                    <div className="premium-stats-grid">
                        {quickStats.map((stat, i) => (
                            <div key={i} className={`p-stat-card ${stat.urgent ? 'urgent' : ''}`}>
                                <div className="p-stat-icon" style={{color: stat.urgent ? '#dc2626' : '#1e2f5a'}}>{stat.icon}</div>
                                <div className="p-stat-info">
                                    <span className="p-stat-label">{stat.label}</span>
                                    <div className="p-stat-value-group">
                                        <h3 className="p-stat-value">{stat.value}</h3>
                                        <span className={`p-stat-change ${stat.trend}`}>
                                            {stat.change}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 2. Core Task Grid (Tám đường việc) */}
                    <div className="section-title">
                        <h3>Tám Đường Việc Cốt Lõi</h3>
                        <p>Điều phối vận hành học vụ và hồ sơ</p>
                    </div>
                    <div className="task-command-grid">
                        {coreTasks.map(task => (
                            <div 
                                key={task.id} 
                                className="task-card"
                                onClick={() => navigate(task.path)}
                                style={{"--accent-color": task.color}}
                            >
                                <div className="task-card-icon">{task.icon}</div>
                                <div className="task-card-body">
                                    <h4>{task.title}</h4>
                                    <p>{task.desc}</p>
                                </div>
                                <div className="task-card-arrow"><FiArrowRight /></div>
                            </div>
                        ))}
                    </div>

                    {/* 3. Academic Timeline */}
                    <div className="section-title" style={{marginTop: '2.5rem'}}>
                        <h3>Chu trình học vụ hằng năm</h3>
                        <p>Kế hoạch đào tạo và vận hành mốc thời gian</p>
                    </div>
                    <AcademicTimeline />

                    {/* 4. Registrar Operational Calendar */}
                    <div style={{marginTop: '2.5rem'}}>
                        <EventCalendar 
                            title="Lịch Vận Hành Nghiệp Vụ"
                            selectedSchoolYear={selectedSchoolYear}
                            selectedTerm={selectedTerm}
                            themeClass="theme-registrar"
                            userRole="admin"
                            isCompact={false}
                            initialEvents={INITIAL_CALENDAR_EVENTS}
                            eventTypes={CALENDAR_EVENT_TYPES}
                            rolePolicy={{
                                canCreate: false,
                                canViewDetails: true,
                                canEdit: false,
                                canDelete: false
                            }}
                        />
                    </div>
                </div>

                {/* RIGHT COLUMN: SOP & LEGAL */}
                <div className="dashboard-side-col">
                    <SOPWidget />
                    
                    <div className="emergency-contact-box">
                        <h4>Hỗ trợ Kỹ thuật & Nghiệp vụ</h4>
                        <p>Liên hệ Admin CNTT khi có sự cố dữ liệu hoặc cần mở khóa sổ điểm.</p>
                        <button className="btn-contact">Gửi yêu cầu hỗ trợ</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FiHomeIcon() {
    return (
        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
    );
}
