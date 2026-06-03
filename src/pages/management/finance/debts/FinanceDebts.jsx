import { useState, useEffect, useMemo, useCallback } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../../components/common";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import { financeService } from "../../../../services/pages/management/finance";
import {
    FiAlertCircle,
    FiAlertTriangle,
    FiCheckCircle,
    FiClock,
    FiDollarSign,
    FiFilter,
    FiMessageSquare,
    FiRefreshCw,
    FiSearch,
    FiSend,
    FiXCircle,
} from "react-icons/fi";
import { toast } from "react-toastify";
import "./FinanceDebts.css";

const STATUS_FILTER = [
    { value: "all", label: "Tất cả" },
    { value: "unpaid", label: "Chưa thanh toán" },
    { value: "partial", label: "Thanh toán một phần" },
    { value: "paid", label: "Đã thanh toán" },
    { value: "overdue", label: "Quá hạn" },
];

const PRIORITY_FILTER = [
    { value: "all", label: "Tất cả mức" },
    { value: "high", label: "Quá hạn nặng (>90 ngày)" },
    { value: "medium", label: "Quá hạn trung bình (30-90 ngày)" },
    { value: "low", label: "Gần đến hạn (<30 ngày)" },
];

const formatCurrency = (v) =>
    typeof v === "number"
        ? v.toLocaleString("vi-VN")
        : parseFloat(v || 0).toLocaleString("vi-VN");

function getDaysOverdue(dueDate) {
    if (!dueDate) return 0;
    const now = new Date();
    const due = new Date(dueDate);
    return Math.max(0, Math.floor((now - due) / (1000 * 60 * 60 * 24)));
}

function getStatusLabel(debt) {
    if (debt.status === "paid") return "Đã thanh toán";
    const remaining = parseFloat(debt.amount || 0) - parseFloat(debt.paid_amount || 0);
    if (remaining <= 0) return "Đã thanh toán";
    if (remaining < parseFloat(debt.amount || 0)) return "Thanh toán một phần";
    const days = getDaysOverdue(debt.due_date);
    if (days > 60) return "Quá hạn nặng";
    if (days > 30) return "Quá hạn";
    if (days > 0) return "Đến hạn";
    return "Chưa đến hạn";
}

