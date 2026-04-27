import React, { useState, useMemo, useEffect } from "react";
import { FiActivity, FiClock, FiUser, FiFilter, FiDownload, FiSearch, FiCheckCircle, FiInfo, FiCalendar, FiBookOpen, FiList } from "react-icons/fi";
import { PageHeader, Pagination, SchoolYearTermSelector, LoadingSpinner } from "../../../components/common";
import { Select, Button } from "../../../components/ui";
import "./AdminSystemLog.css";

const MOCK_SYSTEM_LOGS = [
    {
        id: "SL1",
        timestamp: "2026-04-26T09:30:00Z",
        actor: { name: "Hệ Thống", role: "Automatic", avatar: "S" },
        action: "WEEK_TRANSITION",
        target: "Học kỳ II",
        details: ["Chuyển sang Tuần 32", "Cập nhật thời khóa biểu tuần mới"],
        status: "SUCCESS"
    },
    {
        id: "SL2",
        timestamp: "2026-04-26T08:15:00Z",
        actor: { name: "Nguyễn Văn An", role: "Giáo viên", avatar: "A" },
        action: "EXAM_STARTED",
        target: "Lớp 12A1",
        details: ["Bắt đầu bài kiểm tra: Toán Giải Tích", "Số lượng học sinh tham gia: 42"],
        status: "SUCCESS"
    },
    {
        id: "SL3",
        timestamp: "2026-04-26T07:45:00Z",
        actor: { name: "Lê Minh Hoàng", role: "Super Admin", avatar: "H" },
        action: "SYSTEM_UPDATE",
        target: "Cấu hình hệ thống",
        details: ["Cập nhật phiên bản v2.4.5", "Tối ưu hóa tốc độ tải trang"],
        status: "SUCCESS"
    },
    {
        id: "SL4",
        timestamp: "2026-04-25T16:20:00Z",
        actor: { name: "Trần Thị Bình", role: "Admin", avatar: "B" },
        action: "USER_LOGIN",
        target: "Hệ thống",
        details: ["Đăng nhập từ IP: 192.168.1.105", "Thiết bị: Chrome / Windows"],
        status: "SUCCESS"
    },
    {
        id: "SL5",
        timestamp: "2026-04-25T14:05:00Z",
        actor: { name: "Vũ Minh Tuấn", role: "PHT Chuyên môn", avatar: "T" },
        action: "GRADE_SUBMITTED",
        target: "Lớp 10C3",
        details: ["Phê duyệt bảng điểm môn Vật Lý", "Học kỳ II - Lần 1"],
        status: "SUCCESS"
    },
    {
        id: "SL6",
        timestamp: "2026-04-25T08:30:00Z",
        actor: { name: "Hệ Thống", role: "Automatic", avatar: "S" },
        action: "BACKUP_SUCCESS",
        target: "Cơ sở dữ liệu",
        details: ["Sao lưu định kỳ hoàn tất", "Dung lượng: 1.2GB"],
        status: "SUCCESS"
    }
];

const ACTION_OPTIONS = [
    { value: "ALL", label: "Tất cả hoạt động" },
    { value: "WEEK_TRANSITION", label: "Chuyển tuần" },
    { value: "EXAM_STARTED", label: "Bắt đầu thi" },
    { value: "GRADE_SUBMITTED", label: "Nộp điểm" },
    { value: "SYSTEM_UPDATE", label: "Cập nhật hệ thống" },
    { value: "USER_LOGIN", label: "Đăng nhập" },
];

export default function AdminSystemLog() {
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
        return MOCK_SYSTEM_LOGS.filter(log => {
            const matchesAction = actionFilter === "ALL" || log.action === actionFilter;
            const matchesSearch = log.target.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 log.actor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 log.details.some(d => d.toLowerCase().includes(searchQuery.toLowerCase()));
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
                        <p>142</p>
                    </div>
                </div>
                <div className="system-stat-card">
                    <div className="stat-icon-wrapper" style={{ background: "#fef3c7", color: "#b45309" }}>
                        <FiList size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Tổng số bản ghi</h3>
                        <p>25,840</p>
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
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select 
                            variant="custom"
                            options={ACTION_OPTIONS}
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                            className="system-filter-select"
                        />
                    </div>
                    <Button variant="outline">
                        <FiDownload /> Xuất báo cáo
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
                    ) : paginatedLogs.length === 0 ? (
                        <div className="system-table-empty">Không tìm thấy nhật ký nào phù hợp.</div>
                    ) : (
                        paginatedLogs.map(log => (
                            <div className="system-table-row" key={log.id}>
                                <div className="system-time">
                                    <span className="time-main">{new Date(log.timestamp).toLocaleDateString('vi-VN')}</span>
                                    <span className="time-sub">{new Date(log.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                
                                <div className="system-actor">
                                    <div className="actor-avatar">{log.actor.avatar}</div>
                                    <div className="actor-info">
                                        <span className="actor-name">{log.actor.name}</span>
                                        <span className="actor-role">{log.actor.role}</span>
                                    </div>
                                </div>

                                <div className="system-action-cell">
                                    {getActionBadge(log.action)}
                                </div>

                                <div className="system-target">
                                    <div className="actor-info">
                                        <span className="actor-name">{log.target}</span>
                                    </div>
                                </div>

                                <div className="system-details-cell">
                                    <div className="system-details">
                                        {log.details.map((detail, i) => (
                                            <span key={i} className="detail-item">{detail}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="system-status-cell">
                                    <span className="status-success">
                                        <FiCheckCircle /> Thành công
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="system-pagination-row">
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
