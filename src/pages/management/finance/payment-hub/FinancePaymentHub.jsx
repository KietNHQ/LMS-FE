import { useEffect, useMemo, useState } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../../components/common";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import { financeService } from "../../../../services/pages/management/finance";
import {
    FiAlertCircle,
    FiAlertTriangle,
    FiBell,
    FiBook,
    FiClock,
    FiDollarSign,
    FiDownload,
    FiEye,
    FiFilter,
    FiMessageSquare,
    FiPieChart,
    FiRefreshCw,
    FiSearch,
    FiTrendingUp,
} from "react-icons/fi";
import { toast } from "react-toastify";
import "./FinancePaymentHub.css";

import StudentArLedger from "./components/StudentArLedger";
import ReconciliationWorkbench from "./components/ReconciliationWorkbench";

const AGING_BUCKETS = [
    { id: "all", label: "Tất cả" },
    { id: "aging-1-7", label: "1 - 7 ngày" },
    { id: "aging-8-30", label: "8 - 30 ngày" },
    { id: "aging-31-60", label: "31 - 60 ngày" },
    { id: "aging-gt-60", label: "> 60 ngày" },
];

const PAYMENT_STATUSES = [
    { id: "all", label: "Tất cả" },
    { id: "open", label: "Đang theo dõi" },
    { id: "near-due", label: "Sắp đến hạn" },
    { id: "overdue", label: "Quá hạn" },
];

const SECTION_TABS = [
    { id: "overview", label: "Tổng quan", icon: FiTrendingUp },
    { id: "debt", label: "Công nợ", icon: FiBook },
    { id: "reconcile", label: "Đối soát", icon: FiPieChart },
];

