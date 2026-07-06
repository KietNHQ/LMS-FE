import React from "react";
import { FiStar, FiClock, FiMapPin, FiInfo, FiActivity, FiTrendingUp, FiCheckCircle, FiPlus, FiEdit3, FiTrash2, FiBookOpen } from "react-icons/fi";
import "./HomeroomOverviewSection.css";

export default function HomeroomOverviewSection({ 
    data, 
    lessonMarkers,
    onAddOfficersClick, 
    onCreateActivityClick,
    onEditActivityClick,
    onDeleteActivityClick
}) {
    if (!data) return null;

    const totalStudents = data.students?.length || 0;
    // Safely get stats with defaults
    const academic = data.academicStats || { excellent: 0, good: 0, average: 0, weak: 0 };
    const tuition = data.tuitionStats || { paid: 0, unpaid: 0 };

    const officers = [
        { name: data.monitor, role: "Lớp trưởng", avatar: "M", gradient: "monitor-gradient" },
        { name: data.viceMonitor, role: "Lớp phó học tập", avatar: "V", gradient: "vice-gradient" },
        { name: data.secretary, role: "Bí thư chi đoàn", avatar: "S", gradient: "secretary-gradient" },
        ...(data.extraOfficers || []).map((officer, index) => ({
            name: officer.name,
            role: officer.role,
            avatar: officer.name?.split(" ").pop().charAt(0) || String(index + 1),
            gradient: index % 3 === 0 ? "monitor-gradient" : index % 3 === 1 ? "vice-gradient" : "secretary-gradient",
            note: officer.note,
        })),
    ].filter((officer) => officer.name);

    // Calculate percentages safely
    const excPct = totalStudents > 0 ? ((academic.excellent || 0) / totalStudents) * 100 : 0;
    const goodPct = totalStudents > 0 ? ((academic.good || 0) / totalStudents) * 100 : 0;
    const avgPct = totalStudents > 0 ? ((academic.average || 0) / totalStudents) * 100 : 0;
    const weakPct = totalStudents > 0 ? ((academic.weak || 0) / totalStudents) * 100 : 0;

    const paidPct = totalStudents > 0 ? ((tuition.paid || 0) / totalStudents) * 100 : 0;

    return (
        <div className="homeroom-overview-section">

            {/* Top row: Detailed Stats */}
            <div className="overview-stats-row">
                {/* Academic Performance Card */}
                <div className="overview-card academic-card modern-shadow">
                    <div className="card-header borderless">
                        <div className="header-icon gradient-purple">
                            <FiTrendingUp />
                        </div>
                        <h2>Phân loại Học lực</h2>
                        <span className="card-badge">Hiện tại</span>
                    </div>
                    <div className="card-content">
                        <div className="academic-bars">
                            <div className="academic-item">
                                <div className="academic-label">
                                    <span>Giỏi</span>
                                    <strong>{academic.excellent} HS ({excPct.toFixed(0)}%)</strong>
                                </div>
                                <div className="progress-track">
                                    <div className="progress-fill excellent" style={{ width: `${excPct}%` }}></div>
                                </div>
                            </div>
                            <div className="academic-item">
                                <div className="academic-label">
                                    <span>Khá</span>
                                    <strong>{academic.good} HS ({goodPct.toFixed(0)}%)</strong>
                                </div>
                                <div className="progress-track">
                                    <div className="progress-fill good" style={{ width: `${goodPct}%` }}></div>
                                </div>
                            </div>
                            <div className="academic-item">
                                <div className="academic-label">
                                    <span>Trung bình</span>
                                    <strong>{academic.average} HS ({avgPct.toFixed(0)}%)</strong>
                                </div>
                                <div className="progress-track">
                                    <div className="progress-fill average" style={{ width: `${avgPct}%` }}></div>
                                </div>
                            </div>
                            <div className="academic-item">
                                <div className="academic-label">
                                    <span>Yếu</span>
                                    <strong>{academic.weak} HS ({weakPct.toFixed(0)}%)</strong>
                                </div>
                                <div className="progress-track">
                                    <div className="progress-fill weak" style={{ width: `${weakPct}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tuition Fee Card */}
                <div className="overview-card tuition-card modern-shadow">
                    <div className="card-header borderless">
                        <div className="header-icon gradient-green">
                            <FiCheckCircle />
                        </div>
                        <h2>Tình trạng Học phí</h2>
                    </div>
                    <div className="card-content tuition-content">
                        <div className="tuition-circle-wrap">
                            <div className="tuition-circle" style={{ '--percent': `${paidPct}%` }}>
                                <div className="circle-inner">
                                    <span className="circle-number">{paidPct.toFixed(0)}%</span>
                                    <span className="circle-text">Đã thu</span>
                                </div>
                            </div>
                        </div>
                        <div className="tuition-legend">
                            <div className="legend-item">
                                <span className="legend-dot paid"></span>
                                <span>Đã đóng: <strong>{tuition.paid} HS</strong></span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-dot unpaid"></span>
                                <span>Chưa đóng: <strong>{tuition.unpaid} HS</strong></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom row: Existing elements properly styled */}
            <div className="overview-container">
                {/* Mốc tiết học - Homeroom class lesson markers */}
                {lessonMarkers && lessonMarkers.length > 0 && (
                    <div className="overview-card lesson-markers-card modern-shadow">
                        <div className="card-header">
                            <div className="header-icon gradient-purple">
                                <FiBookOpen />
                            </div>
                            <h2>Mốc tiết học</h2>
                        </div>
                        <div className="card-content">
                            <div className="lesson-markers-list">
                                {lessonMarkers.map((day) => (
                                    <div key={day.date} className={`lesson-marker-day ${day.isToday ? "is-today" : ""}`}>
                                        <div className="marker-day-header">
                                            <div className="marker-date-block">
                                                <span className="marker-day-label">{day.dayLabel}</span>
                                                <span className="marker-date">{day.displayDate}</span>
                                                {day.isToday && <span className="today-badge">Hôm nay</span>}
                                            </div>
                                            <span className="marker-count">{day.count} tiết</span>
                                        </div>
                                        <div className="marker-lessons">
                                            {day.lessons.map((lesson, lessonIdx) => (
                                                <div key={`${day.date}-${lesson.period}-${lessonIdx}`} className="marker-lesson-item">
                                                    <span className="marker-period">T{lesson.period}</span>
                                                    <span className="marker-subject">{lesson.subjectName}</span>
                                                    <span className="marker-class">{lesson.className}</span>
                                                    <span className="marker-room">{lesson.roomName}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Information Column */}
                <div className="overview-card info-card modern-shadow">
                    <div className="card-header">
                        <div className="header-icon gradient-blue">
                            <FiInfo />
                        </div>
                        <h2>Thông tin chung</h2>
                    </div>
                    <div className="card-content">
                        <div className="info-row">
                            <span className="info-label">Lớp</span>
                            <span className="info-value highlight">{data.name}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Khối</span>
                            <span className="info-value">{data.grade}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Năm học</span>
                            <span className="info-value">{data.year}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Môn chuyên</span>
                            <span className="info-value">{data.subject}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Trạng thái</span>
                            <span className={`status-badge ${data.status === "Đang hoạt động" ? "active" : ""}`}>
                                {data.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Officers Column */}
                <div className="overview-card officers-card modern-shadow">
                    <div className="card-header card-header-with-action">
                        <div className="header-icon gradient-orange">
                            <FiStar />
                        </div>
                        <h2>Ban Cán Sự Lớp</h2>
                        <button
                            type="button"
                            className="overview-header-action-btn icon-only"
                            onClick={() => onAddOfficersClick?.(data)}
                            title="Phân công ban cán sự"
                        >
                            <FiEdit3 />
                        </button>
                    </div>
                    <div className="card-content officers-list">
                        {officers.map((officer, index) => (
                            <div key={`${officer.name}-${index}`} className="officer-item">
                                <div className={`officer-avatar ${officer.gradient}`}>
                                    {officer.avatar}
                                </div>
                                <div className="officer-info">
                                    <h4>{officer.name}</h4>
                                    <span>{officer.role}</span>
                                    {officer.note ? <small>{officer.note}</small> : null}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Activities Column */}
                <div className="overview-card activities-card modern-shadow">
                    <div className="card-header card-header-with-action">
                        <div className="header-icon gradient-red">
                            <FiActivity />
                        </div>
                        <h2>Kế hoạch & Hoạt động</h2>
                        <button
                            type="button"
                            className="overview-header-action-btn icon-only"
                            onClick={() => onCreateActivityClick?.(data)}
                            title="Tạo hoạt động"
                        >
                            <FiPlus />
                        </button>
                    </div>
                    <div className="card-content">
                        {data.activities && data.activities.length > 0 ? (
                            <ul className="activities-list">
                                {data.activities.map((activity, index) => (
                                    <li key={activity.id || `activity-${index}`} className="activity-item">
                                        <div className="activity-icon">
                                            <div className={`timeline-dot type-${activity.type}`}></div>
                                        </div>
                                        <div className="activity-details">
                                            <div className="activity-content-wrapper">
                                                <h4>{activity.title}</h4>
                                                <div className="activity-meta">
                                                    <span className="meta-item">
                                                        <FiClock className="icon" /> {activity.time}
                                                    </span>
                                                    <span className="meta-item">
                                                        <FiMapPin className="icon" /> {activity.location}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="activity-actions">
                                                <button
                                                    type="button"
                                                    className="action-btn edit"
                                                    title="Chỉnh sửa"
                                                    onClick={() => onEditActivityClick?.(activity)}
                                                >
                                                    <FiEdit3 />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="action-btn delete"
                                                    title="Xóa"
                                                    onClick={() => onDeleteActivityClick?.(activity)}
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="empty-activities">
                                Không có hoạt động nào sắp xếp
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
