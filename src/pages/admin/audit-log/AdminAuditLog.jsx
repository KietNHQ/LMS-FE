import React, { useState, useMemo, useEffect, useCallback } from "react";
import { FiShield, FiClock, FiUser, FiFilter, FiDownload, FiSearch, FiCheckCircle, FiXCircle, FiRefreshCw, FiLock } from "react-icons/fi";
import { PageHeader, Pagination, SchoolYearTermSelector, LoadingSpinner } from "../../../components/common";
import { Select, Button } from "../../../components/ui";
import auditLogService from "../../../services/pages/admin/system/auditLogService";
import { PERMISSION_GROUPS } from "../../../config/permissions";
import "./AdminAuditLog.css";

const ACTION_OPTIONS = [
    { value: "ALL", label: "Tất cả hành động" },
    { value: "INSERT", label: "Cấp quyền" },
    { value: "DELETE", label: "Thu hồi quyền" },
];

export default function AdminAuditLog() {
    const [actionFilter, setActionFilter] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedSchoolYear, setSelectedSchoolYear] = useState("2025-2026");
    const [selectedTerm, setSelectedTerm] = useState("hk2");
    const [isLoading, setIsLoading] = useState(true);
    const [logs, setLogs] = useState([]);
    const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });
    const [summaryStats, setSummaryStats] = useState({ total: 0, grants: 0, revokes: 0 });

    const fetchLogs = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: 10,
                action: actionFilter !== "ALL" ? actionFilter : undefined,
                search: searchQuery || undefined
            };
            const response = await auditLogService.getPermissionLogs(params);
            // Kiểm tra cấu trúc dữ liệu thực tế từ interceptor
            const actualData = response?.data || response;
            
            if (actualData && actualData.logs) {
                setLogs(actualData.logs);
                setPagination(actualData.pagination || { totalPages: 1, total: 0 });
                setSummaryStats(actualData.summary || { total: (actualData.pagination?.total || 0), grants: 0, revokes: 0 });
            } else {
                setLogs([]);
            }
        } catch (error) {
            console.error("Failed to fetch audit logs", error);
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
            case "INSERT": return <span className="audit-badge badge-grant">Cấp quyền</span>;
            case "DELETE": return <span className="audit-badge badge-revoke">Thu hồi</span>;
            case "UPDATE": return <span className="audit-badge badge-update">Đổi vai trò</span>;
            case "LOCK":   return <span className="audit-badge badge-lock">Khóa user</span>;
            default:       return <span className="audit-badge">{action}</span>;
        }
    };

    // Tạo bản đồ nhãn quyền từ cấu hình hệ thống
    const permissionLabelMap = useMemo(() => {
        const map = {};
        PERMISSION_GROUPS.forEach(group => {
            group.permissions.forEach(p => {
                map[p.id] = p.label;
            });
        });
        return map;
    }, []);

    const getFormattedChangeDetail = (log) => {
        const actionText = log.action === "INSERT" ? "Cấp quyền" : "Thu hồi";
        const permKey = `${log.permission_resource}:${log.permission_action}`;
        
        // Ưu tiên lấy nhãn từ permissions.js (Frontend), nếu không có mới lấy từ Log (Backend)
        const label = permissionLabelMap[permKey] || log.permission_label || permKey;
        
        return (
            <div className="change-detail-tag">
                <span className="action-prefix">{actionText} </span>
                <span className="perm-label">{label}</span>
            </div>
        );
    };

    return (
        <div className="admin-audit-page">
            <PageHeader 
                title="Nhật ký Phân quyền" 
                eyebrow="Quản trị Bảo mật & Hệ thống"
                actions={
                    <SchoolYearTermSelector 
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearChange}
                        onTermChange={setSelectedTerm}
                    />
                }
            />

            <div className="audit-stats-grid">
                <div className="audit-stat-card">
                    <div className="stat-icon-wrapper" style={{ background: "#e0f2fe", color: "#0369a1" }}>
                        <FiShield size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Tổng số thay đổi</h3>
                        <p>{summaryStats.total.toLocaleString()}</p>
                    </div>
                </div>
                <div className="audit-stat-card">
                    <div className="stat-icon-wrapper" style={{ background: "#dcfce7", color: "#15803d" }}>
                        <FiCheckCircle size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Cấp quyền mới</h3>
                        <p>{summaryStats.grants.toLocaleString()}</p>
                    </div>
                </div>
                <div className="audit-stat-card">
                    <div className="stat-icon-wrapper" style={{ background: "#fee2e2", color: "#991b1b" }}>
                        <FiXCircle size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Thu hồi quyền</h3>
                        <p>{summaryStats.revokes.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="audit-main-content">
                <div className="audit-toolbar">
                    <div className="audit-filters">
                        <div className="audit-search-wrap">
                            <FiSearch className="search-icon" />
                            <input 
                                type="text" 
                                className="audit-search-input-field"
                                placeholder="Tìm theo người thực hiện/đối tượng..." 
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
                            className="audit-filter-select"
                        />
                    </div>
                    <Button variant="outline" onClick={fetchLogs}>
                        <FiRefreshCw /> Làm mới
                    </Button>
                </div>

                <div className="audit-table-wrapper">
                    <div className="audit-table-head">
                        <span>Thời gian</span>
                        <span>Người thực hiện</span>
                        <span>Hành động</span>
                        <span>Đối tượng</span>
                        <span>Chi tiết thay đổi</span>
                        <span>Trạng thái</span>
                    </div>

                    {isLoading ? (
                        <div className="audit-table-loading">
                            <LoadingSpinner size="lg" label="Đang tải dữ liệu nhật ký..." />
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="audit-table-empty">Không tìm thấy nhật ký nào phù hợp.</div>
                    ) : (
                        logs.map(log => (
                            <div className="audit-table-row" key={log.id}>
                                <div className="audit-time">
                                    <span className="time-main">{new Date(log.performed_at).toLocaleDateString('vi-VN')}</span>
                                    <span className="time-sub">{new Date(log.performed_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                
                                <div className="audit-actor">
                                    <div className="actor-avatar">{log.performed_by_name?.charAt(0) || "U"}</div>
                                    <div className="actor-info">
                                        <span className="actor-name">{log.performed_by_name || "Unknown"}</span>
                                        <span className="actor-role">Admin</span>
                                    </div>
                                </div>

                                <div className="audit-action-cell">
                                    {getActionBadge(log.action)}
                                </div>

                                <div className="audit-target">
                                    <div className="actor-info">
                                        <span className="actor-name">{log.target_user_name || "N/A"}</span>
                                        <span className="actor-role">{log.target_user_role || "User"}</span>
                                    </div>
                                </div>

                                <div className="audit-changes-cell">
                                    <div className="audit-changes">
                                        {getFormattedChangeDetail(log)}
                                    </div>
                                </div>

                                <div className="audit-status-cell">
                                    <span className="status-success">
                                        <FiCheckCircle /> Thành công
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="audit-pagination-row">
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

