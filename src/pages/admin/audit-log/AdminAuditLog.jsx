import React, { useState, useMemo, useEffect } from "react";
import { FiShield, FiClock, FiUser, FiFilter, FiDownload, FiSearch, FiCheckCircle, FiXCircle, FiRefreshCw, FiLock } from "react-icons/fi";
import { PageHeader, Pagination, SchoolYearTermSelector, LoadingSpinner } from "../../../components/common";
import { Select, Button } from "../../../components/ui";
import "./AdminAuditLog.css";

const MOCK_AUDIT_LOGS = [
    {
        id: "L1",
        timestamp: "2026-04-25T10:30:00Z",
        actor: { name: "Lê Minh Hoàng", role: "Super Admin", avatar: "H" },
        action: "ASSIGN_PERMISSION",
        targetUser: "Nguyễn Văn An",
        targetRole: "Giáo viên",
        details: ["Thêm quyền: QUIZ_VIEW", "Thêm quyền: CLASS_VIEW"],
        status: "SUCCESS"
    },
    {
        id: "L2",
        timestamp: "2026-04-25T09:15:00Z",
        actor: { name: "Trần Thị Bình", role: "Admin", avatar: "B" },
        action: "UPDATE_ROLE",
        targetUser: "Lê Văn Cường",
        targetRole: "Tổ trưởng bộ môn",
        details: ["Thay đổi vai trò: Giáo viên -> Tổ trưởng"],
        status: "SUCCESS"
    },
    {
        id: "L3",
        timestamp: "2026-04-24T16:45:00Z",
        actor: { name: "Lê Minh Hoàng", role: "Super Admin", avatar: "H" },
        action: "REVOKE_PERMISSION",
        targetUser: "Phạm Thu Hà",
        targetRole: "Giáo vụ",
        details: ["Thu hồi quyền: FINANCE_VIEW"],
        status: "SUCCESS"
    },
    {
        id: "L4",
        timestamp: "2026-04-24T14:20:00Z",
        actor: { name: "Admin Hệ Thống", role: "System", avatar: "S" },
        action: "USER_LOCK",
        targetUser: "Đặng Văn Dũng",
        targetRole: "Học sinh",
        details: ["Khóa tài khoản do vi phạm chính sách"],
        status: "SUCCESS"
    },
    {
        id: "L5",
        timestamp: "2026-04-24T11:05:00Z",
        actor: { name: "Trần Thị Bình", role: "Admin", avatar: "B" },
        action: "ASSIGN_PERMISSION",
        targetUser: "Vũ Minh Tuấn",
        targetRole: "PHT Chuyên môn",
        details: ["Thêm quyền: NOTIFICATION_CREATE"],
        status: "SUCCESS"
    },
    {
        id: "L6",
        timestamp: "2026-04-23T08:30:00Z",
        actor: { name: "Lê Minh Hoàng", role: "Super Admin", avatar: "H" },
        action: "UPDATE_ROLE",
        targetUser: "Nguyễn Kim Anh",
        targetRole: "Kế toán",
        details: ["Thay đổi vai trò: Giáo vụ -> Kế toán"],
        status: "SUCCESS"
    }
];

const ACTION_OPTIONS = [
    { value: "ALL", label: "Tất cả hành động" },
    { value: "ASSIGN_PERMISSION", label: "Cấp quyền" },
    { value: "REVOKE_PERMISSION", label: "Thu hồi quyền" },
    { value: "UPDATE_ROLE", label: "Thay đổi vai trò" },
    { value: "USER_LOCK", label: "Khóa tài khoản" },
];

export default function AdminAuditLog() {
    const [actionFilter, setActionFilter] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedSchoolYear, setSelectedSchoolYear] = useState("2025-2026");
    const [selectedTerm, setSelectedTerm] = useState("hk2");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, [actionFilter, searchQuery, selectedSchoolYear, selectedTerm]);

    const handleYearChange = (direction) => {
        const [startYear] = selectedSchoolYear.split("-").map(Number);
        if (direction === "prev") {
            setSelectedSchoolYear(`${startYear - 1}-${startYear}`);
        } else {
            setSelectedSchoolYear(`${startYear + 1}-${startYear + 2}`);
        }
    };
    const ITEMS_PER_PAGE = 5;

    const filteredLogs = useMemo(() => {
        return MOCK_AUDIT_LOGS.filter(log => {
            const matchesAction = actionFilter === "ALL" || log.action === actionFilter;
            const matchesSearch = log.targetUser.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 log.actor.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesAction && matchesSearch;
        });
    }, [actionFilter, searchQuery]);

    const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE) || 1;
    const paginatedLogs = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredLogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredLogs, currentPage]);

    const getActionBadge = (action) => {
        switch (action) {
            case "ASSIGN_PERMISSION": return <span className="audit-badge badge-grant">Cấp quyền</span>;
            case "REVOKE_PERMISSION": return <span className="audit-badge badge-revoke">Thu hồi</span>;
            case "UPDATE_ROLE":       return <span className="audit-badge badge-update">Đổi vai trò</span>;
            case "USER_LOCK":         return <span className="audit-badge badge-lock">Khóa user</span>;
            default:                  return <span className="audit-badge">{action}</span>;
        }
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
                        <p>1,284</p>
                    </div>
                </div>
                <div className="audit-stat-card">
                    <div className="stat-icon-wrapper" style={{ background: "#dcfce7", color: "#15803d" }}>
                        <FiCheckCircle size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Cấp quyền mới</h3>
                        <p>856</p>
                    </div>
                </div>
                <div className="audit-stat-card">
                    <div className="stat-icon-wrapper" style={{ background: "#fef3c7", color: "#b45309" }}>
                        <FiLock size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Tài khoản bị khóa</h3>
                        <p>12</p>
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
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select 
                            variant="custom"
                            options={ACTION_OPTIONS}
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                            className="audit-filter-select"
                        />
                    </div>
                    <Button variant="outline">
                        <FiDownload /> Xuất báo cáo
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
                    ) : paginatedLogs.length === 0 ? (
                        <div className="audit-table-empty">Không tìm thấy nhật ký nào phù hợp.</div>
                    ) : (
                        paginatedLogs.map(log => (
                            <div className="audit-table-row" key={log.id}>
                                <div className="audit-time">
                                    <span className="time-main">{new Date(log.timestamp).toLocaleDateString('vi-VN')}</span>
                                    <span className="time-sub">{new Date(log.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                
                                <div className="audit-actor">
                                    <div className="actor-avatar">{log.actor.avatar}</div>
                                    <div className="actor-info">
                                        <span className="actor-name">{log.actor.name}</span>
                                        <span className="actor-role">{log.actor.role}</span>
                                    </div>
                                </div>

                                <div className="audit-action-cell">
                                    {getActionBadge(log.action)}
                                </div>

                                <div className="audit-target">
                                    <div className="actor-info">
                                        <span className="actor-name">{log.targetUser}</span>
                                        <span className="actor-role">{log.targetRole}</span>
                                    </div>
                                </div>

                                <div className="audit-changes-cell">
                                    <div className="audit-changes">
                                        {log.details.map((detail, i) => (
                                            <span key={i} className="change-item">{detail}</span>
                                        ))}
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
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>
        </div>
    );
}

