import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../../components/common";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import { financeService } from "../../../../services/pages/management/finance";
import { resolveSchoolYearId, resolveSemesterId } from "../../../../services/shared/schoolYearLookup";
import {
    FiCalendar,
    FiCheckCircle,
    FiDollarSign,
    FiDownload,
    FiFilter,
    FiRefreshCw,
    FiSearch,
    FiTrendingUp,
    FiXCircle,
} from "react-icons/fi";
import { toast } from "react-toastify";
import "./FinancePaymentHistory.css";

const METHOD_LABELS = {
    cash: "Tiền mặt",
    bank_transfer: "Chuyển khoản",
    online: "Thanh toán online",
    other: "Khác",
};

const formatCurrency = (v) =>
    typeof v === "number"
        ? v.toLocaleString("vi-VN")
        : parseFloat(v || 0).toLocaleString("vi-VN");

function formatDate(iso) {
    if (!iso) return "-";
    return new Date(iso).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function FinancePaymentHistory() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [stats, setStats] = useState({ totalAmount: 0, byMethod: {}, count: 0 });
    const [totalRecords, setTotalRecords] = useState(0);
    const [paginatedRows, setPaginatedRows] = useState([]);
    const [isStatsLoading, setIsStatsLoading] = useState(false);
    const [isDataLoading, setIsDataLoading] = useState(false);
    const isLoading = isStatsLoading || isDataLoading;
    const [searchQuery, setSearchQuery] = useState("");
    const [methodFilter, setMethodFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [viewMode, setViewMode] = useState("table"); // 'table' | 'timeline'
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;

    // Resolved IDs — updated whenever schoolYear/term settles (debounced)
    const [resolvedIds, setResolvedIds] = useState({ schoolYearId: undefined, semesterId: undefined });
    const isFetchingRef = useRef(false);

    // Debounce ID resolution — waits for selectedSchoolYear/term to settle
    useEffect(() => {
        let timer;
        const resolve = async () => {
            clearTimeout(timer);
            timer = setTimeout(async () => {
                const syId = await resolveSchoolYearId(selectedSchoolYear);
                const semId = await resolveSemesterId(selectedSchoolYear, selectedTerm);
                setResolvedIds({ schoolYearId: syId, semesterId: semId });
            }, 150);
        };
        resolve();
        return () => clearTimeout(timer);
    }, [selectedSchoolYear, selectedTerm]);

    // Single effect: fetch stats + page data when resolvedIds changes
    // Uses ref to prevent re-entrancy (no setState in here to avoid extra re-renders)
    useEffect(() => {
        const { schoolYearId: syId, semesterId: semId } = resolvedIds;
        if (!syId || !semId) return;
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;

        const fetchAll = async () => {
            setIsStatsLoading(true);
            setIsDataLoading(true);
            setPage(1);
            try {
                const [statsRes, payRes] = await Promise.all([
                    financeService.getPaymentStats({ params: { schoolYearId: syId, semesterId: semId } }),
                    financeService.getPaymentHistory({ params: { schoolYearId: syId, semesterId: semId, page: 1, limit: PAGE_SIZE } }),
                ]);

                if (statsRes?.success && statsRes.data) {
                    const d = statsRes.data;
                    setStats({ totalAmount: d.totalAmount || d.total_collected || 0, byMethod: d.byMethod || {}, count: d.totalCount || 0 });
                } else {
                    setStats({ totalAmount: 0, byMethod: {}, count: 0 });
                }

                const payRows = payRes?.success && Array.isArray(payRes.data) ? payRes.data : [];
                const total = payRes?.pagination?.total || 0;
                setPaginatedRows(payRows.map((p) => ({
                    id: p.id, source: "payment", studentId: p.student_id,
                    studentName: p.student_name || p.student?.fullName || "-",
                    studentCode: p.student_code || `HS${p.student_id}`,
                    amount: parseFloat(p.paid_amount || p.amount || 0),
                    method: p.payment_method || "cash",
                    date: p.paid_date || p.payment_date || p.created_at,
                    ref: p.transaction_ref || "", note: p.payment_note || "",
                    feeName: p.fee_name || p.description || "-",
                    status: p.status === "paid" ? "completed" : (p.status || "completed"),
                    invoiceId: p.invoice_id,
                })).sort((a, b) => new Date(b.date) - new Date(a.date)));
                setTotalRecords(total);
            } catch (err) {
                setStats({ totalAmount: 0, byMethod: {}, count: 0 });
                setPaginatedRows([]);
                setTotalRecords(0);
            } finally {
                setIsStatsLoading(false);
                setIsDataLoading(false);
                isFetchingRef.current = false;
            }
        };

        fetchAll();
    }, [resolvedIds]);

    // Pagination: fetch a new page when page changes (but not on initial resolvedIds reset to 1)
    useEffect(() => {
        const { schoolYearId: syId, semesterId: semId } = resolvedIds;
        if (!syId || !semId || page <= 1) return;
        setIsDataLoading(true);
        financeService.getPaymentHistory({ params: { schoolYearId: syId, semesterId: semId, page, limit: PAGE_SIZE } })
            .then((payRes) => {
                const payRows = payRes?.success && Array.isArray(payRes.data) ? payRes.data : [];
                const total = payRes?.pagination?.total || 0;
                setPaginatedRows(payRows.map((p) => ({
                    id: p.id, source: "payment", studentId: p.student_id,
                    studentName: p.student_name || p.student?.fullName || "-",
                    studentCode: p.student_code || `HS${p.student_id}`,
                    amount: parseFloat(p.paid_amount || p.amount || 0),
                    method: p.payment_method || "cash",
                    date: p.paid_date || p.payment_date || p.created_at,
                    ref: p.transaction_ref || "", note: p.payment_note || "",
                    feeName: p.fee_name || p.description || "-",
                    status: p.status === "paid" ? "completed" : (p.status || "completed"),
                    invoiceId: p.invoice_id,
                })).sort((a, b) => new Date(b.date) - new Date(a.date)));
                setTotalRecords(total);
            })
            .catch(() => {})
            .finally(() => setIsDataLoading(false));
    }, [page, resolvedIds]);

    // Filter the paginated rows (client-side filter on server-paginated result)
    const displayData = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return paginatedRows.filter((p) => {
            const searchMatch = !query
                || p.studentName.toLowerCase().includes(query)
                || p.studentCode.toLowerCase().includes(query)
                || p.ref.toLowerCase().includes(query)
                || p.feeName.toLowerCase().includes(query);
            const methodMatch = methodFilter === "all" || p.method === methodFilter;
            const statusMatch = statusFilter === "all" || p.status === statusFilter;
            return searchMatch && methodMatch && statusMatch;
        });
    }, [paginatedRows, searchQuery, methodFilter, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));

    const handleExport = () => {
        const headers = ["Ngày", "Học sinh", "Mã HS", "Khoản thu", "Số tiền", "Phương thức", "Mã tham chiếu", "Ghi chú"];
        const rows = displayData.map((p) => [
            formatDate(p.date), p.studentName, p.studentCode, p.feeName, p.amount,
            METHOD_LABELS[p.method] || p.method, p.ref, p.note,
        ]);
        const csvContent = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
        const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `lich-su-thanh-toan-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("Đã xuất file CSV thành công!");
    };

    return (
        <div className="fin-payment-history">
            <PageHeader
                title="Lịch sử Thanh Toán"
                eyebrow="Tra cứu chi tiết các giao dịch thanh toán học phí"
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            {/* Summary */}
            <section className="ph-summary-bar">
                <div className="ph-stat ph-stat--primary">
                    <div className="ph-stat__icon"><FiTrendingUp /></div>
                    <div className="ph-stat__content">
                        <span>Tổng đã thu</span>
                        <strong>{formatCurrency(stats.totalAmount)} đ</strong>
                        <p>{stats.count} giao dịch</p>
                    </div>
                </div>
                {Object.entries(stats.byMethod).map(([method, amount]) => (
                    <div key={method} className="ph-stat">
                        <div className="ph-stat__icon"><FiDollarSign /></div>
                        <div className="ph-stat__content">
                            <span>{METHOD_LABELS[method] || method}</span>
                            <strong>{formatCurrency(amount)} đ</strong>
                        </div>
                    </div>
                ))}
            </section>

            {/* Toolbar */}
            <div className="ph-toolbar">
                <div className="ph-search">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Tìm theo tên, mã HS, mã tham chiếu..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}>
                    <option value="all">Tất cả phương thức</option>
                    {Object.entries(METHOD_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                    ))}
                </select>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="all">Tất cả trạng thái</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="pending">Đang xử lý</option>
                </select>
                <button className="btn-secondary" onClick={() => {
                    const { schoolYearId: syId, semesterId: semId } = resolvedIds;
                    if (!syId || !semId) return;
                    setIsDataLoading(true);
                    financeService.getPaymentHistory({ params: { schoolYearId: syId, semesterId: semId, page, limit: PAGE_SIZE } })
                        .then((payRes) => {
                            const payRows = payRes?.success && Array.isArray(payRes.data) ? payRes.data : [];
                            setPaginatedRows(payRows.map((p) => ({
                                id: p.id, source: "payment", studentId: p.student_id,
                                studentName: p.student_name || "-",
                                studentCode: p.student_code || `HS${p.student_id}`,
                                amount: parseFloat(p.paid_amount || 0),
                                method: p.payment_method || "cash",
                                date: p.paid_date || "",
                                ref: p.transaction_ref || "", note: p.payment_note || "",
                                feeName: p.fee_name || "-",
                                status: p.status === "paid" ? "completed" : (p.status || "completed"),
                            })).sort((a, b) => new Date(b.date) - new Date(a.date)));
                        })
                        .finally(() => setIsDataLoading(false));
                }} disabled={isLoading}>
                    <FiRefreshCw className={isLoading ? "spin" : ""} />
                </button>
                <button className="btn-primary" onClick={handleExport}>
                    <FiDownload /> Xuất CSV
                </button>
            </div>

            {/* Table */}
            <div className="ph-table-card">
                <table className="ph-table">
                    <thead>
                        <tr>
                            <th>Ngày thanh toán</th>
                            <th>Học sinh</th>
                            <th>Khoản thu</th>
                            <th className="align-right">Số tiền</th>
                            <th>Phương thức</th>
                            <th>Mã tham chiếu</th>
                            <th>Ghi chú</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={7} className="loading-cell">Đang tải...</td></tr>
                        ) : displayData.length === 0 ? (
                            <tr><td colSpan={7} className="empty-cell">Không có giao dịch nào.</td></tr>
                        ) : (
                            displayData.map((p) => (
                                <tr key={p.id}>
                                    <td>{formatDate(p.date)}</td>
                                    <td>
                                        <strong>{p.studentName}</strong>
                                        <small>{p.studentCode}</small>
                                    </td>
                                    <td>{p.feeName}</td>
                                    <td className="align-right text-success">{formatCurrency(p.amount)} đ</td>
                                    <td>
                                        <span className="method-badge" data-method={p.method}>{METHOD_LABELS[p.method] || p.method}</span>
                                    </td>
                                    <td><code>{p.ref || "-"}</code></td>
                                    <td><small>{p.note || "-"}</small></td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                <div className="ph-footer">
                    <small>Hiển thị {displayData.length} / {totalRecords} giao dịch</small>
                    <div className="ph-pagination">
                        <button className="ph-pg-btn" onClick={() => setPage(1)} disabled={page === 1}>«</button>
                        <button className="ph-pg-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
                        <input
                            type="text"
                            inputMode="numeric"
                            className="ph-pg-jump"
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
                        <span className="ph-pg-info">/ {totalPages}</span>
                        <button className="ph-pg-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>›</button>
                        <button className="ph-pg-btn" onClick={() => setPage(totalPages)} disabled={page >= totalPages}>»</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
