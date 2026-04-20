import { useMemo, useState } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
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

const MOCK_DEBTS = [
    { id: "HS001", name: "Nguyễn Văn X", class: "10A1", amount: 4500000, type: "aging-8-30", days: 15, dueDate: "01/10/2026", status: "open", note: "Đã gọi 1 lần" },
    { id: "HS005", name: "Lê Minh Y", class: "11A5", amount: 5000000, type: "aging-1-7", days: 3, dueDate: "18/10/2026", status: "near-due", note: "Đã gửi SMS" },
    { id: "HS012", name: "Trần H", class: "12A2", amount: 12800000, type: "aging-gt-60", days: 72, dueDate: "15/08/2026", status: "overdue", note: "Chưa liên hệ" },
    { id: "HS044", name: "Phạm K", class: "10A2", amount: 4500000, type: "aging-31-60", days: 45, dueDate: "01/09/2026", status: "overdue", note: "Đang chờ phản hồi" },
    { id: "HS054", name: "Đặng T", class: "10A3", amount: 3200000, type: "aging-1-7", days: 5, dueDate: "20/10/2026", status: "near-due", note: "Đã nhắc qua Zalo" },
];

export default function FinancePaymentHub() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [activeBucket, setActiveBucket] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [activeSection, setActiveSection] = useState("overview");

    const debts = MOCK_DEBTS;

    const filteredDebts = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return debts.filter((debt) => {
            const matchesBucket = activeBucket === "all" || debt.type === activeBucket;
            const matchesStatus = statusFilter === "all" || debt.status === statusFilter;
            const matchesSearch = !query || debt.name.toLowerCase().includes(query) || debt.id.toLowerCase().includes(query) || debt.class.toLowerCase().includes(query);
            return matchesBucket && matchesStatus && matchesSearch;
        });
    }, [activeBucket, debts, searchQuery, statusFilter]);

    const stats = useMemo(() => {
        const totalDebt = debts.reduce((sum, debt) => sum + debt.amount, 0);
        const overdueCount = debts.filter((debt) => debt.status === "overdue").length;
        const nearDueCount = debts.filter((debt) => debt.status === "near-due").length;
        const openCount = debts.filter((debt) => debt.status === "open").length;
        return { totalDebt, overdueCount, nearDueCount, openCount };
    }, [debts]);

    const priorityDebts = useMemo(() => {
        return [...debts].sort((a, b) => b.days - a.days).slice(0, 5);
    }, [debts]);

    const overdueAmount = useMemo(() => {
        return debts
            .filter((debt) => debt.status === "overdue")
            .reduce((sum, debt) => sum + debt.amount, 0);
    }, [debts]);

    const handleRemind = (studentName) => {
        toast.info(`Đã gửi nhắc nợ tới phụ huynh của ${studentName} (mock).`);
    };

    const handleQuickAction = (message) => toast.info(message);
    const handleRefresh = () => toast.success("Đã làm mới dữ liệu công nợ (mock).");
    const handleBulkReminder = () => toast.success("Đã gửi nhắc nợ đồng loạt (mock).");

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
                        <strong>{stats.totalDebt.toLocaleString()} ₫</strong>
                        <p>Toàn bộ hồ sơ</p>
                    </div>
                </article>
                <article className="overview-card warning">
                    <div className="overview-card__signal" aria-hidden="true">
                        <FiAlertTriangle />
                    </div>
                    <div className="overview-card__body">
                        <span>Quá hạn</span>
                        <strong>{stats.overdueCount} học sinh</strong>
                        <p>Xử lý trước</p>
                    </div>
                </article>
                <article className="overview-card notice">
                    <div className="overview-card__signal" aria-hidden="true">
                        <FiClock />
                    </div>
                    <div className="overview-card__body">
                        <span>Sắp đến hạn</span>
                        <strong>{stats.nearDueCount} học sinh</strong>
                        <p>Nhắc sớm</p>
                    </div>
                </article>
                <article className="overview-card calm">
                    <div className="overview-card__signal" aria-hidden="true">
                        <FiEye />
                    </div>
                    <div className="overview-card__body">
                        <span>Đang theo dõi</span>
                        <strong>{stats.openCount} hồ sơ</strong>
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
                            <p>{stats.overdueCount} hồ sơ quá hạn • {overdueAmount.toLocaleString()} ₫</p>
                        </div>
                        <FiTrendingUp />
                    </div>

                    <div className="priority-focus__badges">
                        <span className="priority-badge danger">Quá hạn: {stats.overdueCount}</span>
                        <span className="priority-badge warning">Sắp đến hạn: {stats.nearDueCount}</span>
                        <span className="priority-badge calm">Theo dõi: {stats.openCount}</span>
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
                                            <b>{debt.amount.toLocaleString()} ₫</b>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="priority-focus__actions">
                                <button className="btn-remind" onClick={handleBulkReminder}>
                                    <FiMessageSquare /> Nhắc nhóm quá hạn
                                </button>
                                <button className="btn-secondary" onClick={() => handleQuickAction("Đã chuyển sang khối đối soát (mock).")}>Đối soát nhanh</button>
                            </div>
                        </div>

                        <aside className="priority-focus__sidepanel">
                            <div className="priority-side-card priority-side-card--hot">
                                <span className="priority-side-card__label">Điểm nóng</span>
                                <strong>{priorityDebts[0]?.name}</strong>
                                <p>{priorityDebts[0]?.class} • Trễ {priorityDebts[0]?.days} ngày</p>
                            </div>

                            <div className="priority-side-card">
                                <span className="priority-side-card__label">Tác vụ nhanh</span>
                                <button className="priority-mini-action" onClick={handleBulkReminder}>
                                    <FiBell /> Gửi nhắc đồng loạt
                                </button>
                                <button className="priority-mini-action" onClick={() => handleQuickAction("Đã mở danh sách cần rà soát (mock).") }>
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
                                        <td>{debt.class}</td>
                                        <td className="debt-amt">{debt.amount.toLocaleString()} ₫</td>
                                        <td>{debt.dueDate}</td>
                                        <td>
                                            <span className={`aging-text ${debt.status}`}>
                                                <FiAlertCircle /> Trễ {debt.days} ngày
                                            </span>
                                        </td>
                                        <td>{debt.note}</td>
                                        <td>
                                            <div className="debt-actions">
                                                <button className="btn-secondary btn-secondary--small" onClick={() => setSelectedStudent(debt)}>
                                                    <FiBook /> Sổ cái
                                                </button>
                                                <button className={`btn-remind ${debt.days < 30 ? "yellow" : ""}`} onClick={() => handleRemind(debt.name)}>
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

            {activeSection === "reconcile" && <ReconciliationWorkbench />}

            <StudentArLedger student={selectedStudent} onClose={() => setSelectedStudent(null)} />
        </div>
    );
}
