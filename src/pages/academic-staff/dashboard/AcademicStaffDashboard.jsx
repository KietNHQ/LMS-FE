import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader, SchoolYearTermSelector, EventCalendar } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import {
    FiUsers, FiUserPlus, FiRepeat, FiBookOpen,
    FiActivity, FiBookmark, FiAward, FiShield,
    FiArrowRight, FiDatabase, FiTrendingUp,
    FiClock, FiCalendar, FiBriefcase, FiAlertTriangle,
    FiCheck, FiBook, FiZap, FiList, FiChevronRight
} from "react-icons/fi";
import { INITIAL_CALENDAR_EVENTS, CALENDAR_EVENT_TYPES } from "../../../components/common/EventCalendar/eventData";
import "./AcademicStaffDashboard.css";

/* ============================================================
   DATA
   ============================================================ */
const CORE_TASKS = [
    { id: 1, title: "Hồ sơ & Dữ liệu",      icon: <FiDatabase />,  color: "#4f46e5", desc: "Hồ sơ gốc, Sổ đăng bộ",          path: "/academic/personnel" },
    { id: 2, title: "Tuyển sinh lớp 10",     icon: <FiUserPlus />,  color: "#0891b2", desc: "Tiếp nhận hồ sơ, nhập học",       path: "/academic/class-management?tab=admissions" },
    { id: 3, title: "Chuyển trường",          icon: <FiRepeat />,    color: "#7c3aed", desc: "Tiếp nhận & chuyển đi",           path: "/academic/class-management?tab=transfers" },
    { id: 4, title: "Xếp lớp & TKB",         icon: <FiBookOpen />,  color: "#2563eb", desc: "Phân lớp, Thời khóa biểu",        path: "/academic/timetable" },
    { id: 5, title: "Sĩ số & Chuyên cần",    icon: <FiActivity />,  color: "#db2777", desc: "Theo dõi vắng, nghỉ phép",        path: "/academic/class-management" },
    { id: 6, title: "Học bạ & Điểm",         icon: <FiBookmark />,  color: "#d97706", desc: "Khóa sổ, in học bạ điện tử",      path: "/academic/academic-records" },
    { id: 7, title: "Thi & Tốt nghiệp",      icon: <FiAward />,     color: "#059669", desc: "Xét tốt nghiệp, trả bằng",        path: "/academic/academic-records?tab=graduation" },
    { id: 8, title: "Khen thưởng & Kỷ luật", icon: <FiShield />,    color: "#dc2626", desc: "Hồ sơ sự vụ, hỗ trợ giáo dục",   path: "/academic/academic-records?tab=discipline" },
];

const KPI_STATS = [
    { label: "Tổng học sinh",       value: "1,250", badge: "+12",  badgeType: "up",   icon: <FiUsers />,        iconClass: "indigo" },
    { label: "Hồ sơ chờ xử lý",    value: "20",    badge: "-5",   badgeType: "down", icon: <FiAlertTriangle />,iconClass: "amber" },
    { label: "Lớp hoạt động",       value: "35",    badge: "ổn",   badgeType: "warn", icon: <FiBriefcase />,    iconClass: "emerald" },
    { label: "Học bạ hoàn thiện",   value: "75%",   badge: "+15%", badgeType: "up",   icon: <FiTrendingUp />,   iconClass: "indigo" },
];

const ACTIVITY_FEED = [
    { id: 1, type: "urgent", typeLabel: "Gấp",    dot: "danger",  msg: <>GV. <strong>Nguyễn Lan</strong> yêu cầu chỉnh sửa điểm lớp <strong>12A1</strong></>,                   time: "10p trước" },
    { id: 2, type: "doc",    typeLabel: "Hồ sơ",  dot: "success", msg: <>Học sinh mới <strong>Trần Minh Khoa</strong> đã hoàn thiện hồ sơ đầu vào</>,                           time: "35p trước" },
    { id: 3, type: "grade",  typeLabel: "Điểm",   dot: "warning", msg: <><strong>08 lớp</strong> tại khối 10 chưa nộp điểm kiểm tra 15p tuần này</>,                       time: "2 giờ trước" },
];

const SOP_CHECKLIST = [
    { task: "Rà soát hồ sơ học sinh mới",      group: "Tuyển sinh", done: true  },
    { task: "Cập nhật biến động sĩ số tháng",  group: "Học vụ",     done: false },
    { task: "Đối chiếu sổ đăng bộ với SQL",    group: "Dữ liệu",    done: false },
    { task: "Kiểm tra chữ ký học bạ điện tử",  group: "Học bạ",     done: true  },
];

