import { useEffect, useMemo, useState } from "react";
import { PageHeader, Pagination, SchoolYearTermSelector } from "../../../../components/common";
import Modal from "../../../../components/ui/Modal/Modal";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import {
    FiAlertCircle,
    FiBell,
    FiBookmark,
    FiCheckCircle,
    FiClock,
    FiEdit3,
    FiFileText,
    FiFilter,
    FiMail,
    FiMonitor,
    FiPlus,
    FiSearch,
    FiSend,
    FiSmartphone,
} from "react-icons/fi";
import { toast } from "react-toastify";
import "./FinanceNotifications.css";

const ADMIN_UNREAD_COUNT_KEY = "admin_unread_notifications_count";
const ADMIN_UNREAD_COUNT_EVENT = "admin-notification-count-updated";

const TAB_OPTIONS = [
    { id: "all", label: "Tất cả" },
    { id: "unread", label: "Chưa đọc" },
    { id: "action", label: "Cần xử lý" },
    { id: "scheduled", label: "Đã lên lịch" },
];

const PRIORITY_OPTIONS = [
    { id: "all", label: "Mức ưu tiên" },
    { id: "critical", label: "Khẩn" },
    { id: "high", label: "Cao" },
    { id: "medium", label: "Trung bình" },
    { id: "low", label: "Thấp" },
];

const CHANNEL_OPTIONS = [
    { id: "all", label: "Kênh gửi" },
    { id: "in-app", label: "In-app" },
    { id: "email", label: "Email" },
    { id: "sms", label: "SMS" },
];

const SORT_OPTIONS = [
    { id: "newest", label: "Mới nhất" },
    { id: "oldest", label: "Cũ nhất" },
    { id: "priority", label: "Ưu tiên" },
    { id: "delivery", label: "Giao giảm dần" },
];

const COMPOSER_CHANNEL_OPTIONS = [
    { id: "in-app", label: "In-app" },
    { id: "email", label: "Email" },
    { id: "sms", label: "SMS" },
];

const REPORT_TEMPLATE_OPTIONS = [
    "Công nợ theo khối",
    "Thu học phí tháng",
    "Quyết toán quý",
    "Công khai tài chính",
    "Đối soát thu hộ",
    "Miễn giảm học phí",
];

const TARGET_OPTIONS = [
    "Ban giám hiệu",
    "Tổ kế toán",
    "Giáo vụ + Kế toán khối 10",
    "Phòng tài chính",
    "Toàn bộ bộ phận tài chính",
];

const PRIORITY_LEVEL = { low: 1, medium: 2, high: 3, critical: 4 };


