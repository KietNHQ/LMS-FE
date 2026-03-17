import { Bell, Star } from "lucide-react";
import "./NotificationHeader.css";

export default function NotificationHeader({ unreadCount, onMarkAllRead }) {
    return (
        <div className="notification-header">
            <div>
                <h1>Thông báo</h1>
                <span>{unreadCount} thông báo chưa đọc</span>
            </div>

            <div className="notification-bell" onClick={onMarkAllRead} role="button" tabIndex={0}>
                <Bell className="bell-icon" size={28} />
                {unreadCount > 0 && (
                    <span className="bell-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
                )}
            </div>
        </div>
    );
}
