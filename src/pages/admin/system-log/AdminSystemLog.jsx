import React, { useState, useMemo, useEffect, useCallback } from "react";
import { FiActivity, FiClock, FiUser, FiFilter, FiDownload, FiSearch, FiCheckCircle, FiInfo, FiCalendar, FiBookOpen, FiList, FiRefreshCw } from "react-icons/fi";
import { PageHeader, Pagination, SchoolYearTermSelector, LoadingSpinner } from "../../../components/common";
import { Select, Button } from "../../../components/ui";
import systemLogService from "../../../services/pages/admin/system/systemLogService";
import "./AdminSystemLog.css";

const ACTION_OPTIONS = [
    { value: "ALL", label: "Tất cả hoạt động" },
    { value: "USER_LOGIN", label: "Đăng nhập" },
    { value: "SYSTEM_UPDATE", label: "Cập nhật hệ thống" },
    { value: "WEEK_TRANSITION", label: "Chuyển tuần" },
];

export default function AdminSystemLog() {
    const [actionFilter, setActionFilter] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedSchoolYear, setSelectedSchoolYear] = useState("2025-2026");
    const [selectedTerm, setSelectedTerm] = useState("hk2");
    const [isLoading, setIsLoading] = useState(true);
    const [logs, setLogs] = useState([]);
    const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });
    const [stats, setStats] = useState({ todayCount: 0, totalCount: 0 });

    const fetchLogs = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: 10,
                action: actionFilter !== "ALL" ? actionFilter : undefined,
                search: searchQuery || undefined
            };
            const [logsRes, statsRes] = await Promise.all([
                systemLogService.getSystemLogs(params),
                systemLogService.getStats()
            ]);
            
            // Kiểm tra cấu trúc dữ liệu thực tế từ interceptor
            const actualData = logsRes?.data || logsRes;
            
            if (actualData && actualData.logs) {
                setLogs(actualData.logs);
                setPagination(actualData.pagination || { totalPages: 1, total: 0 });
            } else {
                setLogs([]);
            }

            const actualStats = statsRes?.data || statsRes;
            if (actualStats) {
                setStats(actualStats);
            }
        } catch (error) {
            console.error("Failed to fetch system logs", error);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, actionFilter, searchQuery]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleYearChange = (direction) => {
        const [startYear] = selectedSchoolYear.split("-").map(Number);
        if (direction === "prev") {
            setSelectedSchoolYear(`${startYear - 1}-${startYear}`);
        } else {
            setSelectedSchoolYear(`${startYear + 1}-${startYear + 2}`);
        }
    };

    const getActionBadge = (action) => {
        switch (action) {
            case "WEEK_TRANSITION": return <span className="system-badge badge-transition">Chuyển tuần</span>;
            case "EXAM_STARTED":    return <span className="system-badge badge-exam">Bắt đầu thi</span>;
            case "GRADE_SUBMITTED": return <span className="system-badge badge-grade">Nộp điểm</span>;
            case "USER_LOGIN":      return <span className="system-badge badge-login">Đăng nhập</span>;
            case "SYSTEM_UPDATE":   return <span className="system-badge badge-update">Cập nhật</span>;
            default:                return <span className="system-badge">{action}</span>;
        }
    };

    return (
        <div className="admin-system-page">
            <PageHeader 
                title="Log Hệ Thống" 
                eyebrow="Nhật ký Sử dụng"
                actions={
                    <SchoolYearTermSelector 
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearChange}
                        onTermChange={setSelectedTerm}
                    />
                }
            />

            <div className="system-stats-grid">
                <div className="system-stat-card">
                    <div className="stat-icon-wrapper" style={{ background: "#e0f2fe", color: "#0369a1" }}>
                        <FiActivity size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Hoạt động hôm nay</h3>
                        <p>{stats.todayCount.toLocaleString()}</p>
                    </div>
                </div>
                <div className="system-stat-card">
                    <div className="stat-icon-wrapper" style={{ background: "#fef3c7", color: "#b45309" }}>
                        <FiList size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Tổng số bản ghi</h3>
                        <p>{stats.totalCount.toLocaleString()}</p>
                    </div>
                </div>
                <div className="system-stat-card">
                    <div className="stat-icon-wrapper" style={{ background: "#ede9fe", color: "#5b21b6" }}>
                        <FiCalendar size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Tuần hiện tại</h3>
                        <p>Tuần 32</p>
                    </div>
                </div>
            </div>

            <div className="system-main-content">
                <div className="system-toolbar">
                    <div className="system-filters">
                        <div className="system-search-wrap">
                            <FiSearch className="search-icon" />
                            <input 
                                type="text" 
                                className="system-search-input-field"
                                placeholder="Tìm theo người thực hiện/đối tượng/nội dung..." 
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                        <Select 
                            variant="custom"
                            options={ACTION_OPTIONS}
                            value={actionFilter}
                            onChange={(e) => {
                                setActionFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="system-filter-select"
                        />
                    </div>
                    <Button variant="outline" onClick={fetchLogs}>
                        <FiRefreshCw /> Làm mới
                    </Button>
                </div>

                <div className="system-table-wrapper">
                    <div className="system-table-head">
                        <span>Thời gian</span>
                        <span>Người thực hiện</span>
                        <span>Hành động</span>
                        <span>Đối tượng</span>
                        <span>Chi tiết hoạt động</span>
                        <span>Trạng thái</span>
                    </div>

                    {isLoading ? (
                        <div className="system-table-loading">
                            <LoadingSpinner size="lg" label="Đang tải dữ liệu log..." />
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="system-table-empty">Không tìm thấy nhật ký nào phù hợp.</div>
                    ) : (
                        logs.map(log => (
                            <div className="system-table-row" key={log?.id || Math.random()}>
                                <div className="system-time">
                                    <span className="time-main">{log?.timestamp ? new Date(log.timestamp).toLocaleDateString('vi-VN') : "---"}</span>
                                    <span className="time-sub">{log?.timestamp ? new Date(log.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ""}</span>
                                </div>
                                
                                <div className="system-actor">
                                    <div className="actor-avatar">{log?.actor?.avatar || "S"}</div>
                                    <div className="actor-info">
                                        <span className="actor-name">{log?.actor?.name || "Hệ thống"}</span>
                                        <span className="actor-role">{log?.actor?.role || "System"}</span>
                                    </div>
                                </div>

                                <div className="system-action-cell">
                                    {getActionBadge(log?.action)}
                                </div>

                                <div className="system-target">
                                    <div className="actor-info">
                                        <span className="actor-name">{log?.target || "Hệ thống"}</span>
                                    </div>
                                </div>

                                <div className="system-details-cell">
                                    <div className="system-details">
                                        {Array.isArray(log?.details) ? log.details.map((detail, i) => (
                                            <span key={i} className="detail-item">{detail}</span>
                                        )) : <span className="detail-item">{log?.details || "Không có chi tiết"}</span>}
                                    </div>
                                </div>

                                <div className="system-status-cell">
                                    <span className={`status-${(log?.status || "SUCCESS").toLowerCase()}`}>
                                        {log?.status === "SUCCESS" ? <FiCheckCircle /> : <FiInfo />} {log?.status === "SUCCESS" ? "Thành công" : "Thất bại"}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="system-pagination-row">
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>
        </div>
    );
}

