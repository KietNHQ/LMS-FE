import { useMemo, useState, useEffect } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../../components/common";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import { financeService } from "../../../../services/pages/management/finance";
import {
    FiAlertCircle,
    FiCheck,
    FiCheckCircle,
    FiClock,
    FiFileText,
    FiFilter,
    FiMessageSquare,
    FiSearch,
    FiShield,
    FiX,
    FiXCircle,
} from "react-icons/fi";
import { toast } from "react-toastify";
import "./FinanceApprovals.css";

const STATUS_TABS = [
    { id: "pending", label: "Chờ duyệt" },
    { id: "approved", label: "Đã duyệt" },
    { id: "rejected", label: "Từ chối" },
    { id: "all", label: "Tất cả" },
];

const TYPE_OPTIONS = [
    { id: "all", label: "Tất cả loại" },
    { id: "refund", label: "Hoàn phí" },
    { id: "debt_relief", label: "Miễn giảm" },
    { id: "write_off", label: "Xóa nợ" },
    { id: "adjustment", label: "Điều chỉnh bút toán" },
];

const PRIORITY_OPTIONS = [
    { id: "all", label: "Mọi mức ưu tiên" },
    { id: "critical", label: "Khẩn" },
    { id: "high", label: "Cao" },
    { id: "medium", label: "Trung bình" },
    { id: "low", label: "Thấp" },
];

const SORT_OPTIONS = [
    { id: "newest", label: "Mới nhất" },
    { id: "amount-desc", label: "Giá trị giảm dần" },
    { id: "priority", label: "Ưu tiên xử lý" },
];

const PRIORITY_LEVEL = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
};

const PRIORITY_LABEL = {
    low: "Thấp",
    medium: "Trung bình",
    high: "Cao",
    critical: "Khẩn",
};

const TYPE_LABEL = {
    refund: "Hoàn phí",
    debt_relief: "Miễn giảm",
    write_off: "Xóa nợ",
    adjustment: "Điều chỉnh bút toán",
};


function formatCurrency(amount) {
    return `${amount.toLocaleString()} đ`;
}