const DEADLINES = [
    { title: "Chốt điểm HK2 - Khối 12", date: "30/04/2026", days: 7,  urgency: "soon"   },
    { title: "Nộp báo cáo sĩ số tháng", date: "03/05/2026", days: 10, urgency: "medium" },
];

const LEGAL_DOCS = [
    { id: "TT 32/2020", name: "Điều lệ trường trung học",        tag: "Cốt lõi",    color: "#4f46e5" },
    { id: "TT 22/2021", name: "Đánh giá học sinh THCS/THPT",    tag: "Học vụ",     color: "#0891b2" },
];

const TIMELINE_DATA = [
    { months: [3,4,5],  label: "T3–T5",  icon: "📋", title: "Chuẩn bị tuyển sinh" },
    { months: [5,6,7],  label: "T5–T7",  icon: "📥", title: "Tiếp nhận hồ sơ" },
    { months: [7,8],    label: "T7–T8",  icon: "🏫", title: "Ổn định đầu năm" },
    { months: [9,10],   label: "T9–T10", icon: "📈", title: "Ổn định sĩ số" },
    { months: [11,12],  label: "T11–T12",icon: "🔍", title: "Rà soát hồ sơ" },
    { months: [1],      label: "T1",     icon: "📄", title: "Chốt học kỳ I" },
    { months: [2,3,4],  label: "T2–T4",  icon: "🔄", title: "Duy trì vận hành" },
    { months: [5],      label: "T5",     icon: "🏆", title: "Kết thúc năm học" },
    { months: [6,7],    label: "T6–T7",  icon: "🎓", title: "Tốt nghiệp & Trả HS" },
];

/* ============================================================
   COMPONENT
   ============================================================ */
