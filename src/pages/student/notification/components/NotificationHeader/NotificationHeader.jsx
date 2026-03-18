import { Bell, Star } from "lucide-react";
import "./NotificationHeader.css";

export default function NotificationHeader({
    unreadCount,
    onMarkAllRead,
    showOnlyMarked = false,
    onToggleMarkedFilter,
    markedCount = 0,
}) {
    return (
        <div className="notification-header">
            <div className="notification-header__title">
                <h1>Thông báo</h1>
                <span>{unreadCount} thông báo chưa đọc</span>
            </div>

            <div className="notification-header__actions">
                <button
                    type="button"
                    className={`notification-marked-filter ${showOnlyMarked ? "is-active" : ""}`}
                    onClick={onToggleMarkedFilter}
                    title={showOnlyMarked ? "Hiển thị tất cả" : "Chỉ hiển thị đã đánh dấu"}
                >
                    <Star size={16} fill={showOnlyMarked ? "currentColor" : "none"} />
                    <span>{showOnlyMarked ? "Đang lọc đã đánh dấu" : "Lọc đã đánh dấu"}</span>
                    <strong>{markedCount}</strong>
                </button>

                <div className="notification-bell" onClick={onMarkAllRead} role="button" tabIndex={0}>
                    <Bell className="bell-icon" size={24} />
                    {unreadCount > 0 && (
                        <span className="bell-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
                    )}
                </div>
            </div>
        </div>
    );
}