function formatDateTime(isoDate) {
    if (!isoDate) return "—";
    return new Date(isoDate).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function transformRequest(record) {
    return {
        id: record.id,
        type: record.request_type,
        requester: record.requester_name || "—",
        requesterRole: record.requester_role || "—",
        student: [record.student_surname, record.student_given_name].filter(Boolean).join(" ") || record.student_id || "—",
        detail: record.reason || record.description || "—",
        amount: parseFloat(record.request_amount || 0),
        submittedAt: record.created_at,
        dueAt: record.sla_due_at,
        status: record.status,
        priority: record.priority || "medium",
        requestAmount: parseFloat(record.request_amount || 0),
        originalAmount: parseFloat(record.original_amount || 0),
        adjustedAmount: parseFloat(record.adjusted_amount || 0),
        feeName: record.fee_name,
        description: record.description,
        reason: record.reason,
        reviewedBy: record.reviewed_by_name,
        reviewedAt: record.reviewed_at,
        approvalNote: record.approval_note,
    };
}

function getSlaLabel(dueAt, status) {
    if (status !== "pending") {
        return "Đã hoàn tất";
    }
    const now = new Date();
    const dueDate = new Date(dueAt);
    const diffHours = Math.round((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60));
    if (diffHours < 0) {
        return `Trễ ${Math.abs(diffHours)} giờ`;
    }
    if (diffHours <= 24) {
        return `Còn ${diffHours} giờ`;
    }
    const diffDays = Math.ceil(diffHours / 24);
    return `Còn ${diffDays} ngày`;
}

export default function FinanceApprovals() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeStatus, setActiveStatus] = useState("pending");
    const [typeFilter, setTypeFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);
    const [focusedRequestId, setFocusedRequestId] = useState("");

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            const res = await financeService.listApprovals({
                params: {
                    limit: 200,
                    status: activeStatus !== "all" ? activeStatus : undefined,
                    studentId: undefined,
                },
            });

            if (res?.success && res.data) {
                setRequests(res.data.map(transformRequest));
            }
        } catch (error) {
            console.error("Error fetching requests:", error);
            setRequests([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [activeStatus, selectedSchoolYear, selectedTerm]);

    const statusSummary = useMemo(() => {
        const pending = requests.filter((item) => item.status === "pending");
        return {
            pendingCount: pending.length,
            pendingAmount: pending.reduce((sum, item) => sum + item.amount, 0),
            approvedCount: requests.filter((item) => item.status === "approved").length,
            rejectedCount: requests.filter((item) => item.status === "rejected").length,
            urgentCount: pending.filter((item) => PRIORITY_LEVEL[item.priority] >= PRIORITY_LEVEL.high).length,
        };
    }, [requests]);

    const visibleRows = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        const filtered = requests.filter((item) => {
            const statusMatch = activeStatus === "all" || item.status === activeStatus;
            const typeMatch = typeFilter === "all" || item.type === typeFilter;
            const priorityMatch = priorityFilter === "all" || item.priority === priorityFilter;
            const searchMatch =
                !query ||
                item.id.toLowerCase().includes(query) ||
                item.requester.toLowerCase().includes(query) ||
                item.student.toLowerCase().includes(query) ||
                item.detail.toLowerCase().includes(query);
            return statusMatch && typeMatch && priorityMatch && searchMatch;
        });

        filtered.sort((a, b) => {
            if (sortBy === "amount-desc") {
                return b.amount - a.amount;
            }
            if (sortBy === "priority") {
                return PRIORITY_LEVEL[b.priority] - PRIORITY_LEVEL[a.priority] || new Date(b.submittedAt) - new Date(a.submittedAt);
            }
            return new Date(b.submittedAt) - new Date(a.submittedAt);
        });

        return filtered;
    }, [requests, activeStatus, typeFilter, priorityFilter, sortBy, searchQuery]);

    const pendingSelectableIds = useMemo(() => {
        return visibleRows.filter((item) => item.status === "pending").map((item) => item.id);
    }, [visibleRows]);

    const selectedRows = useMemo(() => {
        return requests.filter((item) => selectedIds.includes(item.id));
    }, [requests, selectedIds]);

    const focusedRequest = useMemo(() => {
        return requests.find((item) => item.id === focusedRequestId) || null;
    }, [requests, focusedRequestId]);

    const actionQueue = useMemo(() => {
        return requests
            .filter((item) => item.status === "pending")
            .sort((a, b) => PRIORITY_LEVEL[b.priority] - PRIORITY_LEVEL[a.priority] || new Date(a.dueAt) - new Date(b.dueAt))
            .slice(0, 4);
    }, [requests]);

    const isAllPendingSelected = pendingSelectableIds.length > 0 && pendingSelectableIds.every((id) => selectedIds.includes(id));

    const applyStatus = async (id, newStatus) => {
        try {
            if (newStatus === "approved") {
                await financeService.approveRequest(id, { note: "Đã phê duyệt" });
            } else {
                await financeService.rejectRequest(id, { note: "Từ chối" });
            }
            setRequests((prev) => prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item)));
            setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
            toast.success(newStatus === "approved" ? `Đã phê duyệt hồ sơ ${id}.` : `Đã từ chối hồ sơ ${id}.`);
        } catch (error) {
            toast.error("Có lỗi xảy ra khi cập nhật trạng thái");
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]));
    };

    const toggleSelectAllPending = () => {
        if (isAllPendingSelected) {
            setSelectedIds((prev) => prev.filter((id) => !pendingSelectableIds.includes(id)));
            return;
        }
        setSelectedIds((prev) => Array.from(new Set([...prev, ...pendingSelectableIds])));
    };

    const approveSelected = async () => {
        if (selectedRows.length === 0) {
            toast.info("Hãy chọn ít nhất 1 hồ sơ đang chờ duyệt.");
            return;
        }

        const selectedPending = selectedRows.filter((item) => item.status === "pending");
        if (selectedPending.length === 0) {
            toast.info("Các hồ sơ đã chọn không còn ở trạng thái chờ duyệt.");
            return;
        }

        try {
            await Promise.all(
                selectedPending.map((item) =>
                    financeService.approveRequest(item.id, { note: "Đã phê duyệt hàng loạt" }).catch((err) => {
                        console.warn(`[FinanceApprovals] approve failed for ${item.id}:`, err);
                    })
                )
            );
            setRequests((prev) =>
                prev.map((item) =>
                    selectedPending.some((selected) => selected.id === item.id)
                        ? { ...item, status: "approved" }
                        : item
                )
            );
            setSelectedIds([]);
            toast.success(`Đã phê duyệt ${selectedPending.length} hồ sơ.`);
        } catch (error) {
            toast.error("Có lỗi khi phê duyệt hồ sơ.");
        }
    };

    return (
        <div className="fin-approvals">
            <PageHeader
                title="Quản lý phê duyệt tài chính"
                eyebrow="Kiểm soát nghiệp vụ nhạy cảm với luồng xử lý rõ ràng và SLA minh bạch"
                actions={
                    <div className="fin-approvals__header-actions">
                        <SchoolYearTermSelector
                            selectedSchoolYear={selectedSchoolYear}
                            selectedTerm={selectedTerm}
                            onYearChange={handleYearArrow}
                            onTermChange={handleTermChange}
                        />
                        <button type="button" className="approvals-btn approvals-btn--primary" onClick={approveSelected}>
                            <FiCheckCircle /> Phê duyệt đã chọn
                        </button>
                    </div>
                }
            />

            <section className="approvals-summary-bar">
                <article className="approvals-stat stat-neutral">
                    <div className="approvals-stat__icon"><FiFileText /></div>
                    <div className="approvals-stat__content">
                        <span>Đang chờ duyệt</span>
                        <strong>{statusSummary.pendingCount} hồ sơ</strong>
                        <p>{formatCurrency(statusSummary.pendingAmount)}</p>
                    </div>
                </article>

                <article className="approvals-stat stat-danger">
                    <div className="approvals-stat__icon"><FiAlertCircle /></div>
                    <div className="approvals-stat__content">
                        <span>Ưu tiên cao</span>
                        <strong>{statusSummary.urgentCount} hồ sơ</strong>
                        <p>Cần xử lý trong ngày</p>
                    </div>
                </article>

                <article className="approvals-stat stat-success">
                    <div className="approvals-stat__icon"><FiCheckCircle /></div>
                    <div className="approvals-stat__content">
                        <span>Đã duyệt</span>
                        <strong>{statusSummary.approvedCount} hồ sơ</strong>
                        <p>Lưu vết đầy đủ</p>
                    </div>
                </article>

                <article className="approvals-stat stat-muted">
                    <div className="approvals-stat__icon"><FiXCircle /></div>
                    <div className="approvals-stat__content">
                        <span>Từ chối</span>
                        <strong>{statusSummary.rejectedCount} hồ sơ</strong>
                        <p>Chờ bổ sung chứng từ</p>
                    </div>
                </article>
            </section>

            <section className="approvals-layout">
                <div className="approvals-main">
                    <div className="approvals-status-tabs" role="tablist" aria-label="Lọc trạng thái phê duyệt">
                        {STATUS_TABS.map((tab) => {
                            const count = tab.id === "all" ? requests.length : requests.filter((item) => item.status === tab.id).length;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    className={`approvals-status-tab ${activeStatus === tab.id ? "active" : ""}`}
                                    onClick={() => setActiveStatus(tab.id)}
                                >
                                    <span>{tab.label}</span>
                                    <b>{count}</b>
                                </button>
                            );
                        })}
                    </div>

                    <div className="approvals-filter-bar">
                        <label className="approvals-search">
                            <FiSearch />
                            <input
                                type="text"
                                placeholder="Tìm mã hồ sơ, người yêu cầu, học sinh..."
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                            />
                        </label>

                        <div className="approvals-filter-group">
                            <div className="approvals-filter-label"><FiFilter /> Bộ lọc</div>
                            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                                {TYPE_OPTIONS.map((option) => (
                                    <option key={option.id} value={option.id}>{option.label}</option>
                                ))}
                            </select>
                            <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}>
                                {PRIORITY_OPTIONS.map((option) => (
                                    <option key={option.id} value={option.id}>{option.label}</option>
                                ))}
                            </select>
                            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                                {SORT_OPTIONS.map((option) => (
                                    <option key={option.id} value={option.id}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="approvals-table-card">
                        <div className="approvals-table-head">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={isAllPendingSelected}
                                    onChange={toggleSelectAllPending}
                                    disabled={pendingSelectableIds.length === 0}
                                />
                                <span>Chọn tất cả hồ sơ chờ duyệt trong danh sách</span>
                            </label>
                            <small>{visibleRows.length} hồ sơ hiển thị</small>
                        </div>

                        <div className="approvals-table-wrap">
                            <table className="approvals-table">
                                <thead>
                                    <tr>
                                        <th>Chọn</th>
                                        <th>Hồ sơ</th>
                                        <th>Loại nghiệp vụ</th>
                                        <th>Số tiền</th>
                                        <th>SLA</th>
                                        <th>Trạng thái</th>
                                        <th>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleRows.map((item) => (
                                        <tr key={item.id} className={`row-${item.status}`}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(item.id)}
                                                    onChange={() => toggleSelect(item.id)}
                                                    disabled={item.status !== "pending"}
                                                />
                                            </td>
                                            <td>
                                                <button type="button" className="request-meta" onClick={() => setFocusedRequestId(item.id)}>
                                                    <strong>{item.id}</strong>
                                                    <span>{item.student}</span>
                                                    <small>{item.requester}</small>
                                                </button>
                                            </td>
                                            <td>
                                                <div className="request-type">
                                                    <b>{TYPE_LABEL[item.type]}</b>
                                                    <small>Ưu tiên {PRIORITY_LABEL[item.priority]}</small>
                                                </div>
                                            </td>
                                            <td className="cell-amount">{formatCurrency(item.amount)}</td>
                                            <td>
                                                <span className={`sla-pill ${item.status === "pending" ? "live" : "done"}`}>
                                                    <FiClock /> {getSlaLabel(item.dueAt, item.status)}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-badge status-${item.status}`}>{STATUS_TABS.find((tab) => tab.id === item.status)?.label || item.status}</span>
                                            </td>
                                            <td>
                                                <div className="table-actions">
                                                    <button
                                                        type="button"
                                                        className="approvals-btn approvals-btn--ghost"
                                                        onClick={() => setFocusedRequestId(item.id)}
                                                    >
                                                        Chi tiết
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="approvals-btn approvals-btn--success"
                                                        onClick={() => applyStatus(item.id, "approved")}
                                                        disabled={item.status !== "pending"}
                                                    >
                                                        <FiCheck /> Duyệt
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="approvals-btn approvals-btn--danger"
                                                        onClick={() => applyStatus(item.id, "rejected")}
                                                        disabled={item.status !== "pending"}
                                                    >
                                                        <FiX /> Từ chối
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {visibleRows.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="approvals-empty">Không tìm thấy hồ sơ phù hợp với bộ lọc hiện tại.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <aside className="approvals-side">
                    <section className="side-card side-card--policy">
                        <h4><FiShield /> Chính sách phê duyệt</h4>
                        <ul>
                            <li>Hoàn phí từ 1.000.000 đ cần xác nhận cấp hiệu trưởng.</li>
                            <li>Miễn giảm thủ công cần đính kèm biên bản hội đồng hỗ trợ.</li>
                            <li>Xóa nợ phải có biên bản đối soát và ghi rõ căn cứ pháp lý.</li>
                        </ul>
                        <button type="button" className="approvals-btn approvals-btn--ghost full">
                            <FiMessageSquare /> Trao đổi nội bộ
                        </button>
                    </section>

                    <section className="side-card">
                        <h4><FiAlertCircle /> Hàng chờ ưu tiên</h4>
                        <div className="queue-list">
                            {actionQueue.map((item) => (
                                <button key={item.id} type="button" className="queue-item" onClick={() => setFocusedRequestId(item.id)}>
                                    <strong>{item.id}</strong>
                                    <span>{TYPE_LABEL[item.type]}</span>
                                    <small>{getSlaLabel(item.dueAt, item.status)}</small>
                                </button>
                            ))}
                            {actionQueue.length === 0 && <p className="queue-empty">Không còn hồ sơ cần ưu tiên.</p>}
                        </div>
                    </section>
                </aside>
            </section>

            {focusedRequest && (
                <div className="approvals-drawer-overlay" role="presentation" onClick={() => setFocusedRequestId("") }>
                    <aside className="approvals-drawer" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
                        <div className="approvals-drawer__head">
                            <div>
                                <h3>Chi tiết hồ sơ {focusedRequest.id}</h3>
                                <p>{TYPE_LABEL[focusedRequest.type]} • {formatDateTime(focusedRequest.submittedAt)}</p>
                            </div>
                            <button type="button" className="approvals-btn approvals-btn--ghost" onClick={() => setFocusedRequestId("")}>Đóng</button>
                        </div>

                        <div className="approvals-drawer__content">
                            <div className="drawer-grid">
                                <div>
                                    <span>Người đề xuất</span>
                                    <strong>{focusedRequest.requester}</strong>
                                    <p>{focusedRequest.requesterRole}</p>
                                </div>
                                <div>
                                    <span>Học sinh liên quan</span>
                                    <strong>{focusedRequest.student}</strong>
                                    <p>{TYPE_LABEL[focusedRequest.type]}</p>
                                </div>
                                <div>
                                    <span>Số tiền</span>
                                    <strong>{formatCurrency(focusedRequest.amount)}</strong>
                                    <p>Ưu tiên {PRIORITY_LABEL[focusedRequest.priority]}</p>
                                </div>
                                <div>
                                    <span>Hạn xử lý</span>
                                    <strong>{formatDateTime(focusedRequest.dueAt)}</strong>
                                    <p>{getSlaLabel(focusedRequest.dueAt, focusedRequest.status)}</p>
                                </div>
                            </div>

                            <section className="drawer-note">
                                <h4>Nội dung đề nghị</h4>
                                <p>{focusedRequest.detail}</p>
                            </section>
                        </div>

                        <div className="approvals-drawer__footer">
                            <button
                                type="button"
                                className="approvals-btn approvals-btn--danger"
                                onClick={() => applyStatus(focusedRequest.id, "rejected")}
                                disabled={focusedRequest.status !== "pending"}
                            >
                                <FiX /> Từ chối
                            </button>
                            <button
                                type="button"
                                className="approvals-btn approvals-btn--success"
                                onClick={() => applyStatus(focusedRequest.id, "approved")}
                                disabled={focusedRequest.status !== "pending"}
                            >
                                <FiCheck /> Phê duyệt
                            </button>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
}

