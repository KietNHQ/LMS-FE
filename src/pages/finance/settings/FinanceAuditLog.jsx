import { useEffect, useMemo, useState } from "react";
import {
    FiActivity,
    FiArrowDown,
    FiCheckCircle,
    FiClock,
    FiDownload,
    FiFilter,
    FiRefreshCcw,
    FiSearch,
    FiShield,
    FiUser,
    FiXCircle,
    FiAlertTriangle,
    FiFileText,
    FiInfo,
    FiMapPin,
    FiTarget,
} from "react-icons/fi";
import Modal from "../../../components/ui/Modal/Modal";
import { PageHeader, Pagination, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import "./FinanceAuditLog.css";

const AUDIT_EVENTS = [
    {
        id: "FIN-AUD-001",
        timestamp: "2026-10-16T14:20:15",
        actor: "Kế toán Lê Thị M",
        role: "Kế toán",
        action: "Xóa biên lai",
        category: "Chứng từ",
        module: "Thu phí",
        entityId: "RCT-772",
        severity: "high",
        outcome: "Yêu cầu xác minh",
        reason: "Sai thông tin học sinh trên biên lai",
        detail: "Biên lai bị xóa sau khi phát hiện mã học sinh không khớp hồ sơ lớp.",
        before: "Mã học sinh: HS-2026-118",
        after: "Đề nghị tạo lại biên lai đúng mã",
        ip: "10.14.32.8",
        location: "Phòng tài vụ",
        tags: ["biên lai", "xóa dữ liệu", "rủi ro cao"],
    },
    {
        id: "FIN-AUD-002",
        timestamp: "2026-10-16T11:05:42",
        actor: "Admin",
        role: "Quản trị",
        action: "Cập nhật biểu phí",
        category: "Cấu hình",
        module: "Học phí",
        entityId: "HP_CHINH",
        severity: "medium",
        outcome: "Đã ghi nhận",
        reason: "Cập nhật đơn giá học kỳ 2",
        detail: "Điều chỉnh biểu phí theo quyết nghị hội đồng và áp dụng từ ngày 17/10.",
        before: "1.250.000 ₫ / học sinh",
        after: "1.350.000 ₫ / học sinh",
        ip: "10.14.21.5",
        location: "Văn phòng kế toán",
        tags: ["biểu phí", "cập nhật", "phê duyệt"],
    },
    {
        id: "FIN-AUD-003",
        timestamp: "2026-10-15T09:30:00",
        actor: "Thu ngân Phạm K",
        role: "Thu ngân",
        action: "Duyệt miễn giảm",
        category: "Chính sách",
        module: "Miễn giảm",
        entityId: "HS-001",
        severity: "high",
        outcome: "Cần trưởng bộ phận xác nhận",
        reason: "Điều chỉnh theo quyết định mới",
        detail: "Miễn giảm 50% phí bán trú cho học sinh thuộc diện ưu tiên.",
        before: "Miễn giảm 0%",
        after: "Miễn giảm 50%",
        ip: "10.14.32.15",
        location: "Quầy thu phí",
        tags: ["miễn giảm", "ưu tiên", "kiểm soát"],
    },
    {
        id: "FIN-AUD-004",
        timestamp: "2026-10-14T16:50:11",
        actor: "Kế toán Lê Thị M",
        role: "Kế toán",
        action: "Ký phát hành hóa đơn",
        category: "Chứng từ",
        module: "Hóa đơn",
        entityId: "INV-552",
        severity: "low",
        outcome: "Hoàn tất",
        reason: "Phát hành định kỳ",
        detail: "Hóa đơn tháng được ký số và chuyển sang trạng thái đã phát hành.",
        before: "Trạng thái: Nháp",
        after: "Trạng thái: Đã phát hành",
        ip: "10.14.11.19",
        location: "Phòng kế toán",
        tags: ["hóa đơn", "phát hành", "đúng hạn"],
    },
    {
        id: "FIN-AUD-005",
        timestamp: "2026-10-14T08:42:00",
        actor: "Kế toán trưởng Trần D",
        role: "Kế toán trưởng",
        action: "Khóa sổ công nợ",
        category: "Đối soát",
        module: "Công nợ",
        entityId: "AR-10A1",
        severity: "high",
        outcome: "Đã khóa",
        reason: "Chốt dữ liệu cuối ngày",
        detail: "Khóa sổ tạm thời để phục vụ đối chiếu công nợ và khóa nhập mới.",
        before: "Mở chỉnh sửa",
        after: "Chế độ khóa sổ",
        ip: "10.14.12.4",
        location: "Khu hành chính",
        tags: ["khóa sổ", "đối soát", "kiểm soát"],
    },
    {
        id: "FIN-AUD-006",
        timestamp: "2026-10-13T15:18:00",
        actor: "Nhân viên quỹ Võ T",
        role: "Thu ngân",
        action: "Xuất báo cáo",
        category: "Báo cáo",
        module: "Báo cáo cuối ngày",
        entityId: "RPT-101",
        severity: "low",
        outcome: "Hoàn tất",
        reason: "Gửi báo cáo cho kế toán trưởng",
        detail: "Xuất file báo cáo doanh thu và đối soát phiếu thu trong ngày.",
        before: "Chưa xuất",
        after: "Đã tạo tệp PDF",
        ip: "10.14.32.29",
        location: "Phòng thu ngân",
        tags: ["báo cáo", "xuất file", "pdf"],
    },
    {
        id: "FIN-AUD-007",
        timestamp: "2026-10-13T09:00:00",
        actor: "Admin",
        role: "Quản trị",
        action: "Thay đổi quyền truy cập",
        category: "Bảo mật",
        module: "Phân quyền",
        entityId: "USR-219",
        severity: "critical",
        outcome: "Cần rà soát",
        reason: "Thêm quyền chỉnh sửa chứng từ",
        detail: "Tài khoản được mở rộng quyền trên module tài chính để hỗ trợ vận hành.",
        before: "Chỉ xem",
        after: "Xem + chỉnh sửa",
        ip: "10.14.21.5",
        location: "Văn phòng hệ thống",
        tags: ["phân quyền", "bảo mật", "rủi ro"],
    },
    {
        id: "FIN-AUD-008",
        timestamp: "2026-10-12T10:22:45",
        actor: "Kế toán Lê Thị M",
        role: "Kế toán",
        action: "Đối chiếu thanh toán",
        category: "Đối soát",
        module: "Thanh toán",
        entityId: "PAY-884",
        severity: "medium",
        outcome: "Khớp dữ liệu",
        reason: "Đối chiếu giao dịch ngân hàng",
        detail: "Đã khớp 98% chứng từ, còn 2 giao dịch chờ ngân hàng xác nhận.",
        before: "Chênh lệch 3 giao dịch",
        after: "Chênh lệch 2 giao dịch",
        ip: "10.14.11.19",
        location: "Phòng kế toán",
        tags: ["đối soát", "ngân hàng", "thanh toán"],
    },
];

const ACTION_OPTIONS = [
    { value: "all", label: "Tất cả hành động" },
    { value: "Xóa biên lai", label: "Xóa biên lai" },
    { value: "Cập nhật biểu phí", label: "Cập nhật biểu phí" },
    { value: "Duyệt miễn giảm", label: "Duyệt miễn giảm" },
    { value: "Ký phát hành hóa đơn", label: "Ký phát hành hóa đơn" },
    { value: "Khóa sổ công nợ", label: "Khóa sổ công nợ" },
    { value: "Xuất báo cáo", label: "Xuất báo cáo" },
    { value: "Thay đổi quyền truy cập", label: "Thay đổi quyền truy cập" },
    { value: "Đối chiếu thanh toán", label: "Đối chiếu thanh toán" },
];

const MODULE_OPTIONS = [
    { value: "all", label: "Tất cả phân hệ" },
    { value: "Thu phí", label: "Thu phí" },
    { value: "Học phí", label: "Học phí" },
    { value: "Miễn giảm", label: "Miễn giảm" },
    { value: "Hóa đơn", label: "Hóa đơn" },
    { value: "Công nợ", label: "Công nợ" },
    { value: "Báo cáo cuối ngày", label: "Báo cáo cuối ngày" },
    { value: "Phân quyền", label: "Phân quyền" },
    { value: "Thanh toán", label: "Thanh toán" },
];

const SEVERITY_OPTIONS = [
    { value: "all", label: "Tất cả mức độ" },
    { value: "critical", label: "Khẩn cấp" },
    { value: "high", label: "Rủi ro cao" },
    { value: "medium", label: "Theo dõi" },
    { value: "low", label: "Bình thường" },
];

const SORT_OPTIONS = [
    { value: "newest", label: "Mới nhất" },
    { value: "oldest", label: "Cũ nhất" },
    { value: "severity", label: "Mức độ rủi ro" },
];

const PAGE_SIZE = 6;

function formatDateTime(value) {
    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).format(new Date(value));
}

