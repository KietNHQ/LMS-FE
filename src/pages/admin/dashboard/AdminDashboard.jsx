import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { FiUsers, FiLock, FiActivity, FiShield, FiAlertTriangle, FiCheckCircle, FiClock, FiList } from "react-icons/fi";
import { adminDashboardService } from "../../../services/pages/admin/dashboard/dashboardService";
import EventCalendarSection from "./components/eventCalendarSection/eventCalendarSection";
import "./AdminDashboard.css";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const adminName = localStorage.getItem("email")?.split("@")[0] || "Quản Trị Viên";

    const { data: response, isLoading } = useQuery({
        queryKey: ["admin-dashboard"],
        queryFn: () => adminDashboardService.getDashboardOverview(),
        staleTime: 5 * 60 * 1000,
    });

    const dashboardData = response || null;

    const stats = {
        totalUsers: dashboardData?.summary?.totalStudents + dashboardData?.summary?.totalTeachers || 1240,
        activeManagers: 12,
        lockedAccounts: 3,
        logsToday: 45
    };

    const auditLogs = [
        { id: 1, user: "Nguyen Hoang Quoc Kiet", action: "Cập nhật quyền hạn cho Hiệu trưởng", time: "10 phút trước", type: "success" },
        { id: 2, user: "admin@thptlocal.edu.vn", action: "Khóa tài khoản Giáo viên (GV001)", time: "25 phút trước", type: "warning" },
        { id: 3, user: "admin@thptlocal.edu.vn", action: "Tạo tài khoản Quản lý mới", time: "1 giờ trước", type: "info" },
    ];

    const systemLogs = [
        { id: 1, event: "Hệ thống", action: "Sao lưu dữ liệu định kỳ", time: "2 giờ trước", icon: <FiActivity /> },
        { id: 2, event: "Tuần 32", action: "Chuyển đổi tuần học tự động", time: "5 giờ trước", icon: <FiClock /> },
        { id: 3, event: "v2.4.5", action: "Cập nhật phiên bản hệ thống", time: "1 ngày trước", icon: <FiCheckCircle /> },
    ];

    const userDistribution = [
        { label: "Học sinh", count: 1050, color: "#6366f1" },
        { label: "Giáo viên", count: 85, color: "#10b981" },
        { label: "Phụ huynh", count: 92, color: "#f59e0b" },
        { label: "Quản lý", count: 12, color: "#ec4899" },
        { label: "Quản trị viên", count: 1, color: "#1e293b" },
    ];

    return (
        <div className="admin-dashboard-new">
            <header className="admin-dashboard-new__header">
                <div className="header-left">
                    <h1>Chào mừng trở lại, {adminName}</h1>
                    <p>Hệ thống đang hoạt động ổn định. Bạn có {stats.logsToday} nhật ký hệ thống mới hôm nay.</p>
                </div>
                <div className="header-status">
                    <FiCheckCircle className="status-icon" />
                    <span>Hệ thống: Trực tuyến</span>
                </div>
            </header>

            <section className="admin-dashboard-new__stats">
                <div className="stat-card clickable" onClick={() => navigate("/admin/users")}>
                    <div className="stat-icon users"><FiUsers /></div>
                    <div className="stat-info">
                        <span className="label">Tổng người dùng</span>
                        <h2 className="value">{stats.totalUsers}</h2>
                    </div>
                </div>
                <div className="stat-card clickable" onClick={() => navigate("/admin/users")}>
                    <div className="stat-icon managers"><FiShield /></div>
                    <div className="stat-info">
                        <span className="label">Đội ngũ quản lý</span>
                        <h2 className="value">{stats.activeManagers}</h2>
                    </div>
                </div>
                <div className="stat-card clickable" onClick={() => navigate("/admin/users")}>
                    <div className="stat-icon locked"><FiLock /></div>
                    <div className="stat-info">
                        <span className="label">Tài khoản bị khóa</span>
                        <h2 className="value text-danger">{stats.lockedAccounts}</h2>
                    </div>
                </div>
                <div className="stat-card clickable" onClick={() => navigate("/admin/audit-log")}>
                    <div className="stat-icon logs"><FiActivity /></div>
                    <div className="stat-info">
                        <span className="label">Nhật ký hôm nay</span>
                        <h2 className="value">{stats.logsToday}</h2>
                    </div>
                </div>
            </section>

            <div className="admin-dashboard-new__grid">
                {/* Lịch Sự Kiện */}
                <section className="admin-dashboard-new__card event-calendar-card">
                    <EventCalendarSection />
                </section>

                <div className="admin-dashboard-new__card role-dist">
                    <div className="card-header">
                        <h3>Cơ cấu người dùng</h3>
                        <FiUsers className="title-icon" />
                    </div>
                    <div className="dist-bars">
                        {userDistribution.map(item => (
                            <div key={item.label} className="dist-item">
                                <div className="dist-info">
                                    <span>{item.label}</span>
                                    <span>{item.count}</span>
                                </div>
                                <div className="progress-bg">
                                    <div className="progress-fill" style={{ 
                                        width: `${(item.count / stats.totalUsers) * 100}%`,
                                        backgroundColor: item.color 
                                    }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="admin-dashboard-new__card sys-health">
                    <div className="card-header">
                        <h3>Trạng thái hệ thống</h3>
                        <FiActivity className="title-icon" />
                    </div>
                    <div className="health-list">
                        <div className="health-item">
                            <span className="label">Phiên bản Core</span>
                            <span className="value">v2.4.0 (Stable)</span>
                        </div>
                        <div className="health-item">
                            <span className="label">Cơ sở dữ liệu</span>
                            <span className="value text-success">Kết nối tốt (12ms)</span>
                        </div>
                        <div className="health-item">
                            <span className="label">Bộ nhớ tạm (Cache)</span>
                            <span className="value">85% khả dụng</span>
                        </div>
                        <div className="health-item">
                            <span className="label">Thời gian hoạt động</span>
                            <span className="value">14 ngày 2 giờ</span>
                        </div>
                    </div>
                    <div className="health-notices">
                        <div className="notice warning">
                            <FiAlertTriangle />
                            <span>Có 3 chứng chỉ SSL sắp hết hạn trong 15 ngày.</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="admin-dashboard-new__logs-grid">
                {/* NHẬT KÝ PHÂN QUYỀN */}
                <section className="admin-dashboard-new__card logs-table-card">
                    <div className="card-header">
                        <div className="header-group">
                            <h3>Nhật ký Phân quyền</h3>
                            <FiShield className="title-icon" />
                        </div>
                        <button className="view-all-btn" onClick={() => navigate("/admin/audit-log")}>Xem tất cả</button>
                    </div>
                    <div className="logs-list">
                        {auditLogs.map(log => (
                            <div key={log.id} className="log-row">
                                <div className={`log-indicator ${log.type}`}></div>
                                <div className="log-main">
                                    <span className="log-user">{log.user}</span>
                                    <span className="log-action">{log.action}</span>
                                </div>
                                <span className="log-time">{log.time}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* LOG HỆ THỐNG */}
                <section className="admin-dashboard-new__card logs-table-card">
                    <div className="card-header">
                        <div className="header-group">
                            <h3>Log Hệ Thống</h3>
                            <FiActivity className="title-icon" />
                        </div>
                        <button className="view-all-btn" onClick={() => navigate("/admin/system-log")}>Xem tất cả</button>
                    </div>
                    <div className="logs-list">
                        {systemLogs.map(log => (
                            <div key={log.id} className="log-row">
                                <div className="log-icon-wrap">{log.icon}</div>
                                <div className="log-main">
                                    <span className="log-user">{log.event}</span>
                                    <span className="log-action">{log.action}</span>
                                </div>
                                <span className="log-time">{log.time}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminDashboard;


