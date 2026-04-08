import React from "react";
import { FiStar, FiClock, FiMapPin, FiInfo, FiActivity, FiTrendingUp, FiCheckCircle } from "react-icons/fi";
import "./HomeroomOverviewSection.css";

export default function HomeroomOverviewSection({ data }) {
    if (!data) return null;

    const totalStudents = data.students.length;
    const academic = data.academicStats;
    
    // Calculate percentages
    const excPct = (academic.excellent / totalStudents) * 100;
    const goodPct = (academic.good / totalStudents) * 100;
    const avgPct = (academic.average / totalStudents) * 100;
    const weakPct = (academic.weak / totalStudents) * 100;

    const paidPct = (data.tuitionStats.paid / totalStudents) * 100;

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
                        <span className="card-badge">Tháng 9</span>
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
                                <span>Đã đóng: <strong>{data.tuitionStats.paid} HS</strong></span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-dot unpaid"></span>
                                <span>Chưa đóng: <strong>{data.tuitionStats.unpaid} HS</strong></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom row: Existing elements properly styled */}
            <div className="overview-container">
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
                    <div className="card-header">
                        <div className="header-icon gradient-orange">
                            <FiStar />
                        </div>
                        <h2>Ban Cán Sự Lớp</h2>
                    </div>
                    <div className="card-content officers-list">
                        <div className="officer-item">
                            <div className="officer-avatar monitor-gradient">
                                {data.monitor?.split(' ').pop().charAt(0) || "M"}
                            </div>
                            <div className="officer-info">
                                <h4>{data.monitor || "Chưa cập nhật"}</h4>
                                <span>Lớp trưởng</span>
                            </div>
                        </div>
                        <div className="officer-item">
                            <div className="officer-avatar vice-gradient">
                                {data.viceMonitor?.split(' ').pop().charAt(0) || "V"}
                            </div>
                            <div className="officer-info">
                                <h4>{data.viceMonitor || "Chưa cập nhật"}</h4>
                                <span>Lớp phó học tập</span>
                            </div>
                        </div>
                        <div className="officer-item">
                            <div className="officer-avatar secretary-gradient">
                                {data.secretary?.split(' ').pop().charAt(0) || "S"}
                            </div>
                            <div className="officer-info">
                                <h4>{data.secretary || "Chưa cập nhật"}</h4>
                                <span>Bí thư chi đoàn</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activities Column */}
                <div className="overview-card activities-card modern-shadow">
                    <div className="card-header">
                        <div className="header-icon gradient-red">
                            <FiActivity />
                        </div>
                        <h2>Kế hoạch & Hoạt động</h2>
                    </div>
                    <div className="card-content">
                        {data.activities && data.activities.length > 0 ? (
                            <ul className="activities-list">
                                {data.activities.map((activity, index) => (
                                    <li key={index} className="activity-item">
                                        <div className="activity-icon">
                                            <div className={`timeline-dot type-${activity.type}`}></div>
                                        </div>
                                        <div className="activity-details">
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