export default function AcademicStaffDashboard() {
    const navigate = useNavigate();
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const hour = time.getHours();
    const greeting = hour < 12 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";
    const doneCount = SOP_CHECKLIST.filter(s => s.done).length;
    const sopProgress = Math.round((doneCount / SOP_CHECKLIST.length) * 100);
    const currentMonth = time.getMonth() + 1;
    const pendingToday = SOP_CHECKLIST.filter(s => !s.done).length;

    return (
        <div className="academic-dashboard-premium registrar-layout-clean">
            <PageHeader
                title="Cổng Điều Hành Giáo Vụ"
                eyebrow="Hệ thống Quản trị Học vụ & Hồ sơ"
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            {/* ── BANNER GỌN ── */}
            <div className="reg-clean-banner">
                <div className="reg-clean-banner-info">
                    <h2>{greeting}, Giáo vụ viên! 👋</h2>
                    <p>Hôm nay bạn có <strong>{pendingToday} công việc</strong> cần xử lý.</p>
                </div>
                <div className="reg-clean-banner-meta">
                    <div className="meta-item">
                        <FiClock /> <span>{time.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="meta-item">
                        <FiCalendar /> <span>{time.toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" })}</span>
                    </div>
                </div>
            </div>

            {/* ── KPI STATS GỌN ── */}
            <div className="reg-stats-grid-clean">
                {KPI_STATS.map((s, i) => (
                    <div key={i} className="reg-stat-card-clean">
                        <div className={`reg-stat-icon-clean ${s.iconClass}`}>{s.icon}</div>
                        <div className="reg-stat-content-clean">
                            <div className="reg-stat-label-clean">{s.label}</div>
                            <div className="reg-stat-value-clean">
                                {s.value}
                                <span className={`reg-stat-badge-clean ${s.badgeType}`}>{s.badge}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── MAIN LAYOUT ── */}
            <div className="reg-dashboard-layout-clean">

                {/* ── CỘT CHÍNH ── */}
                <div className="reg-main-col-clean">

                    {/* 8 Nhiệm vụ Gọn */}
                    <div className="reg-section-card">
                        <div className="reg-section-header">
                            <h3><FiList /> Nhiệm vụ cốt lõi</h3>
                            <span className="count-badge">8 phân khu</span>
                        </div>
                        <div className="reg-task-grid-clean">
                            {CORE_TASKS.map(task => (
                                <div
                                    key={task.id}
                                    className="reg-task-item-clean"
                                    onClick={() => navigate(task.path)}
                                    title={task.desc}
                                >
                                    <div className="task-icon-box" style={{ background: `${task.color}15`, color: task.color }}>
                                        {task.icon}
                                    </div>
                                    <div className="task-name-box">
                                        <h4>{task.title}</h4>
                                        <FiChevronRight className="hover-arrow" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="reg-two-up-grid">
                        {/* Nhật ký vận hành */}
                        <div className="reg-section-card">
                            <div className="reg-section-header">
                                <h3><FiActivity /> Nhật ký mới</h3>
                                <button className="text-btn">Xem hết</button>
                            </div>
                            <div className="reg-activity-list-clean">
                                {ACTIVITY_FEED.map((item) => (
                                    <div key={item.id} className="reg-activity-item-clean">
                                        <div className={`status-dot ${item.dot}`} />
                                        <div className="activity-info">
                                            <p>{item.msg}</p>
                                            <span className="time">{item.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Chu trình học vụ rút gọn */}
                        <div className="reg-section-card">
                            <div className="reg-section-header">
                                <h3><FiCalendar /> Chu trình hằng năm</h3>
                                <span className="month-tag">Tháng {currentMonth}</span>
                            </div>
                            <div className="reg-timeline-mini">
                                <div className="timeline-mini-track">
                                    {TIMELINE_DATA.map((item, i) => {
                                        const active = item.months.includes(currentMonth);
                                        return (
                                            <div key={i} className={`timeline-mini-node ${active ? "active" : ""}`} title={item.title}>
                                                <div className="node-icon">{item.icon}</div>
                                                <span className="node-label">{item.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Lịch vận hành */}
                    <div className="reg-section-card">
                        <div className="reg-section-header">
                            <h3><FiCalendar /> Lịch Vận Hành Nghiệp Vụ</h3>
                        </div>
                        <div className="calendar-wrapper-clean">
                            <EventCalendar
                                title=""
                                selectedSchoolYear={selectedSchoolYear}
                                selectedTerm={selectedTerm}
                                themeClass="theme-registrar"
                                userRole="admin"
                                isCompact={true}
                                initialEvents={INITIAL_CALENDAR_EVENTS}
                                eventTypes={CALENDAR_EVENT_TYPES}
                                rolePolicy={{ canCreate: false, canViewDetails: true, canEdit: false, canDelete: false }}
                            />
                        </div>
                    </div>
                </div>

                {/* ── CỘT PHỤ ── */}
                <div className="reg-side-col-clean">

                    {/* SOP & Deadlines gộp lại hoặc làm gọn */}
                    <div className="reg-sidebar-card">
                        <div className="sidebar-header">
                            <h3><FiCheck /> Việc cần làm</h3>
                            <span className="progress-mini">{sopProgress}%</span>
                        </div>
                        <div className="sop-mini-list-clean">
                            {SOP_CHECKLIST.map((item, i) => (
                                <div key={i} className={`sop-mini-item-clean ${item.done ? "done" : ""}`}>
                                    <div className="check-box">{item.done && <FiCheck />}</div>
                                    <span>{item.task}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="reg-sidebar-card">
                        <div className="sidebar-header">
                            <h3><FiClock /> Sắp đến hạn</h3>
                        </div>
                        <div className="deadline-mini-list">
                            {DEADLINES.map((d, i) => (
                                <div key={i} className={`deadline-mini-item ${d.urgency}`}>
                                    <div className="deadline-info">
                                        <span className="title">{d.title}</span>
                                        <span className="date">{d.date}</span>
                                    </div>
                                    <span className="days">{d.days}N</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Văn bản pháp lý tối giản */}
                    <div className="reg-sidebar-card">
                        <div className="sidebar-header">
                            <h3><FiBook /> Pháp lý</h3>
                        </div>
                        <div className="legal-mini-list">
                            {LEGAL_DOCS.map((doc, i) => (
                                <div key={i} className="legal-mini-item">
                                    <span className="id" style={{ color: doc.color }}>{doc.id}</span>
                                    <span className="name">{doc.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Hỗ trợ gộp gọn */}
                    <div className="reg-help-box-clean">
                        <FiZap className="help-icon" />
                        <div className="help-text">
                            <h4>Hỗ trợ CNTT</h4>
                            <p>Cần mở khóa sổ điểm?</p>
                        </div>
                        <button className="help-btn">Gửi</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