export default function FinanceDebts() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [stats, setStats] = useState({
        totalDebt: 0, totalCollected: 0, totalRemaining: 0,
        overdueAmount: 0, urgentAmount: 0, paidCount: 0, totalCount: 0,
        collectionRate: 0, overdueCount: 0,
    });
    const [totalRecords, setTotalRecords] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDebt, setSelectedDebt] = useState(null);
    const [focusedStudentId, setFocusedStudentId] = useState(null);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;

    // Load stats from dedicated endpoint
    const loadStats = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await financeService.getDebtSummary({
                params: { schoolYearId: selectedSchoolYear?.id, semesterId: selectedTerm?.id },
            });
            if (res?.success) {
                const d = res.data || {};
                setStats({
                    totalDebt: d.totalDebt || d.total_amount || 0,
                    totalCollected: d.totalCollected || d.collected || 0,
                    totalRemaining: d.totalRemaining || d.totalRemaining || (d.totalDebt || 0),
                    overdueAmount: d.overdueAmount || d.overdue_debt || d.overdueDebtAmount || 0,
                    urgentAmount: d.urgentAmount || d.urgent_debt || 0,
                    paidCount: d.paidCount || d.paid_count || 0,
                    totalCount: d.totalCount || d.total_count || 0,
                    collectionRate: d.collectionRate || d.collection_rate || 0,
                    overdueCount: d.overdueCount || d.overdue_count || 0,
                });
            }
        } catch (err) {
            console.error("[FinanceDebts] loadStats error:", err);
            toast.error("Không thể tải thống kê công nợ.");
        } finally {
            setIsLoading(false);
        }
    }, [selectedSchoolYear?.id, selectedTerm?.id]);

    // Load paginated data
    const loadPage = useCallback(async (pageNum) => {
        setIsLoading(true);
        try {
            const res = await financeService.listDebts({
                params: { schoolYearId: selectedSchoolYear?.id, semesterId: selectedTerm?.id, page: pageNum, limit: PAGE_SIZE },
            });
            if (res?.success) {
                const rows = Array.isArray(res.data) ? res.data : res.data?.items || [];
                setPaginatedDebts(rows);
                const total = res.data?.pagination?.total || rows.length;
                setTotalRecords(total);
            }
        } catch (err) {
            console.error("[FinanceDebts] loadPage error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [selectedSchoolYear?.id, selectedTerm?.id]);

    const [paginatedDebts, setPaginatedDebts] = useState([]);

    useEffect(() => { loadStats(); }, [selectedSchoolYear?.id, selectedTerm?.id]);
    useEffect(() => { setPage(1); }, [searchQuery, statusFilter, priorityFilter]);
    useEffect(() => { loadPage(page); }, [page, loadPage]);

    // Filter the paginated page data (client-side filter on server-paginated result)
    const displayDebts = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return paginatedDebts.filter((d) => {
            const name = (d.student_name || "").toLowerCase();
            const code = (d.student_code || `HS${d.student_id}` || "").toLowerCase();
            const searchMatch = !query || name.includes(query) || code.includes(query);
            const status = getStatusLabel(d);

            let statusMatch = true;
            if (statusFilter === "overdue") statusMatch = status.includes("Quá hạn") || status.includes("Đến hạn");
            else if (statusFilter === "paid") statusMatch = status === "Đã thanh toán";
            else if (statusFilter === "partial") statusMatch = status === "Thanh toán một phần";
            else if (statusFilter === "unpaid") statusMatch = status === "Chưa thanh toán";

            let priorityMatch = true;
            const days = getDaysOverdue(d.due_date);
            if (priorityFilter === "high") priorityMatch = days > 90;
            else if (priorityFilter === "medium") priorityMatch = days > 30 && days <= 90;
            else if (priorityFilter === "low") priorityMatch = days > 0 && days <= 30;

            return searchMatch && statusMatch && priorityMatch;
        });
    }, [paginatedDebts, searchQuery, statusFilter, priorityFilter]);

    const overdueDebts = displayDebts.filter((d) => d.status !== "paid" && getDaysOverdue(d.due_date) > 0);
    const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));

    const handleRemind = async (debt) => {
        try {
            const res = await financeService.sendDebtReminder(debt.id, { body: { method: "email" } });
            if (res?.success) {
                toast.success(`Đã gửi nhắc nợ tới phụ huynn của học sinh.`);
            } else {
                toast.error(res?.error?.message || "Có lỗi khi gửi nhắc nợ.");
            }
        } catch (err) {
            toast.error("Có lỗi khi gửi nhắc nợ.");
        }
    };

    const handleRecordPayment = async (debt, amount) => {
        try {
            const res = await financeService.recordDebtPayment(debt.id, {
                amount: parseFloat(amount),
                paymentMethod: "cash",
            });
            if (res?.success) {
                toast.success("Đã ghi nhận thanh toán.");
                loadPage(page);
            } else {
                toast.error(res?.error?.message || "Có lỗi khi ghi nhận.");
            }
        } catch (err) {
            const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || "Không rõ lỗi";
            toast.error("Có lỗi khi ghi nhận thanh toán: " + msg);
        }
    };

    return (
        <div className="fin-debts">
            <PageHeader
                title="Quản lý Công Nợ"
                eyebrow="Theo dõi, nhắc nợ và ghi nhận thanh toán học phí"
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            {/* Summary Stats */}
            <section className="debts-summary-bar">
                <div className="debts-stat">
                    <div className="debts-stat__icon"><FiDollarSign /></div>
                    <div className="debts-stat__content">
                        <span>Tổng công nợ</span>
                        <strong>{formatCurrency(stats.totalRemaining)} đ</strong>
                        <p>{formatCurrency(stats.totalDebt)} đ tổng phát sinh</p>
                    </div>
                </div>
                <div className="debts-stat stat-warning">
                    <div className="debts-stat__icon"><FiAlertTriangle /></div>
                    <div className="debts-stat__content">
                        <span>Công nợ quá hạn</span>
                        <strong>{formatCurrency(stats.overdueAmount)} đ</strong>
                        <p>{overdueDebts.length} hồ sơ quá hạn</p>
                    </div>
                </div>
                <div className="debts-stat stat-danger">
                    <div className="debts-stat__icon"><FiAlertCircle /></div>
                    <div className="debts-stat__content">
                        <span>Nghiêm trọng ({">"}60 ngày)</span>
                        <strong>{formatCurrency(stats.urgentAmount)} đ</strong>
                        <p>{stats.urgentAmount > 0 ? "Cần xử lý ngay" : "Không có"}</p>
                    </div>
                </div>
                <div className="debts-stat stat-success">
                    <div className="debts-stat__icon"><FiCheckCircle /></div>
                    <div className="debts-stat__content">
                        <span>Đã thanh toán</span>
                        <strong>{formatCurrency(stats.totalCollected)} đ</strong>
                        <p>{stats.collectionRate}% tỷ lệ thu</p>
                    </div>
                </div>
            </section>

            {/* Filters */}
            <div className="debts-toolbar">
                <div className="debts-search">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Tìm theo tên, mã học sinh..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    {STATUS_FILTER.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
                <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                    {PRIORITY_FILTER.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
                <button className="btn-secondary" onClick={loadPage.bind(null, page)} disabled={isLoading}>
                    <FiRefreshCw className={isLoading ? "spin" : ""} /> Làm mới
                </button>
            </div>

            {/* Table */}
            <div className="debts-table-card">
                <table className="debts-table">
                    <thead>
                        <tr>
                            <th>Học sinh</th>
                            <th>Khoản thu</th>
                            <th>Tổng tiền</th>
                            <th>Đã trả</th>
                            <th>Còn nợ</th>
                            <th>Hạn</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={8} className="loading-cell">Đang tải...</td></tr>
                        ) : displayDebts.length === 0 ? (
                            <tr><td colSpan={8} className="empty-cell">Không tìm thấy công nợ nào.</td></tr>
                        ) : (
                            displayDebts.map((d) => {
                                const studentName = d.student_name || d.student?.fullName || "-";
                                const studentCode = d.student_code || `HS${d.student_id}`;
                                const remaining = Math.max(0, parseFloat(d.amount || 0) - parseFloat(d.paid_amount || 0));
                                const days = getDaysOverdue(d.due_date);
                                const statusLabel = getStatusLabel(d);
                                const isPaid = d.status === "paid" || remaining <= 0;
                                const isOverdue = days > 0 && !isPaid;
                                const isUrgent = days > 60 && !isPaid;

                                return (
                                    <tr
                                        key={d.id}
                                        className={isUrgent ? "row-urgent" : isOverdue ? "row-overdue" : isPaid ? "row-paid" : ""}
                                        onClick={() => {
                                            setSelectedDebt(d);
                                            setFocusedStudentId(d.student_id);
                                        }}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <td>
                                            <strong>{studentName}</strong>
                                            <small>{studentCode}</small>
                                        </td>
                                        <td>{d.description || d.fee_name || "Khoản thu"}</td>
                                        <td className="align-right">{formatCurrency(d.amount)} đ</td>
                                        <td className="align-right text-success">{formatCurrency(d.paid_amount)} đ</td>
                                        <td className={`align-right ${remaining > 0 ? "text-danger" : "text-success"}`}>
                                            {formatCurrency(remaining)} đ
                                        </td>
                                        <td>
                                            {d.due_date ? (
                                                <span className={isOverdue ? "text-danger" : ""}>
                                                    {new Date(d.due_date).toLocaleDateString("vi-VN")}
                                                    {isOverdue && <><br /><small>{days} ngày quá hạn</small></>}
                                                </span>
                                            ) : "-"}
                                        </td>
                                        <td>
                                            <span className={`status-badge ${isPaid ? "success" : isUrgent ? "danger" : isOverdue ? "warning" : "neutral"}`}>
                                                {statusLabel}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="table-actions" onClick={(e) => e.stopPropagation()}>
                                                {!isPaid && (
                                                    <>
                                                        <button
                                                            className="btn-icon success"
                                                            title="Ghi nhận thanh toán"
                                                            onClick={() => {
                                                                const amt = window.prompt(
                                                                    `Số tiền thanh toán (còn nợ: ${formatCurrency(remaining)} đ):`,
                                                                    formatCurrency(remaining)
                                                                );
                                                                if (amt) handleRecordPayment(d, amt.replace(/[^\d]/g, ""));
                                                            }}
                                                        >
                                                            <FiCheckCircle />
                                                        </button>
                                                        <button
                                                            className="btn-icon"
                                                            title="Gửi nhắc nợ"
                                                            onClick={() => handleRemind(d)}
                                                        >
                                                            <FiSend />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    className="btn-icon"
                                                    title="Xem chi tiết"
                                                    onClick={() => setSelectedDebt(d)}
                                                >
                                                    <FiSearch />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
                <div className="debts-table-footer">
                    <small>Hiển thị {displayDebts.length} / {totalRecords} công nợ</small>
                    <div className="debts-pagination">
                        <button className="debts-pg-btn" onClick={() => setPage(1)} disabled={page === 1}>«</button>
                        <button className="debts-pg-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
                        <input
                            type="text"
                            inputMode="numeric"
                            className="debts-pg-jump"
                            value={page}
                            onChange={(e) => {
                                const raw = e.target.value.replace(/\D/g, "");
                                const v = parseInt(raw, 10);
                                if (raw === "" || (!isNaN(v) && v >= 1)) {
                                    setPage(isNaN(v) ? 1 : v);
                                }
                            }}
                            onBlur={(e) => {
                                const raw = e.target.value.replace(/\D/g, "");
                                const v = parseInt(raw, 10);
                                if (!isNaN(v)) setPage(Math.min(Math.max(1, v), totalPages));
                            }}
                        />
                        <span className="debts-pg-info">/ {totalPages}</span>
                        <button className="debts-pg-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>›</button>
                        <button className="debts-pg-btn" onClick={() => setPage(totalPages)} disabled={page >= totalPages}>»</button>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedDebt && (
                <div className="fee-modal-overlay" onClick={() => setSelectedDebt(null)}>
                    <div className="fee-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="fee-modal-header">
                            <div>
                                <h3>Chi tiết công nợ</h3>
                                <p className="fm-modal-subtitle">
                                    {selectedDebt.student_name || selectedDebt.student?.fullName || "-"} &mdash; {selectedDebt.student_code || `HS${selectedDebt.student_id}`}
                                </p>
                            </div>
                            <button className="btn-icon" style={{ border: "none", background: "none" }} onClick={() => setSelectedDebt(null)}>
                                <FiXCircle />
                            </button>
                        </div>
                        <div className="fee-modal-body">
                            <div className="debt-detail-grid">
                                <div className="debt-detail-card">
                                    <div className="ddc-row">
                                        <span>Khoản thu</span>
                                        <strong>{selectedDebt.description || selectedDebt.fee_name || "-"}</strong>
                                    </div>
                                    <div className="ddc-row">
                                        <span>Tổng tiền</span>
                                        <strong>{formatCurrency(selectedDebt.amount)} đ</strong>
                                    </div>
                                    <div className="ddc-row">
                                        <span>Đã thanh toán</span>
                                        <strong className="text-success">{formatCurrency(selectedDebt.paid_amount)} đ</strong>
                                    </div>
                                    <div className="ddc-row ddc-row--highlight">
                                        <span>Còn nợ</span>
                                        <strong className="text-danger">
                                            {formatCurrency(Math.max(0, parseFloat(selectedDebt.amount || 0) - parseFloat(selectedDebt.paid_amount || 0)))} đ
                                        </strong>
                                    </div>
                                    <div className="ddc-row">
                                        <span>Hạn thanh toán</span>
                                        <strong>{selectedDebt.due_date ? new Date(selectedDebt.due_date).toLocaleDateString("vi-VN") : "-"}</strong>
                                    </div>
                                    <div className="ddc-row">
                                        <span>Trạng thái</span>
                                        <span className={`status-badge ${getStatusLabel(selectedDebt).includes("Quá") ? "warning" : getStatusLabel(selectedDebt) === "Đã thanh toán" ? "success" : "neutral"}`}>
                                            {getStatusLabel(selectedDebt)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="fee-modal-footer">
                            <button className="btn-secondary" onClick={() => setSelectedDebt(null)}>Đóng</button>
                            {getStatusLabel(selectedDebt) !== "Đã thanh toán" && (
                                <button
                                    className="btn-primary"
                                    onClick={() => {
                                        setSelectedDebt(null);
                                        const d = selectedDebt;
                                        const remaining = Math.max(0, parseFloat(d.amount || 0) - parseFloat(d.paid_amount || 0));
                                        const amt = window.prompt(`Số tiền thanh toán (còn nợ: ${formatCurrency(remaining)} đ):`, formatCurrency(remaining));
                                        if (amt) handleRecordPayment(d, amt.replace(/[^\d]/g, ""));
                                    }}
                                >
                                    <FiCheckCircle /> Ghi nhận thanh toán
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
