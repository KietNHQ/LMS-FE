import { useState, useEffect, useMemo, useCallback } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../../components/common";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import { financeService } from "../../../../services/pages/management/finance";
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
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [methodFilter, setMethodFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [viewMode, setViewMode] = useState("table"); // 'table' | 'timeline'
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;

    // Load stats from payment history data
    const loadStats = useCallback(async () => {
        setIsLoading(true);
        try {
            const payRes = await financeService.getPaymentHistory({
                params: {
                    schoolYearId: selectedSchoolYear?.id,
                    semesterId: selectedTerm?.id,
                    limit: 1000, // Get enough data for stats
                },
            });

            if (payRes?.success) {
                const payments = Array.isArray(payRes.data) ? payRes.data : payRes.data?.items || [];
                const byMethod = {};
                let totalAmount = 0;

                payments.forEach((p) => {
                    const method = p.payment_method || "other";
                    byMethod[method] = (byMethod[method] || 0) + parseFloat(p.amount || 0);
                    totalAmount += parseFloat(p.amount || 0);
                });

                setStats({ totalAmount, byMethod, count: payments.length });
            }
        } catch (err) {
            console.error("[FinancePaymentHistory] loadStats error:", err);
            setStats({ totalAmount: 0, byMethod: {}, count: 0 });
        } finally {
            setIsLoading(false);
        }
    }, [selectedSchoolYear?.id, selectedTerm?.id]);

    // Load paginated data
    const loadPage = useCallback(async (pageNum) => {
        setIsLoading(true);
        try {
            const [payRes, invRes] = await Promise.allSettled([
                financeService.getPaymentHistory({
                    params: {
                        schoolYearId: selectedSchoolYear?.id,
                        semesterId: selectedTerm?.id,
                        page: pageNum,
                        limit: PAGE_SIZE,
                    },
                }),
                financeService.getAllInvoices({
                    params: {
                        schoolYearId: selectedSchoolYear?.id,
                        semesterId: selectedTerm?.id,
                        page: pageNum,
                        limit: PAGE_SIZE,
                    },
                }),
            ]);

            const payRows = payRes.status === "fulfilled" && payRes.value?.success
                ? (Array.isArray(payRes.value.data) ? payRes.value.data : payRes.value.data?.items || [])
                : [];
            const invRows = invRes.status === "fulfilled" && invRes.value?.success
                ? (Array.isArray(invRes.value.data) ? invRes.value.data : invRes.value.data?.items || [])
                : [];

            const records = [];
            payRows.forEach((p) => {
                records.push({
                    id: p.id,
                    source: "payment",
                    studentId: p.student_id,
                    studentName: p.student_name || p.student_given_name
                        ? `${p.student_surname || ""} ${p.student_given_name || ""}`.trim()
                        : "-",
                    studentCode: p.student_code || p.student_id,
                    amount: parseFloat(p.amount || p.amount_paid || p.paid_amount || 0),
                    method: p.payment_method || p.method || "cash",
                    date: p.paid_date || p.payment_date || p.paid_at || p.created_at,
                    ref: p.transaction_ref || p.reference || "",
                    note: p.payment_note || p.note || "",
                    feeName: p.fee_name || p.description || "-",
                    status: "completed",
                    invoiceId: p.invoice_id,
                });
            });

            invRows.forEach((inv) => {
                if (inv.paid_amount && parseFloat(inv.paid_amount) > 0) {
                    records.push({
                        id: `inv-${inv.id}`,
                        source: "invoice",
                        studentId: inv.student_id,
                        studentName: inv.student_name || inv.student_given_name
                            ? `${inv.student_surname || ""} ${inv.student_given_name || ""}`.trim()
                            : "-",
                        studentCode: inv.student_code || `HS${inv.student_id}`,
                        amount: parseFloat(inv.paid_amount || inv.amount_paid || 0),
                        method: inv.payment_method || "unknown",
                        date: inv.paid_date || inv.paid_at || inv.last_payment_date || inv.updated_at,
                        ref: inv.transaction_ref || "",
                        note: inv.payment_note || "",
                        feeName: inv.fee_name || "-",
                        status: "completed",
                        invoiceId: inv.id,
                    });
                }
            });

            // Dedup: same debt can appear from both endpoints (both call get_fees_invoices_all)
            const seen = new Set();
            const deduped = records.filter((r) => {
                const key = `${r.id}-${r.amount}-${r.date}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });

            const sorted = deduped.sort((a, b) => new Date(b.date) - new Date(a.date));
            setPaginatedRows(sorted);

            // Use total from just the first successful response — both endpoints return same data
            const firstTotal = payRes.status === "fulfilled" && payRes.value?.success
                ? (payRes.value.data?.pagination?.total || payRes.value.data?.items?.length || 0)
                : (invRes.status === "fulfilled" && invRes.value?.success
                    ? (invRes.value.data?.pagination?.total || invRes.value.data?.items?.length || 0)
                    : 0);
            setTotalRecords(firstTotal);
        } catch (err) {
            console.error("[FinancePaymentHistory] loadPage error:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const [paginatedRows, setPaginatedRows] = useState([]);

    useEffect(() => { loadStats(); }, [selectedSchoolYear?.id, selectedTerm?.id]);
    useEffect(() => { setPage(1); }, [searchQuery, methodFilter, statusFilter]);
    useEffect(() => { loadPage(page); }, [page, loadPage]);

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
                <button className="btn-secondary" onClick={loadPage.bind(null, page)} disabled={isLoading}>
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