function formatDateShort(value) {
    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(value));
}

function getSeverityLabel(severity) {
    switch (severity) {
        case "critical":
            return "Khẩn cấp";
        case "high":
            return "Rủi ro cao";
        case "medium":
            return "Theo dõi";
        default:
            return "Bình thường";
    }
}

function downloadTextFile(filename, content, mimeType = "text/plain;charset=utf-8") {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

export default function FinanceAuditLog() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [searchTerm, setSearchTerm] = useState("");
    const [actionFilter, setActionFilter] = useState("all");
    const [moduleFilter, setModuleFilter] = useState("all");
    const [severityFilter, setSeverityFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedLogId, setSelectedLogId] = useState(AUDIT_EVENTS[0]?.id || null);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

    const summary = useMemo(() => {
        const total = AUDIT_EVENTS.length;
        const critical = AUDIT_EVENTS.filter((item) => item.severity === "critical").length;
        const highRisk = AUDIT_EVENTS.filter((item) => item.severity === "critical" || item.severity === "high").length;
        const modules = new Set(AUDIT_EVENTS.map((item) => item.module)).size;
        const staff = new Set(AUDIT_EVENTS.map((item) => item.actor)).size;
        const todayStamp = new Date("2026-10-16T23:59:59").getTime();
        const recent = AUDIT_EVENTS.filter((item) => new Date(item.timestamp).getTime() >= todayStamp - (1000 * 60 * 60 * 24)).length;

        return { total, critical, highRisk, modules, staff, recent };
    }, []);

    const filteredLogs = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();

        const list = AUDIT_EVENTS.filter((item) => {
            const searchable = [item.actor, item.role, item.action, item.category, item.module, item.entityId, item.reason, item.detail, item.outcome, item.ip, item.location, ...(item.tags || [])]
                .join(" ")
                .toLowerCase();

            const matchesSearch = keyword.length === 0 || searchable.includes(keyword);
            const matchesAction = actionFilter === "all" || item.action === actionFilter;
            const matchesModule = moduleFilter === "all" || item.module === moduleFilter;
            const matchesSeverity = severityFilter === "all" || item.severity === severityFilter;

            return matchesSearch && matchesAction && matchesModule && matchesSeverity;
        });

        const riskWeight = { critical: 4, high: 3, medium: 2, low: 1 };

        return [...list].sort((a, b) => {
            if (sortBy === "oldest") {
                return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
            }

            if (sortBy === "severity") {
                const severityDelta = (riskWeight[b.severity] || 0) - (riskWeight[a.severity] || 0);
                if (severityDelta !== 0) {
                    return severityDelta;
                }
            }

            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
    }, [actionFilter, moduleFilter, searchTerm, severityFilter, sortBy]);

    const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));

    const handleSearchChange = (value) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handleActionChange = (value) => {
        setActionFilter(value);
        setCurrentPage(1);
    };

    const handleModuleChange = (value) => {
        setModuleFilter(value);
        setCurrentPage(1);
    };

    const handleSeverityChange = (value) => {
        setSeverityFilter(value);
        setCurrentPage(1);
    };

    const handleSortChange = (value) => {
        setSortBy(value);
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        setSearchTerm("");
        setActionFilter("all");
        setModuleFilter("all");
        setSeverityFilter("all");
        setSortBy("newest");
        setCurrentPage(1);
    };

    const handleExportCsv = () => {
        const rows = [
            ["Mã log", "Thời gian", "Người thực hiện", "Vai trò", "Hành động", "Phân hệ", "Đối tượng", "Mức độ", "Kết quả", "Lý do"],
            ...filteredLogs.map((item) => [
                item.id,
                formatDateTime(item.timestamp),
                item.actor,
                item.role,
                item.action,
                item.module,
                item.entityId,
                getSeverityLabel(item.severity),
                item.outcome,
                item.reason,
            ]),
        ];

        const csv = rows
            .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
            .join("\n");

        downloadTextFile(`finance-audit-log-${selectedSchoolYear}-${selectedTerm}.csv`, csv, "text/csv;charset=utf-8");
    };

    const safeCurrentPage = Math.min(currentPage, totalPages);

    const visibleLogs = useMemo(() => {
        const start = (safeCurrentPage - 1) * PAGE_SIZE;
        return filteredLogs.slice(start, start + PAGE_SIZE);
    }, [filteredLogs, safeCurrentPage]);

    const selectedLog = useMemo(() => {
        if (filteredLogs.length === 0) {
            return null;
        }

        return filteredLogs.find((item) => item.id === selectedLogId) || visibleLogs[0] || filteredLogs[0] || null;
    }, [filteredLogs, selectedLogId, visibleLogs]);

    const openDetailDialog = (logId) => {
        setSelectedLogId(logId);
        setIsDetailDialogOpen(true);
    };

    const closeDetailDialog = () => {
        setIsDetailDialogOpen(false);
    };

    return (
        <div className="fin-audit-log">
            <PageHeader
                title="Nhật ký kiểm toán tài chính"
                eyebrow="Finance / Settings"
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            <section className="audit-top-grid" aria-label="Tóm tắt nhật ký kiểm toán">
                <article className="audit-spotlight">
                    <div className="audit-spotlight__badge">
                        <FiAlertTriangle />
                        Điểm cần để ý
                    </div>

                    <h2>{summary.critical} bản ghi đang ở mức khẩn cấp</h2>
                    <p>
                        Ưu tiên xem các thao tác xóa, thay đổi quyền và cập nhật biểu phí có tác động trực tiếp đến kiểm soát nội bộ.
                    </p>

                    <div className="audit-spotlight__stats">
                        <div>
                            <strong>{summary.critical}</strong>
                            <span>Khẩn cấp</span>
                        </div>
                        <div>
                            <strong>{summary.highRisk}</strong>
                            <span>Rủi ro cao</span>
                        </div>
                        <div>
                            <strong>{summary.recent}</strong>
                            <span>24h gần nhất</span>
                        </div>
                    </div>
                </article>

            <section className="audit-summary-grid" aria-label="Chỉ số tổng quan">
                <article className="audit-summary-card audit-summary-card--primary">
                    <div className="audit-summary-card__icon"><FiActivity /></div>
                    <div>
                        <span>Tổng bản ghi</span>
                        <strong>{summary.total}</strong>
                        <p>Phạm vi theo năm học và học kỳ đang chọn</p>
                    </div>
                </article>

                <article className="audit-summary-card audit-summary-card--neutral">
                    <div className="audit-summary-card__icon"><FiUser /></div>
                    <div>
                        <span>Nhân sự phát sinh log</span>
                        <strong>{summary.staff}</strong>
                        <p>Người dùng đã tạo thay đổi</p>
                    </div>
                </article>

                <article className="audit-summary-card audit-summary-card--success">
                    <div className="audit-summary-card__icon"><FiCheckCircle /></div>
                    <div>
                        <span>Bản ghi gần nhất</span>
                        <strong>{summary.recent}</strong>
                        <p>Phát sinh trong 24 giờ gần nhất</p>
                    </div>
                </article>

                <article className="audit-summary-card audit-summary-card--info">
                    <div className="audit-summary-card__icon"><FiFileText /></div>
                    <div>
                        <span>Phân hệ đang theo dõi</span>
                        <strong>{summary.modules}</strong>
                        <p>Phủ trên các nhóm nghiệp vụ tài chính</p>
                    </div>
                </article>
                </section>
            </section>

            <section className="audit-toolbar" aria-label="Bộ lọc nhật ký kiểm toán">
                <label className="audit-search">
                    <FiSearch />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(event) => handleSearchChange(event.target.value)}
                        placeholder="Tìm theo người dùng, hành động, mã chứng từ, IP, lý do..."
                    />
                </label>

                <div className="audit-toolbar__filters">
                    <label className="audit-select">
                        <span><FiFilter /> Hành động</span>
                        <select value={actionFilter} onChange={(event) => handleActionChange(event.target.value)}>
                            {ACTION_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </label>

                    <label className="audit-select">
                        <span><FiTarget /> Phân hệ</span>
                        <select value={moduleFilter} onChange={(event) => handleModuleChange(event.target.value)}>
                            {MODULE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </label>

                    <label className="audit-select">
                        <span><FiAlertTriangle /> Mức độ</span>
                        <select value={severityFilter} onChange={(event) => handleSeverityChange(event.target.value)}>
                            {SEVERITY_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </label>

                    <label className="audit-select">
                        <span><FiArrowDown /> Sắp xếp</span>
                        <select value={sortBy} onChange={(event) => handleSortChange(event.target.value)}>
                            {SORT_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </label>
                </div>

                <div className="audit-toolbar__actions">
                    <button type="button" className="audit-btn audit-btn--ghost" onClick={handleClearFilters}>
                        <FiRefreshCcw />
                        Xóa lọc
                    </button>
                    <button type="button" className="audit-btn audit-btn--primary" onClick={handleExportCsv}>
                        <FiDownload />
                        Xuất CSV
                    </button>
                </div>
            </section>

            <section className="audit-layout audit-layout--single">
                <div className="audit-panel audit-panel--table">
                    <div className="audit-panel__head">
                        <div>
                            <h3>Danh sách nhật ký</h3>
                            <p>Chọn một dòng để xem chi tiết sự kiện và trạng thái kiểm soát.</p>
                        </div>
                        <span>{filteredLogs.length} bản ghi</span>
                    </div>

                    <div className="audit-table-wrap">
                        <table className="audit-table">
                            <thead>
                                <tr>
                                    <th>Thời gian</th>
                                    <th>Người thực hiện</th>
                                    <th>Hành động</th>
                                    <th>Đối tượng</th>
                                    <th>Mức độ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleLogs.length > 0 ? (
                                    visibleLogs.map((item) => {
                                        const isSelected = item.id === selectedLogId;
                                        return (
                                            <tr
                                                key={item.id}
                                                className={isSelected ? "is-selected" : ""}
                                                onClick={() => openDetailDialog(item.id)}
                                            >
                                                <td>
                                                    <div className="audit-table__time">
                                                        <strong>{formatDateShort(item.timestamp)}</strong>
                                                        <span>{new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(item.timestamp))}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="audit-table__actor">
                                                        <button
                                                            type="button"
                                                            className="audit-table__actor-btn"
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                openDetailDialog(item.id);
                                                            }}
                                                        >
                                                            {item.actor}
                                                        </button>
                                                        <span>{item.role}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="audit-table__action">
                                                        <span className={`audit-badge audit-badge--${item.severity}`}>{item.action}</span>
                                                        <small>{item.module}</small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="audit-table__entity">
                                                        <code>{item.entityId}</code>
                                                        <span>{item.category}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`audit-severity audit-severity--${item.severity}`}>
                                                        {getSeverityLabel(item.severity)}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={5}>
                                            <div className="audit-empty">
                                                <FiInfo />
                                                <strong>Không có bản ghi phù hợp</strong>
                                                <p>Hãy thử mở rộng bộ lọc hoặc xóa toàn bộ điều kiện đang áp dụng.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="audit-footer">
                        <div className="audit-footer__meta">
                            <span>Hiển thị {visibleLogs.length} / {filteredLogs.length}</span>
                            <span>Năm học {selectedSchoolYear} - {selectedTerm.toUpperCase()}</span>
                        </div>

                        <Pagination
                            currentPage={safeCurrentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            ariaLabel="Phân trang nhật ký kiểm toán tài chính"
                        />
                    </div>
                </div>
            </section>

            <Modal
                open={isDetailDialogOpen && Boolean(selectedLog)}
                title={selectedLog ? `Hồ sơ kiểm toán - ${selectedLog.id}` : "Hồ sơ kiểm toán"}
                onClose={closeDetailDialog}
                className="audit-log-modal"
            >
                {selectedLog ? (
                    <div className="audit-dialog-v2">
                        <section className="audit-dialog-v2__hero">
                            <div className="audit-dialog-v2__identity">
                                <span>Người thực hiện</span>
                                <strong>{selectedLog.actor}</strong>
                                <p>{selectedLog.role}</p>
                            </div>

                            <div className="audit-dialog-v2__status-grid">
                                <div>
                                    <span>Hành động</span>
                                    <strong>{selectedLog.action}</strong>
                                </div>
                                <div>
                                    <span>Mức độ</span>
                                    <strong>
                                        <span className={`audit-severity audit-severity--${selectedLog.severity}`}>
                                            {getSeverityLabel(selectedLog.severity)}
                                        </span>
                                    </strong>
                                </div>
                                <div>
                                    <span>Kết quả</span>
                                    <strong>{selectedLog.outcome}</strong>
                                </div>
                                <div>
                                    <span>Thời gian</span>
                                    <strong>{formatDateTime(selectedLog.timestamp)}</strong>
                                </div>
                            </div>
                        </section>

                        <section className="audit-dialog-v2__grid">
                            <article className="audit-dialog-v2__card">
                                <h4>Thông tin hệ thống</h4>
                                <div className="audit-dialog-v2__kv-list">
                                    <div><span>Mã bản ghi</span><strong>{selectedLog.id}</strong></div>
                                    <div><span>Phân hệ</span><strong>{selectedLog.module}</strong></div>
                                    <div><span>Loại nghiệp vụ</span><strong>{selectedLog.category}</strong></div>
                                    <div><span>Đối tượng</span><strong>{selectedLog.entityId}</strong></div>
                                    <div><span>Địa điểm</span><strong>{selectedLog.location}</strong></div>
                                    <div><span>IP nguồn</span><strong>{selectedLog.ip}</strong></div>
                                </div>
                            </article>

                            <article className="audit-dialog-v2__card">
                                <h4>Tác động dữ liệu</h4>
                                <div className="audit-dialog-v2__diff">
                                    <div>
                                        <span>Giá trị trước</span>
                                        <p>{selectedLog.before}</p>
                                    </div>
                                    <div>
                                        <span>Giá trị sau</span>
                                        <p>{selectedLog.after}</p>
                                    </div>
                                </div>
                            </article>

                            <article className="audit-dialog-v2__card audit-dialog-v2__card--wide">
                                <h4>Giải trình</h4>
                                <p>{selectedLog.reason}</p>
                                <p>{selectedLog.detail}</p>
                            </article>

                            <article className="audit-dialog-v2__card audit-dialog-v2__card--wide">
                                <h4>Nhãn phân loại</h4>
                                <div className="audit-dialog-v2__tags">
                                    {selectedLog.tags.map((tag) => (
                                        <span key={tag}>{tag}</span>
                                    ))}
                                </div>
                            </article>
                        </section>
                    </div>
                ) : null}
            </Modal>

        </div>
    );
}