function formatDateTime(value) {
    return new Date(value).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getChannelLabel(channel) {
    if (channel === "sms") return "SMS";
    if (channel === "email") return "Email";
    return "In-app";
}

function getChannelIcon(channel) {
    if (channel === "sms") return <FiSmartphone />;
    if (channel === "email") return <FiMail />;
    return <FiMonitor />;
}

function getPriorityLabel(priority) {
    const match = PRIORITY_OPTIONS.find((item) => item.id === priority);
    return match?.label || priority;
}

export default function FinanceNotifications() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [notifications, setNotifications] = useState([]);
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [channelFilter, setChannelFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");
    const [showPinnedOnly, setShowPinnedOnly] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedId, setSelectedId] = useState(null);
    const [dialogMode, setDialogMode] = useState(null);
    const [composer, setComposer] = useState({
        title: "",
        summary: "",
        reportType: REPORT_TEMPLATE_OPTIONS[0],
        target: TARGET_OPTIONS[0],
        channel: "in-app",
        priority: "medium",
        requiresAction: true,
        scheduleAt: "",
    });

    const unreadCount = useMemo(
        () => notifications.filter((item) => item.status === "unread").length,
        [notifications]
    );

    useEffect(() => {
        localStorage.setItem(ADMIN_UNREAD_COUNT_KEY, String(unreadCount));
        window.dispatchEvent(
            new CustomEvent(ADMIN_UNREAD_COUNT_EVENT, {
                detail: unreadCount,
            })
        );
    }, [unreadCount]);

    const metrics = useMemo(() => {
        const total = notifications.length;
        const action = notifications.filter((item) => item.requiresAction).length;
        const scheduled = notifications.filter((item) => item.status === "scheduled").length;
        const delivered = notifications.filter((item) => item.status !== "scheduled");
        const avgDelivery = delivered.length
            ? Math.round(delivered.reduce((sum, item) => sum + item.deliveryRate, 0) / delivered.length)
            : 0;

        return { total, unread: unreadCount, action, scheduled, avgDelivery };
    }, [notifications, unreadCount]);

    const filteredNotifications = useMemo(() => {
        const keyword = searchQuery.trim().toLowerCase();

        const result = notifications.filter((item) => {
            const matchTab =
                activeTab === "all"
                    ? true
                    : activeTab === "unread"
                    ? item.status === "unread"
                    : activeTab === "action"
                    ? item.requiresAction
                    : item.status === "scheduled";

            const matchKeyword =
                keyword.length === 0 ||
                item.title.toLowerCase().includes(keyword) ||
                item.reportType.toLowerCase().includes(keyword) ||
                item.target.toLowerCase().includes(keyword);

            const matchPriority = priorityFilter === "all" || item.priority === priorityFilter;
            const matchChannel = channelFilter === "all" || item.channel === channelFilter;
            const matchPinned = !showPinnedOnly || item.pinned;

            return matchTab && matchKeyword && matchPriority && matchChannel && matchPinned;
        });

        return result.sort((a, b) => {
            if (sortBy === "oldest") {
                return new Date(a.sentAt) - new Date(b.sentAt);
            }

            if (sortBy === "priority") {
                return PRIORITY_LEVEL[b.priority] - PRIORITY_LEVEL[a.priority];
            }

            if (sortBy === "delivery") {
                return b.deliveryRate - a.deliveryRate;
            }

            return new Date(b.sentAt) - new Date(a.sentAt);
        });
    }, [notifications, activeTab, searchQuery, priorityFilter, channelFilter, showPinnedOnly, sortBy]);

    const pageSize = 5;
    const totalPages = Math.max(1, Math.ceil(filteredNotifications.length / pageSize));
    const safeCurrentPage = Math.min(currentPage, totalPages);

    const paginatedNotifications = useMemo(() => {
        const start = (safeCurrentPage - 1) * pageSize;
        return filteredNotifications.slice(start, start + pageSize);
    }, [filteredNotifications, safeCurrentPage]);

    const selectedNotification =
        filteredNotifications.find((item) => item.id === selectedId) ?? filteredNotifications[0] ?? null;

    const scheduledBatches = useMemo(
        () =>
            notifications
                .filter((item) => item.status === "scheduled")
                .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt))
                .slice(0, 3),
        [notifications]
    );

    const channelHealth = useMemo(() => {
        const channels = ["in-app", "email", "sms"];

        return channels.map((channel) => {
            const channelItems = notifications.filter((item) => item.channel === channel && item.status !== "scheduled");
            const avg = channelItems.length
                ? Math.round(channelItems.reduce((sum, item) => sum + item.deliveryRate, 0) / channelItems.length)
                : 0;

            return {
                id: channel,
                label: getChannelLabel(channel),
                value: avg,
                count: channelItems.length,
            };
        });
    }, [notifications]);

    const onFilterChange = (setter, value) => {
        setter(value);
        setCurrentPage(1);
    };

    const openNotificationDialog = (item) => {
        setSelectedId(item.id);
        setDialogMode("detail");
        if (item.status === "unread") {
            setNotifications((prev) => prev.map((row) => (row.id === item.id ? { ...row, status: "read" } : row)));
        }
    };

    const openComposerDialog = () => {
        setDialogMode("compose");
    };

    const closeDialog = () => {
        setDialogMode(null);
    };

    const markAsRead = (id) => {
        setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, status: "read" } : item)));
        toast.success("Đã đánh dấu đã đọc.");
    };

    const markAllVisibleAsRead = () => {
        const visibleIds = new Set(filteredNotifications.map((item) => item.id));
        setNotifications((prev) =>
            prev.map((item) => (visibleIds.has(item.id) && item.status === "unread" ? { ...item, status: "read" } : item))
        );
        toast.success("Đã đánh dấu toàn bộ thông báo trong bộ lọc là đã đọc.");
    };

    const togglePin = (id) => {
        setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, pinned: !item.pinned } : item)));
    };

    const sendReminder = () => {
        toast.info("Hệ thống đang xếp hàng gửi nhắc báo cáo còn thiếu tới nhóm phụ trách.");
        setTimeout(() => toast.success("Đã tạo chiến dịch nhắc báo cáo thành công."), 700);
    };

    const applyTemplate = (reportType) => {
        setComposer((prev) => ({
            ...prev,
            reportType,
            title: prev.title || `Thông báo ${reportType}`,
            summary: prev.summary || `Vui lòng rà soát và xác nhận dữ liệu cho báo cáo ${reportType}.`,
        }));
    };

    const createNotification = () => {
        if (!composer.title.trim() || !composer.summary.trim()) {
            toast.error("Vui lòng nhập tiêu đề và nội dung thông báo.");
            return;
        }

        const now = new Date();
        const scheduleDate = composer.scheduleAt ? new Date(composer.scheduleAt) : null;
        const isScheduled = scheduleDate && scheduleDate.getTime() > now.getTime();
        const idSeed = Date.now();

        const newItem = {
            id: `NOTI-${idSeed}`,
            title: composer.title.trim(),
            summary: composer.summary.trim(),
            reportType: composer.reportType,
            target: composer.target,
            channel: composer.channel,
            priority: composer.priority,
            status: isScheduled ? "scheduled" : "unread",
            requiresAction: composer.requiresAction,
            pinned: false,
            sentAt: now.toISOString(),
            dueAt: isScheduled ? scheduleDate.toISOString() : new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(),
            sender: "Kế toán trưởng",
            deliveryRate: isScheduled ? 0 : 97,
        };

        setNotifications((prev) => [newItem, ...prev]);
        setSelectedId(newItem.id);
        setCurrentPage(1);
        setDialogMode(null);
        setComposer((prev) => ({
            ...prev,
            title: "",
            summary: "",
            scheduleAt: "",
        }));

        toast.success(isScheduled ? "Đã lên lịch thông báo báo cáo." : "Đã phát hành thông báo báo cáo mới.");
    };

    const detailDialog = dialogMode === "detail" && selectedNotification;

    return (
        <div className="fin-notif">
            <PageHeader
                title="Trung Tâm Thông Báo Báo Cáo"
                eyebrow="Giám sát, nhắc việc và theo dõi tình trạng phát hành báo cáo tài chính"
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            <section className="fin-notif__summary">
                <article className="fin-notif-kpi">
                    <span>Tổng</span>
                    <strong>{metrics.total}</strong>
                    <p>Thông báo</p>
                </article>
                <article className="fin-notif-kpi">
                    <span>Chưa đọc</span>
                    <strong>{metrics.unread}</strong>
                    <p>Cần chú ý</p>
                </article>
                <article className="fin-notif-kpi">
                    <span>Cần xử lý</span>
                    <strong>{metrics.action}</strong>
                    <p>Yêu cầu xác nhận</p>
                </article>
                <article className="fin-notif-kpi">
                    <span>Giao</span>
                    <strong>{metrics.avgDelivery}%</strong>
                    <p>Trung bình</p>
                </article>
            </section>

            <section className="fin-notif-toolbar report-panel">
                <div className="fin-notif-filter-grid">
                    <label className="fin-notif-search">
                        <FiSearch />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(event) => onFilterChange(setSearchQuery, event.target.value)}
                            placeholder="Tìm nhanh..."
                        />
                    </label>

                    <label className="fin-notif-select">
                        <span><FiFilter /> Ưu tiên</span>
                        <select value={priorityFilter} onChange={(event) => onFilterChange(setPriorityFilter, event.target.value)}>
                            {PRIORITY_OPTIONS.map((option) => (
                                <option key={option.id} value={option.id}>{option.label}</option>
                            ))}
                        </select>
                    </label>

                    <label className="fin-notif-select">
                        <span>Kênh</span>
                        <select value={channelFilter} onChange={(event) => onFilterChange(setChannelFilter, event.target.value)}>
                            {CHANNEL_OPTIONS.map((option) => (
                                <option key={option.id} value={option.id}>{option.label}</option>
                            ))}
                        </select>
                    </label>

                    <label className="fin-notif-select">
                        <span>Sắp xếp</span>
                        <select value={sortBy} onChange={(event) => onFilterChange(setSortBy, event.target.value)}>
                            {SORT_OPTIONS.map((option) => (
                                <option key={option.id} value={option.id}>{option.label}</option>
                            ))}
                        </select>
                    </label>
                </div>

                <div className="fin-notif-toolbar__actions">
                    <button
                        type="button"
                        className={`fin-notif-btn fin-notif-btn--ghost ${showPinnedOnly ? "is-active" : ""}`}
                        onClick={() => onFilterChange(setShowPinnedOnly, !showPinnedOnly)}
                    >
                        <FiBookmark /> Ghim
                    </button>
                    <button type="button" className="fin-notif-btn fin-notif-btn--ghost" onClick={markAllVisibleAsRead}>
                        <FiCheckCircle /> Đã đọc
                    </button>
                    <button type="button" className="fin-notif-btn fin-notif-btn--primary" onClick={openComposerDialog}>
                        <FiPlus /> Soạn báo cáo
                    </button>
                </div>
            </section>

            <div className="fin-notif-tabs-row">
                <div className="fin-notif-tabs">
                    {TAB_OPTIONS.map((tab) => (
                        <button
                            type="button"
                            key={tab.id}
                            className={`fin-notif-tab ${activeTab === tab.id ? "active" : ""}`}
                            onClick={() => onFilterChange(setActiveTab, tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <section className="fin-notif-layout">
                <article className="report-panel fin-notif-panel">
                    <div className="fin-notif-panel__head">
                        <h3><FiBell /> Danh sách</h3>
                        <span>{filteredNotifications.length} mục</span>
                    </div>

                    <div className="fin-notif-list">
                        {paginatedNotifications.length === 0 && (
                            <div className="fin-notif-empty">
                                <FiAlertCircle />
                                <strong>Không có mục phù hợp</strong>
                                <p>Đổi bộ lọc hoặc từ khóa.</p>
                            </div>
                        )}

                        {paginatedNotifications.map((item) => (
                            <button
                                type="button"
                                key={item.id}
                                className={`fin-notif-item ${selectedNotification?.id === item.id ? "is-active" : ""}`}
                                onClick={() => openNotificationDialog(item)}
                            >
                                <div className="fin-notif-item__meta">
                                    <span className={`fin-notif-pill priority-${item.priority}`}>{getPriorityLabel(item.priority)}</span>
                                    <span className={`fin-notif-pill status-${item.status}`}>{item.status}</span>
                                    {item.pinned && <span className="fin-notif-pill fin-notif-pill--pinned"><FiBookmark /> ghim</span>}
                                </div>

                                <h4>{item.title}</h4>
                                <p>{item.summary}</p>

                                <div className="fin-notif-item__foot">
                                    <span><FiFileText /> {item.reportType}</span>
                                    <span>{getChannelIcon(item.channel)} {getChannelLabel(item.channel)}</span>
                                    <span><FiClock /> {formatDateTime(item.sentAt)}</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="fin-notif-pagination">
                        <Pagination
                            currentPage={safeCurrentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            ariaLabel="Phân trang thông báo tài chính"
                        />
                    </div>
                </article>
            </section>

            <Modal
                open={dialogMode === "compose"}
                title="Soạn thông báo báo cáo"
                onClose={closeDialog}
                className="fin-notif-modal fin-notif-modal--compose"
            >
                <div className="fin-notif-modal__section">
                    <div className="fin-notif-template-list">
                        {REPORT_TEMPLATE_OPTIONS.map((item) => (
                            <button
                                type="button"
                                key={item}
                                className={`fin-notif-template ${composer.reportType === item ? "active" : ""}`}
                                onClick={() => applyTemplate(item)}
                            >
                                {item}
                            </button>
                        ))}
                    </div>

                    <div className="fin-notif-composer__grid">
                        <label>
                            <span>Tiêu đề</span>
                            <input
                                type="text"
                                value={composer.title}
                                onChange={(event) => setComposer((prev) => ({ ...prev, title: event.target.value }))}
                                placeholder="Ví dụ: Nhắc nộp báo cáo công nợ"
                            />
                        </label>

                        <label>
                            <span>Đối tượng</span>
                            <select
                                value={composer.target}
                                onChange={(event) => setComposer((prev) => ({ ...prev, target: event.target.value }))}
                            >
                                {TARGET_OPTIONS.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </label>

                        <label>
                            <span>Kênh</span>
                            <select
                                value={composer.channel}
                                onChange={(event) => setComposer((prev) => ({ ...prev, channel: event.target.value }))}
                            >
                                {COMPOSER_CHANNEL_OPTIONS.map((option) => (
                                    <option key={option.id} value={option.id}>{option.label}</option>
                                ))}
                            </select>
                        </label>

                        <label>
                            <span>Ưu tiên</span>
                            <select
                                value={composer.priority}
                                onChange={(event) => setComposer((prev) => ({ ...prev, priority: event.target.value }))}
                            >
                                {PRIORITY_OPTIONS.filter((item) => item.id !== "all").map((option) => (
                                    <option key={option.id} value={option.id}>{option.label}</option>
                                ))}
                            </select>
                        </label>

                        <label>
                            <span>Gửi lúc</span>
                            <input
                                type="datetime-local"
                                value={composer.scheduleAt}
                                onChange={(event) => setComposer((prev) => ({ ...prev, scheduleAt: event.target.value }))}
                            />
                        </label>
                    </div>

                    <label className="fin-notif-composer__textarea">
                        <span>Nội dung</span>
                        <textarea
                            value={composer.summary}
                            onChange={(event) => setComposer((prev) => ({ ...prev, summary: event.target.value }))}
                            placeholder="Nhập nội dung ngắn cho thông báo báo cáo..."
                        />
                    </label>

                    <label className="fin-notif-checkbox">
                        <input
                            type="checkbox"
                            checked={composer.requiresAction}
                            onChange={(event) => setComposer((prev) => ({ ...prev, requiresAction: event.target.checked }))}
                        />
                        <span>Yêu cầu xác nhận đã đọc</span>
                    </label>

                    <div className="fin-notif-modal__actions">
                        <button type="button" className="fin-notif-btn fin-notif-btn--ghost" onClick={closeDialog}>
                            Hủy
                        </button>
                        <button type="button" className="fin-notif-btn fin-notif-btn--primary" onClick={createNotification}>
                            <FiSend /> Phát hành
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal
                open={Boolean(detailDialog)}
                title="Chi tiết thông báo"
                onClose={closeDialog}
                className="fin-notif-modal fin-notif-modal--detail"
            >
                {detailDialog && (
                    <div className="fin-notif-detail-modal">
                        <div className="fin-notif-detail-modal__head">
                            <div>
                                <h3>{detailDialog.title}</h3>
                                <p>{detailDialog.summary}</p>
                            </div>
                            <div className="fin-notif-detail-modal__chips">
                                <span className={`fin-notif-pill priority-${detailDialog.priority}`}>{getPriorityLabel(detailDialog.priority)}</span>
                                <span className={`fin-notif-pill status-${detailDialog.status}`}>{detailDialog.status}</span>
                            </div>
                        </div>

                        <div className="fin-notif-detail-modal__grid">
                            <div><span>Loại</span><strong>{detailDialog.reportType}</strong></div>
                            <div><span>Nhận</span><strong>{detailDialog.target}</strong></div>
                            <div><span>Kênh</span><strong>{getChannelLabel(detailDialog.channel)}</strong></div>
                            <div><span>Người tạo</span><strong>{detailDialog.sender}</strong></div>
                            <div><span>Gửi lúc</span><strong>{formatDateTime(detailDialog.sentAt)}</strong></div>
                            <div><span>Hạn</span><strong>{formatDateTime(detailDialog.dueAt)}</strong></div>
                        </div>

                        <div className="fin-notif-detail-modal__actions">
                            {detailDialog.status === "unread" && (
                                <button type="button" className="fin-notif-btn fin-notif-btn--ghost" onClick={() => markAsRead(detailDialog.id)}>
                                    <FiCheckCircle /> Đã đọc
                                </button>
                            )}
                            <button type="button" className="fin-notif-btn fin-notif-btn--ghost" onClick={() => togglePin(detailDialog.id)}>
                                <FiBookmark /> {detailDialog.pinned ? "Bỏ ghim" : "Ghim"}
                            </button>
                            <button type="button" className="fin-notif-btn fin-notif-btn--primary" onClick={sendReminder}>
                                <FiEdit3 /> Nhắc lại
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