export default function FinancePaymentHub() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [activeBucket, setActiveBucket] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [activeSection, setActiveSection] = useState("overview");
    const [isLoading, setIsLoading] = useState(false);

    const [debts, setDebts] = useState([]);
    const [summary, setSummary] = useState({ totalDebt: 0, overdueCount: 0, nearDueCount: 0, openCount: 0 });

    const fetchDebts = async () => {
        setIsLoading(true);
        try {
            const res = await financeService.listDebts({
                params: {
                    limit: 2000,
                    schoolYearId: selectedSchoolYear?.id,
                    semesterId: selectedTerm?.id,
                },
            });

            if (res?.success && res.data) {
                setDebts(res.data);
                calculateSummary(res.data);
            }
        } catch (error) {
            console.error("Error fetching debts:", error);
            toast.error("Không thể tải dữ liệu công nợ");
        } finally {
            setIsLoading(false);
        }
    };

    const calculateSummary = (data) => {
        const totalDebt = data.reduce((sum, d) => sum + (d.amount || 0), 0);
        const now = new Date();
        const overdueCount = data.filter(d => {
            const dueRaw = d.due_date || d.dueDate;
            return dueRaw && new Date(dueRaw) < now && d.status !== "paid";
        }).length;
        const nearDueCount = data.filter(d => {
            if (!d.due_date && !d.dueDate) return false;
            if (d.status === "paid") return false;
            const due = new Date(d.due_date || d.dueDate);
            const diff = (due - now) / (1000 * 60 * 60 * 24);
            return diff >= 0 && diff <= 7;
        }).length;
        const openCount = data.filter(d => d.status !== "paid" && d.status !== "overdue").length;
        setSummary({ totalDebt, overdueCount, nearDueCount, openCount });
    };

    useEffect(() => {
        fetchDebts();
    }, [selectedSchoolYear?.id, selectedTerm?.id]);

    const getAgingType = (debt) => {
        if (!debt.due_date && !debt.dueDate) return "aging-8-30";
        const now = new Date();
        const due = new Date(debt.due_date || debt.dueDate);
        if (due >= now) return "aging-1-7";
        const days = Math.floor((now - due) / (1000 * 60 * 60 * 24));
        if (days <= 7) return "aging-1-7";
        if (days <= 30) return "aging-8-30";
        if (days <= 60) return "aging-31-60";
        return "aging-gt-60";
    };

    const getDaysOverdue = (debt) => {
        if (!debt.due_date && !debt.dueDate) return 0;
        const now = new Date();
        const due = new Date(debt.due_date || debt.dueDate);
        if (due >= now) return 0;
        return Math.floor((now - due) / (1000 * 60 * 60 * 24));
    };

    const getStatusFromDebt = (debt) => {
        if (debt.status === "paid") return "paid";
        if (!debt.due_date && !debt.dueDate) return "open";
        const now = new Date();
        const due = new Date(debt.due_date || debt.dueDate);
        if (due < now) return "overdue";
        const daysUntilDue = (due - now) / (1000 * 60 * 60 * 24);
        if (daysUntilDue <= 7) return "near-due";
        return "open";
    };

    const transformedDebts = useMemo(() => {
        return debts.map(debt => ({
            ...debt,
            realDebtId: debt.id,
            id: debt.studentCode || `HS${debt.studentId}`,
            name: debt.studentName,
            class: debt.className,
            amount: debt.amount,
            type: getAgingType(debt),
            days: getDaysOverdue(debt),
            dueDate: debt.due_date || debt.dueDate ? new Date(debt.due_date || debt.dueDate).toLocaleDateString("vi-VN") : "-",
            status: getStatusFromDebt(debt),
            note: debt.notes || "Chưa xử lý",
        }));
    }, [debts]);

    const filteredDebts = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return transformedDebts.filter((debt) => {
            const matchesBucket = activeBucket === "all" || debt.type === activeBucket;
            const matchesStatus = statusFilter === "all" || debt.status === statusFilter;
            const matchesSearch = !query || 
                debt.name?.toLowerCase().includes(query) || 
                debt.id?.toLowerCase().includes(query) || 
                debt.class?.toLowerCase().includes(query);
            return matchesBucket && matchesStatus && matchesSearch;
        });
    }, [transformedDebts, activeBucket, statusFilter, searchQuery]);

    const priorityDebts = useMemo(() => {
        return [...transformedDebts]
            .sort((a, b) => b.days - a.days)
            .filter(d => d.days > 0)
            .slice(0, 5);
    }, [transformedDebts]);

    const overdueAmount = useMemo(() => {
        return transformedDebts
            .filter((debt) => debt.status === "overdue")
            .reduce((sum, debt) => sum + (debt.amount || 0), 0);
    }, [transformedDebts]);

    const handleRemind = async (studentName, debt) => {
        try {
            await financeService.sendDebtReminder(debt.realDebtId || debt.id, { body: { method: "email" } });
            toast.success(`Đã gửi nhắc nợ tới phụ huynh của ${studentName}`);
        } catch (error) {
            toast.error("Có lỗi khi gửi nhắc nợ");
        }
    };

    const handleQuickAction = (message) => toast.info(message);
    const handleRefresh = () => {
        fetchDebts();
        toast.success("Đã làm mới dữ liệu");
    };
    const handleBulkReminder = async () => {
        const overdueDebts = transformedDebts.filter(d => d.status === "overdue");
        if (overdueDebts.length === 0) {
            toast.info("Không có công nợ quá hạn");
            return;
        }
        let sent = 0;
        for (const debt of overdueDebts) {
            try {
                await financeService.sendDebtReminder(debt.realDebtId || debt.id, { body: { method: "email" } });
                sent++;
            } catch (e) {}
        }
        toast.success(`Đã gửi ${sent} nhắc nợ`);
    };

    return (
        <div className="fin-payment-hub">
            <PageHeader
                title="Quản lý Công nợ & Thanh toán"
                actions={
                    <div className="payment-hub-actions">
                        <SchoolYearTermSelector
                            selectedSchoolYear={selectedSchoolYear}
                            selectedTerm={selectedTerm}
                            onYearChange={handleYearArrow}
                            onTermChange={handleTermChange}
                        />
                    </div>
                }
            />

            <section className="payment-overview-grid">
                <article className="overview-card">
                    <div className="overview-card__signal" aria-hidden="true">
                        <FiDollarSign />
                    </div>
                    <div className="overview-card__body">
                        <span>Tổng công nợ</span>
                        <strong>{summary.totalDebt.toLocaleString()} ₫</strong>
                        <p>Toàn bộ hồ sơ</p>
                    </div>
                </article>
                <article className="overview-card warning">
                    <div className="overview-card__signal" aria-hidden="true">
                        <FiAlertTriangle />
                    </div>
                    <div className="overview-card__body">
                        <span>Quá hạn</span>
                        <strong>{summary.overdueCount} học sinh</strong>
                        <p>Xử lý trước</p>
                    </div>
                </article>
                <article className="overview-card notice">
                    <div className="overview-card__signal" aria-hidden="true">
                        <FiClock />
                    </div>
                    <div className="overview-card__body">
                        <span>Sắp đến hạn</span>
                        <strong>{summary.nearDueCount} học sinh</strong>
                        <p>Nhắc sớm</p>
                    </div>
                </article>
                <article className="overview-card calm">
                    <div className="overview-card__signal" aria-hidden="true">
                        <FiEye />
                    </div>
                    <div className="overview-card__body">
                        <span>Đang theo dõi</span>
                        <strong>{summary.openCount} hồ sơ</strong>
                        <p>Theo dõi</p>
                    </div>
                </article>
            </section>

            <section className="hub-tabs-bar" aria-label="Điều hướng khu vực công nợ">
                <div className="hub-section-tabs">
                    {SECTION_TABS.map((tab) => (
                        <button key={tab.id} className={`hub-tab ${activeSection === tab.id ? "active" : ""}`} onClick={() => setActiveSection(tab.id)}>
                            <tab.icon />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="hub-tabs-actions">
                    <button className="btn-secondary payment-header-btn payment-header-btn--refresh" onClick={handleRefresh}>
                        <FiRefreshCw /> Làm mới
                    </button>
                    <button className="btn-secondary payment-header-btn payment-header-btn--report">
                        <FiDownload /> Xuất báo cáo
                    </button>
                </div>
            </section>

            {activeSection === "overview" && (
                <section className="priority-focus">
                    <div className="priority-focus__head">
                        <div>
                            <h3>Mục ưu tiên hôm nay</h3>
                            <p>{summary.overdueCount} hồ sơ quá hạn • {overdueAmount.toLocaleString()} ₫</p>
                        </div>
                        <FiTrendingUp />
                    </div>

                    <div className="priority-focus__badges">
                        <span className="priority-badge danger">Quá hạn: {summary.overdueCount}</span>
                        <span className="priority-badge warning">Sắp đến hạn: {summary.nearDueCount}</span>
                        <span className="priority-badge calm">Theo dõi: {summary.openCount}</span>
                    </div>

                    <div className="priority-focus__layout">
                        <div className="priority-focus__list-panel">
                            <div className="priority-focus__list">
                                {priorityDebts.map((debt, index) => (
                                    <button
                                        key={debt.id}
                                        className={`priority-item tone-${debt.status}`}
                                        onClick={() => setSelectedStudent(debt)}
                                        title="Mở sổ cái học sinh"
                                    >
                                        <div className="priority-item__index">0{index + 1}</div>
                                        <div className="priority-item__student">
                                            <strong>{debt.name}</strong>
                                            <span>{debt.id} • {debt.class}</span>
                                            <small>{debt.note}</small>
                                        </div>
                                        <div className="priority-item__meta">
                                            <span>Trễ {debt.days} ngày</span>
                                            <b>{(debt.amount || 0).toLocaleString()} ₫</b>
                                        </div>
                                    </button>
                                ))}
                                {priorityDebts.length === 0 && (
                                    <div className="empty-priority">Không có công nợ ưu tiên</div>
                                )}
                            </div>

                            <div className="priority-focus__actions">
                                <button className="btn-remind" onClick={handleBulkReminder}>
                                    <FiMessageSquare /> Nhắc nhóm quá hạn
                                </button>
                                <button className="btn-secondary" onClick={() => handleQuickAction("Đã chuyển sang khối đối soát.")}>Đối soát nhanh</button>
                            </div>
                        </div>

                        <aside className="priority-focus__sidepanel">
                            <div className="priority-side-card priority-side-card--hot">
                                <span className="priority-side-card__label">Điểm nóng</span>
                                <strong>{priorityDebts[0]?.name || "Không có"}</strong>
                                <p>{priorityDebts[0]?.class || ""} • Trễ {priorityDebts[0]?.days || 0} ngày</p>
                            </div>

                            <div className="priority-side-card">
                                <span className="priority-side-card__label">Tác vụ nhanh</span>
                                <button className="priority-mini-action" onClick={handleBulkReminder}>
                                    <FiBell /> Gửi nhắc đồng loạt
                                </button>
                                <button className="priority-mini-action" onClick={() => handleQuickAction("Đã mở danh sách cần rà soát.")}>
                                    <FiAlertCircle /> Lọc hồ sơ cần rà soát
                                </button>
                            </div>
                        </aside>
                    </div>
                </section>
            )}

            {activeSection === "debt" && (
                <section className="debt-panel">
                    <div className="debt-header debt-header--stacked">
                        <div>
                            <h3>Sổ theo dõi công nợ học sinh</h3>
                            <p>Lọc nhanh theo nhóm ưu tiên.</p>
                        </div>
                        <button className="btn-remind" onClick={handleBulkReminder}>
                            <FiBell /> Nhắc nợ đồng loạt
                        </button>
                    </div>

                    <div className="payment-toolbar">
                        <div className="payment-filter-stack">
                            <div className="payment-filter-group">
                                <div className="filter-label">
                                    <FiFilter /> Tuổi nợ
                                </div>
                                <div className="payment-filter-pills">
                                    {AGING_BUCKETS.map((bucket) => (
                                        <button
                                            key={bucket.id}
                                            className={`payment-pill ${activeBucket === bucket.id ? "active" : ""}`}
                                            onClick={() => setActiveBucket(bucket.id)}
                                        >
                                            {bucket.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="payment-status-row">
                        <div className="payment-status-strip">
                            <div className="payment-status-mini-grid">
                                {PAYMENT_STATUSES.map((status) => (
                                    <button
                                        key={status.id}
                                        className={`payment-pill payment-pill--mini ${statusFilter === status.id ? "active" : ""}`}
                                        onClick={() => setStatusFilter(status.id)}
                                    >
                                        {status.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="payment-search payment-search--right">
                            <FiSearch />
                            <input
                                type="text"
                                placeholder="Tìm theo tên, mã HS hoặc lớp..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="debt-table-wrap">
                        <table className="debt-table">
                            <thead>
                                <tr>
                                    <th>Học sinh</th>
                                    <th>Lớp</th>
                                    <th>Công nợ</th>
                                    <th>Hạn chót</th>
                                    <th>Tuổi nợ</th>
                                    <th>Ghi chú xử lý</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDebts.map((debt) => (
                                    <tr key={debt.id} className={`debt-row ${debt.type}`}>
                                        <td>
                                            <div className="student-cell">
                                                <strong>{debt.name}</strong>
                                                <span>{debt.id}</span>
                                            </div>
                                        </td>
                                        <td>{debt.class || "-"}</td>
                                        <td className="debt-amt">{(debt.amount || 0).toLocaleString()} ₫</td>
                                        <td>{debt.dueDate}</td>
                                        <td>
                                            <span className={`aging-text ${debt.status}`}>
                                                <FiAlertCircle /> {debt.days > 0 ? `Trễ ${debt.days} ngày` : "Đúng hạn"}
                                            </span>
                                        </td>
                                        <td>{debt.note}</td>
                                        <td>
                                            <div className="debt-actions">
                                                <button className="btn-secondary btn-secondary--small" onClick={() => setSelectedStudent(debt)}>
                                                    <FiBook /> Sổ cái
                                                </button>
                                                <button className={`btn-remind ${debt.days < 30 ? "yellow" : ""}`} onClick={() => handleRemind(debt.name, debt)}>
                                                    <FiBell /> Nhắc nợ
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredDebts.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="empty-state-cell">
                                            Không tìm thấy học sinh nào phù hợp với bộ lọc.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {activeSection === "reconcile" && <ReconciliationWorkbench debts={debts} />}

            <StudentArLedger student={selectedStudent} onClose={() => setSelectedStudent(null)} />
        </div>
    );
}
