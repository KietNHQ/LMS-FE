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
import Modal from "../../../../components/ui/Modal/Modal";
import { PageHeader, Pagination, SchoolYearTermSelector } from "../../../../components/common";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import { financeService } from "../../../../services/pages/management/finance";
import "./FinanceAuditLog.css";


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
    const [auditLogs, setAuditLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [actionFilter, setActionFilter] = useState("all");
    const [moduleFilter, setModuleFilter] = useState("all");
    const [severityFilter, setSeverityFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedLogId, setSelectedLogId] = useState(null);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

    const fetchAuditLogs = async () => {
        setIsLoading(true);
        try {
            const res = await financeService.getAuditLogs({
                params: {
                    limit: 200,
                    schoolYearId: selectedSchoolYear?.id,
                    semesterId: selectedTerm?.id,
                },
            });

            if (res?.success && res.data) {
                setAuditLogs(res.data);
                if (res.data.length > 0) {
                    setSelectedLogId(res.data[0].id);
                }
            }
        } catch (error) {
            console.error("Error fetching audit logs:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAuditLogs();
    }, [selectedSchoolYear, selectedTerm]);

    const summary = useMemo(() => {
        const total = auditLogs.length;
        const critical = auditLogs.filter((item) => item.severity === "critical").length;
        const highRisk = auditLogs.filter((item) => item.severity === "critical" || item.severity === "high").length;
        const modules = new Set(auditLogs.map((item) => item.module)).size;
        const staff = new Set(auditLogs.map((item) => item.actor || item.userName)).size;
        const todayStamp = new Date().getTime();
        const recent = auditLogs.filter((item) => {
            if (!item.timestamp) return false;
            return new Date(item.timestamp).getTime() >= todayStamp - (1000 * 60 * 60 * 24);
        }).length;

        return { total, critical, highRisk, modules, staff, recent };
    }, [auditLogs]);

    const filteredLogs = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();

        const list = auditLogs.filter((item) => {
            const searchable = [
                item.actor || item.userName || "",
                item.role || item.userRole || "",
                item.action || "",
                item.category || "",
                item.module || "",
                item.entityId || "",
                item.reason || "",
                item.detail || "",
                item.outcome || "",
            ].join(" ").toLowerCase();

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
    }, [auditLogs, actionFilter, moduleFilter, searchTerm, severityFilter, sortBy]);

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

        // selectedSchoolYear and selectedTerm are objects from useSchoolYearTerm.
        // Fallback to .label (string) for school year and .toUpperCase() (string) for term.
        // selectedSchoolYear can be { id, label, ... } or already a string.
        downloadTextFile(`finance-audit-log-${selectedSchoolYear?.label || selectedSchoolYear || "all"}-${selectedTerm?.toUpperCase() || selectedTerm || "all"}.csv`, csv, "text/csv;charset=utf-8");
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
                            <span>Năm học {selectedSchoolYear?.label || selectedSchoolYear || "-"} - {selectedTerm?.toUpperCase() || selectedTerm || "-"}</span>
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
                                    {(selectedLog.tags || []).map((tag) => (
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

