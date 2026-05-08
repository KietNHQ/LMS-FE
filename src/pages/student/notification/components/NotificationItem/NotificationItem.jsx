import { Bell, Star } from "lucide-react";
import "./NotificationItem.css";

function formatNotificationDate(rawDate) {
    const date = new Date(rawDate);
    if (Number.isNaN(date.getTime())) return rawDate;
    return date.toLocaleDateString("vi-VN");
}

export default function NotificationItem({ item, onOpen, onToggleImportant }) {
    const displayDate = formatNotificationDate(item.date);

    return (
        <div className={`notification-card ${item.unread ? "is-unread" : ""} ${item.important ? "is-important" : ""}`}>
            <div className="notification-body" onClick={() => onOpen(item)}>
                <div className="notification-icon-student">
                    <Bell size={20} />
                </div>
                <div className="notification-content">
                    <div className="notification-title">
                        {item.title}
                        {item.unread && <span className="unread-dot-student" />}
                    </div>

                    <p className="notification-text">{item.content}</p>

                    <div className="notification-date">{displayDate}</div>
                </div>
            </div>

            <button
                type="button"
                className="star-box"
                onClick={() => onToggleImportant(item.id)}
                aria-label={item.important ? "Bỏ đánh dấu" : "Đánh dấu quan trọng"}
                title={item.important ? "Bỏ đánh dấu" : "Đánh dấu quan trọng"}
            >
                <Star
                    className={item.important ? "star-active" : "star"}
                    fill={item.important ? "currentColor" : "none"}
                />
            </button>
        </div>
    );
}

